-- Teste de agente_validar_anexo (arquivos recebidos pelo agente de WhatsApp): dono, outro membro, caso inexistente,
-- pendente vencido e message_id repetido. Transação desfeita no final (rollback); não toca no storage.
-- Rodar com psql ou psycopg (vários comandos); `supabase db query --db-url` recusa.
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
do $$
declare _a uuid := gen_random_uuid(); _b uuid := gen_random_uuid(); _caso uuid; _cod text; _arq uuid; _j jsonb;
begin
  insert into auth.users (id, email, aud, role) values (_a, 'teste-midia-a@exemplo.invalid', 'authenticated', 'authenticated'),
                                                        (_b, 'teste-midia-b@exemplo.invalid', 'authenticated', 'authenticated');
  insert into membros (id, nome, email, status) values (_a, 'Ana Midia', 'teste-midia-a@exemplo.invalid', 'ativo'),
                                                      (_b, 'Beto Midia', 'teste-midia-b@exemplo.invalid', 'ativo')
  on conflict (id) do update set status = 'ativo';
  insert into casos (status, responsavel_id, responsavel_nome, paciente_nome, id_caso, numero) values ('aberto', _a, 'Ana Midia', 'Paciente Teste', 'TSTMID', -1)
  returning id into _caso;
  insert into agente_arquivos_pendentes (membro_id, message_id, storage_path, nome, mime, tamanho)
  values (_a, 'msg-1', 'pendentes/x/1-exame.pdf', 'exame.pdf', 'application/pdf', 100) returning id into _arq;

  _j := agente_validar_anexo(_a, 'tstmid', null);
  insert into r values (1, 'dono, último pendente', (_j->>'ok')::boolean and (_j->>'arquivo_id')::uuid = _arq and (_j->>'caso_id')::uuid = _caso, _j::text);
  _j := agente_validar_anexo(_b, 'TSTMID', _arq);
  insert into r values (2, 'outro membro: arquivo não é dele', _j->>'erro' = 'arquivo_nao_encontrado', _j->>'erro');
  insert into agente_arquivos_pendentes (membro_id, message_id, storage_path, nome) values (_b, 'msg-2', 'pendentes/y/2.pdf', '2.pdf');
  _j := agente_validar_anexo(_b, 'TSTMID', null);
  insert into r values (3, 'outro membro: caso não é dele', (_j->>'autorizado')::boolean = false, _j->>'mensagem');
  _j := agente_validar_anexo(_a, 'XXXXXX', null);
  insert into r values (4, 'caso inexistente', _j->>'erro' = 'caso_nao_encontrado', _j->>'erro');
  update agente_arquivos_pendentes set criado_em = now() - interval '25 hours' where id = _arq;
  _j := agente_validar_anexo(_a, 'TSTMID', null);
  insert into r values (5, 'pendente vencido (25 h)', _j->>'erro' = 'arquivo_nao_encontrado', _j->>'erro');
  begin
    insert into agente_arquivos_pendentes (membro_id, message_id, storage_path, nome) values (_a, 'msg-2', 'p', 'n');
    insert into r values (6, 'message_id repetido recusado', false, 'aceitou');
  exception when unique_violation then insert into r values (6, 'message_id repetido recusado', true, 'unique'); end;
end $$;
select passo, caso, ok, detalhe from r order by passo;
rollback;
