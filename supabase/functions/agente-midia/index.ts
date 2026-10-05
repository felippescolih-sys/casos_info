// Edge Function `agente-midia`
//
// Chamada só pelo n8n (agente de WhatsApp da VPS), com a chave secreta do projeto no Authorization — por isso
// verify_jwt=false no config.toml (a chave sb_secret_ não é JWT) e a conferência é feita aqui.
// O binário nunca passa pelo n8n nem pelo modelo: esta função baixa da w-api e devolve só texto.
//
// Ações (POST JSON):
//   { "acao": "processar", "membro_id", "message_id", "tipo": "audioMessage" | "imageMessage" | "documentMessage" | ...,
//     "mediaKey", "directPath", "mimetype", "fileLength", "seconds", "fileName", "caption" }
//     → { texto }  — o que o agente deve "ler" no lugar da mídia
//       áudio: transcrito na OpenAI (não é guardado);
//       arquivo: guardado em `casos/pendentes/<membro>/...` por 24 h, esperando o membro dizer de qual caso é.
//   { "acao": "anexar", "membro_id", "id_caso", "arquivo_id"? } → move para `casos/<caso_id>/...` + caso_anexos.
//
// Secrets: WAPI_BASE_URL (sem /v1), WAPI_INSTANCE_ID, WAPI_TOKEN, OPENAI_API_KEY.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const WAPI_BASE_URL = Deno.env.get('WAPI_BASE_URL')!;
const WAPI_INSTANCE_ID = Deno.env.get('WAPI_INSTANCE_ID')!;
const WAPI_TOKEN = Deno.env.get('WAPI_TOKEN')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const BUCKET = 'casos';

const LIMITE_AUDIO_S = 5 * 60;
const LIMITE_ARQUIVO = 15 * 1024 * 1024;
// O que pode virar anexo do caso (combinado com a COLIH): PDF, fotos e Word/Excel.
const ACEITOS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'foto',
  'image/png': 'foto',
  'image/webp': 'foto',
  'image/heic': 'foto',
  'image/heif': 'foto',
  'application/msword': 'documento Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documento Word',
  'application/vnd.ms-excel': 'planilha Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'planilha Excel',
};
const EXTENSAO: Record<string, string> = {
  'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic',
  'image/heif': 'heif', 'application/msword': 'doc', 'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};
const TIPO_WAPI: Record<string, string> = {
  audioMessage: 'audio', imageMessage: 'image', documentMessage: 'document', documentWithCaptionMessage: 'document',
  videoMessage: 'video', stickerMessage: 'sticker',
};

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Aceita a service_role (JWT) ou qualquer chave secreta nova (sb_secret_) do projeto.
function autorizado(req: Request) {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const validas = new Set<string>();
  const sr = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (sr) validas.add(sr);
  try {
    const coletar = (v: unknown): void => {
      if (typeof v === 'string') validas.add(v);
      else if (v && typeof v === 'object') Object.values(v).forEach(coletar);
    };
    coletar(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}'));
  } catch { /* sem chaves novas */ }
  return validas.has(token);
}

// w-api: descriptografa a mídia do WhatsApp e devolve um link temporário (60 min, sem token).
async function baixarDaWapi(p: Record<string, unknown>) {
  const tipo = TIPO_WAPI[String(p.tipo)] ?? 'document';
  const res = await fetch(`${WAPI_BASE_URL}/v1/message/download-media?instanceId=${WAPI_INSTANCE_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WAPI_TOKEN}` },
    body: JSON.stringify({ mediaKey: p.mediaKey, directPath: p.directPath, type: tipo, mimetype: p.mimetype }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error || !j.fileLink) throw new Error(`w-api download-media: ${res.status} ${j.message ?? ''}`.trim());
  const arq = await fetch(j.fileLink);
  if (!arq.ok) throw new Error(`w-api fileLink: ${arq.status}`);
  return new Uint8Array(await arq.arrayBuffer());
}

async function transcrever(audio: Uint8Array, mimetype: string) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY não configurada');
  const form = new FormData();
  form.append('file', new Blob([audio], { type: mimetype.split(';')[0] }), 'audio.ogg');
  form.append('model', 'gpt-4o-transcribe');
  form.append('language', 'pt');
  // Vocabulário do domínio ajuda nomes próprios e termos médicos.
  form.append('prompt', 'Relato de voluntário da COLIH sobre paciente internado: hospital, médico, idade, ' +
    'congregação, hemoglobina, plaquetas, transfusão, cirurgia, UTI, Erasto Gaertner, Hospital de Clínicas, Evangélico.');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${j?.error?.message ?? ''}`.trim());
  return String(j.text ?? '').trim();
}

// Pendentes com mais de 24 h sem caso: apaga arquivo e registro (limpeza preguiçosa, a cada chamada).
async function limparVencidos() {
  const { data } = await supabase.from('agente_arquivos_pendentes').select('id, storage_path')
    .is('anexado_em', null).lt('criado_em', new Date(Date.now() - 24 * 3600 * 1000).toISOString()).limit(50);
  if (!data?.length) return;
  await supabase.storage.from(BUCKET).remove(data.map((d) => d.storage_path));
  await supabase.from('agente_arquivos_pendentes').delete().in('id', data.map((d) => d.id));
}

const nomeSeguro = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'arquivo';

async function processar(p: Record<string, unknown>) {
  const tipo = String(p.tipo ?? '');
  const mimetype = String(p.mimetype ?? '').split(';')[0].trim().toLowerCase();
  const legenda = String(p.caption ?? '').trim();

  if (tipo === 'audioMessage') {
    const seg = Number(p.seconds ?? 0);
    if (seg > LIMITE_AUDIO_S) {
      return `[O usuário enviou um áudio de ${Math.round(seg / 60)} minutos, acima do limite de 5 minutos. ` +
        'Peça para dividir em áudios menores ou escrever.]';
    }
    const texto = await transcrever(await baixarDaWapi(p), String(p.mimetype ?? 'audio/ogg'));
    if (!texto) return '[O usuário enviou um áudio, mas não foi possível entender o que foi dito. Peça para repetir ou escrever.]';
    return '[ÁUDIO TRANSCRITO. A transcrição pode errar nomes e números: antes de gravar qualquer coisa no caso, ' +
      `resuma o que entendeu e peça confirmação.]\n${texto}`;
  }

  if (tipo in TIPO_WAPI && !['videoMessage', 'stickerMessage'].includes(tipo)) {
    if (!ACEITOS[mimetype]) {
      return `[O usuário enviou um arquivo do tipo ${mimetype || 'desconhecido'}, que não pode ser anexado ao caso. ` +
        'Diga que dá para anexar PDF, foto e documentos Word ou Excel.]';
    }
    const tamanho = Number(p.fileLength ?? 0);
    if (tamanho > LIMITE_ARQUIVO) {
      return `[O usuário enviou um arquivo de ${(tamanho / 1048576).toFixed(1)} MB, acima do limite de 15 MB. Peça um arquivo menor.]`;
    }

    // Reenvio do mesmo webhook não guarda duas vezes.
    const { data: existente } = await supabase.from('agente_arquivos_pendentes').select('id, nome')
      .eq('message_id', String(p.message_id)).maybeSingle();
    let id = existente?.id as string | undefined;
    let nome = existente?.nome as string | undefined;
    if (!id) {
      const bytes = await baixarDaWapi(p);
      nome = String(p.fileName ?? '').trim() ||
        `${ACEITOS[mimetype] === 'foto' ? 'foto' : 'arquivo'}_${new Date().toISOString().slice(0, 10)}.${EXTENSAO[mimetype] ?? 'bin'}`;
      const path = `pendentes/${p.membro_id}/${Date.now()}-${nomeSeguro(nome)}`;
      const up = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: mimetype, upsert: false });
      if (up.error) throw new Error(`storage: ${up.error.message}`);
      const ins = await supabase.from('agente_arquivos_pendentes').insert({
        membro_id: p.membro_id, message_id: String(p.message_id), storage_path: path, nome, mime: mimetype, tamanho: bytes.length,
      }).select('id').single();
      if (ins.error) throw new Error(`registro: ${ins.error.message}`);
      id = ins.data.id;
    }
    return `[O usuário enviou ${ACEITOS[mimetype] === 'foto' ? 'uma foto' : `o arquivo "${nome}"`} (arquivo_id: ${id}). ` +
      'Ele fica guardado por 24 horas esperando ser anexado a um caso. Se a conversa já deixar claro de qual caso é, ' +
      'confirme com o usuário e use anexar_arquivo; senão, pergunte de qual paciente é.]' +
      (legenda ? `\nLegenda que veio junto: ${legenda}` : '');
  }

  return '[O usuário enviou um tipo de mensagem que não pode ser usado (vídeo, figurinha ou outro). ' +
    'Diga que você lê texto e áudio, e anexa PDF, foto e documentos Word ou Excel.]';
}

async function anexar(p: Record<string, unknown>) {
  const { data: v, error } = await supabase.rpc('agente_validar_anexo', {
    _membro: p.membro_id, _id_caso: p.id_caso, _arquivo_id: p.arquivo_id ?? null,
  });
  if (error) return { sucesso: false, erro: 'erro_sistema', mensagem: error.message };
  if (!v?.ok) return { sucesso: false, ...v };

  const destino = `${v.caso_id}/${Date.now()}-${nomeSeguro(v.nome)}`;
  const mv = await supabase.storage.from(BUCKET).move(v.storage_path, destino);
  if (mv.error) return { sucesso: false, erro: 'erro_sistema', mensagem: `storage: ${mv.error.message}` };

  const ins = await supabase.from('caso_anexos').insert({
    caso_id: v.caso_id, storage_path: destino, nome: v.nome, tamanho: v.tamanho, mime: v.mime, enviado_por: p.membro_id,
  });
  if (ins.error) {
    await supabase.storage.from(BUCKET).move(destino, v.storage_path); // desfaz para poder tentar de novo
    return { sucesso: false, erro: 'erro_sistema', mensagem: ins.error.message };
  }
  await supabase.from('agente_arquivos_pendentes').update({ anexado_caso_id: v.caso_id, anexado_em: new Date().toISOString(), storage_path: destino })
    .eq('id', v.arquivo_id);
  return { sucesso: true, nome: v.nome, id_caso: v.id_caso, paciente_nome: v.paciente_nome };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'use POST' });
  if (!autorizado(req)) return json(401, { error: 'não autorizado' });
  let p: Record<string, unknown>;
  try { p = await req.json(); } catch { return json(400, { error: 'corpo não é JSON' }); }
  if (!p.membro_id) return json(400, { error: 'membro_id obrigatório' });

  try {
    if (p.acao === 'processar') {
      await limparVencidos().catch((e) => console.error('limpeza', e));
      return json(200, { texto: await processar(p) });
    }
    if (p.acao === 'anexar') return json(200, await anexar(p));
    return json(400, { error: 'acao deve ser processar ou anexar' });
  } catch (e) {
    console.error('agente-midia', p.acao, e);
    // O agente recebe uma instrução legível em vez de quebrar a conversa.
    if (p.acao === 'processar') {
      return json(200, { texto: '[Não foi possível abrir a mídia que o usuário enviou (erro técnico). Peça para tentar de novo em instantes ou escrever.]', erro: String(e) });
    }
    return json(500, { sucesso: false, erro: 'erro_sistema', mensagem: String(e) });
  }
});
