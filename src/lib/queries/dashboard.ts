import { supabase } from '@/lib/supabase';
import type { AreaEspecialidade, CasoResumoRow } from '@/types/database';

export interface CasosStats {
  total: number;
  ultimos30Dias: number;
  ultimos6Meses: number;
  transpac: number;
  transfundidos: number;
}

async function countHead(build: (q: ReturnType<typeof base>) => ReturnType<typeof base>) {
  const { count, error } = await build(base());
  if (error) throw error;
  return count ?? 0;
}

function base() {
  return supabase.from('casos_resumo').select('*', { count: 'exact', head: true });
}

export async function getCasosStats(): Promise<CasosStats> {
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const [total, ultimos30Dias, ultimos6Meses, transpac, transfundidos] = await Promise.all([
    countHead((q) => q),
    countHead((q) => q.gte('aberto_em', trintaDiasAtras.toISOString())),
    countHead((q) => q.gte('aberto_em', seisMesesAtras.toISOString())),
    countHead((q) => q.eq('transpac', true)),
    countHead((q) => q.eq('transfundido', true)),
  ]);

  return { total, ultimos30Dias, ultimos6Meses, transpac, transfundidos };
}

export interface EspecialidadeContagem {
  area: AreaEspecialidade;
  total: number;
}

export async function getCasosPorEspecialidade(meses = 6): Promise<EspecialidadeContagem[]> {
  const { data, error } = await supabase.rpc('casos_por_especialidade', { _meses: meses });
  if (error) throw error;
  return data ?? [];
}

/** Só os casos em aberto: o painel serve para agir, e caso encerrado não pede ação. */
export async function getUltimosCasos(limite = 8): Promise<CasoResumoRow[]> {
  const { data, error } = await supabase
    .from('casos_resumo')
    .select('*')
    .eq('status', 'aberto')
    .order('created_at', { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data ?? [];
}

export interface HospitalContagem {
  hospital: string;
  abertos: number;
  encerrados: number;
  total: number;
}

export async function getCasosPorHospital(): Promise<HospitalContagem[]> {
  const { data, error } = await supabase.rpc('casos_por_hospital');
  if (error) throw error;
  return data ?? [];
}

export interface CasoEmTransferencia extends CasoResumoRow {
  transferencia_pendente_para_nome: string | null;
}

export async function getCasosEmTransferencia(limite = 10): Promise<CasoEmTransferencia[]> {
  const { data, error } = await supabase
    .from('casos_resumo')
    .select('*')
    .eq('em_transferencia', true)
    .order('transferencia_pendente_em', { ascending: false })
    .limit(limite);
  if (error) throw error;
  const casos = data ?? [];

  const ids = [...new Set(casos.map((c) => c.transferencia_pendente_para).filter(Boolean))] as string[];
  const nomes = new Map<string, string>();
  if (ids.length) {
    const { data: membros, error: mErr } = await supabase
      .from('membros')
      .select('id, nome')
      .in('id', ids);
    if (mErr) throw mErr;
    for (const m of membros ?? []) nomes.set(m.id, m.nome);
  }

  return casos.map((c) => ({
    ...c,
    transferencia_pendente_para_nome: c.transferencia_pendente_para
      ? (nomes.get(c.transferencia_pendente_para) ?? null)
      : null,
  }));
}

export async function getMinhasTransferenciasPendentes(
  membroId: string,
): Promise<CasoResumoRow[]> {
  const { data, error } = await supabase
    .from('casos_resumo')
    .select('*')
    .eq('transferencia_pendente_para', membroId)
    .order('transferencia_pendente_em', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
