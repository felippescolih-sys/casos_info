-- Observações internas, contatos do paciente e anexos (upload de arquivos).

alter table public.casos
  add column observacoes        text,
  add column contatos_paciente  jsonb not null default '[]'::jsonb;  -- [{nome,ddi,ddd,fone}]

-- ── anexos ─────────────────────────────────────────────────────
create table public.caso_anexos (
  id           uuid primary key default gen_random_uuid(),
  caso_id      uuid not null references public.casos (id) on delete cascade,
  storage_path text not null unique,
  nome         text not null,
  tamanho      bigint,
  mime         text,
  enviado_por  uuid references public.membros (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index caso_anexos_caso_idx on public.caso_anexos (caso_id);

alter table public.caso_anexos enable row level security;

create policy "caso_anexos_select"
  on public.caso_anexos for select to authenticated
  using (public.pode_operar_caso(caso_id));

create policy "caso_anexos_insert"
  on public.caso_anexos for insert to authenticated
  with check (public.pode_operar_caso(caso_id) and enviado_por = auth.uid());

create policy "caso_anexos_delete"
  on public.caso_anexos for delete to authenticated
  using (public.pode_operar_caso(caso_id));

grant select, insert, delete on public.caso_anexos to authenticated;

-- ── bucket privado dos anexos ──────────────────────────────────
insert into storage.buckets (id, name, public)
values ('casos', 'casos', false)
on conflict (id) do nothing;

-- path = "<caso_id>/<arquivo>"; a pasta 1 é o id do caso
create policy "casos_bucket_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'casos'
    and public.pode_operar_caso(((storage.foldername(name))[1])::uuid)
  );

create policy "casos_bucket_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'casos'
    and public.pode_operar_caso(((storage.foldername(name))[1])::uuid)
  );

create policy "casos_bucket_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'casos'
    and public.pode_operar_caso(((storage.foldername(name))[1])::uuid)
  );
