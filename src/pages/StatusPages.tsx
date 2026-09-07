import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function PendingApprovalPage() {
  const { session, membro, loadingMembro, signOut, refreshMembro } = useAuth();
  const navigate = useNavigate();

  // Revalida o perfil ao abrir a tela e a cada 20s (aprovação acontece do outro lado).
  useEffect(() => {
    void refreshMembro();
    const t = setInterval(() => void refreshMembro(), 20_000);
    return () => clearInterval(t);
  }, [refreshMembro]);

  if (session === null) return <Navigate to="/login" replace />;
  if (membro?.status === 'ativo') return <Navigate to="/" replace />;
  if (membro?.status === 'inativo') return <Navigate to="/conta-desativada" replace />;

  return (
    <AuthLayout title="Aguardando aprovação" subtitle={membro?.nome}>
      <div className="space-y-4">
        <Alert tone="info">
          Seu cadastro foi recebido. Um coordenador precisa aprovar seu acesso. Você receberá
          acesso assim que isso acontecer.
        </Alert>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            loading={loadingMembro}
            onClick={() => void refreshMembro()}
          >
            Verificar de novo
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            Sair
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

export function AccountDisabledPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  return (
    <AuthLayout title="Conta desativada">
      <div className="space-y-4">
        <Alert tone="warning">
          Seu acesso foi desativado. Fale com um coordenador se acha que isso é um engano.
        </Alert>
        <Button
          className="w-full"
          onClick={async () => {
            await signOut();
            navigate('/login');
          }}
        >
          Voltar ao login
        </Button>
      </div>
    </AuthLayout>
  );
}

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-5xl font-bold text-gray-300">403</p>
      <h1 className="text-lg font-semibold text-gray-900">Sem permissão</h1>
      <p className="text-sm text-gray-500">Você não tem acesso a esta página.</p>
      <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <h1 className="text-lg font-semibold text-gray-900">Página não encontrada</h1>
      <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
