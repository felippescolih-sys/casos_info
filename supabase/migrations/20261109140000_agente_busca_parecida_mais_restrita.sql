-- Agente de WhatsApp: a busca de paciente parecido (20261109120000) trazia gente que só tinha o sobrenome em comum.
--
-- Por quê: no teste de 09/11, "Carolini Gonçalves" devolveu 5 pacientes de outros membros só por terem "Gonçalves"
-- (word_similarity alto pelo sobrenome). Além de confundir, mostrava nomes de pacientes sem motivo.
-- Agora o primeiro nome precisa ser parecido (similarity >= 0.4) e, além disso, o nome inteiro (>= 0.35) ou um trecho
-- dele (word_similarity >= 0.45). "Luis Alburgeti" continua achando "Luiz Alburguetti"; "Maria Gonçalves" não traz
-- mais "Carolini Gonçalves". Troca de letra no começo do nome (Karoline/Carolini) fica de fora: o agente diz que não
-- achou e o voluntário pode buscar pelo sobrenome.

create or replace function public.agente_buscar_caso(_membro uuid, _nome text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  _q text := public.sem_acento(trim(coalesce(_nome, '')));
  _r jsonb;
begin
  perform public.agente_agir_como(_membro);
  if length(_q) < 2 then
    return jsonb_build_object('erro', 'nome_invalido', 'mensagem', 'É necessário informar ao menos parte do nome do paciente para buscar.');
  end if;

  select jsonb_agg(public.agente_caso_json(c, public.pode_operar_caso(c.id)) order by c.status, c.aberto_em desc)
  into _r
  from (select * from public.casos c
        where public.sem_acento(c.paciente_nome) like '%' || _q || '%'
        order by c.status, c.aberto_em desc limit 15) c;
  if _r is not null then return _r; end if;

  -- Nada com esse trecho: casos abertos com nome parecido (grafia diferente), nunca só pelo sobrenome.
  return coalesce((
    select jsonb_agg(public.agente_caso_json(s.c, public.pode_operar_caso((s.c).id)) || jsonb_build_object('semelhante', true)
                     order by s.sim desc)
    from (select * from (
            select c,
                   public.similarity(public.sem_acento(c.paciente_nome), _q) sim,
                   public.word_similarity(_q, public.sem_acento(c.paciente_nome)) ws,
                   public.similarity(split_part(public.sem_acento(c.paciente_nome), ' ', 1), split_part(_q, ' ', 1)) prim
            from public.casos c
            where c.status = 'aberto') t
          where t.prim >= 0.4 and (t.sim >= 0.35 or t.ws >= 0.45)
          order by t.sim desc
          limit 5) s
  ), '[]'::jsonb);
end $$;

revoke execute on function public.agente_buscar_caso(uuid, text) from public, anon, authenticated;
grant execute on function public.agente_buscar_caso(uuid, text) to service_role;
