-- Milestone 1 — Autenticação + cadastro de membros
-- App: Casos Info (migração do Bubble "registrocasos")

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
create type public.member_status as enum ('pendente', 'ativo', 'inativo');

-- Áreas de administração da COLIH. Cada área tem admin(s) + ajudante(s).
--   geral         → presidência / secretaria (admin global do sistema)
--   apresentacoes  → palestras / apresentações
--   gvps           → grupos de voluntários (GVP)
--   especialidades → especialidades médicas
--   facilitadores  → facilitadores
--   medicos        → lista de médicos
create type public.area as enum (
  'geral', 'apresentacoes', 'gvps', 'especialidades', 'facilitadores', 'medicos'
);
create type public.funcao_nivel as enum ('admin', 'ajudante');

-- ─────────────────────────────────────────────────────────────
-- Tabela membros (1:1 com auth.users)
-- ─────────────────────────────────────────────────────────────
create table public.membros (
  id                uuid primary key references auth.users (id) on delete cascade,
  nome              text not null,
  email             text not null,
  status            public.member_status not null default 'pendente',
  tel_zap           text,
  tel_residencial   text,
  tel_comercial     text,
  tel_celular       text,
  congregacao       text,
  especialidade     text,
  reunioes          text,
  nome_esposa       text,
  tel_esposa        text,
  avatar_url        text,
  ferias            boolean not null default false,
  legacy_bubble_id  text unique,
  ult_acesso        timestamptz,
  aprovado_por      uuid references public.membros (id) on delete set null,
  aprovado_em       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index membros_status_idx on public.membros (status);

comment on column public.membros.legacy_bubble_id is
  'ID do registro User no Bubble; mapeia REG_CASO.id_Membro_responsb na migração futura dos casos';
comment on column public.membros.email is
  'Espelho de auth.users.email, mantido por trigger. Fonte da verdade é auth.users.';
comment on column public.membros.tel_zap is
  'Telefone canônico do membro (no Bubble o cel_membro_respo do caso era pouco confiável).';

-- ─────────────────────────────────────────────────────────────
-- Funções por área (um nível por membro por área)
-- ─────────────────────────────────────────────────────────────
create table public.membro_funcoes (
  membro_id   uuid not null references public.membros (id) on delete cascade,
  area        public.area not null,
  nivel       public.funcao_nivel not null,
  criado_por  uuid references public.membros (id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (membro_id, area)
);

create index membro_funcoes_area_idx on public.membro_funcoes (area, nivel);

-- ─────────────────────────────────────────────────────────────
-- updated_at automático
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger membros_set_updated_at
  before update on public.membros
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Cria a linha em membros quando um auth.users é criado
-- (SECURITY DEFINER: roda como owner, ignora RLS)
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.membros (id, email, nome, tel_zap, congregacao, especialidade)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'tel_zap', ''),
    nullif(new.raw_user_meta_data ->> 'congregacao', ''),
    nullif(new.raw_user_meta_data ->> 'especialidade', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Mantém membros.email sincronizado com auth.users.email
-- ─────────────────────────────────────────────────────────────
create or replace function public.sync_membro_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.membros set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.sync_membro_email();

-- ─────────────────────────────────────────────────────────────
-- Helpers de autorização (SECURITY DEFINER evita recursão de RLS)
-- ─────────────────────────────────────────────────────────────
create or replace function public.tem_funcao(_area public.area, _nivel public.funcao_nivel default null)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.membro_funcoes f
    where f.membro_id = auth.uid()
      and f.area = _area
      and (_nivel is null or f.nivel = _nivel)
  );
$$;

create or replace function public.is_admin_geral()
returns boolean language sql stable security definer set search_path = public as $$
  select public.tem_funcao('geral', 'admin');
$$;

-- Quem gerencia e aprova membros: qualquer função na área geral (admin ou ajudante).
create or replace function public.gerencia_membros()
returns boolean language sql stable security definer set search_path = public as $$
  select public.tem_funcao('geral', null);
$$;

create or replace function public.is_ativo()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membros where id = auth.uid() and status = 'ativo');
$$;

-- ─────────────────────────────────────────────────────────────
-- Guard: quem não gerencia membros não altera campos sensíveis
-- ─────────────────────────────────────────────────────────────
create or replace function public.membros_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.gerencia_membros() then
    return new;
  end if;
  new.status           := old.status;
  new.legacy_bubble_id := old.legacy_bubble_id;
  new.aprovado_por     := old.aprovado_por;
  new.aprovado_em      := old.aprovado_em;
  new.email            := old.email;
  return new;
end;
$$;

create trigger membros_guard_update
  before update on public.membros
  for each row execute function public.membros_guard();

-- ─────────────────────────────────────────────────────────────
-- RLS: membros
-- ─────────────────────────────────────────────────────────────
alter table public.membros enable row level security;

-- sem policy de INSERT  → só o trigger handle_new_user cria linhas
-- sem policy de DELETE  → desativação é status = 'inativo', nunca delete

create policy "membros_select_own"
  on public.membros for select to authenticated
  using (id = auth.uid());

create policy "membros_select_directory"
  on public.membros for select to authenticated
  using (status = 'ativo' and public.is_ativo());

create policy "membros_select_gestor"
  on public.membros for select to authenticated
  using (public.gerencia_membros());

create policy "membros_update_own"
  on public.membros for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "membros_update_gestor"
  on public.membros for update to authenticated
  using (public.gerencia_membros())
  with check (public.gerencia_membros());

grant select, update on public.membros to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS: membro_funcoes
-- ─────────────────────────────────────────────────────────────
alter table public.membro_funcoes enable row level security;

create policy "funcoes_select_own"
  on public.membro_funcoes for select to authenticated
  using (membro_id = auth.uid());

create policy "funcoes_select_gestor"
  on public.membro_funcoes for select to authenticated
  using (public.gerencia_membros());

-- Só o admin geral atribui/edita/remove funções.
create policy "funcoes_write_admin_geral"
  on public.membro_funcoes for all to authenticated
  using (public.is_admin_geral())
  with check (public.is_admin_geral());

grant select, insert, update, delete on public.membro_funcoes to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Storage: bucket de avatares
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
