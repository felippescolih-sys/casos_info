import { supabase } from '@/lib/supabase';
import type { MembroAusenciaRow } from '@/types/database';

export async function listAusencias(membroId: string): Promise<MembroAusenciaRow[]> {
  const { data, error } = await supabase
    .from('membro_ausencias')
    .select('*')
    .eq('membro_id', membroId)
    .order('inicio', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function criarAusencia(
  membroId: string,
  inicio: string,
  fim: string,
): Promise<MembroAusenciaRow> {
  const { data, error } = await supabase
    .from('membro_ausencias')
    .insert({ membro_id: membroId, inicio, fim })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function excluirAusencia(id: string): Promise<void> {
  const { error } = await supabase.from('membro_ausencias').delete().eq('id', id);
  if (error) throw error;
}
