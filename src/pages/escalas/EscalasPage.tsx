import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  atualizarEscala,
  criarEscala,
  excluirEscala,
  listEscalas,
  type EscalaComNomes,
} from '@/lib/queries/escalas';
import { listMembrosColihAtivos, membroDisponivelPlantao } from '@/lib/queries/membros';
import { formatDateTime } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function EscalasPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<'novo' | EscalaComNomes | null>(null);
  const [excluindo, setExcluindo] = useState<EscalaComNomes | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['escalas'],
    queryFn: listEscalas,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['escalas'] });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirEscala(id),
    onSuccess: () => {
      setExcluindo(null);
      invalidate();
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Escalas de plantão</h1>
          <p className="text-sm text-gray-500">Quem está designado em cada período.</p>
        </div>
        <Button onClick={() => setForm('novo')}>+ Nova escala</Button>
      </div>

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.length ? (
          <p className="p-8 text-center text-sm text-gray-500">Nenhuma escala cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Início</th>
                  <th className="px-4 py-3">Fim</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Ajudante</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDateTime(e.inicio)}</td>
                    <td className="px-4 py-3">{formatDateTime(e.fim)}</td>
                    <td className="px-4 py-3">{e.membro_nome}</td>
                    <td className="px-4 py-3">{e.ajudante_nome ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="font-medium text-brand-700 hover:underline"
                          onClick={() => setForm(e)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="font-medium text-red-600 hover:underline"
                          onClick={() => setExcluindo(e)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {form && (
        <EscalaFormDialog
          atual={form === 'novo' ? null : form}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            invalidate();
          }}
        />
      )}

      <ConfirmDialog
        open={!!excluindo}
        title="Excluir escala"
        danger
        confirmLabel="Excluir"
        loading={excluir.isPending}
        onConfirm={() => excluindo && excluir.mutate(excluindo.id)}
        onCancel={() => setExcluindo(null)}
      >
        {excluindo && (
          <>
            Remove a designação de {excluindo.membro_nome} ({formatDateTime(excluindo.inicio)}).
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}

// ── formulário ───────────────────────────────────────────────

const schema = z
  .object({
    membro_id: z.string().min(1, 'Escolha o responsável'),
    ajudante_id: z.string().optional(),
    inicio: z.string().min(1, 'Informe o início'),
    fim: z.string().min(1, 'Informe o fim'),
  })
  .refine((v) => new Date(v.fim) > new Date(v.inicio), {
    message: 'O fim precisa ser depois do início',
    path: ['fim'],
  });
type Form = z.infer<typeof schema>;

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// O plantão padrão cobre o dia inteiro: começa 00:00 e termina 23:59. O input
// datetime-local, quando está vazio e a pessoa escolhe uma data no calendário,
// preenche a hora com a hora atual — o que obrigava a corrigir os dois campos
// toda vez. Ao preencher pela primeira vez assumimos o horário padrão; depois
// disso o campo é da pessoa e não mexemos mais.
const HORA_INICIO = '00:00';
const HORA_FIM = '23:59';

function comHora(valor: string, hora: string): string {
  const [data] = valor.split('T');
  return data ? `${data}T${hora}` : valor;
}

function EscalaFormDialog({
  atual,
  onClose,
  onSaved,
}: {
  atual: EscalaComNomes | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: membros } = useQuery({
    queryKey: ['membros-colih-ativos'],
    queryFn: listMembrosColihAtivos,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [avisoResponsavel, setAvisoResponsavel] = useState<string | undefined>(undefined);
  const [avisoAjudante, setAvisoAjudante] = useState<string | undefined>(undefined);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      membro_id: atual?.membro_id ?? '',
      ajudante_id: atual?.ajudante_id ?? '',
      inicio: toLocalInput(atual?.inicio),
      fim: toLocalInput(atual?.fim),
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Só aplica o horário padrão quando o campo sai de vazio para preenchido, que é
  // exatamente o momento em que o navegador injeta a hora atual. Quem depois ajustar
  // a hora à mão não tem o valor sobrescrito.
  function aoMudarData(campo: 'inicio' | 'fim', valor: string, padrao: string) {
    const estavaVazio = !getValues(campo);
    setValue(campo, estavaVazio && valor ? comHora(valor, padrao) : valor, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  const membroId = watch('membro_id');
  const ajudanteId = watch('ajudante_id');
  const inicio = watch('inicio');
  const fim = watch('fim');

  useEffect(() => {
    const inicioIso = inicio ? new Date(inicio).toISOString() : null;
    const fimIso = fim ? new Date(fim).toISOString() : null;
    if (!inicioIso || !fimIso || new Date(fimIso) <= new Date(inicioIso)) {
      setAvisoResponsavel(undefined);
      setAvisoAjudante(undefined);
      return;
    }

    const AVISO = 'Indisponível nesse período (ausência registrada ou fora dos dias que pode atender plantão).';
    let cancelado = false;
    const timer = setTimeout(() => {
      if (membroId) {
        membroDisponivelPlantao(membroId, inicioIso, fimIso)
          .then((ok) => !cancelado && setAvisoResponsavel(ok ? undefined : AVISO))
          .catch(() => !cancelado && setAvisoResponsavel(undefined));
      } else {
        setAvisoResponsavel(undefined);
      }
      if (ajudanteId) {
        membroDisponivelPlantao(ajudanteId, inicioIso, fimIso)
          .then((ok) => !cancelado && setAvisoAjudante(ok ? undefined : AVISO))
          .catch(() => !cancelado && setAvisoAjudante(undefined));
      } else {
        setAvisoAjudante(undefined);
      }
    }, 400);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [membroId, ajudanteId, inicio, fim]);

  async function onSubmit(values: Form) {
    setErro(null);
    try {
      const patch = {
        membro_id: values.membro_id,
        ajudante_id: values.ajudante_id || null,
        inicio: new Date(values.inicio).toISOString(),
        fim: new Date(values.fim).toISOString(),
      };
      if (atual) {
        await atualizarEscala(atual.id, patch);
      } else {
        await criarEscala(patch);
      }
      onSaved();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar escala.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Fechar" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {atual ? 'Editar escala' : 'Nova escala'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {erro && <Alert tone="error">{erro}</Alert>}
          <Field
            label="Responsável"
            htmlFor="membro_id"
            error={errors.membro_id?.message}
            warning={avisoResponsavel}
          >
            <Select id="membro_id" {...register('membro_id')}>
              <option value="">Escolha o membro…</option>
              {(membros ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ajudante (opcional)" htmlFor="ajudante_id" warning={avisoAjudante}>
            <Select id="ajudante_id" {...register('ajudante_id')}>
              <option value="">— sem ajudante</option>
              {(membros ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Início" htmlFor="inicio" error={errors.inicio?.message}>
              <Input
                id="inicio"
                type="datetime-local"
                {...register('inicio')}
                onChange={(e) => aoMudarData('inicio', e.target.value, HORA_INICIO)}
              />
            </Field>
            <Field label="Fim" htmlFor="fim" error={errors.fim?.message}>
              <Input
                id="fim"
                type="datetime-local"
                {...register('fim')}
                onChange={(e) => aoMudarData('fim', e.target.value, HORA_FIM)}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
