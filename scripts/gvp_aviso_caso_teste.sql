-- Teste do aviso ao GVP (casos_aviso_gvp + cidade_na_regiao_curitiba): cidades da região, de fora e com erro
-- de digitação; caso de fora num hospital de grupo avisa uma vez só; caso da região não avisa; cidade em branco
-- espera e avisa quando preenchida; hospital sem grupo; responsável do caso = responsável do grupo; o app não
-- zera o carimbo; caso antigo não dispara. O último passo só conta como os casos atuais seriam classificados.
-- Transação desfeita no final (rollback): o pedido ao pg_net também é desfeito e nenhuma mensagem sai.
-- Rodar com psql ou psycopg (vários comandos).
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
do $$
declare
  _a uuid := gen_random_uuid(); _b uuid := gen_random_uuid(); _c uuid := gen_random_uuid();
  _h1 uuid; _h2 uuid; _caso uuid; _n int; _t text;

  -- pedidos ao enviar-wapi com evento gvp_novo_caso para o caso
  _pedidos constant text := $q$
    select count(*) from net.http_request_queue
    where url like '%/enviar-wapi' and convert_from(body, 'UTF8')::jsonb ->> 'evento' = 'gvp_novo_caso'
      and convert_from(body, 'UTF8')::jsonb ->> 'casoId' = $1::text $q$;
begin
  insert into auth.users (id, email, aud, role) values
    (_a, 'teste-gvpav-a@exemplo.invalid', 'authenticated', 'authenticated'),
    (_b, 'teste-gvpav-b@exemplo.invalid', 'authenticated', 'authenticated'),
    (_c, 'teste-gvpav-c@exemplo.invalid', 'authenticated', 'authenticated');
  insert into public.membros (id, nome, email, status) values
    (_a, 'Ana Admin', 'teste-gvpav-a@exemplo.invalid', 'ativo'),
    (_b, 'Beto Responsável Gvp', 'teste-gvpav-b@exemplo.invalid', 'ativo'),
    (_c, 'Caio Caso', 'teste-gvpav-c@exemplo.invalid', 'ativo')
  on conflict (id) do update set status = excluded.status, nome = excluded.nome;
  insert into public.membro_funcoes (membro_id, area, nivel) values (_a, 'gvps', 'admin');
  insert into public.hospitais (nome) values ('Hospital Teste Aviso 1') returning id into _h1;
  insert into public.hospitais (nome) values ('Hospital Teste Aviso 2') returning id into _h2;

  perform set_config('request.jwt.claims', json_build_object('sub', _a, 'role', 'authenticated')::text, true);
  perform public.salvar_gvp_grupo(null, 951, null, null, _b, '{}', array[_h1]);

  -- 1. classificação das cidades
  select string_agg(format('%s/%s=%s', c, u, coalesce(public.cidade_na_regiao_curitiba(c, u)::text, 'null')), ' ')
  into _t
  from (values ('Curitiba', 'PR'), ('Coritiba', 'Pr.'), ('São José do Pinhais', ''), ('Curitiba - PR', null),
               ('Pontal do Paraná', 'PR'), ('Matinho', 'PR'), ('Ponta Grossa', 'PR'), ('Curitibanos', 'SC'),
               ('Joinville', null), ('', 'PR'), (null, null), ('', 'SC'), ('Guarapuava', 'Paraná')) v(c, u);
  insert into r values (1, 'classificação das cidades',
    _t = 'Curitiba/PR=true Coritiba/Pr.=true São José do Pinhais/=true Curitiba - PR/=true '
         'Pontal do Paraná/PR=true Matinho/PR=true Ponta Grossa/PR=false Curitibanos/SC=false '
         'Joinville/=false /PR=null /=null /SC=false Guarapuava/Paraná=false', _t);

  -- 2. paciente de fora, hospital do grupo: avisa
  perform set_config('request.jwt.claims', json_build_object('sub', _c, 'role', 'authenticated')::text, true);
  insert into public.casos (paciente_nome, cidade, uf, hospital_nome, responsavel_id, gvp_avisado_em)
  values ('Paciente Teste', 'Ponta Grossa', 'PR', 'Hospital Teste Aviso 1', _c, now() - interval '1 day')
  returning id into _caso;
  execute _pedidos into _n using _caso;
  insert into r values (2, 'de fora no hospital do grupo avisa', _n = 1
    and (select gvp_avisado_em > now() - interval '1 minute' from public.casos where id = _caso), _n::text);

  -- 3. editar de novo não repete; 4. o app não zera o carimbo
  update public.casos set cidade = 'Guarapuava', num_quarto = '12' where id = _caso;
  execute _pedidos into _n using _caso;
  insert into r values (3, 'edição não repete o aviso', _n = 1, _n::text);
  update public.casos set gvp_avisado_em = null, cidade = 'Irati' where id = _caso;
  execute _pedidos into _n using _caso;
  insert into r values (4, 'app não zera o carimbo',
    _n = 1 and (select gvp_avisado_em is not null from public.casos where id = _caso), _n::text);

  -- 5. paciente da região: não avisa
  insert into public.casos (paciente_nome, cidade, uf, hospital_nome, responsavel_id)
  values ('Paciente Teste', 'curitiba', 'pr', 'Hospital Teste Aviso 1', _c) returning id into _caso;
  execute _pedidos into _n using _caso;
  insert into r values (5, 'paciente da região não avisa',
    _n = 0 and (select gvp_avisado_em is null from public.casos where id = _caso), _n::text);

  -- 6. cidade em branco espera; 7. avisa quando preenchida com cidade de fora
  insert into public.casos (paciente_nome, hospital_nome, responsavel_id)
  values ('Paciente Teste', 'Hospital Teste Aviso 1', _c) returning id into _caso;
  execute _pedidos into _n using _caso;
  insert into r values (6, 'cidade em branco não avisa ainda', _n = 0, _n::text);
  update public.casos set cidade = 'Joinville', uf = 'SC' where id = _caso;
  execute _pedidos into _n using _caso;
  insert into r values (7, 'avisa quando a cidade é preenchida', _n = 1, _n::text);

  -- 8. hospital sem grupo: não avisa
  insert into public.casos (paciente_nome, cidade, uf, hospital_nome, responsavel_id)
  values ('Paciente Teste', 'Cascavel', 'PR', 'Hospital Teste Aviso 2', _c) returning id into _caso;
  execute _pedidos into _n using _caso;
  insert into r values (8, 'hospital sem grupo não avisa', _n = 0, _n::text);

  -- 9. o responsável do caso é o responsável do grupo: carimba sem mandar
  insert into public.casos (paciente_nome, cidade, uf, hospital_nome, responsavel_id)
  values ('Paciente Teste', 'Cascavel', 'PR', 'hospital teste aviso 1 ', _b) returning id into _caso;
  execute _pedidos into _n using _caso;
  insert into r values (9, 'responsável do grupo no próprio caso não recebe',
    _n = 0 and (select gvp_avisado_em is not null from public.casos where id = _caso), _n::text);

  -- 10. caso antigo editado: não avisa
  insert into public.casos (paciente_nome, hospital_nome, responsavel_id, created_at)
  values ('Paciente Teste', 'Hospital Teste Aviso 1', _c, timestamptz '2026-10-01 10:00-03') returning id into _caso;
  update public.casos set cidade = 'Cascavel', uf = 'PR' where id = _caso;
  execute _pedidos into _n using _caso;
  insert into r values (10, 'caso antigo não dispara', _n = 0, _n::text);

  -- 11. como os casos atuais seriam classificados (só contagem)
  select format('região=%s fora=%s sem_cidade=%s',
    count(*) filter (where x), count(*) filter (where not x), count(*) filter (where x is null))
  into _t
  from (select public.cidade_na_regiao_curitiba(cidade, uf) x from public.casos
        where paciente_nome is distinct from 'Paciente Teste') s;
  insert into r values (11, 'classificação dos casos atuais', true, _t);
end $$;
select passo, caso, ok, detalhe from r order by passo;
rollback;
