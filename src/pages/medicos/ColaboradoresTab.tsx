import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  atualizarMedico,
  criarMedico,
  excluirMedico,
  getMedicosTotalCasos,
  listMedicos,
  totalCasosDe,
  type MedicoComEspecialidade,
} from '@/lib/queries/medicos';
import { listEspecialidadesMedicas } from '@/lib/queries/especialidadesMedicas';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const schema = z.object({
  nome: z.string().min(2, 'Informe o nome do médico'),
  foto_url: z.string().optional(),
  crm_uf: z.string().optional(),
  email: z.string().optional(),
  especialidade_id: z.string().optional(),
  subespecialidade: z.string().optional(),
  rating: z.string().optional(),
  membro_indicacao: z.string().optional(),
  infos_add: z.string().optional(),
  tel_consultorio: z.string().optional(),
  tel_secretaria: z.string().optional(),
  tel_confidencial: z.string().optional(),
  nome_secretaria: z.string().optional(),
  endereco_consultorio: z.string().optional(),
  hospitais_atua: z.string().optional(),
  end_hospital: z.string().optional(),
  acompanhante: z.string().optional(),
  ultima_visita: z.string().optional(),
  sus: z.boolean(),
  convenio: z.boolean(),
  particular: z.boolean(),
  telemedicina: z.boolean(),
  medico_tj: z.boolean(),
  pediatria: z.boolean(),
  atend_consult: z.boolean(),
  primeira_visita: z.boolean(),
  revisita: z.boolean(),
  ativo: z.boolean(),
});
type Form = z.infer<typeof schema>;

const EMPTY: Form = {
  nome: '',
  foto_url: '',
  crm_uf: '',
  email: '',
  especialidade_id: '',
  subespecialidade: '',
  rating: '',
  membro_indicacao: '',
  infos_add: '',
  tel_consultorio: '',
  tel_secretaria: '',
  tel_confidencial: '',
  nome_secretaria: '',
  endereco_consultorio: '',
  hospitais_atua: '',
  end_hospital: '',
  acompanhante: '',
  ultima_visita: '',
  sus: false,
  convenio: false,
  particular: false,
  telemedicina: false,
  medico_tj: false,
  pediatria: false,
  atend_consult: false,
  primeira_visita: false,
  revisita: false,
  ativo: true,
};

const nil = (s: string | undefined) => (s?.trim() ? s.trim() : null);

function toForm(m: MedicoComEspecialidade): Form {
  return {
    nome: m.nome,
    foto_url: m.foto_url ?? '',
    crm_uf: m.crm_uf ?? '',
    email: m.email ?? '',
    especialidade_id: m.especialidade_id ?? '',
    subespecialidade: m.subespecialidade ?? '',
    rating: m.rating != null ? String(m.rating) : '',
    membro_indicacao: m.membro_indicacao ?? '',
    infos_add: m.infos_add ?? '',
    tel_consultorio: m.tel_consultorio ?? '',
    tel_secretaria: m.tel_secretaria ?? '',
    tel_confidencial: m.tel_confidencial ?? '',
    nome_secretaria: m.nome_secretaria ?? '',
    endereco_consultorio: m.endereco_consultorio ?? '',
    hospitais_atua: m.hospitais_atua ?? '',
    end_hospital: m.end_hospital ?? '',
    acompanhante: m.acompanhante ?? '',
    ultima_visita: m.ultima_visita ?? '',
    sus: m.sus ?? false,
    convenio: m.convenio ?? false,
    particular: m.particular ?? false,
    telemedicina: m.telemedicina ?? false,
    medico_tj: m.medico_tj ?? false,
    pediatria: m.pediatria ?? false,
    atend_consult: m.atend_consult ?? false,
    primeira_visita: m.primeira_visita ?? false,
    revisita: m.revisita ?? false,
    ativo: m.ativo,
  };
}

function Estrelas({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-xs text-gray-400">Sem avaliação</span>;
  return (
    <span className="text-amber-500" title={`${rating}/6`}>
      {'★'.repeat(rating)}
      <span className="text-gray-300">{'★'.repeat(Math.max(0, 6 - rating))}</span>
    </span>
  );
}

export function ColaboradoresTab() {
  const qc = useQueryClient();
  const { isAdminGeral } = useAuth();
  const [search, setSearch] = useState('');
  const [especialidadeId, setEspecialidadeId] = useState('todas');
  const [selecionado, setSelecionado] = useState<MedicoComEspecialidade | null>(null);
  const [editing, setEditing] = useState<MedicoComEspecialidade | null | undefined>(undefined);
  const [toDelete, setToDelete] = useState<MedicoComEspecialidade | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const especialidadesQ = useQuery({
    queryKey: ['especialidades-medicas'],
    queryFn: listEspecialidadesMedicas,
    staleTime: 3_600_000,
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ['medicos', search, especialidadeId],
    queryFn: () => listMedicos({ search, especialidadeId }),
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
    reset(editing ? toForm(editing) : EMPTY);
  }, [editing, reset]);

  const salvar = useMutation({
    mutationFn: (v: Form) => {
      const payload = {
        nome: v.nome.trim(),
        foto_url: nil(v.foto_url),
        crm_uf: nil(v.crm_uf),
        email: nil(v.email),
        especialidade_id: nil(v.especialidade_id),
        subespecialidade: nil(v.subespecialidade),
        rating: v.rating?.trim() ? Number(v.rating) : null,
        membro_indicacao: nil(v.membro_indicacao),
        infos_add: nil(v.infos_add),
        tel_consultorio: nil(v.tel_consultorio),
        tel_secretaria: nil(v.tel_secretaria),
        tel_confidencial: nil(v.tel_confidencial),
        nome_secretaria: nil(v.nome_secretaria),
        endereco_consultorio: nil(v.endereco_consultorio),
        hospitais_atua: nil(v.hospitais_atua),
        end_hospital: nil(v.end_hospital),
        acompanhante: nil(v.acompanhante),
        ultima_visita: nil(v.ultima_visita),
        sus: v.sus,
        convenio: v.convenio,
        particular: v.particular,
        telemedicina: v.telemedicina,
        medico_tj: v.medico_tj,
        pediatria: v.pediatria,
        atend_consult: v.atend_consult,
        primeira_visita: v.primeira_visita,
        revisita: v.revisita,
        ativo: v.ativo,
      };
      return editing ? atualizarMedico(editing.id, payload) : criarMedico(payload);
    },
    onSuccess: (_r, v) => {
      setMsg(editing ? `"${v.nome}" atualizado.` : `"${v.nome}" cadastrado.`);
      setEditing(undefined);
      setSelecionado(null);
      void qc.invalidateQueries({ queryKey: ['medicos'] });
    },
  });

  const deletar = useMutation({
    mutationFn: (m: MedicoComEspecialidade) => excluirMedico(m.id),
    onSuccess: (_r, m) => {
      setMsg(`"${m.nome}" excluído.`);
      setToDelete(null);
      setSelecionado(null);
      void qc.invalidateQueries({ queryKey: ['medicos'] });
    },
    onError: () => setToDelete(null),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Médicos que já colaboram com a COLIH.</p>
        {isAdminGeral && editing === undefined && (
          <Button size="sm" onClick={() => setEditing(null)}>
            Novo colaborador
          </Button>
        )}
      </div>

      {msg && <Alert tone="success">{msg}</Alert>}

      {isAdminGeral && editing !== undefined && (
        <MedicoForm
          titulo={editing ? `Editar ${editing.nome}` : 'Novo colaborador'}
          register={register}
          errors={errors}
          especialidades={especialidadesQ.data ?? []}
          onSubmit={handleSubmit((v) => salvar.mutate(v))}
          onCancel={() => setEditing(undefined)}
          loading={salvar.isPending}
          disabled={!isDirty}
          erro={salvar.error as Error | null}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
        <Input
          placeholder="Buscar por nome, CRM ou subespecialidade"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={especialidadeId} onChange={(e) => setEspecialidadeId(e.target.value)}>
          <option value="todas">Todas as especialidades</option>
          {especialidadesQ.data?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </Select>
      </div>

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      {isLoading ? (
        <div className="flex justify-center p-8 text-gray-400">
          <Spinner className="size-6" />
        </div>
      ) : !data?.length ? (
        <p className="p-8 text-center text-sm text-gray-500">Nenhum médico colaborador.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelecionado(m)}
              className="flex gap-3 rounded-lg bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 hover:ring-brand-300"
            >
              {m.foto_url ? (
                <img src={m.foto_url} alt="" className="size-14 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-medium text-gray-400">
                  {m.nome.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{m.nome}</p>
                <p className="truncate text-xs text-gray-500">{m.especialidade?.nome ?? '—'}</p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <Estrelas rating={m.rating != null ? Math.round(m.rating) : null} />
                  <span className="text-gray-400">
                    · {totalCasosDe(totalCasosQ.data ?? new Map(), m.nome)} caso(s)
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selecionado && (
        <DetalheModal
          medico={selecionado}
          totalCasos={totalCasosDe(totalCasosQ.data ?? new Map(), selecionado.nome)}
          podeEditar={isAdminGeral}
          onClose={() => setSelecionado(null)}
          onEditar={() => {
            setEditing(selecionado);
            setSelecionado(null);
          }}
          onExcluir={() => setToDelete(selecionado)}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Excluir "${toDelete?.nome}"?`}
        danger
        loading={deletar.isPending}
        confirmLabel="Excluir"
        onConfirm={() => toDelete && deletar.mutate(toDelete)}
        onCancel={() => setToDelete(null)}
      >
        Isso não afeta casos que já têm esse nome de médico preenchido.
      </ConfirmDialog>
    </div>
  );
}

function DetalheModal({
  medico,
  totalCasos,
  podeEditar,
  onClose,
  onEditar,
  onExcluir,
}: {
  medico: MedicoComEspecialidade;
  totalCasos: number;
  podeEditar: boolean;
  onClose: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const linha = (label: string, valor: string | null | undefined) =>
    valor ? (
      <div>
        <dt className="text-xs font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900">{valor}</dd>
      </div>
    ) : null;

  const flags = [
    medico.sus && 'SUS',
    medico.convenio && 'Convênio',
    medico.particular && 'Particular',
    medico.telemedicina && 'Telemedicina',
    medico.medico_tj && 'TJ',
    medico.pediatria && 'Pediatria',
    medico.atend_consult && 'Atende no consultório',
    medico.primeira_visita && 'Faz primeira visita',
    medico.revisita && 'Faz revisita',
  ].filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Fechar" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          {medico.foto_url ? (
            <img src={medico.foto_url} alt="" className="size-16 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-medium text-gray-400">
              {medico.nome.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">{medico.nome}</h2>
            <p className="text-sm text-gray-500">
              {medico.especialidade?.nome ?? '—'}
              {medico.subespecialidade ? ` · ${medico.subespecialidade}` : ''}
            </p>
            <p className="mt-1 text-sm text-amber-600">
              {medico.rating != null ? `${'★'.repeat(Math.round(medico.rating))} (${medico.rating}/6)` : 'Sem avaliação'}
            </p>
          </div>
        </div>

        {flags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {flags.map((f) => (
              <span
                key={f}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-3">
          {linha('CRM/UF', medico.crm_uf)}
          {linha('E-mail', medico.email)}
          {linha('Total de casos acompanhados', String(totalCasos))}
          {linha('Telefone consultório', medico.tel_consultorio)}
          {linha('Telefone secretaria', medico.tel_secretaria)}
          {linha('Secretária', medico.nome_secretaria)}
          {linha('Telefone confidencial', medico.tel_confidencial)}
          {linha('Endereço do consultório', medico.endereco_consultorio)}
          {linha('Hospitais que atua', medico.hospitais_atua)}
          {linha('Endereço no hospital', medico.end_hospital)}
          {linha('Acompanhante', medico.acompanhante)}
          {linha('Última visita', medico.ultima_visita)}
          {linha('Indicado por', medico.membro_indicacao)}
        </dl>

        {medico.infos_add && (
          <div className="mt-4">
            <dt className="text-xs font-medium text-gray-500">Informações adicionais</dt>
            <dd className="whitespace-pre-wrap text-sm text-gray-900">{medico.infos_add}</dd>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          {podeEditar && (
            <>
              <Button variant="secondary" onClick={onEditar}>
                Editar
              </Button>
              <Button variant="danger" onClick={onExcluir}>
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface MedicoFormProps {
  titulo: string;
  register: ReturnType<typeof useForm<Form>>['register'];
  errors: ReturnType<typeof useForm<Form>>['formState']['errors'];
  especialidades: { id: string; nome: string }[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  disabled: boolean;
  erro: Error | null;
}

function MedicoForm({
  titulo,
  register,
  errors,
  especialidades,
  onSubmit,
  onCancel,
  loading,
  disabled,
  erro,
}: MedicoFormProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">{titulo}</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-5">
          {erro && <Alert tone="error">{erro.message}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do médico" htmlFor="m-nome" error={errors.nome?.message}>
              <Input id="m-nome" {...register('nome')} />
            </Field>
            <Field label="Foto (URL)" htmlFor="m-foto">
              <Input id="m-foto" {...register('foto_url')} placeholder="https://…" />
            </Field>
            <Field label="CRM/UF" htmlFor="m-crm">
              <Input id="m-crm" {...register('crm_uf')} />
            </Field>
            <Field label="E-mail" htmlFor="m-email">
              <Input id="m-email" type="email" {...register('email')} />
            </Field>
            <Field label="Especialidade" htmlFor="m-esp">
              <Select id="m-esp" {...register('especialidade_id')}>
                <option value="">—</option>
                {especialidades.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Subespecialidade" htmlFor="m-subesp">
              <Input id="m-subesp" {...register('subespecialidade')} />
            </Field>
            <Field label="Avaliação (0–6)" htmlFor="m-rating">
              <Input id="m-rating" type="number" min={0} max={6} {...register('rating')} />
            </Field>
            <Field label="Indicado/cadastrado por" htmlFor="m-indic">
              <Input id="m-indic" {...register('membro_indicacao')} />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Atendimento</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-800">
              {(
                [
                  ['sus', 'SUS'],
                  ['convenio', 'Convênio'],
                  ['particular', 'Particular'],
                  ['telemedicina', 'Telemedicina'],
                  ['medico_tj', 'Médico TJ'],
                  ['pediatria', 'Pediatria'],
                  ['atend_consult', 'Atende no consultório'],
                  ['primeira_visita', 'Faz primeira visita'],
                  ['revisita', 'Faz revisita'],
                ] as const
              ).map(([campo, label]) => (
                <label key={campo} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
                    {...register(campo)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefone consultório" htmlFor="m-telc">
              <Input id="m-telc" inputMode="tel" {...register('tel_consultorio')} />
            </Field>
            <Field label="Telefone secretaria" htmlFor="m-tels">
              <Input id="m-tels" inputMode="tel" {...register('tel_secretaria')} />
            </Field>
            <Field label="Telefone confidencial" htmlFor="m-telcf">
              <Input id="m-telcf" inputMode="tel" {...register('tel_confidencial')} />
            </Field>
            <Field label="Nome da secretária" htmlFor="m-secre">
              <Input id="m-secre" {...register('nome_secretaria')} />
            </Field>
            <Field label="Endereço do consultório" htmlFor="m-endc">
              <Input id="m-endc" {...register('endereco_consultorio')} />
            </Field>
            <Field label="Hospitais que atua" htmlFor="m-hosp">
              <Input id="m-hosp" {...register('hospitais_atua')} />
            </Field>
            <Field label="Endereço no hospital" htmlFor="m-endh">
              <Input id="m-endh" {...register('end_hospital')} />
            </Field>
            <Field label="Acompanhante" htmlFor="m-acomp">
              <Input id="m-acomp" {...register('acompanhante')} />
            </Field>
            <Field label="Última visita" htmlFor="m-ultvis">
              <Input id="m-ultvis" type="date" {...register('ultima_visita')} />
            </Field>
          </div>

          <Field label="Informações adicionais" htmlFor="m-infos">
            <Textarea id="m-infos" rows={3} {...register('infos_add')} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
              {...register('ativo')}
            />
            Ativo (aparece na busca do cadastro de casos)
          </label>

          <div className="flex gap-2">
            <Button type="submit" loading={loading} disabled={disabled}>
              Salvar
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
