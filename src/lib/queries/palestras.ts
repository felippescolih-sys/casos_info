import { supabase } from '@/lib/supabase';
import type { PalestraInsert, PalestraRow, PalestraUpdate } from '@/types/database';

export type Palestra = PalestraRow & { membro_nome: string | null };

type ComMembro = PalestraRow & { membro: { nome: string } | null };
const comNome = ({ membro, ...p }: ComMembro): Palestra => ({ ...p, membro_nome: membro?.nome ?? null });

/** Palestras de um ano (pela data da apresentação), das mais recentes para as mais antigas. */
export async function listPalestras(ano: number): Promise<Palestra[]> {
  const { data, error } = await supabase
    .from('palestras')
    .select('*, membro:membros!membro_id(nome)')
    .gte('data_apresentacao', `${ano}-01-01`)
    .lte('data_apresentacao', `${ano}-12-31`)
    .order('data_apresentacao', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ComMembro[]).map(comNome);
}

export async function getPalestra(id: string): Promise<Palestra | null> {
  const { data, error } = await supabase
    .from('palestras')
    .select('*, membro:membros!membro_id(nome)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? comNome(data as unknown as ComMembro) : null;
}

export async function criarPalestra(p: PalestraInsert): Promise<PalestraRow> {
  const { data, error } = await supabase.from('palestras').insert(p).select().single();
  if (error) throw erroAmigavel(error);
  return data;
}

export async function atualizarPalestra(id: string, p: PalestraUpdate): Promise<PalestraRow> {
  const { data, error } = await supabase.from('palestras').update(p).eq('id', id).select().single();
  if (error) throw erroAmigavel(error);
  return data;
}

export async function excluirPalestra(id: string): Promise<void> {
  const { error } = await supabase.from('palestras').delete().eq('id', id);
  if (error) throw error;
}

/** Membros que podem constar como "Membro da Colih" (quem tem a função Apresentações). */
export async function listMembrosApresentacoes(): Promise<{ id: string; nome: string }[]> {
  const { data, error } = await supabase.rpc('membros_por_area', { _area: 'apresentacoes' });
  if (error) throw error;
  return data ?? [];
}

function erroAmigavel(e: { message: string; code?: string }) {
  if (e.code === '42501' || /row-level security/i.test(e.message)) {
    return new Error(
      'Você só pode registrar e editar palestras em que você é o membro da Colih. Para outra pessoa, peça à coordenação de Apresentações.',
    );
  }
  return new Error(e.message);
}
