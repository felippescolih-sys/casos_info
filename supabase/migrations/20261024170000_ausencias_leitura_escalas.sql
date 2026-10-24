-- Página "Ausências": quem monta a escala (SuperAdmin ou admin da COLIH) precisa ver
-- as ausências de todos. Até aqui só `gerencia_membros()` (qualquer função na área
-- geral) lia as ausências de terceiros, e o admin da COLIH sem função na área geral
-- ficava de fora. Só leitura: cadastrar ausência continua sendo do próprio membro
-- (ou de quem gerencia membros).

create policy "ausencias_select_gerencia_escalas"
  on public.membro_ausencias for select to authenticated
  using (public.gerencia_escalas());
