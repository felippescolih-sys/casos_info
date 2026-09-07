import { useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { useAuth } from '@/auth/AuthProvider';
import {
  atualizarCaso,
  criarCaso,
  getCasoCompleto,
  listMembrosParaSelecao,
} from '@/lib/queries/casos';
import { listCongregacoes } from '@/lib/queries/congregacoes';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Combobox } from '@/components/ui/Combobox';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import type { CasoRow, ExameEntry } from '@/types/database';

type FormValues = {
  paciente_nome: string;
  idade: string;
  sexo: string;
  uf: string;
  cidade: string;
  congregacao: string;
  batizado: boolean;
  nome_mae: string;
  mae_batizada: boolean;
  nome_pai: string;
  pai_batizado: boolean;

  hospital_nome: string;
  num_quarto: string;
  tele_hospital: string;
  plano_nome: string;
  tipo_atendimento: string;

  nome_telefonou: string;
  parentesco_telefonou: string;
  paciente_solicitou_ajuda: boolean;
  acompanhante_nome: string;
  telefone_paciente: string;
  telefone_acompanhante: string;
  anciaos_contatados: string;
  anciaos_cont_tel: string;

  medico_responsavel: string;
  especialidade: string;
  morbidade: string;
  info_medica: string;
  plano_tratamento: string;
  estrategia: string;
  artigos_medicos: string;
  resumo: string;
  outras_infos: string;

  transpac: boolean;
  transfundido: boolean;
  gvp: boolean;
  tags: string;

  responsavel_id: string;
  exames: ExameEntry[];
};

function defaults(caso?: CasoRow | null, meId?: string): FormValues {
  const ex = caso?.exames ?? [];
  return {
    paciente_nome: caso?.paciente_nome ?? '',
    idade: caso?.idade ?? '',
    sexo: caso?.sexo ?? '',
    uf: caso?.uf ?? '',
    cidade: caso?.cidade ?? '',
    congregacao: caso?.congregacao ?? '',
    batizado: caso?.batizado ?? false,
    nome_mae: caso?.nome_mae ?? '',
    mae_batizada: caso?.mae_batizada ?? false,
    nome_pai: caso?.nome_pai ?? '',
    pai_batizado: caso?.pai_batizado ?? false,
    hospital_nome: caso?.hospital_nome ?? '',
    num_quarto: caso?.num_quarto ?? '',
    tele_hospital: caso?.tele_hospital ?? '',
    plano_nome: caso?.plano_nome ?? '',
    tipo_atendimento: caso?.tipo_atendimento ?? '',
    nome_telefonou: caso?.nome_telefonou ?? '',
    parentesco_telefonou: caso?.parentesco_telefonou ?? '',
    paciente_solicitou_ajuda: caso?.paciente_solicitou_ajuda ?? false,
    acompanhante_nome: caso?.acompanhante_nome ?? '',
    telefone_paciente: caso?.telefone_paciente ?? '',
    telefone_acompanhante: caso?.telefone_acompanhante ?? '',
    anciaos_contatados: caso?.anciaos_contatados ?? '',
    anciaos_cont_tel: caso?.anciaos_cont_tel ?? '',
    medico_responsavel: caso?.medico_responsavel ?? '',
    especialidade: caso?.especialidade ?? '',
    morbidade: caso?.morbidade ?? '',
    info_medica: caso?.info_medica ?? '',
    plano_tratamento: caso?.plano_tratamento ?? '',
    estrategia: caso?.estrategia ?? '',
    artigos_medicos: caso?.artigos_medicos ?? '',
    resumo: caso?.resumo ?? '',
    outras_infos: caso?.outras_infos ?? '',
    transpac: caso?.transpac ?? false,
    transfundido: caso?.transfundido ?? false,
    gvp: caso?.gvp ?? false,
    tags: (caso?.tags ?? []).join(', '),
    responsavel_id: caso?.responsavel_id ?? meId ?? '',
    exames: [0, 1, 2].map((i) => ex[i] ?? {}),
  };
}

const nil = (s: string) => (s.trim() ? s.trim() : null);

function toPayload(v: FormValues) {
  const exames = v.exames
    .map((e) => ({
      data: e.data?.trim() || undefined,
      hb: e.hb?.trim() || undefined,
      ht: e.ht?.trim() || undefined,
      plq: e.plq?.trim() || undefined,
      outro: e.outro?.trim() || undefined,
    }))
    .filter((e) => Object.values(e).some(Boolean));

  return {
    paciente_nome: nil(v.paciente_nome),
    idade: nil(v.idade),
    sexo: nil(v.sexo),
    uf: nil(v.uf),
    cidade: nil(v.cidade),
    congregacao: nil(v.congregacao),
    batizado: v.batizado,
    nome_mae: nil(v.nome_mae),
    mae_batizada: v.mae_batizada,
    nome_pai: nil(v.nome_pai),
    pai_batizado: v.pai_batizado,
    hospital_nome: nil(v.hospital_nome),
    num_quarto: nil(v.num_quarto),
    tele_hospital: nil(v.tele_hospital),
    plano_nome: nil(v.plano_nome),
    tipo_atendimento: nil(v.tipo_atendimento),
    nome_telefonou: nil(v.nome_telefonou),
    parentesco_telefonou: nil(v.parentesco_telefonou),
    paciente_solicitou_ajuda: v.paciente_solicitou_ajuda,
    acompanhante_nome: nil(v.acompanhante_nome),
    telefone_paciente: nil(v.telefone_paciente),
    telefone_acompanhante: nil(v.telefone_acompanhante),
    anciaos_contatados: nil(v.anciaos_contatados),
    anciaos_cont_tel: nil(v.anciaos_cont_tel),
    medico_responsavel: nil(v.medico_responsavel),
    especialidade: nil(v.especialidade),
    morbidade: nil(v.morbidade),
    info_medica: nil(v.info_medica),
    plano_tratamento: nil(v.plano_tratamento),
    estrategia: nil(v.estrategia),
    artigos_medicos: nil(v.artigos_medicos),
    resumo: nil(v.resumo),
    outras_infos: nil(v.outras_infos),
    transpac: v.transpac,
    transfundido: v.transfundido,
    gvp: v.gvp,
    tags: v.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    exames,
  };
}

export function CasoFormPage({ mode }: { mode: 'novo' | 'editar' }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { membro } = useAuth();

  const casoQ = useQuery({
    queryKey: ['caso', id, 'completo'],
    queryFn: () => getCasoCompleto(id),
    enabled: mode === 'editar' && !!id,
  });
  const membrosQ = useQuery({
    queryKey: ['membros-selecao'],
    queryFn: listMembrosParaSelecao,
    enabled: mode === 'novo',
  });

  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FormValues>({
    defaultValues: defaults(null, membro?.id),
  });

  const congregacoesQ = useQuery({
    queryKey: ['congregacoes'],
    queryFn: listCongregacoes,
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (mode === 'editar' && casoQ.data) reset(defaults(casoQ.data, membro?.id));
  }, [mode, casoQ.data, membro?.id, reset]);

  const mutation = useMutation({
    mutationFn: async (v: FormValues) => {
      const payload = toPayload(v);
      if (mode === 'novo') {
        const respNome =
          membrosQ.data?.find((m) => m.id === v.responsavel_id)?.nome ?? membro!.nome;
        return criarCaso({
          ...payload,
          bubble_raw: {},
          status: 'aberto',
          criado_por_id: membro!.id,
          responsavel_id: v.responsavel_id || membro!.id,
          responsavel_nome: respNome,
        });
      }
      return atualizarCaso(id, payload);
    },
    onSuccess: (row) => {
      void qc.invalidateQueries({ queryKey: ['casos'] });
      void qc.invalidateQueries({ queryKey: ['caso', row.id] });
      navigate(`/casos/${row.id}`);
    },
  });

  const membroOpcoes = useMemo(() => membrosQ.data ?? [], [membrosQ.data]);

  if (mode === 'editar' && casoQ.isLoading) {
    return (
      <div className="flex justify-center p-8 text-gray-400">
        <Spinner className="size-6" />
      </div>
    );
  }
  if (mode === 'editar' && (casoQ.error || !casoQ.data)) {
    return (
      <Alert tone="error">
        {(casoQ.error as Error)?.message ??
          'Caso não encontrado ou você não tem acesso para editá-lo.'}
      </Alert>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="mx-auto max-w-3xl space-y-4"
    >
      <button
        type="button"
        onClick={() => navigate(mode === 'editar' ? `/casos/${id}` : '/casos')}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Voltar
      </button>
      <h1 className="text-xl font-semibold text-gray-900">
        {mode === 'novo' ? 'Novo caso' : 'Editar caso'}
      </h1>

      {mutation.error && <Alert tone="error">{(mutation.error as Error).message}</Alert>}

      <Sec title="Paciente">
        <Grid>
          <F label="Nome do paciente">
            <Input {...register('paciente_nome', { required: true })} />
          </F>
          <F label="Idade">
            <Input {...register('idade')} />
          </F>
          <F label="Sexo">
            <Select {...register('sexo')}>
              <option value="">—</option>
              <option>Feminino</option>
              <option>Masculino</option>
            </Select>
          </F>
          <F label="Cidade">
            <Input {...register('cidade')} />
          </F>
          <F label="UF">
            <Input {...register('uf')} maxLength={2} />
          </F>
          <F label="Congregação">
            <Combobox
              value={watch('congregacao')}
              onChange={(v) => setValue('congregacao', v, { shouldDirty: true })}
              options={congregacoesQ.data ?? []}
              placeholder="Buscar congregação…"
            />
          </F>
        </Grid>
        <Checks
          register={register}
          items={[
            ['batizado', 'Paciente batizado'],
            ['mae_batizada', 'Mãe batizada'],
            ['pai_batizado', 'Pai batizado'],
          ]}
        />
        <Grid>
          <F label="Nome da mãe">
            <Input {...register('nome_mae')} />
          </F>
          <F label="Nome do pai">
            <Input {...register('nome_pai')} />
          </F>
        </Grid>
      </Sec>

      <Sec title="Contato">
        <Grid>
          <F label="Quem telefonou">
            <Input {...register('nome_telefonou')} />
          </F>
          <F label="Parentesco com o paciente">
            <Input {...register('parentesco_telefonou')} />
          </F>
          <F label="Acompanhante">
            <Input {...register('acompanhante_nome')} />
          </F>
          <F label="Telefone do paciente">
            <Input {...register('telefone_paciente')} />
          </F>
          <F label="Telefone do acompanhante">
            <Input {...register('telefone_acompanhante')} />
          </F>
          <F label="Anciãos contatados">
            <Input {...register('anciaos_contatados')} />
          </F>
          <F label="Telefone dos anciãos">
            <Input {...register('anciaos_cont_tel')} />
          </F>
        </Grid>
        <Checks
          register={register}
          items={[['paciente_solicitou_ajuda', 'Paciente solicitou ajuda']]}
        />
      </Sec>

      <Sec title="Atendimento">
        <Grid>
          <F label="Hospital">
            <Input {...register('hospital_nome')} />
          </F>
          <F label="Quarto">
            <Input {...register('num_quarto')} />
          </F>
          <F label="Telefone do hospital">
            <Input {...register('tele_hospital')} />
          </F>
          <F label="Tipo de atendimento">
            <Select {...register('tipo_atendimento')}>
              <option value="">—</option>
              <option value="publico">Público (SUS)</option>
              <option value="plano">Plano / convênio</option>
              <option value="particular">Particular</option>
            </Select>
          </F>
          <F label="Plano / convênio">
            <Input {...register('plano_nome')} />
          </F>
        </Grid>
      </Sec>

      {mode === 'novo' && (
        <Sec title="Responsável">
          <F label="Membro responsável">
            <Select {...register('responsavel_id')}>
              <option value={membro!.id}>{membro!.nome} (eu)</option>
              {membroOpcoes
                .filter((m) => m.id !== membro!.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
            </Select>
          </F>
        </Sec>
      )}

      <Sec title="Médico / clínico">
        <Grid>
          <F label="Médico responsável">
            <Input {...register('medico_responsavel')} />
          </F>
          <F label="Especialidade">
            <Input {...register('especialidade')} />
          </F>
        </Grid>
        <F label="Morbidade">
          <Input {...register('morbidade')} />
        </F>
        <F label="Estratégia / opções">
          <Textarea {...register('estrategia')} />
        </F>
        <F label="Plano de tratamento">
          <Textarea {...register('plano_tratamento')} />
        </F>
        <F label="Artigos médicos">
          <Textarea {...register('artigos_medicos')} />
        </F>
        <F label="Resumo">
          <Textarea {...register('resumo')} />
        </F>
        <F label="Outras informações">
          <Textarea {...register('outras_infos')} />
        </F>
        <F label="Histórico do caso">
          <Textarea rows={6} {...register('info_medica')} />
        </F>
        <Checks
          register={register}
          items={[
            ['transpac', 'Transpac'],
            ['transfundido', 'Transfundido'],
            ['gvp', 'Em grupo (GVP)'],
          ]}
        />
        <F label="Tags (separadas por vírgula)">
          <Input {...register('tags')} placeholder="ONCO-HEMATO, PLANO" />
        </F>
      </Sec>

      <Sec title="Exames">
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-5">
              <Input placeholder="Data" {...register(`exames.${i}.data` as const)} />
              <Input placeholder="Hb" {...register(`exames.${i}.hb` as const)} />
              <Input placeholder="Ht" {...register(`exames.${i}.ht` as const)} />
              <Input placeholder="Plaquetas" {...register(`exames.${i}.plq` as const)} />
              <Input placeholder="Outro" {...register(`exames.${i}.outro` as const)} />
            </div>
          ))}
        </div>
      </Sec>

      <div className="flex gap-2">
        <Button type="submit" loading={mutation.isPending} disabled={!formState.isDirty && mode === 'editar'}>
          {mode === 'novo' ? 'Criar caso' : 'Salvar'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(mode === 'editar' ? `/casos/${id}` : '/casos')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">{title}</h2>
      </CardHeader>
      <CardBody className="space-y-4">{children}</CardBody>
    </Card>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return <Field label={label}>{children}</Field>;
}

function Checks({
  register,
  items,
}: {
  register: UseFormRegister<FormValues>;
  items: Array<[keyof FormValues, string]>;
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map(([name, label]) => (
        <label key={name} className="flex items-center gap-2 text-sm text-gray-700">
          <Checkbox {...register(name as never)} />
          {label}
        </label>
      ))}
    </div>
  );
}
