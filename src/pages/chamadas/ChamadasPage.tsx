import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  formatDuracaoMin,
  formatTelefone,
  getChamadasContagem,
  listChamadas,
} from '@/lib/queries/chamadas';
import { formatDateTime } from '@/lib/format';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

const PAGE_SIZE = 50;

export function ChamadasPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chamadas', page],
    queryFn: () => listChamadas({ page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });

  const contagemQ = useQuery({
    queryKey: ['chamadas-contagem'],
    queryFn: getChamadasContagem,
    refetchInterval: 60_000,
  });
  const contagem = contagemQ.data;

  const total = data?.total ?? 0;
  const ultimaPagina = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Chamadas recebidas</h1>
        <p className="text-sm text-gray-500">
          Ligações que chegaram no telefone de plantão nos últimos 15 dias.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Total de chamadas', valor: contagem?.total, hint: 'todas as ligações' },
          {
            label: 'Sem repetições',
            valor: contagem?.unicas,
            hint: 'mesmo número no mesmo dia conta uma vez',
          },
        ].map((t) => (
          <Card key={t.label}>
            <CardBody className="p-4">
              <p className="text-xs font-medium text-gray-500">{t.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {t.valor ?? '—'}
              </p>
              <p className="text-xs text-gray-400">{t.hint}</p>
            </CardBody>
          </Card>
        ))}
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
