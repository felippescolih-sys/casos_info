import { supabase } from '@/lib/supabase';
import type { HospitalInsert, HospitalRow, HospitalUpdate } from '@/types/database';

/** Nomes dos hospitais ativos, pro autocomplete do campo "Nome do hospital" do caso. */
export async function listHospitaisNomes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('hospitais')
    .select('nome')
    .eq('ativo', true)
    .order('nome');
  if (error) throw error;
  return (data ?? []).map((r) => r.nome);
}

export interface HospitaisFilter {
  search?: string;
}

export async function listHospitais(filter: HospitaisFilter = {}): Promise<HospitalRow[]> {
  let query = supabase.from('hospitais').select('*').order('nome');
  if (filter.search?.trim()) {
    const term = `%${filter.search.trim()}%`;
    query = query.or(`nome.ilike.${term},cidade.ilike.${term},bairro.ilike.${term}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getHospital(id: string): Promise<HospitalRow | null> {
  const { data, error } = await supabase.from('hospitais').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function criarHospital(payload: HospitalInsert): Promise<HospitalRow> {
  const { data, error } = await supabase.from('hospitais').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function atualizarHospital(id: string, patch: HospitalUpdate): Promise<HospitalRow> {
  const { data, error } = await supabase
    .from('hospitais')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function excluirHospital(id: string): Promise<void> {
  const { error } = await supabase.from('hospitais').delete().eq('id', id);
  if (error) throw error;
}
