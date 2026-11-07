-- Aviso diário ao plantonista quando ligações do plantão de ontem não viraram caso.
--
-- A conferência manual de 07/11/2026 (ligações de 23/10 a 07/11) achou plantões com ligações e
-- nenhum caso registrado. A coordenação pediu que o sistema avise o plantonista sozinho, com
-- cópia para Felippe Soares, Sérgio e Eduardo Crusdack.
--
-- Regra:
--   - ligação do plantão = número que no dia teve uma chamada com mais de 1 min de conversa OU
--     ligou 2+ vezes. A central atende toda chamada com o aviso de espera e encerra em ~30-40 s
--     quando o plantonista não atende: o CDR diz ANSWERED mesmo assim, então a insistência é o
--     sinal de quem precisava do plantão e deve ter tido retorno. Conta uma vez por dia, no
--     horário da primeira chamada, com plantonista gravado na chamada.
--   - cada ligação precisa de um caso, e cada caso cobre uma ligação só (em ordem de horário):
--       1. um caso com o telefone de quem ligou (8 últimos dígitos em contato_telefonou,
--          telefone_paciente, telefone_acompanhante, tele_hospital, anciaos_cont_tel) que está
--          aberto (aberto nos últimos 90 dias: retorno de caso em andamento) ou foi aberto entre
--          30 min antes e 24 h depois da ligação. Caso antigo encerrado não conta: pode ser a
--          mesma pessoa com um caso novo;
--       2. senão, um caso que o plantonista (ou o ajudante da escala) criou, é responsável ou é
--          ajudante, aberto entre 30 min antes e 24 h depois da ligação e ainda não usado por
--          outra ligação. Sem isso, um caso só cobriria todas as ligações do dia.
--
-- O pg_cron chama a enviar-wapi às 12h de Brasília (evento "plantao_sem_registro"); ela consulta
-- esta função para o dia anterior, reivindica o aviso em `plantao_avisos_registro` (um por
-- plantonista por dia, sem repetir) e manda as mensagens.

create or replace function public.plantao_ligacoes_sem_registro(_dia date)
returns table (plantonista_id uuid, plantonista_nome text, horarios text[])
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  _l record;
  _caso uuid;
  _usados uuid[] := '{}';
  -- ligações sem caso pelo telefone (etapa 1), à espera da etapa 2
  _p_ini timestamptz[] := '{}';
  _p_pid uuid[] := '{}';
  _p_aid uuid[] := '{}';
  _p_nome text[] := '{}';
  _i int;
  _ids uuid[] := '{}';
  _nomes text[] := '{}';
  _horas timestamptz[] := '{}';
begin
  -- Etapa 1: caso com o telefone de quem ligou. Primeiro para todas as ligações, para que um caso
  -- que é de uma ligação não seja gasto, na etapa 2, cobrindo outra.
  for _l in
    with por_numero as (
      select c.numero_origem,
             min(c.data_hora_inicio) as ini,
             count(*) as tentativas,
             max(coalesce(c.duracao_falada_segundos, 0)) as maior_conversa
      from public.chamadas_plantao c
      where (c.data_hora_inicio at time zone 'America/Sao_Paulo')::date = _dia
        and c.plantonista_id is not null
      group by c.numero_origem
    )
    select n.ini,
           right(regexp_replace(n.numero_origem, '\D', '', 'g'), 8) as fim8,
           c.plantonista_id as pid,
           c.plantonista_nome as pnome,
           (select e.ajudante_id
              from public.escalas e
             where e.membro_id = c.plantonista_id
               and e.inicio <= n.ini
               and e.fim + interval '1 minute' > n.ini
             order by e.inicio desc
             limit 1) as aid
    from por_numero n
    join public.chamadas_plantao c on c.numero_origem = n.numero_origem and c.data_hora_inicio = n.ini
    where n.maior_conversa > 60 or n.tentativas >= 2
    order by n.ini
  loop
    _caso := null;
    if length(_l.fim8) = 8 then
      select k.id into _caso
      from public.casos k
      where ((k.status = 'aberto' and k.created_at >= _l.ini - interval '90 days')
          or k.created_at between _l.ini - interval '30 minutes' and _l.ini + interval '24 hours')
        and _l.fim8 in (
          right(regexp_replace(coalesce(k.contato_telefonou, ''), '\D', '', 'g'), 8),
          right(regexp_replace(coalesce(k.telefone_paciente, ''), '\D', '', 'g'), 8),
          right(regexp_replace(coalesce(k.telefone_acompanhante, ''), '\D', '', 'g'), 8),
          right(regexp_replace(coalesce(k.tele_hospital, ''), '\D', '', 'g'), 8),
          right(regexp_replace(coalesce(k.anciaos_cont_tel, ''), '\D', '', 'g'), 8)
        )
      order by k.created_at desc
      limit 1;
    end if;

    if _caso is null then
      _p_ini := _p_ini || _l.ini;
      _p_pid := _p_pid || _l.pid;
      _p_aid := _p_aid || _l.aid;
      _p_nome := _p_nome || _l.pnome;
    else
      _usados := _usados || _caso;
    end if;
  end loop;

  -- Etapa 2: caso do plantonista/ajudante ainda não usado, um por ligação, em ordem de horário.
  for _i in 1 .. coalesce(array_length(_p_ini, 1), 0) loop
    select k.id into _caso
    from public.casos k
    where k.created_at between _p_ini[_i] - interval '30 minutes' and _p_ini[_i] + interval '24 hours'
      and (k.criado_por_id in (_p_pid[_i], _p_aid[_i])
        or k.responsavel_id in (_p_pid[_i], _p_aid[_i])
        or k.ajudante_id in (_p_pid[_i], _p_aid[_i]))
      and not (k.id = any (_usados))
    order by k.created_at
    limit 1;

    if _caso is null then
      _ids := _ids || _p_pid[_i];
      _nomes := _nomes || _p_nome[_i];
      _horas := _horas || _p_ini[_i];
    else
      _usados := _usados || _caso;
    end if;
  end loop;

  return query
    select u.id,
           max(u.nome),
           array_agg(to_char(u.hora at time zone 'America/Sao_Paulo', 'HH24:MI') order by u.hora)
    from unnest(_ids, _nomes, _horas) as u(id, nome, hora)
    group by u.id;
end;
$$;

revoke all on function public.plantao_ligacoes_sem_registro(date) from public, anon, authenticated;
grant execute on function public.plantao_ligacoes_sem_registro(date) to service_role;

-- Um aviso por plantonista por dia. A Edge Function insere antes de enviar (on conflict do
-- nothing): se o cron rodar duas vezes, ninguém recebe a mensagem repetida.
create table if not exists public.plantao_avisos_registro (
  dia date not null,
  plantonista_id uuid not null references public.membros(id) on delete cascade,
  horarios text[] not null,
  enviado_em timestamptz not null default now(),
  primary key (dia, plantonista_id)
);

alter table public.plantao_avisos_registro enable row level security;

drop policy if exists plantao_avisos_registro_select_superadmin on public.plantao_avisos_registro;
create policy plantao_avisos_registro_select_superadmin on public.plantao_avisos_registro
  for select to authenticated
  using (public.is_admin_geral());

revoke all on public.plantao_avisos_registro from anon;
revoke insert, update, delete on public.plantao_avisos_registro from authenticated;
grant select on public.plantao_avisos_registro to authenticated;

-- Todo dia às 12h de Brasília (15h UTC; o Brasil não tem horário de verão desde 2019).
select cron.unschedule('plantao-sem-registro')
where exists (select 1 from cron.job where jobname = 'plantao-sem-registro');

select cron.schedule(
  'plantao-sem-registro',
  '0 15 * * *',
  $cron$
  select net.http_post(
    url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'wapi_webhook_secret')
    ),
    body := jsonb_build_object('evento', 'plantao_sem_registro'),
    timeout_milliseconds := 60000
  );
  $cron$
);
