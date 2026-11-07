-- Histórico das mensagens avulsas enviadas pela tela /whatsapp.
--
-- Os superadmins mandam mensagens pelo número da COLIH na tela /whatsapp (Edge Function
-- `whatsapp-sessao`, ação "enviar"). Esta tabela guarda cada envio, inclusive os que o WhatsApp
-- recusou, para a própria tela mostrar o histórico: quem mandou, para quem, o texto e se saiu.
--
-- O texto pode ter dado de paciente: leitura só superadmin (mesma regra da tela). Escrita só pela
-- Edge Function (service_role); ninguém edita nem apaga pelo app.

create table if not exists public.whatsapp_mensagens_avulsas (
  id uuid primary key default gen_random_uuid(),
  enviado_em timestamptz not null default now(),
  remetente_id uuid references public.membros(id) on delete set null,
  remetente_nome text,                 -- foto do nome, caso o membro seja apagado
  destino_membro_id uuid references public.membros(id) on delete set null,
  destino_nome text,                   -- nome do membro escolhido; nulo quando foi número digitado
  telefone text not null,              -- DDI+DDD+número, só dígitos
  texto text not null,
  ok boolean not null,
  erro text
);

create index if not exists whatsapp_mensagens_avulsas_enviado_em_idx
  on public.whatsapp_mensagens_avulsas (enviado_em desc);

alter table public.whatsapp_mensagens_avulsas enable row level security;

drop policy if exists whatsapp_mensagens_avulsas_select_superadmin on public.whatsapp_mensagens_avulsas;
create policy whatsapp_mensagens_avulsas_select_superadmin on public.whatsapp_mensagens_avulsas
  for select to authenticated
  using (public.is_admin_geral());

revoke all on public.whatsapp_mensagens_avulsas from anon;
revoke insert, update, delete on public.whatsapp_mensagens_avulsas from authenticated;
grant select on public.whatsapp_mensagens_avulsas to authenticated;
