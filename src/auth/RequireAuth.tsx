import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type Permissions } from './AuthProvider';
import { Spinner } from '@/components/ui/Spinner';

interface RequireAuthProps {
  children: ReactNode;
  /** Se informado, só passa quem satisfaz esta checagem de permissão. */
  canAccess?: (perms: Permissions) => boolean;
}

export function RequireAuth({ children, canAccess }: RequireAuthProps) {
  const auth = useAuth();
  const { session, membro, loadingMembro, signOut } = auth;
  const location = useLocation();

  const isDisabled = membro?.status === 'inativo';
  useEffect(() => {
    if (isDisabled) void signOut();
  }, [isDisabled, signOut]);

  if (session === undefined) return <FullPageSpinner />;

  if (session === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (loadingMembro || (membro === null && !isDisabled)) {
    return <FullPageSpinner label="Carregando seu perfil…" />;
  }

  if (membro?.status === 'pendente') {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  if (membro?.status === 'inativo') {
    return <Navigate to="/conta-desativada" replace />;
  }

  if (canAccess && !canAccess(auth)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-gray-500">
      <Spinner className="size-8" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
