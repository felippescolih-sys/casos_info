-- Conexão do WhatsApp da COLIH pelo WAHA (sessão `colih` no WAHA da VPS).
--
-- Quem está com o celular é um superadmin, não quem mantém o sistema: a tela /whatsapp
-- deixa ele conectar (QR ou código) e reconectar sozinho. A Edge Function
-- `whatsapp-sessao` fala com o WAHA — a API key nunca chega ao navegador.
--
-- Esta tabela guarda o último estado visto pela verificação periódica, para:
--   - mostrar a faixa "WhatsApp desconectado" aos superadmins dentro do app;
--   - avisar os superadmins por WhatsApp (pelo número da F7, já que o da COLIH é o que caiu)
--     quando a sessão sai de WORKING e não volta em alguns minutos — e de novo quando volta.
--
-- Uma linha só (id = 1). Escrita só pela Edge Function (service_role); leitura só superadmin.

create table if not exists public.whatsapp_sessao (
  id smallint primary key default 1 check (id = 1),
  -- Status do WAHA: STOPPED, STARTING, SCAN_QR_CODE, WORKING, FAILED; INACESSIVEL quando nem
  -- o WAHA respondeu; INEXISTENTE quando a sessão ainda não foi criada.
  status text not null default 'INEXISTENTE',
  numero text,                         -- telefone conectado (me.id do WAHA, sem o @c.us)
  verificado_em timestamptz,
  conectado_em timestamptz,            -- última vez que entrou em WORKING
  -- Preenchido quando a sessão sai de WORKING sem ter sido desconectada pela tela.
  -- Nulo antes do primeiro pareamento: nunca conectado não é "caiu".
  caiu_em timestamptz,
  alerta_enviado_em timestamptz,
  desconectado_por uuid references public.membros(id) on delete set null,
  desconectado_em timestamptz,
  ultimo_erro text
);

insert into public.whatsapp_sessao (id) values (1) on conflict (id) do nothing;

alter table public.whatsapp_sessao enable row level security;

drop policy if exists whatsapp_sessao_select_superadmin on public.whatsapp_sessao;
create policy whatsapp_sessao_select_superadmin on public.whatsapp_sessao
  for select to authenticated
  using (public.is_admin_geral());

revoke insert, update, delete on public.whatsapp_sessao from anon, authenticated;

-- Verificação a cada 2 min. O alerta só sai depois de 5 min fora do ar (decidido na função),
-- então um restart do container do WAHA não vira mensagem para ninguém.
select cron.unschedule('whatsapp-sessao-verificar')
where exists (select 1 from cron.job where jobname = 'whatsapp-sessao-verificar');

select cron.schedule(
  'whatsapp-sessao-verificar',
  '*/2 * * * *',
  $cron$
  select net.http_post(
    url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/whatsapp-sessao',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'wapi_webhook_secret')
    ),
    body := jsonb_build_object('acao', 'verificar'),
    timeout_milliseconds := 30000
  );
  $cron$
);
