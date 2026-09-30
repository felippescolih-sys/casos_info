-- Campanha: marcar quais médicos colaboradores já foram contatados sobre a nova
-- atualização a respeito do uso do sangue.
--
-- Tabela própria em vez de coluna em `medicos`: a escrita em `medicos` é só do
-- admin geral, e aqui qualquer membro COLIH marca/desmarca. Linha existe = marcado;
-- desmarcar = apagar a linha.
--
-- Quem marcou e quando são preenchidos pelo trigger (não pelo cliente). O nome fica
-- gravado em texto porque a policy de diretório de `membros` só expõe ativos — se
-- quem marcou for desativado, o nome continuaria aparecendo.

create table if not exists public.medicos_contato_sangue (
  medico_id uuid primary key references public.medicos(id) on delete cascade,
  marcado_por uuid references public.membros(id) on delete set null default auth.uid(),
  marcado_por_nome text,
  marcado_em timestamptz not null default now()
);

create or replace function public.eh_membro_colih()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_ativo() and (public.is_admin_geral() or public.tem_funcao('colih'));
$$;

revoke execute on function public.eh_membro_colih() from anon, public;
grant execute on function public.eh_membro_colih() to authenticated;

create or replace function public.medicos_contato_sangue_autor()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if; -- server-side (import/SQL editor)
  new.marcado_por := auth.uid();
  new.marcado_em := now();
  select m.nome into new.marcado_por_nome from public.membros m where m.id = auth.uid();
  return new;
end;
$$;

drop trigger if exists medicos_contato_sangue_autor on public.medicos_contato_sangue;
create trigger medicos_contato_sangue_autor
  before insert or update on public.medicos_contato_sangue
  for each row execute function public.medicos_contato_sangue_autor();

alter table public.medicos_contato_sangue enable row level security;

drop policy if exists "medicos_contato_sangue_select" on public.medicos_contato_sangue;
create policy "medicos_contato_sangue_select"
  on public.medicos_contato_sangue for select to authenticated
  using (public.is_ativo());

drop policy if exists "medicos_contato_sangue_insert_colih" on public.medicos_contato_sangue;
create policy "medicos_contato_sangue_insert_colih"
  on public.medicos_contato_sangue for insert to authenticated
  with check (public.eh_membro_colih());

drop policy if exists "medicos_contato_sangue_delete_colih" on public.medicos_contato_sangue;
create policy "medicos_contato_sangue_delete_colih"
  on public.medicos_contato_sangue for delete to authenticated
  using (public.eh_membro_colih());
