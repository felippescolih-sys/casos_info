# Casos Info

Migração do app Bubble **registrocasos** para React + Supabase, feita por milestones.

- **Stack:** React 19 · Vite · TypeScript · Tailwind v4 · React Router v7 · Supabase · Cloudflare Pages
- **Milestone atual:** autenticação + cadastro de membros (auto-cadastro com aprovação).

### Funções

Cada membro tem `status` (`pendente` / `ativo` / `inativo`) e zero ou mais **funções por área**
(tabela `membro_funcoes`), com nível `admin` ou `ajudante`. Áreas:

| Área | Slug |
|---|---|
| Administração geral (presidência/secretaria) | `geral` |
| Apresentações | `apresentacoes` |
| GVPs | `gvps` |
| Especialidades | `especialidades` |
| Facilitadores | `facilitadores` |
| Lista de médicos | `medicos` |

Quem tem qualquer função na área `geral` gerencia e aprova membros. Só o `admin` da área `geral`
atribui/edita funções de outros.
- Documentação do Bubble: [`registrocasos-documentacao-completa-2026-08-29.md`](./registrocasos-documentacao-completa-2026-08-29.md)

## Pré-requisitos

Node 20+. Não precisa de Docker — o Supabase roda **na nuvem**. As migrations sobem sozinhas pela
**integração GitHub do Supabase** ao dar push na branch de produção (`main`).

## Setup

### 1. Projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. `Settings → API`: copie a **Project URL**, a **anon key** e a **service_role key**.
3. Preencha `supabase/config.toml` (`project_id`, `additional_redirect_urls`).

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local              # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
cp .env.import.example .env.import      # tokens de Bubble + service_role (só p/ scripts locais)
```

`.env.local` e `.env.import` estão no `.gitignore` — nunca commite.

### 3. Schema

As migrations em `supabase/migrations/` são aplicadas automaticamente pela integração GitHub do
Supabase quando há push na `main`. Acompanhe em **Dashboard → Integrations → GitHub** (ou no check
do commit no GitHub).

```bash
npm install
npx supabase login
npx supabase link --project-ref srqgkvajsbpagpdrxksq
npm run gen:types        # regenera src/types/database.ts a partir do banco real
```

Fallback manual (se a integração falhar): `npm run db:push`, ou cole o SQL da migration mais recente
no **SQL Editor** do dashboard.

### 4. Rodar

```bash
npm run dev              # http://localhost:5173
```

### 5. Primeiro admin

1. Cadastre-se em `/signup`.
2. Dê a função de admin geral (usa a service_role key, ignora RLS):

```bash
npm run make:admin -- seu-email@exemplo.com            # geral / admin
npm run make:admin -- fulano@exemplo.com gvps ajudante # outra área/nível
```

3. Faça login — agora você vê **Membros** e **Aprovações**.

## Importar membros do Bubble

```bash
npm run import:membros -- --dry-run     # lista o mapeamento e os valores de `nivelacesso`
# ajuste mapFuncao() em scripts/import-bubble-members.ts (nivelacesso → área/nível)
npm run import:membros                  # cria as contas (status = ativo)
npm run import:membros -- --send-invites
```

Idempotente: re-rodar não duplica (chave `legacy_bubble_id` / e-mail).

## Deploy (Cloudflare Pages)

| Config | Valor |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Variáveis | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

`public/_redirects` já cobre o fallback de SPA. No Supabase, adicione a URL de produção em
**Authentication → URL Configuration** (Site URL + Redirect URLs, incluindo `/redefinir-senha`).

## Scripts

| Comando | O quê |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | typecheck + build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | só o TypeScript |
| `npm run db:push` | aplica migrations no projeto linkado |
| `npm run gen:types` | regenera os tipos do banco |
| `npm run make:admin -- <email> [área] [admin\|ajudante]` | dá função a um membro |
| `npm run import:membros` | importa membros do Bubble |
