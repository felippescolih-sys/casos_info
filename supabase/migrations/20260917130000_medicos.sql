-- Catálogo de médicos — equivalente aos Data Types `medicos` (colaboradores, já
-- atendem a COLIH) e `medicos_geral` (prospectivos, ainda não confirmados) do Bubble.
-- As duas listas alimentam a busca do nome do médico no cadastro de caso.

create table public.medicos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  foto_url      text,
  crm_uf        text,
  email         text,
  membro_indicacao text,      -- texto livre (quem na COLIH indicou/cadastrou), igual ao Bubble
  especialidade_id uuid references public.especialidades_medicas (id) on delete set null,
  subespecialidade text,
  rating        numeric,      -- escala 0–6, igual ao Bubble (não é 0–5 "estrelas" padrão)
  infos_add     text,
  sus           boolean,
  convenio      boolean,
  particular    boolean,
  telemedicina  boolean,
  medico_tj     boolean,
  pediatria     boolean,
  atend_consult boolean,
  primeira_visita boolean,
  revisita      boolean,
  tel_consultorio text,
  tel_secretaria  text,
  tel_confidencial text,
  nome_secretaria text,
  endereco_consultorio text,
  hospitais_atua  text,
  end_hospital    text,
  acompanhante    text,
  ultima_visita   date,
  ativo         boolean not null default true,
  legacy_bubble_id text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger medicos_set_updated_at
  before update on public.medicos
  for each row execute function public.set_updated_at();

alter table public.medicos enable row level security;

create policy "medicos_select"
  on public.medicos for select to authenticated
  using (true);

create policy "medicos_write_admin_geral"
  on public.medicos for all to authenticated
  using (public.is_admin_geral())
  with check (public.is_admin_geral());

grant select, insert, update, delete on public.medicos to authenticated;

-- ── medicos_geral: prospectivos, ainda não confirmados como colaboradores ───────
-- Qualquer membro ativo pode cadastrar um novo (fluxo "cadastrar médico" no
-- registro de caso); edição/exclusão fica com a administração geral (curadoria).

create table public.medicos_geral (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  crm_uf     text,
  especialidade_id uuid references public.especialidades_medicas (id) on delete set null,
  observacoes text,
  criado_por uuid references public.membros (id) on delete set null,
  legacy_bubble_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger medicos_geral_set_updated_at
  before update on public.medicos_geral
  for each row execute function public.set_updated_at();

alter table public.medicos_geral enable row level security;

create policy "medicos_geral_select"
  on public.medicos_geral for select to authenticated
  using (true);

create policy "medicos_geral_insert_ativo"
  on public.medicos_geral for insert to authenticated
  with check (public.is_ativo());

create policy "medicos_geral_update_admin_geral"
  on public.medicos_geral for update to authenticated
  using (public.is_admin_geral())
  with check (public.is_admin_geral());

create policy "medicos_geral_delete_admin_geral"
  on public.medicos_geral for delete to authenticated
  using (public.is_admin_geral());

grant select, insert, update, delete on public.medicos_geral to authenticated;

-- ── total de casos acompanhados por médico ──────────────────────────────────
-- Calculado a partir do médico responsável dos casos (não é um contador manual
-- que fica desatualizado) — agrupa por nome porque `casos.medico_responsavel`
-- é texto livre, igual hospital_nome.
create or replace function public.medicos_total_casos()
returns table(nome text, total bigint)
language sql stable security definer set search_path = public as $$
  select medico_responsavel, count(*)::bigint
  from public.casos
  where medico_responsavel is not null and trim(medico_responsavel) <> ''
  group by medico_responsavel;
$$;

revoke execute on function public.medicos_total_casos() from anon, public;
grant execute on function public.medicos_total_casos() to authenticated;
