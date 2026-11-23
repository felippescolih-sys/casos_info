import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  atualizarMedicamento,
  criarMedicamento,
  listMembrosColih,
  type Medicamento,
} from '@/lib/queries/medicamentos';
import { useAuth } from '@/auth/AuthProvider';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { lerReais, reaisParaCampo, UNIDADES_SUGERIDAS } from './medicamentosUtil';

const schema = z
  .object({
    medicamento: z.string().trim().min(2, 'Informe a medicação'),
    dosagem: z.string().trim().min(1, 'Informe a dosagem (ex.: 4.000 UI, 500 mg)'),
    quantidade: z
      .string()
      .trim()
      .refine((v) => /^\d+$/.test(v) && Number(v) > 0, 'Informe a quantidade (número inteiro, ex.: 3)'),
    unidade: z.string(),
    validade: z.string(),
    origem: z.enum(['compra', 'doacao']),
    valor: z.string(),
    responsavel_id: z.string().min(1, 'Escolha com quem está a medicação'),
    observacoes: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.origem === 'compra' && lerReais(v.valor) === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['valor'],
        message: 'Informe o valor pago em reais (ex.: 150,00), ou marque como doação',
      });
    }
  });
type Form = z.infer<typeof schema>;

const nil = (s: string) => (s.trim() ? s.trim() : null);

interface Props {
  /** `undefined` = fechado; `null` = novo lançamento. */
  editando: Medicamento | null | undefined;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export function MedicamentoFormModal({ editando, onClose, onSaved }: Props) {
  const { membro } = useAuth();
  const aberto = editando !== undefined;

  const membros = useQuery({
    queryKey: ['membros-colih'],
    queryFn: listMembrosColih,
    enabled: aberto,
    staleTime: 5 * 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!aberto) return;
    reset(
      editando
        ? {
            medicamento: editando.medicamento,
            dosagem: editando.dosagem,
            quantidade: String(editando.quantidade),
            unidade: editando.unidade ?? '',
            validade: editando.validade ?? '',
            origem: editando.origem,
            valor: reaisParaCampo(editando.valor),
            responsavel_id: editando.responsavel_id,
            observacoes: editando.observacoes ?? '',
          }
        : {
            medicamento: '',
            dosagem: '',
            quantidade: '1',
            unidade: '',
            validade: '',
            origem: 'compra',
            valor: '',
            // Quem está lançando é, quase sempre, quem está com a medicação.
            responsavel_id: membro?.id ?? '',
            observacoes: '',
          },
    );
  }, [aberto, editando, membro?.id, reset]);

  const origem = watch('origem');

  const salvar = useMutation({
    mutationFn: (v: Form) => {
      const payload = {
        medicamento: v.medicamento.trim(),
        dosagem: v.dosagem.trim(),
        quantidade: Number(v.quantidade),
        unidade: nil(v.unidade),
        validade: v.validade || null,
        origem: v.origem,
        valor: v.origem === 'compra' ? lerReais(v.valor) : null,
        responsavel_id: v.responsavel_id,
        observacoes: nil(v.observacoes),
      };
      return editando ? atualizarMedicamento(editando.id, payload) : criarMedicamento(payload);
    },
    onSuccess: (_r, v) => {
      onSaved(editando ? `${v.medicamento} atualizado.` : `${v.medicamento} lançado no estoque.`);
    },
  });

  useEffect(() => {
    if (aberto) salvar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  // A opção já escolhida fica sempre na lista (mesma `key`), antes e depois de a lista carregar: assim o
  // <select> não troca sozinho para o primeiro nome. Também cobre quem guarda um lançamento antigo e já
  // saiu da COLIH.
  const opcoes = [...(membros.data ?? [])];
  const atual = editando
    ? { id: editando.responsavel_id, nome: editando.responsavel_nome ?? '(fora da COLIH)' }
    : membro && { id: membro.id, nome: membro.nome };
  if (atual && !opcoes.some((m) => m.id === atual.id)) {
    opcoes.push(atual);
    opcoes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  return (
    <Modal
      open={aberto}
      onClose={onClose}
      title={editando ? `Editar ${editando.medicamento}` : 'Lançar medicamento'}
      maxWidthClassName="max-w-xl"
    >
      <form onSubmit={handleSubmit((v) => salvar.mutate(v))} className="space-y-4">
        {salvar.error && <Alert tone="error">{(salvar.error as Error).message}</Alert>}
        {membros.error && (
          <Alert tone="error">
            Não deu para carregar a lista de membros da COLIH. Feche e abra o formulário de novo.
          </Alert>
        )}

        <Field label="Com quem está a medicação" htmlFor="med_responsavel" error={errors.responsavel_id?.message}>
          {/* Sem `disabled` enquanto carrega: o react-hook-form descarta o valor de campo desabilitado. */}
          <Select id="med_responsavel" {...register('responsavel_id')}>
            {opcoes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Medicação" htmlFor="med_nome" error={errors.medicamento?.message}>
            <Input id="med_nome" placeholder="Ex.: Eritropoetina" {...register('medicamento')} />
          </Field>
          <Field label="Dosagem" htmlFor="med_dosagem" error={errors.dosagem?.message}>
            <Input id="med_dosagem" placeholder="Ex.: 4.000 UI" {...register('dosagem')} />
          </Field>
          <Field label="Quantidade" htmlFor="med_qtd" error={errors.quantidade?.message}>
            <Input id="med_qtd" inputMode="numeric" {...register('quantidade')} />
          </Field>
          <Field label="Unidade (opcional)" htmlFor="med_unidade">
            <Input
              id="med_unidade"
              list="med_unidades"
              placeholder="frasco, ampola, caixa…"
              {...register('unidade')}
            />
            <datalist id="med_unidades">
              {UNIDADES_SUGERIDAS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </Field>
          <Field label="Data de vencimento (opcional)" htmlFor="med_validade">
            <Input id="med_validade" type="date" {...register('validade')} />
          </Field>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">Valor</legend>
          <div className="flex flex-wrap gap-4 text-sm text-gray-800">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="compra"
                className="size-4 border-gray-300 text-brand-700 focus:ring-brand-600"
                {...register('origem')}
              />
              Comprada (em R$)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="doacao"
                className="size-4 border-gray-300 text-brand-700 focus:ring-brand-600"
                {...register('origem')}
              />
              Doação
            </label>
          </div>
          {origem === 'compra' && (
            <Field
              label="Valor pago (R$)"
              htmlFor="med_valor"
              error={errors.valor?.message}
              hint="Total pago por este lançamento."
            >
              <Input id="med_valor" inputMode="decimal" placeholder="150,00" className="sm:max-w-48" {...register('valor')} />
            </Field>
          )}
        </fieldset>

        <Field label="Observações (opcional)" htmlFor="med_obs">
          <Textarea id="med_obs" rows={2} {...register('observacoes')} />
        </Field>

        <div className="flex gap-2">
          <Button type="submit" loading={salvar.isPending}>
            Salvar
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
