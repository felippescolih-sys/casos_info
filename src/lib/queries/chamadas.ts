import { supabase } from '@/lib/supabase';
import type { ChamadaPlantaoRow } from '@/types/database';

// O status (disposition do Asterisk) NÃO é exibido: a FXO do HT813 atende assim que
// pega a linha, então "ANSWERED" não quer dizer que o plantonista atendeu.

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
  page: number;
  pageSize: number;
}

export async function listChamadas(
  filter: ChamadasFilter,
): Promise<{ rows: ChamadaPlantaoRow[]; total: number }> {
  const from = filter.page * filter.pageSize;
  const { data, error, count } = await supabase
    .from('chamadas_plantao')
    .select('*', { count: 'exact' })
    .order('data_hora_inicio', { ascending: false })
    .range(from, from + filter.pageSize - 1);
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

/**
 * Contagem dos últimos 15 dias (o que a limpeza mantém). `unicas` junta as
 * repetições do mesmo número no mesmo dia. A RPC também devolve `nao_atendidas`,
 * que não é usada: depende do status, que não é confiável (ver acima).
 */
export async function getChamadasContagem(): Promise<{ total: number; unicas: number }> {
  const { data, error } = await supabase.rpc('chamadas_contagem');
  if (error) throw error;
  const r = data?.[0];
  return {
    total: Number(r?.total ?? 0),
    unicas: Number(r?.unicas ?? 0),
  };
}
