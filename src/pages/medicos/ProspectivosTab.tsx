import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  atualizarMedicoGeral,
  criarMedicoGeral,
  excluirMedicoGeral,
  listMedicosGeral,
  type MedicoGeralComEspecialidade,
} from '@/lib/queries/medicosGeral';
import { listEspecialidadesMedicas } from '@/lib/queries/especialidadesMedicas';
import { getMedicosTotalCasos, totalCasosDe } from '@/lib/queries/medicos';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const schema = z.object({
  nome: z.string().min(2, 'Informe o nome do médico'),
  crm_uf: z.string().optional(),
  especialidade_id: z.string().optional(),
  observacoes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const EMPTY: Form = { nome: '', crm_uf: '', especialidade_id: '', observacoes: '' };

const nil = (s: string | undefined) => (s?.trim() ? s.trim() : null);

export function ProspectivosTab() {
  const qc = useQueryClient();
  const { isAdminGeral } = useAuth();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<MedicoGeralComEspecialidade | null | undefined>(
    undefined,
  );
  const [toDelete, setToDelete] = useState<MedicoGeralComEspecialidade | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const especialidadesQ = useQuery({
    queryKey: ['especialidades-medicas'],
    queryFn: listEspecialidadesMedicas,
    staleTime: 3_600_000,
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ['medicos-geral', search],
    queryFn: () => listMedicosGeral({ search }),
  });
  const totalCasosQ = useQuery({
    queryKey: ['medicos-total-casos'],
    queryFn: getMedicosTotalCasos,
    staleTime: 300_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (editing === undefined) return;
    reset(
      editing
        ? {
            nome: editing.nome,
            crm_uf: editing.crm_uf ?? '',
            especialidade_id: editing.especialidade_id ?? '',
            observacoes: editing.observacoes ?? '',
          }
        : EMPTY,
    );
  }, [editing, reset]);

  const salvar = useMutation({
    mutationFn: (v: Form) => {
      const payload = {
        nome: v.nome.trim(),
        crm_uf: nil(v.crm_uf),
        especialidade_id: nil(v.especialidade_id),
        observacoes: nil(v.observacoes),
      };
      return editing ? atualizarMedicoGeral(editing.id, payload) : criarMedicoGeral(payload);
    },
    onSuccess: (_r, v) => {
      setMsg(editing ? `"${v.nome}" atualizado.` : `"${v.nome}" cadastrado.`);
      setEditing(undefined);
      void qc.invalidateQueries({ queryKey: ['medicos-geral'] });
    },
  });

  const deletar = useMutation({
    mutationFn: (m: MedicoGeralComEspecialidade) => excluirMedicoGeral(m.id),
    onSuccess: (_r, m) => {
      setMsg(`"${m.nome}" excluído.`);
      setToDelete(null);
      void qc.invalidateQueries({ queryKey: ['medicos-geral'] });
    },
    onError: () => setToDelete(null),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Médicos ainda não confirmados como colaboradores — prospectados pelos membros ao
          registrar um caso.
        </p>
        {editing === undefined && (
          <Button size="sm" onClick={() => setEditing(null)}>
            Novo prospectivo
          </Button>
        )}
      </div>

      {msg && <Alert tone="success">{msg}</Alert>}

      {editing !== undefined && (
        <FormModal
          titulo={editing ? `Editar ${editing.nome}` : 'Novo médico prospectivo'}
          onClose={() => setEditing(undefined)}
        >
          <form onSubmit={handleSubmit((v) => salvar.mutate(v))} className="space-y-4">
            {salvar.error && <Alert tone="error">{(salvar.error as Error).message}</Alert>}
            <Field label="Nome do médico" htmlFor="mg-nome" error={errors.nome?.message}>
              <Input id="mg-nome" {...register('nome')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CRM/UF" htmlFor="mg-crm">
                <Input id="mg-crm" {...register('crm_uf')} />
              </Field>
              <Field label="Especialidade" htmlFor="mg-esp">
                <Select id="mg-esp" {...register('especialidade_id')}>
                  <option value="">—</option>
                  {especialidadesQ.data?.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Observações" htmlFor="mg-obs">
              <Textarea id="mg-obs" rows={3} {...register('observacoes')} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={salvar.isPending} disabled={!isDirty}>
                Salvar
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(undefined)}>
                Cancelar
              </Button>
            </div>
          </form>
        </FormModal>
      )}

      <Input
        placeholder="Buscar por nome ou CRM"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-sm"
      />

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-gray-400">
            <Spinner className="size-6" />
          </div>
        ) : !data?.length ? (
          <p className="p-8 text-center text-sm text-gray-500">Nenhum médico prospectivo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">CRM/UF</th>
                  <th className="px-4 py-3">Especialidade</th>
                  <th className="px-4 py-3">Casos</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{m.crm_uf || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{m.especialidade?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {totalCasosDe(totalCasosQ.data ?? new Map(), m.nome)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdminGeral && (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(m)}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setToDelete(m)}>
                            Excluir
                          </Button>
                        </div>
                      )}
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
        title={`Excluir "${toDelete?.nome}"?`}
        danger
        loading={deletar.isPending}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && deletar.mutate(toDelete)}
        onCancel={() => setToDelete(null)}
      >
        Essa ação não afeta casos que já têm esse nome de médico preenchido.
      </ConfirmDialog>
    </div>
  );
}

function FormModal({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Fechar" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <h2 className="mb-4 font-medium text-gray-900">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
