-- Especialidades médicas do catálogo de médicos (equivalente ao Option Set/Data Type
-- `especialidade` do Bubble — ex.: Urologia, Cardiologia). NÃO confundir com o enum
-- `area_especialidade` (plantao/onco_hemato/...), que é a área interna de roteamento
-- de casos entre membros, um conceito totalmente diferente.

create table public.especialidades_medicas (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  legacy_bubble_id text unique,
  created_at timestamptz not null default now()
);

alter table public.especialidades_medicas enable row level security;

create policy "especialidades_medicas_select"
  on public.especialidades_medicas for select to authenticated
  using (true);

create policy "especialidades_medicas_write_admin_geral"
  on public.especialidades_medicas for all to authenticated
  using (public.is_admin_geral())
  with check (public.is_admin_geral());

grant select, insert, update, delete on public.especialidades_medicas to authenticated;
