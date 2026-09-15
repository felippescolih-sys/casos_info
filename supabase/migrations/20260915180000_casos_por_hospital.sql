-- Contagem de casos por hospital (abertos/encerrados/total) pro dashboard.
-- `hospital_nome` é texto livre (sem tabela normalizada), então agrupa pelo
-- texto exato — os nomes já vêm razoavelmente consistentes na prática.
-- security definer: estatística agregada não sensível (não expõe paciente).
create or replace function public.casos_por_hospital()
returns table(hospital text, abertos bigint, encerrados bigint, total bigint)
language sql stable security definer set search_path = public as $$
  select
    hospital_nome,
    count(*) filter (where status = 'aberto')::bigint as abertos,
    count(*) filter (where status = 'encerrado')::bigint as encerrados,
    count(*)::bigint as total
  from public.casos
  where hospital_nome is not null and trim(hospital_nome) <> ''
  group by hospital_nome
  order by total desc;
$$;

revoke execute on function public.casos_por_hospital() from anon, public;
grant execute on function public.casos_por_hospital() to authenticated;
