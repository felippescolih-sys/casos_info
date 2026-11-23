-- Teste do estoque de medicamentos (20261123120000): RLS só para a COLIH, responsável sempre da COLIH,
-- valor x doação, edição/exclusão por quem lançou, quem guarda ou admin da COLIH, e a baixa.
-- Transação desfeita no final (rollback). Rodar com psql ou psycopg (vários comandos).
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
grant all on r to authenticated;
do $$
declare
  _adm uuid := gen_random_uuid(); _mem uuid := gen_random_uuid(); _mem2 uuid := gen_random_uuid();
  _gvp uuid := gen_random_uuid(); _vol uuid := gen_random_uuid();
  _m1 uuid; _m2 uuid; _n int; _row public.medicamentos_estoque;
  _num int := (select max(numero) from public.casos where length(btrim(paciente_nome)) >= 3);
  _pac text := (select paciente_nome from public.casos where numero = (select max(numero) from public.casos
                where length(btrim(paciente_nome)) >= 3));
begin
  insert into auth.users (id, email, aud, role) values
    (_adm, 'teste-med-a@exemplo.invalid', 'authenticated', 'authenticated'),
    (_mem, 'teste-med-m@exemplo.invalid', 'authenticated', 'authenticated'),
    (_mem2, 'teste-med-n@exemplo.invalid', 'authenticated', 'authenticated'),
    (_gvp, 'teste-med-g@exemplo.invalid', 'authenticated', 'authenticated'),
    (_vol, 'teste-med-v@exemplo.invalid', 'authenticated', 'authenticated');
  insert into public.membros (id, nome, email, status) values
    (_adm, 'Ana Admin Med', 'teste-med-a@exemplo.invalid', 'ativo'),
    (_mem, 'Beto Colih Med', 'teste-med-m@exemplo.invalid', 'ativo'),
    (_mem2, 'Carla Colih Med', 'teste-med-n@exemplo.invalid', 'ativo'),
    (_gvp, 'Davi Gvp Med', 'teste-med-g@exemplo.invalid', 'ativo'),
    (_vol, 'Eva Voluntaria Med', 'teste-med-v@exemplo.invalid', 'ativo')
  on conflict (id) do update set status = excluded.status, nome = excluded.nome;
  delete from public.membro_funcoes where membro_id in (_adm, _mem, _mem2, _gvp, _vol);
  insert into public.membro_funcoes (membro_id, area, nivel) values
    (_adm, 'colih', 'admin'), (_mem, 'colih', 'usuario'), (_mem2, 'colih', 'usuario'),
    (_gvp, 'gvps', 'usuario'), (_vol, 'medicos', 'usuario');

  set local role authenticated;

  -- 1. membro da COLIH lança; responsável e autor vêm dele mesmo
  perform set_config('request.jwt.claims', json_build_object('sub', _mem, 'role', 'authenticated')::text, true);
  insert into public.medicamentos_estoque (medicamento, dosagem, quantidade, unidade, origem, valor)
  values ('Eritropoetina', '4.000 UI', 3, 'frasco', 'compra', 150.00) returning id into _m1;
  select * into _row from public.medicamentos_estoque where id = _m1;
  insert into r values (1, 'membro lança; responsável e autor = ele',
    _row.responsavel_id = _mem and _row.criado_por = _mem and _row.validade is null, row_to_json(_row)::text);

  -- 2. compra sem valor é recusada
  begin
    insert into public.medicamentos_estoque (medicamento, dosagem, origem) values ('Ferro', '100 mg', 'compra');
    insert into r values (2, 'compra sem valor recusada', false, 'aceitou');
  exception when others then insert into r values (2, 'compra sem valor recusada', true, sqlerrm); end;

  -- 3. doação com valor é recusada
  begin
    insert into public.medicamentos_estoque (medicamento, dosagem, origem, valor) values ('Ferro', '100 mg', 'doacao', 10);
    insert into r values (3, 'doação com valor recusada', false, 'aceitou');
  exception when others then insert into r values (3, 'doação com valor recusada', true, sqlerrm); end;

  -- 4. responsável que não é da COLIH é recusado
  begin
    insert into public.medicamentos_estoque (medicamento, dosagem, origem, responsavel_id)
    values ('Ferro', '100 mg', 'doacao', _gvp);
    insert into r values (4, 'responsável fora da COLIH recusado', false, 'aceitou');
  exception when others then insert into r values (4, 'responsável fora da COLIH recusado', true, sqlerrm); end;

  -- 5. autor não é forjado
  insert into public.medicamentos_estoque (medicamento, dosagem, origem, criado_por, validade)
  values ('Ácido tranexâmico', '250 mg', 'doacao', _adm, '2027-03-31') returning id into _m2;
  select * into _row from public.medicamentos_estoque where id = _m2;
  insert into r values (5, 'autor não é forjado', _row.criado_por = _mem, _row.criado_por::text);

  -- 6. outro membro da COLIH vê, mas não edita nem exclui
  perform set_config('request.jwt.claims', json_build_object('sub', _mem2, 'role', 'authenticated')::text, true);
  select count(*) into _n from public.medicamentos_estoque where id in (_m1, _m2);
  insert into r values (6, 'outro membro da COLIH vê', _n = 2, _n::text);
  update public.medicamentos_estoque set dosagem = 'x' where id = _m1;
  get diagnostics _n = row_count;
  insert into r values (7, 'outro membro não edita', _n = 0, _n::text);
  delete from public.medicamentos_estoque where id = _m1;
  get diagnostics _n = row_count;
  insert into r values (8, 'outro membro não exclui', _n = 0, _n::text);

  -- 9. voluntário e GVP não veem nem lançam
  perform set_config('request.jwt.claims', json_build_object('sub', _vol, 'role', 'authenticated')::text, true);
  select count(*) into _n from public.medicamentos_estoque where id in (_m1, _m2);
  insert into r values (9, 'voluntário não vê', _n = 0, _n::text);
  perform set_config('request.jwt.claims', json_build_object('sub', _gvp, 'role', 'authenticated')::text, true);
  select count(*) into _n from public.medicamentos_estoque where id in (_m1, _m2);
  insert into r values (10, 'GVP não vê', _n = 0, _n::text);
  begin
    insert into public.medicamentos_estoque (medicamento, dosagem, origem, responsavel_id)
    values ('Ferro', '100 mg', 'doacao', _mem);
    insert into r values (11, 'GVP não lança', false, 'aceitou');
  exception when others then insert into r values (11, 'GVP não lança', true, sqlerrm); end;
  select count(*) into _n from public.membros_colih();
  insert into r values (12, 'GVP não lista membros da COLIH', _n = 0, _n::text);
  select count(*) into _n from public.medicamentos_buscar_caso(_num::text);
  insert into r values (28, 'GVP não busca casos', _n = 0, _n::text);

  -- 13. quem lançou passa a medicação para outro membro da COLIH
  perform set_config('request.jwt.claims', json_build_object('sub', _mem, 'role', 'authenticated')::text, true);
  update public.medicamentos_estoque set responsavel_id = _mem2 where id = _m1;
  get diagnostics _n = row_count;
  insert into r values (13, 'passa a medicação para outro membro', _n = 1, _n::text);
  select count(*) into _n from public.membros_colih() m where m.id in (_mem, _mem2, _adm);
  insert into r values (14, 'lista de membros da COLIH tem os 3', _n = 3, _n::text);
  select count(*) into _n from public.membros_colih() m where m.id in (_gvp, _vol);
  insert into r values (15, 'lista não tem GVP nem voluntário', _n = 0, _n::text);

  -- 16. quem está com a medicação dá baixa; baixado_por vem dele
  perform set_config('request.jwt.claims', json_build_object('sub', _mem2, 'role', 'authenticated')::text, true);
  update public.medicamentos_estoque
     set baixado_em = '2026-11-23', baixa_destino = 'Paciente do HC', baixado_por = _adm
   where id = _m1;
  select * into _row from public.medicamentos_estoque where id = _m1;
  insert into r values (16, 'responsável dá baixa; baixado_por = ele',
    _row.baixado_em = '2026-11-23' and _row.baixado_por = _mem2 and _row.criado_por = _mem, row_to_json(_row)::text);

  -- 22. caso que não existe é recusado
  begin
    update public.medicamentos_estoque set baixa_caso_numero = -1 where id = _m1;
    insert into r values (22, 'caso inexistente recusado', false, 'aceitou');
  exception when others then insert into r values (22, 'caso inexistente recusado', true, sqlerrm); end;

  -- 23. liga a baixa a um caso de que o membro não participa (só o número fica gravado)
  update public.medicamentos_estoque set baixa_caso_numero = _num where id = _m1;
  select * into _row from public.medicamentos_estoque where id = _m1;
  insert into r values (23, 'liga a baixa a caso de outro membro e grava o paciente',
    _row.baixa_caso_numero = _num and _row.baixa_paciente = _pac, _num::text);

  -- 24-26. busca do caso por número e por nome (membro que não participa do caso)
  select count(*) into _n from public.medicamentos_buscar_caso(_num::text) b where b.numero = _num;
  insert into r values (24, 'busca pelo número acha o caso', _n = 1, _n::text);
  select count(*) into _n from public.medicamentos_buscar_caso(upper(_pac)) b where b.numero = _num;
  insert into r values (25, 'busca pelo nome (sem caixa) acha o caso', _n = 1, _n::text);
  select count(*) into _n from public.medicamentos_buscar_caso('a');
  insert into r values (26, 'nome com menos de 3 letras não busca', _n = 0, _n::text);
  select count(*) into _n from public.medicamentos_buscar_caso('ana');
  insert into r values (27, 'no máximo 5 resultados', _n <= 5, _n::text);

  -- 17. desfazer a baixa limpa os campos da baixa
  update public.medicamentos_estoque set baixado_em = null where id = _m1;
  select * into _row from public.medicamentos_estoque where id = _m1;
  insert into r values (17, 'desfazer baixa limpa campos',
    _row.baixado_por is null and _row.baixa_destino is null and _row.baixa_caso_numero is null
    and _row.baixa_paciente is null,
    row_to_json(_row)::text);

  -- 18. responsável não passa para quem não é da COLIH
  begin
    update public.medicamentos_estoque set responsavel_id = _vol where id = _m1;
    insert into r values (18, 'não passa para fora da COLIH', false, 'aceitou');
  exception when others then insert into r values (18, 'não passa para fora da COLIH', true, sqlerrm); end;

  -- 19. admin da COLIH edita e exclui lançamento de outro
  perform set_config('request.jwt.claims', json_build_object('sub', _adm, 'role', 'authenticated')::text, true);
  update public.medicamentos_estoque set quantidade = 2 where id = _m2;
  get diagnostics _n = row_count;
  insert into r values (19, 'admin edita de outro', _n = 1, _n::text);
  delete from public.medicamentos_estoque where id = _m2;
  get diagnostics _n = row_count;
  insert into r values (20, 'admin exclui de outro', _n = 1, _n::text);

  -- 21. quantidade zero recusada
  begin
    insert into public.medicamentos_estoque (medicamento, dosagem, origem, quantidade) values ('Ferro', '100 mg', 'doacao', 0);
    insert into r values (21, 'quantidade zero recusada', false, 'aceitou');
  exception when others then insert into r values (21, 'quantidade zero recusada', true, sqlerrm); end;

  reset role;
end $$;

select passo, caso, ok, detalhe from r order by passo;
rollback;
