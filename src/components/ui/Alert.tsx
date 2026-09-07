import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'error' | 'success' | 'info' | 'warning';

const tones: Record<Tone, string> = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  success: 'bg-green-50 text-green-800 ring-green-200',
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
};

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={cn('rounded-md px-3 py-2 text-sm ring-1 ring-inset', tones[tone])}>
      {children}
    </div>
  );
}
