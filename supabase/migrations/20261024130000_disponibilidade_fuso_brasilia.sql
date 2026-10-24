-- `membro_disponivel_plantao` transformava os timestamps em data com `::date`, que
-- usa o fuso da sessão do Postgres (UTC no Supabase), não o de Brasília. O plantão
-- padrão, de 00:00 a 23:59 em Brasília, vai de 03:00 a 02:59 do dia seguinte em UTC,
-- então a função conferia dois dias: quem não atende segunda era barrado no plantão
-- de domingo, e uma ausência que começava na segunda bloqueava o domingo também.
--
-- O corpo é o mesmo de 20260920120000_ausencias_disponibilidade.sql. Mudam só as
-- duas conversões de data, agora feitas no fuso de Brasília. Como o trigger
-- `escalas_guard_disponibilidade` e a RPC `disponibilidade_plantao_lote` chamam
-- esta função, os dois passam a seguir a regra corrigida sem outra mudança.

create or replace function public.membro_disponivel_plantao(
  _membro_id uuid, _inicio timestamptz, _fim timestamptz
)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  _disp record;
  _dia date;
  _dow int;
  _ultimo_dia_mes int;
  _dia_inicio date := (_inicio at time zone 'America/Sao_Paulo')::date;
  _dia_fim    date := (_fim    at time zone 'America/Sao_Paulo')::date;
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
    where membro_id = _membro_id and inicio <= _dia_fim and fim >= _dia_inicio
  ) then
    return false;
  end if;

  for _dia in select generate_series(_dia_inicio, _dia_fim, interval '1 day')::date loop
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
