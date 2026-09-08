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

// ── Casos ────────────────────────────────────────────────────
export type CasoStatus = 'aberto' | 'encerrado';

export type ExameEntry = {
  data?: string;
  hb?: string;
  ht?: string;
  plq?: string;
  outro?: string;
};

export type CasoRow = {
  id: string;
  legacy_bubble_id: string;
  id_caso: string | null;
  numero: number | null;
  status: CasoStatus;

  // notificação
  data_hora_contato: string | null;
  contato_telefonou: string | null;

  paciente_nome: string | null;
  idade: string | null;
  sexo: string | null;
  uf: string | null;
  cidade: string | null;
  congregacao: string | null;
  comentario_plano: string | null;
  comentario_familia: string | null;
  batizado: boolean | null;
  boa_condicao_espiritual: boolean | null;
  cartao_diretivas_ok: boolean | null;
  mae_batizada: boolean | null;
  pai_batizado: boolean | null;
  nome_mae: string | null;
  nome_pai: string | null;

  // recém-nascido
  rn_peso: string | null;
  rn_idade_gestacional: string | null;
  rn_data_nascimento: string | null;
  rn_apgar_nascimento: string | null;
  rn_apgar_5min: string | null;

  hospital_nome: string | null;
  num_quarto: string | null;
  tele_hospital: string | null;
  plano_nome: string | null;
  tipo_atendimento: string | null;

  responsavel_id: string | null;
  responsavel_nome: string | null;
  ajudante_id: string | null;
  ajudante_nome: string | null;
  gvp_id: string | null;
  criado_por_id: string | null;

  nome_telefonou: string | null;
  parentesco_telefonou: string | null;
  paciente_solicitou_ajuda: boolean | null;
  acompanhante_nome: string | null;
  telefone_paciente: string | null;
  telefone_acompanhante: string | null;
  anciaos_contatados: string | null;
  anciaos_cont_tel: string | null;

  medico_responsavel: string | null;
  especialidade: string | null;
  outro_medico: string | null;
  outro_medico_especialidade: string | null;
  morbidade: string | null;
  info_medica: string | null;
  plano_tratamento: string | null;
  equipe_informada: boolean | null;
  equipe_coopera: boolean | null;
  estrategia: string | null;
  artigos_medicos: string | null;
  medico_disposto_cooperar: boolean | null;
  resumo: string | null;
  outras_infos: string | null;
  anciaos_acompanhamento: boolean | null;

  // médico consultor
  medico_consultor_nome: string | null;
  medico_consultor_contato: string | null;
  medico_consultor_especialidade: string | null;
  medico_consultor_outras: string | null;

  exames: ExameEntry[];
  anexos_urls: string[];

  // necessidade de transferência (mudança de hospital)
  transf_procedimentos_confirmados: boolean | null;
  transf_hid_informado: boolean | null;
  transf_hospital_destino: string | null;
  transf_medico_destino: string | null;
  transf_telefone_destino: string | null;

  // transferência de responsável (workflow interno)
  em_transferencia: boolean | null;
  transferencia_data: string | null;
  transferencia_historico: string | null;
  transferencia_pendente_para: string | null;
  transferencia_pendente_por: string | null;
  transferencia_pendente_em: string | null;
  transpac: boolean | null;
  transfundido: boolean | null;

  gvp: boolean | null;
  tags: string[];

  aberto_em: string | null;
  encerrado_em: string | null;
  atualizado_em_bubble: string | null;

  bubble_raw: Record<string, unknown>;
  imported_at: string;
  created_at: string;
  updated_at: string;
};

export type CasoInsert = Partial<CasoRow>;
export type CasoUpdate = Partial<Omit<CasoRow, 'id' | 'created_at'>>;

export type CasoResumoRow = Pick<
  CasoRow,
  | 'id'
  | 'legacy_bubble_id'
  | 'id_caso'
  | 'numero'
  | 'status'
  | 'paciente_nome'
  | 'responsavel_id'
  | 'responsavel_nome'
  | 'ajudante_id'
  | 'ajudante_nome'
  | 'hospital_nome'
  | 'congregacao'
  | 'cidade'
  | 'uf'
  | 'aberto_em'
  | 'encerrado_em'
  | 'atualizado_em_bubble'
  | 'tags'
  | 'em_transferencia'
  | 'transferencia_pendente_para'
>;

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
      casos: {
        Row: CasoRow;
        Insert: CasoInsert;
        Update: CasoUpdate;
        Relationships: [];
      };
      congregacoes: {
        Row: { nome: string; ativa: boolean; created_at: string };
        Insert: { nome: string; ativa?: boolean; created_at?: string };
        Update: { nome?: string; ativa?: boolean };
        Relationships: [];
      };
    };
    Views: {
      casos_resumo: {
        Row: CasoResumoRow;
        Relationships: [];
      };
    };
    Functions: {
      tem_funcao: { Args: { _area: Area; _nivel?: FuncaoNivel }; Returns: boolean };
      is_admin_geral: { Args: Record<string, never>; Returns: boolean };
      gerencia_membros: { Args: Record<string, never>; Returns: boolean };
      is_ativo: { Args: Record<string, never>; Returns: boolean };
      pode_operar_caso: { Args: { _caso_id: string }; Returns: boolean };
      transferir_caso: { Args: { _caso_id: string; _novo: string }; Returns: undefined };
      aceitar_transferencia: { Args: { _caso_id: string }; Returns: undefined };
      cancelar_transferencia: { Args: { _caso_id: string }; Returns: undefined };
      encerrar_caso: { Args: { _caso_id: string }; Returns: undefined };
      reabrir_caso: { Args: { _caso_id: string }; Returns: undefined };
    };
    Enums: {
      member_status: MemberStatus;
      area: Area;
      funcao_nivel: FuncaoNivel;
      caso_status: CasoStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
