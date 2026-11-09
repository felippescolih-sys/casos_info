-- Teste da busca aproximada de paciente e da busca de hospital do agente de WhatsApp (20261109120000).
-- Roda numa transação e desfaz tudo no final (rollback), com 1 membro e 1 caso fictícios.
-- Efeito que o rollback NÃO desfaz: o contador casos_numero_seq avança 1 (fica um número de caso pulado).
-- Rodar com um cliente que aceite vários comandos (ex.: psql ou psycopg); `supabase db query --db-url` recusa.
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);

do $$
declare
  _a uuid := gen_random_uuid();
  _j jsonb; _cod text;
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (_a, 'teste-busca-a@exemplo.invalid', 'authenticated', 'authenticated', '{"nome":"Ana Teste"}');
  insert into membros (id, nome, email, status, tel_zap) values
    (_a, 'Ana Teste', 'teste-busca-a@exemplo.invalid', 'ativo', '41900000091')
  on conflict (id) do update set status = 'ativo';

  _j := agente_criar_caso(_a, '{"nome_telefonou":"Joana","whatsapp_telefonou":"41988887777","nome_paciente":"Zebedeu Quintanilha Pacienteteste","sexo":"M","idade":"70","congregacao":"Central","cidade_congregacao":"Curitiba","uf_congregacao":"PR","info_medica":"Cirurgia","morbidade":"Hérnia","especialidade":"AD-Hepato-Uro"}');
  _cod := _j->>'id_caso';
  insert into r values (1, 'caso criado', (_j->>'sucesso')::boolean, _j::text);

  _j := agente_buscar_caso(_a, 'quintanilha');
  insert into r values (2, 'trecho exato acha sem "semelhante"',
    _j @> jsonb_build_array(jsonb_build_object('id_caso', _cod)) and not (_j->0 ? 'semelhante'), _j::text);

  _j := agente_buscar_caso(_a, 'Zebedeu Quintanila Pacientetest');
  insert into r values (3, 'grafia diferente acha como semelhante',
    _j @> jsonb_build_array(jsonb_build_object('id_caso', _cod, 'semelhante', true)), _j::text);

  _j := agente_buscar_caso(_a, 'Xyzwv Kkkqqq');
  insert into r values (4, 'nome sem parecido volta vazio', _j = '[]'::jsonb, _j::text);

  _j := agente_buscar_caso(_a, ' ');
  insert into r values (5, 'nome vazio pede nome', _j->>'erro' = 'nome_invalido', _j::text);

  _j := agente_buscar_hospital(_a, 'Hosptial Rocio de campo largo');
  insert into r values (6, 'hospital com erro de digitação', _j->0->>'nome' = 'Hospital do Rocio (Campo Largo)', _j->0->>'nome');

  _j := agente_buscar_hospital(_a, 'erasto');
  insert into r values (7, 'hospital por parte do nome', _j->0->>'nome' = 'Hospital Erasto Gaertner', _j->0->>'nome');

  _j := agente_buscar_hospital(_a, 'Xyzwv Kkkqqq');
  insert into r values (8, 'hospital inexistente volta vazio', _j = '[]'::jsonb, _j::text);

  _j := agente_buscar_hospital(_a, 'hospital');
  insert into r values (9, 'só "hospital" pede nome', _j->>'erro' = 'nome_invalido', _j::text);

  begin
    perform agente_buscar_hospital(gen_random_uuid(), 'erasto');
    insert into r values (10, 'membro inexistente recusado', false, 'aceitou');
  exception when others then insert into r values (10, 'membro inexistente recusado', true, sqlerrm); end;

  insert into r select 11, 'anon e authenticated não executam',
    not has_function_privilege('anon', 'public.agente_buscar_hospital(uuid, text)', 'execute')
    and not has_function_privilege('authenticated', 'public.agente_buscar_hospital(uuid, text)', 'execute')
    and not has_function_privilege('authenticated', 'public.agente_buscar_caso(uuid, text)', 'execute'), null;
end $$;

select passo, caso, ok, detalhe from r order by passo;
rollback;
