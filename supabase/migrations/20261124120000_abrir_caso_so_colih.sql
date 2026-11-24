-- Só membros da COLIH abrem caso (pelo app e pelo WhatsApp).
--
-- Por quê: na importação do Bubble todos os usuários entraram como `ativo`, inclusive quem é só do GVP
-- (função `gvps:usuario`). A política de inserção só exigia `is_ativo()` e o agente do WhatsApp aceitava
-- qualquer membro ativo, então um membro do GVP abriu um caso para si mesmo pelo WhatsApp (caso 3986).
--
-- Regra (a mesma de `ehMembroColih` no front): ter função na área `colih` (qualquer nível) ou ser
-- superadmin de `geral`. Quem não pode, recebe do agente uma resposta dizendo o que fazer.
-- Os casos que já existem não mudam; editar, transferir e ser ajudante continuam como estavam.

-- 1. Quem pode abrir caso: o usuário logado (no agente, o membro que `agente_agir_como` assumiu).
create or replace function public.pode_abrir_caso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.membros m
    join public.membro_funcoes f on f.membro_id = m.id
    where m.id = auth.uid()
      and m.status = 'ativo'
      and (f.area = 'colih' or (f.area = 'geral' and f.nivel = 'superadmin'))
  );
$$;

revoke all on function public.pode_abrir_caso() from public, anon;
grant execute on function public.pode_abrir_caso() to authenticated, service_role;

-- 2. App: a RLS de inserção passa a exigir a função.
drop policy if exists casos_insert on public.casos;
create policy casos_insert on public.casos
  for insert to authenticated
  with check (public.is_ativo() and criado_por_id = auth.uid() and public.pode_abrir_caso());

-- 3. Agente: identificar o membro devolve também se ele pode abrir caso, para o agente avisar logo
-- no começo em vez de fazer todas as perguntas e só recusar no fim.
create or replace function public.agente_membro_por_telefone(_telefone text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select jsonb_build_object(
              'encontrado', true, 'id', m.id, 'nome', m.nome,
              'pode_abrir_caso', exists (
                select 1 from public.membro_funcoes f
                where f.membro_id = m.id
                  and (f.area = 'colih' or (f.area = 'geral' and f.nivel = 'superadmin'))))
     from public.membros m
     where m.status = 'ativo' and length(public.tel_br(_telefone)) >= 10
       and public.tel_br(m.tel_zap) = public.tel_br(_telefone)
     order by m.ult_acesso desc nulls last
     limit 1),
    jsonb_build_object('encontrado', false));
$$;

revoke all on function public.agente_membro_por_telefone(text) from public, anon, authenticated;
grant execute on function public.agente_membro_por_telefone(text) to service_role;

-- 4. Agente: criar caso confere a função antes de tudo. Igual à versão em produção (de 20261006120000)
-- fora essa checagem e o search_path vazio (os nomes já tinham `public.`).
create or replace function public.agente_criar_caso(_membro uuid, _dados jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  _m public.membros;
  _d jsonb := coalesce(_dados, '{}'::jsonb);
  _obrig text[] := array['nome_telefonou', 'whatsapp_telefonou', 'nome_paciente', 'sexo', 'idade', 'congregacao',
                         'cidade_congregacao', 'uf_congregacao', 'info_medica', 'morbidade', 'especialidade'];
  _faltando text[];
  _area public.area_especialidade;
  _existente public.casos;
  _c public.casos;
  _tel text;
  _sim constant text[] := array['true', 'sim', '1', 's'];
begin
  _m := public.agente_agir_como(_membro);

  if not public.pode_abrir_caso() then
    return jsonb_build_object('sucesso', false, 'erro', 'nao_e_membro_colih',
      'mensagem', 'Só membros da COLIH podem abrir atendimentos. Para pedir ajuda para um paciente, '
               || 'ligue para o plantão da COLIH, que abre o atendimento.');
  end if;

  select array_agg(k) into _faltando from unnest(_obrig) k where nullif(trim(coalesce(_d->>k, '')), '') is null;
  if _faltando is not null then
    return jsonb_build_object('sucesso', false, 'campos_faltando', to_jsonb(_faltando));
  end if;

  _area := public.agente_area_de_texto(_d->>'especialidade');
  if _area is null then
    return jsonb_build_object('sucesso', false, 'erro', 'especialidade_invalida', 'opcoes_validas',
      jsonb_build_array('AD-Hepato-Uro', 'Cardio-Tórax', 'GO-Neo', 'Onco-Hemato', 'Orto-Neuro', 'Plantão', 'TMO'));
  end if;

  -- Cada paciente tem um atendimento só: não cria outro se já há um aberto com o mesmo nome.
  select * into _existente from public.casos
  where status = 'aberto' and public.sem_acento(trim(paciente_nome)) = public.sem_acento(trim(_d->>'nome_paciente'))
  limit 1;
  if found then
    return jsonb_build_object('sucesso', false, 'erro', 'paciente_ja_tem_caso_aberto', 'id_caso', _existente.id_caso,
      'responsavel_nome', _existente.responsavel_nome,
      'mensagem', 'Já existe um atendimento aberto para esse paciente. Atualize o existente em vez de criar outro.');
  end if;

  _tel := regexp_replace(_d->>'whatsapp_telefonou', '\D', '', 'g');
  if left(_tel, 2) = '55' and length(_tel) > 11 then _tel := substr(_tel, 3); end if;

  insert into public.casos (
    status, responsavel_id, responsavel_nome, criado_por_id,
    nome_telefonou, contato_telefonou, parentesco_telefonou,
    paciente_nome, sexo, idade, congregacao, cidade, uf, hospital_nome,
    batizado, cartao_diretivas_ok, boa_condicao_espiritual, transpac,
    info_medica, morbidade, area_especialidade, outras_infos,
    data_hora_contato
  ) values (
    'aberto', _m.id, _m.nome, _m.id,
    trim(_d->>'nome_telefonou'), _tel, nullif(trim(coalesce(_d->>'parentesco', '')), ''),
    trim(_d->>'nome_paciente'), trim(_d->>'sexo'), trim(_d->>'idade'), trim(_d->>'congregacao'),
    trim(_d->>'cidade_congregacao'), upper(trim(_d->>'uf_congregacao')), nullif(trim(coalesce(_d->>'nome_hospital', '')), ''),
    lower(coalesce(_d->>'batizado', '')) = any (_sim), lower(coalesce(_d->>'cartao_diretivas_ok', '')) = any (_sim),
    lower(coalesce(_d->>'boa_condicao_espiritual', '')) = any (_sim), lower(coalesce(_d->>'vindo_outra_colih', '')) = any (_sim),
    trim(_d->>'info_medica'), trim(_d->>'morbidade'), _area, nullif(trim(coalesce(_d->>'outras_infos', '')), ''),
    to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
  ) returning * into _c;

  return jsonb_build_object('sucesso', true, 'id_caso', _c.id_caso, 'numero', _c.numero);
end $$;

revoke all on function public.agente_criar_caso(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.agente_criar_caso(uuid, jsonb) to service_role;
