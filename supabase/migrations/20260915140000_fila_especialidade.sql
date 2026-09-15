-- Fila rotativa por especialidade pra transferência de casos: o primeiro da
-- fila recebe o próximo caso; ao ser escolhido (enviada a transferência), vai
-- pro fim da fila daquela especialidade. "Plantão" é só informativo aqui
-- (mostra quem está na frente da fila de plantão, sem ser um alvo de
-- transferência neste popup).

create sequence if not exists public.membro_especialidades_ordem_seq;

alter table public.membro_especialidades
  add column ordem bigint not null default nextval('public.membro_especialidades_ordem_seq');

-- Reaproveita o RPC de transferência: agora recebe a especialidade usada pra
-- escolher o destinatário e, quando informada, manda esse membro pro fim da
-- fila daquela especialidade.
drop function if exists public.transferir_caso(uuid, uuid);

create function public.transferir_caso(
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

revoke execute on function public.transferir_caso(uuid, uuid, public.area_especialidade)
  from anon, public;
grant execute on function public.transferir_caso(uuid, uuid, public.area_especialidade)
  to authenticated;
