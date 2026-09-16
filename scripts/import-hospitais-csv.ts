/**
 * Importa hospitais/UPAs a partir de um CSV exportado do Bubble (Data > All Hospitaiss > Export).
 * Upsert por nome (idempotente). Não desativa quem sumiu do arquivo — hospital é cadastro manual,
 * diferente de congregações.
 *
 *   npm run import:hospitais -- caminho/do/arquivo.csv [--dry-run]
 *
 * Aceita várias variações de cabeçalho (acentos/maiúsculas/nomes do Bubble tipo "nome_hospital").
 */
import { readFileSync } from 'node:fs';
import { admin } from './_env.ts';

const DRY_RUN = process.argv.includes('--dry-run');
const file = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Uso: npm run import:hospitais -- caminho/do/arquivo.csv [--dry-run]');
  process.exit(1);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // ignora
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim()));
}

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const HEADER_MAP: Record<string, string> = {
  nomehospital: 'nome',
  nome: 'nome',
  hospital: 'nome',
  endereco: 'endereco',
  endereo: 'endereco', // "Endereço" sem cedilha após normalização
  enderecohospital: 'endereco',
  bairro: 'bairro',
  cidade: 'cidade',
  telefone: 'telefone',
  telefonehospital: 'telefone',
  foneuti: 'fone_uti',
  telefoneuti: 'fone_uti',
  emailhosp: 'email',
  email: 'email',
  website: 'website',
  site: 'website',
  uniqueid: 'legacy_bubble_id',
  id: 'legacy_bubble_id',
  _id: 'legacy_bubble_id',
};

const raw = readFileSync(file, 'utf8');
const rows = parseCsv(raw);
if (!rows.length) {
  console.error('Arquivo vazio.');
  process.exit(1);
}

const header = rows[0].map((h) => HEADER_MAP[norm(h)] ?? null);
const nomeCol = header.indexOf('nome');
if (nomeCol === -1) {
  console.error(`Não achei a coluna do nome. Cabeçalho lido: ${rows[0].join(' | ')}`);
  process.exit(1);
}

const str = (v: string | undefined) => (v?.trim() ? v.trim() : null);

const registros = rows.slice(1).map((r) => {
  const rec: Record<string, string | null> = {};
  header.forEach((key, i) => {
    if (key) rec[key] = str(r[i]);
  });
  return rec;
});

const validos = registros
  .filter((r) => r.nome)
  .map((r) => ({ ...r, nome: r.nome as string }));
console.log(`${validos.length} hospitais lidos de ${registros.length} linhas.`);

if (DRY_RUN) {
  console.log(validos.slice(0, 5));
  process.exit(0);
}

const sb = admin();
const BATCH = 200;
let ok = 0;
for (let i = 0; i < validos.length; i += BATCH) {
  const slice = validos.slice(i, i + BATCH).map((r) => ({ ...r, ativo: true }));
  const { error } = await sb.from('hospitais').upsert(slice, { onConflict: 'nome' });
  if (error) {
    console.error(`✗ lote ${i}-${i + slice.length}: ${error.message}`);
    process.exit(1);
  }
  ok += slice.length;
}
console.log(`✓ ${ok} hospitais importados.`);
