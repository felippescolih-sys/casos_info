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

/** Lista as escalas da mais antiga para a mais recente (passadas e futuras). */
export async function listEscalas(): Promise<EscalaComNomes[]> {
  const { data, error } = await supabase
    .from('escalas')
    .select(SELECT_COM_NOMES)
    .order('inicio', { ascending: true });
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

export type TurnoLote = { inicio: string; fim: string };
export type EscalaLote = TurnoLote & { membro_id: string; ajudante_id: string | null };

/**
 * Disponibilidade de cada membro em cada turno, numa chamada só. Devolve
 * `chave(membroId, índiceDoTurno)` → disponível. Mesma regra do trigger que barra o save.
 */
export async function disponibilidadeLote(
  membros: string[],
  turnos: TurnoLote[],
): Promise<Map<string, boolean>> {
  const { data, error } = await supabase.rpc('disponibilidade_plantao_lote', {
    _membros: membros,
    _inicios: turnos.map((t) => t.inicio),
    _fins: turnos.map((t) => t.fim),
  });
  if (error) throw error;
  // `turno` vem 1-based do Postgres (generate_subscripts).
  return new Map((data ?? []).map((r) => [chaveDisp(r.membro_id, r.turno - 1), r.disponivel]));
}

export function chaveDisp(membroId: string, turno: number): string {
  return `${membroId}:${turno}`;
}

/** Grava todas de uma vez: ou entram todas, ou nenhuma. Devolve quantas foram criadas. */
export async function criarEscalasLote(escalas: EscalaLote[]): Promise<number> {
  const { data, error } = await supabase.rpc('criar_escalas_lote', { _escalas: escalas });
  if (error) throw error;
  return data ?? 0;
}

export async function excluirEscala(id: string): Promise<void> {
  const { error } = await supabase.from('escalas').delete().eq('id', id);
  if (error) throw error;
}
