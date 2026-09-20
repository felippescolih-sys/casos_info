const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
}

/** Pra colunas `date` (sem hora, ex.: "2026-09-20") — evita o off-by-one de `new Date()`
 * reinterpretando a meia-noite UTC no fuso local (BR fica sempre atrás de UTC). */
export function formatDateOnly(dateOnly: string | null | undefined): string {
  if (!dateOnly) return '—';
  const [y, m, d] = dateOnly.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '—';
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFmt.format(d);
}

export function boolLabel(v: boolean | null | undefined): string | null {
  return v === true ? 'Sim' : v === false ? 'Não' : null;
}
