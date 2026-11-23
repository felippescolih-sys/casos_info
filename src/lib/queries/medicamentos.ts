import { supabase } from '@/lib/supabase';
import type {
  MedicamentoEstoqueInsert,
  MedicamentoEstoqueRow,
  MedicamentoEstoqueUpdate,
} from '@/types/database';

export type Medicamento = MedicamentoEstoqueRow & {
  responsavel_nome: string | null;
  criado_por_nome: string | null;
  baixado_por_nome: string | null;
};

type ComNomes = MedicamentoEstoqueRow & {
  responsavel: { nome: string } | null;
  criador: { nome: string } | null;
  baixador: { nome: string } | null;
};

const SELECT = `*,
  responsavel:membros!responsavel_id(nome),
  criador:membros!criado_por(nome),
  baixador:membros!baixado_por(nome)`;

const comNomes = ({ responsavel, criador, baixador, ...m }: ComNomes): Medicamento => ({
  ...m,
  responsavel_nome: responsavel?.nome ?? null,
  criado_por_nome: criador?.nome ?? null,
  baixado_por_nome: baixador?.nome ?? null,
});

/** Todo o estoque (inclusive o que já saiu), em ordem de medicamento. A tela separa estoque e histórico. */
export async function listMedicamentos(): Promise<Medicamento[]> {
  const { data, error } = await supabase
    .from('medicamentos_estoque')
    .select(SELECT)
    .order('medicamento')
    .order('validade', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ComNomes[]).map(comNomes);
}

export async function criarMedicamento(m: MedicamentoEstoqueInsert): Promise<void> {
  const { error } = await supabase.from('medicamentos_estoque').insert(m);
  if (error) throw erroAmigavel(error);
}

export async function atualizarMedicamento(id: string, m: MedicamentoEstoqueUpdate): Promise<void> {
  const { data, error } = await supabase
    .from('medicamentos_estoque')
    .update(m)
    .eq('id', id)
    .select('id');
  if (error) throw erroAmigavel(error);
  if (!data?.length) throw new Error(SEM_PERMISSAO);
}

export async function excluirMedicamento(id: string): Promise<void> {
  const { data, error } = await supabase.from('medicamentos_estoque').delete().eq('id', id).select('id');
  if (error) throw erroAmigavel(error);
  if (!data?.length) throw new Error(SEM_PERMISSAO);
}

export interface Baixa {
  quantidade: number;
  baixado_em: string;
  baixa_destino: string | null;
  baixa_caso_numero: number | null;
}

/**
 * Tira do estoque. Se sai só parte do lote, o lote fica com o que sobrou e a parte que saiu vira um
 * lançamento próprio já baixado (o valor pago é dividido na proporção da quantidade).
 */
export async function darBaixa(m: Medicamento, b: Baixa): Promise<void> {
  const campos = {
    baixado_em: b.baixado_em,
    baixa_destino: b.baixa_destino,
    baixa_caso_numero: b.baixa_caso_numero,
  };
  if (b.quantidade >= m.quantidade) return atualizarMedicamento(m.id, campos);

  const valor = m.valor === null ? null : Number(m.valor);
  const valorParte = valor === null ? null : Math.round((valor * b.quantidade * 100) / m.quantidade) / 100;
  const restante = {
    quantidade: m.quantidade - b.quantidade,
    valor: valor === null || valorParte === null ? null : Math.round((valor - valorParte) * 100) / 100,
  };
  await atualizarMedicamento(m.id, restante);
  try {
    await criarMedicamento({
      medicamento: m.medicamento,
      dosagem: m.dosagem,
      quantidade: b.quantidade,
      unidade: m.unidade,
      validade: m.validade,
      origem: m.origem,
      valor: valorParte,
      responsavel_id: m.responsavel_id,
      observacoes: m.observacoes,
      ...campos,
    });
  } catch (e) {
    // Volta o lote como estava para não "sumir" medicação do estoque.
    await atualizarMedicamento(m.id, { quantidade: m.quantidade, valor: m.valor }).catch(() => undefined);
    throw e;
  }
}

/** Volta para o estoque um lançamento baixado por engano. */
export const desfazerBaixa = (id: string) => atualizarMedicamento(id, { baixado_em: null });

export type CasoEncontrado = {
  numero: number;
  paciente_nome: string | null;
  hospital_nome: string | null;
  aberto_em: string | null;
  aberto: boolean;
};

/** Caso para ligar à baixa: pelo número ou pelo nome do paciente (3+ letras), em todos os casos, até 5. */
export async function buscarCasos(termo: string): Promise<CasoEncontrado[]> {
  const { data, error } = await supabase.rpc('medicamentos_buscar_caso', { _termo: termo });
  if (error) throw error;
  return data ?? [];
}

/** Membros que podem estar com a medicação (membros ativos da COLIH e superadmins). */
export async function listMembrosColih(): Promise<{ id: string; nome: string }[]> {
  const { data, error } = await supabase.rpc('membros_colih');
  if (error) throw error;
  return data ?? [];
}

const SEM_PERMISSAO =
  'Só quem lançou, quem está com a medicação ou o admin da COLIH pode alterar este lançamento.';

function erroAmigavel(e: { message: string; code?: string }) {
  if (e.code === '42501' || /row-level security/i.test(e.message)) return new Error(SEM_PERMISSAO);
  if (/valor_origem/.test(e.message)) {
    return new Error('Informe o valor pago em reais, ou marque como doação.');
  }
  return new Error(e.message);
}
