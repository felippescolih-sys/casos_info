import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aprovarMembro, definirStatus, listMembros } from '@/lib/queries/membros';
import { useAuth } from '@/auth/AuthProvider';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

export function PendingApprovalsPage() {
  const qc = useQueryClient();
  const { membro: eu } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['membros', { status: 'pendente' }],
    queryFn: () => listMembros({ status: 'pendente' }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['membros'] });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Aprovações pendentes</h1>
      <p className="text-sm text-gray-500">
        Aprovar libera o acesso. As funções por área são definidas depois, na página do membro.
      </p>
      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      {isLoading ? (
        <div className="flex justify-center p-8 text-gray-400">
          <Spinner className="size-6" />
        </div>
      ) : !data?.length ? (
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Nenhum cadastro aguardando aprovação.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((m) => (
            <PendingRow key={m.id} membro={m} aprovadorId={eu!.id} onChanged={invalidate} />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingRow({
  membro,
  aprovadorId,
  onChanged,
}: {
  membro: {
    id: string;
    nome: string;
    email: string;
    congregacao: string | null;
    especialidade: string | null;
    tel_zap: string | null;
  };
  aprovadorId: string;
  onChanged: () => void;
}) {
  const aprovar = useMutation({
    mutationFn: () => aprovarMembro(membro.id, aprovadorId),
    onSuccess: onChanged,
  });
  const rejeitar = useMutation({
    mutationFn: () => definirStatus(membro.id, 'inativo'),
    onSuccess: onChanged,
  });

  const err = aprovar.error ?? rejeitar.error;

  return (
    <Card>
      <CardBody>
        <div className="space-y-3">
          <div>
            <Link
              to={`/membros/${membro.id}`}
              className="font-medium text-brand-700 hover:underline"
            >
              {membro.nome}
            </Link>
            <p className="text-sm text-gray-500">{membro.email}</p>
            <p className="mt-1 text-xs text-gray-500">
              {[membro.congregacao, membro.especialidade, membro.tel_zap]
                .filter(Boolean)
                .join(' · ') || '—'}
            </p>
          </div>
          {err && <Alert tone="error">{(err as Error).message}</Alert>}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" loading={aprovar.isPending} onClick={() => aprovar.mutate()}>
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={rejeitar.isPending}
              onClick={() => rejeitar.mutate()}
            >
              Rejeitar
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
