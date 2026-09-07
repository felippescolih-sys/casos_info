import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listMembros, type MembrosFilter } from '@/lib/queries/membros';
import { AREAS, areaLabel } from '@/lib/labels';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { FuncaoBadge, StatusBadge } from '@/components/ui/Badge';

export function MembersListPage() {
  const [filter, setFilter] = useState<MembrosFilter>({
    status: 'todos',
    area: 'todos',
    search: '',
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ['membros', filter],
    queryFn: () => listMembros(filter),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Membros</h1>
        <Link
          to="/membros/aprovacoes"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Ver pendentes de aprovação
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_11rem_11rem]">
        <Input
          placeholder="Buscar por nome, e-mail ou congregação"
          value={filter.search ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
        />
        <Select
          value={filter.status}
          onChange={(e) =>
            setFilter((f) => ({ ...f, status: e.target.value as MembrosFilter['status'] }))
          }
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="pendente">Pendentes</option>
          <option value="inativo">Inativos</option>
        </Select>
        <Select
          value={filter.area}
          onChange={(e) =>
            setFilter((f) => ({ ...f, area: e.target.value as MembrosFilter['area'] }))
          }
        >
          <option value="todos">Todas as áreas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {areaLabel[a]}
            </option>
          ))}
        </Select>
      </div>

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.length ? (
          <p className="p-8 text-center text-sm text-gray-500">Nenhum membro encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Funções</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/membros/${m.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {m.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.funcoes.length ? (
                          m.funcoes.map((f) => (
                            <FuncaoBadge key={f.area} area={f.area} nivel={f.nivel} />
                          ))
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
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
