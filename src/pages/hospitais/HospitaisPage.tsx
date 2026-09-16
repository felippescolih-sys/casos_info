import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  atualizarHospital,
  criarHospital,
  excluirHospital,
  listHospitais,
} from '@/lib/queries/hospitais';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { HospitalRow } from '@/types/database';

const schema = z.object({
  nome: z.string().min(2, 'Informe o nome do hospital'),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  telefone: z.string().optional(),
  fone_uti: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  ativo: z.boolean(),
});
type Form = z.infer<typeof schema>;

const EMPTY: Form = {
  nome: '',
  endereco: '',
  bairro: '',
  cidade: '',
  telefone: '',
  fone_uti: '',
  email: '',
  website: '',
  ativo: true,
};

const nil = (s: string | undefined) => (s?.trim() ? s.trim() : null);

export function HospitaisPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<HospitalRow | null | undefined>(undefined); // undefined = form fechado
  const [toDelete, setToDelete] = useState<HospitalRow | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hospitais', search],
    queryFn: () => listHospitais({ search }),
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
            endereco: editing.endereco ?? '',
            bairro: editing.bairro ?? '',
            cidade: editing.cidade ?? '',
            telefone: editing.telefone ?? '',
            fone_uti: editing.fone_uti ?? '',
            email: editing.email ?? '',
            website: editing.website ?? '',
            ativo: editing.ativo,
          }
        : EMPTY,
    );
  }, [editing, reset]);

  const salvar = useMutation({
    mutationFn: (v: Form) => {
      const payload = {
        nome: v.nome.trim(),
        endereco: nil(v.endereco),
        bairro: nil(v.bairro),
        cidade: nil(v.cidade),
        telefone: nil(v.telefone),
        fone_uti: nil(v.fone_uti),
        email: nil(v.email),
        website: nil(v.website),
        ativo: v.ativo,
      };
      return editing ? atualizarHospital(editing.id, payload) : criarHospital(payload);
    },
    onSuccess: (_r, v) => {
      setMsg(editing ? `"${v.nome}" atualizado.` : `"${v.nome}" cadastrado.`);
      setEditing(undefined);
      void qc.invalidateQueries({ queryKey: ['hospitais'] });
    },
  });

  const deletar = useMutation({
    mutationFn: (h: HospitalRow) => excluirHospital(h.id),
    onSuccess: (_r, h) => {
      setMsg(`"${h.nome}" excluído.`);
      setToDelete(null);
      void qc.invalidateQueries({ queryKey: ['hospitais'] });
    },
    onError: () => setToDelete(null),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Hospitais</h1>
        {editing === undefined && (
          <Button size="sm" onClick={() => setEditing(null)}>
            Novo hospital
          </Button>
        )}
      </div>

      {msg && <Alert tone="success">{msg}</Alert>}

      {editing !== undefined && (
        <Card>
          <CardHeader>
            <h2 className="font-medium text-gray-900">
              {editing ? `Editar ${editing.nome}` : 'Novo hospital'}
            </h2>
          </CardHeader>
          <CardBody>
            <form
              onSubmit={handleSubmit((v) => salvar.mutate(v))}
              className="space-y-4"
            >
              {salvar.error && <Alert tone="error">{(salvar.error as Error).message}</Alert>}

              <Field label="Nome do hospital" htmlFor="nome" error={errors.nome?.message}>
                <Input id="nome" {...register('nome')} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Endereço" htmlFor="endereco">
                  <Input id="endereco" {...register('endereco')} />
                </Field>
                <Field label="Bairro" htmlFor="bairro">
                  <Input id="bairro" {...register('bairro')} />
                </Field>
                <Field label="Cidade" htmlFor="cidade">
                  <Input id="cidade" {...register('cidade')} />
                </Field>
                <Field label="Telefone" htmlFor="telefone">
                  <Input id="telefone" inputMode="tel" {...register('telefone')} />
                </Field>
                <Field label="Telefone UTI" htmlFor="fone_uti">
                  <Input id="fone_uti" inputMode="tel" {...register('fone_uti')} />
                </Field>
                <Field label="E-mail" htmlFor="email">
                  <Input id="email" type="email" {...register('email')} />
                </Field>
                <Field label="Website" htmlFor="website">
                  <Input id="website" {...register('website')} />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
                  {...register('ativo')}
                />
                Ativo (aparece na busca do cadastro de casos)
              </label>

              <div className="flex gap-2">
                <Button type="submit" loading={salvar.isPending} disabled={!isDirty}>
                  Salvar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(undefined)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Input
        placeholder="Buscar por nome, cidade ou bairro"
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
          <p className="p-8 text-center text-sm text-gray-500">Nenhum hospital cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Cidade / Bairro</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{h.nome}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {[h.cidade, h.bairro].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{h.telefone || '—'}</td>
                    <td className="px-4 py-3">
                      {h.ativo ? (
                        <span className="text-green-700">Ativo</span>
                      ) : (
                        <span className="text-gray-400">Inativo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(h)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setToDelete(h)}>
                          Excluir
                        </Button>
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
        title={`Excluir "${toDelete?.nome}"?`}
        danger
        loading={deletar.isPending}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && deletar.mutate(toDelete)}
        onCancel={() => setToDelete(null)}
      >
        Essa ação não afeta casos que já têm esse nome de hospital preenchido — só remove da lista
        de sugestões.
      </ConfirmDialog>
    </div>
  );
}
