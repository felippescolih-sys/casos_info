-- Rastreio de origem pra importar/ressincronizar a escala de plantão do Bubble
-- (data type `plantao`) de forma idempotente, igual já existe em membros/casos/hospitais.

alter table public.escalas add column legacy_bubble_id text unique;
