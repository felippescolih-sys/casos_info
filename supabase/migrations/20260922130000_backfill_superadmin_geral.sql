-- Corrige a migration anterior (20260922120001): quem já tinha função na área
-- 'geral' (nível 'admin' ou 'ajudante', do modelo antigo) perdeu o SuperAdmin
-- quando is_admin_geral() passou a exigir nível 'superadmin'. Reclassifica pra
-- não revogar acesso de ninguém — na área 'geral' só existe o nível SuperAdmin.
update public.membro_funcoes
set nivel = 'superadmin'
where area = 'geral' and nivel <> 'superadmin';
