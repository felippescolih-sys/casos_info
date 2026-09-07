import type { Area, FuncaoNivel, MemberStatus } from '@/types/database';

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
