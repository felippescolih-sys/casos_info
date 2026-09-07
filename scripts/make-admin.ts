/**
 * Dá a um membro uma função de área (padrão: Administração geral / admin)
 * e o marca como ativo. Use para o primeiro admin — depois isso é feito pela UI.
 *
 *   npm run make:admin -- felippe@exemplo.com
 *   npm run make:admin -- fulano@exemplo.com gvps ajudante
 *
 * Áreas: geral | apresentacoes | gvps | especialidades | facilitadores | medicos
 * Níveis: admin | ajudante
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.import.
 */
import { admin } from './_env.ts';
import type { Area, FuncaoNivel } from '../src/types/database.ts';

const AREAS = ['geral', 'apresentacoes', 'gvps', 'especialidades', 'facilitadores', 'medicos'];

const email = process.argv[2];
const area = (process.argv[3] ?? 'geral') as Area;
const nivel = (process.argv[4] ?? 'admin') as FuncaoNivel;

if (!email) {
  console.error('Uso: npm run make:admin -- <email> [area] [admin|ajudante]');
  process.exit(1);
}
if (!AREAS.includes(area)) {
  console.error(`Área inválida: ${area}. Use uma de: ${AREAS.join(', ')}`);
  process.exit(1);
}
if (!['admin', 'ajudante'].includes(nivel)) {
  console.error(`Nível inválido: ${nivel}`);
  process.exit(1);
}

const sb = admin();

const { data: list, error: listErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
if (listErr) throw listErr;

const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error(`✗ Nenhum usuário com e-mail ${email}. Cadastre-se pelo app primeiro.`);
  process.exit(1);
}

const { error: statusErr } = await sb
  .from('membros')
  .update({ status: 'ativo', aprovado_em: new Date().toISOString() })
  .eq('id', user.id);
if (statusErr) throw statusErr;

const { error: funcErr } = await sb
  .from('membro_funcoes')
  .upsert(
    { membro_id: user.id, area, nivel, criado_por: user.id },
    { onConflict: 'membro_id,area' },
  );
if (funcErr) throw funcErr;

console.log(`✓ ${email}: ativo + função ${area}/${nivel}.`);
