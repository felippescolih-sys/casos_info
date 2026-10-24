-- Geração da escala de plantão em lote (ex.: rodízio do mês inteiro de uma vez).
--
-- Três peças:
--   1. `disponibilidade_plantao_lote`: a prévia precisa saber quem pode pegar cada
--      turno. Chamar `membro_disponivel_plantao` por membro × dia seria centenas de
--      RPCs; aqui vai uma só. Recebe os mesmos timestamps que serão gravados, então a
--      prévia concorda exatamente com o que o trigger `escalas_guard_disponibilidade`
--      vai aceitar ou recusar no save.
--   2. `criar_escalas_lote`: grava tudo numa transação. Se um turno for recusado pelo
--      guard, nada é gravado — melhor do que meio mês criado e o resto perdido.
--   3. Aviso de WhatsApp agrupado: o trigger por linha mandaria uma mensagem por turno
--      (30 mensagens para quem pega 30 dias). Durante o lote ele fica calado e a RPC
--      dispara um único evento `escala_lote`, que vira uma mensagem por membro.

-- ─────────────────────────────────────────────────────────────
-- 1. Disponibilidade de vários membros em vários turnos
-- ─────────────────────────────────────────────────────────────
create or replace function public.disponibilidade_plantao_lote(
  _membros uuid[], _inicios timestamptz[], _fins timestamptz[]
)
returns table (membro_id uuid, turno int, disponivel boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  -- Expõe ausências de terceiros (de forma indireta): só para quem monta a escala.
  if not public.gerencia_escalas() then
    raise exception 'Sem permissão para gerar escalas.';
  end if;
  if coalesce(array_length(_inicios, 1), 0) <> coalesce(array_length(_fins, 1), 0) then
    raise exception 'Listas de início e fim com tamanhos diferentes.';
  end if;

  return query
    select m.id, t.i::int, public.membro_disponivel_plantao(m.id, _inicios[t.i], _fins[t.i])
    from unnest(_membros) as m(id)
    cross join generate_subscripts(_inicios, 1) as t(i);
end;
$$;

revoke execute on function public.disponibilidade_plantao_lote(uuid[], timestamptz[], timestamptz[])
  from anon, public;
grant execute on function public.disponibilidade_plantao_lote(uuid[], timestamptz[], timestamptz[])
  to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Aviso por linha fica calado durante o lote
-- ─────────────────────────────────────────────────────────────
create or replace function public.notificar_escala_alterada()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _secret     text;
  _acao       text;
  _id         uuid;
  _antes      jsonb;
  _depois     jsonb;
  _fim_novo   timestamptz;
  _fim_antigo timestamptz;
begin
  -- Só avisa mudança feita por gente no app. `auth.uid()` nulo = service_role,
  -- ou seja script/job server-side — e `import-bubble-plantao.ts` faz upsert em
  -- massa e é feito pra rodar de novo a qualquer momento. Sem esta trava, uma
  -- reimportação mandaria WhatsApp para a escala inteira. Mesmo critério que
  -- `membros_guard` já usa para reconhecer contexto confiável server-side.
  if auth.uid() is null then
    return null;
  end if;

  -- `criar_escalas_lote` manda um aviso agrupado no fim; aqui seria um por turno.
  if current_setting('app.escala_lote', true) = 'on' then
    return null;
  end if;

  if tg_op = 'INSERT' then
    _acao := 'criada';
    _id   := new.id;
    _fim_novo := new.fim;
  elsif tg_op = 'DELETE' then
    _acao := 'excluida';
    _id   := old.id;
    _fim_antigo := old.fim;
  else
    -- Gravar `lembrete_enviado_em`/`inicio_enviado_em` não é mudança de designação.
    -- Sem esta saída antecipada, cada aviso enviado dispararia outro aviso.
    if new.membro_id    is not distinct from old.membro_id
       and new.ajudante_id is not distinct from old.ajudante_id
       and new.inicio      is not distinct from old.inicio
       and new.fim         is not distinct from old.fim then
      return null;
    end if;
    _acao := 'editada';
    _id   := new.id;
    _fim_novo   := new.fim;
    _fim_antigo := old.fim;
  end if;

  -- Mexer num plantão que já acabou é correção de registro, não aviso a dar.
  -- Só cala quando o período é passado dos dois lados: arrastar uma escala do
  -- passado para o futuro (ou o contrário) continua avisando.
  if coalesce(_fim_novo,   '-infinity'::timestamptz) < now()
     and coalesce(_fim_antigo, '-infinity'::timestamptz) < now() then
    return null;
  end if;

  if tg_op <> 'DELETE' then
    _depois := jsonb_build_object(
      'membro_id', new.membro_id, 'ajudante_id', new.ajudante_id,
      'inicio', new.inicio, 'fim', new.fim);
  end if;
  if tg_op <> 'INSERT' then
    _antes := jsonb_build_object(
      'membro_id', old.membro_id, 'ajudante_id', old.ajudante_id,
      'inicio', old.inicio, 'fim', old.fim);
  end if;

  select decrypted_secret into _secret
  from vault.decrypted_secrets where name = 'wapi_webhook_secret';

  perform net.http_post(
    url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', _secret),
    body := jsonb_build_object(
      'evento',   'escala_alterada',
      'acao',     _acao,
      'escalaId', _id,
      'antes',    _antes,
      'depois',   _depois,
      'autorId',  auth.uid()
    ),
    timeout_milliseconds := 30000
  );
  return null;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. Criação em lote
-- ─────────────────────────────────────────────────────────────
-- `_escalas`: [{ "membro_id", "ajudante_id"?, "inicio", "fim" }, ...]
--
-- security definer porque o aviso precisa ler o segredo do Vault; a permissão de
-- escrita, que a RLS checaria, é checada aqui na entrada com a mesma função.
create or replace function public.criar_escalas_lote(_escalas jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare
  _secret text;
  _criadas jsonb;
  _total int;
begin
  if not public.gerencia_escalas() then
    raise exception 'Sem permissão para gerar escalas.';
  end if;
  if jsonb_typeof(_escalas) <> 'array' or jsonb_array_length(_escalas) = 0 then
    raise exception 'Nenhuma escala para criar.';
  end if;

  -- `true` = vale só até o fim desta transação.
  perform set_config('app.escala_lote', 'on', true);

  with novas as (
    insert into public.escalas (membro_id, ajudante_id, inicio, fim, criado_por)
    select (e->>'membro_id')::uuid,
           nullif(e->>'ajudante_id', '')::uuid,
           (e->>'inicio')::timestamptz,
           (e->>'fim')::timestamptz,
           auth.uid()
    from jsonb_array_elements(_escalas) as e
    returning membro_id, ajudante_id, inicio, fim
  )
  select count(*)::int,
         coalesce(
           jsonb_agg(jsonb_build_object(
             'membro_id', membro_id, 'ajudante_id', ajudante_id,
             'inicio', inicio, 'fim', fim) order by inicio)
           filter (where fim >= now()),
           '[]'::jsonb)
  into _total, _criadas
  from novas;

  perform set_config('app.escala_lote', 'off', true);

  if jsonb_array_length(_criadas) > 0 then
    select decrypted_secret into _secret
    from vault.decrypted_secrets where name = 'wapi_webhook_secret';

    perform net.http_post(
      url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', _secret),
      body := jsonb_build_object(
        'evento',   'escala_lote',
        'escalas',  _criadas,
        'autorId',  auth.uid()
      ),
      timeout_milliseconds := 30000
    );
  end if;

  return _total;
end;
$$;

revoke execute on function public.criar_escalas_lote(jsonb) from anon, public;
grant execute on function public.criar_escalas_lote(jsonb) to authenticated;
