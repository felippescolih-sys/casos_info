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

/** Escala já gravada; alimenta "quem fez plantão há mais tempo" e a contagem do período. */
export type EscalaHistorico = Turno & { membro_id: string; ajudante_id: string | null };

type Chave = [number, number, number, number];

/**
 * Distribui os turnos de forma equilibrada. Para cada turno escolhe, entre os
 * disponíveis:
 *   1. quem tem menos turnos naquela função dentro do período gerado;
 *   2. no empate, quem tem menos turnos no total (responsável + ajudante) no período;
 *   3. no empate, quem fez plantão naquela função há mais tempo, olhando o histórico
 *      inteiro (quem nunca fez vem primeiro) — é isso que decide quem abre o mês;
 *   4. no empate, o próximo na ordem da lista depois do último escolhido.
 * Escalas já gravadas dentro do período contam na contagem como se tivessem sido
 * geradas. Turno sem ninguém disponível fica com `membro_id` nulo.
 */
export function gerarRodizio({
  turnos,
  responsaveis,
  ajudantes,
  disponivel,
  ocupados,
  historico = [],
}: {
  turnos: Turno[];
  responsaveis: string[];
  ajudantes: string[];
  disponivel: (membroId: string, turno: number) => boolean;
  ocupados: boolean[];
  historico?: EscalaHistorico[];
}): Atribuicao[] {
  const total = new Map<string, number>();
  const porFuncao = { resp: new Map<string, number>(), ajud: new Map<string, number>() };
  const ultimaVez = { resp: new Map<string, number>(), ajud: new Map<string, number>() };
  const ultimo = { resp: -1, ajud: -1 };
  const inicioPeriodo = turnos.length ? new Date(turnos[0].inicio).getTime() : Infinity;

  function registrar(funcao: 'resp' | 'ajud', id: string, inicio: number, contar: boolean) {
    ultimaVez[funcao].set(id, Math.max(ultimaVez[funcao].get(id) ?? -Infinity, inicio));
    if (!contar) return;
    porFuncao[funcao].set(id, (porFuncao[funcao].get(id) ?? 0) + 1);
    total.set(id, (total.get(id) ?? 0) + 1);
  }

  // O histórico entra em ordem cronológica, só até o turno que está sendo decidido:
  // uma escala gravada no meio do mês não pode influenciar os dias anteriores a ela.
  const passado = [...historico].sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
  );
  let proximoHistorico = 0;
  function aplicarHistoricoAte(momento: number) {
    while (
      proximoHistorico < passado.length &&
      new Date(passado[proximoHistorico].inicio).getTime() <= momento
    ) {
      const e = passado[proximoHistorico++];
      const inicio = new Date(e.inicio).getTime();
      const noPeriodo = inicio >= inicioPeriodo;
      registrar('resp', e.membro_id, inicio, noPeriodo);
      if (e.ajudante_id) registrar('ajud', e.ajudante_id, inicio, noPeriodo);
    }
  }

  function escolher(
    funcao: 'resp' | 'ajud',
    lista: string[],
    turno: number,
    exceto: string | null,
  ): string | null {
    let melhor: { id: string; pos: number; chave: Chave } | null = null;
    for (let pos = 0; pos < lista.length; pos++) {
      const id = lista[pos];
      if (id === exceto || !disponivel(id, turno)) continue;
      const distancia = (pos - ultimo[funcao] - 1 + lista.length) % lista.length;
      const chave: Chave = [
        porFuncao[funcao].get(id) ?? 0,
        total.get(id) ?? 0,
        ultimaVez[funcao].get(id) ?? -Infinity,
        distancia,
      ];
      if (!melhor || menor(chave, melhor.chave)) melhor = { id, pos, chave };
    }
    if (!melhor) return null;
    const { id, pos } = melhor;
    ultimo[funcao] = pos;
    registrar(funcao, id, new Date(turnos[turno].inicio).getTime(), true);
    return id;
  }

  return turnos.map((turno, i) => {
    aplicarHistoricoAte(new Date(turno.inicio).getTime());
    if (ocupados[i]) return { turno, membro_id: null, ajudante_id: null, ocupado: true };
    const membro_id = escolher('resp', responsaveis, i, null);
    const ajudante_id = membro_id && ajudantes.length ? escolher('ajud', ajudantes, i, membro_id) : null;
    return { turno, membro_id, ajudante_id, ocupado: false };
  });
}

function menor(a: Chave, b: Chave): boolean {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}
