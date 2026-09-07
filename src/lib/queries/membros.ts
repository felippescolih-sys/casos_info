import { supabase } from '@/lib/supabase';
import type {
  Area,
  FuncaoNivel,
  MemberStatus,
  MembroRow,
  MembroUpdate,
} from '@/types/database';

export type MembroComFuncoes = MembroRow & {
  funcoes: Array<{ area: Area; nivel: FuncaoNivel }>;
};

export interface MembrosFilter {
  status?: MemberStatus | 'todos';
  area?: Area | 'todos';
  search?: string;
}

const SELECT_COM_FUNCOES = '*, funcoes:membro_funcoes(area, nivel)';

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
