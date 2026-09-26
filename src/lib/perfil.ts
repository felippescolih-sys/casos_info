import type { MembroRow } from '@/types/database';

// O que o membro precisa ter preenchido para o sistema funcionar para ele.
//
// Telefone e congregação são verificáveis pelo conteúdo da coluna. Disponibilidade
// não é: `disp_seg..disp_dom` nascem `true`, então só a confirmação explícita
// (`perfil_confirmado_em`) distingue quem escolheu ficar disponível todo dia de
// quem nunca abriu a tela. Por isso a confirmação entra como item próprio.

/** Telefone que a Edge Function consegue normalizar (DDD + número). Mesmo critério de `avisoWhatsapp`. */
export function whatsappUtilizavel(raw: string | null | undefined): boolean {
  return (raw ?? '').replace(/\D/g, '').length >= 10;
}

/** Lista legível do que falta. Vazia = cadastro completo. */
export function pendenciasDoPerfil(membro: MembroRow): string[] {
  const faltando: string[] = [];
  if (!whatsappUtilizavel(membro.tel_zap)) faltando.push('WhatsApp com DDD');
  if (!membro.congregacao?.trim()) faltando.push('Congregação');
  if (!membro.perfil_confirmado_em) faltando.push('Disponibilidade para plantão');
  return faltando;
}

/**
 * Se o onboarding deve aparecer. Repare que não basta `perfil_confirmado_em`
 * estar preenchido: se o telefone for apagado depois (por um gestor, por exemplo),
 * o membro volta a ser cobrado — senão ficaria sem receber aviso em silêncio.
 */
export function perfilPendente(membro: MembroRow | null): boolean {
  return membro != null && pendenciasDoPerfil(membro).length > 0;
}
