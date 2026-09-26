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

// Carimba a escala ANTES de enviar. O update condicional (`is null`) é atômico no
// Postgres: se duas varreduras se sobrepuserem, ou se a anterior tiver sido cortada
// no meio do envio, só uma reivindica a escala e ninguém recebe a mensagem duas vezes.
// O preço é o inverso — uma falha depois do carimbo perde aquele aviso — mas mensagem
// repetida em massa no WhatsApp dos membros é pior do que um aviso perdido raro.
async function reivindicar(
  escalaId: string,
  coluna: 'lembrete_enviado_em' | 'inicio_enviado_em',
  agora: Date,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('escalas')
    .update({ [coluna]: agora.toISOString() })
    .eq('id', escalaId)
    .is(coluna, null)
    .select('id');
  if (error) {
    console.error(`reivindicar(${coluna}) falhou`, error);
    return false;
  }
  return (data ?? []).length > 0;
}

type EscalaSnapshot = {
  membro_id: string;
  ajudante_id: string | null;
  inicio: string;
  fim: string;
};

type AcaoEscala = 'criada' | 'editada' | 'excluida';

// Avisa quem está (ou estava) na escala sobre designação, remarcação, troca de
// plantonista e cancelamento. Uma troca manda mensagens diferentes para os dois
// lados: quem saiu precisa saber que saiu tanto quanto quem entrou.
async function notificarEscalaAlterada(
  acao: AcaoEscala,
  antes: EscalaSnapshot | null,
  depois: EscalaSnapshot | null,
  autorId: string | null,
) {
  const papel = (s: EscalaSnapshot | null, id: string) =>
    s?.membro_id === id ? 'responsável' : s?.ajudante_id === id ? 'ajudante' : null;

  const afetados = new Set<string>();
  for (const s of [antes, depois]) {
    if (!s) continue;
    afetados.add(s.membro_id);
    if (s.ajudante_id) afetados.add(s.ajudante_id);
  }
  if (!afetados.size) return;

  const ids = [...afetados];
  if (autorId && !afetados.has(autorId)) ids.push(autorId);
  const { data: membros, error } = await supabase
    .from('membros')
    .select('id, nome, tel_zap')
    .in('id', ids);
  if (error) {
    console.error('notificarEscalaAlterada: erro ao buscar membros', error);
    return;
  }
  const porId = new Map((membros ?? []).map((m) => [m.id, m]));
  const autor = autorId ? porId.get(autorId) : undefined;

  const periodo = (s: EscalaSnapshot) => `${fmtDataHora(s.inicio)} a ${fmtDataHora(s.fim)}`;
  const nomeDe = (id: string | null | undefined) =>
    id ? (porId.get(id)?.nome ?? 'outro membro') : 'ninguém';

  for (const id of afetados) {
    const m = porId.get(id);
    if (!m) continue;
    const pAntes = papel(antes, id);
    const pDepois = papel(depois, id);
    let msg: string | null = null;

    if (acao === 'criada' && depois && pDepois) {
      msg =
        `Olá, ${m.nome}! Você foi designado(a) como ${pDepois} do plantão de emergência ` +
        `de ${periodo(depois)}.`;
    } else if (acao === 'excluida' && antes && pAntes) {
      msg =
        `Olá, ${m.nome}! O plantão de emergência de ${periodo(antes)}, em que você estava ` +
        `como ${pAntes}, foi cancelado.`;
    } else if (acao === 'editada' && antes && depois) {
      if (pAntes && !pDepois) {
        msg =
          `Olá, ${m.nome}! Você foi retirado(a) do plantão de emergência de ${periodo(antes)} — ` +
          `não é mais o(a) ${pAntes}.`;
      } else if (!pAntes && pDepois) {
        msg =
          `Olá, ${m.nome}! Você assumiu o plantão de emergência de ${periodo(depois)} ` +
          `como ${pDepois}.`;
      } else if (pAntes && pDepois) {
        const mudancas: string[] = [];
        if (antes.inicio !== depois.inicio || antes.fim !== depois.fim) {
          mudancas.push(`horário: era ${periodo(antes)}, agora é ${periodo(depois)}`);
        }
        if (pAntes !== pDepois) {
          mudancas.push(`sua função: era ${pAntes}, agora é ${pDepois}`);
        }
        const parceiroAntes = pAntes === 'responsável' ? antes.ajudante_id : antes.membro_id;
        const parceiroDepois = pDepois === 'responsável' ? depois.ajudante_id : depois.membro_id;
        if (parceiroAntes !== parceiroDepois) {
          mudancas.push(`dupla: era ${nomeDe(parceiroAntes)}, agora é ${nomeDe(parceiroDepois)}`);
        }
        if (mudancas.length) {
          msg =
            `Olá, ${m.nome}! Seu plantão de emergência foi alterado:\n` +
            mudancas.map((c) => `• ${c}`).join('\n');
        }
      }
    }

    if (!msg) continue;
    // Quem mexeu não precisa ser avisado de que mexeu.
    if (autor && autor.id !== id) msg += `\n\nAlteração feita por ${autor.nome}.`;
    await enviarWhatsapp(m.tel_zap, msg);
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
    if (!(await reivindicar(e.id, 'lembrete_enviado_em', agora))) continue;
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
  }

  for (const e of iniciando ?? []) {
    if (!(await reivindicar(e.id, 'inicio_enviado_em', agora))) continue;
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
  }
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('unauthorized', { status: 401 });
  }

  let body: {
    evento?: string;
    casoId?: string;
    acao?: AcaoEscala;
    antes?: EscalaSnapshot | null;
    depois?: EscalaSnapshot | null;
    autorId?: string | null;
  };
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
    } else if (body.evento === 'escala_alterada' && body.acao) {
      await notificarEscalaAlterada(
        body.acao,
        body.antes ?? null,
        body.depois ?? null,
        body.autorId ?? null,
      );
    } else {
      return new Response('evento desconhecido', { status: 400 });
    }
  } catch (err) {
    console.error('enviar-wapi falhou', err);
    return new Response('erro interno', { status: 500 });
  }

  return new Response('ok');
});
