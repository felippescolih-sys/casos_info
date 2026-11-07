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

// Link do WhatsApp (wa.me) para o telefone, com o 55 na frente quando faltar. Sem DDD não há
// número completo, então não há link.
export function linkWhatsapp(raw: string | null | undefined): string | undefined {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `https://wa.me/55${digits}`;
  if (digits.length >= 12) return `https://wa.me/${digits}`;
  return undefined;
}

// (41) 99999-9999 para exibir; o que não for número brasileiro com DDD sai como foi digitado.
export function formatarTelefone(raw: string | null | undefined): string {
  const d = (raw ?? '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return (raw ?? '').trim();
}
