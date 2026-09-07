-- Milestone 2 — Casos (REG_CASO do Bubble): leitura + importação
--
-- Visibilidade em duas camadas:
--   • linha completa (prontuário): is_admin_geral() OU responsável OU ajudante do caso
--   • resumo (todo membro ativo, todos os casos): view casos_resumo, sem prontuário

create extension if not exists pg_trgm;

create type public.caso_status as enum ('aberto', 'encerrado');

-- ─────────────────────────────────────────────────────────────
create table public.casos (
  id                     uuid primary key default gen_random_uuid(),
  legacy_bubble_id       text unique not null,
  id_caso                text,
  numero                 int,
  status                 public.caso_status not null default 'aberto',

  -- paciente
  paciente_nome          text,
  idade                  text,
  sexo                   text,
  uf                     text,
  cidade                 text,
  congregacao            text,
  batizado               boolean,
  mae_batizada           boolean,
  pai_batizado           boolean,
  nome_mae               text,
  nome_pai               text,

  -- atendimento
  hospital_nome          text,
  num_quarto             text,
  tele_hospital          text,
  plano_nome             text,
  tipo_atendimento       text,          -- particular | plano | publico | null

  -- responsáveis
  responsavel_id         uuid references public.membros (id) on delete set null,
  responsavel_nome       text,
  ajudante_id            uuid references public.membros (id) on delete set null,
  ajudante_nome          text,
  gvp_id                 uuid references public.membros (id) on delete set null,
  criado_por_id          uuid references public.membros (id) on delete set null,

  -- contato
  nome_telefonou         text,
  parentesco_telefonou   text,
  paciente_solicitou_ajuda boolean,
  acompanhante_nome      text,
  telefone_paciente      text,
  telefone_acompanhante  text,
  anciaos_contatados     text,
  anciaos_cont_tel       text,

  -- médico / clínico
  medico_responsavel     text,
  especialidade          text,
  morbidade              text,
  info_medica            text,
  plano_tratamento       text,
  estrategia             text,
  artigos_medicos        text,
  resumo                 text,
  outras_infos           text,

  -- exames
  exames                 jsonb not null default '[]'::jsonb,  -- [{data,hb,ht,plq,outro}]
  anexos_urls            text[] not null default '{}',

  -- transferência
  em_transferencia       boolean,
  transferencia_data     timestamptz,
  transferencia_historico text,
  transpac               boolean,
  transfundido           boolean,

  gvp                    boolean,
  tags                   text[] not null default '{}',

  -- datas de origem
  aberto_em              timestamptz,
  encerrado_em           timestamptz,
  atualizado_em_bubble   timestamptz,

  bubble_raw             jsonb not null,
  imported_at            timestamptz not null default now(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index casos_status_idx        on public.casos (status);
create index casos_responsavel_idx   on public.casos (responsavel_id);
create index casos_ajudante_idx      on public.casos (ajudante_id);
create index casos_aberto_em_idx     on public.casos (aberto_em desc nulls last);
create index casos_id_caso_idx       on public.casos (id_caso);
create index casos_tags_gin          on public.casos using gin (tags);
create index casos_paciente_trgm     on public.casos using gin (paciente_nome gin_trgm_ops);
create index casos_hospital_trgm     on public.casos using gin (hospital_nome gin_trgm_ops);
create index casos_congregacao_trgm  on public.casos using gin (congregacao gin_trgm_ops);

comment on column public.casos.legacy_bubble_id is 'REG_CASO._id do Bubble; chave de idempotência do import';
comment on column public.casos.bubble_raw is 'Registro REG_CASO cru do Bubble (campos vazios são omitidos pela API)';

create trigger casos_set_updated_at
  before update on public.casos
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- RLS: linha completa só para admin geral, responsável ou ajudante
-- ─────────────────────────────────────────────────────────────
alter table public.casos enable row level security;

create policy "casos_select_envolvido"
  on public.casos for select to authenticated
  using (
    public.is_admin_geral()
    or responsavel_id = auth.uid()
    or ajudante_id = auth.uid()
  );

-- sem policy de insert/update/delete: escrita só via service_role (import) no M2

grant select on public.casos to authenticated;

-- ─────────────────────────────────────────────────────────────
-- View de resumo: roda com privilégios do dono (ignora a RLS de casos),
-- expõe só colunas não sensíveis para qualquer membro ativo.
-- ─────────────────────────────────────────────────────────────
create view public.casos_resumo
  with (security_invoker = false)
  as
  select
    id, legacy_bubble_id, id_caso, numero, status,
    paciente_nome, responsavel_id, responsavel_nome, ajudante_id, ajudante_nome,
    hospital_nome, congregacao, cidade, uf,
    aberto_em, encerrado_em, atualizado_em_bubble, tags
  from public.casos;

revoke all on public.casos_resumo from anon;
grant select on public.casos_resumo to authenticated;
