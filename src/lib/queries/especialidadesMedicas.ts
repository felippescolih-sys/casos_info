import { supabase } from '@/lib/supabase';
import type { EspecialidadeMedicaRow } from '@/types/database';

export async function listEspecialidadesMedicas(): Promise<EspecialidadeMedicaRow[]> {
  const { data, error } = await supabase
    .from('especialidades_medicas')
    .select('*')
    .order('nome');
  if (error) throw error;
  return data ?? [];
}
