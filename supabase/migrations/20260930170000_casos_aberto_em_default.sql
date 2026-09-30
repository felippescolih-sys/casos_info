-- `aberto_em` é a data de criação do caso que o app usa (ordenação, painel, listas).
--
-- Nos casos importados do Bubble ela veio do Created Date de lá — o `created_at`
-- desses é a data da importação, igual para todos. Nos casos criados no app novo
-- ninguém preenchia `aberto_em`: ficavam no fim da lista de casos, fora das
-- contagens de 30 dias/6 meses e com data "—" no painel.

alter table public.casos alter column aberto_em set default now();

update public.casos
set aberto_em = created_at
where aberto_em is null and legacy_bubble_id is null;
