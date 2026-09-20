import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { definirEspecialidade, updateMembro } from '@/lib/queries/membros';
import { criarAusencia, excluirAusencia, listAusencias } from '@/lib/queries/ausencias';
import { EspecialidadesCheckboxes } from '@/components/EspecialidadesCheckboxes';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { AvatarUploader } from './AvatarUploader';
import { avisoWhatsapp } from '@/lib/telefone';
import { formatDateOnly } from '@/lib/format';
import type { AreaEspecialidade, MembroRow } from '@/types/database';

const perfilSchema = z.object({
  nome: z.string().min(3, 'Informe o nome completo'),
  tel_zap: z.string().optional(),
  tel_residencial: z.string().optional(),
  tel_comercial: z.string().optional(),
  congregacao: z.string().optional(),
  reunioes: z.string().optional(),
  nome_esposa: z.string().optional(),
  tel_esposa: z.string().optional(),
});
type PerfilForm = z.infer<typeof perfilSchema>;

export function MyAccountPage() {
  const { membro, especialidades, session, refreshMembro } = useAuth();

  if (!membro) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Minha conta</h1>

      <Card>
        <CardHeader>
          <h2 className="font-medium text-gray-900">Foto</h2>
        </CardHeader>
        <CardBody>
          <AvatarUploader
            membroId={membro.id}
            currentUrl={membro.avatar_url}
            nome={membro.nome}
            onDone={refreshMembro}
          />
        </CardBody>
      </Card>

      <PerfilCard membro={membro} onSaved={refreshMembro} />

      <DisponibilidadeCard membro={membro} onSaved={refreshMembro} />

      <AusenciasCard membroId={membro.id} />

      <EspecialidadesCard
        membroId={membro.id}
        atual={especialidades}
        onChanged={refreshMembro}
      />

      <EmailCard currentEmail={session?.user.email ?? membro.email} />

      <SenhaCard />
    </div>
  );
}

function EspecialidadesCard({
  membroId,
  atual,
  onChanged,
}: {
  membroId: string;
  atual: AreaEspecialidade[];
  onChanged: () => Promise<void>;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function toggle(area: AreaEspecialidade, ativo: boolean) {
    setPending(true);
    setErro(null);
    try {
      await definirEspecialidade(membroId, area, ativo);
      await onChanged();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar especialidade.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Especialidades clínicas</h2>
      </CardHeader>
      <CardBody>
        {erro && (
          <div className="mb-3">
            <Alert tone="error">{erro}</Alert>
          </div>
        )}
        <EspecialidadesCheckboxes selecionadas={atual} onToggle={toggle} disabled={pending} />
      </CardBody>
    </Card>
  );
}

function PerfilCard({
  membro,
  onSaved,
}: {
  membro: NonNullable<ReturnType<typeof useAuth>['membro']>;
  onSaved: () => Promise<void>;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: membro.nome,
      tel_zap: membro.tel_zap ?? '',
      tel_residencial: membro.tel_residencial ?? '',
      tel_comercial: membro.tel_comercial ?? '',
      congregacao: membro.congregacao ?? '',
      reunioes: membro.reunioes ?? '',
      nome_esposa: membro.nome_esposa ?? '',
      tel_esposa: membro.tel_esposa ?? '',
    },
  });

  async function onSubmit(values: PerfilForm) {
    setMsg(null);
    setErro(null);
    try {
      await updateMembro(membro.id, {
        nome: values.nome,
        tel_zap: values.tel_zap || null,
        tel_residencial: values.tel_residencial || null,
        tel_comercial: values.tel_comercial || null,
        congregacao: values.congregacao || null,
        reunioes: values.reunioes || null,
        nome_esposa: values.nome_esposa || null,
        tel_esposa: values.tel_esposa || null,
      });
      await onSaved();
      setMsg('Perfil atualizado.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Dados pessoais</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {msg && <Alert tone="success">{msg}</Alert>}
          {erro && <Alert tone="error">{erro}</Alert>}
          <Field label="Nome completo" htmlFor="nome" error={errors.nome?.message}>
            <Input id="nome" {...register('nome')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp" htmlFor="tel_zap" warning={avisoWhatsapp(watch('tel_zap'))}>
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
            <Field label="Reuniões" htmlFor="reunioes">
              <Input id="reunioes" {...register('reunioes')} />
            </Field>
            <Field label="Nome do cônjuge" htmlFor="nome_esposa">
              <Input id="nome_esposa" {...register('nome_esposa')} />
            </Field>
            <Field label="Telefone do cônjuge" htmlFor="tel_esposa">
              <Input id="tel_esposa" inputMode="tel" {...register('tel_esposa')} />
            </Field>
          </div>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Salvar
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

const DIAS_SEMANA = [
  { key: 'disp_seg', label: 'Seg' },
  { key: 'disp_ter', label: 'Ter' },
  { key: 'disp_qua', label: 'Qua' },
  { key: 'disp_qui', label: 'Qui' },
  { key: 'disp_sex', label: 'Sex' },
  { key: 'disp_sab', label: 'Sáb' },
  { key: 'disp_dom', label: 'Dom' },
] as const;
type DiaSemanaKey = (typeof DIAS_SEMANA)[number]['key'];
const TODOS_OS_DIAS = DIAS_SEMANA.map((d) => d.key);
const DIAS_UTEIS: DiaSemanaKey[] = ['disp_seg', 'disp_ter', 'disp_qua', 'disp_qui', 'disp_sex'];
const FIM_DE_SEMANA: DiaSemanaKey[] = ['disp_sab', 'disp_dom'];

type DispForm = Record<DiaSemanaKey, boolean> & { disp_evita_ultimos_dias_mes: string };

function DisponibilidadeCard({
  membro,
  onSaved,
}: {
  membro: MembroRow;
  onSaved: () => Promise<void>;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<DispForm>({
    defaultValues: {
      disp_seg: membro.disp_seg,
      disp_ter: membro.disp_ter,
      disp_qua: membro.disp_qua,
      disp_qui: membro.disp_qui,
      disp_sex: membro.disp_sex,
      disp_sab: membro.disp_sab,
      disp_dom: membro.disp_dom,
      disp_evita_ultimos_dias_mes:
        membro.disp_evita_ultimos_dias_mes != null ? String(membro.disp_evita_ultimos_dias_mes) : '',
    },
  });

  function preset(dias: DiaSemanaKey[]) {
    for (const k of TODOS_OS_DIAS) setValue(k, dias.includes(k), { shouldDirty: true });
  }

  async function onSubmit(v: DispForm) {
    setMsg(null);
    setErro(null);
    try {
      await updateMembro(membro.id, {
        disp_seg: v.disp_seg,
        disp_ter: v.disp_ter,
        disp_qua: v.disp_qua,
        disp_qui: v.disp_qui,
        disp_sex: v.disp_sex,
        disp_sab: v.disp_sab,
        disp_dom: v.disp_dom,
        disp_evita_ultimos_dias_mes: v.disp_evita_ultimos_dias_mes.trim()
          ? Number(v.disp_evita_ultimos_dias_mes)
          : null,
      });
      await onSaved();
      setMsg('Disponibilidade atualizada.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Disponibilidade para plantão</h2>
        <p className="mt-1 text-xs text-gray-500">
          Em quais dias você pode ser designado como responsável ou ajudante de plantão.
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {msg && <Alert tone="success">{msg}</Alert>}
          {erro && <Alert tone="error">{erro}</Alert>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => preset(TODOS_OS_DIAS)}
            >
              Qualquer dia
            </button>
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => preset(DIAS_UTEIS)}
            >
              Só dias úteis (seg–sex)
            </button>
            <button
              type="button"
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => preset(FIM_DE_SEMANA)}
            >
              Só fim de semana
            </button>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-800">
            {DIAS_SEMANA.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
                  {...register(key)}
                />
                {label}
              </label>
            ))}
          </div>

          <Field
            label="Evitar os últimos quantos dias do mês? (opcional)"
            htmlFor="disp-fim-mes"
            hint="Deixe em branco se não tem essa restrição — ex.: 5 evita ser designado nos últimos 5 dias de cada mês."
          >
            <Input
              id="disp-fim-mes"
              type="number"
              min={0}
              max={15}
              {...register('disp_evita_ultimos_dias_mes')}
            />
          </Field>

          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Salvar
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function AusenciasCard({ membroId }: { membroId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['ausencias', membroId],
    queryFn: () => listAusencias(membroId),
  });
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['ausencias', membroId] });

  const criar = useMutation({
    mutationFn: () => criarAusencia(membroId, inicio, fim),
    onSuccess: () => {
      setInicio('');
      setFim('');
      void invalidate();
    },
    onError: (e) => setErro(e instanceof Error ? e.message : 'Erro ao salvar ausência.'),
  });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirAusencia(id),
    onSuccess: () => void invalidate(),
  });

  function adicionar() {
    setErro(null);
    if (!inicio || !fim) return setErro('Informe início e fim.');
    if (fim < inicio) return setErro('O fim precisa ser depois do início.');
    criar.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Ausências</h2>
        <p className="mt-1 text-xs text-gray-500">
          Nesses períodos você não recebe casos por transferência nem é designado pra plantão.
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {erro && <Alert tone="error">{erro}</Alert>}

          {isLoading ? (
            <div className="flex justify-center py-4 text-gray-400">
              <Spinner className="size-5" />
            </div>
          ) : !data?.length ? (
            <p className="text-sm text-gray-500">Nenhuma ausência registrada.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-gray-800">
                    {formatDateOnly(a.inicio)} até {formatDateOnly(a.fim)}
                  </span>
                  <button
                    type="button"
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    onClick={() => excluir.mutate(a.id)}
                    disabled={excluir.isPending}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Início" htmlFor="aus-inicio">
              <Input
                id="aus-inicio"
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </Field>
            <Field label="Fim" htmlFor="aus-fim">
              <Input id="aus-fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </Field>
            <Button type="button" onClick={adicionar} loading={criar.isPending}>
              Adicionar
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function EmailCard({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMsg(null);
    setErro(null);
    if (!email || email === currentEmail) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email });
    setLoading(false);
    if (error) setErro(error.message);
    else setMsg('Confirme a alteração pelo link enviado ao e-mail novo (e ao atual).');
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">E-mail de acesso</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {msg && <Alert tone="success">{msg}</Alert>}
          {erro && <Alert tone="error">{erro}</Alert>}
          <Field label="E-mail" htmlFor="acc-email">
            <Input
              id="acc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button onClick={submit} loading={loading} disabled={email === currentEmail}>
            Alterar e-mail
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function SenhaCard() {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMsg(null);
    setErro(null);
    if (pwd.length < 8) return setErro('Mínimo de 8 caracteres.');
    if (pwd !== confirm) return setErro('As senhas não coincidem.');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) return setErro(error.message);
    setPwd('');
    setConfirm('');
    setMsg('Senha alterada.');
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">Senha</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {msg && <Alert tone="success">{msg}</Alert>}
          {erro && <Alert tone="error">{erro}</Alert>}
          <Field label="Nova senha" htmlFor="acc-pwd">
            <PasswordInput
              id="acc-pwd"
              autoComplete="new-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </Field>
          <Field label="Confirmar senha" htmlFor="acc-pwd2">
            <PasswordInput
              id="acc-pwd2"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          <Button onClick={submit} loading={loading} disabled={!pwd && !confirm}>
            Alterar senha
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
