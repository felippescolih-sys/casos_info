-- listMembrosColihAtivos() lia membro_funcoes direto, mas a RLS de lá só libera a própria
-- linha ou pra gestor (funcoes_select_own / funcoes_select_gestor) — um membro comum abrindo
-- o picker de escala via qualquer membro ativo (não-gestor) ficava sem ver ninguém. RPC
-- estreita: devolve só id+nome de quem tem a função, sem abrir a tabela de funções inteira.

create or replace function public.membros_por_area(_area public.area)
returns table (id uuid, nome text)
language sql stable security definer set search_path = public as $$
  select m.id, m.nome
  from public.membros m
  join public.membro_funcoes f on f.membro_id = m.id
  where f.area = _area and m.status = 'ativo'
  order by m.nome;
$$;

revoke execute on function public.membros_por_area(public.area) from anon, public;
grant execute on function public.membros_por_area(public.area) to authenticated;
