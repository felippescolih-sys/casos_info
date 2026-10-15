// Edge Function `whatsapp-enviar`
//
// Porta única de envio para o n8n (resposta do agente, planilha HLC-7, lembrete quinzenal), para
// que nenhum workflow precise guardar a credencial do WAHA.
// Chamada com a chave secreta do projeto (ver _shared/chave.ts).
//
// POST { acao: 'texto', telefone?, chat_id?, texto }
// POST { acao: 'documento', telefone?, chat_id?, base64, nome_arquivo, mimetype?, legenda? }
//   → { ok: boolean }
//
// `chat_id` é o id de quem escreveu, ex. `123@lid` — responder para ele evita a busca do número
// com/sem o nono dígito. O campo `provedor`, da época da w-api, ainda chega do n8n e é ignorado.

import { chaveDoProjeto } from '../_shared/chave.ts';
import { enviarDocumento, enviarTexto } from '../_shared/whatsapp.ts';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { erro: 'use POST' });
  if (!chaveDoProjeto(req)) return json(401, { erro: 'não autorizado' });
  let p: Record<string, unknown>;
  try {
    p = await req.json();
  } catch {
    return json(400, { erro: 'corpo não é JSON' });
  }

  const destino = {
    telefone: typeof p.telefone === 'string' ? p.telefone : null,
    chatId: typeof p.chat_id === 'string' && p.chat_id ? p.chat_id : null,
  };
  if (!destino.telefone && !destino.chatId) return json(400, { erro: 'telefone ou chat_id obrigatório' });

  try {
    if (p.acao === 'texto') {
      if (typeof p.texto !== 'string' || !p.texto.trim()) return json(400, { erro: 'texto vazio' });
      return json(200, { ok: await enviarTexto(destino, p.texto) });
    }
    if (p.acao === 'documento') {
      if (typeof p.base64 !== 'string' || typeof p.nome_arquivo !== 'string') {
        return json(400, { erro: 'base64 e nome_arquivo obrigatórios' });
      }
      const ok = await enviarDocumento(destino, {
        base64: p.base64,
        nomeArquivo: p.nome_arquivo,
        mimetype: typeof p.mimetype === 'string' ? p.mimetype : undefined,
        legenda: typeof p.legenda === 'string' ? p.legenda : undefined,
      });
      return json(200, { ok });
    }
    return json(400, { erro: 'acao deve ser texto ou documento' });
  } catch (e) {
    console.error('whatsapp-enviar', p.acao, e);
    return json(500, { ok: false, erro: String(e).slice(0, 300) });
  }
});
