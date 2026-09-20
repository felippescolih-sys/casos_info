// Edge Function `enviar-wapi`
//
// Chamada só por dentro do Postgres (trigger de transferência + pg_cron de escalas),
// nunca pelo frontend — por isso verify_jwt=false no config.toml e autenticação por
// segredo compartilhado (header x-webhook-secret, guardado no Vault do Postgres e
// como secret desta função).
//
// Eventos:
//   - "transferencia": avisa o novo responsável e o ancião de contato do caso.
//   - "checar_escalas": varredura (chamada a cada 15min pelo pg_cron) que manda
//     lembrete ~28h antes do início do plantão e aviso quando ele está começando.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const WAPI_BASE_URL = Deno.env.get('WAPI_BASE_URL')!;
const WAPI_INSTANCE_ID = Deno.env.get('WAPI_INSTANCE_ID')!;
const WAPI_TOKEN = Deno.env.get('WAPI_TOKEN')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const fmtDataHora = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));

// Normaliza pra DDI+DDD+número só dígitos. tel_zap nem sempre tem o 55 na frente.
function normalizarTelefone(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length === 12 || digits.length === 13) return digits;
  return digits.length >= 10 ? digits : null;
}

async function enviarWhatsapp(rawPhone: string | null | undefined, message: string) {
  const phone = normalizarTelefone(rawPhone);
  if (!phone) return;
  const res = await fetch(
    `${WAPI_BASE_URL}/v1/message/send-text?instanceId=${WAPI_INSTANCE_ID}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WAPI_TOKEN}` },
      body: JSON.stringify({ phone, message }),
    },
  );
  if (!res.ok) {
    console.error('w-api send-text falhou', res.status, await res.text());
  }
}

async function notificarTransferencia(casoId: string) {
  const { data: caso, error } = await supabase
    .from('casos')
    .select(
      'id_caso, numero, paciente_nome, transferencia_pendente_para, transferencia_pendente_por, anciaos_contatados, anciaos_cont_tel',
    )
    .eq('id', casoId)
    .maybeSingle();
  if (error || !caso || !caso.transferencia_pendente_para) {
    if (error) console.error('notificarTransferencia: erro ao buscar caso', error);
    return;
  }

  const identificador = caso.id_caso ? `caso ${caso.id_caso}` : `caso nº ${caso.numero}`;

  const idsMembros = [caso.transferencia_pendente_para, caso.transferencia_pendente_por].filter(
    (id): id is string => !!id,
  );
  const { data: membros } = await supabase
    .from('membros')
    .select('id, nome, tel_zap')
    .in('id', idsMembros);
  const destino = membros?.find((m) => m.id === caso.transferencia_pendente_para);
  const origem = membros?.find((m) => m.id === caso.transferencia_pendente_por);

  if (destino) {
    await enviarWhatsapp(
      destino.tel_zap,
      `Olá, ${destino.nome}! O ${identificador} foi transferido para você` +
        (origem?.nome ? ` por ${origem.nome}` : '') +
        `. Acesse o Casos Info para ver os detalhes e aceitar a transferência.`,
    );
  }

  if (caso.anciaos_cont_tel) {
    await enviarWhatsapp(
      caso.anciaos_cont_tel,
      `Aviso: o ${identificador}${caso.paciente_nome ? ` (${caso.paciente_nome})` : ''} foi ` +
        `transferido para ${destino?.nome ?? 'outro membro'}, que passa a ser o responsável ` +
        `pelo acompanhamento.`,
    );
  }
}

async function checarEscalas() {
  const agora = new Date();
  const iso = (ms: number) => new Date(agora.getTime() + ms).toISOString();
  const HORA = 3_600_000;
  const MIN = 60_000;

  const [{ data: lembretes, error: errLembretes }, { data: iniciando, error: errIniciando }] =
    await Promise.all([
      supabase
        .from('escalas')
        .select('id, membro_id, ajudante_id, inicio')
        .is('lembrete_enviado_em', null)
        .gte('inicio', iso(27.75 * HORA))
        .lte('inicio', iso(28.25 * HORA)),
      supabase
        .from('escalas')
        .select('id, membro_id, ajudante_id, inicio')
        .is('inicio_enviado_em', null)
        .gte('inicio', iso(-5 * MIN))
        .lte('inicio', iso(15 * MIN)),
    ]);
  if (errLembretes) console.error('checarEscalas: erro ao buscar lembretes', errLembretes);
  if (errIniciando) console.error('checarEscalas: erro ao buscar início', errIniciando);

  const idsMembros = new Set<string>();
  for (const e of [...(lembretes ?? []), ...(iniciando ?? [])]) {
    idsMembros.add(e.membro_id);
    if (e.ajudante_id) idsMembros.add(e.ajudante_id);
  }
  const { data: membros } = idsMembros.size
    ? await supabase.from('membros').select('id, nome, tel_zap').in('id', [...idsMembros])
    : { data: [] as { id: string; nome: string; tel_zap: string | null }[] };
  const membroPorId = new Map((membros ?? []).map((m) => [m.id, m]));

  for (const e of lembretes ?? []) {
    const quando = fmtDataHora(e.inicio);
    for (const id of [e.membro_id, e.ajudante_id].filter((v): v is string => !!v)) {
      const m = membroPorId.get(id);
      if (!m) continue;
      await enviarWhatsapp(
        m.tel_zap,
        `Olá, ${m.nome}! Lembrete: você está escalado(a) no plantão de emergência que começa ` +
          `${quando} (daqui a ~28h). Qualquer impedimento, avise a coordenação com antecedência.`,
      );
    }
    await supabase.from('escalas').update({ lembrete_enviado_em: agora.toISOString() }).eq('id', e.id);
  }

  for (const e of iniciando ?? []) {
    const quando = fmtDataHora(e.inicio);
    for (const id of [e.membro_id, e.ajudante_id].filter((v): v is string => !!v)) {
      const m = membroPorId.get(id);
      if (!m) continue;
      await enviarWhatsapp(
        m.tel_zap,
        `Olá, ${m.nome}! Seu plantão de emergência está começando agora (${quando}). ` +
          `Fique atento(a) aos chamados.`,
      );
    }
    await supabase.from('escalas').update({ inicio_enviado_em: agora.toISOString() }).eq('id', e.id);
  }
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('unauthorized', { status: 401 });
  }

  let body: { evento?: string; casoId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  try {
    if (body.evento === 'transferencia' && body.casoId) {
      await notificarTransferencia(body.casoId);
    } else if (body.evento === 'checar_escalas') {
      await checarEscalas();
    } else {
      return new Response('evento desconhecido', { status: 400 });
    }
  } catch (err) {
    console.error('enviar-wapi falhou', err);
    return new Response('erro interno', { status: 500 });
  }

  return new Response('ok');
});
