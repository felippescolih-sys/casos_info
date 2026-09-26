-- Robustez das notificações w-api.
--
-- Três problemas observados em produção depois de ~1 semana no ar:
--
-- 1. `net.http_post` usa timeout padrão de 5s, e ~17% das varreduras do cron
--    estouravam esse limite (cold start da Edge Function): 4 de 24 chamadas na
--    janela de retenção do pg_net vieram com timed_out = true. Subimos pra 30s.
--
-- 2. Quando o pg_net desiste, a Edge Function pode já ter mandado parte das
--    mensagens sem ter gravado o carimbo de dedup — a varredura seguinte
--    reenviaria. A trava definitiva é do lado da função (claim antes de enviar),
--    mas o timeout maior já reduz drasticamente a chance de interrupção.
--
-- 3. Remarcar um plantão (mudar `inicio`) não limpava os carimbos de dedup, então
--    quem já tinha recebido lembrete da data antiga nunca era avisado da nova.

-- ─────────────────────────────────────────────────────────────
-- 1. Trigger de transferência: timeout de 30s
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
    body := jsonb_build_object('evento', 'transferencia', 'casoId', new.id),
    timeout_milliseconds := 30000
  );
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 2. Cron das escalas: mesmo timeout de 30s
-- ─────────────────────────────────────────────────────────────
select cron.unschedule('escalas-notificacoes-wapi')
where exists (select 1 from cron.job where jobname = 'escalas-notificacoes-wapi');

select cron.schedule(
  'escalas-notificacoes-wapi',
  '*/15 * * * *',
  $cron$
  select net.http_post(
    url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'wapi_webhook_secret')
    ),
    body := jsonb_build_object('evento', 'checar_escalas'),
    timeout_milliseconds := 30000
  );
  $cron$
);

-- ─────────────────────────────────────────────────────────────
-- 3. Remarcou o plantão => os avisos daquela escala valem de novo
-- ─────────────────────────────────────────────────────────────
create or replace function public.escalas_reset_notificacoes()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.inicio is distinct from old.inicio then
    new.lembrete_enviado_em := null;
    new.inicio_enviado_em   := null;
  end if;
  return new;
end;
$$;

create trigger escalas_reset_notificacoes
  before update on public.escalas
  for each row execute function public.escalas_reset_notificacoes();

-- ─────────────────────────────────────────────────────────────
-- 4. Guard de disponibilidade só revalida quando a designação muda
-- ─────────────────────────────────────────────────────────────
-- O guard rodava em TODO update de `escalas`, inclusive no que só grava
-- `lembrete_enviado_em`/`inicio_enviado_em`. Se o membro registrasse uma ausência
-- depois de já estar escalado (o uso normal da feature de ausências), o carimbo
-- passava a levantar exceção e derrubava a varredura inteira do cron — para todas
-- as escalas, não só a dele. A regra continua valendo onde importa: designar ou
-- remarcar. Corrigir uma designação impossível segue sendo trabalho da coordenação.
create or replace function public.escalas_guard_disponibilidade()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE'
     and new.membro_id   is not distinct from old.membro_id
     and new.ajudante_id is not distinct from old.ajudante_id
     and new.inicio      is not distinct from old.inicio
     and new.fim         is not distinct from old.fim then
    return new;
  end if;

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
