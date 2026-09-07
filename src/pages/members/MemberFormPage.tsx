import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { definirFuncao, getMembro, updateMembro } from '@/lib/queries/membros';
import { useAuth } from '@/auth/AuthProvider';
import { AREAS, areaLabel } from '@/lib/labels';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import type { Area, FuncaoNivel, MemberStatus } from '@/types/database';

const schema = z.object({
  nome: z.string().min(3, 'Informe o nome completo'),
  status: z.enum(['pendente', 'ativo', 'inativo']),
  tel_zap: z.string().optional(),
  tel_residencial: z.string().optional(),
  tel_comercial: z.string().optional(),
  congregacao: z.string().optional(),
  especialidade: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function MemberFormPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { membro: eu, isAdminGeral } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['membro', id],
    queryFn: () => getMembro(id),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) {
      reset({
        nome: data.nome,
        status: data.status,
        tel_zap: data.tel_zap ?? '',
        tel_residencial: data.tel_residencial ?? '',
        tel_comercial: data.tel_comercial ?? '',
        congregacao: data.congregacao ?? '',
        especialidade: data.especialidade ?? '',
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Form) =>
      updateMembro(id, {
        nome: values.nome,
        status: values.status as MemberStatus,
        tel_zap: values.tel_zap || null,
        tel_residencial: values.tel_residencial || null,
        tel_comercial: values.tel_comercial || null,
        congregacao: values.congregacao || null,
        especialidade: values.especialidade || null,
      }),
    onSuccess: () => {
      setMsg('Dados atualizados.');
      void qc.invalidateQueries({ queryKey: ['membros'] });
      void qc.invalidateQueries({ queryKey: ['membro', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-gray-400">
        <Spinner className="size-6" />
      </div>
    );
  }
  if (error || !data) {
    return <Alert tone="error">{(error as Error)?.message ?? 'Membro não encontrado.'}</Alert>;
  }

  const editandoASiMesmo = eu?.id === data.id;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button
        onClick={() => navigate('/membros')}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Voltar para membros
      </button>
      <h1 className="text-xl font-semibold text-gray-900">{data.nome}</h1>

      <Card>
        <CardHeader>
          <h2 className="font-medium text-gray-900">Dados</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            {msg && <Alert tone="success">{msg}</Alert>}
            {mutation.error && <Alert tone="error">{(mutation.error as Error).message}</Alert>}
            <p className="text-sm text-gray-500">
              E-mail: <span className="text-gray-800">{data.email}</span>
            </p>

            <Field label="Status" htmlFor="status" error={errors.status?.message}>
              <Select id="status" {...register('status')} disabled={editandoASiMesmo}>
                <option value="pendente">Pendente</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Select>
            </Field>
            {editandoASiMesmo && (
              <p className="text-xs text-amber-700">
                Você não pode alterar o próprio status.
              </p>
            )}

            <hr className="border-gray-100" />
            <Field label="Nome completo" htmlFor="nome" error={errors.nome?.message}>
              <Input id="nome" {...register('nome')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="WhatsApp" htmlFor="tel_zap">
                <Input id="tel_zap" inputMode="tel" {...register('tel_zap')} />
              </Field>
              <Field label="Telefone residencial" htmlFor="tel_residencial">
                <Input id="tel_residencial" inputMode="tel" {...register('tel_residencial')} />
              </Field>
              <Field label="Telefone comercial" htmlFor="tel_comercial">
                <Input id="tel_comercial" inputMode="tel" {...register('tel_comercial')} />
              </Field>
              <Field label="Congregação" htmlFor="congregacao">
                <Input id="congregacao" {...register('congregacao')} />
              </Field>
              <Field label="Especialidade" htmlFor="especialidade">
                <Input id="especialidade" {...register('especialidade')} />
              </Field>
            </div>

            <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
              Salvar
            </Button>
          </form>
        </CardBody>
      </Card>

      <FuncoesCard
        membroId={data.id}
        atual={data.funcoes}
        podeEditar={isAdminGeral}
        criadoPor={eu!.id}
        onChanged={() => {
          void qc.invalidateQueries({ queryKey: ['membros'] });
          void qc.invalidateQueries({ queryKey: ['membro', id] });
        }}
      />
    </div>
  );
}

function FuncoesCard({
  membroId,
  atual,
  podeEditar,
  criadoPor,
  onChanged,
}: {
  membroId: string;
  atual: Array<{ area: Area; nivel: FuncaoNivel }>;
  podeEditar: boolean;
  criadoPor: string;
  onChanged: () => void;
}) {
  const nivelDe = (area: Area): FuncaoNivel | '' =>
    atual.find((f) => f.area === area)?.nivel ?? '';

  const [pending, setPending] = useState<Area | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function alterar(area: Area, valor: FuncaoNivel | '') {
    setPending(area);
    setErro(null);
    try {
      await definirFuncao(membroId, area, valor === '' ? null : valor, criadoPor);
      onChanged();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar função.');
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Funções por área</h2>
      </CardHeader>
      <CardBody>
        {!podeEditar && (
          <p className="mb-3 text-xs text-gray-500">
            Só um admin da Administração geral pode alterar funções.
          </p>
        )}
        {erro && (
          <div className="mb-3">
            <Alert tone="error">{erro}</Alert>
          </div>
        )}
        <div className="divide-y divide-gray-100">
          {AREAS.map((area) => (
            <div key={area} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-sm text-gray-800">{areaLabel[area]}</span>
              <Select
                className="w-40"
                value={nivelDe(area)}
                disabled={!podeEditar || pending === area}
                onChange={(e) => alterar(area, e.target.value as FuncaoNivel | '')}
              >
                <option value="">— sem função</option>
                <option value="ajudante">Ajudante</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
