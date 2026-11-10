// Lista fixa "Especialidade dos participantes" do HLC-33. O formulário oficial traz as opções em
// inglês; o banco guarda o valor em inglês (o que vai no PDF) e a tela mostra o rótulo em português.
export const HLC33_ESPECIALIDADES: { valor: string; rotulo: string }[] = [
  { valor: 'Anesthesiology', rotulo: 'Anestesiologia' },
  { valor: 'Burn Care', rotulo: 'Queimados' },
  { valor: 'Cardiac Surgery', rotulo: 'Cirurgia cardíaca' },
  { valor: 'Colon and Rectal Surgery', rotulo: 'Coloproctologia' },
  { valor: 'Critical Care/Intensive Care', rotulo: 'Terapia intensiva (UTI)' },
  { valor: 'Emergency Medicine', rotulo: 'Medicina de emergência' },
  { valor: 'Otolaryngology-Head and Neck Surgery', rotulo: 'Otorrinolaringologia / cabeça e pescoço' },
  { valor: 'General Surgery', rotulo: 'Cirurgia geral' },
  { valor: 'Gastroenterology', rotulo: 'Gastroenterologia' },
  { valor: 'Gynecology', rotulo: 'Ginecologia' },
  { valor: 'Gynecologic Oncology', rotulo: 'Oncologia ginecológica' },
  { valor: 'Hematology', rotulo: 'Hematologia' },
  { valor: 'Perinatologist (High-Risk Pregnancy)', rotulo: 'Perinatologia (gestação de alto risco)' },
  { valor: 'Hospital Medicine', rotulo: 'Medicina hospitalar' },
  { valor: 'Internal Medicine', rotulo: 'Clínica médica' },
  { valor: 'Interventional Radiology', rotulo: 'Radiologia intervencionista' },
  { valor: 'Laborist', rotulo: 'Obstetra plantonista' },
  { valor: 'Neonatology', rotulo: 'Neonatologia' },
  { valor: 'Nephrology', rotulo: 'Nefrologia' },
  { valor: 'Neurosurgery', rotulo: 'Neurocirurgia' },
  { valor: 'Nocturnist', rotulo: 'Plantonista noturno' },
  { valor: 'Obstetrics', rotulo: 'Obstetrícia' },
  { valor: 'Oncology', rotulo: 'Oncologia' },
  { valor: 'Oral and Maxillofacial Surgery', rotulo: 'Cirurgia bucomaxilofacial' },
  { valor: 'Orthopedic Surgery', rotulo: 'Ortopedia' },
  { valor: 'Pulmonology', rotulo: 'Pneumologia' },
  { valor: 'Thoracic Surgery', rotulo: 'Cirurgia torácica' },
  { valor: 'Transplantation Surgery', rotulo: 'Cirurgia de transplantes' },
  { valor: 'Trauma Surgery', rotulo: 'Cirurgia do trauma' },
  { valor: 'Urology', rotulo: 'Urologia' },
  { valor: 'Vascular Surgery', rotulo: 'Cirurgia vascular' },
  { valor: 'Other', rotulo: 'Outra (estudantes, enfermagem, várias…)' },
];

export function rotuloEspecialidadeHlc33(valor: string | null | undefined): string {
  if (!valor) return '—';
  return HLC33_ESPECIALIDADES.find((e) => e.valor === valor)?.rotulo ?? valor;
}
