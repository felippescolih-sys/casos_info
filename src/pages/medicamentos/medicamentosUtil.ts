// Datas no fuso de Brasília (colunas `date`, sem hora) e valores em reais.

const dataBrasilia = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Hoje em Brasília, no formato da coluna `date` (AAAA-MM-DD). */
export const hojeBrasilia = () => dataBrasilia.format(new Date());

/** Soma dias a uma data AAAA-MM-DD (sem passar por fuso). */
export function somarDias(dia: string, dias: number): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Dias de antecedência para avisar que a validade está chegando. */
export const AVISO_VALIDADE_DIAS = 30;

export type SituacaoValidade = 'vencido' | 'vence_logo' | 'ok' | 'sem';

export function situacaoValidade(validade: string | null, hoje: string): SituacaoValidade {
  if (!validade) return 'sem';
  if (validade < hoje) return 'vencido';
  if (validade <= somarDias(hoje, AVISO_VALIDADE_DIAS)) return 'vence_logo';
  return 'ok';
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatReais(valor: number | string | null): string {
  if (valor === null || valor === '') return '—';
  const n = Number(valor);
  return Number.isFinite(n) ? brl.format(n) : '—';
}

/** "1.234,56", "150", "R$ 89,90" ou "89.90" → número. `null` se não for um valor válido. */
export function lerReais(texto: string): number | null {
  let t = texto.replace(/R\$|\s/g, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  return Number(t);
}

/** Número do banco para o campo de texto do formulário ("150,00"). */
export const reaisParaCampo = (valor: number | string | null) =>
  valor === null ? '' : Number(valor).toFixed(2).replace('.', ',');

export const UNIDADES_SUGERIDAS = [
  'frasco',
  'ampola',
  'caixa',
  'comprimido',
  'cápsula',
  'seringa',
  'bolsa',
];
