-- Avisa no WhatsApp quem está na escala quando o plantão é criado, remarcado,
-- trocado de plantonista ou cancelado. Até aqui só existiam o lembrete de ~28h
-- e o aviso de início: quem era designado (ou retirado) não ficava sabendo.
--
-- Mesma arquitetura do resto: o Postgres dispara via pg_net para a Edge Function
-- `enviar-wapi`, que monta a mensagem e fala com a w-api.

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

-- Idempotente de propósito: esta migration foi aplicada à mão pelo SQL Editor antes
-- de entrar no histórico do CLI, então o próximo `db push` vai reexecutá-la. Sem o
-- drop, o create abaixo falharia com "trigger already exists" e travaria as migrations
-- seguintes. `create or replace function` acima já é idempotente por natureza.
drop trigger if exists escalas_notificar_mudanca on public.escalas;

create trigger escalas_notificar_mudanca
  after insert or update or delete on public.escalas
  for each row execute function public.notificar_escala_alterada();
