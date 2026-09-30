import { supabase } from '@/lib/supabase';
import type { ChamadaPlantaoRow } from '@/types/database';

/** Status do CDR do Asterisk (disposition), em português. */
export const STATUS_CHAMADA: Record<string, string> = {
  ANSWERED: 'Atendida',
  'NO ANSWER': 'Não atendida',
  BUSY: 'Ocupado',
  FAILED: 'Falhou',
  CONGESTION: 'Congestionada',
};

export function statusChamadaLabel(status: string | null): string {
  if (!status) return '—';
  return STATUS_CHAMADA[status] ?? status;
}

/** Duração em minutos, com uma casa decimal: 31 s → "0,5 min". */
export function formatDuracaoMin(segundos: number | null): string {
  if (segundos == null) return '—';
  const min = segundos / 60;
  return `${min.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`;
}

/** "41999998888" → "(41) 99999-8888". Número fora do padrão sai como veio. */
export function formatTelefone(numero: string | null): string {
  if (!numero) return '—';
  const d = numero.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return numero;
}

export interface ChamadasFilter {
  status?: string | 'todos';
  page: number;
  pageSize: number;
}

export async function listChamadas(
  filter: ChamadasFilter,
): Promise<{ rows: ChamadaPlantaoRow[]; total: number }> {
  const from = filter.page * filter.pageSize;
  let query = supabase
    .from('chamadas_plantao')
    .select('*', { count: 'exact' })
    .order('data_hora_inicio', { ascending: false })
    .range(from, from + filter.pageSize - 1);
  if (filter.status && filter.status !== 'todos') query = query.eq('status', filter.status);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getUltimaChamada(): Promise<ChamadaPlantaoRow | null> {
  const { data, error } = await supabase
    .from('chamadas_plantao')
    .select('*')
    .order('data_hora_inicio', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
