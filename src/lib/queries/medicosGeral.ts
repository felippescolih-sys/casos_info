import { supabase } from '@/lib/supabase';
import type { MedicoGeralInsert, MedicoGeralRow, MedicoGeralUpdate } from '@/types/database';

export interface MedicosGeralFilter {
  search?: string;
}

const SELECT_COM_ESPECIALIDADE = '*, especialidade:especialidades_medicas(id, nome)';

export type MedicoGeralComEspecialidade = MedicoGeralRow & {
  especialidade: { id: string; nome: string } | null;
};

export async function listMedicosGeral(
  filter: MedicosGeralFilter = {},
): Promise<MedicoGeralComEspecialidade[]> {
  let query = supabase.from('medicos_geral').select(SELECT_COM_ESPECIALIDADE).order('nome');
  if (filter.search?.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`nome.ilike.${term},crm_uf.ilike.${term}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as MedicoGeralComEspecialidade[];
}

/** Nomes dos médicos prospectivos, pro autocomplete no cadastro de caso. */
export async function listMedicosGeralNomes(): Promise<string[]> {
  const { data, error } = await supabase.from('medicos_geral').select('nome').order('nome');
  if (error) throw error;
  return (data ?? []).map((r) => r.nome);
}

export async function criarMedicoGeral(payload: MedicoGeralInsert): Promise<MedicoGeralRow> {
  const { data, error } = await supabase
    .from('medicos_geral')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarMedicoGeral(
  id: string,
  patch: MedicoGeralUpdate,
): Promise<MedicoGeralRow> {
  const { data, error } = await supabase
    .from('medicos_geral')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function excluirMedicoGeral(id: string): Promise<void> {
  const { error } = await supabase.from('medicos_geral').delete().eq('id', id);
  if (error) throw error;
}
