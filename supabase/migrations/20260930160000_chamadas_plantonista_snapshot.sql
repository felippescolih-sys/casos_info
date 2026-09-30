-- Plantonista gravado na própria chamada, no momento em que ela chega.
--
-- Antes o app cruzava a chamada com `escalas` na hora de exibir. Como as escalas
-- vão ser limpas quando a designação termina, e as chamadas ficam de 48 a 72h,
-- as chamadas de ontem perderiam o plantonista. Aqui a chamada guarda uma foto de
-- quem estava de plantão; corrigir ou apagar a escala depois não muda a chamada.
--
-- Regra do cruzamento (a mesma que o app usava):
--   - escala com início <= início da chamada < fim + 1 min — as escalas terminam
--     às 02:59 UTC e a seguinte começa às 03:00, o 1 min cobre esse buraco;
--   - com escalas sobrepostas, vale a que começou por último.

alter table public.chamadas_plantao
  add column if not exists plantonista_id uuid references public.membros(id) on delete set null,
  add column if not exists plantonista_nome text,
  add column if not exists ajudante_nome text;

create or replace function public.chamadas_plantao_preencher_plantonista()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select e.membro_id, m.nome, a.nome
    into new.plantonista_id, new.plantonista_nome, new.ajudante_nome
  from public.escalas e
  join public.membros m on m.id = e.membro_id
  left join public.membros a on a.id = e.ajudante_id
  where e.inicio <= new.data_hora_inicio
    and e.fim + interval '1 minute' > new.data_hora_inicio
  order by e.inicio desc
  limit 1;
  return new;
end;
$$;

-- Só no INSERT: a foto é tirada quando a chamada chega e não é refeita depois.
drop trigger if exists chamadas_plantao_preencher_plantonista on public.chamadas_plantao;
create trigger chamadas_plantao_preencher_plantonista
  before insert on public.chamadas_plantao
  for each row execute function public.chamadas_plantao_preencher_plantonista();

-- Chamadas que já estavam na tabela.
update public.chamadas_plantao c
set plantonista_id = x.membro_id, plantonista_nome = x.nome, ajudante_nome = x.ajudante
from (
  select distinct on (c2.id) c2.id, e.membro_id, m.nome, a.nome as ajudante
  from public.chamadas_plantao c2
  join public.escalas e
    on e.inicio <= c2.data_hora_inicio and e.fim + interval '1 minute' > c2.data_hora_inicio
  join public.membros m on m.id = e.membro_id
  left join public.membros a on a.id = e.ajudante_id
  order by c2.id, e.inicio desc
) x
where x.id = c.id and c.plantonista_nome is null;
