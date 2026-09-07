import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Area, FuncaoNivel, MembroFuncaoRow, MembroRow } from '@/types/database';

export interface Permissions {
  funcoes: MembroFuncaoRow[];
  temFuncao: (area: Area, nivel?: FuncaoNivel) => boolean;
  isAdminGeral: boolean;
  /** Pode ver/gerenciar/aprovar membros: qualquer função na área geral. */
  gerenciaMembros: boolean;
}

interface AuthContextValue extends Permissions {
  /** `undefined` enquanto carrega a sessão inicial. */
  session: Session | null | undefined;
  /** Linha em `membros` do usuário logado. `null` se ainda não existe / sem sessão. */
  membro: MembroRow | null;
  /** true enquanto busca o perfil pela primeira vez. */
  loadingMembro: boolean;
  refreshMembro: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [membro, setMembro] = useState<MembroRow | null>(null);
  const [funcoes, setFuncoes] = useState<MembroFuncaoRow[]>([]);
  const [loadingMembro, setLoadingMembro] = useState(false);
  const currentUserId = useRef<string | null>(null);

  const loadMembro = useCallback(async (userId: string | null) => {
    if (!userId) {
      setMembro(null);
      setFuncoes([]);
      return;
    }
    setLoadingMembro(true);
    const [{ data: m, error: mErr }, { data: f, error: fErr }] = await Promise.all([
      supabase.from('membros').select('*').eq('id', userId).maybeSingle(),
      supabase.from('membro_funcoes').select('*').eq('membro_id', userId),
    ]);
    if (mErr) console.error('Erro ao carregar membro:', mErr.message);
    if (fErr) console.error('Erro ao carregar funções:', fErr.message);
    setMembro(mErr ? null : (m ?? null));
    setFuncoes(fErr ? [] : (f ?? []));
    setLoadingMembro(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      currentUserId.current = data.session?.user.id ?? null;
      void loadMembro(currentUserId.current);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const nextId = newSession?.user.id ?? null;
      if (nextId !== currentUserId.current) {
        currentUserId.current = nextId;
        void loadMembro(nextId);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadMembro]);

  const refreshMembro = useCallback(
    () => loadMembro(currentUserId.current),
    [loadMembro],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMembro(null);
    setFuncoes([]);
  }, []);

  const temFuncao = useCallback(
    (area: Area, nivel?: FuncaoNivel) =>
      funcoes.some((f) => f.area === area && (nivel === undefined || f.nivel === nivel)),
    [funcoes],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      membro,
      loadingMembro,
      refreshMembro,
      signOut,
      funcoes,
      temFuncao,
      isAdminGeral: temFuncao('geral', 'admin'),
      gerenciaMembros: temFuncao('geral'),
    }),
    [session, membro, loadingMembro, refreshMembro, signOut, funcoes, temFuncao],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
