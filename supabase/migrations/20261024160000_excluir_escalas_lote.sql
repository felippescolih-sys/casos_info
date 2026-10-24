-- Exclusão de escalas em lote (ex.: desfazer um mês gerado errado). Mesmo desenho de
-- `criar_escalas_lote`: tudo numa transação, o aviso por linha do trigger fica calado
-- e sai um único evento `escala_lote_cancelada`, que vira uma mensagem por membro com
-- todos os plantões dele que foram cancelados.

create or replace function public.excluir_escalas_lote(_ids uuid[])
returns int language plpgsql security definer set search_path = public as $$
declare
  _secret text;
  _canceladas jsonb;
  _total int;
begin
  if not public.gerencia_escalas() then
    raise exception 'Sem permissão para excluir escalas.';
  end if;
  if coalesce(array_length(_ids, 1), 0) = 0 then
    raise exception 'Nenhuma escala para excluir.';
  end if;

  -- `true` = vale só até o fim desta transação.
  perform set_config('app.escala_lote', 'on', true);

  with removidas as (
    delete from public.escalas
    where id = any(_ids)
    returning membro_id, ajudante_id, inicio, fim
  )
  select count(*)::int,
         coalesce(
           jsonb_agg(jsonb_build_object(
             'membro_id', membro_id, 'ajudante_id', ajudante_id,
             'inicio', inicio, 'fim', fim) order by inicio)
           -- Plantão que já acabou é limpeza de registro, não aviso a dar
           -- (mesmo critério do aviso por linha).
           filter (where fim >= now()),
           '[]'::jsonb)
  into _total, _canceladas
  from removidas;

  perform set_config('app.escala_lote', 'off', true);

  if jsonb_array_length(_canceladas) > 0 then
    select decrypted_secret into _secret
    from vault.decrypted_secrets where name = 'wapi_webhook_secret';

    perform net.http_post(
      url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', _secret),
      body := jsonb_build_object(
        'evento',   'escala_lote_cancelada',
        'escalas',  _canceladas,
        'autorId',  auth.uid()
      ),
      timeout_milliseconds := 30000
    );
  end if;

  return _total;
end;
$$;

revoke execute on function public.excluir_escalas_lote(uuid[]) from anon, public;
grant execute on function public.excluir_escalas_lote(uuid[]) to authenticated;
