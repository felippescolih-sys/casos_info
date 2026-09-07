-- Milestone 3 — Operação dos casos: criar / editar / transferir (c/ aceite) / encerrar (anonimiza) / reabrir

-- ─────────────────────────────────────────────────────────────
-- 1. Solta o que era exclusivo da importação
-- ─────────────────────────────────────────────────────────────
alter table public.casos alter column legacy_bubble_id drop not null;
alter table public.casos alter column bubble_raw set default '{}'::jsonb;

-- ─────────────────────────────────────────────────────────────
-- 2. Transferência em 2 fases
-- ─────────────────────────────────────────────────────────────
alter table public.casos
  add column transferencia_pendente_para uuid references public.membros (id) on delete set null,
  add column transferencia_pendente_por  uuid references public.membros (id) on delete set null,
  add column transferencia_pendente_em   timestamptz;

create index casos_transf_pendente_idx on public.casos (transferencia_pendente_para);

-- ─────────────────────────────────────────────────────────────
-- 3. Geração de id_caso / numero para casos criados no app
-- ─────────────────────────────────────────────────────────────
create or replace function public.gen_id_caso()
returns text language sql volatile as $$
  select string_agg(chr(65 + (random() * 25)::int), '')
  from generate_series(1, 6);
$$;

create sequence if not exists public.casos_numero_seq;
select setval(
  'public.casos_numero_seq',
  coalesce((select max(numero) from public.casos), 0) + 1,
  false
);

create or replace function public.casos_before_insert()
returns trigger language plpgsql as $$
begin
  if new.numero is null then
    new.numero := nextval('public.casos_numero_seq');
  end if;
  if new.id_caso is null then
    new.id_caso := public.gen_id_caso();
  end if;
  return new;
end;
$$;

create trigger casos_before_insert
  before insert on public.casos
  for each row execute function public.casos_before_insert();

-- ─────────────────────────────────────────────────────────────
-- 4. Anonimização: iniciais
-- ─────────────────────────────────────────────────────────────
create or replace function public.iniciais(_nome text)
returns text language sql immutable as $$
  select nullif(trim(string_agg(upper(left(w, 1)), ' ')), '')
  from regexp_split_to_table(coalesce(_nome, ''), '\s+') as w
  where w <> '';
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Permissão para operar um caso
-- ─────────────────────────────────────────────────────────────
create or replace function public.pode_operar_caso(_caso_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin_geral() or exists (
    select 1 from public.casos c
    where c.id = _caso_id
      and (c.responsavel_id = auth.uid() or c.ajudante_id = auth.uid())
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- 6. Guard: status só muda pelas funções encerrar_caso / reabrir_caso
-- ─────────────────────────────────────────────────────────────
create or replace function public.casos_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('app.status_change', true), '') <> 'on' then
    new.status := old.status;
    new.encerrado_em := old.encerrado_em;
  end if;
  new.legacy_bubble_id := old.legacy_bubble_id;
  new.bubble_raw := old.bubble_raw;
  return new;
end;
$$;

create trigger casos_guard_update
  before update on public.casos
  for each row execute function public.casos_guard();

-- ─────────────────────────────────────────────────────────────
-- 7. Transferência
-- ─────────────────────────────────────────────────────────────
create or replace function public.transferir_caso(_caso_id uuid, _novo uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _atual text; _dest text;
begin
  if not public.pode_operar_caso(_caso_id) then
    raise exception 'Sem permissão para transferir este caso.';
  end if;
  if not exists (select 1 from public.membros where id = _novo and status = 'ativo') then
    raise exception 'Destinatário inválido.';
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
end;
$$;

create or replace function public.aceitar_transferencia(_caso_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _nome text;
begin
  if not exists (
    select 1 from public.casos
    where id = _caso_id and transferencia_pendente_para = auth.uid()
  ) then
    raise exception 'Nenhuma transferência pendente para você neste caso.';
  end if;
  select nome into _nome from public.membros where id = auth.uid();

  update public.casos set
    responsavel_id   = auth.uid(),
    responsavel_nome = coalesce(_nome, responsavel_nome),
    transferencia_pendente_para = null,
    transferencia_pendente_por  = null,
    transferencia_pendente_em   = null,
    em_transferencia            = false,
    transferencia_data          = now(),
    transferencia_historico = coalesce(transferencia_historico, '')
      || ' — ' || coalesce(_nome, 'destino') || ' aceitou em '
      || to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
  where id = _caso_id;
end;
$$;

create or replace function public.cancelar_transferencia(_caso_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.casos
    where id = _caso_id
      and (transferencia_pendente_para = auth.uid()
           or transferencia_pendente_por = auth.uid()
           or public.is_admin_geral())
  ) then
    raise exception 'Sem permissão para cancelar esta transferência.';
  end if;

  update public.casos set
    transferencia_pendente_para = null,
    transferencia_pendente_por  = null,
    transferencia_pendente_em   = null,
    em_transferencia            = false,
    transferencia_historico = coalesce(transferencia_historico, '')
      || ' — transferência cancelada em '
      || to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')
  where id = _caso_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 8. Encerrar (anonimiza) / Reabrir
-- ─────────────────────────────────────────────────────────────
create or replace function public.encerrar_caso(_caso_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.casos
    where id = _caso_id
      and (responsavel_id = auth.uid() or public.is_admin_geral())
  ) then
    raise exception 'Sem permissão para encerrar este caso.';
  end if;

  set local app.status_change = 'on';
  update public.casos set
    status       = 'encerrado',
    encerrado_em = now(),
    paciente_nome         = public.iniciais(paciente_nome),
    nome_mae              = case when nome_mae is not null then 'x' end,
    nome_pai              = case when nome_pai is not null then 'x' end,
    nome_telefonou        = case when nome_telefonou is not null then 'x' end,
    acompanhante_nome     = case when acompanhante_nome is not null then 'x' end,
    telefone_paciente     = case when telefone_paciente is not null then 'x' end,
    telefone_acompanhante = case when telefone_acompanhante is not null then 'x' end,
    anciaos_contatados    = case when anciaos_contatados is not null then 'x' end,
    anciaos_cont_tel      = case when anciaos_cont_tel is not null then 'x' end
  where id = _caso_id;
end;
$$;

create or replace function public.reabrir_caso(_caso_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin_geral() then
    raise exception 'Apenas a administração geral pode reabrir casos.';
  end if;
  set local app.status_change = 'on';
  update public.casos set status = 'aberto', encerrado_em = null where id = _caso_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 9. RLS de escrita + SELECT com transferência pendente
-- ─────────────────────────────────────────────────────────────
drop policy "casos_select_envolvido" on public.casos;
create policy "casos_select_envolvido"
  on public.casos for select to authenticated
  using (
    public.is_admin_geral()
    or responsavel_id = auth.uid()
    or ajudante_id = auth.uid()
    or transferencia_pendente_para = auth.uid()
  );

create policy "casos_insert"
  on public.casos for insert to authenticated
  with check (public.is_ativo() and criado_por_id = auth.uid());

create policy "casos_update"
  on public.casos for update to authenticated
  using (public.pode_operar_caso(id))
  with check (public.pode_operar_caso(id));

grant insert, update on public.casos to authenticated;

revoke execute on function
  public.transferir_caso(uuid, uuid),
  public.aceitar_transferencia(uuid),
  public.cancelar_transferencia(uuid),
  public.encerrar_caso(uuid),
  public.reabrir_caso(uuid)
from anon, public;

grant execute on function
  public.transferir_caso(uuid, uuid),
  public.aceitar_transferencia(uuid),
  public.cancelar_transferencia(uuid),
  public.encerrar_caso(uuid),
  public.reabrir_caso(uuid)
to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 10. casos_resumo: expõe transferência pendente para a lista
-- ─────────────────────────────────────────────────────────────
drop view public.casos_resumo;
create view public.casos_resumo
  with (security_invoker = false)
  as
  select
    id, legacy_bubble_id, id_caso, numero, status,
    paciente_nome, responsavel_id, responsavel_nome, ajudante_id, ajudante_nome,
    hospital_nome, congregacao, cidade, uf,
    aberto_em, encerrado_em, atualizado_em_bubble, tags,
    em_transferencia, transferencia_pendente_para
  from public.casos;

revoke all on public.casos_resumo from anon;
grant select on public.casos_resumo to authenticated;
