import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  desfazerBaixa,
  excluirMedicamento,
  listMedicamentos,
  type Medicamento,
} from '@/lib/queries/medicamentos';
import { formatDateOnly } from '@/lib/format';
import { useAuth } from '@/auth/AuthProvider';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MedicamentoFormModal } from './MedicamentoFormModal';
import { BaixaModal } from './BaixaModal';
import {
  AVISO_VALIDADE_DIAS,
  formatReais,
  hojeBrasilia,
  situacaoValidade,
  type SituacaoValidade,
} from './medicamentosUtil';

type Aba = 'estoque' | 'historico';

const VALIDADE: Record<SituacaoValidade, { label: string; tom: string } | null> = {
  vencido: { label: 'Vencido', tom: 'bg-red-100 text-red-800' },
  vence_logo: { label: 'Vence logo', tom: 'bg-amber-100 text-amber-800' },
  ok: null,
  sem: null,
};

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const qtd = (m: Medicamento) => `${m.quantidade}${m.unidade ? ` ${m.unidade}` : ''}`;

export function MedicamentosPage() {
  const { membro, gerenciaMedicamentos } = useAuth();
  const qc = useQueryClient();
  const [aba, setAba] = useState<Aba>('estoque');
  const [busca, setBusca] = useState('');
  const [filtroMembro, setFiltroMembro] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [editando, setEditando] = useState<Medicamento | null | undefined>(undefined);
  const [baixando, setBaixando] = useState<Medicamento | null>(null);
  const [excluindo, setExcluindo] = useState<Medicamento | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['medicamentos'],
    queryFn: listMedicamentos,
  });

  const hoje = hojeBrasilia();
  const podeEditar = (m: Medicamento) =>
    gerenciaMedicamentos || m.criado_por === membro?.id || m.responsavel_id === membro?.id;

  const atualizar = (texto: string) => {
    setMsg(texto);
    void qc.invalidateQueries({ queryKey: ['medicamentos'] });
  };

  const excluir = useMutation({
    mutationFn: (m: Medicamento) => excluirMedicamento(m.id),
    onSuccess: (_r, m) => {
      setExcluindo(null);
      atualizar(`${m.medicamento} excluído.`);
    },
    onError: () => setExcluindo(null),
  });

  const desfazer = useMutation({
    mutationFn: (m: Medicamento) => desfazerBaixa(m.id),
    onSuccess: (_r, m) => atualizar(`${m.medicamento} voltou para o estoque.`),
  });

  const emEstoque = useMemo(() => (data ?? []).filter((m) => !m.baixado_em), [data]);

  // Pessoas que aparecem na aba atual, para o filtro "Com quem".
  const membrosDaLista = useMemo(() => {
    const porId = new Map<string, string>();
    for (const m of data ?? []) {
      if (!!m.baixado_em === (aba === 'historico')) porId.set(m.responsavel_id, m.responsavel_nome ?? '—');
    }
    return [...porId.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
  }, [data, aba]);

  const linhas = useMemo(() => {
    const termo = semAcento(busca.trim());
    const lista = (data ?? []).filter(
      (m) =>
        !!m.baixado_em === (aba === 'historico') &&
        (!filtroMembro || m.responsavel_id === filtroMembro) &&
        (!termo || semAcento(`${m.medicamento} ${m.dosagem}`).includes(termo)),
    );
    // Histórico: o que saiu por último primeiro.
    return aba === 'historico'
      ? lista.sort((a, b) => (b.baixado_em ?? '').localeCompare(a.baixado_em ?? ''))
      : lista;
  }, [data, aba, busca, filtroMembro]);

  const vencidos = emEstoque.filter((m) => situacaoValidade(m.validade, hoje) === 'vencido').length;
  const vencendo = emEstoque.filter((m) => situacaoValidade(m.validade, hoje) === 'vence_logo').length;
  const totalComprado = linhas.reduce((s, m) => s + (m.valor === null ? 0 : Number(m.valor)), 0);
  const doacoes = linhas.filter((m) => m.origem === 'doacao').length;
  const erro = error ?? excluir.error ?? desfazer.error;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Medicamentos</h1>
          <p className="text-sm text-gray-500">
            Medicamentos que a COLIH tem em estoque e com quem cada um está.
          </p>
        </div>
        <Button
          onClick={() => {
            setMsg(null);
            setEditando(null);
          }}
        >
          Lançar medicamento
        </Button>
      </div>

      {msg && <Alert tone="success">{msg}</Alert>}
      {erro && <Alert tone="error">{(erro as Error).message}</Alert>}
      {(vencidos > 0 || vencendo > 0) && (
        <Alert tone="warning">
          {[
            vencidos > 0 && `${vencidos} ${vencidos === 1 ? 'lançamento vencido' : 'lançamentos vencidos'}`,
            vencendo > 0 &&
              `${vencendo} ${vencendo === 1 ? 'vence' : 'vencem'} nos próximos ${AVISO_VALIDADE_DIAS} dias`,
          ]
            .filter(Boolean)
            .join(' · ')}
          . Dê baixa no que for descartado.
        </Alert>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        {(
          [
            ['estoque', `Em estoque (${emEstoque.length})`],
            ['historico', 'Histórico de saídas'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setAba(id);
              setFiltroMembro('');
            }}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium',
              aba === id
                ? 'border-brand-700 text-brand-800'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-full sm:w-72">
          <Field label="Buscar" htmlFor="med_busca">
            <Input
              id="med_busca"
              placeholder="Nome ou dosagem"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </Field>
        </div>
        <div className="w-full sm:w-64">
          <Field label="Com quem" htmlFor="med_filtro_membro">
            <Select
              id="med_filtro_membro"
              value={filtroMembro}
              onChange={(e) => setFiltroMembro(e.target.value)}
            >
              <option value="">Todos</option>
              {membrosDaLista.map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {!!linhas.length && (
          <p className="pb-2 text-sm text-gray-600">
            {linhas.length} {linhas.length === 1 ? 'lançamento' : 'lançamentos'}
            {totalComprado > 0 && ` · ${formatReais(totalComprado)} em compras`}
            {doacoes > 0 && ` · ${doacoes} ${doacoes === 1 ? 'doação' : 'doações'}`}
          </p>
        )}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !linhas.length ? (
          <p className="p-8 text-center text-sm text-gray-500">
            {busca || filtroMembro
              ? 'Nada encontrado com esses filtros.'
              : aba === 'estoque'
                ? 'Nenhum medicamento em estoque. Use "Lançar medicamento" para cadastrar.'
                : 'Nenhuma saída registrada ainda.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                {aba === 'estoque' ? (
                  <tr>
                    <th className="px-4 py-3">Medicação</th>
                    <th className="px-4 py-3">Quantidade</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Com quem</th>
                    <th className="px-4 py-3" />
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3">Medicação</th>
                    <th className="px-4 py-3">Quantidade</th>
                    <th className="px-4 py-3">Saiu em</th>
                    <th className="px-4 py-3">Para onde</th>
                    <th className="px-4 py-3">Estava com</th>
                    <th className="px-4 py-3" />
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {linhas.map((m) => {
                  const situacao = VALIDADE[situacaoValidade(m.validade, hoje)];
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{m.medicamento}</div>
                        <div className="text-xs text-gray-500">{m.dosagem}</div>
                        {m.observacoes && <div className="mt-0.5 text-xs text-gray-500">{m.observacoes}</div>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700">{qtd(m)}</td>
                      {aba === 'estoque' ? (
                        <>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                            {formatDateOnly(m.validade)}
                            {situacao && (
                              <span
                                className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${situacao.tom}`}
                              >
                                {situacao.label}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                            {m.origem === 'doacao' ? (
                              <span className="text-green-700">Doação</span>
                            ) : (
                              formatReais(m.valor)
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{m.responsavel_nome ?? '—'}</td>
                        </>
                      ) : (
                        <>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                            {formatDateOnly(m.baixado_em)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div>{m.baixa_destino ?? '—'}</div>
                            <div className="text-xs text-gray-500">
                              {[
                                m.baixa_caso_numero &&
                                  `Caso nº ${m.baixa_caso_numero}${m.baixa_paciente ? ` — ${m.baixa_paciente}` : ''}`,
                                m.baixado_por_nome && `baixa por ${m.baixado_por_nome}`,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{m.responsavel_nome ?? '—'}</td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right">
                        {podeEditar(m) && (
                          <div className="flex justify-end gap-1">
                            {aba === 'estoque' ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setMsg(null);
                                    setBaixando(m);
                                  }}
                                >
                                  Dar baixa
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setMsg(null);
                                    setEditando(m);
                                  }}
                                >
                                  Editar
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                loading={desfazer.isPending && desfazer.variables?.id === m.id}
                                onClick={() => desfazer.mutate(m)}
                              >
                                Voltar ao estoque
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setExcluindo(m)}>
                              Excluir
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <MedicamentoFormModal
        editando={editando}
        onClose={() => setEditando(undefined)}
        onSaved={(texto) => {
          setEditando(undefined);
          atualizar(texto);
        }}
      />

      {/* `key`: o limite da quantidade muda a cada medicamento, então o formulário recomeça do zero. */}
      <BaixaModal
        key={baixando?.id ?? 'fechado'}
        medicamento={baixando}
        onClose={() => setBaixando(null)}
        onSaved={(texto) => {
          setBaixando(null);
          atualizar(texto);
        }}
      />

      <ConfirmDialog
        open={!!excluindo}
        title="Excluir este lançamento?"
        danger
        loading={excluir.isPending}
        confirmLabel="Excluir"
        onConfirm={() => excluindo && excluir.mutate(excluindo)}
        onCancel={() => setExcluindo(null)}
      >
        {excluindo &&
          `${excluindo.medicamento} ${excluindo.dosagem} (${qtd(excluindo)}). Para registrar que a medicação foi usada, use "Dar baixa": assim fica no histórico. Excluir não pode ser desfeito.`}
      </ConfirmDialog>
    </div>
  );
}
