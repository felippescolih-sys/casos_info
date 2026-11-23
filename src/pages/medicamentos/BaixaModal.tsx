import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  buscarCasos,
  darBaixa,
  type CasoEncontrado,
  type Medicamento,
} from '@/lib/queries/medicamentos';
import { formatDateOnly } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { hojeBrasilia } from './medicamentosUtil';

const schema = (max: number) =>
  z.object({
    quantidade: z
      .string()
      .trim()
      .refine(
        (v) => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= max,
        `Informe de 1 a ${max}`,
      ),
    baixado_em: z.string().min(1, 'Informe a data em que saiu'),
    baixa_destino: z.string().trim().min(2, 'Diga para onde foi (ex.: paciente do caso, hospital, descarte)'),
  });
type Form = z.infer<ReturnType<typeof schema>>;

/** A busca só vale com o número do caso ou 3+ letras do nome (o banco aplica a mesma regra). */
const buscaValida = (t: string) => /^\d+$/.test(t) || t.length >= 3;

interface Props {
  medicamento: Medicamento | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export function BaixaModal({ medicamento: m, onClose, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema(m?.quantidade ?? 1)) });

  const [termo, setTermo] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [caso, setCaso] = useState<CasoEncontrado | null>(null);
  const [tentouSalvar, setTentouSalvar] = useState(false);

  useEffect(() => {
    if (!m) return;
    reset({ quantidade: String(m.quantidade), baixado_em: hojeBrasilia(), baixa_destino: '' });
  }, [m, reset]);

  // Espera a pessoa parar de digitar antes de buscar.
  useEffect(() => {
    const t = setTimeout(() => setTermoBusca(termo.trim()), 300);
    return () => clearTimeout(t);
  }, [termo]);

  const busca = useQuery({
    queryKey: ['medicamentos-busca-caso', termoBusca],
    queryFn: () => buscarCasos(termoBusca),
    enabled: !!m && !caso && buscaValida(termoBusca),
    staleTime: 60_000,
  });

  const salvar = useMutation({
    mutationFn: async (v: Form) => {
      if (!m) return;
      await darBaixa(m, {
        quantidade: Number(v.quantidade),
        baixado_em: v.baixado_em,
        baixa_destino: v.baixa_destino.trim(),
        baixa_caso_numero: caso?.numero ?? null,
      });
    },
    onSuccess: (_r, v) => onSaved(`Baixa de ${v.quantidade} × ${m?.medicamento} registrada.`),
  });

  // Digitou algo e não escolheu: avisa em vez de gravar a baixa sem o caso.
  const casoPendente = !caso && termo.trim() !== '';

  return (
    <Modal open={!!m} onClose={onClose} title={m ? `Dar baixa: ${m.medicamento} ${m.dosagem}` : ''}>
      <form
        onSubmit={(e) => {
          setTentouSalvar(true);
          void handleSubmit((v) => {
            if (!casoPendente) salvar.mutate(v);
          })(e);
        }}
        className="space-y-4"
      >
        {salvar.error && <Alert tone="error">{(salvar.error as Error).message}</Alert>}
        <p className="text-sm text-gray-600">
          Tira do estoque e guarda no histórico. Se saiu só uma parte, o restante continua no estoque.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={`Quantidade que saiu${m?.unidade ? ` (${m.unidade})` : ''}`}
            htmlFor="baixa_qtd"
            error={errors.quantidade?.message}
            hint={m ? `Em estoque: ${m.quantidade}` : undefined}
          >
            <Input id="baixa_qtd" inputMode="numeric" {...register('quantidade')} />
          </Field>
          <Field label="Data" htmlFor="baixa_data" error={errors.baixado_em?.message}>
            <Input id="baixa_data" type="date" {...register('baixado_em')} />
          </Field>
        </div>

        <Field label="Para onde foi" htmlFor="baixa_destino" error={errors.baixa_destino?.message}>
          <Input
            id="baixa_destino"
            placeholder="Ex.: entregue ao paciente no Hospital X; vencido, descartado"
            {...register('baixa_destino')}
          />
        </Field>

        <Field
          label="Caso (opcional)"
          htmlFor="baixa_caso"
          error={tentouSalvar && casoPendente ? 'Escolha um caso da lista ou apague o que digitou.' : undefined}
          hint={caso ? undefined : 'Se foi para o paciente de um caso: digite o número ou o nome do paciente.'}
        >
          {caso ? (
            <div className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm ring-1 ring-inset ring-gray-200">
              <div>
                <div className="font-medium text-gray-900">
                  Caso nº {caso.numero} — {caso.paciente_nome ?? 'sem nome'}
                </div>
                <div className="text-xs text-gray-500">
                  {[caso.hospital_nome, caso.aberto_em && `aberto em ${formatDateOnly(caso.aberto_em)}`]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCaso(null);
                  setTermo('');
                }}
              >
                Trocar
              </Button>
            </div>
          ) : (
            <>
              <Input
                id="baixa_caso"
                autoComplete="off"
                placeholder="Nº do caso ou nome do paciente"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
              />
              {buscaValida(termoBusca) && termoBusca === termo.trim() && (
                <div className="mt-1 overflow-hidden rounded-md ring-1 ring-inset ring-gray-200">
                  {busca.isFetching ? (
                    <div className="flex justify-center p-3 text-gray-400">
                      <Spinner className="size-4" />
                    </div>
                  ) : busca.error ? (
                    <p className="p-3 text-sm text-red-600">Não deu para buscar. Tente de novo.</p>
                  ) : !busca.data?.length ? (
                    <p className="p-3 text-sm text-gray-500">Nenhum caso encontrado.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {busca.data.map((c) => (
                        <li key={c.numero}>
                          <button
                            type="button"
                            onClick={() => setCaso(c)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            <span className="font-medium text-gray-900">
                              Nº {c.numero} — {c.paciente_nome ?? 'sem nome'}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {[
                                c.hospital_nome,
                                c.aberto_em && formatDateOnly(c.aberto_em),
                                c.aberto ? 'aberto' : 'encerrado',
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </Field>

        <div className="flex gap-2">
          <Button type="submit" loading={salvar.isPending}>
            Dar baixa
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
