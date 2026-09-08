-- Especialidade do caso (agrupamento clínico para roteamento) — diferente da
-- "especialidade do médico responsável". Fonte no Bubble: Info_add_Espec.

create type public.area_especialidade as enum (
  'plantao',
  'ad_hepato_uro',
  'onco_hemato',
  'orto_neuro',
  'cardio_torax',
  'geoneo'
);

alter table public.casos add column area_especialidade public.area_especialidade;
create index casos_area_especialidade_idx on public.casos (area_especialidade);

update public.casos set area_especialidade =
  case lower(trim(bubble_raw->>'Info_add_Espec'))
    when 'plantão'       then 'plantao'
    when 'onco-hemato'   then 'onco_hemato'
    when 'ad-hepato-uro' then 'ad_hepato_uro'
    when 'goneo'         then 'geoneo'
    when 'orto-neuro'    then 'orto_neuro'
    when 'cardio-tórax'  then 'cardio_torax'
    when 'tmo'           then 'onco_hemato'
    else null
  end::public.area_especialidade
where bubble_raw <> '{}'::jsonb;

-- expõe na view de resumo (não é dado sensível)
drop view public.casos_resumo;
create view public.casos_resumo
  with (security_invoker = false)
  as
  select
    id, legacy_bubble_id, id_caso, numero, status,
    paciente_nome, responsavel_id, responsavel_nome, ajudante_id, ajudante_nome,
    hospital_nome, congregacao, cidade, uf,
    aberto_em, encerrado_em, atualizado_em_bubble, tags,
    em_transferencia, transferencia_pendente_para, area_especialidade
  from public.casos;

revoke all on public.casos_resumo from anon;
grant select on public.casos_resumo to authenticated;
