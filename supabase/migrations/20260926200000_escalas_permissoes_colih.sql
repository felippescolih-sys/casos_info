-- Escala de plantão: quem vê e quem mexe.
--
-- Antes, escrever exigia `gerencia_membros()` — qualquer função na área 'geral',
-- inclusive ajudante. A regra agora é mais estrita e mais específica: só SuperAdmin
-- ou admin da área COLIH cria, edita e exclui plantão.
--
-- Repare que NÃO dá pra usar `admin_de_area('colih')` aqui: aquele helper inclui o
-- nível 'ajudante', e a regra pedida é só 'admin'.
--
-- A leitura continua aberta a todo membro ativo (policy `escalas_select_ativo`,
-- intocada): o banner "plantonista de hoje" do painel aparece para todo mundo, e
-- restringir a leitura à área COLIH apagaria esse banner para os demais. Quem
-- controla o acesso à *página* de escalas é a UI.

create or replace function public.gerencia_escalas()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin_geral() or public.tem_funcao('colih', 'admin');
$$;

revoke execute on function public.gerencia_escalas() from anon, public;
grant execute on function public.gerencia_escalas() to authenticated;

drop policy "escalas_write_gestor" on public.escalas;

create policy "escalas_write_admin_colih"
  on public.escalas for all to authenticated
  using (public.gerencia_escalas())
  with check (public.gerencia_escalas());
