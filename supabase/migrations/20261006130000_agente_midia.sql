-- Arquivos e áudios recebidos pelo agente de WhatsApp (n8n → Edge Function agente-midia).
--
-- Áudio: a Edge Function baixa pela w-api, transcreve na OpenAI e devolve o texto; o áudio NÃO é guardado.
-- Arquivo (PDF, foto, Word/Excel): fica numa área provisória do bucket `casos` (pasta `pendentes/<membro>/`) até o
-- membro dizer de qual caso é; aí a Edge Function move para `<caso_id>/...` e registra em caso_anexos, como o
-- upload do app. Pendente sem caso em 24 h é apagado (limpeza feita pela própria Edge Function a cada chamada).

create table public.agente_arquivos_pendentes (
  id              uuid primary key default gen_random_uuid(),
  membro_id       uuid not null references public.membros (id) on delete cascade,
  message_id      text not null unique,            -- id da mensagem no WhatsApp: reenvio do webhook não duplica
  storage_path    text not null,                   -- pendentes/<membro>/<...>
  nome            text not null,
  mime            text,
  tamanho         bigint,
  criado_em       timestamptz not null default now(),
  anexado_caso_id uuid references public.casos (id) on delete set null,
  anexado_em      timestamptz
);

create index agente_arquivos_pendentes_membro on public.agente_arquivos_pendentes (membro_id, criado_em desc);

-- Só a service_role (Edge Function) mexe: RLS ligada e nenhuma policy.
alter table public.agente_arquivos_pendentes enable row level security;

-- Confere se o membro pode anexar o arquivo ao caso (mesma regra do app: pode_operar_caso) e devolve o que a Edge
-- Function precisa para mover. _arquivo_id null = o arquivo pendente mais recente do membro.
create or replace function public.agente_validar_anexo(_membro uuid, _id_caso text, _arquivo_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _a public.agente_arquivos_pendentes;
  _c public.casos;
begin
  perform public.agente_agir_como(_membro);

  select * into _a from public.agente_arquivos_pendentes
  where membro_id = _membro and anexado_em is null and criado_em > now() - interval '24 hours'
    and (_arquivo_id is null or id = _arquivo_id)
  order by criado_em desc limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'erro', 'arquivo_nao_encontrado',
      'mensagem', 'Não há arquivo recebido nas últimas 24 horas esperando para ser anexado. Peça para enviar de novo.');
  end if;

  select * into _c from public.casos where upper(id_caso) = upper(trim(coalesce(_id_caso, ''))) limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'erro', 'caso_nao_encontrado', 'mensagem', 'Nenhum caso encontrado com esse código.');
  end if;
  if not public.pode_operar_caso(_c.id) then
    return jsonb_build_object('ok', false, 'autorizado', false,
      'mensagem', 'Você não é responsável nem ajudante deste caso.', 'responsavel_nome', _c.responsavel_nome);
  end if;

  return jsonb_build_object('ok', true, 'arquivo_id', _a.id, 'storage_path', _a.storage_path, 'nome', _a.nome,
    'mime', _a.mime, 'tamanho', _a.tamanho, 'caso_id', _c.id, 'id_caso', _c.id_caso, 'paciente_nome', _c.paciente_nome);
end $$;

revoke execute on function public.agente_validar_anexo(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.agente_validar_anexo(uuid, text, uuid) to service_role;
