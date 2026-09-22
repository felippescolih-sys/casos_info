-- SuperAdmin passa a ser função na área 'geral' com nível 'superadmin' (não mais
-- 'admin' — a tabela membro_funcoes ainda está vazia em produção, sem dados a migrar).
create or replace function public.is_admin_geral()
returns boolean language sql stable security definer set search_path = public as $$
  select public.tem_funcao('geral', 'superadmin');
$$;

-- Admin ou ajudante de uma área específica (ex.: coordenador da lista de médicos),
-- ou superadmin (que tem acesso a tudo, independente de área).
create or replace function public.admin_de_area(_area public.area)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin_geral()
    or public.tem_funcao(_area, 'admin')
    or public.tem_funcao(_area, 'ajudante');
$$;

-- Médicos: o coordenador da lista de médicos (área 'medicos') passa a poder
-- cadastrar/editar/excluir, não só o superadmin.
drop policy "medicos_write_admin_geral" on public.medicos;
create policy "medicos_write_admin_medicos"
  on public.medicos for all to authenticated
  using (public.admin_de_area('medicos'))
  with check (public.admin_de_area('medicos'));

drop policy "medicos_geral_update_admin_geral" on public.medicos_geral;
create policy "medicos_geral_update_admin_medicos"
  on public.medicos_geral for update to authenticated
  using (public.admin_de_area('medicos'))
  with check (public.admin_de_area('medicos'));

drop policy "medicos_geral_delete_admin_geral" on public.medicos_geral;
create policy "medicos_geral_delete_admin_medicos"
  on public.medicos_geral for delete to authenticated
  using (public.admin_de_area('medicos'));
