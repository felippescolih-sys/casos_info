-- Reclassifica os casos que no Bubble eram "TMO" (tinham sido mapeados para onco_hemato).
update public.casos
set area_especialidade = 'tmo'
where lower(trim(bubble_raw->>'Info_add_Espec')) = 'tmo';
