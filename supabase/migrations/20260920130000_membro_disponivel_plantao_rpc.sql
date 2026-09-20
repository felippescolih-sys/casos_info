-- Expõe membro_disponivel_plantao como RPC pro frontend usar num aviso proativo
-- no formulário de escala (a checagem que já bloqueia no save, mas agora exibida antes).

revoke execute on function public.membro_disponivel_plantao(uuid, timestamptz, timestamptz)
  from anon, public;
grant execute on function public.membro_disponivel_plantao(uuid, timestamptz, timestamptz)
  to authenticated;
