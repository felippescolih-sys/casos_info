-- Escala de plantão/triagem: quem está designado num período (início/fim),
-- não uma fila rotativa. "Plantonista de hoje" = registro cujo período
-- contém o momento atual. Fonte no Bubble: Data Types `plantao` e `triagem`.

create type public.escala_tipo as enum ('plantao', 'triagem');

create table public.escalas (
  id           uuid primary key default gen_random_uuid(),
  tipo         public.escala_tipo not null,
  membro_id    uuid not null references public.membros (id) on delete restrict,
  -- só usado em tipo = 'plantao' (triagem não tem ajudante no Bubble)
  ajudante_id  uuid references public.membros (id) on delete set null,
  inicio       timestamptz not null,
  fim          timestamptz not null,
  criado_por   uuid references public.membros (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint escalas_periodo_valido check (fim > inicio)
);

create index escalas_tipo_periodo_idx on public.escalas (tipo, inicio, fim);

create trigger escalas_set_updated_at
  before update on public.escalas
  for each row execute function public.set_updated_at();

alter table public.escalas enable row level security;

-- Qualquer membro ativo vê a escala (usada no banner do dashboard pra todo mundo).
create policy "escalas_select_ativo"
  on public.escalas for select to authenticated
  using (public.is_ativo());

-- Cadastro/edição da escala: mesmo nível de quem já gerencia membros.
create policy "escalas_write_gestor"
  on public.escalas for all to authenticated
  using (public.gerencia_membros())
  with check (public.gerencia_membros());

grant select, insert, update, delete on public.escalas to authenticated;
