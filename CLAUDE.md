# Casos Info

App da COLIH para registrar e acompanhar casos (hospitais, médicos, plantões e escalas da equipe), migrado do app
Bubble "registrocasos" para React + Supabase. A documentação do Bubble está em
`registrocasos-documentacao-completa-2026-08-29.md`; o que falta fazer, em `docs/roadmap.md`.

## Arquitetura

- **Front** (`src/`): React 19 + Vite + TypeScript + Tailwind 4 + React Router 7, com TanStack Query (`src/lib/queries/`
  , uma por assunto), react-hook-form e zod. Componentes base em `src/components/ui/` (`Button`, `Modal`, `Field`,
  `Input`, `ConfirmDialog`, `Alert`…). Alias `@/` para `src/`. Deploy no Cloudflare (`wrangler.jsonc`, saída `dist`).
- **Banco** (`supabase/migrations/`, projeto `srqgkvajsbpagpdrxksq`): Postgres do Supabase com RLS. Membros têm
  `status` (`pendente`/`ativo`/`inativo`) e funções por área (`membro_funcoes`: `geral`, `apresentacoes`, `gvps`,
  `especialidades`, `facilitadores`, `medicos`; nível `admin` ou `ajudante`). Quem tem função em `geral` gerencia
  membros; só o `admin` de `geral` mexe nas funções dos outros.
- **Edge Functions** (`supabase/functions/`, Deno): WhatsApp pelo WAHA (sessão `colih`): `whatsapp-entrada` recebe e
  repassa ao agente do n8n (workflow `Agente_CasosInfo`, na mesma VPS da Livih), `whatsapp-enviar`, `whatsapp-sessao`
  (conexão, só superadmin), `agente-midia` (áudio transcrito e arquivos anexados ao caso). `verify_jwt = false` e
  autenticação dentro da função.
- **Scripts** (`scripts/`): importação do Bubble (`tsx`, idempotentes pelo `legacy_bubble_id`), `make-admin.ts` e os
  testes SQL.

## Comandos

| Para | Comando |
|---|---|
| Rodar | `npm run dev` |
| Tipos e lint | `npm run typecheck` e `npm run lint` |
| Gerar os tipos do banco | `npm run gen:types` (gera `src/types/database.ts`, não editar à mão) |
| Consultar produção | `python scripts/consulta_ro.py "select …"`: só leitura (transação `read only`, um comando, só `select`/`with`/`explain`/`show`) |
| Dar função a alguém | `npm run make:admin -- <email> [área] [admin\|ajudante]` |

## Banco e publicação (atenção)

- **Push na `main` aplica as migrations no banco de produção sozinho** (integração GitHub do Supabase). Então `git
  push` é uma mudança no banco: só com a aprovação do usuário, e só depois de testar. Acompanhe em Dashboard →
  Integrations → GitHub ou no check do commit. Se a integração falhar: `npm run db:push`.
- Migration nova em `supabase/migrations/` com comentário no topo dizendo o porquê; nunca editar migration já
  publicada (faça outra). Funções `security definer` com `set search_path = ''`, nomes com `public.`, `revoke` de
  `public`/`anon` e conferência de função/área dentro da função.
- Testes SQL em `scripts/*_teste.sql`: rodam em `begin … rollback` e precisam de um cliente que aceite vários comandos
  (psql ou psycopg; `supabase db query --db-url` recusa). Aviso: o rollback não volta sequências (ex.: um número de
  caso fica pulado).
- Depois de aplicar: `npm run gen:types` e salvar `src/types/database.ts`.
- n8n e WAHA estão na VPS de produção: mexer lá só com aprovação.

## Convenções

- Código em inglês nos nomes de componentes e páginas (`LoginPage`, `MembersPage`) e português nas regras de negócio
  e nos textos; siga o arquivo que está editando. TypeScript com aspas simples e ponto e vírgula.
- Datas e horários no fuso de Brasília (já houve erro de disponibilidade por fuso).
- Textos de tela em português claro; mensagens de erro dizem o que fazer.
- Commits no padrão `feat: …`, `fix: …`, `refactor: …`, em português e minúsculas, dizendo o efeito para quem usa.
- `git add <arquivos>`, nunca `-A`.

## Segurança

- Nunca versionar nem mostrar: `.env.local`, `.env.import` (tokens do Bubble, `service_role` e
  `SUPABASE_DB_PASSWORD`). Os scripts de importação usam a `service_role` e ignoram a RLS: rodar só com o usuário
  sabendo.
- Os dados são de pessoas (pacientes, médicos, membros): consultas e prints só o necessário, sem copiar dados pessoais
  para fora do projeto.
