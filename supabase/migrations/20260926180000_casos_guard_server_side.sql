-- `casos_guard` passa a abrir exceção para contexto server-side, igual `membros_guard`.
--
-- O guard existe para impedir que um cliente autenticado encerre/reabra caso por
-- UPDATE direto (driblando `encerrar_caso`, que anonimiza) ou adultere a origem
-- (`legacy_bubble_id`/`bubble_raw`). Essa proteção continua valendo integralmente.
--
-- O problema é que ele roda em TODO update, inclusive nos do service_role, e ali
-- reverte em silêncio, sem erro. Na prática isso quebrava a sincronização com o
-- Bubble: `import-bubble-casos.ts` atualiza caso já importado, o guard descarta
-- `status` e `bubble_raw`, e o script reporta sucesso. Medido em 26/09, na véspera
-- da migração definitiva: pelo menos 20 casos encerrados no Bubble continuariam
-- "aberto" aqui — num sistema de plantão médico, o pior tipo de erro silencioso.
--
-- `auth.uid()` nulo só acontece fora de requisição autenticada (service_role, SQL
-- editor, cron), porque a RLS barra o anon. E o service_role já podia desabilitar
-- o trigger de qualquer forma — o guard nunca foi barreira real ali, só atrapalhava
-- escrita legítima. Mesmo critério e mesma justificativa da migration
-- 20260907130000, que corrigiu `membros_guard` exatamente por isso.

create or replace function public.casos_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new;
  end if;

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
