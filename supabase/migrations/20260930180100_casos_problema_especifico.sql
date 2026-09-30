-- "Problema específico" e "Morbidade" viram campos separados.
--
-- Até aqui os dois campos do formulário gravavam na mesma coluna (`morbidade`),
-- então digitar num copiava para o outro. Morbidade é o rótulo curto (usado nas
-- listas e no painel); o problema específico é a descrição do diagnóstico da
-- planilha HLC-7.
--
-- Os casos existentes ficam com o texto em `morbidade`, que é de onde ele veio
-- (`Info_add_Morbidade` do Bubble — lá era um campo só). `problema_especifico`
-- começa vazio.

alter table public.casos add column if not exists problema_especifico text;
