import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  chaveDisp,
  criarEscalasLote,
  disponibilidadeLote,
  type EscalaComNomes,
} from '@/lib/queries/escalas';
import { listMembrosColihAtivos } from '@/lib/queries/membros';
import { gerarRodizio, montarTurnos, sobrepoe, type Atribuicao } from '@/lib/rodizio';
import { formatDateTime } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

// ~3 meses de plantão diário. Acima disso a prévia fica ilegível e o aviso de
// WhatsApp vira um textão; quem precisar de mais gera em duas vezes.
const MAX_TURNOS = 93;

const DURACOES = [
  { dias: 1, label: '1 dia' },
  { dias: 2, label: '2 dias' },
  { dias: 3, label: '3 dias' },
  { dias: 7, label: '1 semana' },
];

function dataLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Padrão: o mês que vem inteiro, que é o caso comum de quem monta a escala.
function proximoMes(): { de: string; ate: string } {
  const hoje = new Date();
  return {
    de: dataLocal(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)),
    ate: dataLocal(new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0)),
  };
}

type Previa = { atribuicoes: Atribuicao[]; disp: Map<string, boolean> };

export function GerarEscalaLoteDialog({
  existentes,
  onClose,
  onSaved,
}: {
  existentes: EscalaComNomes[];
  onClose: () => void;
  onSaved: (criadas: number) => void;
}) {
  const { data: membros, isLoading: carregandoMembros } = useQuery({
    queryKey: ['membros-colih-ativos'],
    queryFn: listMembrosColihAtivos,
  });

  const padrao = useMemo(proximoMes, []);
  const [de, setDe] = useState(padrao.de);
  const [ate, setAte] = useState(padrao.ate);
  const [diasPorTurno, setDiasPorTurno] = useState(1);
  // `null` = ainda não mexeu: todos os membros entram como responsáveis.
  const [responsaveis, setResponsaveis] = useState<string[] | null>(null);
  const [ajudantes, setAjudantes] = useState<string[]>([]);

  const [previa, setPrevia] = useState<Previa | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const todos = useMemo(() => membros ?? [], [membros]);
  const resp = responsaveis ?? todos.map((m) => m.id);
  const nomePorId = useMemo(() => new Map(todos.map((m) => [m.id, m.nome])), [todos]);
  // A ordem da lista é a ordem do rodízio; os nomes vêm em ordem alfabética.
  const emOrdem = (ids: string[]) => todos.map((m) => m.id).filter((id) => ids.includes(id));

  function alternar(lista: string[], id: string, ativo: boolean): string[] {
    return ativo ? [...lista, id] : lista.filter((x) => x !== id);
  }

  async function gerarPrevia() {
    setErro(null);
    if (!de || !ate || ate < de) {
      setErro('O fim do período precisa ser no mesmo dia ou depois do início.');
      return;
    }
    if (!resp.length) {
      setErro('Escolha pelo menos um responsável.');
      return;
    }
    const turnos = montarTurnos(de, ate, diasPorTurno);
    if (turnos.length > MAX_TURNOS) {
      setErro(`São ${turnos.length} turnos; o máximo por vez é ${MAX_TURNOS}. Encurte o período.`);
      return;
    }

    setCarregando(true);
    try {
      const pool = [...new Set([...resp, ...ajudantes])];
      const disp = await disponibilidadeLote(pool, turnos);
      const atribuicoes = gerarRodizio({
        turnos,
        responsaveis: emOrdem(resp),
        ajudantes: emOrdem(ajudantes),
        disponivel: (id, i) => disp.get(chaveDisp(id, i)) ?? false,
        ocupados: turnos.map((t) => existentes.some((e) => sobrepoe(t, e))),
      });
      setPrevia({ atribuicoes, disp });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao consultar disponibilidade.');
    } finally {
      setCarregando(false);
    }
  }

  function trocar(i: number, campo: 'membro_id' | 'ajudante_id', valor: string) {
    setPrevia((p) =>
      p && {
        ...p,
        atribuicoes: p.atribuicoes.map((a, j) => (j === i ? { ...a, [campo]: valor || null } : a)),
      },
    );
  }

  const problemaDe = (a: Atribuicao, i: number): string | null => {
    if (a.ocupado || !previa) return null;
    if (a.ajudante_id && !a.membro_id) return 'Ajudante sem responsável.';
    if (a.membro_id && a.membro_id === a.ajudante_id) return 'Mesma pessoa nas duas funções.';
    for (const id of [a.membro_id, a.ajudante_id]) {
      if (id && previa.disp.get(chaveDisp(id, i)) === false) {
        return `${nomePorId.get(id) ?? 'Membro'} está indisponível neste período.`;
      }
    }
    return null;
  };

  const aCriar = previa?.atribuicoes.filter((a) => !a.ocupado && a.membro_id) ?? [];
  const temProblema = previa?.atribuicoes.some((a, i) => problemaDe(a, i)) ?? false;
  const semNinguem = previa?.atribuicoes.filter((a) => !a.ocupado && !a.membro_id).length ?? 0;
  const pulados = previa?.atribuicoes.filter((a) => a.ocupado).length ?? 0;

  const contagem = (() => {
    const c = new Map<string, { resp: number; ajud: number }>();
    for (const a of aCriar) {
      if (a.membro_id) {
        const v = c.get(a.membro_id) ?? { resp: 0, ajud: 0 };
        c.set(a.membro_id, { ...v, resp: v.resp + 1 });
      }
      if (a.ajudante_id) {
        const v = c.get(a.ajudante_id) ?? { resp: 0, ajud: 0 };
        c.set(a.ajudante_id, { ...v, ajud: v.ajud + 1 });
      }
    }
    return [...c.entries()].sort((x, y) =>
      (nomePorId.get(x[0]) ?? '').localeCompare(nomePorId.get(y[0]) ?? ''),
    );
  })();

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      const criadas = await criarEscalasLote(
        aCriar.map((a) => ({
          membro_id: a.membro_id!,
          ajudante_id: a.ajudante_id,
          inicio: a.turno.inicio,
          fim: a.turno.fim,
        })),
      );
      onSaved(criadas);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar escalas.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open
      title="Gerar escala em lote"
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
      dismissible={!salvando}
    >
      <div className="space-y-4">
        {erro && <Alert tone="error">{erro}</Alert>}

        {!previa ? (
          carregandoMembros ? (
            <div className="flex justify-center p-8 text-gray-400">
              <Spinner className="size-6" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="De" htmlFor="lote_de">
                  <Input id="lote_de" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
                </Field>
                <Field label="Até" htmlFor="lote_ate">
                  <Input id="lote_ate" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
                </Field>
                <Field label="Cada plantão dura" htmlFor="lote_duracao">
                  <Select
                    id="lote_duracao"
                    value={diasPorTurno}
                    onChange={(e) => setDiasPorTurno(Number(e.target.value))}
                  >
                    {DURACOES.map((d) => (
                      <option key={d.dias} value={d.dias}>
                        {d.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ListaMembros
                  titulo="Responsáveis no rodízio"
                  membros={todos}
                  selecionados={resp}
                  onToggle={(id, ativo) => setResponsaveis(alternar(resp, id, ativo))}
                />
                <ListaMembros
                  titulo="Ajudantes no rodízio (opcional)"
                  membros={todos}
                  selecionados={ajudantes}
                  onToggle={(id, ativo) => setAjudantes(alternar(ajudantes, id, ativo))}
                />
              </div>

              <p className="text-xs text-gray-500">
                Os plantões são distribuídos por igual entre quem está disponível em cada período
                (ausências e dias da semana de cada membro). Períodos que já têm escala são pulados.
                Você revisa e ajusta antes de criar.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="button" loading={carregando} onClick={gerarPrevia}>
                  Ver prévia
                </Button>
              </div>
            </>
          )
        ) : (
          <>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-brand-50 px-2 py-1 text-brand-800">
                {aCriar.length} a criar
              </span>
              {pulados > 0 && (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-700">
                  {pulados} já com escala (pulados)
                </span>
              )}
              {semNinguem > 0 && (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-800">
                  {semNinguem} sem ninguém disponível
                </span>
              )}
            </div>

            <div className="max-h-[45vh] overflow-auto rounded-md ring-1 ring-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Período</th>
                    <th className="px-3 py-2">Responsável</th>
                    {ajudantes.length > 0 && <th className="px-3 py-2">Ajudante</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previa.atribuicoes.map((a, i) => {
                    const problema = problemaDe(a, i);
                    return (
                      <tr key={a.turno.inicio} className={a.ocupado ? 'bg-gray-50 text-gray-400' : ''}>
                        <td className="whitespace-nowrap px-3 py-2 align-top">
                          {formatDateTime(a.turno.inicio)}
                          <span className="text-gray-400"> → </span>
                          {formatDateTime(a.turno.fim)}
                          {problema && <p className="text-xs text-red-600">{problema}</p>}
                          {!problema && !a.ocupado && !a.membro_id && (
                            <p className="text-xs text-amber-600">
                              Ninguém disponível — não será criado.
                            </p>
                          )}
                        </td>
                        {a.ocupado ? (
                          <td className="px-3 py-2" colSpan={ajudantes.length > 0 ? 2 : 1}>
                            Já tem escala neste período
                          </td>
                        ) : (
                          <>
                            <td className="px-3 py-2">
                              <SeletorMembro
                                valor={a.membro_id}
                                opcoes={emOrdem(resp)}
                                nomePorId={nomePorId}
                                disponivel={(id) => previa.disp.get(chaveDisp(id, i)) !== false}
                                vazio="— não criar"
                                onChange={(v) => trocar(i, 'membro_id', v)}
                              />
                            </td>
                            {ajudantes.length > 0 && (
                              <td className="px-3 py-2">
                                <SeletorMembro
                                  valor={a.ajudante_id}
                                  opcoes={emOrdem(ajudantes)}
                                  nomePorId={nomePorId}
                                  disponivel={(id) => previa.disp.get(chaveDisp(id, i)) !== false}
                                  vazio="— sem ajudante"
                                  onChange={(v) => trocar(i, 'ajudante_id', v)}
                                />
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {contagem.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Plantões por pessoa
                </p>
                <ul className="flex flex-wrap gap-2 text-xs text-gray-700">
                  {contagem.map(([id, c]) => (
                    <li key={id} className="rounded-md bg-gray-100 px-2 py-1">
                      {nomePorId.get(id) ?? '—'}: {c.resp}
                      {c.ajud > 0 && <span className="text-gray-500"> + {c.ajud} como ajudante</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Cada pessoa escalada recebe um único WhatsApp com todos os seus plantões.
            </p>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={salvando}
                onClick={() => setPrevia(null)}
              >
                Voltar
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={salvando}
                loading={carregando}
                onClick={gerarPrevia}
              >
                Redistribuir
              </Button>
              <Button
                type="button"
                loading={salvando}
                disabled={!aCriar.length || temProblema}
                onClick={salvar}
              >
                Criar {aCriar.length} {aCriar.length === 1 ? 'escala' : 'escalas'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function ListaMembros({
  titulo,
  membros,
  selecionados,
  onToggle,
}: {
  titulo: string;
  membros: { id: string; nome: string }[];
  selecionados: string[];
  onToggle: (id: string, ativo: boolean) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700">
        {titulo} <span className="font-normal text-gray-400">({selecionados.length})</span>
      </p>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md p-2 ring-1 ring-gray-200">
        {membros.map((m) => (
          <label key={m.id} className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
              checked={selecionados.includes(m.id)}
              onChange={(e) => onToggle(m.id, e.target.checked)}
            />
            {m.nome}
          </label>
        ))}
      </div>
    </div>
  );
}

function SeletorMembro({
  valor,
  opcoes,
  nomePorId,
  disponivel,
  vazio,
  onChange,
}: {
  valor: string | null;
  opcoes: string[];
  nomePorId: Map<string, string>;
  disponivel: (id: string) => boolean;
  vazio: string;
  onChange: (valor: string) => void;
}) {
  return (
    <Select value={valor ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{vazio}</option>
      {opcoes.map((id) => (
        <option key={id} value={id}>
          {nomePorId.get(id)}
          {disponivel(id) ? '' : ' (indisponível)'}
        </option>
      ))}
    </Select>
  );
}
