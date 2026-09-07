import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import {
  AccountDisabledPage,
  ForbiddenPage,
  NotFoundPage,
  PendingApprovalPage,
} from '@/pages/StatusPages';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyAccountPage } from '@/pages/account/MyAccountPage';
import { MembersListPage } from '@/pages/members/MembersListPage';
import { MemberFormPage } from '@/pages/members/MemberFormPage';
import { PendingApprovalsPage } from '@/pages/members/PendingApprovalsPage';
import { CasosListPage } from '@/pages/casos/CasosListPage';
import { CasoDetailPage } from '@/pages/casos/CasoDetailPage';
import { CasoFormPage } from '@/pages/casos/CasoFormPage';

const canManageMembers = (p: { gerenciaMembros: boolean }) => p.gerenciaMembros;

export default function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

      {/* estados de conta */}
      <Route path="/aguardando-aprovacao" element={<PendingApprovalPage />} />
      <Route path="/conta-desativada" element={<AccountDisabledPage />} />

      {/* app autenticado */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/conta" element={<MyAccountPage />} />
        <Route path="/casos" element={<CasosListPage />} />
        <Route path="/casos/novo" element={<CasoFormPage mode="novo" />} />
        <Route path="/casos/:id" element={<CasoDetailPage />} />
        <Route path="/casos/:id/editar" element={<CasoFormPage mode="editar" />} />
        <Route
          path="/membros"
          element={
            <RequireAuth canAccess={canManageMembers}>
              <MembersListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/membros/aprovacoes"
          element={
            <RequireAuth canAccess={canManageMembers}>
              <PendingApprovalsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/membros/:id"
          element={
            <RequireAuth canAccess={canManageMembers}>
              <MemberFormPage />
            </RequireAuth>
          }
        />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
