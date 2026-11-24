-- Teste de "só membros da COLIH abrem caso" (migration 20261124120000): app (RLS de inserção) e agente do
-- WhatsApp (identificação e criar caso). Roda numa transação e desfaz tudo no final (rollback), com 4 membros
-- fictícios: COLIH, superadmin de geral, só GVP e sem função.
-- Efeito que o rollback NÃO desfaz: o contador casos_numero_seq avança (ficam números de caso pulados).
-- Rodar com um cliente que aceite vários comandos (ex.: psql ou psycopg); `supabase db query --db-url` recusa.
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
grant all on r to authenticated;

do $$
declare
  _col uuid := gen_random_uuid();
  _sup uuid := gen_random_uuid();
  _gvp uuid := gen_random_uuid();
  _sem uuid := gen_random_uuid();
  _j jsonb;
  _dados jsonb := '{"nome_telefonou":"Joana","whatsapp_telefonou":"41988887777","sexo":"M","idade":"70",
    "congregacao":"Central","cidade_congregacao":"Curitiba","uf_congregacao":"PR","info_medica":"Cirurgia",
    "morbidade":"Alta","especialidade":"TMO"}';
begin
  insert into auth.users (id, email, aud, role) values
    (_col, 'teste-colih-col@exemplo.invalid', 'authenticated', 'authenticated'),
    (_sup, 'teste-colih-sup@exemplo.invalid', 'authenticated', 'authenticated'),
    (_gvp, 'teste-colih-gvp@exemplo.invalid', 'authenticated', 'authenticated'),
    (_sem, 'teste-colih-sem@exemplo.invalid', 'authenticated', 'authenticated');
  insert into public.membros (id, nome, email, status, tel_zap) values
    (_col, 'Col Teste', 'teste-colih-col@exemplo.invalid', 'ativo', '41900000011'),
    (_sup, 'Sup Teste', 'teste-colih-sup@exemplo.invalid', 'ativo', '41900000012'),
    (_gvp, 'Gvp Teste', 'teste-colih-gvp@exemplo.invalid', 'ativo', '41900000013'),
    (_sem, 'Sem Teste', 'teste-colih-sem@exemplo.invalid', 'ativo', '41900000014')
  on conflict (id) do update set status = 'ativo', nome = excluded.nome, tel_zap = excluded.tel_zap;
  delete from public.membro_funcoes where membro_id in (_col, _sup, _gvp, _sem);
  insert into public.membro_funcoes (membro_id, area, nivel) values
    (_col, 'colih', 'usuario'), (_col, 'gvps', 'usuario'),
    (_sup, 'geral', 'superadmin'),
    (_gvp, 'gvps', 'usuario');

  -- Identificação pelo telefone traz se pode abrir caso.
  _j := public.agente_membro_por_telefone('5541900000011');
  insert into r values (1, 'telefone COLIH: pode abrir', (_j->>'pode_abrir_caso')::boolean, _j::text);
  _j := public.agente_membro_por_telefone('5541900000013');
  insert into r values (2, 'telefone GVP: acha, mas não pode abrir', (_j->>'encontrado')::boolean and not (_j->>'pode_abrir_caso')::boolean, _j::text);
  _j := public.agente_membro_por_telefone('5541900000014');
  insert into r values (3, 'telefone sem função: não pode abrir', not (_j->>'pode_abrir_caso')::boolean, _j::text);

  -- Agente: criar caso.
  _j := public.agente_criar_caso(_col, _dados || '{"nome_paciente":"Paciente Colihteste Um"}');
  insert into r values (4, 'agente: COLIH cria', (_j->>'sucesso')::boolean, _j::text);
  _j := public.agente_criar_caso(_sup, _dados || '{"nome_paciente":"Paciente Colihteste Dois"}');
  insert into r values (5, 'agente: superadmin cria', (_j->>'sucesso')::boolean, _j::text);
  _j := public.agente_criar_caso(_gvp, _dados || '{"nome_paciente":"Paciente Colihteste Tres"}');
  insert into r values (6, 'agente: GVP recusado', _j->>'erro' = 'nao_e_membro_colih' and _j ? 'mensagem', _j::text);
  _j := public.agente_criar_caso(_sem, '{}');
  insert into r values (7, 'agente: sem função recusado antes dos campos', _j->>'erro' = 'nao_e_membro_colih', _j::text);
  insert into r select 8, 'agente: nada gravado para GVP/sem função', count(*) = 0, count(*)::text
    from public.casos where criado_por_id in (_gvp, _sem);

  -- App: inserção direta pela RLS, como o usuário logado.
  perform set_config('test.col', _col::text, true);
  perform set_config('test.gvp', _gvp::text, true);
  perform set_config('test.sup', _sup::text, true);
end $$;

set local role authenticated;

do $$
declare _id uuid;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.col'), 'role', 'authenticated')::text, true);
  insert into public.casos (status, paciente_nome, area_especialidade, responsavel_id, criado_por_id)
  values ('aberto', 'Paciente Colihteste App', 'tmo', auth.uid(), auth.uid()) returning id into _id;
  insert into r values (9, 'app: COLIH cria', _id is not null, null);

  perform set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.sup'), 'role', 'authenticated')::text, true);
  insert into public.casos (status, paciente_nome, area_especialidade, responsavel_id, criado_por_id)
  values ('aberto', 'Paciente Colihteste App Sup', 'tmo', auth.uid(), auth.uid()) returning id into _id;
  insert into r values (10, 'app: superadmin cria', _id is not null, null);

  perform set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.gvp'), 'role', 'authenticated')::text, true);
  begin
    insert into public.casos (status, paciente_nome, area_especialidade, responsavel_id, criado_por_id)
    values ('aberto', 'Paciente Colihteste App Gvp', 'tmo', auth.uid(), auth.uid());
    insert into r values (11, 'app: GVP recusado pela RLS', false, 'aceitou');
  exception when insufficient_privilege then
    insert into r values (11, 'app: GVP recusado pela RLS', true, sqlerrm);
  end;
end $$;

reset role;
select passo, caso, ok, detalhe from r order by passo;
rollback;
