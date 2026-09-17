/**
 * Importa as especialidades médicas (Data Type `especialidade`) do Bubble para
 * public.especialidades_medicas. Upsert por legacy_bubble_id. Roda antes dos
 * imports de medicos/medicos_geral (eles referenciam esta tabela).
 *
 *   npm run import:especialidades -- --dry-run
 *   npm run import:especialidades
 */
import { admin, env } from './_env.ts';

const DRY_RUN = process.argv.includes('--dry-run');

async function fetchAll(): Promise<Record<string, unknown>[]> {
  const base = env.bubbleBase();
  const token = env.bubbleToken();
  const all: Record<string, unknown>[] = [];
  let cursor = 0;
  for (;;) {
    const res = await fetch(`${base}/especialidade?cursor=${cursor}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Bubble ${res.status}: ${await res.text()}`);
    const j = (await res.json()) as {
      response: { results: Record<string, unknown>[]; remaining: number; count: number };
    };
    all.push(...j.response.results);
    if (j.response.remaining <= 0) break;
    cursor += j.response.count;
  }
  return all;
}

console.log('Buscando especialidades no Bubble…');
const registros = await fetchAll();
const rows = registros
  .map((r) => ({
    legacy_bubble_id: r['_id'] as string,
    nome: String(r['nome espe'] ?? '').trim(),
  }))
  .filter((r) => r.nome);

console.log(`${rows.length} especialidades (de ${registros.length} registros).`);
console.log(rows.map((r) => r.nome));

if (DRY_RUN) {
  console.log('\nNada gravado (--dry-run).');
} else {
  const sb = admin();
  const { error } = await sb
    .from('especialidades_medicas')
    .upsert(rows, { onConflict: 'legacy_bubble_id' });
  if (error) {
    console.error(`✗ ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${rows.length} especialidades importadas.`);
  }
}
