-- Leitura das chamadas recebidas no telefone de plantão.
--
-- A tabela `chamadas_plantao` foi criada fora das migrations e é alimentada pela
-- central Asterisk (registro de chamada, CDR) com a chave anon — a policy
-- "permite insercao via anon" continua como está.
--
-- Até aqui ninguém do app lia a tabela. A leitura fica restrita à COLIH (mesmo
-- grupo que vê a escala): o número de quem liga é dado pessoal.

drop policy if exists "chamadas_plantao_select_colih" on public.chamadas_plantao;
create policy "chamadas_plantao_select_colih"
  on public.chamadas_plantao for select to authenticated
  using (public.eh_membro_colih());

grant select on public.chamadas_plantao to authenticated;

create index if not exists chamadas_plantao_inicio_idx
  on public.chamadas_plantao (data_hora_inicio desc);
