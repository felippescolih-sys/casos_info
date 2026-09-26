import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { getEscalaAtual } from '@/lib/queries/escalas';
import { aceitarTransferencia, recusarTransferencia } from '@/lib/queries/casos';
import {
  getCasosEmTransferencia,
  getCasosPorEspecialidade,
  getCasosPorHospital,
  getCasosStats,
  getMinhasTransferenciasPendentes,
  getUltimosCasos,
} from '@/lib/queries/dashboard';
import { formatDate, formatDateTime } from '@/lib/format';
import { AREAS_ESPECIALIDADE, areaEspecialidadeLabel } from '@/lib/labels';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { InstalarApp } from '@/components/InstalarApp';

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

      <TransferenciasPendentesBanner />

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
        {/* Some sozinho quando já está instalado ou o navegador não suporta. */}
        <InstalarApp className="inline-flex h-9 items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-4 text-sm font-medium text-brand-800 hover:bg-brand-100" />
      </div>

      <StatsRow />

      <div className="grid gap-6 lg:grid-cols-2">
        <EspecialidadeCard />
        <UltimosCasosCard />
      </div>

      <TransferenciasCard />

      <HospitaisCard />
    </div>
  );
}

function TransferenciasPendentesBanner() {
  const { membro } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['minhas-transferencias-pendentes', membro?.id],
    queryFn: () => getMinhasTransferenciasPendentes(membro!.id),
    enabled: !!membro?.id,
  });

  const onChanged = () => {
    void qc.invalidateQueries({ queryKey: ['minhas-transferencias-pendentes'] });
    void qc.invalidateQueries({ queryKey: ['casos-em-transferencia'] });
    void qc.invalidateQueries({ queryKey: ['casos'] });
  };

  const aceitar = useMutation({
    mutationFn: (casoId: string) => aceitarTransferencia(casoId),
    onSuccess: onChanged,
  });
  const recusar = useMutation({
    mutationFn: (casoId: string) => recusarTransferencia(casoId),
    onSuccess: onChanged,
  });

  if (!data?.length) return null;

  return (
    <div className="space-y-2">
      {data.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-amber-50 px-4 py-3 text-sm ring-1 ring-inset ring-amber-200"
        >
          <p className="text-amber-900">
            Caso transferido para você:{' '}
            <Link to={`/casos/${c.id}`} className="font-semibold underline">
              {c.paciente_nome ?? c.id_caso}
            </Link>
            {c.morbidade && <span> · {c.morbidade}</span>}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={aceitar.isPending && aceitar.variables === c.id}
              onClick={() => aceitar.mutate(c.id)}
            >
              Aceitar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={recusar.isPending && recusar.variables === c.id}
              onClick={() => recusar.mutate(c.id)}
            >
              Recusar
            </Button>
          </div>
          {(aceitar.error || recusar.error) &&
            (aceitar.variables === c.id || recusar.variables === c.id) && (
              <div className="w-full">
                <Alert tone="error">
                  {((aceitar.error ?? recusar.error) as Error).message}
                </Alert>
              </div>
            )}
        </div>
      ))}
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
  // O `max` escala as barras. Antes o plantão entrava nesta conta mas não era
  // desenhado, então todas as barras eram comparadas a um valor invisível e
  // apareciam menores do que deveriam.
  const max = Math.max(1, ...(data ?? []).map((d) => d.total));
  const totalGeral = (data ?? []).reduce((soma, d) => soma + d.total, 0);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Casos por especialidade</h2>
        <p className="text-xs text-gray-500">
          Últimos 6 meses · {totalGeral} {totalGeral === 1 ? 'caso' : 'casos'}
        </p>
      </CardHeader>
      <CardBody className="space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center py-6 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : (
          AREAS_ESPECIALIDADE.map((area) => {
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
                <span className="w-12 shrink-0 text-right font-medium tabular-nums text-gray-800">
                  {total}
                </span>
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
        <p className="text-xs text-gray-500">Somente casos em aberto</p>
      </CardHeader>
      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-6 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.length ? (
          <p className="p-5 text-sm text-gray-500">Nenhum caso em aberto.</p>
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

const HOSPITAIS_VISIVEIS_INICIAL = 6;

function HospitaisCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['casos-por-hospital'],
    queryFn: getCasosPorHospital,
  });
  const [expandido, setExpandido] = useState(false);

  const lista = data ?? [];
  const visiveis = expandido ? lista : lista.slice(0, HOSPITAIS_VISIVEIS_INICIAL);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Número de casos por hospital</h2>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-6 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !lista.length ? (
          <p className="text-sm text-gray-500">Nenhum caso com hospital informado.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((h) => (
                <div key={h.hospital} className="rounded-md border border-gray-200 p-4">
                  <p className="mb-2 truncate text-sm font-semibold text-gray-900" title={h.hospital}>
                    {h.hospital}
                  </p>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Abertos</dt>
                      <dd className="font-medium text-gray-900">{h.abertos}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Encerrados</dt>
                      <dd className="font-medium text-gray-900">{h.encerrados}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Total</dt>
                      <dd className="font-medium text-gray-900">{h.total}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            {lista.length > HOSPITAIS_VISIVEIS_INICIAL && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpandido((v) => !v)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  {expandido ? 'Mostrar menos' : `Mostrar mais (${lista.length - HOSPITAIS_VISIVEIS_INICIAL})`}
                </button>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
