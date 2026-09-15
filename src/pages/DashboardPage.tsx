import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { getEscalaAtual } from '@/lib/queries/escalas';
import {
  getCasosEmTransferencia,
  getCasosPorEspecialidade,
  getCasosStats,
  getUltimosCasos,
} from '@/lib/queries/dashboard';
import { formatDate, formatDateTime } from '@/lib/format';
import { AREAS_ESPECIALIDADE, areaEspecialidadeLabel } from '@/lib/labels';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export function DashboardPage() {
  const { membro } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Olá, {membro?.nome.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500">Bem-vindo ao Casos Info.</p>
      </div>

      <EscalaBanner />

      <div className="flex flex-wrap gap-2">
        <Link
          to="/casos/novo"
          className="inline-flex h-9 items-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
        >
          + Novo caso
        </Link>
        <Link
          to="/casos"
          className="inline-flex h-9 items-center rounded-md bg-white px-4 text-sm font-medium text-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Ver casos
        </Link>
      </div>

      <StatsRow />

      <div className="grid gap-6 lg:grid-cols-2">
        <EspecialidadeCard />
        <UltimosCasosCard />
      </div>

      <TransferenciasCard />
    </div>
  );
}

function EscalaBanner() {
  const { data: plantao } = useQuery({ queryKey: ['escala-atual'], queryFn: getEscalaAtual });

  if (!plantao) return null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-green-800 px-4 py-2 text-sm text-white">
      <span className="font-medium">Plantonista:</span> {plantao.membro_nome}
      {plantao.ajudante_nome && (
        <span className="text-green-100"> · Ajudante: {plantao.ajudante_nome}</span>
      )}
    </div>
  );
}

function StatsRow() {
  const { data, isLoading } = useQuery({ queryKey: ['casos-stats'], queryFn: getCasosStats });

  const tiles: Array<{ label: string; value: string | undefined; hint?: string }> = [
    { label: 'Total de casos', value: data?.total.toString(), hint: 'desde o início' },
    { label: 'Últimos 6 meses', value: data?.ultimos6Meses.toString() },
    {
      label: 'Média / dia (30d)',
      value: data
        ? (Math.round((data.ultimos30Dias / 30) * 10) / 10).toLocaleString('pt-BR')
        : undefined,
    },
    { label: 'Transpac', value: data?.transpac.toString() },
    { label: 'Transfundidos', value: data?.transfundidos.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardBody className="p-4">
            <p className="text-xs font-medium text-gray-500">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {isLoading ? '—' : (t.value ?? '—')}
            </p>
            {t.hint && <p className="text-xs text-gray-400">{t.hint}</p>}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function EspecialidadeCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['casos-por-especialidade'],
    queryFn: () => getCasosPorEspecialidade(6),
  });

  const porArea = new Map((data ?? []).map((d) => [d.area, d.total]));
  const max = Math.max(1, ...(data ?? []).map((d) => d.total));

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Casos por especialidade</h2>
        <p className="text-xs text-gray-500">Últimos 6 meses</p>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center py-6 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : (
          AREAS_ESPECIALIDADE.filter((a) => a !== 'plantao').map((area) => {
            const total = porArea.get(area) ?? 0;
            return (
              <div key={area} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 text-gray-600">{areaEspecialidadeLabel[area]}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-brand-600"
                    style={{ width: `${(total / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-gray-800">{total}</span>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
}

function UltimosCasosCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['ultimos-casos'],
    queryFn: () => getUltimosCasos(8),
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Últimos casos registrados</h2>
      </CardHeader>
      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-6 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.length ? (
          <p className="p-5 text-sm text-gray-500">Nenhum caso registrado ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.map((c) => (
              <li key={c.id} className="px-5 py-3 text-sm">
                <Link to={`/casos/${c.id}`} className="font-medium text-brand-700 hover:underline">
                  {c.paciente_nome ?? c.id_caso}
                </Link>
                <p className="text-xs text-gray-500">
                  {[c.morbidade, c.responsavel_nome, formatDate(c.aberto_em)]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

function TransferenciasCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['casos-em-transferencia'],
    queryFn: () => getCasosEmTransferencia(10),
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <h2 className="font-medium text-gray-900">Casos em transferência</h2>
      </CardHeader>
      {isLoading ? (
        <div className="flex justify-center p-6 text-gray-400">
          <Spinner className="size-6" />
        </div>
      ) : !data?.length ? (
        <p className="p-5 text-sm text-gray-500">Nenhuma transferência pendente.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Transf. para</th>
                <th className="px-4 py-3">Enviado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/casos/${c.id}`} className="font-medium text-brand-700 hover:underline">
                      {c.paciente_nome ?? c.id_caso}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.responsavel_nome ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.transferencia_pendente_para_nome ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDateTime(c.transferencia_pendente_em)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
