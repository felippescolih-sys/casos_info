import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { FuncaoBadge } from '@/components/ui/Badge';

export function UserMenu() {
  const { membro, funcoes, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!membro) return null;
  const initials = membro.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-gray-100"
      >
        {membro.avatar_url ? (
          <img src={membro.avatar_url} alt="" className="size-8 rounded-full object-cover" />
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-brand-700 text-xs font-semibold text-white">
            {initials}
          </span>
        )}
        <span className="hidden text-sm font-medium text-gray-700 sm:block">
          {membro.nome.split(' ')[0]}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-medium text-gray-900">{membro.nome}</p>
            <p className="truncate text-xs text-gray-500">{membro.email}</p>
            {funcoes.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {funcoes.map((f) => (
                  <FuncaoBadge key={f.area} area={f.area} nivel={f.nivel} />
                ))}
              </div>
            )}
          </div>
          <Link
            to="/conta"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Minha conta
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
