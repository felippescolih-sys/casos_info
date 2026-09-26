import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { updateMembro } from '@/lib/queries/membros';
import { listCongregacoes } from '@/lib/queries/congregacoes';
import {
  DIAS_SEMANA,
  DIAS_UTEIS,
  FIM_DE_SEMANA,
  TODOS_OS_DIAS,
  type DiaSemanaKey,
} from '@/lib/disponibilidade';
import { perfilPendente, whatsappUtilizavel } from '@/lib/perfil';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Combobox } from '@/components/ui/Combobox';

type Form = Record<DiaSemanaKey, boolean> & {
  tel_zap: string;
  congregacao: string;
  disp_evita_ultimos_dias_mes: string;
};

/**
 * Onboarding de primeiro acesso. Aparece por cima do app inteiro e não fecha
 * enquanto faltar dado — o membro cai aqui vindo do Bubble com cadastro parcial,
 * e um `tel_zap` em branco significa não receber nenhum aviso automático sem que
 * ninguém perceba. A saída de emergência é sair da conta, não pular a etapa.
 */
export function CompletarPerfilDialog() {
  const { membro, refreshMembro, signOut } = useAuth();
  const [erro, setErro] = useState<string | null>(null);

  const { data: congregacoes = [] } = useQuery({
    queryKey: ['congregacoes'],
    queryFn: listCongregacoes,
    staleTime: 60 * 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Form>({
    defaultValues: {
      tel_zap: membro?.tel_zap ?? '',
      congregacao: membro?.congregacao ?? '',
      disp_seg: membro?.disp_seg ?? true,
      disp_ter: membro?.disp_ter ?? true,
      disp_qua: membro?.disp_qua ?? true,
      disp_qui: membro?.disp_qui ?? true,
      disp_sex: membro?.disp_sex ?? true,
      disp_sab: membro?.disp_sab ?? true,
      disp_dom: membro?.disp_dom ?? true,
      disp_evita_ultimos_dias_mes:
        membro?.disp_evita_ultimos_dias_mes != null
          ? String(membro.disp_evita_ultimos_dias_mes)
          : '',
    },
  });

  if (!perfilPendente(membro) || !membro) return null;

  const telZap = watch('tel_zap');
  const congregacao = watch('congregacao');
  const telOk = whatsappUtilizavel(telZap);
  const congregacaoOk = congregacao.trim().length > 0;

  function preset(dias: DiaSemanaKey[]) {
    for (const k of TODOS_OS_DIAS) setValue(k, dias.includes(k));
  }

  async function onSubmit(v: Form) {
    setErro(null);
    try {
      await updateMembro(membro!.id, {
        tel_zap: v.tel_zap.trim(),
        congregacao: v.congregacao.trim(),
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
        perfil_confirmado_em: new Date().toISOString(),
      });
      await refreshMembro();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.');
    }
  }

  return (
    <Modal
      open
      dismissible={false}
      onClose={() => {}}
      maxWidthClassName="max-w-xl"
      title="Confirme seu cadastro"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <p className="text-sm text-gray-600">
          Bem-vindo(a) ao Casos Info, {membro.nome.split(' ')[0]}! Seus dados vieram do sistema
          antigo e precisam de uma conferência rápida. É só desta vez.
        </p>

        {erro && <Alert tone="error">{erro}</Alert>}

        <Field
          label="WhatsApp (com DDD)"
          htmlFor="onb-zap"
          hint="É por aqui que chegam os avisos de plantão e de transferência de caso. Sem DDD não conseguimos enviar."
          error={telZap && !telOk ? 'Informe o número com DDD.' : undefined}
        >
          <Input id="onb-zap" inputMode="tel" placeholder="41 99999-9999" {...register('tel_zap')} />
        </Field>

        <Field label="Congregação" htmlFor="onb-cong">
          <Combobox
            id="onb-cong"
            value={congregacao}
            onChange={(v) => setValue('congregacao', v)}
            options={congregacoes}
            placeholder="Comece a digitar…"
          />
        </Field>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Disponibilidade para plantão</p>
            <p className="mt-1 text-xs text-gray-500">
              Em quais dias você pode ser designado como responsável ou ajudante. Deixe como está
              se puder em qualquer dia.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Qualquer dia', dias: TODOS_OS_DIAS },
              { label: 'Só dias úteis (seg–sex)', dias: DIAS_UTEIS },
              { label: 'Só fim de semana', dias: FIM_DE_SEMANA },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => preset(p.dias)}
              >
                {p.label}
              </button>
            ))}
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
            htmlFor="onb-fim-mes"
            hint="Deixe em branco se não tem essa restrição."
          >
            <Input
              id="onb-fim-mes"
              type="number"
              min={0}
              max={15}
              {...register('disp_evita_ultimos_dias_mes')}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-sm text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
          >
            Sair da conta
          </button>
          <Button type="submit" loading={isSubmitting} disabled={!telOk || !congregacaoOk}>
            Salvar e continuar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
