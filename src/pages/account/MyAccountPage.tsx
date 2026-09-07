import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { updateMembro } from '@/lib/queries/membros';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { AvatarUploader } from './AvatarUploader';

const perfilSchema = z.object({
  nome: z.string().min(3, 'Informe o nome completo'),
  tel_zap: z.string().optional(),
  tel_residencial: z.string().optional(),
  tel_comercial: z.string().optional(),
  congregacao: z.string().optional(),
  especialidade: z.string().optional(),
  reunioes: z.string().optional(),
  nome_esposa: z.string().optional(),
  tel_esposa: z.string().optional(),
});
type PerfilForm = z.infer<typeof perfilSchema>;

export function MyAccountPage() {
  const { membro, session, refreshMembro } = useAuth();

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

      <EmailCard currentEmail={session?.user.email ?? membro.email} />

      <SenhaCard />
    </div>
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: membro.nome,
      tel_zap: membro.tel_zap ?? '',
      tel_residencial: membro.tel_residencial ?? '',
      tel_comercial: membro.tel_comercial ?? '',
      congregacao: membro.congregacao ?? '',
      especialidade: membro.especialidade ?? '',
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
        especialidade: values.especialidade || null,
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
            <Input
              id="acc-pwd"
              type="password"
              autoComplete="new-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </Field>
          <Field label="Confirmar senha" htmlFor="acc-pwd2">
            <Input
              id="acc-pwd2"
              type="password"
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
