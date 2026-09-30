import { supabase } from '@/lib/supabase';
import type { ChamadaPlantaoRow } from '@/types/database';

export type ChamadaComPlantonista = ChamadaPlantaoRow & {
  plantonista_nome: string | null;
  ajudante_nome: string | null;
};

type EscalaComNomesMin = {
  inicio: string;
  fim: string;
  membro: { nome: string } | null;
  ajudante: { nome: string } | null;
};

// As escalas terminam às 02:59 UTC e a seguinte começa às 03:00, então sobra um
// minuto descoberto (23:59 em Brasília). A tolerância cobre esse buraco.
const TOLERANCIA_FIM_MS = 60_000;

/**
 * O Asterisk não sabe quem estava de plantão: cruza o início de cada chamada com a
 * escala. Com escalas sobrepostas, vale a que começou por último (a mais específica).
 */
async function anexarPlantonista(rows: ChamadaPlantaoRow[]): Promise<ChamadaComPlantonista[]> {
  if (!rows.length) return [];
  const tempos = rows.map((r) => new Date(r.data_hora_inicio).getTime());
  const min = new Date(Math.min(...tempos) - TOLERANCIA_FIM_MS).toISOString();
  const max = new Date(Math.max(...tempos)).toISOString();
  const { data, error } = await supabase
    .from('escalas')
    .select('inicio, fim, membro:membros!membro_id(nome), ajudante:membros!ajudante_id(nome)')
    .lte('inicio', max)
    .gte('fim', min)
    .order('inicio', { ascending: false });
  if (error) throw error;
  const escalas = (data ?? []) as unknown as EscalaComNomesMin[];

  return rows.map((r) => {
    const t = new Date(r.data_hora_inicio).getTime();
    const e = escalas.find(
      (x) =>
        new Date(x.inicio).getTime() <= t && new Date(x.fim).getTime() + TOLERANCIA_FIM_MS > t,
    );
    return {
      ...r,
      plantonista_nome: e?.membro?.nome ?? null,
      ajudante_nome: e?.ajudante?.nome ?? null,
    };
  });
}

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
): Promise<{ rows: ChamadaComPlantonista[]; total: number }> {
  const from = filter.page * filter.pageSize;
  let query = supabase
    .from('chamadas_plantao')
    .select('*', { count: 'exact' })
    .order('data_hora_inicio', { ascending: false })
    .range(from, from + filter.pageSize - 1);
  if (filter.status && filter.status !== 'todos') query = query.eq('status', filter.status);
  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: await anexarPlantonista(data ?? []), total: count ?? 0 };
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
