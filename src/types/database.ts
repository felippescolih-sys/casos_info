/**
 * Tipos do banco. Placeholder escrito à mão — alinhado com
 * supabase/migrations/0001_init_membros.sql.
 *
 * Depois que o schema estiver aplicado, regenerar com:
 *   npm run gen:types
 *
 * Obs.: usar `type` (não `interface`) para casar com o formato que o
 * @supabase/supabase-js espera (índice implícito de string).
 */

export type MemberStatus = 'pendente' | 'ativo' | 'inativo';

export type Area =
  | 'geral'
  | 'apresentacoes'
  | 'gvps'
  | 'especialidades'
  | 'facilitadores'
  | 'medicos';

export type FuncaoNivel = 'admin' | 'ajudante';

export type MembroRow = {
  id: string;
  nome: string;
  email: string;
  status: MemberStatus;
  tel_zap: string | null;
  tel_residencial: string | null;
  tel_comercial: string | null;
  tel_celular: string | null;
  congregacao: string | null;
  especialidade: string | null;
  reunioes: string | null;
  nome_esposa: string | null;
  tel_esposa: string | null;
  avatar_url: string | null;
  ferias: boolean;
  legacy_bubble_id: string | null;
  ult_acesso: string | null;
  aprovado_por: string | null;
  aprovado_em: string | null;
  created_at: string;
  updated_at: string;
};

export type MembroInsert = Partial<MembroRow> &
  Pick<MembroRow, 'id' | 'nome' | 'email'>;
export type MembroUpdate = Partial<Omit<MembroRow, 'id' | 'created_at'>>;

export type MembroFuncaoRow = {
  membro_id: string;
  area: Area;
  nivel: FuncaoNivel;
  criado_por: string | null;
  created_at: string;
};

export type MembroFuncaoInsert = Omit<MembroFuncaoRow, 'criado_por' | 'created_at'> &
  Partial<Pick<MembroFuncaoRow, 'criado_por' | 'created_at'>>;
export type MembroFuncaoUpdate = Partial<MembroFuncaoRow>;

export type Database = {
  public: {
    Tables: {
      membros: {
        Row: MembroRow;
        Insert: MembroInsert;
        Update: MembroUpdate;
        Relationships: [];
      };
      membro_funcoes: {
        Row: MembroFuncaoRow;
        Insert: MembroFuncaoInsert;
        Update: MembroFuncaoUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      tem_funcao: { Args: { _area: Area; _nivel?: FuncaoNivel }; Returns: boolean };
      is_admin_geral: { Args: Record<string, never>; Returns: boolean };
      gerencia_membros: { Args: Record<string, never>; Returns: boolean };
      is_ativo: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      member_status: MemberStatus;
      area: Area;
      funcao_nivel: FuncaoNivel;
    };
    CompositeTypes: Record<string, never>;
  };
};
