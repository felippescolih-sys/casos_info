-- Teste da whatsapp_mensagens_avulsas: superadmin lê o histórico, outro membro não vê nada, ninguém
-- grava pelo app (só a Edge Function, com service_role) e anon não lê. Transação desfeita no final.
-- Rodar com psql ou psycopg (vários comandos); `supabase db query --db-url` recusa.
begin;

create temp table r (passo int, caso text, ok boolean, detalhe text);
grant all on r to authenticated, anon;
do $$
declare
  _s uuid := gen_random_uuid(); _m uuid := gen_random_uuid();
  _n bigint;
begin
  insert into auth.users (id, email, aud, role) values
    (_s, 'teste-wa-s@exemplo.invalid', 'authenticated', 'authenticated'),
    (_m, 'teste-wa-m@exemplo.invalid', 'authenticated', 'authenticated');
  insert into public.membros (id, nome, email, status) values
    (_s, 'Sara Super', 'teste-wa-s@exemplo.invalid', 'ativo'),
    (_m, 'Marcos Membro', 'teste-wa-m@exemplo.invalid', 'ativo')
  on conflict (id) do update set status = excluded.status, nome = excluded.nome;
  insert into public.membro_funcoes (membro_id, area, nivel) values (_s, 'geral', 'superadmin');

  -- O que a Edge Function grava (como postgres aqui, service_role lá).
  insert into public.whatsapp_mensagens_avulsas
    (remetente_id, remetente_nome, destino_membro_id, destino_nome, telefone, texto, ok)
  values (_s, 'Sara Super', _m, 'Marcos Membro', '5541999990000', 'mensagem de teste', true);

  perform set_config('role', 'authenticated', true);

  -- 1. superadmin vê
  perform set_config('request.jwt.claims', json_build_object('sub', _s, 'role', 'authenticated')::text, true);
  select count(*) into _n from public.whatsapp_mensagens_avulsas where texto = 'mensagem de teste';
  insert into r values (1, 'superadmin lê o histórico', _n = 1, _n || ' linha(s)');

  -- 2. membro comum não vê
  perform set_config('request.jwt.claims', json_build_object('sub', _m, 'role', 'authenticated')::text, true);
  select count(*) into _n from public.whatsapp_mensagens_avulsas;
  insert into r values (2, 'membro comum não vê nada', _n = 0, _n || ' linha(s)');

  -- 3. nem superadmin grava pelo app
  perform set_config('request.jwt.claims', json_build_object('sub', _s, 'role', 'authenticated')::text, true);
  begin
    insert into public.whatsapp_mensagens_avulsas (telefone, texto, ok) values ('5541999990000', 'x', true);
    insert into r values (3, 'app não grava', false, 'aceitou');
  exception when others then insert into r values (3, 'app não grava', true, sqlerrm); end;

  -- 4. nem apaga
  begin
    delete from public.whatsapp_mensagens_avulsas;
    insert into r values (4, 'app não apaga', false, 'aceitou');
  exception when others then insert into r values (4, 'app não apaga', true, sqlerrm); end;

  -- 5. anon não lê
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  begin
    select count(*) into _n from public.whatsapp_mensagens_avulsas;
    insert into r values (5, 'anon não lê', false, _n || ' linha(s)');
  exception when others then insert into r values (5, 'anon não lê', true, sqlerrm); end;
end $$;
reset role;
select passo, caso, ok, detalhe from r order by passo;
rollback;
