-- Um membro pode ter mais de uma especialidade clínica ao mesmo tempo
-- (ex.: cárdio-tórax e TMO). Substitui o texto livre `membros.especialidade`
-- por uma seleção estruturada, reaproveitando o enum `area_especialidade`
-- já usado no roteamento de casos.

create table public.membro_especialidades (
  membro_id           uuid not null references public.membros (id) on delete cascade,
  area_especialidade  public.area_especialidade not null,
  created_at          timestamptz not null default now(),
  primary key (membro_id, area_especialidade)
);

create index membro_especialidades_area_idx on public.membro_especialidades (area_especialidade);

-- Backfill best-effort a partir do texto livre antigo.
insert into public.membro_especialidades (membro_id, area_especialidade)
select id, mapped
from (
  select
    id,
    case lower(trim(especialidade))
      when 'plantão'       then 'plantao'
      when 'plantao'        then 'plantao'
      when 'ad-hepato-uro'  then 'ad_hepato_uro'
      when 'onco-hemato'    then 'onco_hemato'
      when 'tmo'            then 'tmo'
      when 'orto-neuro'     then 'orto_neuro'
      when 'cárdio-tórax'   then 'cardio_torax'
      when 'cardio-torax'   then 'cardio_torax'
      when 'geoneo'         then 'geoneo'
      when 'goneo'          then 'geoneo'
      else null
    end::public.area_especialidade as mapped
  from public.membros
  where especialidade is not null
) s
where mapped is not null
on conflict do nothing;

alter table public.membro_especialidades enable row level security;

create policy "membro_especialidades_select_own"
  on public.membro_especialidades for select to authenticated
  using (membro_id = auth.uid());

create policy "membro_especialidades_select_directory"
  on public.membro_especialidades for select to authenticated
  using (
    public.is_ativo()
    and exists (
      select 1 from public.membros m where m.id = membro_id and m.status = 'ativo'
    )
  );

create policy "membro_especialidades_select_gestor"
  on public.membro_especialidades for select to authenticated
  using (public.gerencia_membros());

create policy "membro_especialidades_write_own"
  on public.membro_especialidades for all to authenticated
  using (membro_id = auth.uid())
  with check (membro_id = auth.uid());

create policy "membro_especialidades_write_gestor"
  on public.membro_especialidades for all to authenticated
  using (public.gerencia_membros())
  with check (public.gerencia_membros());

grant select, insert, update, delete on public.membro_especialidades to authenticated;

-- Trigger de criação de membro não seta mais especialidade (escolhida depois no perfil).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.membros (id, email, nome, tel_zap, congregacao)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'tel_zap', ''),
    nullif(new.raw_user_meta_data ->> 'congregacao', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

alter table public.membros drop column especialidade;
