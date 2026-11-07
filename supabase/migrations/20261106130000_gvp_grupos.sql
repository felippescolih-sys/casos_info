-- Grupos do GVP: cada grupo tem um número, cuida de uma lista de hospitais e tem um membro
-- responsável e os demais como ajudantes. No Bubble eram os tipos `GVPgrupo` e `GVP`; aqui
-- o cadastro é feito no app (a API do Bubble não libera esses tipos).
--
-- Regras combinadas com a coordenação:
--   • cada hospital pertence a um único grupo e cada membro participa de um único grupo
--     (por isso hospital_id e membro_id são a chave das tabelas de ligação);
--   • um responsável por grupo;
--   • todo membro ativo consulta; criar e editar é do admin da área GVPs e do superadmin;
--   • quem entra num grupo passa a ter a função "usuario" na área gvps ("Membro GVP"), se
--     ainda não tiver nenhuma ali. Sair do grupo não tira a função: ela pode ter sido dada
--     por outro motivo, e quem gerencia membros ajusta na tela de membros.
--
-- A escrita passa por `salvar_gvp_grupo`, que grava o grupo inteiro numa transação e
-- recusa com o nome do grupo quando o hospital ou o membro já estão em outro.

create table public.gvp_grupos (
  id          uuid primary key default gen_random_uuid(),
  numero      int not null unique check (numero > 0),
  nome        text,
  observacoes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger gvp_grupos_set_updated_at
  before update on public.gvp_grupos
  for each row execute function public.set_updated_at();

create table public.gvp_grupo_hospitais (
  hospital_id uuid primary key references public.hospitais (id) on delete cascade,
  grupo_id    uuid not null references public.gvp_grupos (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index gvp_grupo_hospitais_grupo_idx on public.gvp_grupo_hospitais (grupo_id);

create table public.gvp_grupo_membros (
  membro_id  uuid primary key references public.membros (id) on delete cascade,
  grupo_id   uuid not null references public.gvp_grupos (id) on delete cascade,
  papel      text not null check (papel in ('responsavel', 'ajudante')),
  created_at timestamptz not null default now()
);
create index gvp_grupo_membros_grupo_idx on public.gvp_grupo_membros (grupo_id);
create unique index gvp_grupo_um_responsavel on public.gvp_grupo_membros (grupo_id)
  where papel = 'responsavel';

-- ─────────────────────────────────────────────────────────────
-- Quem gerencia: admin da área GVPs ou superadmin (o ajudante da área não).
-- ─────────────────────────────────────────────────────────────
create or replace function public.gerencia_gvp()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin_geral() or public.tem_funcao('gvps', 'admin');
$$;
revoke execute on function public.gerencia_gvp() from anon, public;
grant execute on function public.gerencia_gvp() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS: leitura para membro ativo; escrita direta só para quem gerencia (excluir grupo).
-- ─────────────────────────────────────────────────────────────
alter table public.gvp_grupos enable row level security;
alter table public.gvp_grupo_hospitais enable row level security;
alter table public.gvp_grupo_membros enable row level security;

create policy "gvp_grupos_select" on public.gvp_grupos
  for select to authenticated using (public.is_ativo());
create policy "gvp_grupos_write" on public.gvp_grupos
  for all to authenticated using (public.gerencia_gvp()) with check (public.gerencia_gvp());

create policy "gvp_grupo_hospitais_select" on public.gvp_grupo_hospitais
  for select to authenticated using (public.is_ativo());
create policy "gvp_grupo_hospitais_write" on public.gvp_grupo_hospitais
  for all to authenticated using (public.gerencia_gvp()) with check (public.gerencia_gvp());

create policy "gvp_grupo_membros_select" on public.gvp_grupo_membros
  for select to authenticated using (public.is_ativo());
create policy "gvp_grupo_membros_write" on public.gvp_grupo_membros
  for all to authenticated using (public.gerencia_gvp()) with check (public.gerencia_gvp());

grant select, insert, update, delete on public.gvp_grupos, public.gvp_grupo_hospitais,
  public.gvp_grupo_membros to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Entrou num grupo => "Membro GVP" (função usuario na área gvps), se não tiver função ali.
-- ─────────────────────────────────────────────────────────────
create or replace function public.gvp_membro_funcao()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.membro_funcoes (membro_id, area, nivel, criado_por)
  values (new.membro_id, 'gvps', 'usuario', auth.uid())
  on conflict (membro_id, area) do nothing;
  return new;
end;
$$;

create trigger gvp_grupo_membros_funcao
  after insert or update of membro_id on public.gvp_grupo_membros
  for each row execute function public.gvp_membro_funcao();

-- ─────────────────────────────────────────────────────────────
-- Salvar o grupo inteiro. _id nulo = grupo novo. Devolve o id.
-- ─────────────────────────────────────────────────────────────
create or replace function public.salvar_gvp_grupo(
  _id uuid,
  _numero int,
  _nome text,
  _observacoes text,
  _responsavel uuid,
  _ajudantes uuid[],
  _hospitais uuid[]
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  _grupo uuid := _id;
  _ajud uuid[] := coalesce(_ajudantes, '{}');
  _hosp uuid[] := coalesce(_hospitais, '{}');
  _conflito text;
begin
  if not public.gerencia_gvp() then
    raise exception 'Só o admin da área GVPs ou o superadmin pode alterar os grupos.';
  end if;
  if _numero is null or _numero < 1 then
    raise exception 'Informe o número do grupo (1, 2, 3…).';
  end if;
  if _responsavel is not null and _responsavel = any (_ajud) then
    raise exception 'O responsável não pode estar também entre os ajudantes.';
  end if;
  if exists (select 1 from public.gvp_grupos where numero = _numero and id is distinct from _grupo) then
    raise exception 'Já existe o grupo %. Escolha outro número.', _numero;
  end if;

  select string_agg(m.nome, ', ' order by m.nome) into _conflito
  from public.membros m
  where m.id = any (_ajud || _responsavel) and m.status <> 'ativo';
  if _conflito is not null then
    raise exception 'Membro inativo não entra em grupo: %.', _conflito;
  end if;

  -- Membro ou hospital que já está em OUTRO grupo: recusa dizendo onde está.
  select string_agg(m.nome || ' (grupo ' || g.numero || ')', ', ' order by m.nome) into _conflito
  from public.gvp_grupo_membros gm
  join public.membros m on m.id = gm.membro_id
  join public.gvp_grupos g on g.id = gm.grupo_id
  where gm.membro_id = any (_ajud || _responsavel) and gm.grupo_id is distinct from _grupo;
  if _conflito is not null then
    raise exception 'Já estão em outro grupo: %. Tire do outro grupo antes.', _conflito;
  end if;

  select string_agg(h.nome || ' (grupo ' || g.numero || ')', ', ' order by h.nome) into _conflito
  from public.gvp_grupo_hospitais gh
  join public.hospitais h on h.id = gh.hospital_id
  join public.gvp_grupos g on g.id = gh.grupo_id
  where gh.hospital_id = any (_hosp) and gh.grupo_id is distinct from _grupo;
  if _conflito is not null then
    raise exception 'Hospitais que já são de outro grupo: %. Tire do outro grupo antes.', _conflito;
  end if;

  if _grupo is null then
    insert into public.gvp_grupos (numero, nome, observacoes)
    values (_numero, nullif(trim(_nome), ''), nullif(trim(_observacoes), ''))
    returning id into _grupo;
  else
    update public.gvp_grupos
    set numero = _numero, nome = nullif(trim(_nome), ''), observacoes = nullif(trim(_observacoes), '')
    where id = _grupo;
    if not found then
      raise exception 'Grupo não encontrado. Recarregue a página.';
    end if;
  end if;

  delete from public.gvp_grupo_membros where grupo_id = _grupo;
  insert into public.gvp_grupo_membros (membro_id, grupo_id, papel)
  select _responsavel, _grupo, 'responsavel' where _responsavel is not null;
  insert into public.gvp_grupo_membros (membro_id, grupo_id, papel)
  select distinct a, _grupo, 'ajudante' from unnest(_ajud) a;

  delete from public.gvp_grupo_hospitais where grupo_id = _grupo;
  insert into public.gvp_grupo_hospitais (hospital_id, grupo_id)
  select distinct h, _grupo from unnest(_hosp) h;

  return _grupo;
end;
$$;

revoke execute on function public.salvar_gvp_grupo(uuid, int, text, text, uuid, uuid[], uuid[])
  from anon, public;
grant execute on function public.salvar_gvp_grupo(uuid, int, text, text, uuid, uuid[], uuid[])
  to authenticated;
