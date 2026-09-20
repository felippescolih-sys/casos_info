-- Ausências (períodos em que o membro não pode ser designado) e disponibilidade
-- semanal pra plantão (quais dias da semana, e se evita os últimos dias do mês).
-- Autosserviço: o próprio membro cadastra em "Minha conta". Enforçado em 2 pontos:
-- transferência de caso (transferir_caso) e designação de plantão (trigger em escalas).

-- ─────────────────────────────────────────────────────────────
-- 1. Ausências
-- ─────────────────────────────────────────────────────────────
create table public.membro_ausencias (
  id         uuid primary key default gen_random_uuid(),
  membro_id  uuid not null references public.membros (id) on delete cascade,
  inicio     date not null,
  fim        date not null,
  created_at timestamptz not null default now(),
  constraint membro_ausencias_periodo_valido check (fim >= inicio)
);

create index membro_ausencias_membro_idx on public.membro_ausencias (membro_id, inicio, fim);

alter table public.membro_ausencias enable row level security;

create policy "ausencias_select_own"
  on public.membro_ausencias for select to authenticated
  using (membro_id = auth.uid());

create policy "ausencias_select_gestor"
  on public.membro_ausencias for select to authenticated
  using (public.gerencia_membros());

create policy "ausencias_write_own"
  on public.membro_ausencias for all to authenticated
  using (membro_id = auth.uid())
  with check (membro_id = auth.uid());

create policy "ausencias_write_gestor"
  on public.membro_ausencias for all to authenticated
  using (public.gerencia_membros())
  with check (public.gerencia_membros());

grant select, insert, update, delete on public.membro_ausencias to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Disponibilidade semanal (default: disponível todo dia, sem restrição de fim de mês)
-- ─────────────────────────────────────────────────────────────
alter table public.membros
  add column disp_seg                   boolean not null default true,
  add column disp_ter                   boolean not null default true,
  add column disp_qua                   boolean not null default true,
  add column disp_qui                   boolean not null default true,
  add column disp_sex                   boolean not null default true,
  add column disp_sab                   boolean not null default true,
  add column disp_dom                   boolean not null default true,
  add column disp_evita_ultimos_dias_mes smallint;

-- ─────────────────────────────────────────────────────────────
-- 3. Checagem: membro está disponível pra plantão em [_inicio, _fim]?
-- ─────────────────────────────────────────────────────────────
create or replace function public.membro_disponivel_plantao(
  _membro_id uuid, _inicio timestamptz, _fim timestamptz
)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  _disp record;
  _dia date;
  _dow int;
  _ultimo_dia_mes int;
begin
  select disp_seg, disp_ter, disp_qua, disp_qui, disp_sex, disp_sab, disp_dom,
         disp_evita_ultimos_dias_mes
  into _disp
  from public.membros where id = _membro_id;

  if not found then
    return true; -- membro inexistente não é problema desta função
  end if;

  if exists (
    select 1 from public.membro_ausencias
    where membro_id = _membro_id and inicio <= _fim::date and fim >= _inicio::date
  ) then
    return false;
  end if;

  for _dia in select generate_series(_inicio::date, _fim::date, interval '1 day')::date loop
    _dow := extract(dow from _dia)::int; -- 0=domingo .. 6=sábado
    if (_dow = 1 and not _disp.disp_seg) or (_dow = 2 and not _disp.disp_ter)
       or (_dow = 3 and not _disp.disp_qua) or (_dow = 4 and not _disp.disp_qui)
       or (_dow = 5 and not _disp.disp_sex) or (_dow = 6 and not _disp.disp_sab)
       or (_dow = 0 and not _disp.disp_dom) then
      return false;
    end if;

    if _disp.disp_evita_ultimos_dias_mes is not null and _disp.disp_evita_ultimos_dias_mes > 0 then
      _ultimo_dia_mes := extract(day from (date_trunc('month', _dia) + interval '1 month - 1 day'))::int;
      if extract(day from _dia)::int > (_ultimo_dia_mes - _disp.disp_evita_ultimos_dias_mes) then
        return false;
      end if;
    end if;
  end loop;

  return true;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 4. Trigger: impede designar plantão fora da disponibilidade
-- ─────────────────────────────────────────────────────────────
create or replace function public.escalas_guard_disponibilidade()
returns trigger language plpgsql as $$
begin
  if not public.membro_disponivel_plantao(new.membro_id, new.inicio, new.fim) then
    raise exception 'Responsável indisponível nesse período (ausência registrada ou fora dos dias que pode atender plantão).';
  end if;
  if new.ajudante_id is not null
     and not public.membro_disponivel_plantao(new.ajudante_id, new.inicio, new.fim) then
    raise exception 'Ajudante indisponível nesse período (ausência registrada ou fora dos dias que pode atender plantão).';
  end if;
  return new;
end;
$$;

create trigger escalas_guard_disponibilidade
  before insert or update on public.escalas
  for each row execute function public.escalas_guard_disponibilidade();

-- ─────────────────────────────────────────────────────────────
-- 5. transferir_caso: recusa transferir pra quem está em período de ausência hoje
-- ─────────────────────────────────────────────────────────────
create or replace function public.transferir_caso(
  _caso_id uuid,
  _novo uuid,
  _area_especialidade public.area_especialidade default null
)
returns void language plpgsql security definer set search_path = public as $$
declare _atual text; _dest text;
begin
  if not public.pode_operar_caso(_caso_id) then
    raise exception 'Sem permissão para transferir este caso.';
  end if;
  if not exists (select 1 from public.membros where id = _novo and status = 'ativo') then
    raise exception 'Destinatário inválido.';
  end if;
  if exists (
    select 1 from public.membro_ausencias
    where membro_id = _novo and inicio <= current_date and fim >= current_date
  ) then
    raise exception 'Este membro está em período de ausência registrado.';
  end if;

  select nome into _atual from public.membros where id = auth.uid();
  select nome into _dest  from public.membros where id = _novo;

  update public.casos set
    transferencia_pendente_para = _novo,
    transferencia_pendente_por  = auth.uid(),
    transferencia_pendente_em   = now(),
    em_transferencia            = true,
    transferencia_historico = coalesce(transferencia_historico, '')
      || E'\n/ ' || to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
      || ' ' || coalesce(_atual, 'alguém') || ' transferiu para ' || coalesce(_dest, '?')
  where id = _caso_id;

  if _area_especialidade is not null then
    update public.membro_especialidades
    set ordem = nextval('public.membro_especialidades_ordem_seq')
    where membro_id = _novo and area_especialidade = _area_especialidade;
  end if;
end;
$$;
