import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ColaboradoresTab } from './ColaboradoresTab';
import { ProspectivosTab } from './ProspectivosTab';

// Google Forms: relatório de visitas a médicos e administrações hospitalares.
const RELATORIO_VISITAS_URL = 'https://forms.gle/hXtmpe17SzqVHfEG7';

const TABS = [
  { key: 'colaboradores', label: 'Colaboradores' },
  { key: 'prospectivos', label: 'Prospectivos' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export function MedicosPage() {
  const [tab, setTab] = useState<TabKey>('colaboradores');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Médicos</h1>
        <a
          href={RELATORIO_VISITAS_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center justify-center rounded-md bg-brand-700 px-3 text-sm font-medium text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Relatório de visitas
        </a>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'border-b-2 px-3 py-2 text-sm font-medium',
              tab === t.key
                ? 'border-brand-700 text-brand-800'
                : 'border-transparent text-gray-500 hover:text-gray-800',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'colaboradores' ? <ColaboradoresTab /> : <ProspectivosTab />}
    </div>
  );
}
