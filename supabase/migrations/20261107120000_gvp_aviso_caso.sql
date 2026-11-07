-- Aviso ao GVP: quando um caso aberto num hospital de um grupo do GVP é de paciente de fora de
-- Curitiba, região metropolitana e litoral do Paraná, o responsável do grupo recebe aviso no
-- WhatsApp (no Bubble era o e-mail "Novo caso"). Paciente da região não gera aviso.
--
-- `casos.cidade`/`uf` são texto livre e vêm com erro de digitação ("Coritiba", "Pr.", "sjp"),
-- então `cidade_na_regiao_curitiba` normaliza, procura o nome de uma cidade da região dentro do
-- texto, aceita os erros comuns e, por fim, compara por semelhança (pg_trgm). Cidade em branco
-- = não dá para saber: não avisa ainda, e avisa quando a cidade for preenchida.
--
-- O aviso sai uma vez por caso (`gvp_avisado_em`), no cadastro ou na edição que completa
-- hospital/cidade. Só para casos criados a partir desta mudança: os antigos não disparam ao
-- serem editados.

alter table public.casos add column if not exists gvp_avisado_em timestamptz;

comment on column public.casos.gvp_avisado_em is
  'Quando o responsável do grupo do GVP do hospital foi avisado do caso (paciente de fora da região).';

-- true = Curitiba, RMC ou litoral do PR; false = de fora; null = não dá para saber.
create or replace function public.cidade_na_regiao_curitiba(_cidade text, _uf text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  _c text;
  _u text := upper(regexp_replace(coalesce(_uf, ''), '[^A-Za-z]', '', 'g'));
  _regiao text[] := array[
    -- região metropolitana de Curitiba (29 municípios)
    'adrianopolis', 'agudos do sul', 'almirante tamandare', 'araucaria', 'balsa nova',
    'bocaiuva do sul', 'campina grande do sul', 'campo do tenente', 'campo largo', 'campo magro',
    'cerro azul', 'colombo', 'contenda', 'curitiba', 'doutor ulysses', 'fazenda rio grande',
    'itaperucu', 'lapa', 'mandirituba', 'pien', 'pinhais', 'piraquara', 'quatro barras',
    'quitandinha', 'rio branco do sul', 'rio negro', 'sao jose dos pinhais', 'tijucas do sul',
    'tunas do parana',
    -- litoral do Paraná
    'antonina', 'guaraquecaba', 'guaratuba', 'matinhos', 'morretes', 'paranagua',
    'pontal do parana'
  ];
  -- Erros e apelidos vistos nos casos que a semelhança sozinha não pega.
  _apelidos text[] := array[
    'coritiba', 'curtiba', 'curitba', 'cuiritiba', 'cuririba', 'curituba', 'curutiba',
    'maduritiba', 'ctba', 'cwb', 'sjp', 'piraguara', 'pirapuara', 'arucaria', 'colombro',
    'itaperussu', 'mangerituba', 'morreres', 'praia de leste', 'pontal do sul', 'ipanema',
    'shangrila', 'sitio cercado', 'boqueirao', 'cic', 'cidade industrial'
  ];
begin
  -- UF de outro estado decide sozinha (Curitibanos/SC, Rio Negrinho/SC).
  if _u not in ('', 'PR') and _u not like 'PARAN%' then
    return false;
  end if;

  _c := trim(regexp_replace(
    translate(lower(coalesce(_cidade, '')), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn'),
    '[^a-z]+', ' ', 'g'));
  if _c in ('', 'pr', 'parana') then
    return null;
  end if;

  if exists (select 1 from unnest(_regiao) r where ' ' || _c || ' ' like '% ' || r || ' %')
     or _c = any (_apelidos) then
    return true;
  end if;

  -- "sao jose do pinhais", "almirante tamadare", "matinho"…
  return exists (select 1 from unnest(_regiao) r where public.similarity(_c, r) >= 0.6);
end;
$$;

-- O app não grava `gvp_avisado_em`: zerar faria o aviso sair de novo.
create or replace function public.casos_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.status is distinct from old.status
     and coalesce(current_setting('app.status_change', true), '') <> 'on' then
    new.status := old.status;
    new.encerrado_em := old.encerrado_em;
  end if;
  if (new.ajudante_id is distinct from old.ajudante_id
      or new.ajudante_nome is distinct from old.ajudante_nome)
     and coalesce(current_setting('app.ajudante_change', true), '') <> 'on' then
    new.ajudante_id := old.ajudante_id;
    new.ajudante_nome := old.ajudante_nome;
  end if;
  new.gvp_avisado_em := old.gvp_avisado_em;
  new.legacy_bubble_id := old.legacy_bubble_id;
  new.bubble_raw := old.bubble_raw;
  return new;
end;
$$;

-- BEFORE: carimba na mesma linha (sem um segundo UPDATE). Roda depois do `casos_guard_update`
-- (ordem alfabética dos gatilhos). O pg_net só envia se a transação for confirmada.
create or replace function public.casos_aviso_gvp()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  _grupo int;
  _resp uuid;
  _secret text;
begin
  if tg_op = 'INSERT' and auth.uid() is not null then
    new.gvp_avisado_em := null;
  end if;

  if new.gvp_avisado_em is not null
     or new.status <> 'aberto'
     or new.created_at < timestamptz '2026-11-07 00:00:00-03'
     or nullif(trim(new.hospital_nome), '') is null
     or public.cidade_na_regiao_curitiba(new.cidade, new.uf) is distinct from false then
    return new;
  end if;

  select g.numero, gm.membro_id into _grupo, _resp
  from public.hospitais h
  join public.gvp_grupo_hospitais gh on gh.hospital_id = h.id
  join public.gvp_grupos g on g.id = gh.grupo_id
  join public.gvp_grupo_membros gm on gm.grupo_id = g.id and gm.papel = 'responsavel'
  join public.membros m on m.id = gm.membro_id and m.status = 'ativo'
  where lower(trim(h.nome)) = lower(trim(new.hospital_nome))
  limit 1;
  if _resp is null then
    return new;
  end if;

  new.gvp_avisado_em := now();
  -- Quem já é responsável pelo caso não precisa ser avisado dele.
  if _resp is not distinct from new.responsavel_id then
    return new;
  end if;

  select decrypted_secret into _secret
  from vault.decrypted_secrets where name = 'wapi_webhook_secret';

  perform net.http_post(
    url := 'https://srqgkvajsbpagpdrxksq.supabase.co/functions/v1/enviar-wapi',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', _secret),
    body := jsonb_build_object('evento', 'gvp_novo_caso', 'casoId', new.id, 'membroId', _resp,
                               'grupo', _grupo),
    timeout_milliseconds := 30000
  );
  return new;
end;
$$;

revoke execute on function public.casos_aviso_gvp() from public, anon, authenticated;

drop trigger if exists casos_gvp_aviso on public.casos;
create trigger casos_gvp_aviso
  before insert or update of hospital_nome, cidade, uf, status on public.casos
  for each row execute function public.casos_aviso_gvp();
