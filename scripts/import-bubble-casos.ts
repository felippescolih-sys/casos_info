/**
 * Importa os casos (REG_CASO) do Bubble para public.casos.
 *
 *   npm run import:casos -- --dry-run          # não grava; contagem + amostra + ajudantes sem match
 *   npm run import:casos                        # importa todos
 *   npm run import:casos -- --only-open         # só status Aberto
 *   npm run import:casos -- --since=2025-01-01  # só Modified Date >= data
 *
 * .env.import: BUBBLE_API_BASE, BUBBLE_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { admin, env } from './_env.ts';

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_OPEN = process.argv.includes('--only-open');
const SINCE = process.argv.find((a) => a.startsWith('--since='))?.slice(8);

type Bubble = Record<string, unknown>;

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos (marcas combinantes)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const bool = (v: unknown) => (typeof v === 'boolean' ? v : null);
const ts = (v: unknown) => {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

function tipoAtendimento(r: Bubble): string | null {
  if (r['Tipo_atend_part'] === true) return 'particular';
  if (r['Tipo_atend_plano'] === true) return 'plano';
  if (r['Tipo_atend_pub'] === true) return 'publico';
  return null;
}

function exames(r: Bubble) {
  const out: Array<Record<string, string>> = [];
  for (const i of [1, 2, 3]) {
    const e = {
      data: str(r[`Ex_data_hora${i}`]),
      hb: str(r[`Ex_HB_${i}`]),
      ht: str(r[`Ex_HT_${i}`]),
      plq: str(r[`Ex_PLQ_${i}`]),
      outro: str(r[`Ex_OUTRO_${i}`]),
    };
    if (Object.values(e).some(Boolean)) {
      out.push(Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as Record<string, string>);
    }
  }
  return out;
}

function mapStatus(v: unknown): 'aberto' | 'encerrado' {
  const s = String(v ?? '').trim().toLowerCase();
  if (s === 'aberto') return 'aberto';
  if (s === 'encerrado') return 'encerrado';
  if (s) console.warn(`  status desconhecido "${v}" → encerrado`);
  return 'encerrado';
}

async function fetchAll(): Promise<Bubble[]> {
  const base = env.bubbleBase();
  const token = env.bubbleToken();
  const constraints: unknown[] = [];
  if (ONLY_OPEN)
    constraints.push({ key: 'status', constraint_type: 'equals', value: 'Aberto' });
  if (SINCE)
    constraints.push({ key: 'Modified Date', constraint_type: 'greater than', value: SINCE });
  const cQuery = constraints.length
    ? `&constraints=${encodeURIComponent(JSON.stringify(constraints))}`
    : '';

  const all: Bubble[] = [];
  let cursor = 0;
  for (;;) {
    const res = await fetch(`${base}/REG_CASO?cursor=${cursor}&limit=100${cQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Bubble ${res.status}: ${await res.text()}`);
    const j = (await res.json()) as {
      response: { results: Bubble[]; remaining: number; count: number };
    };
    all.push(...j.response.results);
    process.stdout.write(`\r  buscando… ${all.length}`);
    if (j.response.remaining <= 0) break;
    cursor += j.response.count;
  }
  process.stdout.write('\n');
  return all;
}

// ── membros: mapas de resolução ────────────────────────────────
const sb = admin();
const { data: membros, error: mErr } = await sb
  .from('membros')
  .select('id, nome, legacy_bubble_id');
if (mErr) throw mErr;

const byBubbleId = new Map<string, string>();
const byNome = new Map<string, string>();
const nomeAmbiguo = new Set<string>();
for (const m of membros ?? []) {
  if (m.legacy_bubble_id) byBubbleId.set(m.legacy_bubble_id, m.id);
  const n = norm(m.nome);
  if (byNome.has(n)) nomeAmbiguo.add(n);
  else byNome.set(n, m.id);
}
const resolveNome = (t: string | null) => {
  if (!t) return null;
  const n = norm(t);
  return nomeAmbiguo.has(n) ? null : (byNome.get(n) ?? null);
};

// ── busca ──────────────────────────────────────────────────────
console.log('Buscando casos no Bubble…');
const casos = await fetchAll();
console.log(`Total: ${casos.length}`);

const semAjudante = new Set<string>();

function toRow(r: Bubble) {
  const ajudanteNome = str(r['Membro_ajudte']);
  const ajudanteId = resolveNome(ajudanteNome);
  if (ajudanteNome && ajudanteNome !== 'x' && !ajudanteId) semAjudante.add(ajudanteNome);

  return {
    legacy_bubble_id: r['_id'] as string,
    id_caso: str(r['id_caso']),
    numero: typeof r['number_case'] === 'number' ? r['number_case'] : null,
    status: mapStatus(r['status']),

    paciente_nome: str(r['Nome_paciente']),
    idade: str(r['Idade']),
    sexo: str(r['Sexo']),
    uf: str(r['UF']),
    cidade: str(r['cidade']),
    congregacao: str(r['Congregacao']),
    batizado: bool(r['Batizado']),
    mae_batizada: bool(r['Mae_batizada']),
    pai_batizado: bool(r['Pai_batizado']),
    nome_mae: str(r['Nome_mae']),
    nome_pai: str(r['Nome_pai']),

    hospital_nome: str(r['Nome_hospital']),
    num_quarto: str(r['Num_quarto']),
    tele_hospital: str(r['Tele_hospital']),
    plano_nome: str(r['Nome_plano']),
    tipo_atendimento: tipoAtendimento(r),

    responsavel_id: byBubbleId.get(String(r['id_Membro_responsb'] ?? '')) ?? null,
    responsavel_nome: str(r['Membro_respons']),
    ajudante_id: ajudanteId,
    ajudante_nome: ajudanteNome,
    gvp_id: byBubbleId.get(String(r['membroGVP'] ?? '')) ?? null,
    criado_por_id: byBubbleId.get(String(r['Created By'] ?? '')) ?? null,

    nome_telefonou: str(r['Nome_telefonou']),
    parentesco_telefonou: str(r['Parent_c_pac']),
    paciente_solicitou_ajuda: bool(r['Not_pac_sol_ajuda']),
    acompanhante_nome: str(r['nomeAcompanhante']),
    telefone_paciente: str(r['telefonePaciente']),
    telefone_acompanhante: str(r['telefoneAcompanhante']),
    anciaos_contatados: str(r['Anciaos_contatados']),
    anciaos_cont_tel: str(r['Anciaos_cont_tel']),

    medico_responsavel: str(r['Med_responsavel']),
    especialidade: str(r['Espec_med_respo']),
    morbidade: str(r['Info_add_Morbidade']),
    info_medica: str(r['Info_med_caso']),
    plano_tratamento: str(r['Plano_trat_med']),
    estrategia: str(r['Estrat_opç']),
    artigos_medicos: str(r['Art_medicos']),
    resumo: str(r['Res_Resumo']),
    outras_infos: str(r['Info_add_outras_infos_nec']),

    exames: exames(r),
    anexos_urls: list(r['Info_add_exames']).map((u) => (u.startsWith('//') ? `https:${u}` : u)),

    em_transferencia: bool(r['Em_tranfer']),
    transferencia_data: ts(r['Em_transfer_data']),
    transferencia_historico: str(r['Em_transfer_historico']),
    transpac: bool(r['Info_add_Transpac']),
    transfundido: bool(r['Info_add_Transfu']),

    gvp: bool(r['gvp']),
    tags: list(r['Info_add_tags']),

    aberto_em: ts(r['Created Date']),
    encerrado_em: ts(r['Data_encerramento']),
    atualizado_em_bubble: ts(r['Modified Date']),

    bubble_raw: r,
  };
}

const rows = casos.filter((r) => r['_id']).map(toRow);

if (DRY_RUN) {
  const porStatus = rows.reduce<Record<string, number>>((a, r) => {
    a[r.status] = (a[r.status] ?? 0) + 1;
    return a;
  }, {});
  console.log('\npor status:', porStatus);
  console.log('sem responsavel_id:', rows.filter((r) => !r.responsavel_id).length);
  console.log('\namostra (5):');
  for (const r of rows.slice(0, 5)) {
    console.log(
      `  ${r.id_caso} | ${r.status} | pac=${r.paciente_nome} | resp=${r.responsavel_nome} (${r.responsavel_id ? 'ok' : 'sem id'}) | hosp=${r.hospital_nome}`,
    );
  }
  console.log(`\nMembro_ajudte sem match (${semAjudante.size}):`, [...semAjudante].slice(0, 40));
  console.log(`\nTotal a importar: ${rows.length}. Nada gravado.`);
  process.exit(0);
}

// ── upsert em lotes ────────────────────────────────────────────
const BATCH = 500;
let ok = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const slice = rows.slice(i, i + BATCH);
  const { error } = await sb.from('casos').upsert(slice, { onConflict: 'legacy_bubble_id' });
  if (error) {
    console.error(`✗ lote ${i}-${i + slice.length}: ${error.message}`);
    process.exit(1);
  }
  ok += slice.length;
  process.stdout.write(`\r  gravados ${ok}/${rows.length}`);
}
process.stdout.write('\n');
console.log(`✓ ${ok} casos importados. Ajudantes sem match: ${semAjudante.size}.`);
