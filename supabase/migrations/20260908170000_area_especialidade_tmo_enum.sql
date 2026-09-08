-- Adiciona o valor TMO ao enum. Precisa ser um arquivo separado do UPDATE que o usa:
-- Postgres não deixa usar um valor de enum recém-criado na mesma transação.
alter type public.area_especialidade add value if not exists 'tmo';
