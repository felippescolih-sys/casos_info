-- Milestone 3.1 — Campos do HLC-7 (Planilha de Emergência Médica) que faltavam como coluna.
-- Todos já existem no bubble_raw; aqui viram colunas tipadas + backfill dos casos importados.

alter table public.casos
  add column data_hora_contato               text,
  add column contato_telefonou               text,
  add column comentario_plano                text,
  add column comentario_familia              text,
  add column boa_condicao_espiritual         boolean,
  add column cartao_diretivas_ok             boolean,

  add column rn_peso                          text,
  add column rn_idade_gestacional            text,
  add column rn_data_nascimento              text,
  add column rn_apgar_nascimento             text,
  add column rn_apgar_5min                   text,

  add column outro_medico                     text,
  add column outro_medico_especialidade      text,

  add column equipe_informada                boolean,
  add column equipe_coopera                  boolean,
  add column medico_disposto_cooperar        boolean,

  add column medico_consultor_nome           text,
  add column medico_consultor_contato        text,
  add column medico_consultor_especialidade  text,
  add column medico_consultor_outras         text,

  add column transf_procedimentos_confirmados boolean,
  add column transf_hid_informado            boolean,
  add column transf_hospital_destino         text,
  add column transf_medico_destino           text,
  add column transf_telefone_destino         text,

  add column anciaos_acompanhamento          boolean;

-- ── backfill a partir do bubble_raw ─────────────────────────────
update public.casos set
  data_hora_contato              = nullif(bubble_raw->>'Dat_Ho_Contato', ''),
  contato_telefonou             = nullif(bubble_raw->>'Cont_q_telef', ''),
  comentario_plano              = nullif(bubble_raw->>'Info_add_Espec', ''),
  comentario_familia            = nullif(bubble_raw->>'Com_cond_esp_fami', ''),
  boa_condicao_espiritual       = (bubble_raw->>'Boa_cond_esp')::boolean,
  cartao_diretivas_ok           = (bubble_raw->>'Cartao_diret_ok')::boolean,

  rn_peso                       = nullif(bubble_raw->>'RN_peso', ''),
  rn_idade_gestacional          = nullif(bubble_raw->>'RN_semanas', ''),
  rn_data_nascimento            = nullif(bubble_raw->>'RN_data_nasc', ''),
  rn_apgar_nascimento           = nullif(bubble_raw->>'RN_APGAR_nasc', ''),
  rn_apgar_5min                 = nullif(bubble_raw->>'RN_APGAR_5min', ''),

  outro_medico                  = nullif(bubble_raw->>'Outro_Med', ''),
  outro_medico_especialidade    = nullif(bubble_raw->>'Outro_med_espe', ''),

  equipe_informada              = (bubble_raw->>'Eq_info')::boolean,
  equipe_coopera                = (bubble_raw->>'Eq_coop')::boolean,
  medico_disposto_cooperar      = (bubble_raw->>'Med_disp_coop')::boolean,

  medico_consultor_nome         = nullif(bubble_raw->>'Med_Cons_Nome', ''),
  medico_consultor_contato      = nullif(bubble_raw->>'Med_Cons_Ctto', ''),
  medico_consultor_especialidade= nullif(bubble_raw->>'Med_Cons_Espec', ''),
  medico_consultor_outras       = nullif(bubble_raw->>'Med_Cons_outras', ''),

  transf_procedimentos_confirmados = (bubble_raw->>'Nec_Transf_Proc')::boolean,
  transf_hid_informado          = (bubble_raw->>'Nec_Transf_Colih Info')::boolean,
  transf_hospital_destino       = nullif(bubble_raw->>'Nec_Transf_Hosp', ''),
  transf_medico_destino         = nullif(bubble_raw->>'Nec_Transf_Medico', ''),
  transf_telefone_destino       = nullif(bubble_raw->>'Nec_Transf_Tele', ''),

  anciaos_acompanhamento        = (bubble_raw->>'Res_Anciaos_cont')::boolean
where bubble_raw <> '{}'::jsonb;
