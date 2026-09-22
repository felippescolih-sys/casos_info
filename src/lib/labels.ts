import type { Area, AreaEspecialidade, FuncaoNivel, MemberStatus } from '@/types/database';

export const AREAS: Area[] = [
  'geral',
  'colih',
  'apresentacoes',
  'gvps',
  'especialidades',
  'facilitadores',
  'medicos',
];

export const areaLabel: Record<Area, string> = {
  geral: 'Administração geral',
  colih: 'COLIH',
  apresentacoes: 'Apresentações',
  gvps: 'GVPs',
  especialidades: 'Especialidades',
  facilitadores: 'Facilitadores',
  medicos: 'Lista de médicos',
};

/** Rótulo de exibição de uma função: pra `especialidades`, mostra a(s)
 * especialidade(s) clínica(s) do próprio membro em vez do nome genérico da área. */
export function funcaoAreaLabel(area: Area, especialidades?: AreaEspecialidade[]): string {
  if (area === 'especialidades' && especialidades?.length) {
    return especialidades.map((e) => areaEspecialidadeLabel[e]).join(', ');
  }
  return areaLabel[area];
}

export const nivelLabel: Record<FuncaoNivel, string> = {
  usuario: 'Usuário',
  ajudante: 'Ajudante',
  admin: 'Admin',
  superadmin: 'SuperAdmin',
};

/** Níveis atribuíveis em cada área: 'geral' só tem SuperAdmin (presidência/secretaria
 * e ajudantes — todos com acesso total); as demais áreas vão de Usuário (associação de
 * base, ex. "Membro COLIH") a Ajudante/Admin (coordenação daquela área). */
export function nivelOpcoesDe(area: Area): FuncaoNivel[] {
  return area === 'geral' ? ['superadmin'] : ['usuario', 'ajudante', 'admin'];
}

export const statusLabel: Record<MemberStatus, string> = {
  pendente: 'Pendente',
  ativo: 'Ativo',
  inativo: 'Inativo',
};

export const AREAS_ESPECIALIDADE: AreaEspecialidade[] = [
  'plantao',
  'ad_hepato_uro',
  'onco_hemato',
  'tmo',
  'orto_neuro',
  'cardio_torax',
  'geoneo',
];

export const areaEspecialidadeLabel: Record<AreaEspecialidade, string> = {
  plantao: 'PLANTÃO',
  ad_hepato_uro: 'AD-HEPATO-URO',
  onco_hemato: 'ONCO-HEMATO',
  tmo: 'TMO',
  orto_neuro: 'ORTO-NEURO',
  cardio_torax: 'CÁRDIO-TÓRAX',
  geoneo: 'GONeo',
};
