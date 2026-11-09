-- Agente de WhatsApp: busca aproximada de paciente e busca de hospital no cadastro.
--
-- Por quê: num atendimento real (09/11) o agente procurou o paciente só pelo nome exato e o hospital foi gravado
-- como veio digitado ("Hosptial Rocio de campo largo"). Um sobrenome escrito diferente fazia o agente dizer que
-- não havia caso e abrir um duplicado; o hospital ficava fora do padrão do cadastro.
--
-- - agente_buscar_caso: mesma assinatura (o n8n não muda). Se a busca por trecho do nome não achar nada, devolve
--   os casos com nome parecido (pg_trgm), cada um com "semelhante": true, para o agente perguntar se é um deles.
-- - agente_buscar_hospital: nova ferramenta do agente. Procura no cadastro de hospitais ativos ignorando acento,
--   erro de digitação e palavras como "hospital"/"de"/"do", e devolve até 5 com o nome oficial.

-- Texto para comparar nomes: sem acento, sem pontuação e sem palavras que não distinguem um hospital do outro.
create or replace function public.texto_busca_hospital(_t text)
returns text language sql immutable set search_path = '' as $$
  select trim(regexp_replace(regexp_replace(regexp_replace(public.sem_acento(_t), '[^a-z0-9 ]', ' ', 'g'),
    '\m(hospital|hosptial|hospial|hosp|de|do|da|dos|das|e)\M', ' ', 'g'), '\s+', ' ', 'g'));
$$;

create or replace function public.agente_buscar_caso(_membro uuid, _nome text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  _q text := public.sem_acento(trim(coalesce(_nome, '')));
  _r jsonb;
begin
  perform public.agente_agir_como(_membro);
  if length(_q) < 2 then
    return jsonb_build_object('erro', 'nome_invalido', 'mensagem', 'É necessário informar ao menos parte do nome do paciente para buscar.');
  end if;

  select jsonb_agg(public.agente_caso_json(c, public.pode_operar_caso(c.id)) order by c.status, c.aberto_em desc)
  into _r
  from (select * from public.casos c
        where public.sem_acento(c.paciente_nome) like '%' || _q || '%'
        order by c.status, c.aberto_em desc limit 15) c;
  if _r is not null then return _r; end if;

  -- Nada com esse trecho: casos com nome parecido (grafia diferente, sobrenome trocado).
  return coalesce((
    select jsonb_agg(public.agente_caso_json(s.c, public.pode_operar_caso((s.c).id)) || jsonb_build_object('semelhante', true)
                     order by s.sc desc)
    from (select c, greatest(public.similarity(public.sem_acento(c.paciente_nome), _q),
                             public.word_similarity(_q, public.sem_acento(c.paciente_nome))) sc
          from public.casos c
          where c.status = 'aberto'
          order by sc desc
          limit 5) s
    where s.sc >= 0.45
  ), '[]'::jsonb);
end $$;

create or replace function public.agente_buscar_hospital(_membro uuid, _nome text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare _q text := public.texto_busca_hospital(_nome);
begin
  perform public.agente_agir_como(_membro);
  if length(_q) < 2 then
    return jsonb_build_object('erro', 'nome_invalido', 'mensagem', 'Informe ao menos parte do nome do hospital.');
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('nome', h.nome, 'cidade', h.cidade, 'bairro', h.bairro) order by h.sc desc, h.nome)
    from (select h.nome, h.cidade, h.bairro,
                 greatest(public.similarity(public.texto_busca_hospital(h.nome || ' ' || coalesce(h.cidade, '')), _q),
                          public.word_similarity(_q, public.texto_busca_hospital(h.nome || ' ' || coalesce(h.cidade, '')))) sc
          from public.hospitais h
          where h.ativo
          order by sc desc
          limit 5) h
    where h.sc >= 0.4
  ), '[]'::jsonb);
end $$;

revoke execute on function public.texto_busca_hospital(text) from public, anon;
revoke execute on function public.agente_buscar_caso(uuid, text) from public, anon, authenticated;
revoke execute on function public.agente_buscar_hospital(uuid, text) from public, anon, authenticated;
grant execute on function public.agente_buscar_caso(uuid, text) to service_role;
grant execute on function public.agente_buscar_hospital(uuid, text) to service_role;
