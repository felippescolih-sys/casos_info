import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

const schema = z.object({
  nome: z.string().min(3, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  tel_zap: z.string().min(8, 'Informe o WhatsApp'),
  congregacao: z.string().optional(),
  especialidade: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function SignupPage() {
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    setErro(null);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          nome: values.nome,
          tel_zap: values.tel_zap,
          congregacao: values.congregacao ?? null,
          especialidade: values.especialidade ?? null,
        },
      },
    });
    if (error) {
      setErro(error.message);
      return;
    }
    setOk(true);
  }

  if (ok) {
    return (
      <AuthLayout title="Cadastro enviado" subtitle="Falta só a aprovação.">
        <div className="space-y-4">
          <Alert tone="success">
            Sua conta foi criada. Um coordenador precisa aprovar seu acesso antes de você entrar.
            Se o e-mail exigir confirmação, verifique sua caixa de entrada.
          </Alert>
          <Link
            to="/login"
            className="block rounded-md bg-brand-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-800"
          >
            Ir para o login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Seu acesso passa por aprovação de um coordenador."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {erro && <Alert tone="error">{erro}</Alert>}
        <Field label="Nome completo" htmlFor="nome" error={errors.nome?.message}>
          <Input id="nome" autoComplete="name" {...register('nome')} />
        </Field>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Senha" htmlFor="password" error={errors.password?.message} hint="Mínimo 8 caracteres">
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="WhatsApp" htmlFor="tel_zap" error={errors.tel_zap?.message}>
          <Input id="tel_zap" inputMode="tel" placeholder="(11) 99999-9999" {...register('tel_zap')} />
        </Field>
        <Field label="Congregação" htmlFor="congregacao" error={errors.congregacao?.message}>
          <Input id="congregacao" {...register('congregacao')} />
        </Field>
        <Field label="Especialidade" htmlFor="especialidade" error={errors.especialidade?.message}>
          <Input id="especialidade" {...register('especialidade')} />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}
