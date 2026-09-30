import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  formatDuracaoMin,
  formatTelefone,
  listChamadas,
  STATUS_CHAMADA,
  statusChamadaLabel,
} from '@/lib/queries/chamadas';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

const PAGE_SIZE = 50;

export function StatusChamadaBadge({ status }: { status: string | null }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'ANSWERED'
          ? 'bg-green-50 text-green-800 ring-1 ring-inset ring-green-200'
          : status === 'NO ANSWER'
            ? 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200'
            : 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-200',
      )}
    >
      {statusChamadaLabel(status)}
    </span>
  );
}

export function ChamadasPage() {
  const [status, setStatus] = useState('todos');
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chamadas', status, page],
    queryFn: () => listChamadas({ status, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });

  const total = data?.total ?? 0;
  const ultimaPagina = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Chamadas recebidas</h1>
        <p className="text-sm text-gray-500">Ligações que chegaram no telefone de plantão.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="w-56"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_CHAMADA).map(([valor, label]) => (
            <option key={valor} value={valor}>
              {label}
            </option>
          ))}
        </Select>
        {data && (
          <span className="text-sm text-gray-500">
            {total} {total === 1 ? 'chamada' : 'chamadas'}
          </span>
        )}
      </div>

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.rows.length ? (
          <p className="p-8 text-center text-sm text-gray-500">Nenhuma chamada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Início</th>
                  <th className="px-4 py-3">Número de origem</th>
                  <th className="px-4 py-3 text-right">Duração</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Plantonista</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.rows.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {formatDateTime(c.data_hora_inicio)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-gray-900">
                      {formatTelefone(c.numero_origem)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-700">
                      {formatDuracaoMin(c.duracao_segundos)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChamadaBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.plantonista_nome ?? <span className="text-gray-400">Sem escala</span>}
                      {c.ajudante_nome && (
                        <span className="block text-xs text-gray-500">
                          Ajudante: {c.ajudante_nome}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {ultimaPagina > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Página {page + 1} de {ultimaPagina + 1}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= ultimaPagina}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
