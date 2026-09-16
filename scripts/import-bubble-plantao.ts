/**
 * Importa a escala de plantão (Data Type `plantao`) do Bubble para public.escalas.
 * Upsert por legacy_bubble_id (idempotente) — roda de novo a qualquer momento pra
 * ressincronizar com o que está no Bubble.
 *
 *   npm run import:plantao -- --dry-run
 *   npm run import:plantao
 *
 * .env.import: BUBBLE_API_BASE, BUBBLE_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { admin, env } from './_env.ts';

const DRY_RUN = process.argv.includes('--dry-run');

type Bubble = Record<string, unknown>;

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const ts = (v: unknown) => {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

async function fetchAll(): Promise<Bubble[]> {
  const base = env.bubbleBase();
  const token = env.bubbleToken();
  const all: Bubble[] = [];
  let cursor = 0;
  for (;;) {
    const res = await fetch(`${base}/plantao?cursor=${cursor}&limit=100`, {
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

// ── membros: mapa de resolução por nome ────────────────────────
const sb = admin();
const { data: membros, error: mErr } = await sb.from('membros').select('id, nome');
if (mErr) throw mErr;

const byNome = new Map<string, string>();
const nomeAmbiguo = new Set<string>();
for (const m of membros ?? []) {
  const n = norm(m.nome);
  if (byNome.has(n)) nomeAmbiguo.add(n);
  else byNome.set(n, m.id);
}
const resolveNome = (t: string | null) => {
  if (!t) return null;
  const n = norm(t);
  return nomeAmbiguo.has(n) ? null : (byNome.get(n) ?? null);
};

console.log('Buscando escala de plantão no Bubble…');
const registros = await fetchAll();
console.log(`Total: ${registros.length}`);

const semMembro = new Set<string>();

function toRow(r: Bubble) {
  const nomeMembro = str(r['membro']);
  const membroId = resolveNome(nomeMembro);
  if (nomeMembro && !membroId) semMembro.add(nomeMembro);
  return {
    legacy_bubble_id: r['_id'] as string,
    membro_id: membroId,
    inicio: ts(r['data']),
    fim: ts(r['data_final']),
  };
}

const rows = registros
  .map(toRow)
  .filter((r): r is typeof r & { membro_id: string; inicio: string; fim: string } =>
    Boolean(r.membro_id && r.inicio && r.fim),
  );

console.log(`\nsem membro resolvido (ignorados): ${semMembro.size}`, [...semMembro]);
console.log(`válidos a importar: ${rows.length} (de ${registros.length} registros)`);
console.log('\namostra (5):');
for (const r of rows.slice(0, 5)) {
  console.log(`  ${r.inicio} → ${r.fim} | membro=${r.membro_id}`);
}

if (DRY_RUN) {
  console.log('\nNada gravado (--dry-run).');
  process.exit(0);
}

const { error } = await sb.from('escalas').upsert(rows, { onConflict: 'legacy_bubble_id' });
if (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
console.log(`✓ ${rows.length} escalas de plantão importadas/atualizadas.`);
