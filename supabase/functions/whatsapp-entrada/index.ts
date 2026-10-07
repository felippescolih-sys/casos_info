// Edge Function `whatsapp-entrada`
//
// Recebe o webhook da sessão `colih` do WAHA (evento "message": só o que os membros mandam, nunca o
// que o próprio número envia) e repassa ao agente do n8n (Agente_CasosInfo) já mastigado:
//   - telefone resolvido: no GOWS a mensagem costuma vir só com o LID (`123@lid`); o telefone está em
//     campos "Alt" do _data ou sai da API /lids do WAHA. Sem ele o agente não acha o membro.
//   - texto, ou a mídia com a URL do WAHA (a agente-midia baixa de lá; o binário não passa pelo n8n).
// O corpo mantém isGroup/sender.id/chat.id, que o Filter do workflow já confere, e marca
// provedor='waha' para o workflow responder pelo mesmo caminho.
//
// URL configurada na sessão do WAHA: /functions/v1/whatsapp-entrada?s=<WAHA_WEBHOOK_SECRET>
// Secrets: WAHA_WEBHOOK_SECRET, N8N_AGENTE_URL, WAHA_URL, WAHA_API_KEY, WAHA_SESSAO.

import { WAHA_API_KEY, WAHA_SESSAO, WAHA_URL } from '../_shared/whatsapp.ts';

const SEGREDO = Deno.env.get('WAHA_WEBHOOK_SECRET') ?? '';
const N8N_AGENTE_URL = Deno.env.get('N8N_AGENTE_URL') ?? '';

// deno-lint-ignore no-explicit-any
type Json = any;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// "5541999990000@c.us" → telefone; "123456@lid" → lid.
function lerJid(jid: unknown): { telefone?: string; lid?: string } {
  if (typeof jid !== 'string') return {};
  const m = jid.match(/^(\d+)(?::\d+)?@(c\.us|s\.whatsapp\.net|lid)$/);
  if (!m) return {};
  if (m[2] === 'lid') return { lid: m[1] };
  return /^\d{10,15}$/.test(m[1]) ? { telefone: m[1] } : {};
}

// Telefone de quem escreveu: o próprio `from`, campos "Alt" do GOWS ou a API de LIDs do WAHA.
async function telefoneDoRemetente(from: string, data: Json, meDigitos: string): Promise<string | null> {
  const direto = lerJid(from);
  if (direto.telefone) return direto.telefone;
  const info = data?.Info ?? {};
  for (const campo of ['SenderAlt', 'ChatAlt', 'RecipientAlt', 'Sender', 'Chat']) {
    const t = lerJid(info[campo]).telefone;
    if (t && t !== meDigitos) return t;
  }
  if (!direto.lid) return null;
  try {
    const r = await fetch(
      `${WAHA_URL}/api/${encodeURIComponent(WAHA_SESSAO)}/lids/${encodeURIComponent(`${direto.lid}@lid`)}`,
      { headers: { 'X-Api-Key': WAHA_API_KEY }, signal: AbortSignal.timeout(5000) },
    );
    if (!r.ok) return null;
    const corpo = await r.json();
    return lerJid(corpo?.pn ?? corpo?.phoneNumber).telefone ?? null;
  } catch {
    return null;
  }
}

// Mesmo vocabulário da w-api (audioMessage, imageMessage...), que é o que o nó "Code in JavaScript"
// e a agente-midia já entendem.
function midiaDe(p: Json) {
  const msg = p._data?.Message ?? p._data?.message ?? {};
  const doc = msg.documentMessage ?? msg.documentWithCaptionMessage?.message?.documentMessage;
  const mime = String(p.media?.mimetype ?? '');
  let tipo: string;
  if (msg.audioMessage || mime.startsWith('audio/')) tipo = 'audioMessage';
  else if (msg.stickerMessage || mime === 'image/webp') tipo = 'stickerMessage';
  else if (msg.videoMessage || mime.startsWith('video/')) tipo = 'videoMessage';
  else if (msg.imageMessage || mime.startsWith('image/')) tipo = 'imageMessage';
  else tipo = 'documentMessage';
  const m = msg[tipo] ?? doc ?? {};
  return {
    tipo,
    message_id: String(p.id),
    url: p.media?.url ?? null,
    mimetype: mime || m.mimetype || null,
    fileLength: Number(m.fileLength ?? 0) || null,
    seconds: Number(m.seconds ?? 0) || null,
    fileName: p.media?.filename ?? m.fileName ?? null,
    caption: m.caption ?? (typeof p.body === 'string' ? p.body : null),
  };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { erro: 'use POST' });
  if (!SEGREDO || new URL(req.url).searchParams.get('s') !== SEGREDO) {
    return json(401, { erro: 'não autorizado' });
  }

  let corpo: Json;
  try {
    corpo = await req.json();
  } catch {
    return json(400, { erro: 'corpo não é JSON' });
  }
  if (corpo?.event !== 'message') return json(200, { ignorado: corpo?.event ?? 'sem evento' });

  const p = corpo.payload ?? {};
  const from = String(p.from ?? '');
  if (p.fromMe || !from || /@(g\.us|broadcast|newsletter)$/.test(from)) {
    return json(200, { ignorado: 'própria/grupo/status/canal' });
  }

  const meDigitos = String(corpo.me?.id ?? '').split('@')[0].split(':')[0];
  const telefone = await telefoneDoRemetente(from, p._data, meDigitos);
  if (!telefone) console.error('whatsapp-entrada: telefone não resolvido para', from);

  const midia = p.hasMedia || p.media ? midiaDe(p) : null;
  const texto = typeof p.body === 'string' ? p.body.trim() : '';
  if (!midia && !texto && !p.location && !p.vCards?.length) {
    return json(200, { ignorado: 'sem conteúdo' }); // reação, apagada, evento do sistema
  }

  const repasse = {
    provedor: 'waha',
    isGroup: false,
    fromMe: false,
    messageId: String(p.id),
    sender: { id: telefone ?? '', pushName: p._data?.Info?.PushName ?? null },
    chat: { id: from },
    texto,
    midia,
    // Tipos que o agente não usa: o nó do n8n responde "não dá para usar isso".
    outra: p.location ? 'locationMessage' : p.vCards?.length ? 'contactMessage' : null,
  };

  const r = await fetch(N8N_AGENTE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(repasse),
    signal: AbortSignal.timeout(15_000),
  }).catch((e) => {
    console.error('whatsapp-entrada: n8n inacessível', e);
    return null;
  });
  // Erro aqui faz o WAHA tentar de novo (retries da sessão).
  if (!r?.ok) {
    if (r) console.error('whatsapp-entrada: n8n', r.status, (await r.text()).slice(0, 200));
    return json(502, { erro: 'n8n' });
  }
  return json(200, { ok: true });
});
