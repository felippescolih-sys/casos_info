-- Remove a triagem: só sobra a escala de plantão. Simplifica a tabela
-- (deixa de precisar de um discriminador de tipo).

delete from public.escalas where tipo = 'triagem';

alter table public.escalas drop column tipo;

drop type public.escala_tipo;

create index escalas_periodo_idx on public.escalas (inicio, fim);
