-- Notificações WhatsApp (w-api): aviso de transferência de caso + lembretes de plantão.
-- Arquitetura: Postgres dispara via pg_net (trigger de transferência + pg_cron de escalas)
-- para a Edge Function `enviar-wapi`, que fala com a w-api. Autenticação Postgres->Function
-- via segredo compartilhado guardado no Vault (nunca em texto puro nesta migration).

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Segredo aleatório, só existe dentro do Vault. Depois de aplicar esta migration,
-- ler o valor (select decrypted_secret from vault.decrypted_secrets where name = 'wapi_webhook_secret')
-- e configurar o mesmo valor como secret da Edge Function: `supabase secrets set WEBHOOK_SECRET=<valor>`.
select vault.create_secret(
  encode(extensions.gen_random_bytes(32), 'hex'),
  'wapi_webhook_secret',
  'Segredo compartilhado Postgres -> Edge Function enviar-wapi'
)
where not exists (select 1 from vault.secrets where name = 'wapi_webhook_secret');

-- ─────────────────────────────────────────────────────────────
-- Dedup dos lembretes de plantão (não reenviar a cada varredura do cron)
-- ─────────────────────────────────────────────────────────────
alter table public.escalas
  add column lembrete_enviado_em timestamptz,
  add column inicio_enviado_em   timestamptz;

-- ─────────────────────────────────────────────────────────────
-- Trigger: transferência de caso (transferencia_pendente_para passou a não-nulo)
-- ─────────────────────────────────────────────────────────────
create or replace function public.notificar_transferencia_caso()
returns trigger language plpgsql security definer set search_path = public as $$
declare _secret text;
begin
  if new.transferencia_pendente_para is null
     or new.transferencia_pendente_para is not distinct from old.transferencia_pendente_para then
    return new;
  end if;

  select decrypted_secret into _secret
  from vault.decrypted_secrets where name = 'wapi_webhook_secret';

  perform net.http_post(
    url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', _secret),
    body := jsonb_build_object('evento', 'transferencia', 'casoId', new.id)
  );
  return new;
end;
$$;

create trigger casos_notificar_transferencia
  after update on public.casos
  for each row execute function public.notificar_transferencia_caso();

-- ─────────────────────────────────────────────────────────────
-- Cron: varredura de escalas a cada 15min (lembrete ~28h antes + aviso de início)
-- ─────────────────────────────────────────────────────────────
select cron.schedule(
  'escalas-notificacoes-wapi',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'wapi_webhook_secret')
    ),
    body := jsonb_build_object('evento', 'checar_escalas')
  );
  $$
);
