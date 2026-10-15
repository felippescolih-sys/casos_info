// Envio de WhatsApp pelo WAHA (sessão `colih` na VPS). A w-api foi desligada em 08/10/2026.
//
// Secrets: WAHA_URL, WAHA_API_KEY, WAHA_SESSAO.

export const WAHA_URL = (Deno.env.get('WAHA_URL') ?? '').replace(/\/$/, '');
export const WAHA_API_KEY = Deno.env.get('WAHA_API_KEY') ?? '';
export const WAHA_SESSAO = Deno.env.get('WAHA_SESSAO') ?? 'colih';

/** Destino: telefone (qualquer formato) e/ou o chatId do WAHA de quem escreveu (ex.: `123@lid`). */
export type Destino = { telefone?: string | null; chatId?: string | null };

export type Documento = { base64: string; nomeArquivo: string; mimetype?: string; legenda?: string };

// Normaliza pra DDI+DDD+número só dígitos. tel_zap nem sempre tem o 55 na frente.
export function normalizarTelefone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length === 12 || digits.length === 13) return digits;
  return digits.length >= 10 ? digits : null;
}

function wahaFetch(caminho: string, init: RequestInit = {}, timeoutMs = 20_000) {
  return fetch(`${WAHA_URL}${caminho}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_API_KEY, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

// O número da COLIH é uma conta antiga sem o nono dígito, e muitos membros também: mandar para
// "55419…@c.us" falha se a conta é "5541…" (GOWS: "no LID found"). Pergunta ao WAHA o chatId
// certo, com e sem o 9 — a resposta já vem como LID quando ele existe.
async function chatIdWaha(destino: Destino): Promise<string | null> {
  if (destino.chatId) return destino.chatId;
  const tel = normalizarTelefone(destino.telefone);
  if (!tel) return null;
  const candidatos = [tel];
  const br = tel.match(/^55(\d{2})9(\d{8})$/);
  if (br) candidatos.push(`55${br[1]}${br[2]}`);
  for (const numero of candidatos) {
    const r = await wahaFetch(
      `/api/contacts/check-exists?session=${encodeURIComponent(WAHA_SESSAO)}&phone=${numero}`,
      {},
      8000,
    );
    if (!r.ok) continue;
    const corpo = await r.json().catch(() => null);
    if (corpo?.numberExists && corpo?.chatId) return String(corpo.chatId);
  }
  return null;
}

async function falhou(onde: string, res: Response) {
  console.error(`${onde} falhou`, res.status, (await res.text()).slice(0, 300));
  return false;
}

export async function enviarTexto(destino: Destino, texto: string): Promise<boolean> {
  const chatId = await chatIdWaha(destino);
  if (!chatId) {
    console.error('WAHA: número sem WhatsApp', destino.telefone);
    return false;
  }
  const r = await wahaFetch('/api/sendText', {
    method: 'POST',
    body: JSON.stringify({ session: WAHA_SESSAO, chatId, text: texto }),
  });
  return r.ok || falhou('WAHA sendText', r);
}

export async function enviarDocumento(destino: Destino, doc: Documento): Promise<boolean> {
  const chatId = await chatIdWaha(destino);
  if (!chatId) {
    console.error('WAHA: número sem WhatsApp', destino.telefone);
    return false;
  }
  const r = await wahaFetch(
    '/api/sendFile',
    {
      method: 'POST',
      body: JSON.stringify({
        session: WAHA_SESSAO,
        chatId,
        caption: doc.legenda,
        file: { mimetype: doc.mimetype ?? 'application/pdf', filename: doc.nomeArquivo, data: doc.base64 },
      }),
    },
    60_000,
  );
  return r.ok || falhou('WAHA sendFile', r);
}

/** Baixa uma mídia recebida pelo WAHA. Só aceita URL do próprio WAHA (a chave vai no header). */
export async function baixarDoWaha(url: string): Promise<Uint8Array> {
  const publica = (Deno.env.get('WAHA_URL_PUBLICA') ?? WAHA_URL).replace(/\/$/, '');
  if (!url.startsWith(`${publica}/`) && !url.startsWith(`${WAHA_URL}/`)) {
    throw new Error('URL de mídia fora do WAHA');
  }
  const r = await fetch(url, { headers: { 'X-Api-Key': WAHA_API_KEY }, signal: AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`WAHA mídia: ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}
