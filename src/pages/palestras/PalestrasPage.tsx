import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { excluirPalestra, listPalestras, type Palestra } from '@/lib/queries/palestras';
import { baixarHlc33Pdf } from '@/lib/hlc33Pdf';
import { rotuloEspecialidadeHlc33 } from '@/lib/hlc33';
import { formatDateOnly } from '@/lib/format';
import { useAuth } from '@/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Select } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const anoAtual = Number(
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric' }).format(new Date()),
);
const ANOS = Array.from({ length: anoAtual - 2019 }, (_, i) => anoAtual - i);

const tipos = (p: Palestra) =>
  [
    p.presencial && 'Presencial',
    p.online && 'On-line',
    p.powerpoint && 'PowerPoint',
    p.display_exposicao && 'Display',
  ]
    .filter(Boolean)
    .join(', ') || '—';

export function PalestrasPage() {
  const { membro, gerenciaPalestras } = useAuth();
  const qc = useQueryClient();
  const [ano, setAno] = useState(anoAtual);
  const [msg, setMsg] = useState<string | null>(null);
  const [erroPdf, setErroPdf] = useState<string | null>(null);
  const [gerando, setGerando] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Palestra | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['palestras', ano],
    queryFn: () => listPalestras(ano),
  });

  const deletar = useMutation({
    mutationFn: (p: Palestra) => excluirPalestra(p.id),
    onSuccess: () => {
      setMsg('Palestra excluída.');
      setToDelete(null);
      void qc.invalidateQueries({ queryKey: ['palestras'] });
    },
    onError: () => setToDelete(null),
  });

  const pdf = async (p: Palestra) => {
    setErroPdf(null);
    setGerando(p.id);
    try {
      await baixarHlc33Pdf(p, p.membro_nome);
    } catch (e) {
      setErroPdf((e as Error).message);
    } finally {
      setGerando(null);
    }
  };

  const totalParticipantes = (data ?? []).reduce((s, p) => s + (p.qtd_participantes ?? 0), 0);
  const podeEditar = (p: Palestra) => gerenciaPalestras || p.membro_id === membro?.id;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Palestras</h1>
          <p className="text-sm text-gray-500">
            Apresentações feitas pela COLIH. Cada uma gera o formulário HLC-33 em PDF.
          </p>
        </div>
        <Link
          to="/palestras/nova"
          className="inline-flex h-9 items-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
        >
          Registrar palestra
        </Link>
      </div>

      {msg && <Alert tone="success">{msg}</Alert>}
      {erroPdf && <Alert tone="error">{erroPdf}</Alert>}
      {deletar.error && <Alert tone="error">{(deletar.error as Error).message}</Alert>}

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          Ano
          <Select value={ano} onChange={(e) => setAno(Number(e.target.value))} className="w-28">
            {ANOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </label>
        {!!data?.length && (
          <p className="text-sm text-gray-600">
            {data.length} {data.length === 1 ? 'palestra' : 'palestras'} ·{' '}
            {totalParticipantes.toLocaleString('pt-BR')} participantes
          </p>
        )}
      </div>

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.length ? (
          <p className="p-8 text-center text-sm text-gray-500">Nenhuma palestra registrada em {ano}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Evento / local</th>
                  <th className="px-4 py-3">Público</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Membro da Colih</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                      {formatDateOnly(p.data_apresentacao)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.evento || '—'}</div>
                      <div className="text-xs text-gray-500">
                        {[p.local_nome, p.cidade].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{p.qtd_participantes ?? '—'} participantes</div>
                      <div className="text-xs text-gray-500">
                        {rotuloEspecialidadeHlc33(p.especialidade_participantes)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tipos(p)}</td>
                    <td className="px-4 py-3 text-gray-600">{p.membro_nome ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={gerando === p.id}
                          onClick={() => void pdf(p)}
                        >
                          HLC-33
                        </Button>
                        {podeEditar(p) && (
                          <Link
                            to={`/palestras/${p.id}`}
                            className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Editar
                          </Link>
                        )}
                        {gerenciaPalestras && (
                          <Button variant="ghost" size="sm" onClick={() => setToDelete(p)}>
                            Excluir
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir esta palestra?"
        danger
        loading={deletar.isPending}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && deletar.mutate(toDelete)}
        onCancel={() => setToDelete(null)}
      >
        {toDelete &&
          `${toDelete.evento || 'Palestra'} de ${formatDateOnly(toDelete.data_apresentacao)}. Essa ação não pode ser desfeita.`}
      </ConfirmDialog>
    </div>
  );
}
