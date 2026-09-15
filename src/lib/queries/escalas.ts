import { supabase } from '@/lib/supabase';
import type { EscalaInsert, EscalaRow, EscalaUpdate } from '@/types/database';

export type EscalaComNomes = EscalaRow & {
  membro_nome: string;
  ajudante_nome: string | null;
};

type EscalaRowComMembros = EscalaRow & {
  membro: { nome: string };
  ajudante: { nome: string } | null;
};

const SELECT_COM_NOMES = '*, membro:membros!membro_id(nome), ajudante:membros!ajudante_id(nome)';

function comNomes(row: EscalaRowComMembros): EscalaComNomes {
  return {
    ...row,
    membro_nome: row.membro?.nome ?? '—',
    ajudante_nome: row.ajudante?.nome ?? null,
  };
}

/** Escala de plantão cujo período contém o momento atual (banner "de hoje"). */
export async function getEscalaAtual(): Promise<EscalaComNomes | null> {
  const agora = new Date().toISOString();
  const { data, error } = await supabase
    .from('escalas')
    .select(SELECT_COM_NOMES)
    .lte('inicio', agora)
    .gte('fim', agora)
    .order('inicio', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? comNomes(data as unknown as EscalaRowComMembros) : null;
}

/** Lista as escalas mais recentes primeiro (futuras e passadas). */
export async function listEscalas(): Promise<EscalaComNomes[]> {
  const { data, error } = await supabase
    .from('escalas')
    .select(SELECT_COM_NOMES)
    .order('inicio', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as EscalaRowComMembros[]).map(comNomes);
}

export async function criarEscala(input: EscalaInsert): Promise<EscalaRow> {
  const { data, error } = await supabase.from('escalas').insert(input).select('*').single();
  if (error) throw error;
  return data;
}

export async function atualizarEscala(id: string, patch: EscalaUpdate): Promise<EscalaRow> {
  const { data, error } = await supabase
    .from('escalas')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function excluirEscala(id: string): Promise<void> {
  const { error } = await supabase.from('escalas').delete().eq('id', id);
  if (error) throw error;
}
