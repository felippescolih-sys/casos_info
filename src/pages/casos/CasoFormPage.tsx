import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/auth/AuthProvider';
import {
  atualizarCaso,
  criarCaso,
  getCasoCompleto,
  listMembrosParaSelecao,
} from '@/lib/queries/casos';
import { listCongregacoes } from '@/lib/queries/congregacoes';
import { Combobox } from '@/components/ui/Combobox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import {
  Band,
  BlockCell,
  Cell,
  CheckRow,
  PageMark,
  Row,
  Sheet,
  SheetTitle,
  ValoresReferencia,
} from './hlc7-ui';
import type { CasoRow, ExameEntry } from '@/types/database';

// ── valores do formulário (flat, nomes = colunas) ────────────
type FV = Record<string, string | boolean | ExameEntry[]> & {
  responsavel_id: string;
  exames: ExameEntry[];
};

const TEXT_FIELDS = [
  'data_hora_contato', 'nome_telefonou', 'contato_telefonou', 'parentesco_telefonou',
  'paciente_nome', 'sexo', 'comentario_plano', 'idade', 'nome_pai', 'nome_mae',
  'comentario_familia', 'hospital_nome', 'num_quarto', 'tele_hospital', 'tipo_atendimento',
  'plano_nome', 'congregacao', 'cidade', 'uf', 'anciaos_contatados', 'anciaos_cont_tel',
  'rn_peso', 'rn_idade_gestacional', 'rn_data_nascimento', 'rn_apgar_nascimento', 'rn_apgar_5min',
  'morbidade', 'info_medica', 'medico_responsavel', 'especialidade', 'outro_medico',
  'outro_medico_especialidade', 'plano_tratamento', 'estrategia', 'artigos_medicos',
  'medico_consultor_nome', 'medico_consultor_contato', 'medico_consultor_especialidade',
  'medico_consultor_outras', 'transf_hospital_destino', 'transf_medico_destino',
  'transf_telefone_destino', 'outras_infos', 'resumo', 'tags',
] as const;

const BOOL_FIELDS = [
  'paciente_solicitou_ajuda', 'batizado', 'boa_condicao_espiritual', 'cartao_diretivas_ok',
  'mae_batizada', 'pai_batizado', 'equipe_informada', 'medico_disposto_cooperar',
  'transf_procedimentos_confirmados', 'transf_hid_informado', 'anciaos_acompanhamento',
  'transpac', 'transfundido', 'gvp',
] as const;

function defaults(c: CasoRow | null | undefined, meId?: string): FV {
  const v: FV = { responsavel_id: c?.responsavel_id ?? meId ?? '', exames: [{}, {}, {}] };
  for (const f of TEXT_FIELDS) {
    v[f] = f === 'tags' ? (c?.tags ?? []).join(', ') : ((c?.[f as keyof CasoRow] as string) ?? '');
  }
  for (const f of BOOL_FIELDS) v[f] = (c?.[f as keyof CasoRow] as boolean) ?? false;
  const ex = c?.exames ?? [];
  v.exames = [0, 1, 2].map((i) => ex[i] ?? {});
  return v;
}

const nil = (s: unknown) => (typeof s === 'string' && s.trim() ? s.trim() : null);

function toPayload(v: FV) {
  const out: Record<string, unknown> = {};
  for (const f of TEXT_FIELDS) {
    if (f === 'tags') continue;
    out[f] = nil(v[f]);
  }
  for (const f of BOOL_FIELDS) out[f] = Boolean(v[f]);
  out.tags = String(v.tags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  out.exames = (v.exames as ExameEntry[])
    .map((e) => ({
      data: e.data?.trim() || undefined,
      hb: e.hb?.trim() || undefined,
      ht: e.ht?.trim() || undefined,
      plq: e.plq?.trim() || undefined,
      outro: e.outro?.trim() || undefined,
    }))
    .filter((e) => Object.values(e).some(Boolean));
  return out;
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
  const congsQ = useQuery({
    queryKey: ['congregacoes'],
    queryFn: listCongregacoes,
    staleTime: 3_600_000,
  });

  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FV>({
    defaultValues: defaults(null, membro?.id),
  });

  useEffect(() => {
    if (mode === 'editar' && casoQ.data) reset(defaults(casoQ.data, membro?.id));
  }, [mode, casoQ.data, membro?.id, reset]);

  const mutation = useMutation({
    mutationFn: async (v: FV) => {
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

  const t = (name: (typeof TEXT_FIELDS)[number]) => register(name);
  const b = (name: (typeof BOOL_FIELDS)[number]) => register(name);

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="mx-auto max-w-4xl space-y-4 pb-10"
    >
      <button
        type="button"
        onClick={() => navigate(mode === 'editar' ? `/casos/${id}` : '/casos')}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Voltar
      </button>

      {mutation.error && <Alert tone="error">{(mutation.error as Error).message}</Alert>}

      <Sheet>
        <SheetTitle>Planilha de Emergência Médica</SheetTitle>

        {/* NOTIFICAÇÃO */}
        <Band tone="green">Notificação</Band>
        <Row cols={3}>
          <Cell label="Data/hora do contato">
            <FInput {...t('data_hora_contato')} />
          </Cell>
          <Cell label="Quem telefonou">
            <FInput {...t('nome_telefonou')} />
          </Cell>
          <Cell label="Contato da pessoa que telefonou">
            <FInput {...t('contato_telefonou')} />
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell>
            <label className="flex items-center gap-2">
              <FCheck {...b('paciente_solicitou_ajuda')} />
              Paciente solicitou ajuda da Colih
            </label>
          </Cell>
          <Cell label="Parentesco com o paciente">
            <FInput {...t('parentesco_telefonou')} />
          </Cell>
        </Row>

        {/* PACIENTE E HOSPITAL */}
        <Band tone="green">Informações sobre o paciente e o hospital</Band>
        <Row cols={2}>
          <Cell label="Nome do paciente">
            <FInput {...register('paciente_nome', { required: true })} />
          </Cell>
          <Cell label="Sexo">
            <FSelect {...t('sexo')}>
              <option value="">—</option>
              <option>Feminino</option>
              <option>Masculino</option>
            </FSelect>
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell label="Comentários (p. ex., nome e área de abrangência do plano de saúde)">
            <FTextarea rows={2} {...t('comentario_plano')} />
          </Cell>
          <Cell label="Idade">
            <FInput {...t('idade')} />
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell label="Nome do pai">
            <FInput {...t('nome_pai')} />
            <label className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <FCheck {...b('pai_batizado')} /> Batizado?
            </label>
          </Cell>
          <Cell label="Nome da mãe">
            <FInput {...t('nome_mae')} />
            <label className="mt-1 flex items-center gap-2 text-xs text-gray-600">
              <FCheck {...b('mae_batizada')} /> Batizada?
            </label>
          </Cell>
        </Row>
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-300 px-3 py-2 text-sm text-gray-800">
          <label className="flex items-center gap-2">
            <FCheck {...b('batizado')} /> Paciente batizado?
          </label>
          <label className="flex items-center gap-2">
            <FCheck {...b('boa_condicao_espiritual')} /> Boa condição espiritual?
          </label>
          <label className="flex items-center gap-2">
            <FCheck {...b('cartao_diretivas_ok')} /> Cartão Diretivas completo?
          </label>
        </div>
        <BlockCell label="Comentários (condição espiritual da família, etc.)">
          <FTextarea rows={2} {...t('comentario_familia')} />
        </BlockCell>
        <Row cols={1}>
          <Cell label="Nome do hospital">
            <FInput {...t('hospital_nome')} />
          </Cell>
        </Row>
        <Row cols={4}>
          <Cell label="N.° do quarto">
            <FInput {...t('num_quarto')} />
          </Cell>
          <Cell label="Telefone do hospital">
            <FInput {...t('tele_hospital')} />
          </Cell>
          <Cell label="Tipo de atendimento">
            <FSelect {...t('tipo_atendimento')}>
              <option value="">—</option>
              <option value="publico">Público (SUS)</option>
              <option value="plano">Plano / convênio</option>
              <option value="particular">Particular</option>
            </FSelect>
          </Cell>
          <Cell label="Plano / convênio">
            <FInput {...t('plano_nome')} />
          </Cell>
        </Row>
        <Row cols={1}>
          <Cell label="Congregação">
            <Combobox
              value={String(watch('congregacao') ?? '')}
              onChange={(val) => setValue('congregacao', val, { shouldDirty: true })}
              options={congsQ.data ?? []}
              placeholder="Buscar congregação…"
            />
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell label="Nomes dos anciãos contatados">
            <FInput {...t('anciaos_contatados')} />
          </Cell>
          <Cell label="Telefones de contato dos anciãos">
            <FInput {...t('anciaos_cont_tel')} />
          </Cell>
        </Row>

        <Band tone="green">Recém-nascidos</Band>
        <Row cols={3}>
          <Cell label="Peso ao nascer">
            <FInput {...t('rn_peso')} />
          </Cell>
          <Cell label="Idade gestacional (semanas)">
            <FInput {...t('rn_idade_gestacional')} />
          </Cell>
          <Cell label="Data de nascimento">
            <FInput {...t('rn_data_nascimento')} />
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell label="Pontuação APGAR — Nascimento">
            <FInput {...t('rn_apgar_nascimento')} />
          </Cell>
          <Cell label="Pontuação APGAR — 5 min">
            <FInput {...t('rn_apgar_5min')} />
          </Cell>
        </Row>

        {/* INFORMAÇÕES MÉDICAS */}
        <Band tone="green">Informações médicas sobre o caso</Band>
        <BlockCell
          label="Problema específico"
          hint="Qual é o diagnóstico médico? Por que a questão do sangue está envolvida (sangramento, bebê prematuro, anemia)?"
        >
          <FTextarea rows={3} {...t('morbidade')} />
        </BlockCell>
        <BlockCell
          label="Histórico de saúde ligado ao problema"
          hint="O que causou a emergência atual?"
        >
          <FTextarea rows={6} {...t('info_medica')} />
        </BlockCell>

        {/* VALORES LABORATORIAIS */}
        <Band tone="orange">Valores laboratoriais</Band>
        {[0, 1, 2].map((i) => (
          <Row key={i} cols={4}>
            <Cell label={`Exame ${i + 1} — data/hora`}>
              <FInput {...register(`exames.${i}.data` as const)} />
            </Cell>
            <Cell label="Hemoglobina (Hb g/dL)">
              <FInput {...register(`exames.${i}.hb` as const)} />
            </Cell>
            <Cell label="Hematócrito (Ht %)">
              <FInput {...register(`exames.${i}.ht` as const)} />
            </Cell>
            <Cell label="Plaquetas (Plq/μL)">
              <FInput {...register(`exames.${i}.plq` as const)} />
            </Cell>
          </Row>
        ))}
        <Row cols={1}>
          <Cell label="Outro (qualquer exame)">
            <FInput {...register('exames.0.outro' as const)} placeholder="ex.: RNI 1,01" />
          </Cell>
        </Row>
        <ValoresReferencia />

        {/* MÉDICOS */}
        <Band tone="green">Informações sobre o(s) médico(s)</Band>
        <Row cols={2}>
          <Cell label="Médico responsável">
            <FInput {...t('medico_responsavel')} />
          </Cell>
          <Cell label="Especialidade">
            <FInput {...t('especialidade')} />
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell label="Outro médico">
            <FInput {...t('outro_medico')} />
          </Cell>
          <Cell label="Especialidade">
            <FInput {...t('outro_medico_especialidade')} />
          </Cell>
        </Row>

        {/* PLANO DE TRATAMENTO */}
        <Band tone="green" hint="Exames, procedimentos ou tratamentos oferecidos">
          Plano de tratamento médico
        </Band>
        <CheckRow>
          <FCheck {...b('equipe_informada')} />
          A equipe médica foi informada de que o paciente pediu ajuda da Colih?
        </CheckRow>
        <BlockCell>
          <FTextarea rows={5} {...t('plano_tratamento')} />
        </BlockCell>

        <PageMark>Página 2</PageMark>

        {/* ESTRATÉGIAS */}
        <Band
          tone="blue"
          hint="Especifique os tratamentos, procedimentos ou técnicas a serem apresentados aos médicos."
        >
          Estratégias / opções de tratamento
        </Band>
        <BlockCell>
          <FTextarea rows={6} {...t('estrategia')} />
        </BlockCell>

        {/* ARTIGOS */}
        <Band
          tone="blue"
          hint="Quais artigos foram fornecidos às equipes médicas (ou indicados para consulta no jw.org)."
        >
          Artigos médicos
        </Band>
        <BlockCell>
          <FTextarea rows={5} {...t('artigos_medicos')} />
        </BlockCell>
        <CheckRow>
          <FCheck {...b('medico_disposto_cooperar')} />
          Depois de analisar os artigos de apoio, o médico está disposto a cooperar?
        </CheckRow>

        {/* MÉDICO CONSULTOR */}
        <Band
          tone="blue"
          hint="O médico responsável está disposto a contatar um especialista experiente em tratamento sem sangue?"
        >
          Contato de um médico consultor
        </Band>
        <Row cols={2}>
          <Cell label="Nome do médico consultor">
            <FInput {...t('medico_consultor_nome')} />
          </Cell>
          <Cell label="Preferências de contato">
            <FInput {...t('medico_consultor_contato')} />
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell label="Especialidade">
            <FInput {...t('medico_consultor_especialidade')} />
          </Cell>
          <Cell label="Outras informações">
            <FInput {...t('medico_consultor_outras')} />
          </Cell>
        </Row>

        {/* NECESSIDADE DE TRANSFERÊNCIA */}
        <Band
          tone="blue"
          hint="A decisão é do paciente e/ou familiares. Descreva o método de transferência."
        >
          Necessidade de transferência (mudança de hospital)
        </Band>
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-300 px-3 py-2 text-sm text-gray-800">
          <label className="flex items-center gap-2">
            <FCheck {...b('transf_procedimentos_confirmados')} /> Procedimentos para a
            transferência já confirmados
          </label>
          <label className="flex items-center gap-2">
            <FCheck {...b('transf_hid_informado')} /> HID já informado (transferência para região
            de outra Colih)
          </label>
        </div>
        <Row cols={1}>
          <Cell label="Nome do hospital de destino">
            <FInput {...t('transf_hospital_destino')} />
          </Cell>
        </Row>
        <Row cols={2}>
          <Cell label="Médico responsável no destino">
            <FInput {...t('transf_medico_destino')} />
          </Cell>
          <Cell label="Telefone de contato no destino">
            <FInput {...t('transf_telefone_destino')} />
          </Cell>
        </Row>
        <BlockCell label="Outras informações">
          <FTextarea rows={3} {...t('outras_infos')} />
        </BlockCell>

        {/* RESULTADO / ACOMPANHAMENTO */}
        <Band tone="orange" hint="Descreva o resultado e o acompanhamento, se houver.">
          Resultado / acompanhamento
        </Band>
        <CheckRow>
          <FCheck {...b('anciaos_acompanhamento')} />
          Os anciãos locais foram contatados para dar acompanhamento
        </CheckRow>
        <BlockCell>
          <FTextarea rows={4} {...t('resumo')} />
        </BlockCell>

        {/* dados internos do app */}
        <Band tone="green">Controle interno (Casos Info)</Band>
        {mode === 'novo' && (
          <Row cols={1}>
            <Cell label="Membro responsável">
              <FSelect {...register('responsavel_id')}>
                <option value={membro!.id}>{membro!.nome} (eu)</option>
                {(membrosQ.data ?? [])
                  .filter((m) => m.id !== membro!.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
              </FSelect>
            </Cell>
          </Row>
        )}
        <Row cols={2}>
          <Cell label="Cidade">
            <FInput {...t('cidade')} />
          </Cell>
          <Cell label="UF">
            <FInput {...t('uf')} maxLength={2} />
          </Cell>
        </Row>
        <Row cols={1}>
          <Cell label="Tags (separadas por vírgula)">
            <FInput {...t('tags')} placeholder="ONCO-HEMATO, PLANO" />
          </Cell>
        </Row>
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-3 py-2 text-sm text-gray-800">
          <label className="flex items-center gap-2">
            <FCheck {...b('transpac')} /> Transpac
          </label>
          <label className="flex items-center gap-2">
            <FCheck {...b('transfundido')} /> Transfundido
          </label>
          <label className="flex items-center gap-2">
            <FCheck {...b('gvp')} /> Em grupo (GVP)
          </label>
        </div>
      </Sheet>

      <input type="hidden" {...register('congregacao')} />

      <p className="text-xs text-gray-500">
        OBSERVAÇÃO: foi mencionada uma possível <strong>ação judicial</strong>? Nesse caso, contate
        imediatamente o Departamento de Informações sobre Hospitais.
      </p>

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={!formState.isDirty && mode === 'editar'}
        >
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

// ── inputs no estilo "formulário" (borda leve, fundo transparente) ──
const fieldCls =
  'block w-full rounded-sm border-0 bg-transparent px-1 py-0.5 text-sm text-gray-900 ' +
  'ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-brand-500';

function FInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldCls, props.className)} autoComplete="off" />;
}
function FTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldCls, 'resize-y', props.className)} />;
}
function FSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldCls, props.className)} />;
}
function FCheck(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={cn(
        'size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600',
        props.className,
      )}
    />
  );
}
