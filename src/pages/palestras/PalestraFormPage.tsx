import { useEffect, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  atualizarPalestra,
  criarPalestra,
  getPalestra,
  listMembrosApresentacoes,
  type Palestra,
} from '@/lib/queries/palestras';
import { baixarHlc33Pdf } from '@/lib/hlc33Pdf';
import { HLC33_ESPECIALIDADES } from '@/lib/hlc33';
import { useAuth } from '@/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import type { PalestraInsert, PalestraRow } from '@/types/database';

const hojeBrasilia = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

const schema = z.object({
  finalidade: z.enum(['nova', 'atualizacao']),
  presencial: z.boolean(),
  online: z.boolean(),
  powerpoint: z.boolean(),
  display_exposicao: z.boolean(),
  observacoes: z.string(),
  data_apresentacao: z.string().min(1, 'Informe a data da apresentação'),
  qtd_participantes: z
    .string()
    .refine((v) => v.trim() === '' || /^\d+$/.test(v.trim()), 'Use só números (ex.: 45)'),
  especialidade_participantes: z.string(),
  evento: z.string(),
  coordenador_nome: z.string(),
  coordenador_contato: z.string(),
  site: z.string(),
  local_nome: z.string(),
  endereco: z.string(),
  endereco_complemento: z.string(),
  cidade: z.string(),
  uf: z.string(),
  cep: z.string(),
  pais: z.string(),
  problemas: z.string(),
  experiencias: z.string(),
  nome_colih: z.string().min(1, 'Informe o nome da Colih'),
  membro_id: z.string().min(1, 'Escolha o membro da Colih que fez a apresentação'),
  data_formulario: z.string().min(1, 'Informe a data do formulário'),
});
type Form = z.infer<typeof schema>;

const vazio = (membroId: string): Form => ({
  finalidade: 'nova',
  presencial: true,
  online: false,
  powerpoint: false,
  display_exposicao: false,
  observacoes: '',
  data_apresentacao: '',
  qtd_participantes: '',
  especialidade_participantes: '',
  evento: '',
  coordenador_nome: '',
  coordenador_contato: '',
  site: '',
  local_nome: '',
  endereco: '',
  endereco_complemento: '',
  cidade: '',
  uf: 'PR',
  cep: '',
  pais: 'Brasil',
  problemas: '',
  experiencias: '',
  nome_colih: 'Colih de Curitiba',
  membro_id: membroId,
  data_formulario: hojeBrasilia(),
});

const doRegistro = (p: Palestra): Form => ({
  finalidade: p.finalidade,
  presencial: p.presencial,
  online: p.online,
  powerpoint: p.powerpoint,
  display_exposicao: p.display_exposicao,
  observacoes: p.observacoes ?? '',
  data_apresentacao: p.data_apresentacao,
  qtd_participantes: p.qtd_participantes == null ? '' : String(p.qtd_participantes),
  especialidade_participantes: p.especialidade_participantes ?? '',
  evento: p.evento ?? '',
  coordenador_nome: p.coordenador_nome ?? '',
  coordenador_contato: p.coordenador_contato ?? '',
  site: p.site ?? '',
  local_nome: p.local_nome ?? '',
  endereco: p.endereco ?? '',
  endereco_complemento: p.endereco_complemento ?? '',
  cidade: p.cidade ?? '',
  uf: p.uf ?? '',
  cep: p.cep ?? '',
  pais: p.pais,
  problemas: p.problemas ?? '',
  experiencias: p.experiencias ?? '',
  nome_colih: p.nome_colih,
  membro_id: p.membro_id ?? '',
  data_formulario: p.data_formulario,
});

const nil = (s: string) => (s.trim() ? s.trim() : null);

function Parte({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800">
        {titulo}
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </Card>
  );
}

export function PalestraFormPage({ mode }: { mode: 'nova' | 'editar' }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { membro, gerenciaPalestras } = useAuth();

  const palestraQ = useQuery({
    queryKey: ['palestra', id],
    queryFn: () => getPalestra(id),
    enabled: mode === 'editar' && !!id,
  });
  const membrosQ = useQuery({
    queryKey: ['membros', 'apresentacoes'],
    queryFn: listMembrosApresentacoes,
    enabled: gerenciaPalestras,
    staleTime: 600_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: vazio(membro?.id ?? '') });

  useEffect(() => {
    if (mode === 'editar' && palestraQ.data) reset(doRegistro(palestraQ.data));
    else if (mode === 'nova' && membro) reset(vazio(membro.id));
  }, [mode, palestraQ.data, membro, reset]);

  const salvar = useMutation({
    mutationFn: async ({ v }: { v: Form; pdf: boolean }) => {
      const payload: PalestraInsert = {
        finalidade: v.finalidade,
        presencial: v.presencial,
        online: v.online,
        powerpoint: v.powerpoint,
        display_exposicao: v.display_exposicao,
        observacoes: nil(v.observacoes),
        data_apresentacao: v.data_apresentacao,
        qtd_participantes: v.qtd_participantes.trim() ? Number(v.qtd_participantes) : null,
        especialidade_participantes: nil(v.especialidade_participantes),
        evento: nil(v.evento),
        coordenador_nome: nil(v.coordenador_nome),
        coordenador_contato: nil(v.coordenador_contato),
        site: nil(v.site),
        local_nome: nil(v.local_nome),
        endereco: nil(v.endereco),
        endereco_complemento: nil(v.endereco_complemento),
        cidade: nil(v.cidade),
        uf: nil(v.uf.toUpperCase()),
        cep: nil(v.cep),
        pais: v.pais.trim() || 'Brasil',
        problemas: nil(v.problemas),
        experiencias: nil(v.experiencias),
        nome_colih: v.nome_colih.trim(),
        membro_id: v.membro_id,
        data_formulario: v.data_formulario,
      };
      return mode === 'nova' ? criarPalestra(payload) : atualizarPalestra(id, payload);
    },
    onSuccess: async (row: PalestraRow, { v, pdf }) => {
      void qc.invalidateQueries({ queryKey: ['palestras'] });
      void qc.invalidateQueries({ queryKey: ['palestra', row.id] });
      if (pdf) {
        const nome =
          membrosQ.data?.find((m) => m.id === v.membro_id)?.nome ??
          (v.membro_id === membro?.id ? membro?.nome : palestraQ.data?.membro_nome) ??
          null;
        await baixarHlc33Pdf(row, nome);
      }
      navigate('/palestras');
    },
  });

  if (mode === 'editar' && palestraQ.isLoading) {
    return (
      <div className="flex justify-center p-8 text-gray-400">
        <Spinner className="size-6" />
      </div>
    );
  }
  if (mode === 'editar' && (palestraQ.error || !palestraQ.data)) {
    return (
      <Alert tone="error">
        {(palestraQ.error as Error)?.message ?? 'Palestra não encontrada ou você não tem acesso a ela.'}
      </Alert>
    );
  }

  // Membros com a função; inclui quem já está no registro ou quem está logado, se não estiverem na lista.
  const opcoesMembro = [...(membrosQ.data ?? [])];
  const garantir = (mid: string | null | undefined, nome: string | null | undefined) => {
    if (mid && nome && !opcoesMembro.some((m) => m.id === mid)) opcoesMembro.push({ id: mid, nome });
  };
  garantir(palestraQ.data?.membro_id, palestraQ.data?.membro_nome);
  garantir(membro?.id, membro?.nome);
  opcoesMembro.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const enviar = (pdf: boolean) => handleSubmit((v) => salvar.mutate({ v, pdf }));

  return (
    <form onSubmit={enviar(false)} className="mx-auto max-w-4xl space-y-4 pb-10">
      <button
        type="button"
        onClick={() => navigate('/palestras')}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Voltar
      </button>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {mode === 'nova' ? 'Registrar palestra' : 'Editar palestra'}
        </h1>
        <p className="text-sm text-gray-500">
          Apresentação realizada pela Comissão de Ligação com Hospitais (HLC-33).
        </p>
      </div>

      {salvar.error && <Alert tone="error">{(salvar.error as Error).message}</Alert>}

      <Parte titulo="Parte 1">
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">Este formulário está sendo usado para</legend>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input type="radio" value="nova" className="size-4 text-brand-700" {...register('finalidade')} />
              Dar informações sobre uma nova apresentação
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="radio"
                value="atualizacao"
                className="size-4 text-brand-700"
                {...register('finalidade')}
              />
              Atualizar as informações de uma apresentação já existente
            </label>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">Tipo de apresentação</legend>
            {(
              [
                ['presencial', 'Presencial'],
                ['online', 'On-line'],
                ['powerpoint', 'PowerPoint'],
                ['display_exposicao', 'Display de exposição'],
              ] as const
            ).map(([campo, rotulo]) => (
              <label key={campo} className="flex items-center gap-2 text-sm text-gray-800">
                <Checkbox {...register(campo)} />
                {rotulo}
              </label>
            ))}
          </fieldset>
        </div>
        <Field label="Observações" htmlFor="observacoes">
          <Textarea id="observacoes" rows={2} {...register('observacoes')} />
        </Field>
      </Parte>

      <Parte titulo="Parte 2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data da apresentação" htmlFor="data_apresentacao" error={errors.data_apresentacao?.message}>
            <Input id="data_apresentacao" type="date" {...register('data_apresentacao')} />
          </Field>
          <Field
            label="Quantidade de participantes"
            htmlFor="qtd_participantes"
            error={errors.qtd_participantes?.message}
          >
            <Input id="qtd_participantes" inputMode="numeric" {...register('qtd_participantes')} />
          </Field>
          <Field
            label="Especialidade dos participantes"
            htmlFor="especialidade_participantes"
            hint="Lista do formulário oficial. Para estudantes, enfermagem ou público misto, use Outra e detalhe nas observações."
          >
            <Select id="especialidade_participantes" {...register('especialidade_participantes')}>
              <option value="">—</option>
              {HLC33_ESPECIALIDADES.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.rotulo}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Evento" htmlFor="evento">
            <Input id="evento" placeholder="Ex.: Jornada Acadêmica de Medicina" {...register('evento')} />
          </Field>
          <Field label="Coordenador do evento" htmlFor="coordenador_nome">
            <Input id="coordenador_nome" {...register('coordenador_nome')} />
          </Field>
          <Field
            label="Informações de contato do coordenador"
            htmlFor="coordenador_contato"
            hint="Uma informação por linha (o formulário tem duas linhas: telefone e e-mail, por exemplo)."
          >
            <Textarea id="coordenador_contato" rows={2} {...register('coordenador_contato')} />
          </Field>
          <Field label="Site do evento" htmlFor="site">
            <Input id="site" {...register('site')} />
          </Field>
          <Field label="Nome do local" htmlFor="local_nome">
            <Input id="local_nome" placeholder="Ex.: Universidade Positivo" {...register('local_nome')} />
          </Field>
          <Field label="Endereço" htmlFor="endereco">
            <Input id="endereco" {...register('endereco')} />
          </Field>
          <Field label="Complemento / bairro" htmlFor="endereco_complemento">
            <Input id="endereco_complemento" {...register('endereco_complemento')} />
          </Field>
          <Field label="Cidade" htmlFor="cidade">
            <Input id="cidade" {...register('cidade')} />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Estado" htmlFor="uf">
              <Input id="uf" maxLength={2} className="uppercase" {...register('uf')} />
            </Field>
            <Field label="CEP" htmlFor="cep">
              <Input id="cep" inputMode="numeric" {...register('cep')} />
            </Field>
            <Field label="País" htmlFor="pais">
              <Input id="pais" {...register('pais')} />
            </Field>
          </div>
        </div>
        <Field label="Problemas encontrados" htmlFor="problemas">
          <Textarea id="problemas" rows={4} {...register('problemas')} />
        </Field>
        <Field label="Experiências positivas" htmlFor="experiencias">
          <Textarea id="experiencias" rows={4} {...register('experiencias')} />
        </Field>
      </Parte>

      <Parte titulo="Parte 3">
        <p className="text-xs text-gray-500">
          Ao preencher e enviar este formulário, você confirma que todos os terceiros listados acima concordaram
          com o armazenamento e processamento de suas informações pessoais pela Colih, e que foram informados de
          que podem entrar em contato com a Colih se mudarem suas preferências.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nome da Colih" htmlFor="nome_colih" error={errors.nome_colih?.message}>
            <Input id="nome_colih" {...register('nome_colih')} />
          </Field>
          <Field label="Data" htmlFor="data_formulario" error={errors.data_formulario?.message}>
            <Input id="data_formulario" type="date" {...register('data_formulario')} />
          </Field>
          <Field
            label="Membro da Colih"
            htmlFor="membro_id"
            error={errors.membro_id?.message}
            hint={gerenciaPalestras ? undefined : 'Você registra as palestras que você fez.'}
          >
            {gerenciaPalestras ? (
              <Select id="membro_id" {...register('membro_id')}>
                <option value="">—</option>
                {opcoesMembro.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </Select>
            ) : (
              <>
                <Input id="membro_id" readOnly value={palestraQ.data?.membro_nome ?? membro?.nome ?? ''} />
                <input type="hidden" {...register('membro_id')} />
              </>
            )}
          </Field>
        </div>
      </Parte>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={salvar.isPending} disabled={mode === 'editar' && !isDirty}>
          Salvar
        </Button>
        <Button type="button" variant="secondary" loading={salvar.isPending} onClick={() => void enviar(true)()}>
          Salvar e baixar HLC-33
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate('/palestras')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
