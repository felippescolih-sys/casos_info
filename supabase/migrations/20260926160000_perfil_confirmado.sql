-- Onboarding de primeiro acesso: marca quando o membro conferiu o próprio cadastro.
--
-- Os 108 membros vieram importados do Bubble com dados parciais, e o mais crítico
-- é o `tel_zap`: sem ele a Edge Function `enviar-wapi` não consegue montar o número
-- e o membro simplesmente não recebe nenhum aviso — falha silenciosa, ninguém nota.
--
-- Telefone e congregação dá pra checar olhando a coluna (vazia = falta preencher),
-- mas disponibilidade não: `disp_seg..disp_dom` têm default `true`, então "nunca
-- mexi nisso" e "posso qualquer dia" são indistinguíveis no banco. Daí esta coluna,
-- que registra a confirmação explícita em vez de tentar adivinhar pelo conteúdo.

-- `if not exists` porque esta migration foi aplicada à mão pelo SQL Editor antes
-- de entrar no histórico do CLI: o próximo `db push` vai reexecutá-la, e sem a
-- guarda o alter falharia e travaria as migrations seguintes.
alter table public.membros
  add column if not exists perfil_confirmado_em timestamptz;

comment on column public.membros.perfil_confirmado_em is
  'Quando o membro confirmou o próprio cadastro no primeiro acesso. Null = ainda não passou pelo onboarding.';
