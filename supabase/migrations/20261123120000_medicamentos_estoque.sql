-- Estoque de medicamentos da COLIH: cada lançamento diz qual medicação, a dosagem, a quantidade, com
-- quem ela está guardada, a validade (opcional) e se foi comprada (valor em R$) ou doada.
--
-- Por quê: a coordenação pediu em 23/11/2026 um lugar no sistema para saber que medicamentos a COLIH
-- tem e com quem estão, em vez de controlar em mensagens soltas.
--
-- Quem acessa (combinado com a coordenação em 23/11/2026):
--   • ver e lançar: membros da COLIH (função "colih" em qualquer nível) e superadmin. Voluntários e
--     quem é só de GVP não veem;
--   • quem está com a medicação é sempre um membro da COLIH (o formulário já vem com quem está lançando);
--   • editar, dar baixa e excluir: quem lançou, quem está com a medicação, admin da COLIH e superadmin.
--     Quem está com a medicação pode passá-la a outro membro da COLIH.
--
-- Saída do estoque: "dar baixa" (data, para onde foi e, se quiser, o caso, achado pelo número ou pelo nome
-- do paciente). O lançamento sai da lista do estoque mas fica no histórico.

create table public.medicamentos_estoque (
  id              uuid primary key default gen_random_uuid(),
  medicamento     text not null check (btrim(medicamento) <> ''),
  dosagem         text not null check (btrim(dosagem) <> ''),
  quantidade      integer not null default 1 check (quantidade > 0),
  -- frasco, ampola, caixa, comprimido… (texto livre)
  unidade         text,
  validade        date,
  -- 'compra' tem valor em R$; 'doacao' não tem valor.
  origem          text not null check (origem in ('compra', 'doacao')),
  valor           numeric(10, 2) check (valor >= 0),
  responsavel_id  uuid not null default auth.uid() references public.membros (id) on delete restrict,
  observacoes     text,
  -- Baixa (saída do estoque)
  baixado_em      date,
  baixado_por     uuid references public.membros (id) on delete set null,
  baixa_destino   text,
  -- Número (não o id) do caso: cada membro só lê os casos em que está envolvido, mas a baixa pode ser
  -- para o paciente de um caso de outro membro. O gatilho confere que o número existe.
  baixa_caso_numero integer,
  -- Nome do paciente do caso no momento da baixa (preenchido pelo gatilho), para o histórico mostrar o
  -- nome a quem não enxerga o caso.
  baixa_paciente  text,
  criado_por      uuid references public.membros (id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint medicamentos_estoque_valor_origem check (
    (origem = 'compra' and valor is not null) or (origem = 'doacao' and valor is null)
  )
);

comment on table public.medicamentos_estoque is 'Medicamentos em estoque com membros da COLIH (com histórico de baixas).';
comment on column public.medicamentos_estoque.responsavel_id is 'Membro da COLIH que está com a medicação.';
comment on column public.medicamentos_estoque.valor is 'Valor pago em R$ (total do lançamento). Nulo quando é doação.';

create index medicamentos_estoque_responsavel_idx on public.medicamentos_estoque (responsavel_id);
create index medicamentos_estoque_ativos_idx on public.medicamentos_estoque (medicamento) where baixado_em is null;

create trigger medicamentos_estoque_set_updated_at
  before update on public.medicamentos_estoque
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Permissões
-- ─────────────────────────────────────────────────────────────

-- Um membro qualquer (não o usuário logado) pode guardar medicação? Precisa estar ativo e ser da COLIH
-- (ou superadmin, que conta como COLIH no resto do sistema).
create or replace function public.membro_eh_colih(_membro uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.membros m
    join public.membro_funcoes f on f.membro_id = m.id
    where m.id = _membro
      and m.status = 'ativo'
      and (f.area = 'colih' or (f.area = 'geral' and f.nivel = 'superadmin'))
  );
$$;
revoke execute on function public.membro_eh_colih(uuid) from anon, public;
grant execute on function public.membro_eh_colih(uuid) to authenticated;

-- Admin da COLIH e superadmin mexem em qualquer lançamento.
create or replace function public.gerencia_medicamentos()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_ativo() and (public.is_admin_geral() or public.tem_funcao('colih', 'admin'));
$$;
revoke execute on function public.gerencia_medicamentos() from anon, public;
grant execute on function public.gerencia_medicamentos() to authenticated;

-- Membros que podem estar com a medicação (lista do formulário).
create or replace function public.membros_colih()
returns table (id uuid, nome text)
language sql stable security definer set search_path = '' as $$
  select m.id, m.nome
  from public.membros m
  where public.eh_membro_colih() and public.membro_eh_colih(m.id)
  order by m.nome;
$$;
revoke execute on function public.membros_colih() from anon, public;
grant execute on function public.membros_colih() to authenticated;

-- Busca do caso na baixa, por número ou nome do paciente, em TODOS os casos (combinado com a coordenação
-- em 23/11/2026: a medicação pode ir para o paciente de um caso de outro membro). Para não virar uma
-- consulta geral de pacientes: só membro da COLIH, nome com 3+ letras, no máximo 5 resultados e só
-- número, nome, hospital, data e situação do caso.
create or replace function public.medicamentos_buscar_caso(_termo text)
returns table (numero integer, paciente_nome text, hospital_nome text, aberto_em date, aberto boolean)
language sql stable security definer set search_path = '' as $$
  with t as (select btrim(coalesce(_termo, '')) v)
  select c.numero, c.paciente_nome, c.hospital_nome,
         (c.aberto_em at time zone 'America/Sao_Paulo')::date, c.status = 'aberto'
  from public.casos c, t
  where public.eh_membro_colih()
    and c.numero is not null
    and (
      (t.v ~ '^\d+$' and c.numero = t.v::integer)
      or (
        t.v !~ '^\d+$' and length(t.v) >= 3
        and not exists (
          select 1 from unnest(string_to_array(public.sem_acento(t.v), ' ')) w
          where w <> '' and public.sem_acento(c.paciente_nome) not like '%' || w || '%'
        )
      )
    )
  order by c.status = 'aberto' desc, c.aberto_em desc nulls last
  limit 5;
$$;
revoke execute on function public.medicamentos_buscar_caso(text) from anon, public;
grant execute on function public.medicamentos_buscar_caso(text) to authenticated;

-- Autor, baixa e responsável: o servidor decide, não o navegador.
create or replace function public.medicamentos_estoque_antes()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is not null then
      new.criado_por := auth.uid();
    end if;
  else
    new.criado_por := old.criado_por;
    new.created_at := old.created_at;
  end if;

  if new.responsavel_id is distinct from (case when tg_op = 'UPDATE' then old.responsavel_id end)
     and not public.membro_eh_colih(new.responsavel_id) then
    raise exception 'Quem está com a medicação precisa ser um membro ativo da COLIH.'
      using errcode = '23514';
  end if;

  if new.baixado_em is null or new.baixa_caso_numero is null then
    new.baixa_caso_numero := case when new.baixado_em is null then null else new.baixa_caso_numero end;
    new.baixa_paciente := null;
  elsif new.baixa_caso_numero is distinct from (case when tg_op = 'UPDATE' then old.baixa_caso_numero end) then
    select c.paciente_nome into new.baixa_paciente from public.casos c where c.numero = new.baixa_caso_numero;
    if not found then
      raise exception 'Caso nº % não encontrado. Confira o número ou deixe em branco.', new.baixa_caso_numero
        using errcode = '23503';
    end if;
  else
    new.baixa_paciente := old.baixa_paciente;
  end if;

  if new.baixado_em is null then
    new.baixado_por := null;
    new.baixa_destino := null;
  elsif tg_op = 'INSERT' or old.baixado_em is null then
    new.baixado_por := auth.uid();
  else
    new.baixado_por := old.baixado_por;
  end if;

  return new;
end;
$$;
revoke execute on function public.medicamentos_estoque_antes() from anon, public;

create trigger medicamentos_estoque_antes
  before insert or update on public.medicamentos_estoque
  for each row execute function public.medicamentos_estoque_antes();

alter table public.medicamentos_estoque enable row level security;

create policy "medicamentos_estoque_select" on public.medicamentos_estoque
  for select to authenticated using (public.eh_membro_colih());

create policy "medicamentos_estoque_insert" on public.medicamentos_estoque
  for insert to authenticated with check (public.eh_membro_colih());

create policy "medicamentos_estoque_update" on public.medicamentos_estoque
  for update to authenticated
  using (
    public.eh_membro_colih()
    and (public.gerencia_medicamentos() or criado_por = auth.uid() or responsavel_id = auth.uid())
  )
  -- Sem exigir que continue com ele: quem está com a medicação pode passá-la a outro membro da COLIH
  -- (o gatilho confere que o novo responsável é da COLIH).
  with check (public.eh_membro_colih());

create policy "medicamentos_estoque_delete" on public.medicamentos_estoque
  for delete to authenticated
  using (
    public.eh_membro_colih()
    and (public.gerencia_medicamentos() or criado_por = auth.uid() or responsavel_id = auth.uid())
  );

revoke all on public.medicamentos_estoque from anon;
grant select, insert, update, delete on public.medicamentos_estoque to authenticated;
