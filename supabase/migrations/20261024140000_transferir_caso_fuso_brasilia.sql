-- `transferir_caso` recusava destinatário em ausência comparando com `current_date`,
-- que segue o fuso da sessão do Postgres (UTC no Supabase). Entre 21h e meia-noite
-- em Brasília já é o dia seguinte em UTC: a ausência de quem volta amanhã deixava de
-- valer na noite de hoje, e a de quem sai amanhã já bloqueava hoje à noite.
--
-- O corpo é o mesmo de 20260920120000_ausencias_disponibilidade.sql. Muda só o "hoje",
-- agora calculado no fuso de Brasília, como em 20261024130000 para a disponibilidade
-- de plantão. `create or replace` mantém os grants que a função já tem.

create or replace function public.transferir_caso(
  _caso_id uuid,
  _novo uuid,
  _area_especialidade public.area_especialidade default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  _atual text;
  _dest text;
  _hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if not public.pode_operar_caso(_caso_id) then
    raise exception 'Sem permissão para transferir este caso.';
  end if;
  if not exists (select 1 from public.membros where id = _novo and status = 'ativo') then
    raise exception 'Destinatário inválido.';
  end if;
  if exists (
    select 1 from public.membro_ausencias
    where membro_id = _novo and inicio <= _hoje and fim >= _hoje
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
