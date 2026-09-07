import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'As senhas não coincidem',
  });
type Form = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPronto(true);
    });
    // se o usuário abriu o link e a sessão de recuperação já foi detectada na URL
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit({ password }: Form) {
    setErro(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErro(error.message);
      return;
    }
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <AuthLayout title="Nova senha" subtitle="Defina uma senha para acessar sua conta.">
      {!pronto ? (
        <Alert tone="warning">
          Abra esta página pelo link enviado ao seu e-mail. Se já abriu e continua vendo isto,
          o link pode ter expirado — peça um novo em “Esqueci minha senha”.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {erro && <Alert tone="error">{erro}</Alert>}
          <Field label="Nova senha" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          </Field>
          <Field label="Confirmar senha" htmlFor="confirm" error={errors.confirm?.message}>
            <Input id="confirm" type="password" autoComplete="new-password" {...register('confirm')} />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Salvar senha
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
