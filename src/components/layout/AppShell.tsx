import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { cn } from '@/lib/cn';
import { CompletarPerfilDialog } from '@/components/CompletarPerfilDialog';
import { getWhatsappSessao } from '@/lib/queries/whatsapp';
import { UserMenu } from './UserMenu';

interface NavItem {
  to: string;
  label: string;
  gestor?: boolean;
  adminGeral?: boolean;
  colih?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Início' },
  { to: '/casos', label: 'Casos' },
  { to: '/medicos', label: 'Médicos' },
  { to: '/escalas', label: 'Escalas', colih: true },
  { to: '/chamadas', label: 'Chamadas', colih: true },
  { to: '/membros', label: 'Membros', colih: true },
  { to: '/membros/aprovacoes', label: 'Aprovações', gestor: true },
  { to: '/hospitais', label: 'Hospitais', colih: true },
  { to: '/whatsapp', label: 'WhatsApp', adminGeral: true },
];

export function AppShell() {
  const { gerenciaMembros, isAdminGeral, ehMembroColih } = useAuth();
  const [open, setOpen] = useState(false);
  const items = NAV.filter(
    (i) =>
      (!i.gestor || gerenciaMembros) &&
      (!i.adminGeral || isAdminGeral) &&
      (!i.colih || ehMembroColih),
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <CompletarPerfilDialog />
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
          <img src="/favicon.svg" alt="" className="size-7" />
          <span className="font-semibold text-gray-900">Casos Info</span>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-gray-700 hover:bg-gray-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
          <button
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>
        {isAdminGeral && <AvisoWhatsapp />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/**
 * Faixa para superadmin quando o WhatsApp da COLIH caiu. Lê o estado que a verificação
 * periódica grava (a cada 2 min); o aviso por WhatsApp sai pelo número da F7, mas só chega
 * se o WAHA estiver de pé — esta faixa é o que sobra quando nem isso funciona.
 */
function AvisoWhatsapp() {
  const { pathname } = useLocation();
  const { data } = useQuery({
    queryKey: ['whatsapp', 'sessao'],
    queryFn: getWhatsappSessao,
    refetchInterval: 60_000,
  });
  // alerta_enviado_em, não caiu_em: só depois da tolerância de 5 min, como o aviso por WhatsApp.
  if (!data?.alerta_enviado_em || pathname === '/whatsapp') return null;
  return (
    <div className="bg-red-600 px-4 py-2 text-sm text-white">
      O WhatsApp da COLIH está desconectado — as mensagens automáticas não estão saindo.{' '}
      <Link to="/whatsapp" className="font-semibold underline">
        Reconectar
      </Link>
    </div>
  );
}
