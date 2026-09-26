import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { InstalarApp } from '@/components/InstalarApp';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});
type Form = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [erro, setErro] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setErro(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message,
      );
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse com seu e-mail e senha."
      footer={
        <div className="space-y-4">
          <div>
            Não tem conta?{' '}
            <Link to="/signup" className="font-medium text-brand-700 hover:underline">
              Cadastre-se
            </Link>
          </div>
          <div className="flex justify-center">
            <InstalarApp />
          </div>
        </div>
      }
    >
      <div className="mb-5">
        <PrimeiroAcesso />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {erro && <Alert tone="error">{erro}</Alert>}
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Senha" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...register('password')}
          />
        </Field>
        <div className="text-right">
          <Link to="/esqueci-senha" className="text-sm text-brand-700 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}

/**
 * Os membros vieram do Casos Info antigo (Bubble): a conta já existe com o mesmo
 * e-mail, mas nunca teve senha neste sistema. Sem este aviso a pessoa tenta
 * "Cadastre-se", cria uma conta nova que cai na fila de aprovação, e perde o
 * vínculo com o histórico dela. O lembrete do spam está aqui porque o e-mail de
 * redefinição é automático e cai em spam com frequência.
 */
function PrimeiroAcesso() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900 ring-1 ring-inset ring-blue-200">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left font-medium"
        aria-expanded={aberto}
      >
        É seu primeiro acesso?
        <svg
          className={`size-4 shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {aberto && (
        <div className="mt-2 space-y-2 text-blue-900">
          <p>
            Sua conta já existe. Use o{' '}
            <span className="font-medium">mesmo e-mail do Casos Info antigo</span> — não crie um
            cadastro novo, senão você perde seu histórico de casos.
          </p>
          <p>
            Você ainda não tem senha neste sistema. Clique em{' '}
            <Link to="/esqueci-senha" className="font-medium underline">
              Esqueci minha senha
            </Link>{' '}
            para criar a sua.
          </p>
          <p className="font-medium">
            O link chega por e-mail. Se não aparecer, confira a caixa de spam ou lixo eletrônico.
          </p>
        </div>
      )}
    </div>
  );
}
