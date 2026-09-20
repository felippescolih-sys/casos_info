import { supabase } from '@/lib/supabase';
import type {
  Area,
  AreaEspecialidade,
  FuncaoNivel,
  MemberStatus,
  MembroRow,
  MembroUpdate,
} from '@/types/database';

export type MembroComFuncoes = MembroRow & {
  funcoes: Array<{ area: Area; nivel: FuncaoNivel }>;
  especialidades: Array<{ area_especialidade: AreaEspecialidade }>;
};

export interface MembrosFilter {
  status?: MemberStatus | 'todos';
  area?: Area | 'todos';
  search?: string;
}

export interface MembroOpcao {
  id: string;
  nome: string;
}

type MembroFuncaoComMembro = { membro: MembroOpcao };

/** Só membros ativos com função na área COLIH — usado no picker de escala de plantão. */
export async function listMembrosColihAtivos(): Promise<MembroOpcao[]> {
  const { data, error } = await supabase
    .from('membro_funcoes')
    .select('membro:membros!inner(id, nome, status)')
    .eq('area', 'colih')
    .eq('membro.status', 'ativo');
  if (error) throw error;
  const rows = (data ?? []) as unknown as MembroFuncaoComMembro[];
  return rows.map((r) => r.membro).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Confere no banco (mesma regra que bloqueia ao salvar) se o membro está disponível
 * pra plantão no período — ausência registrada + dias da semana + regra de fim de mês. */
export async function membroDisponivelPlantao(
  membroId: string,
  inicio: string,
  fim: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('membro_disponivel_plantao', {
    _membro_id: membroId,
    _inicio: inicio,
    _fim: fim,
  });
  if (error) throw error;
  return data ?? true;
}

// `membro_funcoes` tem 2 FKs pra `membros` (membro_id e criado_por) — precisa
// desambiguar qual relação embutir, senão o PostgREST recusa a query.
const SELECT_COM_FUNCOES =
  '*, funcoes:membro_funcoes!membro_id(area, nivel), especialidades:membro_especialidades(area_especialidade)';

export async function listMembros(filter: MembrosFilter = {}): Promise<MembroComFuncoes[]> {
  let query = supabase
    .from('membros')
    .select(SELECT_COM_FUNCOES)
    .order('nome', { ascending: true });

  if (filter.status && filter.status !== 'todos') query = query.eq('status', filter.status);
  if (filter.search?.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`nome.ilike.${term},email.ilike.${term},congregacao.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as MembroComFuncoes[];
  if (filter.area && filter.area !== 'todos') {
    return rows.filter((m) => m.funcoes.some((f) => f.area === filter.area));
  }
  return rows;
}

export async function getMembro(id: string): Promise<MembroComFuncoes | null> {
  const { data, error } = await supabase
    .from('membros')
    .select(SELECT_COM_FUNCOES)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as MembroComFuncoes) ?? null;
}

export async function updateMembro(id: string, patch: MembroUpdate): Promise<MembroRow> {
  const { data, error } = await supabase
    .from('membros')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function definirStatus(id: string, status: MemberStatus) {
  return updateMembro(id, { status });
}

/** Aprova um cadastro pendente (status = ativo + carimbo). Não atribui função. */
export async function aprovarMembro(id: string, aprovadorId: string) {
  return updateMembro(id, {
    status: 'ativo',
    aprovado_por: aprovadorId,
    aprovado_em: new Date().toISOString(),
  });
}

/** Define (ou remove, se `nivel` = null) a função de um membro numa área. Só admin geral. */
export async function definirFuncao(
  membroId: string,
  area: Area,
  nivel: FuncaoNivel | null,
  criadoPor: string,
) {
  if (nivel === null) {
    const { error } = await supabase
      .from('membro_funcoes')
      .delete()
      .eq('membro_id', membroId)
      .eq('area', area);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('membro_funcoes')
    .upsert({ membro_id: membroId, area, nivel, criado_por: criadoPor }, { onConflict: 'membro_id,area' });
  if (error) throw error;
}

export interface FilaMembro {
  id: string;
  nome: string;
}

type MembroEspecialidadeComMembro = {
  area_especialidade: AreaEspecialidade;
  ordem: number;
  membro: { id: string; nome: string; status: string };
};

/** Quem está na frente da fila de "plantão" hoje (só informativo, não é alvo de transferência). */
export async function getPlantaoAtual(): Promise<FilaMembro | null> {
  const { data, error } = await supabase
    .from('membro_especialidades')
    .select('ordem, membro:membros!inner(id, nome, status)')
    .eq('area_especialidade', 'plantao')
    .eq('membro.status', 'ativo')
    .order('ordem', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const m = (data as unknown as MembroEspecialidadeComMembro).membro;
  return { id: m.id, nome: m.nome };
}

/** Fila de transferência de cada especialidade clínica (exclui "plantão"), em ordem. */
export async function getFilasEspecialidade(
  excluirIds: string[] = [],
): Promise<Partial<Record<AreaEspecialidade, FilaMembro[]>>> {
  const { data, error } = await supabase
    .from('membro_especialidades')
    .select('area_especialidade, ordem, membro:membros!inner(id, nome, status)')
    .neq('area_especialidade', 'plantao')
    .eq('membro.status', 'ativo')
    .order('ordem', { ascending: true });
  if (error) throw error;

  const porArea: Partial<Record<AreaEspecialidade, FilaMembro[]>> = {};
  for (const row of (data ?? []) as unknown as MembroEspecialidadeComMembro[]) {
    if (excluirIds.includes(row.membro.id)) continue;
    (porArea[row.area_especialidade] ??= []).push({ id: row.membro.id, nome: row.membro.nome });
  }
  return porArea;
}

/** Liga/desliga uma especialidade clínica do membro. Um membro pode ter várias ao mesmo tempo. */
export async function definirEspecialidade(
  membroId: string,
  area: AreaEspecialidade,
  ativo: boolean,
) {
  if (!ativo) {
    const { error } = await supabase
      .from('membro_especialidades')
      .delete()
      .eq('membro_id', membroId)
      .eq('area_especialidade', area);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from('membro_especialidades')
    .upsert(
      { membro_id: membroId, area_especialidade: area },
      { onConflict: 'membro_id,area_especialidade' },
    );
  if (error) throw error;
}
