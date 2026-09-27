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
  const [falha, setFalha] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit({ email }: Form) {
    setFalha(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    // E-mail inexistente não gera erro no Supabase, então mostrar falha aqui não vaza
    // se a conta existe. Já o limite de envio (429) recusa o e-mail de verdade — sem
    // avisar, a pessoa ficaria esperando um link que nunca vai chegar.
    if (error) {
      setFalha(
        error.status === 429 || error.code === 'over_email_send_rate_limit'
          ? 'Muitos pedidos de redefinição agora e o e-mail não foi enviado. Aguarde alguns minutos e tente de novo.'
          : 'Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos.',
      );
      return;
    }
    setEnviado(true);
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
          {falha && <Alert tone="error">{falha}</Alert>}
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
