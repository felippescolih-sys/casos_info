-- Corrige membros_guard: quando não há usuário autenticado (auth.uid() é NULL),
-- o contexto é confiável (service_role, SQL editor, jobs de servidor) e não deve
-- ser tratado como "não-gestor" — senão qualquer UPDATE de status é revertido.
-- RLS já barra o anon (as policies de UPDATE são `to authenticated`), então
-- auth.uid() NULL aqui só acontece em contexto server-side.

create or replace function public.membros_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.gerencia_membros() then
    return new;
  end if;
  new.status           := old.status;
  new.legacy_bubble_id := old.legacy_bubble_id;
  new.aprovado_por     := old.aprovado_por;
  new.aprovado_em      := old.aprovado_em;
  new.email            := old.email;
  return new;
end;
$$;
