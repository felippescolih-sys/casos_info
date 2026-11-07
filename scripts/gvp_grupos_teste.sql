-- Teste dos grupos do GVP (salvar_gvp_grupo + RLS + função "Membro GVP" automática): quem não gerencia é recusado,
-- criar grupo, função dada a quem entra, membro e hospital em outro grupo, número repetido, responsável também
-- ajudante, membro inativo, troca de responsável, função existente preservada, leitura e exclusão pela RLS.
-- Transação desfeita no final (rollback). Rodar com psql ou psycopg (vários comandos).
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
grant all on r to authenticated;
do $$
declare
  _a uuid := gen_random_uuid(); _b uuid := gen_random_uuid(); _c uuid := gen_random_uuid();
  _d uuid := gen_random_uuid(); _e uuid := gen_random_uuid();
  _h1 uuid; _h2 uuid; _g1 uuid; _g2 uuid; _n int;
begin
  insert into auth.users (id, email, aud, role) values
    (_a, 'teste-gvp-a@exemplo.invalid', 'authenticated', 'authenticated'),
    (_b, 'teste-gvp-b@exemplo.invalid', 'authenticated', 'authenticated'),
    (_c, 'teste-gvp-c@exemplo.invalid', 'authenticated', 'authenticated'),
    (_d, 'teste-gvp-d@exemplo.invalid', 'authenticated', 'authenticated'),
    (_e, 'teste-gvp-e@exemplo.invalid', 'authenticated', 'authenticated');
  -- O gatilho de auth.users já cria o membro (nome = início do e-mail): sobrescreve nome e status.
  insert into public.membros (id, nome, email, status) values
    (_a, 'Ana Admin', 'teste-gvp-a@exemplo.invalid', 'ativo'),
    (_b, 'Beto Gvp', 'teste-gvp-b@exemplo.invalid', 'ativo'),
    (_c, 'Caio Gvp', 'teste-gvp-c@exemplo.invalid', 'ativo'),
    (_d, 'Duda Gvp', 'teste-gvp-d@exemplo.invalid', 'ativo'),
    (_e, 'Eva Inativa', 'teste-gvp-e@exemplo.invalid', 'inativo')
  on conflict (id) do update set status = excluded.status, nome = excluded.nome;
  insert into public.membro_funcoes (membro_id, area, nivel) values (_a, 'gvps', 'admin');
  insert into public.hospitais (nome) values ('Hospital Teste GVP 1') returning id into _h1;
  insert into public.hospitais (nome) values ('Hospital Teste GVP 2') returning id into _h2;

  -- 1. quem não gerencia não salva
  perform set_config('request.jwt.claims', json_build_object('sub', _b, 'role', 'authenticated')::text, true);
  begin
    perform public.salvar_gvp_grupo(null, 901, 'Teste', null, _b, '{}', '{}');
    insert into r values (1, 'não gerente recusado', false, 'aceitou');
  exception when others then insert into r values (1, 'não gerente recusado', true, sqlerrm); end;

  -- 2. admin GVPs cria o grupo 901
  perform set_config('request.jwt.claims', json_build_object('sub', _a, 'role', 'authenticated')::text, true);
  _g1 := public.salvar_gvp_grupo(null, 901, ' Zona Teste ', null, _b, array[_c], array[_h1]);
  select count(*) into _n from public.gvp_grupo_membros where grupo_id = _g1;
  insert into r values (2, 'grupo criado com 2 membros e 1 hospital',
    _n = 2 and exists (select 1 from public.gvp_grupo_hospitais where grupo_id = _g1 and hospital_id = _h1)
    and (select nome from public.gvp_grupos where id = _g1) = 'Zona Teste', _n::text);

  -- 3. quem entrou virou Membro GVP
  select count(*) into _n from public.membro_funcoes
  where membro_id in (_b, _c) and area = 'gvps' and nivel = 'usuario';
  insert into r values (3, 'função usuario em gvps dada', _n = 2, _n::text);

  -- 4. membro já em outro grupo
  begin
    perform public.salvar_gvp_grupo(null, 902, null, null, _d, array[_c], '{}');
    insert into r values (4, 'membro em outro grupo recusado', false, 'aceitou');
  exception when others then insert into r values (4, 'membro em outro grupo recusado', sqlerrm like '%Caio Gvp (grupo 901)%', sqlerrm); end;

  -- 5. hospital já em outro grupo
  begin
    perform public.salvar_gvp_grupo(null, 902, null, null, _d, '{}', array[_h1]);
    insert into r values (5, 'hospital em outro grupo recusado', false, 'aceitou');
  exception when others then insert into r values (5, 'hospital em outro grupo recusado', sqlerrm like '%grupo 901%', sqlerrm); end;

  -- 6. número repetido
  begin
    perform public.salvar_gvp_grupo(null, 901, null, null, _d, '{}', '{}');
    insert into r values (6, 'número repetido recusado', false, 'aceitou');
  exception when others then insert into r values (6, 'número repetido recusado', true, sqlerrm); end;

  -- 7. responsável também ajudante
  begin
    perform public.salvar_gvp_grupo(null, 902, null, null, _d, array[_d], '{}');
    insert into r values (7, 'responsável também ajudante recusado', false, 'aceitou');
  exception when others then insert into r values (7, 'responsável também ajudante recusado', true, sqlerrm); end;

  -- 8. membro inativo
  begin
    perform public.salvar_gvp_grupo(null, 902, null, null, _d, array[_e], '{}');
    insert into r values (8, 'membro inativo recusado', false, 'aceitou');
  exception when others then insert into r values (8, 'membro inativo recusado', true, sqlerrm); end;

  -- 9. trocar o responsável do grupo 901 (Caio responsável, Beto ajudante) e somar hospital
  perform public.salvar_gvp_grupo(_g1, 901, 'Zona Teste', 'obs', _c, array[_b], array[_h1, _h2]);
  insert into r values (9, 'troca de responsável',
    (select membro_id from public.gvp_grupo_membros where grupo_id = _g1 and papel = 'responsavel') = _c
    and (select papel from public.gvp_grupo_membros where membro_id = _b) = 'ajudante'
    and (select count(*) from public.gvp_grupo_hospitais where grupo_id = _g1) = 2, null);

  -- 10. função existente preservada (Ana é admin de GVPs e entra como ajudante do 902)
  _g2 := public.salvar_gvp_grupo(null, 902, null, null, _d, array[_a], '{}');
  insert into r values (10, 'admin continua admin ao entrar no grupo',
    (select nivel::text from public.membro_funcoes where membro_id = _a and area = 'gvps') = 'admin', null);

  -- 11. membro comum lê os grupos; 12. não exclui pela RLS
  perform set_config('request.jwt.claims', json_build_object('sub', _b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into _n from public.gvp_grupos where numero in (901, 902);
  insert into r values (11, 'membro ativo lê os grupos', _n = 2, _n::text);
  delete from public.gvp_grupos where id = _g2;
  get diagnostics _n = row_count;
  insert into r values (12, 'membro comum não exclui grupo', _n = 0, _n::text);
  reset role;

  -- 13. admin exclui: membros e hospitais soltos, função fica
  perform set_config('request.jwt.claims', json_build_object('sub', _a, 'role', 'authenticated')::text, true);
  delete from public.gvp_grupos where id = _g1;
  insert into r values (13, 'excluir grupo solta membros e hospitais',
    not exists (select 1 from public.gvp_grupo_membros where grupo_id = _g1)
    and not exists (select 1 from public.gvp_grupo_hospitais where grupo_id = _g1)
    and exists (select 1 from public.membro_funcoes where membro_id = _b and area = 'gvps'), null);
end $$;
select passo, caso, ok, detalhe from r order by passo;
rollback;
