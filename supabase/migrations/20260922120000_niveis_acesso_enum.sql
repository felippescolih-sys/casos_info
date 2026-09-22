-- Novos níveis de acesso (modelo de papéis da COLIH):
--   superadmin → área 'geral' (presidência/secretaria e seus ajudantes): acesso total.
--   usuario    → associação de base numa área (ex.: "Membro COLIH", "Membro GVP"),
--                 sem privilégio de admin naquela área.
-- Precisa ser um arquivo separado das funções/policies que os usam: Postgres não
-- deixa usar um valor de enum recém-criado na mesma transação.
alter type public.funcao_nivel add value if not exists 'superadmin';
alter type public.funcao_nivel add value if not exists 'usuario';
