import { supabase } from '@/lib/supabase';
import type { CasoInsert, CasoResumoRow, CasoRow, CasoStatus, CasoUpdate } from '@/types/database';

export const PAGE_SIZE = 30;

export interface CasosFilter {
  status?: CasoStatus | 'todos';
  /** 'meus' = responsável ou ajudante sou eu · 'todos' · ou um id de membro específico */
  responsavel?: 'meus' | 'todos' | string;
  /** só casos com transferência pendente para o usuário atual */
  pendentesParaMim?: boolean;
  search?: string;
}

export interface CasosPage {
  rows: CasoResumoRow[];
  total: number;
  page: number;
  pageCount: number;
}

export async function listCasos(
  filter: CasosFilter,
  page: number,
  currentUserId: string,
): Promise<CasosPage> {
  let q = supabase
    .from('casos_resumo')
    .select('*', { count: 'exact' })
    .order('aberto_em', { ascending: false, nullsFirst: false });

  if (filter.status && filter.status !== 'todos') q = q.eq('status', filter.status);

  if (filter.responsavel === 'meus') {
    q = q.or(`responsavel_id.eq.${currentUserId},ajudante_id.eq.${currentUserId}`);
  } else if (filter.responsavel && filter.responsavel !== 'todos') {
    q = q.or(
      `responsavel_id.eq.${filter.responsavel},ajudante_id.eq.${filter.responsavel}`,
    );
  }

  if (filter.pendentesParaMim) {
    q = q.eq('transferencia_pendente_para', currentUserId);
  }

  const term = filter.search?.trim();
  if (term) {
    const like = `%${term}%`;
    q = q.or(
      `paciente_nome.ilike.${like},id_caso.ilike.${like},hospital_nome.ilike.${like},congregacao.ilike.${like}`,
    );
  }

  const from = page * PAGE_SIZE;
  q = q.range(from, from + PAGE_SIZE - 1);

  const { data, error, count } = await q;
  if (error) throw error;

  const total = count ?? 0;
  return {
    rows: (data ?? []) as CasoResumoRow[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Linha completa — a RLS decide; volta `null` se o usuário não é envolvido/admin geral. */
export async function getCasoCompleto(id: string): Promise<CasoRow | null> {
  const { data, error } = await supabase.from('casos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Resumo — todo membro ativo enxerga. */
export async function getCasoResumo(id: string): Promise<CasoResumoRow | null> {
  const { data, error } = await supabase
    .from('casos_resumo')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as CasoResumoRow) ?? null;
}

// ── operação (M3) ────────────────────────────────────────────

export async function criarCaso(input: CasoInsert): Promise<CasoRow> {
  const { data, error } = await supabase.from('casos').insert(input).select('*').single();
  if (error) throw error;
  return data;
}

export async function atualizarCaso(id: string, patch: CasoUpdate): Promise<CasoRow> {
  const { data, error } = await supabase
    .from('casos')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function rpc(fn: 'aceitar_transferencia' | 'cancelar_transferencia' | 'encerrar_caso' | 'reabrir_caso', casoId: string) {
  const { error } = await supabase.rpc(fn, { _caso_id: casoId });
  if (error) throw error;
}

export const transferirCaso = async (casoId: string, novoMembroId: string) => {
  const { error } = await supabase.rpc('transferir_caso', {
    _caso_id: casoId,
    _novo: novoMembroId,
  });
  if (error) throw error;
};
export const aceitarTransferencia = (casoId: string) => rpc('aceitar_transferencia', casoId);
export const recusarTransferencia = (casoId: string) => rpc('cancelar_transferencia', casoId);
export const encerrarCaso = (casoId: string) => rpc('encerrar_caso', casoId);
export const reabrirCaso = (casoId: string) => rpc('reabrir_caso', casoId);

export interface MembroOpcao {
  id: string;
  nome: string;
}

export async function listMembrosParaSelecao(): Promise<MembroOpcao[]> {
  const { data, error } = await supabase
    .from('membros')
    .select('id, nome')
    .eq('status', 'ativo')
    .order('nome');
  if (error) throw error;
  return data ?? [];
}
