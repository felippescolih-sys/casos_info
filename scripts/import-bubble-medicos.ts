/**
 * Importa os médicos colaboradores (Data Type `medicos`) do Bubble para public.medicos.
 * Upsert por legacy_bubble_id. Rode import:especialidades antes (resolve a FK).
 *
 *   npm run import:medicos -- --dry-run
 *   npm run import:medicos
 */
import { admin, env } from './_env.ts';

const DRY_RUN = process.argv.includes('--dry-run');

type Bubble = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const bool = (v: unknown) => (typeof v === 'boolean' ? v : null);
const num = (v: unknown) => (typeof v === 'number' ? v : null);
const foto = (v: unknown) => {
  const s = str(v);
  if (!s) return null;
  return s.startsWith('//') ? `https:${s}` : s;
};
const dataDate = (v: unknown) => {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

async function fetchAll(): Promise<Bubble[]> {
  const base = env.bubbleBase();
  const token = env.bubbleToken();
  const all: Bubble[] = [];
  let cursor = 0;
  for (;;) {
    const res = await fetch(`${base}/medicos?cursor=${cursor}&limit=100`, {
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

console.log('Buscando médicos colaboradores no Bubble…');
const registros = await fetchAll();
console.log(`Total: ${registros.length}`);

const semEspecialidade = new Set<string>();

function toRow(r: Bubble) {
  const especId = r['especialidade'] ? espPorBubbleId.get(String(r['especialidade'])) : undefined;
  if (r['especialidade'] && !especId) semEspecialidade.add(String(r['especialidade']));
  return {
    legacy_bubble_id: r['_id'] as string,
    nome: str(r['nome']),
    foto_url: foto(r['foto']),
    crm_uf: str(r['CRM_UF']),
    email: str(r['e-mail']),
    membro_indicacao: str(r['membro']),
    especialidade_id: especId ?? null,
    subespecialidade: str(r['Subespecialidade']),
    rating: num(r['rating']),
    infos_add: str(r['infos_add']),
    sus: bool(r['sus']),
    convenio: bool(r['convenio']),
    particular: bool(r['particular']),
    telemedicina: bool(r['telemedicina']),
    medico_tj: bool(r['medico_tj']),
    pediatria: bool(r['pediatria']),
    atend_consult: bool(r['atend_consult']),
    primeira_visita: bool(r['prim visita']),
    revisita: bool(r['revisita']),
    tel_consultorio: str(r['tel_consultorio']),
    tel_secretaria: str(r['tel secretaria']),
    tel_confidencial: str(r['tel_confidencial']),
    nome_secretaria: str(r['nome_secre']),
    endereco_consultorio: str(r['endereco consulto']),
    hospitais_atua: str(r['hospitais_atua']),
    end_hospital: str(r['end_hospital']),
    acompanhante: str(r['acompanhante']),
    ultima_visita: dataDate(r['ultima_visita']),
    ativo: true,
  };
}

const rows = registros.map(toRow).filter((r) => r.nome) as Array<
  ReturnType<typeof toRow> & { nome: string }
>;

console.log(`\nsem nome (ignorados): ${registros.length - rows.length}`);
console.log(`sem especialidade resolvida: ${semEspecialidade.size}`, [...semEspecialidade]);
console.log(`válidos a importar: ${rows.length}`);
console.log('\namostra (5):');
for (const r of rows.slice(0, 5)) {
  console.log(`  ${r.nome} | rating=${r.rating ?? '—'} | esp=${r.especialidade_id ?? '—'}`);
}

if (DRY_RUN) {
  console.log('\nNada gravado (--dry-run).');
} else {
  const BATCH = 100;
  let ok = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error } = await sb.from('medicos').upsert(slice, { onConflict: 'legacy_bubble_id' });
    if (error) {
      console.error(`✗ lote ${i}-${i + slice.length}: ${error.message}`);
      process.exitCode = 1;
      break;
    }
    ok += slice.length;
    process.stdout.write(`\r  gravados ${ok}/${rows.length}`);
  }
  process.stdout.write('\n');
  if (!process.exitCode) console.log(`✓ ${ok} médicos colaboradores importados.`);
}
