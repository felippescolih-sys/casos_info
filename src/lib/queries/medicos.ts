import { supabase } from '@/lib/supabase';
import { normalize } from '@/lib/text';
import type { MedicoInsert, MedicoRow, MedicoUpdate } from '@/types/database';

export interface MedicosFilter {
  search?: string;
  especialidadeId?: string | 'todas';
}

const SELECT_COM_ESPECIALIDADE = '*, especialidade:especialidades_medicas(id, nome)';

export type MedicoComEspecialidade = MedicoRow & {
  especialidade: { id: string; nome: string } | null;
};

export async function listMedicos(filter: MedicosFilter = {}): Promise<MedicoComEspecialidade[]> {
  let query = supabase
    .from('medicos')
    .select(SELECT_COM_ESPECIALIDADE)
    .eq('ativo', true)
    .order('nome');
  if (filter.search?.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`nome.ilike.${term},crm_uf.ilike.${term},subespecialidade.ilike.${term}`);
  }
  if (filter.especialidadeId && filter.especialidadeId !== 'todas') {
    query = query.eq('especialidade_id', filter.especialidadeId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as MedicoComEspecialidade[];
}

export async function getMedico(id: string): Promise<MedicoComEspecialidade | null> {
  const { data, error } = await supabase
    .from('medicos')
    .select(SELECT_COM_ESPECIALIDADE)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as MedicoComEspecialidade | null;
}

export async function criarMedico(payload: MedicoInsert): Promise<MedicoRow> {
  const { data, error } = await supabase.from('medicos').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function atualizarMedico(id: string, patch: MedicoUpdate): Promise<MedicoRow> {
  const { data, error } = await supabase
    .from('medicos')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function excluirMedico(id: string): Promise<void> {
  const { error } = await supabase.from('medicos').delete().eq('id', id);
  if (error) throw error;
}

/** Nomes dos médicos colaboradores ativos, pro autocomplete no cadastro de caso. */
export async function listMedicosNomes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('medicos')
    .select('nome')
    .eq('ativo', true)
    .order('nome');
  if (error) throw error;
  return (data ?? []).map((r) => r.nome);
}

/** Total de casos por nome de médico, calculado a partir de casos.medico_responsavel. */
export async function getMedicosTotalCasos(): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('medicos_total_casos');
  if (error) throw error;
  const map = new Map<string, number>();
  for (const r of data ?? []) map.set(normalize(r.nome), Number(r.total));
  return map;
}

export function totalCasosDe(mapa: Map<string, number>, nome: string): number {
  return mapa.get(normalize(nome)) ?? 0;
}
