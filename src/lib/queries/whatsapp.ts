import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { WhatsappSessaoRow } from '@/types/database';

/** Estado gravado pela verificação periódica (a cada 2 min). Só superadmin lê (RLS). */
export async function getWhatsappSessao(): Promise<WhatsappSessaoRow | null> {
  const { data, error } = await supabase.from('whatsapp_sessao').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data;
}

export type SessaoAoVivo = Pick<
  WhatsappSessaoRow,
  'status' | 'numero' | 'verificado_em' | 'conectado_em' | 'caiu_em' | 'desconectado_em' | 'ultimo_erro'
>;

// A Edge Function devolve { erro } com status 4xx/5xx; o invoke esconde isso num FunctionsHttpError.
async function chamar<T>(acao: string, extra: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('whatsapp-sessao', {
    body: { acao, ...extra },
  });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const corpo = await error.context.json().catch(() => null);
      throw new Error(corpo?.erro ?? 'Falha ao falar com o WhatsApp.');
    }
    throw error;
  }
  return data as T;
}

/** Consulta o WAHA agora (e atualiza a tabela). */
export const statusWhatsapp = () => chamar<SessaoAoVivo>('status');
export const iniciarWhatsapp = () => chamar<SessaoAoVivo>('iniciar');
export const qrWhatsapp = () => chamar<{ imagem: string | null }>('qr');
export const codigoWhatsapp = (telefone: string) =>
  chamar<{ codigo: string }>('codigo', { telefone });
export const desconectarWhatsapp = () => chamar<SessaoAoVivo>('desconectar');
