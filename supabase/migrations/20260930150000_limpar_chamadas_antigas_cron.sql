-- Limpeza diária de `chamadas_plantao`.
--
-- Este job já existia em produção, criado à mão fora das migrations (assim como a
-- própria tabela). Fica registrado aqui só para não se perder se o banco for
-- recriado a partir do repositório — o comportamento é o mesmo.
--
-- Roda uma vez por dia às 03:00 UTC (meia-noite em Brasília) e apaga o que tem mais
-- de 2 dias. Como é diário, cada chamada fica entre 48 e 72 horas na tabela.
--
-- `cron.schedule` com um nome que já existe atualiza o job em vez de duplicar.

select cron.schedule(
  'limpar-chamadas-antigas',
  '0 3 * * *',
  $$
  delete from public.chamadas_plantao
  where data_hora_inicio < now() - interval '2 days';
  $$
);
