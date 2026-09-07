import { supabase } from '@/lib/supabase';

export async function listCongregacoes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('congregacoes')
    .select('nome')
    .eq('ativa', true)
    .order('nome');
  if (error) throw error;
  return (data ?? []).map((r) => r.nome);
}
