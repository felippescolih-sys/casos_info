// HLC-33 (Apresentação realizada pela COLIH) em PDF: preenche o formulário oficial
// (`src/assets/hlc33.pdf`) com os dados da palestra. Mesmo cuidado do HLC-7: não achatar o
// formulário (o Acrobat recusa), só gravar a aparência de cada campo.
//
// Os nomes dos campos são os do PDF oficial ("900_8_Text_SanSerif"…); a posição de cada um foi
// conferida no próprio formulário. O pdf-lib só é carregado quando alguém pede o PDF.
import type { PalestraRow } from '@/types/database';
import { formatDateOnly } from '@/lib/format';
import hlc33Url from '@/assets/hlc33.pdf?url';

type Texto = string | null | undefined;

export async function preencherHlc33(
  modelo: ArrayBuffer,
  p: PalestraRow,
  membroNome: string | null,
): Promise<Uint8Array> {
  const { PDFDocument, PDFName, PDFArray, PDFDict, PDFRef, StandardFonts } = await import('pdf-lib');
  const pdf = await PDFDocument.load(modelo);

  // O modelo traz os 28 campos só como anotações da página: a lista de campos do formulário
  // (/AcroForm /Fields) está vazia, e o pdf-lib só enxerga o que está nela. Registra cada widget.
  const acro = pdf.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
  const campos = acro.lookup(PDFName.of('Fields'), PDFArray);
  if (campos.size() === 0) {
    const annots = pdf.getPage(0).node.lookup(PDFName.of('Annots'), PDFArray);
    for (let i = 0; i < annots.size(); i++) {
      const ref = annots.get(i);
      if (ref instanceof PDFRef && pdf.context.lookup(ref, PDFDict).get(PDFName.of('FT'))) {
        campos.push(ref);
      }
    }
  }

  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const form = pdf.getForm();

  // A fonte padrão (WinAnsi) cobre os acentos; o que ela não tem vira "?" em vez de quebrar.
  const aceitos = new Set(fonte.getCharacterSet());
  const limpo = (v: Texto) =>
    Array.from((v ?? '').normalize('NFC').replace(/\r\n?/g, '\n'))
      .map((ch) => (ch === '\n' || aceitos.has(ch.codePointAt(0)!) ? ch : '?'))
      .join('')
      .trim();

  // Até 10 pt; encolhe (até 5 pt) só quando o texto não cabe na caixa.
  const linhas = (t: string, largura: number, tam: number) =>
    t.split('\n').reduce((n, par) => {
      let q = 1;
      let atual = '';
      for (const palavra of par.split(' ')) {
        const tentativa = atual ? `${atual} ${palavra}` : palavra;
        if (atual && fonte.widthOfTextAtSize(tentativa, tam) > largura) {
          q++;
          atual = palavra;
        } else atual = tentativa;
      }
      return n + q;
    }, 0);
  const tamanhoQueCabe = (t: string, largura: number, altura: number, multilinha: boolean) => {
    for (let tam = 10; tam > 5; tam -= 0.5) {
      const cabe = multilinha
        ? linhas(t, largura, tam) * tam * 1.2 <= altura
        : fonte.widthOfTextAtSize(t, tam) <= largura;
      if (cabe) return tam;
    }
    return 5;
  };

  const texto = (campo: string, v: Texto) => {
    const t = limpo(v);
    if (!t) return;
    const f = form.getTextField(campo);
    const multilinha = f.isMultiline();
    const valor = multilinha ? t : t.replace(/\n+/g, ' ');
    const { width, height } = f.acroField.getWidgets()[0].getRectangle();
    f.setFontSize(tamanhoQueCabe(valor, width - 4, height - 4, multilinha));
    f.setText(valor);
  };
  const marca = (campo: string, v: boolean) => {
    if (v) form.getCheckBox(campo).check();
  };

  // ── Parte 1
  marca('900_1_CheckBox', p.finalidade === 'atualizacao');
  marca('900_2_CheckBox', p.finalidade === 'nova');
  marca('900_3_CheckBox', p.presencial);
  marca('900_4_CheckBox', p.online);
  marca('900_5_CheckBox', p.powerpoint);
  marca('900_6_CheckBox', p.display_exposicao);
  texto('900_7_Text_MultiLine_SanSerif', p.observacoes);

  // ── Parte 2 (coluna esquerda)
  texto('900_8_Text_SanSerif', formatDateOnly(p.data_apresentacao));
  texto('900_9_Text_SanSerif', p.qtd_participantes == null ? null : String(p.qtd_participantes));
  if (p.especialidade_participantes) {
    // As opções do PDF vêm com espaços no fim ("Oncology         ").
    const lista = form.getDropdown('900_10_HLC_Skills');
    const opcao = lista.getOptions().find((o) => o.trim() === p.especialidade_participantes);
    if (opcao) lista.select(opcao);
  }
  texto('900_11_Text_SanSerif', p.evento);
  texto('900_12_Text_SanSerif', p.coordenador_nome);
  // Contato do coordenador: duas linhas inteiras abaixo do rótulo; o que passar disso vai junto na segunda.
  const contato = limpo(p.coordenador_contato).split('\n').map((l) => l.trim()).filter(Boolean);
  texto('900_14_Text_SanSerif', contato[0]);
  texto('900_15_Text_SanSerif', contato.slice(1).join(' · '));

  // ── Parte 2 (coluna direita)
  texto('900_16_Text_SanSerif', p.site);
  texto('900_17_Text_SanSerif', p.local_nome);
  texto('900_18_Text_SanSerif', p.endereco);
  texto('900_19_Text_SanSerif', p.endereco_complemento);
  texto('900_20_Text_SanSerif', p.cidade);
  texto('900_21_Text_SanSerif', p.uf);
  texto('900_22_Text_SanSerif', p.cep);
  texto('900_23_Text_SanSerif', p.pais);
  texto('900_24_Text_MultiLine_SanSerif', p.problemas);
  texto('900_25_Text_MultiLine_SanSerif', p.experiencias);

  // ── Parte 3
  texto('900_26_Text_SanSerif', p.nome_colih);
  texto('900_27_Text_SanSerif', formatDateOnly(p.data_formulario));
  texto('900_28_Text_SanSerif', membroNome);

  form.updateFieldAppearances(fonte);
  return pdf.save();
}

export async function baixarHlc33Pdf(p: PalestraRow, membroNome: string | null) {
  const resp = await fetch(hlc33Url);
  if (!resp.ok) throw new Error('Não foi possível carregar o modelo do HLC-33. Recarregue a página e tente de novo.');
  const bytes = await preencherHlc33(await resp.arrayBuffer(), p, membroNome);

  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `HLC-33 ${p.data_apresentacao}${p.evento ? ` ${p.evento}` : ''}.pdf`.replace(/[\\/:*?"<>|]/g, '-');
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
