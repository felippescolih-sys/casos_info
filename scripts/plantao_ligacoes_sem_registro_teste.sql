-- Teste de plantao_ligacoes_sem_registro e plantao_avisos_registro: ligação curta não conta, número
-- repetido conta uma vez, caso aberto pelo plantonista ou pelo ajudante cobre a ligação, caso aberto
-- com o telefone cobre, caso antigo encerrado não cobre, app não executa a função nem grava na
-- tabela, cron agendado. Usa um dia de 2030 para não misturar com chamadas reais. Transação
-- desfeita no final (rollback). Rodar com psql ou psycopg (vários comandos).
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
grant all on r to authenticated;
do $$
declare
  _p uuid := gen_random_uuid(); _a uuid := gen_random_uuid();
  _dia date := date '2030-01-15';
  _t timestamptz := timestamptz '2030-01-15 10:00-03';
  _h text[]; _n bigint;
begin
  insert into auth.users (id, email, aud, role) values
    (_p, 'teste-psr-p@exemplo.invalid', 'authenticated', 'authenticated'),
    (_a, 'teste-psr-a@exemplo.invalid', 'authenticated', 'authenticated');
  insert into public.membros (id, nome, email, status) values
    (_p, 'Paulo Plantonista', 'teste-psr-p@exemplo.invalid', 'ativo'),
    (_a, 'Alice Ajudante', 'teste-psr-a@exemplo.invalid', 'ativo')
  on conflict (id) do update set status = excluded.status, nome = excluded.nome;
  insert into public.escalas (membro_id, ajudante_id, inicio, fim)
  values (_p, _a, timestamptz '2030-01-15 00:00-03', timestamptz '2030-01-15 23:59-03');

  -- Chamadas do dia (o gatilho grava o plantonista pela escala acima):
  --  A 10:00 sem caso                  → aviso
  --  A 11:00 de novo                   → mesma pessoa, conta uma vez (10:00)
  --  B 10:30 só 40 s de conversa       → não conta
  --  C 12:00 caso aberto pelo ajudante → coberta
  --  D 13:00 caso aberto com o tel     → coberta (caso criado por outra pessoa, telefone igual)
  --  E 14:00 paciente de caso antigo encerrado → aviso
  --  F 15:00 e 15:05, ~35 s cada (plantonista não atendeu, a pessoa insistiu) → aviso
  insert into public.chamadas_plantao (uniqueid, data_hora_inicio, numero_origem, duracao_segundos, duracao_falada_segundos, status) values
    ('t-f1', _t + interval '5 hours',        '41911110006',  35,  35, 'ANSWERED'),
    ('t-f2', _t + interval '5 hours 5 min',  '41911110006',  34,  34, 'ANSWERED'),
    ('t-a1', _t,                        '41911110001', 200, 180, 'ANSWERED'),
    ('t-a2', _t + interval '1 hour',    '41911110001', 200, 180, 'ANSWERED'),
    ('t-b',  _t + interval '30 min',    '41911110002',  60,  40, 'ANSWERED'),
    ('t-c',  _t + interval '2 hours',   '41911110003', 200, 180, 'ANSWERED'),
    ('t-d',  _t + interval '3 hours',   '41911110004', 200, 180, 'ANSWERED'),
    ('t-e',  _t + interval '4 hours',   '41911110005', 200, 180, 'ANSWERED');

  insert into public.casos (status, responsavel_id, responsavel_nome, criado_por_id, paciente_nome, id_caso, numero, created_at)
  values ('aberto', _a, 'Alice Ajudante', _a, 'Paciente C', 'TSTPS1', -11, _t + interval '2 hours 20 min');
  insert into public.casos (status, paciente_nome, id_caso, numero, contato_telefonou, created_at)
  values ('aberto', 'Paciente D', 'TSTPS2', -12, '(41) 91111-0004', _t - interval '20 days');
  insert into public.casos (status, paciente_nome, id_caso, numero, telefone_paciente, created_at)
  values ('encerrado', 'Paciente E', 'TSTPS3', -13, '41 911110005', _t - interval '40 days');

  select horarios into _h from public.plantao_ligacoes_sem_registro(_dia) where plantonista_id = _p;
  -- A, C, E e F precisam de caso (B é curta e única; D tem o caso pelo telefone). Só há um caso da
  -- equipe (o da ajudante, 12:20): cobre a primeira, A. Sobram C, E e F.
  insert into r values (1, '4 ligações, 1 caso da equipe: sobram 3', _h = array['12:00', '14:00', '15:00'], array_to_string(_h, ', '));

  -- 2. mais um caso do plantonista cobre só mais uma ligação
  insert into public.casos (status, responsavel_id, responsavel_nome, criado_por_id, paciente_nome, id_caso, numero, created_at)
  values ('aberto', _p, 'Paulo Plantonista', _p, 'Paciente X', 'TSTPS4', -14, _t + interval '6 hours');
  select horarios into _h from public.plantao_ligacoes_sem_registro(_dia) where plantonista_id = _p;
  insert into r values (2, 'um caso cobre uma ligação só', _h = array['14:00', '15:00'], array_to_string(_h, ', '));

  -- 2b. com um caso para cada ligação, ninguém é avisado
  insert into public.casos (status, responsavel_id, responsavel_nome, criado_por_id, paciente_nome, id_caso, numero, created_at) values
    ('aberto', _p, 'Paulo Plantonista', _p, 'Paciente Y', 'TSTPS5', -15, _t + interval '6 hours 10 min'),
    ('aberto', _p, 'Paulo Plantonista', _p, 'Paciente Z', 'TSTPS6', -16, _t + interval '6 hours 20 min');
  select horarios into _h from public.plantao_ligacoes_sem_registro(_dia) where plantonista_id = _p;
  insert into r values (7, 'um caso por ligação: sem aviso', _h is null, coalesce(array_to_string(_h, ', '), 'nenhuma'));

  -- 3. reivindicar duas vezes: a segunda não insere
  insert into public.plantao_avisos_registro (dia, plantonista_id, horarios) values (_dia, _p, array['10:00']);
  insert into public.plantao_avisos_registro (dia, plantonista_id, horarios) values (_dia, _p, array['10:00'])
  on conflict do nothing;
  select count(*) into _n from public.plantao_avisos_registro where dia = _dia;
  insert into r values (3, 'um aviso por plantonista por dia', _n = 1, _n || ' linha(s)');

  -- 4. cron agendado
  select count(*) into _n from cron.job where jobname = 'plantao-sem-registro' and schedule = '0 15 * * *';
  insert into r values (4, 'cron às 12h de Brasília', _n = 1, null);

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', _p, 'role', 'authenticated')::text, true);

  -- 5. app não executa a função
  begin
    perform public.plantao_ligacoes_sem_registro(_dia);
    insert into r values (5, 'app não executa a função', false, 'executou');
  exception when others then insert into r values (5, 'app não executa a função', true, sqlerrm); end;

  -- 6. app não grava a reivindicação
  begin
    insert into public.plantao_avisos_registro (dia, plantonista_id, horarios) values (_dia + 1, _p, array['x']);
    insert into r values (6, 'app não grava aviso', false, 'aceitou');
  exception when others then insert into r values (6, 'app não grava aviso', true, sqlerrm); end;
end $$;
reset role;
-- Informativo: o que a função apontaria nos plantões reais já passados (não envia nada).
insert into r
select 100 + row_number() over (order by d.dia), to_char(d.dia, 'DD/MM') || ' ' || x.plantonista_nome, null,
       array_to_string(x.horarios, ', ')
from generate_series(date '2026-10-23', date '2026-11-07', interval '1 day') d(dia),
     lateral public.plantao_ligacoes_sem_registro(d.dia::date) x;
select passo, caso, ok, detalhe from r order by passo;
rollback;
