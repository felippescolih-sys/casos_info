// Rodízio da escala de plantão gerada em lote. Função pura: quem decide quem está
// disponível é o servidor (`disponibilidade_plantao_lote`); aqui só se distribui.

export type Turno = { inicio: string; fim: string };

export type Atribuicao = {
  turno: Turno;
  membro_id: string | null;
  ajudante_id: string | null;
  /** Já existe escala cobrindo parte deste período: o turno é pulado. */
  ocupado: boolean;
};

// Mesmo horário padrão do formulário de escala avulsa: o plantão cobre o dia inteiro.
function noDia(dataIso: string, h: number, m: number): Date {
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  return new Date(ano, mes - 1, dia, h, m);
}

/**
 * Corta [de, ate] (datas `YYYY-MM-DD`, inclusivas) em turnos de `diasPorTurno` dias,
 * cada um de 00:00 do primeiro dia a 23:59 do último. O último turno encolhe para
 * não passar de `ate`.
 */
export function montarTurnos(de: string, ate: string, diasPorTurno: number): Turno[] {
  const turnos: Turno[] = [];
  const fimGeral = noDia(ate, 23, 59);
  const cursor = noDia(de, 0, 0);
  while (cursor <= fimGeral) {
    const fim = new Date(cursor);
    fim.setDate(fim.getDate() + diasPorTurno - 1);
    fim.setHours(23, 59, 0, 0);
    turnos.push({
      inicio: cursor.toISOString(),
      fim: (fim > fimGeral ? fimGeral : fim).toISOString(),
    });
    cursor.setDate(cursor.getDate() + diasPorTurno);
  }
  return turnos;
}

export function sobrepoe(a: Turno, b: Turno): boolean {
  return new Date(a.inicio) < new Date(b.fim) && new Date(b.inicio) < new Date(a.fim);
}

/**
 * Distribui os turnos de forma equilibrada. Para cada turno escolhe, entre os
 * disponíveis, quem tem menos turnos naquela função até aqui; no empate, quem tem
 * menos turnos no total (responsável + ajudante); no empate de novo, o próximo na
 * ordem da lista depois do último escolhido — o que dá um rodízio redondo quando
 * ninguém tem restrição. Turno sem ninguém disponível fica com `membro_id` nulo.
 */
export function gerarRodizio({
  turnos,
  responsaveis,
  ajudantes,
  disponivel,
  ocupados,
}: {
  turnos: Turno[];
  responsaveis: string[];
  ajudantes: string[];
  disponivel: (membroId: string, turno: number) => boolean;
  ocupados: boolean[];
}): Atribuicao[] {
  const total = new Map<string, number>();
  const porFuncao = { resp: new Map<string, number>(), ajud: new Map<string, number>() };
  const ultimo = { resp: -1, ajud: -1 };

  function escolher(
    funcao: 'resp' | 'ajud',
    lista: string[],
    turno: number,
    exceto: string | null,
  ): string | null {
    let melhor: { id: string; pos: number; chave: [number, number, number] } | null = null;
    for (let pos = 0; pos < lista.length; pos++) {
      const id = lista[pos];
      if (id === exceto || !disponivel(id, turno)) continue;
      const distancia = (pos - ultimo[funcao] - 1 + lista.length) % lista.length;
      const chave: [number, number, number] = [
        porFuncao[funcao].get(id) ?? 0,
        total.get(id) ?? 0,
        distancia,
      ];
      if (!melhor || menor(chave, melhor.chave)) melhor = { id, pos, chave };
    }
    if (!melhor) return null;
    const { id, pos } = melhor;
    ultimo[funcao] = pos;
    porFuncao[funcao].set(id, (porFuncao[funcao].get(id) ?? 0) + 1);
    total.set(id, (total.get(id) ?? 0) + 1);
    return id;
  }

  return turnos.map((turno, i) => {
    if (ocupados[i]) return { turno, membro_id: null, ajudante_id: null, ocupado: true };
    const membro_id = escolher('resp', responsaveis, i, null);
    const ajudante_id = membro_id && ajudantes.length ? escolher('ajud', ajudantes, i, membro_id) : null;
    return { turno, membro_id, ajudante_id, ocupado: false };
  });
}

function menor(a: [number, number, number], b: [number, number, number]): boolean {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}
