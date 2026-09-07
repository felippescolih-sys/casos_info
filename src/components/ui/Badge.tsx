import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { areaLabel, nivelLabel, statusLabel } from '@/lib/labels';
import type { Area, CasoStatus, FuncaoNivel, MemberStatus } from '@/types/database';

const statusStyles: Record<MemberStatus, string> = {
  pendente: 'bg-amber-100 text-amber-800',
  ativo: 'bg-green-100 text-green-800',
  inativo: 'bg-gray-200 text-gray-600',
};

function Base({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: MemberStatus }) {
  return <Base className={statusStyles[status]}>{statusLabel[status]}</Base>;
}

export function CasoStatusBadge({ status }: { status: CasoStatus }) {
  const tone =
    status === 'aberto' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600';
  return <Base className={tone}>{status === 'aberto' ? 'Aberto' : 'Encerrado'}</Base>;
}

export function FuncaoBadge({ area, nivel }: { area: Area; nivel: FuncaoNivel }) {
  const tone =
    nivel === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  return (
    <Base className={tone}>
      {areaLabel[area]} · {nivelLabel[nivel]}
    </Base>
  );
}
