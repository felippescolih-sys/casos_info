import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Primitivas de layout que imitam o formulário HLC-7 (Planilha de Emergência Médica):
 * folha branca com bordas finas, faixas de seção coloridas (verde / laranja / azul),
 * células com rótulo em cima. Usadas tanto pelo formulário quanto pelo detalhe.
 */

type Tone = 'green' | 'orange' | 'blue';

const bandTone: Record<Tone, string> = {
  green: 'bg-[#cdddb0] text-[#41521c]',
  orange: 'bg-[#fcd5b4] text-[#8a4a1a]',
  blue: 'bg-[#c2d3ea] text-[#1f3a63]',
};

export function Sheet({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-400 bg-white">
      {children}
    </div>
  );
}

export function SheetTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="border-b border-gray-400 px-4 py-3 text-center text-lg font-bold uppercase tracking-wide text-gray-900">
      {children}
    </h1>
  );
}

export function Band({
  tone,
  children,
  hint,
}: {
  tone: Tone;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className={cn('border-b border-gray-400 px-3 py-1 text-center', bandTone[tone])}>
      <div className="text-sm font-bold uppercase tracking-wide">{children}</div>
      {hint && <div className="text-[11px] font-normal normal-case leading-tight">{hint}</div>}
    </div>
  );
}

export function PageMark({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 px-3 py-1 text-right text-[11px] italic text-gray-400">
      {children}
    </div>
  );
}

/** Linha de células (borda entre elas). `cols` controla o grid em telas médias+. */
export function Row({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 | 4 }) {
  const c = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[
    cols
  ];
  return (
    <div className={cn('grid divide-y divide-gray-300 border-b border-gray-300 sm:divide-x sm:divide-y-0', c)}>
      {children}
    </div>
  );
}

/** Célula com rótulo em cima. `children` = input (form) ou valor (detalhe). */
export function Cell({
  label,
  children,
  className,
}: {
  label?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 px-3 py-2', className)}>
      {label && (
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {label}
        </div>
      )}
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}

/** Linha só com um checkbox + texto (como as caixinhas soltas do HLC-7). */
export function CheckRow({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 border-b border-gray-300 px-3 py-2 text-sm text-gray-800">
      {children}
    </label>
  );
}

/** Área de texto grande ocupando a largura (Problema específico, Plano de tratamento, etc.). */
export function BlockCell({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-gray-300 px-3 py-2">
      {label && (
        <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</div>
      )}
      {hint && <div className="mb-1 text-[11px] text-gray-400">{hint}</div>}
      <div className="mt-1 text-sm text-gray-900">{children}</div>
    </div>
  );
}

/** Valor de leitura (detalhe) — mostra "—" quando vazio. */
export function V({ children }: { children: ReactNode }) {
  const empty =
    children == null ||
    children === '' ||
    (Array.isArray(children) && children.length === 0);
  return (
    <span className={empty ? 'text-gray-300' : 'whitespace-pre-wrap text-gray-900'}>
      {empty ? '—' : children}
    </span>
  );
}

/** Tabela estática de valores de referência (canto do HLC-7). */
export function ValoresReferencia() {
  const linhas = [
    ['Homem adulto', '13,5–18 g/dL', '42–52%', '150.000–450.000/μL'],
    ['Mulher adulta', '12–16 g/dL', '38–46%', '150.000–450.000/μL'],
    ['Criança', '11–13 g/dL', '30–40%', '150.000–450.000/μL'],
    ['Bebê', '15–24 g/dL', '55–68%', '200.000–400.000/μL'],
  ];
  return (
    <div className="border-b border-gray-300 px-3 py-2">
      <div className="text-[11px] font-bold uppercase tracking-wide text-gray-600">
        Valores de referência
      </div>
      <div className="mb-1 text-[11px] text-gray-400">
        Referência: Blood (Sangue), 2.ª edição. Variam conforme a idade e na gravidez.
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[12px]">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-1 pr-3"></th>
              <th className="py-1 pr-3">Hemoglobina (Hb)</th>
              <th className="py-1 pr-3">Hematócrito (Ht)</th>
              <th className="py-1">Plaquetas (Plq)</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l[0]} className="border-t border-gray-200">
                <td className="py-1 pr-3 font-medium text-gray-700">{l[0]}</td>
                <td className="py-1 pr-3">{l[1]}</td>
                <td className="py-1 pr-3">{l[2]}</td>
                <td className="py-1">{l[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
