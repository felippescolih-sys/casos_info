-- Ajudante do caso: o responsável (ou a administração geral) escolhe um ajudante pelo app,
-- e o ajudante recebe aviso no WhatsApp dizendo de quem e de qual caso.
--
-- `casos.ajudante_id`/`ajudante_nome` já existiam (vinham do Bubble), mas não havia como
-- definir pelo app. A troca passa a ser só por `definir_ajudante_caso`, que confere
-- permissão e dispara o aviso. O `casos_guard` ganha a trava correspondente: como o
-- ajudante também pode editar o caso (`casos_update`), sem ela ele poderia pôr outra
-- pessoa no lugar por UPDATE direto, sem aviso e sem a conferência do responsável.

create or replace function public.casos_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.status is distinct from old.status
     and coalesce(current_setting('app.status_change', true), '') <> 'on' then
    new.status := old.status;
    new.encerrado_em := old.encerrado_em;
  end if;
  if (new.ajudante_id is distinct from old.ajudante_id
      or new.ajudante_nome is distinct from old.ajudante_nome)
     and coalesce(current_setting('app.ajudante_change', true), '') <> 'on' then
    new.ajudante_id := old.ajudante_id;
    new.ajudante_nome := old.ajudante_nome;
  end if;
  new.legacy_bubble_id := old.legacy_bubble_id;
  new.bubble_raw := old.bubble_raw;
  return new;
end;
$$;

-- _ajudante nulo = tirar o ajudante do caso (sem aviso).
create or replace function public.definir_ajudante_caso(_caso_id uuid, _ajudante uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  _c record;
  _nome text;
  _secret text;
  _hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select id, status, responsavel_id, ajudante_id into _c
  from public.casos where id = _caso_id;
  if not found then
    raise exception 'Caso não encontrado.';
  end if;
  if not (_c.responsavel_id = auth.uid() or public.is_admin_geral()) then
    raise exception 'Só o responsável pelo caso ou a administração geral escolhe o ajudante.';
  end if;
  if _c.status <> 'aberto' then
    raise exception 'O caso está encerrado. Reabra o caso para mudar o ajudante.';
  end if;

  if _ajudante is not null then
    if _ajudante = _c.responsavel_id then
      raise exception 'O responsável não pode ser também o ajudante. Escolha outra pessoa.';
    end if;
    select nome into _nome from public.membros where id = _ajudante and status = 'ativo';
    if _nome is null then
      raise exception 'Esse membro não está ativo. Escolha outra pessoa.';
    end if;
    if exists (
      select 1 from public.membro_ausencias
      where membro_id = _ajudante and inicio <= _hoje and fim >= _hoje
    ) then
      raise exception 'Este membro está em período de ausência registrado. Escolha outra pessoa.';
    end if;
  end if;

  if _ajudante is not distinct from _c.ajudante_id then
    return;
  end if;

  -- `true` = vale só até o fim desta transação.
  perform set_config('app.ajudante_change', 'on', true);
  update public.casos set ajudante_id = _ajudante, ajudante_nome = _nome where id = _caso_id;
  perform set_config('app.ajudante_change', 'off', true);

  if _ajudante is not null then
    select decrypted_secret into _secret
    from vault.decrypted_secrets where name = 'wapi_webhook_secret';

    perform net.http_post(
      url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', _secret),
      body := jsonb_build_object('evento', 'ajudante', 'casoId', _caso_id, 'autorId', auth.uid()),
      timeout_milliseconds := 30000
    );
  end if;
end;
$$;

revoke execute on function public.definir_ajudante_caso(uuid, uuid) from anon, public;
grant execute on function public.definir_ajudante_caso(uuid, uuid) to authenticated;
