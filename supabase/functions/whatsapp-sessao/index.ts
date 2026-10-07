// Edge Function `whatsapp-sessao`
//
// Conexão do WhatsApp da COLIH com o WAHA (sessão `colih` no WAHA da VPS). Dois chamadores:
//
//   - pg_cron, a cada 2 min, com o header x-webhook-secret (mesmo segredo do Vault que o
//     enviar-wapi usa): ação "verificar" — grava o status em `whatsapp_sessao` e avisa os
//     superadmins quando a sessão cai e quando volta.
//   - a tela /whatsapp, com o login do usuário: só superadmin (is_admin_geral). Ações
//     "status", "iniciar", "qr", "codigo" e "desconectar". A API key do WAHA fica aqui;
//     o navegador só vê status, QR e código de pareamento.
//
// verify_jwt=false no config.toml porque o cron não manda JWT; a sessão do usuário é
// conferida aqui dentro.
//
// O aviso de queda sai pelo número da F7 (sessão WAHA_SESSAO_ALERTA no mesmo WAHA), já que
// o número da COLIH é justamente o que caiu. Se o WAHA inteiro estiver fora, tenta a w-api
// enquanto os secrets dela existirem; depois da migração, sobra a faixa vermelha no app.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!;
const WAHA_URL = (Deno.env.get('WAHA_URL') ?? '').replace(/\/$/, '');
const WAHA_API_KEY = Deno.env.get('WAHA_API_KEY') ?? '';
const SESSAO = Deno.env.get('WAHA_SESSAO') ?? 'colih';
const SESSAO_ALERTA = Deno.env.get('WAHA_SESSAO_ALERTA') ?? 'f7';
const APP_URL = (Deno.env.get('APP_URL') ?? 'https://casosinfo.com.br').replace(/\/$/, '');
const WAPI_BASE_URL = Deno.env.get('WAPI_BASE_URL');
const WAPI_INSTANCE_ID = Deno.env.get('WAPI_INSTANCE_ID');
const WAPI_TOKEN = Deno.env.get('WAPI_TOKEN');

// Fora do ar por menos que isso não avisa ninguém: um restart do container leva segundos.
const TOLERANCIA_MS = 5 * 60_000;

const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

class ErroUsuario extends Error {}

// ─── WAHA ────────────────────────────────────────────────────────────────

async function waha(caminho: string, init: RequestInit = {}, timeoutMs = 15_000) {
  if (!WAHA_URL || !WAHA_API_KEY) throw new Error('WAHA_URL/WAHA_API_KEY não configurados');
  return await fetch(`${WAHA_URL}${caminho}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Api-Key': WAHA_API_KEY,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

type Estado = { status: string; numero: string | null; nome: string | null; erro: string | null };

async function lerEstado(): Promise<Estado> {
  try {
    const r = await waha(`/api/sessions/${SESSAO}`);
    if (r.status === 404) return { status: 'INEXISTENTE', numero: null, nome: null, erro: null };
    if (!r.ok) {
      return {
        status: 'INACESSIVEL',
        numero: null,
        nome: null,
        erro: `HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`,
      };
    }
    const s = await r.json();
    const me = s?.me ?? null;
    return {
      status: String(s?.status ?? 'INACESSIVEL'),
      numero: me?.id ? String(me.id).replace(/@.*$/, '') : null,
      nome: me?.pushName ?? null,
      erro: null,
    };
  } catch (e) {
    return { status: 'INACESSIVEL', numero: null, nome: null, erro: String(e).slice(0, 200) };
  }
}

// Cria a sessão se ainda não existe e liga. Sem webhook: enquanto a w-api for o canal oficial,
// o WAHA só fica conectado. O webhook entra na virada (configurado no servidor, não por aqui).
async function iniciar() {
  const atual = await lerEstado();
  if (atual.status === 'INACESSIVEL') throw new Error(`WAHA fora do ar: ${atual.erro}`);
  let r: Response;
  if (atual.status === 'INEXISTENTE') {
    r = await waha('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({
        name: SESSAO,
        start: true,
        config: { ignore: { status: true, groups: true, channels: true } },
      }),
    });
  } else if (atual.status === 'STOPPED') {
    r = await waha(`/api/sessions/${SESSAO}/start`, { method: 'POST' });
  } else if (atual.status === 'FAILED') {
    r = await waha(`/api/sessions/${SESSAO}/restart`, { method: 'POST' });
  } else {
    return;
  }
  if (!r.ok) throw new Error(`WAHA recusou iniciar: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function qr(): Promise<{ imagem: string } | null> {
  const r = await waha(`/api/${SESSAO}/auth/qr?format=image`);
  if (!r.ok) return null; // fora de SCAN_QR_CODE o WAHA responde erro
  const corpo = await r.json();
  if (!corpo?.data) return null;
  return { imagem: `data:${corpo.mimetype ?? 'image/png'};base64,${corpo.data}` };
}

async function codigo(telefone: string): Promise<string> {
  const r = await waha(`/api/${SESSAO}/auth/request-code`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: telefone }),
  });
  const texto = await r.text();
  if (!r.ok) throw new ErroUsuario(`O WhatsApp não gerou o código (${r.status}). Tente o QR.`);
  const corpo = JSON.parse(texto);
  if (!corpo?.code) throw new ErroUsuario('O WhatsApp não devolveu o código. Tente o QR.');
  return String(corpo.code);
}

async function desconectar() {
  const r = await waha(`/api/sessions/${SESSAO}/logout`, { method: 'POST' });
  if (!r.ok && r.status !== 404) {
    throw new Error(`WAHA recusou desconectar: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  }
}

// ─── Aviso aos superadmins ───────────────────────────────────────────────

function normalizarTelefone(raw: string | null | undefined): string | null {
  const d = (raw ?? '').replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if (d.length >= 12) return d;
  return null;
}

// Contas brasileiras antigas existem sem o nono dígito, e o tel_zap do cadastro sempre tem o 9
// (mesma armadilha do Livih): pergunta ao WAHA o chatId certo, com e sem o 9.
async function chatIdWaha(telefone: string): Promise<string | null> {
  const candidatos = [telefone];
  const br = telefone.match(/^55(\d{2})9(\d{8})$/);
  if (br) candidatos.push(`55${br[1]}${br[2]}`);
  for (const numero of candidatos) {
    const r = await waha(
      `/api/contacts/check-exists?session=${encodeURIComponent(SESSAO_ALERTA)}&phone=${numero}`,
      {},
      8000,
    );
    if (!r.ok) continue;
    const corpo = await r.json().catch(() => null);
    if (corpo?.numberExists && corpo?.chatId) return String(corpo.chatId);
  }
  return null;
}

async function enviarAlerta(telefone: string, texto: string): Promise<boolean> {
  try {
    const chatId = await chatIdWaha(telefone);
    if (chatId) {
      const r = await waha(
        '/api/sendText',
        { method: 'POST', body: JSON.stringify({ session: SESSAO_ALERTA, chatId, text: texto }) },
        20_000,
      );
      if (r.ok) return true;
      console.error('alerta pelo WAHA falhou', r.status, (await r.text()).slice(0, 200));
    }
  } catch (e) {
    console.error('alerta pelo WAHA falhou', e);
  }
  // WAHA inteiro fora: a w-api é outra porta para o mesmo número da COLIH e pode estar de pé.
  if (!WAPI_BASE_URL || !WAPI_INSTANCE_ID || !WAPI_TOKEN) return false;
  try {
    const r = await fetch(`${WAPI_BASE_URL}/v1/message/send-text?instanceId=${WAPI_INSTANCE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WAPI_TOKEN}` },
      body: JSON.stringify({ phone: telefone, message: texto }),
      signal: AbortSignal.timeout(20_000),
    });
    if (r.ok) return true;
    console.error('alerta pela w-api falhou', r.status, (await r.text()).slice(0, 200));
  } catch (e) {
    console.error('alerta pela w-api falhou', e);
  }
  return false;
}

async function avisarSuperadmins(texto: (nome: string) => string) {
  const { data, error } = await admin
    .from('membro_funcoes')
    .select('membro:membros!membro_funcoes_membro_id_fkey!inner(nome, tel_zap, status)')
    .eq('area', 'geral')
    .eq('nivel', 'superadmin')
    .eq('membro.status', 'ativo');
  if (error) {
    console.error('avisarSuperadmins: erro ao buscar superadmins', error);
    return 0;
  }
  let enviados = 0;
  for (const linha of data ?? []) {
    const m = linha.membro as unknown as { nome: string; tel_zap: string | null };
    const tel = normalizarTelefone(m.tel_zap);
    if (!tel) continue;
    if (await enviarAlerta(tel, texto(m.nome.split(' ')[0]))) enviados++;
  }
  return enviados;
}

const STATUS_PT: Record<string, string> = {
  STOPPED: 'parado',
  STARTING: 'iniciando',
  SCAN_QR_CODE: 'aguardando leitura do QR',
  FAILED: 'falhou',
  INACESSIVEL: 'servidor do WhatsApp fora do ar',
  INEXISTENTE: 'sessão não existe',
};

const fmtHora = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));

// ─── Verificação (cron e tela) ───────────────────────────────────────────

type Linha = {
  status: string;
  caiu_em: string | null;
  alerta_enviado_em: string | null;
  desconectado_em: string | null;
};

async function verificar() {
  const estado = await lerEstado();
  const agora = new Date();
  const { data: anterior, error } = await admin
    .from('whatsapp_sessao')
    .select('status, caiu_em, alerta_enviado_em, desconectado_em')
    .eq('id', 1)
    .single<Linha>();
  if (error) throw error;

  const patch: Record<string, unknown> = {
    status: estado.status,
    verificado_em: agora.toISOString(),
    ultimo_erro: estado.erro,
  };

  if (estado.status === 'WORKING') {
    patch.numero = estado.numero;
    if (anterior.status !== 'WORKING') patch.conectado_em = agora.toISOString();
    patch.caiu_em = null;
    patch.desconectado_por = null;
    patch.desconectado_em = null;
    await admin.from('whatsapp_sessao').update(patch).eq('id', 1);

    // Reivindica o "voltou" antes de enviar, para cron e tela não mandarem os dois.
    if (anterior.alerta_enviado_em) {
      const { data: meu } = await admin
        .from('whatsapp_sessao')
        .update({ alerta_enviado_em: null })
        .eq('id', 1)
        .not('alerta_enviado_em', 'is', null)
        .select('id');
      if (meu?.length) {
        await avisarSuperadmins(
          (nome) =>
            `✅ Olá, ${nome}! O WhatsApp da COLIH no Casos Info está conectado de novo` +
            (estado.numero ? ` (${estado.numero})` : '') +
            '.',
        );
      }
    }
    return;
  }

  // Saiu de WORKING sem ninguém clicar em "Desconectar" na tela: isso é uma queda.
  if (anterior.status === 'WORKING' && !anterior.caiu_em && !anterior.desconectado_em) {
    patch.caiu_em = agora.toISOString();
  }
  await admin.from('whatsapp_sessao').update(patch).eq('id', 1);

  const caiuEm = (patch.caiu_em as string | undefined) ?? anterior.caiu_em;
  if (!caiuEm || anterior.alerta_enviado_em) return;
  if (agora.getTime() - new Date(caiuEm).getTime() < TOLERANCIA_MS) return;

  const { data: meu } = await admin
    .from('whatsapp_sessao')
    .update({ alerta_enviado_em: agora.toISOString() })
    .eq('id', 1)
    .is('alerta_enviado_em', null)
    .not('caiu_em', 'is', null)
    .select('id');
  if (!meu?.length) return;

  const enviados = await avisarSuperadmins(
    (nome) =>
      `⚠️ Olá, ${nome}! O WhatsApp da COLIH no Casos Info está desconectado desde ` +
      `${fmtHora(caiuEm)} (${STATUS_PT[estado.status] ?? estado.status}). ` +
      `Enquanto isso, as mensagens automáticas por esse número param.\n\n` +
      `Para reconectar, abra ${APP_URL}/whatsapp com o celular da COLIH em mãos.`,
  );
  if (!enviados) console.error('queda do WhatsApp: nenhum superadmin recebeu o aviso');
}

async function lerLinha() {
  const { data, error } = await admin
    .from('whatsapp_sessao')
    .select('status, numero, verificado_em, conectado_em, caiu_em, desconectado_em, ultimo_erro')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data;
}

// ─── Entrada ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ erro: 'método não permitido' }, 405);

  let body: { acao?: string; telefone?: string };
  try {
    body = await req.json();
  } catch {
    return json({ erro: 'corpo inválido' }, 400);
  }

  try {
    // Chamada interna (pg_cron).
    if (req.headers.get('x-webhook-secret')) {
      if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
        return json({ erro: 'não autorizado' }, 401);
      }
      if (body.acao !== 'verificar') return json({ erro: 'ação desconhecida' }, 400);
      await verificar();
      return json({ ok: true });
    }

    // Chamada da tela: valida o JWT e aplica a mesma regra do is_admin_geral()
    // (função 'geral'/'superadmin'), exigindo também membro ativo.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!token) return json({ erro: 'não autorizado' }, 401);
    const { data: usuario, error: errUsuario } = await admin.auth.getUser(token);
    if (errUsuario || !usuario.user) return json({ erro: 'não autorizado' }, 401);
    const { data: funcao } = await admin
      .from('membro_funcoes')
      .select('membro_id, membro:membros!membro_funcoes_membro_id_fkey!inner(status)')
      .eq('membro_id', usuario.user.id)
      .eq('area', 'geral')
      .eq('nivel', 'superadmin')
      .eq('membro.status', 'ativo')
      .limit(1);
    if (!funcao?.length) return json({ erro: 'só superadmin' }, 403);

    switch (body.acao) {
      case 'status':
        await verificar();
        return json(await lerLinha());
      case 'iniciar':
        await iniciar();
        await verificar();
        return json(await lerLinha());
      case 'qr':
        return json((await qr()) ?? { imagem: null });
      case 'codigo': {
        const tel = normalizarTelefone(body.telefone);
        if (!tel) throw new ErroUsuario('Telefone inválido. Use DDD + número.');
        return json({ codigo: await codigo(tel) });
      }
      case 'desconectar':
        await desconectar();
        // Marca antes de verificar, para a saída de WORKING não ser lida como queda.
        await admin
          .from('whatsapp_sessao')
          .update({
            desconectado_por: usuario.user.id,
            desconectado_em: new Date().toISOString(),
            caiu_em: null,
          })
          .eq('id', 1);
        await verificar();
        return json(await lerLinha());
      default:
        return json({ erro: 'ação desconhecida' }, 400);
    }
  } catch (e) {
    if (e instanceof ErroUsuario) return json({ erro: e.message }, 400);
    console.error('whatsapp-sessao falhou', e);
    return json({ erro: 'erro interno' }, 500);
  }
});
