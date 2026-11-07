-- Teste de definir_ajudante_caso e da trava do ajudante no casos_guard: responsável escolhe, ajudante não troca,
-- responsável como ajudante, membro inativo, membro em ausência, aviso enfileirado no pg_net, UPDATE direto
-- revertido e remoção. Transação desfeita no final (rollback): o pedido ao pg_net some junto e nada é enviado.
-- Rodar com psql ou psycopg (vários comandos); `supabase db query --db-url` recusa.
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
do $$
declare
  _a uuid := gen_random_uuid(); _b uuid := gen_random_uuid(); _c uuid := gen_random_uuid();
  _d uuid := gen_random_uuid(); _e uuid := gen_random_uuid();
  _caso uuid; _fila_antes bigint; _fila_depois bigint; _aj uuid; _ajn text;
  _hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  insert into auth.users (id, email, aud, role) values
    (_a, 'teste-ajud-a@exemplo.invalid', 'authenticated', 'authenticated'),
    (_b, 'teste-ajud-b@exemplo.invalid', 'authenticated', 'authenticated'),
    (_c, 'teste-ajud-c@exemplo.invalid', 'authenticated', 'authenticated'),
    (_d, 'teste-ajud-d@exemplo.invalid', 'authenticated', 'authenticated'),
    (_e, 'teste-ajud-e@exemplo.invalid', 'authenticated', 'authenticated');
  insert into public.membros (id, nome, email, status) values
    (_a, 'Ana Resp', 'teste-ajud-a@exemplo.invalid', 'ativo'),
    (_b, 'Beto Ajud', 'teste-ajud-b@exemplo.invalid', 'ativo'),
    (_c, 'Caio Outro', 'teste-ajud-c@exemplo.invalid', 'ativo'),
    (_d, 'Duda Inativa', 'teste-ajud-d@exemplo.invalid', 'inativo'),
    (_e, 'Eva Ausente', 'teste-ajud-e@exemplo.invalid', 'ativo')
  -- O gatilho de auth.users já cria o membro (nome = início do e-mail): sobrescreve nome e status.
  on conflict (id) do update set status = excluded.status, nome = excluded.nome;
  insert into public.membro_ausencias (membro_id, inicio, fim) values (_e, _hoje, _hoje);
  insert into public.casos (status, responsavel_id, responsavel_nome, paciente_nome, id_caso, numero)
  values ('aberto', _a, 'Ana Resp', 'Paciente Teste', 'TSTAJD', -1) returning id into _caso;

  -- 1. responsável escolhe o Beto: grava e enfileira o aviso
  perform set_config('request.jwt.claims', json_build_object('sub', _a, 'role', 'authenticated')::text, true);
  select count(*) into _fila_antes from net.http_request_queue;
  perform public.definir_ajudante_caso(_caso, _b);
  select count(*) into _fila_depois from net.http_request_queue;
  select ajudante_id, ajudante_nome into _aj, _ajn from public.casos where id = _caso;
  insert into r values (1, 'responsável define ajudante', _aj = _b and _ajn = 'Beto Ajud', _ajn);
  insert into r values (2, 'aviso enfileirado no pg_net', _fila_depois = _fila_antes + 1,
    (_fila_depois - _fila_antes)::text || ' pedido(s)');

  -- 3. repetir o mesmo ajudante não manda outro aviso
  perform public.definir_ajudante_caso(_caso, _b);
  select count(*) into _fila_antes from net.http_request_queue;
  insert into r values (3, 'mesmo ajudante: sem aviso repetido', _fila_antes = _fila_depois, null);

  -- 4. o ajudante não troca o ajudante
  perform set_config('request.jwt.claims', json_build_object('sub', _b, 'role', 'authenticated')::text, true);
  begin
    perform public.definir_ajudante_caso(_caso, _c);
    insert into r values (4, 'ajudante não troca ajudante', false, 'aceitou');
  exception when others then insert into r values (4, 'ajudante não troca ajudante', true, sqlerrm); end;

  -- 5. UPDATE direto do ajudante é revertido pelo guard
  update public.casos set ajudante_id = _c, ajudante_nome = 'Caio Outro' where id = _caso;
  select ajudante_id into _aj from public.casos where id = _caso;
  insert into r values (5, 'UPDATE direto revertido', _aj = _b, _aj::text);

  perform set_config('request.jwt.claims', json_build_object('sub', _a, 'role', 'authenticated')::text, true);
  -- 6. responsável não pode ser ajudante
  begin
    perform public.definir_ajudante_caso(_caso, _a);
    insert into r values (6, 'responsável como ajudante recusado', false, 'aceitou');
  exception when others then insert into r values (6, 'responsável como ajudante recusado', true, sqlerrm); end;
  -- 7. membro inativo
  begin
    perform public.definir_ajudante_caso(_caso, _d);
    insert into r values (7, 'membro inativo recusado', false, 'aceitou');
  exception when others then insert into r values (7, 'membro inativo recusado', true, sqlerrm); end;
  -- 8. membro em ausência hoje
  begin
    perform public.definir_ajudante_caso(_caso, _e);
    insert into r values (8, 'membro em ausência recusado', false, 'aceitou');
  exception when others then insert into r values (8, 'membro em ausência recusado', true, sqlerrm); end;

  -- 9. remover o ajudante: limpa e não avisa
  select count(*) into _fila_antes from net.http_request_queue;
  perform public.definir_ajudante_caso(_caso, null);
  select count(*) into _fila_depois from net.http_request_queue;
  select ajudante_id, ajudante_nome into _aj, _ajn from public.casos where id = _caso;
  insert into r values (9, 'remover ajudante sem aviso', _aj is null and _ajn is null and _fila_depois = _fila_antes, null);

  -- 10. quem não é do caso não escolhe
  perform set_config('request.jwt.claims', json_build_object('sub', _c, 'role', 'authenticated')::text, true);
  begin
    perform public.definir_ajudante_caso(_caso, _b);
    insert into r values (10, 'membro de fora recusado', false, 'aceitou');
  exception when others then insert into r values (10, 'membro de fora recusado', true, sqlerrm); end;
end $$;
select passo, caso, ok, detalhe from r order by passo;
rollback;
