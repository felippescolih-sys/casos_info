// HLC-7 (Planilha de Emergência Médica) em PDF: preenche o formulário oficial
// (`src/assets/hlc7.pdf`, com campos de formulário) com os dados do caso.
// Os nomes dos campos são os do PDF original, alguns sem sentido ("undefined_2",
// "Depois que o médico…" é a caixa de texto dos artigos médicos); a posição de
// cada um foi conferida no próprio formulário.
//
// O pdf-lib (~500 KB) só é carregado quando alguém pede o PDF.
import type { CasoRow } from '@/types/database';
import hlc7Url from '@/assets/hlc7.pdf?url';

type Texto = string | null | undefined;

export async function preencherHlc7(modelo: ArrayBuffer, c: CasoRow): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const pdf = await PDFDocument.load(modelo);
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const form = pdf.getForm();

  // A fonte padrão (WinAnsi) cobre os acentos do português, mas não símbolos
  // como ≥ ou emoji: os comuns em exame são trocados, o resto vira "?" em vez de
  // quebrar a geração.
  const aceitos = new Set(fonte.getCharacterSet());
  const trocas: Record<string, string> = { 'μ': 'µ', '≥': '>=', '≤': '<=', '→': '->' };
  const limpo = (v: Texto) =>
    Array.from((v ?? '').normalize('NFC').replace(/\r\n?/g, '\n'))
      .map((ch) => trocas[ch] ?? ch)
      .map((ch) => (ch === '\n' || aceitos.has(ch.codePointAt(0)!) ? ch : '?'))
      .join('')
      .trim();

  // Até 9 pt; encolhe (até 5 pt) só quando o texto não cabe na caixa.
  const quebrar = (t: string, largura: number, tam: number) =>
    t.split('\n').reduce((n, par) => {
      let linhas = 1;
      let atual = '';
      for (const palavra of par.split(' ')) {
        const tentativa = atual ? `${atual} ${palavra}` : palavra;
        if (atual && fonte.widthOfTextAtSize(tentativa, tam) > largura) {
          linhas++;
          atual = palavra;
        } else atual = tentativa;
      }
      return n + linhas;
    }, 0);
  const tamanhoQueCabe = (t: string, largura: number, altura: number, multilinha: boolean) => {
    for (let tam = 9; tam > 5; tam -= 0.5) {
      const cabe = multilinha
        ? quebrar(t, largura, tam) * tam * 1.2 <= altura
        : fonte.widthOfTextAtSize(t, tam) <= largura;
      if (cabe) return tam;
    }
    return 5;
  };

  const texto = (campo: string, v: Texto) => {
    const t = limpo(v);
    if (!t) return;
    const f = form.getTextField(campo);
    const { width, height } = f.acroField.getWidgets()[0].getRectangle();
    f.setFontSize(tamanhoQueCabe(t, width - 4, height - 4, f.isMultiline()));
    f.setText(t);
  };
  const marca = (campo: string, v: boolean | null | undefined) => {
    if (v) form.getCheckBox(campo).check();
  };
  // Especialidades são listas fixas no PDF; liberando a edição, aceita o texto do caso.
  const lista = (campo: string, v: Texto) => {
    const f = form.getDropdown(campo);
    f.clear();
    const t = limpo(v);
    if (!t) return;
    f.enableEditing();
    f.select(t);
  };
  const juntar = (...partes: Texto[]) => partes.map(limpo).filter(Boolean).join('\n\n');

  // ── Notificação
  texto('Datahora do contato', c.data_hora_contato);
  texto('Quem telefonou', c.nome_telefonou);
  texto('Contato da pessoa que telefonou', c.contato_telefonou);
  marca('undefined', c.paciente_solicitou_ajuda);
  texto('Parentesco com o paciente', c.parentesco_telefonou);

  // ── Paciente e hospital
  texto('Nome do paciente', c.paciente_nome);
  const sexo = form.getDropdown('Sexo'); // o PDF vem com "Masculino" marcado
  sexo.clear();
  const s = limpo(c.sexo).toLowerCase();
  if (s.startsWith('m')) sexo.select('Masculino');
  else if (s.startsWith('f')) sexo.select('Feminino');
  texto('Comentários', c.comentario_plano);
  texto('Idade', c.idade);
  marca('Batizado_2', c.batizado);
  marca('Boa condição', c.boa_condicao_espiritual);
  marca('Cartão Diretivas', c.cartao_diretivas_ok);
  texto('Nome do hospital', c.hospital_nome);
  texto('N do quarto', c.num_quarto);
  texto('Telefone', c.tele_hospital);
  texto('Congregação', c.congregacao);
  texto('Nomes dos anciãos contatados', c.anciaos_contatados);
  texto('Telefones de contato dos anciãos', c.anciaos_cont_tel);

  // ── Menor de idade / recém-nascido
  texto('Nome do pai', c.nome_pai);
  marca('undefined_2', c.pai_batizado);
  texto('Nome da mãe', c.nome_mae);
  marca('undefined_3', c.mae_batizada);
  texto('Comentários condição espiritual da família etc', c.comentario_familia);
  texto('Peso ao nascer', c.rn_peso);
  texto('Idade gestacional semanas', c.rn_idade_gestacional);
  texto('Data de nascimento', c.rn_data_nascimento);
  texto('Nascimento', c.rn_apgar_nascimento);
  texto('5 min', c.rn_apgar_5min);

  // ── Informações médicas (uma caixa só no PDF para os dois assuntos)
  texto(
    'Problema específico Qual é o diagnóstico médico Por que a questão do sangue está envolvida pex sangramento bebê prematuro anemia Histórico de saúde ligado ao problema O que causou a emergência atualRow1',
    juntar(c.problema_especifico, c.info_medica),
  );

  // ── Valores laboratoriais: 3 blocos, na mesma ordem do formulário do caso
  ['', '2', '3'].forEach((sufixo, i) => {
    const e = c.exames[i];
    if (!e) return;
    texto(`Data/hora do exame${sufixo}`, e.data);
    texto(`Hemoglobina${sufixo}`, e.hb);
    texto(`Hematócrito${sufixo}`, e.ht);
    texto(`Plaquetas${sufixo}`, e.plq);
    texto(`Outro${sufixo}`, e.outro);
  });

  // ── Médicos ("Contato" e a coluna ao lado ficam em branco: o caso não guarda o contato do médico)
  texto('Médico responsável', c.medico_responsavel);
  lista('Dropdown2', c.especialidade);
  texto('Outro médico', c.outro_medico);
  lista('Dropdown3', c.outro_medico_especialidade);
  for (const campo of ['Contato', 'Contato2', 'Contato3', 'Contato4', 'Contato5']) {
    form.getDropdown(campo).clear();
  }

  // ── Plano de tratamento
  marca('undefined_4', c.equipe_informada);
  texto('A equipe médica foi informada de que o paciente pediu ajuda da Colih', c.plano_tratamento);

  // ── Página 2
  texto(
    'ESTRATÉGIASOPÇÕES DE TRATAMENTO Especifique os tratamentos procedimentos ou técnicas a serem apresentados aos médicosRow1',
    c.estrategia,
  );
  texto('Depois que o médico analisou os artigos que servem de apoio ele está disposto a cooperar', c.artigos_medicos);
  marca(
    'Depois que o médico analisou os artigos que servem de apoio ele está disposto a cooperar_2',
    c.medico_disposto_cooperar,
  );

  texto('Nome do médico consultor', c.medico_consultor_nome);
  lista('Especialiadade3', c.medico_consultor_especialidade);
  texto('Outras informações', c.medico_consultor_outras);
  texto('Preferências de contato do médico consultor', c.medico_consultor_contato);

  marca('Os procedimentos para a transferência já foram confirmados', c.transf_procedimentos_confirmados);
  marca('O HID já foi informado se a transferência for para a região de outra Colih', c.transf_hid_informado);
  texto('Nome do hospital para onde o paciente será transferido', c.transf_hospital_destino);
  texto('Médico responsável do hospital para onde o paciente será transferido', c.transf_medico_destino);
  texto('Telefone de contato do hospital para onde o paciente será transferido', c.transf_telefone_destino);
  texto('Outras informações_2', c.outras_infos);

  marca('Os anciãos locais foram contatados para dar acompanhamento_2', c.anciaos_acompanhamento);
  texto('Os anciãos locais foram contatados para dar acompanhamento', c.resumo);

  // Achata o formulário: o PDF sai igual em qualquer leitor (WhatsApp, celular, impressão).
  form.updateFieldAppearances(fonte);
  form.flatten();
  return pdf.save();
}

export async function baixarHlc7Pdf(c: CasoRow) {
  const resp = await fetch(hlc7Url);
  if (!resp.ok) throw new Error('Não foi possível carregar o modelo do HLC-7. Recarregue a página e tente de novo.');
  const bytes = await preencherHlc7(await resp.arrayBuffer(), c);

  // Sem o nome do paciente no nome do arquivo: o código do caso basta para achá-lo.
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `HLC-7 ${c.id_caso ?? c.numero ?? 'caso'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
