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

const schema = z.object({ email: z.string().email('E-mail inválido') });
type Form = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit({ email }: Form) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviado(true); // sempre mostra sucesso (não vaza se o e-mail existe)
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Enviaremos um link para o seu e-mail."
      footer={
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Voltar ao login
        </Link>
      }
    >
      {enviado ? (
        <Alert tone="success">
          Se existir uma conta com esse e-mail, o link de redefinição já está a caminho.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Enviar link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
