-- Transferir um médico prospectivo (`medicos_geral`) para colaborador (`medicos`).
--
-- Numa função só para ser atômico: cria o colaborador e apaga o prospectivo na
-- mesma transação — não fica médico duplicado nem perdido se algo falhar no meio.
--
-- `security invoker`: quem pode é o mesmo grupo que já escreve nas duas tabelas
-- pela RLS (`admin_de_area('medicos')` = SuperAdmin, admin ou ajudante da área
-- Médicos). A checagem explícita abaixo só troca o erro genérico de RLS por uma
-- mensagem clara.
--
-- O resto do cadastro (telefones, endereço, atendimento...) o usuário completa no
-- formulário de colaborador, que o app abre logo em seguida.

create or replace function public.promover_medico_geral(_id uuid)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  _mg public.medicos_geral;
  _novo uuid;
begin
  if not public.admin_de_area('medicos') then
    raise exception 'Sem permissão para transferir médicos.';
  end if;

  select * into _mg from public.medicos_geral where id = _id;
  if not found then
    raise exception 'Médico prospectivo não encontrado.';
  end if;

  if exists (
    select 1 from public.medicos
    where lower(trim(nome)) = lower(trim(_mg.nome))
  ) then
    raise exception 'Já existe um colaborador chamado "%".', _mg.nome;
  end if;

  insert into public.medicos (nome, crm_uf, especialidade_id, infos_add, ativo)
  values (_mg.nome, _mg.crm_uf, _mg.especialidade_id, _mg.observacoes, true)
  returning id into _novo;

  delete from public.medicos_geral where id = _id;

  return _novo;
end;
$$;

revoke execute on function public.promover_medico_geral(uuid) from anon, public;
grant execute on function public.promover_medico_geral(uuid) to authenticated;
