-- Teste das funções do agente de WhatsApp (n8n): identificação por telefone, criar/buscar/listar/atualizar/encerrar,
-- acesso restrito e lembrete. Roda numa transação e desfaz tudo no final (rollback), com 2 membros fictícios.
-- Efeito que o rollback NÃO desfaz: o contador casos_numero_seq avança 1 (fica um número de caso pulado).
-- Rodar com um cliente que aceite vários comandos (ex.: psql ou psycopg); `supabase db query --db-url` recusa.
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);

do $$
declare
  _a uuid := gen_random_uuid();
  _b uuid := gen_random_uuid();
  _j jsonb; _cod text; _c casos;
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (_a, 'teste-agente-a@exemplo.invalid', 'authenticated', 'authenticated', '{"nome":"Ana Teste"}'),
    (_b, 'teste-agente-b@exemplo.invalid', 'authenticated', 'authenticated', '{"nome":"Beto Teste"}');
  insert into membros (id, nome, email, status, tel_zap) values
    (_a, 'Ana Teste', 'teste-agente-a@exemplo.invalid', 'ativo', '(41) 9000-0001'),
    (_b, 'Beto Teste', 'teste-agente-b@exemplo.invalid', 'ativo', '41900000002')
  on conflict (id) do update set status = 'ativo', nome = excluded.nome, tel_zap = excluded.tel_zap;

  _j := agente_membro_por_telefone('5541990000001');
  insert into r values (1, 'telefone 8 dígitos acha membro', (_j->>'id')::uuid = _a, _j::text);
  _j := agente_membro_por_telefone('5541999999999');
  insert into r values (2, 'telefone desconhecido', (_j->>'encontrado')::boolean = false, _j::text);

  _j := agente_criar_caso(_a, '{"nome_telefonou":"Joana"}');
  insert into r values (3, 'criar sem obrigatórios lista faltando', _j ? 'campos_faltando', _j->>'campos_faltando');
  _j := agente_criar_caso(_a, '{"nome_telefonou":"Joana","whatsapp_telefonou":"55 41 98888-7777","nome_paciente":"Zé Pacientéteste Silva","sexo":"M","idade":"70","congregacao":"Central","cidade_congregacao":"Curitiba","uf_congregacao":"pr","info_medica":"Cirurgia cardíaca","morbidade":"Alta","especialidade":"cardio-torax"}');
  _cod := _j->>'id_caso';
  insert into r values (4, 'criar válido', (_j->>'sucesso')::boolean, _j::text);
  select * into _c from casos where id_caso = _cod;
  insert into r values (5, 'gravou campos', _c.responsavel_id = _a and _c.area_especialidade = 'cardio_torax' and _c.contato_telefonou = '41988887777' and _c.uf = 'PR',
    _c.numero || ' ' || _c.area_especialidade || ' ' || _c.contato_telefonou);
  _j := agente_criar_caso(_a, '{"nome_telefonou":"Joana","whatsapp_telefonou":"41988887777","nome_paciente":"ze pacienteteste silva","sexo":"M","idade":"70","congregacao":"C","cidade_congregacao":"C","uf_congregacao":"PR","info_medica":"x","morbidade":"x","especialidade":"TMO"}');
  insert into r values (6, 'duplicado recusado', _j->>'erro' = 'paciente_ja_tem_caso_aberto', _j->>'erro');

  _j := agente_buscar_caso(_a, 'pacienteteste');
  insert into r values (7, 'dono busca e vê completo', jsonb_array_length(_j) = 1 and _j->0 ? 'info_medica', left(_j::text, 120));
  _j := agente_buscar_caso(_b, 'PACIENTÉTESTE');
  insert into r values (8, 'outro vê restrito', (_j->0->>'acesso_restrito')::boolean and not (_j->0 ? 'info_medica'), _j::text);
  _j := agente_buscar_caso_por_codigo(_b, lower(_cod));
  insert into r values (9, 'por código, outro restrito', (_j->0->>'acesso_restrito')::boolean, _j->0->>'id_caso');
  _j := agente_listar_casos(_a, false);
  insert into r values (10, 'listar meus casos', jsonb_array_length(_j) = 1 and _j->0->>'papel' = 'responsável', _j::text);

  _j := agente_atualizar_caso(_b, _cod, '{"info_medica":"intruso"}');
  insert into r values (11, 'outro não atualiza', (_j->>'autorizado')::boolean = false, _j->>'mensagem');
  _j := agente_atualizar_caso(_a, _cod, '{"info_medica":"Paciente estável","especialidade":"orto neuro","batizado":true}');
  select * into _c from casos where id_caso = _cod;
  insert into r values (12, 'atualiza e acumula', (_j->>'sucesso')::boolean and _c.info_medica like 'Cirurgia cardíaca' || E'\n' || 'Ana Teste - %: Paciente estável' and _c.area_especialidade = 'orto_neuro' and _c.batizado,
    replace(_c.info_medica, E'\n', ' | '));
  _j := agente_atualizar_caso(_a, _cod, '{"especialidade":"Pediatria"}');
  insert into r values (13, 'especialidade inválida', _j->>'erro' = 'especialidade_invalida', _j->>'erro');

  update casos set ajudante_id = _b, ajudante_nome = 'Beto Teste' where id_caso = _cod;
  _j := agente_atualizar_caso(_b, _cod, '{"encerrar_caso":true,"gvp_acionado":false}');
  insert into r values (14, 'ajudante não encerra', (_j->>'autorizado')::boolean = false, _j->>'mensagem');
  _j := agente_atualizar_caso(_b, _cod, '{"outras_infos":"visitei hoje"}');
  insert into r values (15, 'ajudante atualiza', (_j->>'sucesso')::boolean, _j::text);
  _j := agente_atualizar_caso(_a, _cod, '{"encerrar_caso":true}');
  insert into r values (16, 'encerrar sem gvp pede gvp', _j->>'erro' = 'gvp_nao_informado', _j->>'erro');

  _j := agente_caso_hlc7(_a, _cod);
  insert into r values (17, 'hlc7 traz telefone do responsável', _j->>'responsavel_tel' = '(41) 9000-0001' and not (_j ? 'bubble_raw'), _j->>'responsavel_tel');

  insert into r select 18, 'lembrete lista o caso', count(*) = 1, max(responsavel_tel) from agente_casos_para_lembrete() where id_caso = _cod;

  _j := agente_atualizar_caso(_a, _cod, '{"encerrar_caso":true,"gvp_acionado":"sim"}');
  select * into _c from casos where id_caso = _cod;
  insert into r values (19, 'encerra e anonimiza', (_j->>'encerrado')::boolean and _c.status = 'encerrado' and _c.paciente_nome = 'Z P S'
    and _c.nome_telefonou = 'x' and _c.contato_telefonou = 'x' and _c.gvp and _c.outras_infos like '%Caso encerrado. GVP acionado.%',
    _c.paciente_nome || ' / ' || _c.nome_telefonou || ' / ' || _c.contato_telefonou);
  _j := agente_atualizar_caso(_a, _cod, '{"info_medica":"depois"}');
  insert into r values (20, 'encerrado não atualiza', _j->>'erro' = 'caso_ja_encerrado', _j->>'erro');

  begin
    perform agente_buscar_caso(gen_random_uuid(), 'teste');
    insert into r values (21, 'membro inexistente recusado', false, 'aceitou');
  exception when others then insert into r values (21, 'membro inexistente recusado', true, sqlerrm); end;
end $$;

select passo, caso, ok, detalhe from r order by passo;
rollback;
