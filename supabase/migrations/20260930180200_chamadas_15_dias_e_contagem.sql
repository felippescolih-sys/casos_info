-- Chamadas: histórico de 15 dias e contagem sem repetições.

-- 1) Limpeza passa de 2 para 15 dias. Mesmo nome de job: `cron.schedule` atualiza.
select cron.schedule(
  'limpar-chamadas-antigas',
  '0 3 * * *',
  $$
  delete from public.chamadas_plantao
  where data_hora_inicio < now() - interval '15 days';
  $$
);

-- 2) Contagem para a página de chamadas.
--   - unicas: pares (número, dia em Brasília) — a mesma pessoa ligando 3 vezes no
--     mesmo dia conta 1;
--   - nao_atendidas: desses pares, os que não tiveram NENHUMA chamada atendida no
--     dia (se ligou, caiu, ligou de novo e foi atendida, não conta como perdida).
-- Chamada sem número de origem conta sozinha (não dá para saber se é repetição).
-- `security invoker`: a RLS de chamadas_plantao (só COLIH) vale aqui também.
create or replace function public.chamadas_contagem()
returns table (total bigint, unicas bigint, nao_atendidas bigint)
language sql stable security invoker set search_path = public as $$
  with por_dia as (
    select
      coalesce(nullif(numero_origem, ''), uniqueid) as numero,
      (data_hora_inicio at time zone 'America/Sao_Paulo')::date as dia,
      count(*) as n,
      bool_or(status = 'ANSWERED') as atendida
    from public.chamadas_plantao
    group by 1, 2
  )
  select
    coalesce(sum(n), 0)::bigint,
    count(*)::bigint,
    count(*) filter (where not atendida)::bigint
  from por_dia;
$$;

revoke execute on function public.chamadas_contagem() from anon, public;
grant execute on function public.chamadas_contagem() to authenticated;
