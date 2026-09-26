// Dias da semana da disponibilidade de plantão. Vive aqui, e não dentro de uma
// página, porque tanto "Minha conta" quanto o onboarding de primeiro acesso
// montam o mesmo conjunto de checkboxes.

export const DIAS_SEMANA = [
  { key: 'disp_seg', label: 'Seg' },
  { key: 'disp_ter', label: 'Ter' },
  { key: 'disp_qua', label: 'Qua' },
  { key: 'disp_qui', label: 'Qui' },
  { key: 'disp_sex', label: 'Sex' },
  { key: 'disp_sab', label: 'Sáb' },
  { key: 'disp_dom', label: 'Dom' },
] as const;

export type DiaSemanaKey = (typeof DIAS_SEMANA)[number]['key'];

export const TODOS_OS_DIAS: DiaSemanaKey[] = DIAS_SEMANA.map((d) => d.key);
export const DIAS_UTEIS: DiaSemanaKey[] = [
  'disp_seg',
  'disp_ter',
  'disp_qua',
  'disp_qui',
  'disp_sex',
];
export const FIM_DE_SEMANA: DiaSemanaKey[] = ['disp_sab', 'disp_dom'];
