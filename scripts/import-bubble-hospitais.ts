/**
 * Importa os hospitais/UPAs (Hospitais) do Bubble para public.hospitais.
 * Upsert por legacy_bubble_id (idempotente).
 *
 *   npm run import:hospitais -- --dry-run
 *   npm run import:hospitais
 *
 * .env.import: BUBBLE_API_BASE, BUBBLE_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { admin, env } from './_env.ts';

const DRY_RUN = process.argv.includes('--dry-run');

type Bubble = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

async function fetchAll(): Promise<Bubble[]> {
  const base = env.bubbleBase();
  const token = env.bubbleToken();
  const all: Bubble[] = [];
  let cursor = 0;
  for (;;) {
    const res = await fetch(`${base}/Hospitais?cursor=${cursor}&limit=100`, {
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

function toRow(r: Bubble) {
  return {
    legacy_bubble_id: r['_id'] as string,
    nome: str(r['nome_hospital']),
    endereco: str(r['endereço']),
    bairro: str(r['bairro']),
    cidade: str(r['cidade']),
    telefone: str(r['telefone']),
    ativo: true,
  };
}

console.log('Buscando hospitais no Bubble…');
const registros = await fetchAll();
console.log(`Total: ${registros.length}`);

const semNome = new Set<string>();
const porNome = new Map<string, ReturnType<typeof toRow>>();
for (const r of registros) {
  const row = toRow(r);
  if (!row.nome) {
    semNome.add(row.legacy_bubble_id);
    continue;
  }
  // Bubble tem duplicatas de nome (ex.: mesmo hospital cadastrado 2x) — mantém o registro
  // mais recente (por ordem de chegada, já que a API não está ordenada por data aqui).
  porNome.set(row.nome, row);
}
const rows = [...porNome.values()];

console.log(`\nsem nome (ignorados): ${semNome.size}`);
console.log(`nomes únicos a importar: ${rows.length} (de ${registros.length} registros)`);
console.log('\namostra (5):');
for (const r of rows.slice(0, 5)) {
  console.log(`  ${r.nome} | ${r.cidade ?? '—'} | ${r.telefone ?? '—'}`);
}

if (DRY_RUN) {
  console.log('\nNada gravado (--dry-run).');
  process.exit(0);
}

const sb = admin();
const BATCH = 200;
let ok = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const slice = rows.slice(i, i + BATCH);
  const { error } = await sb.from('hospitais').upsert(slice, { onConflict: 'legacy_bubble_id' });
  if (error) {
    console.error(`✗ lote ${i}-${i + slice.length}: ${error.message}`);
    process.exit(1);
  }
  ok += slice.length;
  process.stdout.write(`\r  gravados ${ok}/${rows.length}`);
}
process.stdout.write('\n');
console.log(`✓ ${ok} hospitais importados.`);
