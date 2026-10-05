-- Agente de WhatsApp (n8n na VPS) e lembrete de casos parados, que até o corte de 26/09 liam e gravavam no Bubble.
--
-- O n8n chama estas funções pelo PostgREST (/rest/v1/rpc/...) com a service_role key, que fica no .env da VPS.
-- Elas são as ÚNICAS portas do n8n: só a service_role executa (revoke de public/anon/authenticated).
--
-- Cada função recebe o membro já identificado pelo telefone e "age como ele" (agente_agir_como): define o
-- request.jwt.claims da transação, então auth.uid() devolve o membro e as mesmas regras do app valem aqui
-- (pode_operar_caso, encerrar_caso, travas do casos_guard, gatilhos de notificação). Nada de regra duplicada no n8n.

-- ─────────────────────────────────────────────────────────────
-- Encerramento: telefones e contatos que ficaram fora da anonimização
-- ─────────────────────────────────────────────────────────────
-- contato_telefonou (HLC-7, 20260908140000) e contatos_paciente (20260908150000) foram criados depois do
-- encerrar_caso e não eram apagados ao encerrar. Mesma regra dos outros telefones: viram 'x'.
create or replace function public.encerrar_caso(_caso_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.casos
    where id = _caso_id
      and (responsavel_id = auth.uid() or public.is_admin_geral())
  ) then
    raise exception 'Sem permissão para encerrar este caso.';
  end if;

  set local app.status_change = 'on';
  update public.casos set
    status       = 'encerrado',
    encerrado_em = now(),
    paciente_nome         = public.iniciais(paciente_nome),
    nome_mae              = case when nome_mae is not null then 'x' end,
    nome_pai              = case when nome_pai is not null then 'x' end,
    nome_telefonou        = case when nome_telefonou is not null then 'x' end,
    acompanhante_nome     = case when acompanhante_nome is not null then 'x' end,
    telefone_paciente     = case when telefone_paciente is not null then 'x' end,
    telefone_acompanhante = case when telefone_acompanhante is not null then 'x' end,
    anciaos_contatados    = case when anciaos_contatados is not null then 'x' end,
    anciaos_cont_tel      = case when anciaos_cont_tel is not null then 'x' end,
    contato_telefonou     = case when contato_telefonou is not null then 'x' end,
    contatos_paciente     = case when contatos_paciente is not null then '[]'::jsonb end
  where id = _caso_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Auxiliares
-- ─────────────────────────────────────────────────────────────

-- Telefone BR em "DDD + 9 + número" (11 dígitos) para comparar: tira o 55, põe o 9 que faltar.
create or replace function public.tel_br(_t text)
returns text language sql immutable as $$
  with d as (select regexp_replace(coalesce(_t, ''), '\D', '', 'g') v),
       s as (select case when left(v, 2) = '55' and length(v) in (12, 13) then substr(v, 3) else v end v from d)
  select case when length(v) = 10 then left(v, 2) || '9' || substr(v, 3) else v end from s;
$$;

-- Busca sem acento e sem caixa (a extensão unaccent não está instalada).
create or replace function public.sem_acento(_t text)
returns text language sql immutable as $$
  select translate(lower(coalesce(_t, '')), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn');
$$;

-- Rótulo ↔ enum da especialidade do caso (mesmos rótulos que o agente sempre usou; TMO entra em Onco-Hemato).
create or replace function public.agente_area_label(_a public.area_especialidade)
returns text language sql immutable as $$
  select case _a
    when 'plantao' then 'Plantão' when 'ad_hepato_uro' then 'AD-Hepato-Uro' when 'onco_hemato' then 'Onco-Hemato'
    when 'orto_neuro' then 'Orto-Neuro' when 'cardio_torax' then 'Cardio-Tórax' when 'geoneo' then 'GO-Neo' end;
$$;

create or replace function public.agente_area_de_texto(_t text)
returns public.area_especialidade language sql immutable as $$
  select case regexp_replace(public.sem_acento(_t), '[^a-z]', '', 'g')
    when 'plantao' then 'plantao' when 'adhepatouro' then 'ad_hepato_uro' when 'oncohemato' then 'onco_hemato'
    when 'tmo' then 'onco_hemato' when 'ortoneuro' then 'orto_neuro' when 'cardiotorax' then 'cardio_torax'
    when 'goneo' then 'geoneo' when 'geoneo' then 'geoneo' end::public.area_especialidade;
$$;

-- Último movimento real do caso. Os casos importados têm updated_at = hora da reimportação (26/09, até 19h25 UTC);
-- para eles vale a "Modified Date" do Bubble até alguém mexer no caso pelo app ou pelo agente.
-- ATENÇÃO: um backfill em massa futuro também muda o updated_at e "zera" esse relógio.
create or replace function public.caso_ultima_atualizacao(c public.casos)
returns timestamptz language sql stable as $$
  select case
    when c.atualizado_em_bubble is null or c.updated_at > '2026-09-26 19:30:00+00' then c.updated_at
    else c.atualizado_em_bubble
  end;
$$;

-- Faz auth.uid() devolver o membro até o fim da transação. Só membro ativo.
create or replace function public.agente_agir_como(_membro uuid)
returns public.membros language plpgsql security definer set search_path = public as $$
declare _m public.membros;
begin
  select * into _m from public.membros where id = _membro and status = 'ativo';
  if not found then raise exception 'Membro não encontrado ou inativo.'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', _membro, 'role', 'authenticated')::text, true);
  return _m;
end $$;

-- Caso no formato que o agente vê. completo=false: só o que qualquer membro pode saber (sem dado clínico).
create or replace function public.agente_caso_json(c public.casos, completo boolean)
returns jsonb language sql stable as $$
  select case when not completo then jsonb_build_object(
      'id_caso', c.id_caso, 'paciente_nome', c.paciente_nome, 'hospital_nome', c.hospital_nome,
      'status', c.status, 'responsavel_nome', c.responsavel_nome, 'acesso_restrito', true)
  else jsonb_strip_nulls(jsonb_build_object(
      'id_caso', c.id_caso, 'numero', c.numero, 'status', c.status,
      'paciente_nome', c.paciente_nome, 'sexo', c.sexo, 'idade', c.idade,
      'congregacao', c.congregacao, 'cidade_congregacao', c.cidade, 'uf_congregacao', c.uf,
      'hospital_nome', c.hospital_nome, 'especialidade', public.agente_area_label(c.area_especialidade),
      'morbidade', c.morbidade, 'problema_especifico', c.problema_especifico,
      'info_medica', c.info_medica, 'outras_infos', c.outras_infos,
      'nome_telefonou', c.nome_telefonou, 'whatsapp_telefonou', c.contato_telefonou,
      'parentesco', c.parentesco_telefonou, 'batizado', c.batizado, 'cartao_diretivas_ok', c.cartao_diretivas_ok,
      'boa_condicao_espiritual', c.boa_condicao_espiritual, 'vindo_outra_colih', c.transpac,
      'medico_responsavel', c.medico_responsavel, 'responsavel_nome', c.responsavel_nome,
      'ajudante_nome', c.ajudante_nome, 'gvp', c.gvp,
      'aberto_em', to_char(c.aberto_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY'),
      'encerrado_em', to_char(c.encerrado_em at time zone 'America/Sao_Paulo', 'DD/MM/YYYY'),
      'ultima_atualizacao', to_char(public.caso_ultima_atualizacao(c) at time zone 'America/Sao_Paulo', 'DD/MM/YYYY')))
  end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Funções chamadas pelo n8n
-- ─────────────────────────────────────────────────────────────

-- Quem está escrevendo no WhatsApp. { encontrado, id, nome }
create or replace function public.agente_membro_por_telefone(_telefone text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(
    (select jsonb_build_object('encontrado', true, 'id', m.id, 'nome', m.nome)
     from public.membros m
     where m.status = 'ativo' and length(public.tel_br(_telefone)) >= 10
       and public.tel_br(m.tel_zap) = public.tel_br(_telefone)
     order by m.ult_acesso desc nulls last
     limit 1),
    jsonb_build_object('encontrado', false));
$$;

-- Busca por parte do nome do paciente. Caso de outro membro volta resumido (acesso_restrito).
create or replace function public.agente_buscar_caso(_membro uuid, _nome text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.agente_agir_como(_membro);
  if length(trim(coalesce(_nome, ''))) < 2 then
    return jsonb_build_object('erro', 'nome_invalido', 'mensagem', 'É necessário informar ao menos parte do nome do paciente para buscar.');
  end if;
  return coalesce((
    select jsonb_agg(public.agente_caso_json(c, public.pode_operar_caso(c.id)) order by c.status, c.aberto_em desc)
    from (select * from public.casos c
          where public.sem_acento(c.paciente_nome) like '%' || public.sem_acento(trim(_nome)) || '%'
          order by c.status, c.aberto_em desc limit 15) c
  ), '[]'::jsonb);
end $$;

-- Busca pelo código do caso (ex.: KXWQTB). O prompt do agente já citava esta ferramenta, que não existia.
create or replace function public.agente_buscar_caso_por_codigo(_membro uuid, _id_caso text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare _c public.casos;
begin
  perform public.agente_agir_como(_membro);
  select * into _c from public.casos where upper(id_caso) = upper(trim(coalesce(_id_caso, ''))) limit 1;
  if not found then
    return jsonb_build_object('erro', 'caso_nao_encontrado', 'mensagem', 'Nenhum caso encontrado com esse código.');
  end if;
  return jsonb_build_array(public.agente_caso_json(_c, public.pode_operar_caso(_c.id)));
end $$;

-- "Meus casos": responsável ou ajudante.
create or replace function public.agente_listar_casos(_membro uuid, _incluir_encerrados boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.agente_agir_como(_membro);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'id_caso', c.id_caso, 'paciente_nome', c.paciente_nome, 'hospital_nome', c.hospital_nome,
             'status', c.status, 'papel', case when c.responsavel_id = _membro then 'responsável' else 'ajudante' end,
             'ultima_atualizacao', to_char(public.caso_ultima_atualizacao(c) at time zone 'America/Sao_Paulo', 'DD/MM/YYYY'))
           order by c.aberto_em desc)
    from public.casos c
    where (c.responsavel_id = _membro or c.ajudante_id = _membro)
      and (coalesce(_incluir_encerrados, false) or c.status = 'aberto')
  ), '[]'::jsonb);
end $$;

-- Novo atendimento. O responsável é quem está conversando; código e número saem do gatilho do banco.
create or replace function public.agente_criar_caso(_membro uuid, _dados jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
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

-- Atualiza os campos informados; info_medica e outras_infos são acumulativos ("Nome - dd/mm/aa: texto").
-- encerrar_caso=true exige gvp_acionado e usa o encerrar_caso do app (só o responsável ou admin geral).
create or replace function public.agente_atualizar_caso(_membro uuid, _id_caso text, _dados jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _m public.membros;
  _d jsonb := coalesce(_dados, '{}'::jsonb);
  _c public.casos;
  _area public.area_especialidade;
  _assin text;
  _tel text;
  _campos text[] := '{}';
  _encerrar boolean := lower(coalesce(_dados->>'encerrar_caso', '')) in ('true', 'sim', '1');
  _gvp text := lower(nullif(trim(coalesce(_dados->>'gvp_acionado', '')), ''));
  _sim constant text[] := array['true', 'sim', '1', 's'];
  k text;
begin
  _m := public.agente_agir_como(_membro);

  select * into _c from public.casos where upper(id_caso) = upper(trim(coalesce(_id_caso, ''))) limit 1;
  if not found then
    return jsonb_build_object('sucesso', false, 'erro', 'caso_nao_encontrado', 'mensagem', 'Nenhum caso encontrado com esse código.');
  end if;
  if not public.pode_operar_caso(_c.id) then
    return jsonb_build_object('autorizado', false, 'mensagem', 'Você não é responsável nem ajudante deste caso.',
                              'responsavel_nome', _c.responsavel_nome);
  end if;
  if _c.status = 'encerrado' then
    return jsonb_build_object('sucesso', false, 'erro', 'caso_ja_encerrado', 'mensagem', 'Este caso já está encerrado.');
  end if;
  if _encerrar then
    if _gvp is null then
      return jsonb_build_object('sucesso', false, 'erro', 'gvp_nao_informado', 'mensagem',
        'Antes de encerrar, pergunte ao usuário se o GVP foi acionado e chame de novo enviando gvp_acionado (true ou false).');
    end if;
    if not (_c.responsavel_id = _membro or public.is_admin_geral()) then
      return jsonb_build_object('autorizado', false, 'mensagem',
        'Só o responsável pelo caso pode encerrá-lo. Peça para ' || coalesce(_c.responsavel_nome, 'o responsável') || ' encerrar.');
    end if;
  end if;

  if _d ? 'especialidade' and nullif(trim(_d->>'especialidade'), '') is not null then
    _area := public.agente_area_de_texto(_d->>'especialidade');
    if _area is null then
      return jsonb_build_object('sucesso', false, 'erro', 'especialidade_invalida', 'opcoes_validas',
        jsonb_build_array('AD-Hepato-Uro', 'Cardio-Tórax', 'GO-Neo', 'Onco-Hemato', 'Orto-Neuro', 'Plantão', 'TMO'));
    end if;
  end if;

  _assin := _m.nome || ' - ' || to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YY') || ': ';
  _tel := regexp_replace(coalesce(_d->>'whatsapp_telefonou', ''), '\D', '', 'g');
  if left(_tel, 2) = '55' and length(_tel) > 11 then _tel := substr(_tel, 3); end if;

  -- Campos informados (não vazios) entram na lista devolvida ao agente.
  foreach k in array array['nome_telefonou', 'whatsapp_telefonou', 'parentesco', 'nome_paciente', 'sexo', 'idade',
    'congregacao', 'cidade_congregacao', 'uf_congregacao', 'nome_hospital', 'info_medica', 'morbidade', 'especialidade',
    'outras_infos', 'batizado', 'cartao_diretivas_ok', 'boa_condicao_espiritual', 'vindo_outra_colih'] loop
    if nullif(trim(coalesce(_d->>k, '')), '') is not null then _campos := _campos || k; end if;
  end loop;
  if cardinality(_campos) = 0 and not _encerrar then
    return jsonb_build_object('sucesso', false, 'erro', 'nada_para_atualizar', 'mensagem', 'Nenhum campo foi informado para atualização.');
  end if;

  update public.casos set
    nome_telefonou       = coalesce(nullif(trim(coalesce(_d->>'nome_telefonou', '')), ''), nome_telefonou),
    contato_telefonou    = coalesce(nullif(_tel, ''), contato_telefonou),
    parentesco_telefonou = coalesce(nullif(trim(coalesce(_d->>'parentesco', '')), ''), parentesco_telefonou),
    paciente_nome        = coalesce(nullif(trim(coalesce(_d->>'nome_paciente', '')), ''), paciente_nome),
    sexo                 = coalesce(nullif(trim(coalesce(_d->>'sexo', '')), ''), sexo),
    idade                = coalesce(nullif(trim(coalesce(_d->>'idade', '')), ''), idade),
    congregacao          = coalesce(nullif(trim(coalesce(_d->>'congregacao', '')), ''), congregacao),
    cidade               = coalesce(nullif(trim(coalesce(_d->>'cidade_congregacao', '')), ''), cidade),
    uf                   = coalesce(upper(nullif(trim(coalesce(_d->>'uf_congregacao', '')), '')), uf),
    hospital_nome        = coalesce(nullif(trim(coalesce(_d->>'nome_hospital', '')), ''), hospital_nome),
    morbidade            = coalesce(nullif(trim(coalesce(_d->>'morbidade', '')), ''), morbidade),
    area_especialidade   = coalesce(_area, area_especialidade),
    batizado             = case when nullif(_d->>'batizado', '') is null then batizado
                                else lower(_d->>'batizado') = any (_sim) end,
    cartao_diretivas_ok  = case when nullif(_d->>'cartao_diretivas_ok', '') is null then cartao_diretivas_ok
                                else lower(_d->>'cartao_diretivas_ok') = any (_sim) end,
    boa_condicao_espiritual = case when nullif(_d->>'boa_condicao_espiritual', '') is null then boa_condicao_espiritual
                                else lower(_d->>'boa_condicao_espiritual') = any (_sim) end,
    transpac             = case when nullif(_d->>'vindo_outra_colih', '') is null then transpac
                                else lower(_d->>'vindo_outra_colih') = any (_sim) end,
    info_medica          = case when nullif(trim(coalesce(_d->>'info_medica', '')), '') is null then info_medica
                                else coalesce(info_medica || E'\n', '') || _assin || trim(_d->>'info_medica') end,
    outras_infos         = case when nullif(trim(coalesce(_d->>'outras_infos', '')), '') is null then outras_infos
                                else coalesce(outras_infos || E'\n', '') || _assin || trim(_d->>'outras_infos') end
  where id = _c.id;

  if _encerrar then
    update public.casos set
      gvp = _gvp = any (_sim),
      outras_infos = coalesce(outras_infos || E'\n', '') || _assin || 'Caso encerrado. GVP '
                     || case when _gvp = any (_sim) then 'acionado' else 'não acionado' end || '.'
    where id = _c.id;
    perform public.encerrar_caso(_c.id);
    return jsonb_build_object('sucesso', true, 'campos_atualizados', to_jsonb(_campos), 'encerrado', true,
                              'gvp_acionado', _gvp = any (_sim), 'anonimizado', true);
  end if;

  return jsonb_build_object('sucesso', true, 'campos_atualizados', to_jsonb(_campos));
end $$;

-- Dados para a planilha HLC-7 (PDF) + telefone do responsável, que recebe o documento.
create or replace function public.agente_caso_hlc7(_membro uuid, _id_caso text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare _c public.casos; _tel text;
begin
  perform public.agente_agir_como(_membro);
  select * into _c from public.casos where upper(id_caso) = upper(trim(coalesce(_id_caso, ''))) limit 1;
  if not found then return jsonb_build_object('erro', 'caso_nao_encontrado'); end if;
  if not public.pode_operar_caso(_c.id) then
    return jsonb_build_object('erro', 'acesso_restrito', 'responsavel_nome', _c.responsavel_nome);
  end if;
  select tel_zap into _tel from public.membros where id = _c.responsavel_id;
  return to_jsonb(_c) - 'bubble_raw' || jsonb_build_object('responsavel_tel', _tel);
end $$;

-- Lembrete quinzenal: casos abertos com o último movimento real e o WhatsApp do responsável.
create or replace function public.agente_casos_para_lembrete()
returns table (id_caso text, paciente_nome text, hospital_nome text, responsavel_id uuid, responsavel_nome text,
               responsavel_tel text, responsavel_ativo boolean, ultima_atualizacao timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id_caso, c.paciente_nome, c.hospital_nome, c.responsavel_id, coalesce(m.nome, c.responsavel_nome),
         m.tel_zap, coalesce(m.status = 'ativo', false), public.caso_ultima_atualizacao(c)
  from public.casos c
  left join public.membros m on m.id = c.responsavel_id
  where c.status = 'aberto';
$$;

-- ─────────────────────────────────────────────────────────────
-- Permissões: só o servidor (service_role) chama as funções do agente
-- ─────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'public.agente_agir_como(uuid)',
    'public.agente_membro_por_telefone(text)',
    'public.agente_buscar_caso(uuid, text)',
    'public.agente_buscar_caso_por_codigo(uuid, text)',
    'public.agente_listar_casos(uuid, boolean)',
    'public.agente_criar_caso(uuid, jsonb)',
    'public.agente_atualizar_caso(uuid, text, jsonb)',
    'public.agente_caso_hlc7(uuid, text)',
    'public.agente_casos_para_lembrete()'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
