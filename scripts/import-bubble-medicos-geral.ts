/**
 * Importa os médicos prospectivos (Data Type `medicos_geral`) do Bubble para
 * public.medicos_geral. Upsert por legacy_bubble_id. Rode import:especialidades antes.
 *
 *   npm run import:medicos-geral -- --dry-run
 *   npm run import:medicos-geral
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
    const res = await fetch(`${base}/medicos_geral?cursor=${cursor}&limit=100`, {
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

const sb = admin();
const { data: especialidades, error: eErr } = await sb
  .from('especialidades_medicas')
  .select('id, legacy_bubble_id');
if (eErr) throw eErr;
const espPorBubbleId = new Map(
  (especialidades ?? []).filter((e) => e.legacy_bubble_id).map((e) => [e.legacy_bubble_id!, e.id]),
);

console.log('Buscando médicos prospectivos no Bubble…');
const registros = await fetchAll();
console.log(`Total: ${registros.length}`);

function toRow(r: Bubble) {
  const especId = r['Especialidade'] ? espPorBubbleId.get(String(r['Especialidade'])) : undefined;
  return {
    legacy_bubble_id: r['_id'] as string,
    nome: str(r['Nome']),
    crm_uf: str(r['CRM_UF']),
    especialidade_id: especId ?? null,
  };
}

// Bubble tem duplicatas de nome em medicos_geral (lista não curada) — mantém todas,
// só o nome precisa existir; não há unique constraint em nome aqui (diferente de hospitais).
const rows = registros.map(toRow).filter((r) => r.nome) as Array<
  ReturnType<typeof toRow> & { nome: string }
>;

console.log(`\nsem nome (ignorados): ${registros.length - rows.length}`);
console.log(`válidos a importar: ${rows.length}`);
console.log('\namostra (5):', rows.slice(0, 5).map((r) => r.nome));

if (DRY_RUN) {
  console.log('\nNada gravado (--dry-run).');
} else {
  const BATCH = 200;
  let ok = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error } = await sb
      .from('medicos_geral')
      .upsert(slice, { onConflict: 'legacy_bubble_id' });
    if (error) {
      console.error(`✗ lote ${i}-${i + slice.length}: ${error.message}`);
      process.exitCode = 1;
      break;
    }
    ok += slice.length;
    process.stdout.write(`\r  gravados ${ok}/${rows.length}`);
  }
  process.stdout.write('\n');
  if (!process.exitCode) console.log(`✓ ${ok} médicos prospectivos importados.`);
}
