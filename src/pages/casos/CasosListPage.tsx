import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { listCasos, PAGE_SIZE, type CasosFilter } from '@/lib/queries/casos';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { CasoStatusBadge } from '@/components/ui/Badge';

export function CasosListPage() {
  const { membro } = useAuth();
  const [filter, setFilter] = useState<CasosFilter>({
    status: 'aberto',
    responsavel: 'todos',
    search: '',
  });
  const [page, setPage] = useState(0);

  function patch(p: Partial<CasosFilter>) {
    setFilter((f) => ({ ...f, ...p }));
    setPage(0);
  }

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['casos', filter, page],
    queryFn: () => listCasos(filter, page, membro!.id),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-gray-900">Casos</h1>
          {data && (
            <span className="text-sm text-gray-500">
              {data.total} {data.total === 1 ? 'caso' : 'casos'}
            </span>
          )}
        </div>
        <Link
          to="/casos/novo"
          className="inline-flex h-9 items-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
        >
          Novo caso
        </Link>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
          checked={!!filter.pendentesParaMim}
          onChange={(e) => patch({ pendentesParaMim: e.target.checked })}
        />
        Só transferências pendentes para mim
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_9rem_10rem]">
        <Input
          placeholder="Buscar por paciente, código, hospital ou congregação"
          value={filter.search ?? ''}
          onChange={(e) => patch({ search: e.target.value })}
        />
        <Select
          value={filter.status}
          onChange={(e) => patch({ status: e.target.value as CasosFilter['status'] })}
        >
          <option value="aberto">Abertos</option>
          <option value="encerrado">Encerrados</option>
          <option value="todos">Todos</option>
        </Select>
        <Select
          value={filter.responsavel}
          onChange={(e) => patch({ responsavel: e.target.value })}
        >
          <option value="todos">Todos os responsáveis</option>
          <option value="meus">Meus casos</option>
        </Select>
      </div>

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.rows.length ? (
          <p className="p-8 text-center text-sm text-gray-500">Nenhum caso encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">Congregação</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aberto em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.rows.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/casos/${c.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {c.paciente_nome ?? '(sem nome)'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {c.id_caso ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.responsavel_nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.hospital_nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.congregacao ?? '—'}</td>
                    <td className="px-4 py-3">
                      <CasoStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.aberto_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data && data.pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Página {page + 1} de {data.pageCount}
            {isFetching && <Spinner className="ml-2 inline size-3" />}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={(page + 1) * PAGE_SIZE >= data.total}
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
