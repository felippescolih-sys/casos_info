# AGENTS.md

<!-- handoff:learnings:begin -->
## Session Learnings (auto-updated by handoff)

### Implicit Rules
- enviar-wapi is legacy name; sends via WAHA on VPS (session colih); w-api gone since 08/10/2026; vault secret wapi_webhook_secret is just DB→function auth
- Push to main auto-applies migrations and deploys edge functions; push only with user approval
- Rolled-back prod tests need explicit user approval each time; runner teste_migration.py in scratchpad (args: root, migration path, test path)
- Read-only prod queries: python scripts/consulta_ro.py
- supabase functions list works via npx (CLI logged in)

### Key Decisions
- Decision: region = Curitiba + official 29 RMC municipalities + 7 litoral PR — Reason: user confirmed official list
- Decision: free-text city normalized (lowercase, accents stripped), region if list name contained as whole word, typo alias list, or pg_trgm similarity >= 0.6 — Reason: data messy; trigram alone misclassified Curitibanos/SC, Florianopolis, Rio Negrinho
- Decision: UF other than PR = outside regardless of city; blank city = unknown, notice waits until filled — Reason: avoid wrong notices
- Decision: once per case via casos.gvp_avisado_em stamped in BEFORE insert/update-of trigger (runs after casos_guard_update alphabetically; guard keeps stamp from app edits) — Reason: no second UPDATE, no duplicate messages, pg_net rolled back with txn
- Decision: only cases created >= 2026-11-07 -03 — Reason: editing old cases must not spam
- Decision: skip send (but stamp) when group responsible is case responsible — Reason: already knows
- Decision: hospital matched by lower(trim(hospitais.nome)) = casos.hospital_nome — Reason: form combobox picks from hospitais list

<!-- handoff:learnings:end -->
