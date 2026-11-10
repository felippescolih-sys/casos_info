-- Teste das palestras (HLC-33, 20261110120000): RLS por função da área Apresentações.
-- Admin da área cadastra para qualquer membro; membro com a função só registra/edita a palestra em que ele é o
-- "Membro da Colih"; quem não tem a função não vê; só admin/ajudante exclui; valores padrão do formulário.
-- Transação desfeita no final (rollback). Rodar com psql ou psycopg (vários comandos).
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
grant all on r to authenticated;
do $$
declare
  _adm uuid := gen_random_uuid(); _mem uuid := gen_random_uuid(); _out uuid := gen_random_uuid();
  _p1 uuid; _p2 uuid; _n int; _row public.palestras;
begin
  insert into auth.users (id, email, aud, role) values
    (_adm, 'teste-pal-a@exemplo.invalid', 'authenticated', 'authenticated'),
    (_mem, 'teste-pal-m@exemplo.invalid', 'authenticated', 'authenticated'),
    (_out, 'teste-pal-o@exemplo.invalid', 'authenticated', 'authenticated');
  insert into public.membros (id, nome, email, status) values
    (_adm, 'Ana Admin Pal', 'teste-pal-a@exemplo.invalid', 'ativo'),
    (_mem, 'Beto Palestrante', 'teste-pal-m@exemplo.invalid', 'ativo'),
    (_out, 'Caio Sem Funcao', 'teste-pal-o@exemplo.invalid', 'ativo')
  on conflict (id) do update set status = excluded.status, nome = excluded.nome;
  delete from public.membro_funcoes where membro_id in (_adm, _mem, _out);
  insert into public.membro_funcoes (membro_id, area, nivel) values
    (_adm, 'apresentacoes', 'admin'), (_mem, 'apresentacoes', 'usuario'), (_out, 'colih', 'usuario');

  set local role authenticated;

  -- 1. admin da área cadastra palestra de outro membro
  perform set_config('request.jwt.claims', json_build_object('sub', _adm, 'role', 'authenticated')::text, true);
  insert into public.palestras (data_apresentacao, qtd_participantes, membro_id, evento, presencial, powerpoint,
                                especialidade_participantes)
  values ('2026-11-12', 45, _mem, 'Jornada Acadêmica', true, true, 'Oncology') returning id into _p1;
  select * into _row from public.palestras where id = _p1;
  insert into r values (1, 'admin cadastra; padrões do formulário',
    _row.finalidade = 'nova' and _row.pais = 'Brasil' and _row.nome_colih = 'Colih de Curitiba'
    and _row.criado_por = _adm and _row.data_formulario is not null, row_to_json(_row)::text);

  -- 2. membro com a função vê e edita a palestra dele
  perform set_config('request.jwt.claims', json_build_object('sub', _mem, 'role', 'authenticated')::text, true);
  update public.palestras set experiencias = 'Boa participação' where id = _p1;
  get diagnostics _n = row_count;
  insert into r values (2, 'membro edita a própria palestra', _n = 1, _n::text);

  -- 3. membro registra palestra própria
  insert into public.palestras (data_apresentacao, membro_id) values ('2026-11-20', _mem) returning id into _p2;
  insert into r values (3, 'membro registra a própria palestra', _p2 is not null, null);

  -- 4. membro não registra palestra em nome de outro
  begin
    insert into public.palestras (data_apresentacao, membro_id) values ('2026-11-21', _adm);
    insert into r values (4, 'membro não registra em nome de outro', false, 'aceitou');
  exception when others then insert into r values (4, 'membro não registra em nome de outro', true, sqlerrm); end;

  -- 5. membro não troca o "Membro da Colih" para outra pessoa
  begin
    update public.palestras set membro_id = _adm where id = _p2;
    insert into r values (5, 'membro não passa a palestra para outro', false, 'aceitou');
  exception when others then insert into r values (5, 'membro não passa a palestra para outro', true, sqlerrm); end;

  -- 6. membro não exclui
  delete from public.palestras where id = _p2;
  get diagnostics _n = row_count;
  insert into r values (6, 'membro não exclui', _n = 0, _n::text);

  -- 7. quem não tem a função não vê
  perform set_config('request.jwt.claims', json_build_object('sub', _out, 'role', 'authenticated')::text, true);
  select count(*) into _n from public.palestras where id in (_p1, _p2);
  insert into r values (7, 'sem a função não vê', _n = 0, _n::text);

  -- 8. sem a função não cadastra nem para si
  begin
    insert into public.palestras (data_apresentacao, membro_id) values ('2026-11-22', _out);
    insert into r values (8, 'sem a função não cadastra', false, 'aceitou');
  exception when others then insert into r values (8, 'sem a função não cadastra', true, sqlerrm); end;

  -- 9. admin exclui
  perform set_config('request.jwt.claims', json_build_object('sub', _adm, 'role', 'authenticated')::text, true);
  delete from public.palestras where id = _p2;
  get diagnostics _n = row_count;
  insert into r values (9, 'admin exclui', _n = 1, _n::text);

  -- 10. participantes não pode ser negativo
  begin
    insert into public.palestras (data_apresentacao, membro_id, qtd_participantes) values ('2026-11-23', _adm, -1);
    insert into r values (10, 'participantes negativo recusado', false, 'aceitou');
  exception when others then insert into r values (10, 'participantes negativo recusado', true, sqlerrm); end;

  reset role;
end $$;

select passo, caso, ok, detalhe from r order by passo;
rollback;
