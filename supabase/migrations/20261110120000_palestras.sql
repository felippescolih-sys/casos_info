-- Palestras (área Apresentações): registro de cada apresentação feita pela COLIH, com os campos do
-- formulário oficial HLC-33 ("Apresentação realizada pela Comissão de Ligação com Hospitais"),
-- que o sistema gera em PDF a partir deste registro (src/lib/hlc33Pdf.ts).
--
-- Por quê: no Bubble essas informações ficavam em tabelas soltas (novapalestra, palestraevento) que a
-- API não libera, e o HLC-33 era preenchido à mão. Agora a palestra fica no sistema e o PDF sai pronto.
--
-- Quem acessa (combinado com a coordenação em 10/11/2026): a área é da função "apresentacoes".
--   • ver: quem tem a função (qualquer nível) e o superadmin;
--   • cadastrar/editar: admin e ajudante da área e superadmin; o membro com a função também registra e
--     edita as palestras em que ele é o "Membro da Colih" do formulário (quem fez a palestra);
--   • excluir: admin e ajudante da área e superadmin.

create table public.palestras (
  id                          uuid primary key default gen_random_uuid(),
  -- Parte 1
  finalidade                  text not null default 'nova' check (finalidade in ('nova', 'atualizacao')),
  presencial                  boolean not null default false,
  online                      boolean not null default false,
  powerpoint                  boolean not null default false,
  display_exposicao           boolean not null default false,
  observacoes                 text,
  -- Parte 2
  data_apresentacao           date not null,
  qtd_participantes           integer check (qtd_participantes >= 0),
  -- Opção da lista fixa do HLC-33 (em inglês no formulário oficial, ex.: 'Oncology', 'Other').
  especialidade_participantes text,
  evento                      text,
  coordenador_nome            text,
  -- Uma informação por linha (o formulário tem duas linhas: telefone e e-mail, por exemplo).
  coordenador_contato         text,
  site                        text,
  local_nome                  text,
  endereco                    text,
  endereco_complemento        text,
  cidade                      text,
  uf                          text,
  cep                         text,
  pais                        text not null default 'Brasil',
  problemas                   text,
  experiencias                text,
  -- Parte 3
  nome_colih                  text not null default 'Colih de Curitiba',
  membro_id                   uuid references public.membros (id) on delete set null,
  data_formulario             date not null default (now() at time zone 'America/Sao_Paulo')::date,
  criado_por                  uuid references public.membros (id) on delete set null default auth.uid(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

comment on table public.palestras is 'Apresentações feitas pela COLIH (formulário HLC-33).';
comment on column public.palestras.membro_id is 'Membro da Colih que fez a apresentação (Parte 3 do HLC-33).';

create index palestras_data_idx on public.palestras (data_apresentacao desc);
create index palestras_membro_idx on public.palestras (membro_id);

create trigger palestras_set_updated_at
  before update on public.palestras
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Quem gerencia: admin ou ajudante da área Apresentações, ou superadmin.
-- ─────────────────────────────────────────────────────────────
create or replace function public.gerencia_palestras()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin_geral()
      or public.tem_funcao('apresentacoes', 'admin')
      or public.tem_funcao('apresentacoes', 'ajudante');
$$;
revoke execute on function public.gerencia_palestras() from anon, public;
grant execute on function public.gerencia_palestras() to authenticated;

create or replace function public.ve_palestras()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_ativo() and (public.is_admin_geral() or public.tem_funcao('apresentacoes'));
$$;
revoke execute on function public.ve_palestras() from anon, public;
grant execute on function public.ve_palestras() to authenticated;

alter table public.palestras enable row level security;

create policy "palestras_select" on public.palestras
  for select to authenticated using (public.ve_palestras());

create policy "palestras_insert" on public.palestras
  for insert to authenticated
  with check (public.gerencia_palestras() or (public.ve_palestras() and membro_id = auth.uid()));

create policy "palestras_update" on public.palestras
  for update to authenticated
  using (public.gerencia_palestras() or (public.ve_palestras() and membro_id = auth.uid()))
  with check (public.gerencia_palestras() or (public.ve_palestras() and membro_id = auth.uid()));

create policy "palestras_delete" on public.palestras
  for delete to authenticated using (public.gerencia_palestras());
