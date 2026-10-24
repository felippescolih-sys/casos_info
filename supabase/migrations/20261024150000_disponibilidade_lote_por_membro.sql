-- `disponibilidade_plantao_lote` devolvia uma linha por membro × turno. O PostgREST
-- corta respostas em 1000 linhas (max_rows do projeto), e 17 membros × 60 dias já
-- passa disso: as linhas cortadas chegavam ao front como "indisponível" e o rodízio
-- tirava gente da escala sem motivo (o Gean ficou fora de 02/12 a 31/12 no lote
-- de 24/10). Agora é uma linha por membro, com a disponibilidade de cada turno num
-- array na mesma ordem de `_inicios` — dezenas de linhas, longe do limite.
--
-- Mudar o tipo de retorno exige drop; o front novo e esta migration sobem juntos.

drop function public.disponibilidade_plantao_lote(uuid[], timestamptz[], timestamptz[]);

create function public.disponibilidade_plantao_lote(
  _membros uuid[], _inicios timestamptz[], _fins timestamptz[]
)
returns table (membro_id uuid, disponivel boolean[])
language plpgsql stable security definer set search_path = public as $$
begin
  -- Expõe ausências de terceiros (de forma indireta): só para quem monta a escala.
  if not public.gerencia_escalas() then
    raise exception 'Sem permissão para gerar escalas.';
  end if;
  if coalesce(array_length(_inicios, 1), 0) <> coalesce(array_length(_fins, 1), 0) then
    raise exception 'Listas de início e fim com tamanhos diferentes.';
  end if;

  return query
    select m.id,
           array(
             select public.membro_disponivel_plantao(m.id, _inicios[t.i], _fins[t.i])
             from generate_subscripts(_inicios, 1) as t(i)
             order by t.i
           )
    from unnest(_membros) as m(id);
end;
$$;

revoke execute on function public.disponibilidade_plantao_lote(uuid[], timestamptz[], timestamptz[])
  from anon, public;
grant execute on function public.disponibilidade_plantao_lote(uuid[], timestamptz[], timestamptz[])
  to authenticated;
