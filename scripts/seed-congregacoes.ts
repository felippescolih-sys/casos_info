/**
 * Semeia public.congregacoes a partir de congregacoes.txt (uma congregação por linha).
 * Idempotente (upsert por nome). Marca como inativa as que não estão mais no arquivo.
 *
 *   npm run seed:congregacoes [-- --dry-run]
 */
import { readFileSync } from 'node:fs';
import { admin } from './_env.ts';

const DRY = process.argv.includes('--dry-run');

const nomes = [
  ...new Set(
    readFileSync('congregacoes.txt', 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  ),
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

console.log(`${nomes.length} congregações no arquivo.`);
if (DRY) {
  console.log(nomes.slice(0, 10).join('\n'), '\n…');
  process.exit(0);
}

const sb = admin();

const { error: upErr } = await sb
  .from('congregacoes')
  .upsert(
    nomes.map((nome) => ({ nome, ativa: true })),
    { onConflict: 'nome' },
  );
if (upErr) throw upErr;

// desativa as que sumiram do arquivo (não deleta — casos antigos podem referenciar)
const { data: todas } = await sb.from('congregacoes').select('nome');
const setArquivo = new Set(nomes);
const removidas = (todas ?? []).map((r) => r.nome).filter((n) => !setArquivo.has(n));
if (removidas.length) {
  await sb.from('congregacoes').update({ ativa: false }).in('nome', removidas);
}

console.log(`✓ ${nomes.length} ativas, ${removidas.length} marcadas como inativas.`);
