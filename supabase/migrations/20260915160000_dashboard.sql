-- Suporte ao dashboard inicial: expõe mais alguns campos não sensíveis em
-- casos_resumo (pra listas/estatísticas sem precisar acessar o prontuário
-- completo) e uma função de contagem por especialidade pro card do dashboard.

drop view public.casos_resumo;
create view public.casos_resumo
  with (security_invoker = false)
  as
  select
    id, legacy_bubble_id, id_caso, numero, status,
    paciente_nome, responsavel_id, responsavel_nome, ajudante_id, ajudante_nome,
    hospital_nome, congregacao, cidade, uf,
    aberto_em, encerrado_em, atualizado_em_bubble, tags,
    em_transferencia, transferencia_pendente_para, transferencia_pendente_em,
    area_especialidade, morbidade, transpac, transfundido, created_at
  from public.casos;

revoke all on public.casos_resumo from anon;
grant select on public.casos_resumo to authenticated;

-- Contagem de casos abertos nos últimos `_meses`, agrupada por especialidade.
-- security definer: estatística agregada e não sensível, útil pra todo
-- membro ativo ver no dashboard (não expõe dado de paciente nenhum).
create or replace function public.casos_por_especialidade(_meses int default 6)
returns table(area public.area_especialidade, total bigint)
language sql stable security definer set search_path = public as $$
  select area_especialidade, count(*)::bigint
  from public.casos
  where area_especialidade is not null
    and aberto_em >= (date_trunc('month', now()) - (_meses - 1) * interval '1 month')
  group by area_especialidade
  order by area_especialidade;
$$;

revoke execute on function public.casos_por_especialidade(int) from anon, public;
grant execute on function public.casos_por_especialidade(int) to authenticated;
