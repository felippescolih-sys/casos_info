import type { Area, AreaEspecialidade, FuncaoNivel, MemberStatus } from '@/types/database';

export const AREAS: Area[] = [
  'geral',
  'apresentacoes',
  'gvps',
  'especialidades',
  'facilitadores',
  'medicos',
];

export const areaLabel: Record<Area, string> = {
  geral: 'Administração geral',
  apresentacoes: 'Apresentações',
  gvps: 'GVPs',
  especialidades: 'Especialidades',
  facilitadores: 'Facilitadores',
  medicos: 'Lista de médicos',
};

export const nivelLabel: Record<FuncaoNivel, string> = {
  admin: 'Admin',
  ajudante: 'Ajudante',
};

export const statusLabel: Record<MemberStatus, string> = {
  pendente: 'Pendente',
  ativo: 'Ativo',
  inativo: 'Inativo',
};

export const AREAS_ESPECIALIDADE: AreaEspecialidade[] = [
  'plantao',
  'ad_hepato_uro',
  'onco_hemato',
  'orto_neuro',
  'cardio_torax',
  'geoneo',
];

export const areaEspecialidadeLabel: Record<AreaEspecialidade, string> = {
  plantao: 'PLANTÃO',
  ad_hepato_uro: 'AD-HEPATO-URO',
  onco_hemato: 'ONCO-HEMATO',
  orto_neuro: 'ORTO-NEURO',
  cardio_torax: 'CÁRDIO-TÓRAX',
  geoneo: 'GEONeo',
};
