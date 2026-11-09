-- Agente de WhatsApp: TMO passa a ser gravado como TMO.
--
-- Por quê: agente_area_de_texto (20261006120000) convertia "TMO" em onco_hemato, de quando TMO não era área própria.
-- Hoje o enum area_especialidade tem 'tmo', com membros cadastrados, e o agente oferece "6 - TMO" no menu; os casos
-- escolhidos assim iam parar em Onco-Hemato. agente_area_label também não tinha TMO, então o agente via esses casos
-- sem especialidade. Casos já gravados como Onco-Hemato pelo agente não são mexidos (não dá para saber quais eram TMO).

create or replace function public.agente_area_label(_a public.area_especialidade)
returns text language sql immutable set search_path = '' as $$
  select case _a
    when 'plantao' then 'Plantão' when 'ad_hepato_uro' then 'AD-Hepato-Uro' when 'onco_hemato' then 'Onco-Hemato'
    when 'orto_neuro' then 'Orto-Neuro' when 'cardio_torax' then 'Cardio-Tórax' when 'geoneo' then 'GO-Neo'
    when 'tmo' then 'TMO' end;
$$;

create or replace function public.agente_area_de_texto(_t text)
returns public.area_especialidade language sql immutable set search_path = '' as $$
  select case regexp_replace(public.sem_acento(_t), '[^a-z]', '', 'g')
    when 'plantao' then 'plantao' when 'adhepatouro' then 'ad_hepato_uro' when 'oncohemato' then 'onco_hemato'
    when 'tmo' then 'tmo' when 'ortoneuro' then 'orto_neuro' when 'cardiotorax' then 'cardio_torax'
    when 'goneo' then 'geoneo' when 'geoneo' then 'geoneo' end::public.area_especialidade;
$$;
