/**
 * Importa os membros (tipo `User`) do Bubble para auth.users + public.membros.
 *
 *   npm run import:membros -- --dry-run      # não escreve nada; lista o mapeamento e os valores de nivelacesso
 *   npm run import:membros                   # cria as contas (status = ativo)
 *   npm run import:membros -- --send-invites # + gera link de definição de senha
 *
 * .env.import precisa de: BUBBLE_API_BASE, BUBBLE_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { randomBytes } from 'node:crypto';
import { admin, env } from './_env.ts';
import type { Area, FuncaoNivel } from '../src/types/database.ts';

const DRY_RUN = process.argv.includes('--dry-run');
const SEND_INVITES = process.argv.includes('--send-invites');

interface BubbleUser {
  _id: string;
  email?: string;
  authentication?: { email?: { email?: string } };
  nome?: string;
  tel_zap?: string;
  telres?: string;
  telcomercial?: string;
  congregaçao?: string;
  congregacao?: string;
  especialidade?: string;
  nomeesposa?: string;
  telesposa?: string;
  reunioes?: string;
  ult_acesso?: string;
  ferias?: boolean;
  nivelacesso?: string;
}

/**
 * Mapa `nivelacesso` (texto livre do Bubble) → função por área.
 * Decisão (07/09/2026): ignorar o nivelacesso. Todos os membros entram SEM função;
 * as funções por área são atribuídas manualmente no app depois.
 */
function mapFuncao(_nivelacesso: string | undefined): { area: Area; nivel: FuncaoNivel } | null {
  return null;
}

function emailOf(u: BubbleUser): string | null {
  return (u.email ?? u.authentication?.email?.email ?? '').trim().toLowerCase() || null;
}

async function fetchAllBubbleUsers(): Promise<BubbleUser[]> {
  const base = env.bubbleBase();
  const token = env.bubbleToken();
  const all: BubbleUser[] = [];
  let cursor = 0;
  for (;;) {
    const url = `${base}/user?cursor=${cursor}&limit=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Bubble ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as {
      response: { results: BubbleUser[]; remaining: number; count: number };
    };
    all.push(...json.response.results);
    if (json.response.remaining <= 0) break;
    cursor += json.response.count;
  }
  return all;
}

const users = await fetchAllBubbleUsers();
console.log(`\nBubble: ${users.length} usuários.`);

const niveis = new Map<string, number>();
for (const u of users) {
  const k = (u.nivelacesso ?? '(vazio)').trim() || '(vazio)';
  niveis.set(k, (niveis.get(k) ?? 0) + 1);
}
console.log('\nValores de nivelacesso encontrados:');
for (const [k, n] of [...niveis].sort((a, b) => b[1] - a[1])) {
  const f = mapFuncao(k === '(vazio)' ? undefined : k);
  console.log(`  ${k.padEnd(12)} → ${n}\t(função: ${f ? `${f.area}/${f.nivel}` : 'nenhuma'})`);
}

const semEmail = users.filter((u) => !emailOf(u));
if (semEmail.length) console.log(`\n⚠ ${semEmail.length} usuários sem e-mail — serão ignorados.`);

const importaveis = users.filter((u) => emailOf(u));

if (DRY_RUN) {
  console.log('\n--dry-run: amostra do mapeamento (primeiros 10):');
  for (const u of importaveis.slice(0, 10)) {
    const f = mapFuncao(u.nivelacesso);
    console.log(
      `  ${emailOf(u)} | ${u.nome ?? '(sem nome)'} | ${f ? `${f.area}/${f.nivel}` : 'sem função'} | zap=${u.tel_zap ?? '-'}`,
    );
  }
  console.log(`\nTotal a importar: ${importaveis.length}. Nada foi gravado.`);
  process.exit(0);
}

const sb = admin();
const { data: existing, error: listErr } = await sb.auth.admin.listUsers({ perPage: 10000 });
if (listErr) throw listErr;
const byEmail = new Map(existing.users.map((u) => [u.email?.toLowerCase(), u.id]));

let criados = 0;
let atualizados = 0;
let funcoes = 0;
let convites = 0;

for (const u of importaveis) {
  const email = emailOf(u)!;
  const congregacao = u.congregaçao ?? u.congregacao ?? null;
  const meta = {
    nome: u.nome ?? email.split('@')[0],
    tel_zap: u.tel_zap ?? null,
    congregacao,
    especialidade: u.especialidade ?? null,
  };

  let userId = byEmail.get(email);
  if (!userId) {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      email_confirm: true,
      password: randomBytes(18).toString('base64url'),
      user_metadata: meta,
    });
    if (error) {
      console.error(`✗ ${email}: ${error.message}`);
      continue;
    }
    userId = data.user.id;
    byEmail.set(email, userId);
    criados++;
  }

  const { error: upErr } = await sb.from('membros').upsert(
    {
      id: userId,
      email,
      nome: meta.nome,
      status: 'ativo',
      tel_zap: u.tel_zap ?? null,
      tel_residencial: u.telres ?? null,
      tel_comercial: u.telcomercial ?? null,
      congregacao,
      especialidade: u.especialidade ?? null,
      reunioes: u.reunioes ?? null,
      nome_esposa: u.nomeesposa ?? null,
      tel_esposa: u.telesposa ?? null,
      ferias: Boolean(u.ferias),
      ult_acesso: u.ult_acesso ?? null,
      legacy_bubble_id: u._id,
      aprovado_em: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );
  if (upErr) {
    console.error(`✗ membros ${email}: ${upErr.message}`);
    continue;
  }
  atualizados++;

  const f = mapFuncao(u.nivelacesso);
  if (f) {
    const { error: fErr } = await sb
      .from('membro_funcoes')
      .upsert(
        { membro_id: userId, area: f.area, nivel: f.nivel },
        { onConflict: 'membro_id,area' },
      );
    if (fErr) console.error(`✗ função ${email}: ${fErr.message}`);
    else funcoes++;
  }

  if (SEND_INVITES) {
    const { error } = await sb.auth.admin.generateLink({ type: 'recovery', email });
    if (!error) convites++;
  }
}

console.log(
  `\n✓ Concluído. auth users criados: ${criados}, linhas membros: ${atualizados}, funções: ${funcoes}` +
    (SEND_INVITES ? `, convites: ${convites}` : ''),
);
if (!SEND_INVITES) {
  console.log('Dica: rode de novo com --send-invites para os membros definirem a própria senha.');
}
