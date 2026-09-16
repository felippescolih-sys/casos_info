-- Cadastro de hospitais/UPAs — equivalente ao data type "Hospitais" do Bubble.
-- É a lista de onde o campo "Nome do hospital" do caso busca o nome (autocomplete,
-- igual ao padrão já usado em congregacoes). CRUD (criar/editar/excluir) restrito
-- à administração geral; leitura liberada pra todo membro ativo.

create table public.hospitais (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  endereco   text,
  bairro     text,
  cidade     text,
  telefone   text,
  fone_uti   text,
  email      text,
  website    text,
  ativo      boolean not null default true,
  legacy_bubble_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger hospitais_set_updated_at
  before update on public.hospitais
  for each row execute function public.set_updated_at();

alter table public.hospitais enable row level security;

create policy "hospitais_select"
  on public.hospitais for select to authenticated
  using (true);

create policy "hospitais_write_admin_geral"
  on public.hospitais for all to authenticated
  using (public.is_admin_geral())
  with check (public.is_admin_geral());

grant select, insert, update, delete on public.hospitais to authenticated;
