import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTodasAusencias } from '@/lib/queries/ausencias';
import { listEscalas, type EscalaComNomes } from '@/lib/queries/escalas';
import { formatDateOnly } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

// Ausência é coluna `date` (sem hora) e a regra de disponibilidade compara no fuso de
// Brasília; a escala é timestamp. Converte a escala para data de Brasília para comparar.
const dataBrasilia = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const diaDe = (iso: string) => dataBrasilia.format(new Date(iso));

function diasEntre(inicio: string, fim: string): number {
  const ms = new Date(`${fim}T00:00Z`).getTime() - new Date(`${inicio}T00:00Z`).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

const SITUACOES = {
  andamento: { label: 'Em andamento', tom: 'bg-amber-100 text-amber-800' },
  futura: { label: 'Futura', tom: 'bg-blue-100 text-blue-800' },
  encerrada: { label: 'Encerrada', tom: 'bg-gray-200 text-gray-600' },
} as const;

export function AusenciasPage() {
  const [filtroMembro, setFiltroMembro] = useState('');
  const [mostrarEncerradas, setMostrarEncerradas] = useState(false);

  const ausencias = useQuery({ queryKey: ['ausencias-todas'], queryFn: listTodasAusencias });
  const escalas = useQuery({ queryKey: ['escalas'], queryFn: listEscalas });

  const hoje = diaDe(new Date().toISOString());

  const membros = useMemo(() => {
    const porId = new Map<string, string>();
    for (const a of ausencias.data ?? []) porId.set(a.membro_id, a.membro_nome);
    return [...porId.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [ausencias.data]);

  const linhas = useMemo(() => {
    return (ausencias.data ?? [])
      .map((a) => {
        const situacao: keyof typeof SITUACOES =
          a.fim < hoje ? 'encerrada' : a.inicio > hoje ? 'futura' : 'andamento';
        // Plantões em que a pessoa já está escalada dentro da ausência: a ausência foi
        // registrada depois da designação e ninguém foi avisado.
        const conflitos: EscalaComNomes[] =
          situacao === 'encerrada'
            ? []
            : (escalas.data ?? []).filter(
                (e) =>
                  (e.membro_id === a.membro_id || e.ajudante_id === a.membro_id) &&
                  diaDe(e.inicio) <= a.fim &&
                  diaDe(e.fim) >= a.inicio,
              );
        return { ...a, situacao, conflitos };
      })
      .filter(
        (a) =>
          (mostrarEncerradas || a.situacao !== 'encerrada') &&
          (!filtroMembro || a.membro_id === filtroMembro),
      );
  }, [ausencias.data, escalas.data, hoje, mostrarEncerradas, filtroMembro]);

  const totalConflitos = linhas.filter((l) => l.conflitos.length > 0).length;
  const erro = ausencias.error ?? escalas.error;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Ausências</h1>
        <p className="text-sm text-gray-500">
          Períodos em que cada membro avisou que não pode ser designado. Quem registra é o próprio
          membro, em "Minha conta".
        </p>
      </div>

      {erro && <Alert tone="error">{(erro as Error).message}</Alert>}
      {totalConflitos > 0 && (
        <Alert tone="warning">
          {totalConflitos === 1
            ? '1 ausência cobre um plantão em que o membro já está escalado.'
            : `${totalConflitos} ausências cobrem plantões em que o membro já está escalado.`}{' '}
          Ajuste a escala desses dias.
        </Alert>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-full sm:w-64">
          <Field label="Membro" htmlFor="filtro_membro_ausencia">
            <Select
              id="filtro_membro_ausencia"
              value={filtroMembro}
              onChange={(e) => setFiltroMembro(e.target.value)}
            >
              <option value="">Todos</option>
              {membros.map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
            checked={mostrarEncerradas}
            onChange={(e) => setMostrarEncerradas(e.target.checked)}
          />
          Mostrar encerradas
        </label>
      </div>

      <Card className="overflow-hidden">
        {ausencias.isLoading || escalas.isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !linhas.length ? (
          <p className="p-8 text-center text-sm text-gray-500">
            {ausencias.data?.length
              ? 'Nenhuma ausência com esses filtros.'
              : 'Nenhuma ausência registrada.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Membro</th>
                  <th className="px-4 py-3">De</th>
                  <th className="px-4 py-3">Até</th>
                  <th className="px-4 py-3">Dias</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">Plantões no período</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {linhas.map((a) => (
                  <tr key={a.id} className={a.conflitos.length ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{a.membro_nome}</td>
                    <td className="px-4 py-3">{formatDateOnly(a.inicio)}</td>
                    <td className="px-4 py-3">{formatDateOnly(a.fim)}</td>
                    <td className="px-4 py-3">{diasEntre(a.inicio, a.fim)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SITUACOES[a.situacao].tom}`}
                      >
                        {SITUACOES[a.situacao].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.conflitos.length ? (
                        <ul className="space-y-0.5 text-red-700">
                          {a.conflitos.map((e) => (
                            <li key={e.id}>
                              {formatDateOnly(diaDe(e.inicio))} —{' '}
                              {e.membro_id === a.membro_id ? 'responsável' : 'ajudante'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
