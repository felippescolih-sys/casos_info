-- Lista de congregações que a COLIH atende — usada como autocomplete no cadastro/edição de casos.
-- Conteúdo semeado por scripts/seed-congregacoes.ts (fonte: congregacoes.txt).

create table public.congregacoes (
  nome       text primary key,
  ativa      boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.congregacoes enable row level security;

create policy "congregacoes_select"
  on public.congregacoes for select to authenticated
  using (true);

-- edição só pela administração geral (via UI futura / seed com service_role)
create policy "congregacoes_write_admin_geral"
  on public.congregacoes for all to authenticated
  using (public.is_admin_geral())
  with check (public.is_admin_geral());

grant select, insert, update, delete on public.congregacoes to authenticated;
