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
import type {
  Area,
  AreaEspecialidade,
  FuncaoNivel,
  MembroFuncaoRow,
  MembroRow,
} from '@/types/database';

export interface Permissions {
  funcoes: MembroFuncaoRow[];
  temFuncao: (area: Area, nivel?: FuncaoNivel) => boolean;
  /** SuperAdmin: função na área geral (nível 'superadmin'), acesso total ao sistema. */
  isAdminGeral: boolean;
  /** Pode ver/gerenciar/aprovar membros: qualquer função na área geral. */
  gerenciaMembros: boolean;
  /** Admin ou ajudante daquela área específica (ex.: coordenador da lista de
   * médicos), ou SuperAdmin — que tem acesso a tudo independente de área. */
  adminDeArea: (area: Area) => boolean;
}

interface AuthContextValue extends Permissions {
  /** `undefined` enquanto carrega a sessão inicial. */
  session: Session | null | undefined;
  /** Linha em `membros` do usuário logado. `null` se ainda não existe / sem sessão. */
  membro: MembroRow | null;
  /** Especialidades clínicas do membro logado (pode ter mais de uma). */
  especialidades: AreaEspecialidade[];
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
  const [especialidades, setEspecialidades] = useState<AreaEspecialidade[]>([]);
  const [loadingMembro, setLoadingMembro] = useState(false);
  const currentUserId = useRef<string | null>(null);

  const loadMembro = useCallback(async (userId: string | null) => {
    if (!userId) {
      setMembro(null);
      setFuncoes([]);
      setEspecialidades([]);
      return;
    }
    setLoadingMembro(true);
    const [{ data: m, error: mErr }, { data: f, error: fErr }, { data: e, error: eErr }] =
      await Promise.all([
        supabase.from('membros').select('*').eq('id', userId).maybeSingle(),
        supabase.from('membro_funcoes').select('*').eq('membro_id', userId),
        supabase.from('membro_especialidades').select('area_especialidade').eq('membro_id', userId),
      ]);
    if (mErr) console.error('Erro ao carregar membro:', mErr.message);
    if (fErr) console.error('Erro ao carregar funções:', fErr.message);
    if (eErr) console.error('Erro ao carregar especialidades:', eErr.message);
    setMembro(mErr ? null : (m ?? null));
    setFuncoes(fErr ? [] : (f ?? []));
    setEspecialidades(eErr ? [] : (e ?? []).map((row) => row.area_especialidade));
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
    setEspecialidades([]);
  }, []);

  const temFuncao = useCallback(
    (area: Area, nivel?: FuncaoNivel) =>
      funcoes.some((f) => f.area === area && (nivel === undefined || f.nivel === nivel)),
    [funcoes],
  );

  const isAdminGeral = temFuncao('geral', 'superadmin');
  const adminDeArea = useCallback(
    (area: Area) => isAdminGeral || temFuncao(area, 'admin') || temFuncao(area, 'ajudante'),
    [isAdminGeral, temFuncao],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      membro,
      especialidades,
      loadingMembro,
      refreshMembro,
      signOut,
      funcoes,
      temFuncao,
      isAdminGeral,
      gerenciaMembros: temFuncao('geral'),
      adminDeArea,
    }),
    [
      session,
      membro,
      especialidades,
      loadingMembro,
      refreshMembro,
      signOut,
      funcoes,
      temFuncao,
      isAdminGeral,
      adminDeArea,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
