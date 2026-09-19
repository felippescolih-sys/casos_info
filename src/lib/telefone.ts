// Mesmo critério usado pela Edge Function enviar-wapi (supabase/functions/enviar-wapi/index.ts)
// pra normalizar telefone: só dígitos, com DDI 55 prefixado quando faltar. Um número com menos de
// 10 dígitos não tem como ter DDD + número, então a função de envio não consegue mandar mensagem.
export function avisoWhatsapp(raw: string | null | undefined): string | undefined {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.length < 10) {
    return 'Parece faltar o DDD — sem ele, os avisos automáticos por WhatsApp (plantão, transferência de caso) não conseguem ser enviados.';
  }
  return undefined;
}
