# Documentação do Projeto: registrocasos

*Exportado em: 29/08/2026*

---

# Tabelas de Dados (Data Types)

## GVP

# GVP

## Summary
Este Data Type representa informações sobre Grupos de Voluntários (GVP), contendo detalhes de membros, contatos e funções dentro do grupo.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| obs | text | Não |
| grupo | text | Não |
| e-mail | text | Não |
| função | text | Não |
| telefone | text | Não |
| descricao | text | Não |
| QntdCaso | number | Não |
| ajudante | boolean | Não |
| congregação | text | Não |
| nome membro | text | Não |
| responsavel | boolean | Não |
| hosp atua2 | list.text | Não |
| grupoGVP | custom.gvpgrupo | Não |
| hospital - deleted | custom.hospitais1 | Não |
| UltimoCasoRecebido - deleted | custom.reg_caso | Não |
| hosp_atuacao | REDACTED | Não |

---

## upa

# upa

## Summary
Este Data Type armazena informações de localização e contato, incluindo nome, bairro, cidade, endereço e telefone.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| nome | text | Não |
| bairro | text | Não |
| cidade | text | Não |
| endereço | text | Não |
| telefone | text | Não |

## atas

# atas (Data Type)

## Summary
Este DataType representa as atas de reuniões, permitindo o armazenamento de um nome e do arquivo do documento associado.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| nome | text | Não |
| documento | file | Não |

## caso

# caso (Data Type)

## Summary
Este Data Type representa um caso, contendo informações detalhadas sobre pacientes, médicos, hospitais, e características específicas da condição médica.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| ajdt | text | Não |
| dica | text | Não |
| medico | text | Não |
| membro | text | Não |
| Hospital | text | Não |
| paciente | text | Não |
| descrição | text | Não |
| morbidade | text | Não |
| ajdt email | text | Não |
| exam | list.image | Não |
| num_caso | number | Não |
| batizado | boolean | Não (valor padrão: false) |
| congregacao | text | Não |
| nome_anciao | text | Não |
| transpac | boolean | Não (valor padrão: false) |
| data_fechado | date | Não |
| nome_ctuteis | text | Não |
| tel_anciao | number | Não |
| boacondesp | boolean | Não (valor padrão: false) |
| data_abertura | date | Não |
| e-mail anciao | text | Não |
| especialidade | text | Não |
| tel_contuteis | text | Não |
| ajudante email | user | Não |
| diretivasok | boolean | Não (valor padrão: false) |
| e-mail compart | text | Não |
| compartilhar | boolean | Não (valor padrão: false) |
| teldestinatario | text | Não |
| telefone_anciao | text | Não |
| transfundido | boolean | Não (valor padrão: false) |
| compartilhadocom | text | Não |
| Tags | REDACTED | Não |
| check_condicao | boolean | Não (valor padrão: false) |
| ajudante | custom.membros_espec | Não |

## User

# User (Data Type)

## Summary
Este Data Type representa as informações de um usuário no sistema, incluindo dados de contato, acesso e informações específicas de especialidade.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| nome | text | Não |
| itm | boolean | Não |
| telres | text | Não |
| avatar | image | Não |
| reunioes | text | Não |
| ferias | boolean | Não |
| gvp | custom.gvp | Não |
| hospitais | text | Não |
| telesposa | text | Não |
| nomeesposa | text | Não |
| OplayerID2 | text | Não |
| tel_zap | text | Não |
| ult_acesso | date | Não |
| congregaçao | text | Não |
| nivelacesso | text | Não |
| telcomercial | text | Não |
| colih | custom.colih | Não |
| especialidade | text | Não |
| ultimoacesso | list.date | Não |
| id_telegram | custom.plantao | Não |
| tele_id | custom.membros_espec | Não |
| especialidade_N | REDACTED | Não |

## transf_caso

# transf_caso

## Summary
Este Data Type representa informações detalhadas de um caso, incluindo dados do paciente, médico, hospital, descrição, morbidade, congregação e informações de contato de um ancião. Contém campos booleanos para indicar transferência de paciente e transfusão, além de campos para data de abertura, especialidade e tags.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| medico | text | Não |
| membro | text | Não |
| Hospital | text | Não |
| paciente | text | Não |
| descrição | text | Não |
| morbidade | text | Não |
| congregacao | text | Não |
| nome_anciao | text | Não |
| transpac | boolean | Não |
| tel_anciao | number | Não |
| data_abertura | date | Não |
| especialidade | text | Não |
| transfundido | boolean | Não |
| Tags | option set (tags) | Não |
| hospital - deleted | option set (hospitais) | Não |

## colih

# colih (Data Type)

## Summary
Define a estrutura de dados para armazenar informações sobre "colih", contendo um campo para o nome.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| nome | text | Sim |

## avatar

# avatar

## Summary
Define o tipo de dado para armazenar informações de avatar. Possui um campo para a imagem do avatar.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| avatar | image | Não |

## avisos

# avisos (Data Type)

## Summary
Define a estrutura para armazenar avisos, com campos para texto de aviso principal e um segundo aviso.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| aviso | text | Não |
| aviso2 | text | Não |

## fotoGVP

# fotoGVP

## Summary
Data type para armazenar informações de fotos e e-mails relacionados a um GVP. Possui campos para a imagem e o e-mail.

## Campos

| Campo      | Tipo  | Obrigatório |
|------------|-------|-------------|
| foto       | image | Não         |
| e-mail     | text  | Não         |

## funcoes

# Data Type: funcoes

## Summary
Define a estrutura para armazenar informações sobre funções, incluindo o nome e um status de atividade.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| nomeFuncao | text | Não |
| ativo | boolean | Não |

## medicos

# medicos (Data Type)

## Summary
Define a estrutura de dados para armazenar informações sobre médicos, incluindo dados de contato, especialidades e disponibilidade de atendimento.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| nome | text | Não |
| foto | image | Não |
| CRM_UF | text | Não |
| e-mail | text | Não |
| membro | text | Não |
| sus | boolean | Não |
| rating | number | Não |
| infos_add | text | Não |
| nome_secre | text | Não |
| ult_visita | text | Não |
| convenio | boolean | Não |
| revisita | boolean | Não |
| tel_consultorio | text | Não |
| acompanhante | text | Não |
| end_hospital | text | Não |
| medico_tj | boolean | Não |
| pediatria | boolean | Não |
| especialidade - deleted | text | Não |
| particular | boolean | Não |
| Total_Casos | number | Não |
| ultima_visita | date | Não |
| hospitais_atua | text | Não |
| prim visita | boolean | Não |
| tel secretaria | text | Não |
| telemedicina | boolean | Não |
| atend_consult | boolean | Não |
| Subespecialidade | text | Não |
| tel_confidencial | text | Não |
| endereco consulto | text | Não |
| especialidade | custom.especialidade | Não |

## Privacy Roles

### logado (Logged In Users)
- **View All:** Sim
- **Search For:** Sim
- **Auto Binding:** Sim
- **Binding Fields:** rating_number
- **View Attachments:** Sim

### everyone (All Visitors)
- **View All:** Sim
- **Search For:** Sim
- **Auto Binding:** Não
- **View Attachments:** Sim

## plantao

# plantao (Data Type)

## Summary
Este Data Type armazena informações relacionadas a plantões, incluindo datas, contatos e configurações de notificações para diferentes canais.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| data | date | Não |
| COLOR | text | Não |
| e-mail - deleted | text | Não |
| membro | text | Não |
| e-mail | text | Não |
| telefone_zap | text | Não |
| telefone2 | user | Não |
| data_final | date | Não |
| plantaoAjudante | boolean | Não (valor padrão: false) |
| cor | option.membros | Não |
| chat_id telegram | text | Não |
| intervalo | date_range | Não |
| id_tel | option.membros | Não |
| codigo_agdto_whatsantes | text | Não |
| telefoneZapAjudante | text | Não |
| chatIdTelegramAjudante | text | Não |
| codigo_agdto_whatsnoDia | text | Não |
| ajudante | custom.membros_espec | Não |
| codigo_agdto_telegramAntes | text | Não |
| codigo_agdto_telegramNoDia | text | Não |
| codigo_agdto_tel_antes_ajudante | text | Não |
| codigo_agdto_tel_nodia_ajudante | text | Não |
| REDACTED | text | Não |
| REDACTED | text | Não |

## triagem

# triagem (Data Type)

## Summary
Define a estrutura de dados para armazenar informações de triagem, incluindo campos para e-mail, membro, telefone, datas de início e fim, e um intervalo de datas.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| e-mail | text | Não |
| membro | text | Não |
| telefone | text | Não |
| data final | date | Não |
| data inicio | date | Não |
| intervalo | date_range | Não |

## arquivos

# arquivos (Data Type)

## Summary
Este Data Type representa informações sobre arquivos.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| arquivo | file | Não |

## contador

# contador (Data Type)

## Summary
Este Data Type armazena contadores com um tipo textual e um valor numérico total.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| tipo | text | Não |
| total | number | Não |

## GVPgrupo

# GVPgrupo (Data Type)

## Summary
Representa um grupo de GVP (Gestão de Voluntários e Projetos), contendo informações como número, usuário responsável e hospitais associados.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| numero | text | Não |
| userResponsavel | gvp | Não |
| hospitaisNome | list of hospitais | Não |

## medicos copia

# medicos copia

## Summary
Data type para armazenar informações detalhadas sobre médicos, incluindo dados de contato, especialidades, disponibilidade e histórico de visitas.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| nome | text | Não |
| foto | image | Não |
| CRM_UF | text | Não |
| e-mail | text | Não |
| membro | text | Não |
| sus | boolean | Não |
| infos_add | text | Não |
| nome_secre | text | Não |
| ult_visita | text | Não |
| convenio | boolean | Não |
| revisita | boolean | Não |
| tel_consultorio | text | Não |
| acompanhante | text | Não |
| end_hospital | text | Não |
| medico_tj | boolean | Não |
| pediatria | boolean | Não |
| especialidade - deleted | text | Não |
| particular | boolean | Não |
| ultima_visita | date | Não |
| hospitais_atua | text | Não |
| prim visita | boolean | Não |
| tel secretaria | text | Não |
| telemedicina | boolean | Não |
| atend_consult | boolean | Não |
| subespecialidade | text | Não |
| tel_confidencial | text | Não |
| endereco consulto | text | Não |
| especialidade | custom.especialidade | Não |

## medicos2

# medicos2

## Summary
Este Data Type, `medicos2`, está marcado como excluído e não possui mais funcionalidade ativa na aplicação.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| (Nenhum campo listado, pois o Data Type está excluído) |  |  |

## REG_CASO

# REG_CASO

## Summary
Este Data Type representa um registro de caso, contendo informações detalhadas sobre o paciente, o atendimento médico, dados de contato e status do caso.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| UF | text | Não |
| Sexo | text | Não |
| Idade | text | Não |
| cidade | text | Não |
| gvp | boolean | Não |
| status | text | Não |
| Ex_HB_1 | text | Não |
| Ex_HB_2 | text | Não |
| Ex_HB_3 | text | Não |
| Ex_HT_1 | text | Não |
| Ex_HT_2 | text | Não |
| Ex_HT_3 | text | Não |
| id_caso | text | Não |
| RN_peso | text | Não |
| Ex_PLQ_1 | text | Não |
| Ex_PLQ_2 | text | Não |
| Ex_PLQ_3 | text | Não |
| Nome_mae | text | Não |
| Nome_pai | text | Não |
| Med_atend | text | Não |
| membroGVP | user | Não |
| Outro_Med | text | Não |
| Eq_coop | boolean | Não |
| Eq_info | boolean | Não |
| Estrat_opç | text | Não |
| Ex_OUTRO_1 | text | Não |
| Ex_OUTRO_2 | text | Não |
| Ex_OUTRO_3 | text | Não |
| Nome_plano | text | Não |
| Num_quarto | text | Não |
| Res_Resumo | text | Não |
| Art_medicos | text | Não |
| Batizado | boolean | Não |
| Congregacao | text | Não |
| gvpHistAcao | text | Não |
| id_caso | text | Não |
| Cont_q_telef | text | Não |
| Parent_c_pac | text | Não |
| RN_data_nasc | text | Não |
| Em_tranfer | boolean | Não |
| Ex_data_hora1 | text | Não |
| Ex_data_hora2 | text | Não |
| Ex_data_hora3 | text | Não |
| Info_med_caso | text | Não |
| Med_Cons_Ctto | text | Não |
| Med_Cons_Nome | text | Não |
| Membro_ajudte | text | Não |
| Nome_hospital | text | Não |
| Nome_paciente | text | Não |
| number_case | number | Não |
| RN_APGAR_5min | text | Não |
| RN_APGAR_nasc | text | Não |
| Tele_hospital | text | Não |
| Dat_Ho_Contato | text | Não |
| Em_transf_para | text | Não |
| Info_add_Espec | text | Não |
| Med_Cons_Espec | text | Não |
| Membro_respons | text | Não |
| Nome_telefonou | text | Não |
| Outro_med_espe | text | Não |
| Plano_trat_med | text | Não |
| Boa_cond_esp | boolean | Não |
| Espec_med_respo | text | Não |
| Mae_batizada | boolean | Não |
| Med_Cons_outras | text | Não |
| Med_responsavel | text | Não |
| id_Membro_responsb | user | Não |
| Nec_Transf_Hosp | text | Não |
| Nec_Transf_Tele | text | Não |
| Pai_batizado | boolean | Não |
| Anciaos_cont_tel | text | Não |
| cel_membro_respo | text | Não |
| Em_transfer_data | date | Não |
| Med_disp_coop | boolean | Não |
| nomeAcompanhante | text | Não |
| telefonePaciente | text | Não |
| Com_cond_esp_fami | text | Não |
| Data_encerramento | date | Não |
| Em_transfer_email | text | Não |
| Nec_Transf_Medico | text | Não |
| Tipo_atend_pub | boolean | Não |
| Anciaos_contatados | text | Não |
| Cartao_diret_ok | boolean | Não |
| Info_add_Morbidade | text | Não |

## zz_teste

# zz_teste

## Summary
Este DataType armazena informações de teste. Possui um campo para texto.

## Campos

| Campo      | Tipo   | Obrigatório |
|------------|--------|-------------|
| nome       | text   | Não         |

## advogados

# advogados

## Summary
Este Data Type representa informações de advogados, incluindo nome, e-mail, telefone e observações. Atualmente, este Data Type está marcado como deletado.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| obs | text | Não |
| e-mail | text | Não |
| nome adv | text | Não |
| telefone | text | Não |

## Hospitais

# Hospitais

## Summary
Este Data Type era utilizado para armazenar informações sobre hospitais, mas foi marcado como deletado.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| nome\_hosp\_list\_text | list of texts | Não |

## lembretes

# lembretes (Data Type)

## Summary
Define a estrutura de dados para armazenar lembretes, incluindo campos para o título e o texto do lembrete.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| texto | text | Não |
| titulo | text | Não |

## palestras

# palestras

## Summary
Este Data Type representa informações sobre palestras e foi marcado como deletado, indicando que não está mais em uso ativo na aplicação.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| (Nenhum campo listado, pois o Data Type está deletado) |  |  |

## relatorio

# relatorio (Data Type)

## Summary
Define a estrutura de dados para relatórios, contendo campos para nome, categoria, número de estudos e status de atividade.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| nome | text | Não |
| categoria | text | Não |
| estudos | number | Não |
| atividade | boolean | Não |

## transpacs

# transpacs (Data Type)

## Summary
Este Data Type, marcado como deletado, era utilizado para armazenar informações relacionadas a pacotes de transporte, incluindo um campo de texto para o total e um campo numérico para o número total.

## Campos

| Campo      | Tipo   | Obrigatório |
|------------|--------|-------------|
| total      | text   | Não         |
| num_total  | number | Não         |

## Hospitais

# Hospitais

## Summary
Define a estrutura de dados para armazenar informações sobre hospitais, incluindo detalhes de contato e localização.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| bairro | text | Não |
| cidade | text | Não |
| website | text | Não |
| endereço | text | Não |
| fone UTI | text | Não |
| telefone | text | Não |
| gvp - deleted | custom.gvp | Não |
| email hosp | text | Não |
| nome_hospital | text | Não |
| gvp membro | REDACTED | Não |
| hosp_atuacao - deleted | REDACTED | Não |

## AgdtoFerias

# AgdtoFerias (Data Type)

## Summary
Este tipo de dado representa um registro de férias, associando um usuário a um período específico. Contém campos para o ID do usuário e o intervalo de datas das férias.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| id\_user | User | Sim |
| periodo | Date range | Sim |
| id\_membro - deleted | Membros Espec (deleted) | Não |

## alimentacao

# alimentacao

## Summary
Este Data Type representa informações relacionadas a uma alimentação, incluindo detalhes como nome, e-mail, contato, endereço, telefone e horário de atendimento.

## Campos

| Campo             | Tipo   | Obrigatório |
|-------------------|--------|-------------|
| obs               | text   | Não         |
| nome              | text   | Não         |
| e-mail            | text   | Não         |
| contato           | text   | Não         |
| endereco          | text   | Não         |
| telefone          | text   | Não         |
| hor_atendimento   | text   | Não         |

## total_casos

# total_casos

## Summary
Este Data Type, denominado `total_casos`, foi criado para armazenar um número total de casos. Atualmente, ele está marcado como deletado.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| total_casos_number | number | Sim |

## Equipamentos

# Equipamentos

## Summary
Define a estrutura de dados para armazenar informações sobre equipamentos.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| obs | text | Não |
| nome | text | Não |
| e-mail | text | Não |
| contato | text | Não |
| endereço | text | Não |
| telefone | text | Não |
| hor_atendimento | text | Não |

## novapalestra

# novapalestra (Data Type)

## Summary
Define a estrutura de dados para armazenar informações de novas palestras, incluindo detalhes como data, local, palestrante e material.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| data_pal | text | Não |
| local_pal | text | Não |
| assist_pal | text | Não |
| user_n_pal | text | Não |
| user_ed_pal | text | Não |
| info_add_pal | text | Não |
| Palestrante_pal | text | Não |
| qtdade_material_pal | text | Não |

## Facilitadores

# Facilitadores

## Summary
Data type para armazenar informações de facilitadores, incluindo contato, ocupação e afiliação. Possui regras de privacidade para edição baseadas no nível de acesso do usuário.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| obs | text | Não |
| nome | text | Não |
| e-mail | text | Não |
| hospital | text | Não |
| telefone | text | Não |
| profissao | text | Não |
| congregacao | text | Não |

## especialidade

# especialidade

## Summary
Este Data Type representa especialidades médicas. Ele armazena o nome da especialidade e subespecialidade.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| nome espe | text | Não |
| nome_subespec | text | Não |

## Medicos_geral

# Medicos_geral (Data Type)

## Summary
Este Data Type armazena informações gerais de médicos, incluindo nome, CRM com UF e especialidade.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | text | Não |
| CRM_UF | text | Não |
| Especialidade | especialidade (custom) | Não |

## Membros_espec

# Membros_espec

## Summary
Data type que armazena informações de membros, incluindo dados de contato, especialidade e gerenciamento de férias. Contém campos para usuário, e-mail, telefone, avatar e especialidade.

## Campos

| Campo                    | Tipo         | Obrigatório |
|--------------------------|--------------|-------------|
| ajdt                     | text         | Não         |
| color                    | text         | Não         |
| e-mail                   | text         | Não         |
| Membro                   | text         | Não         |
| id_user                  | user         | Não         |
| avatar                   | image        | Não         |
| ajdt email               | text         | Não         |
| telefoneZap              | text         | Não         |
| chat_id tele             | text         | Não         |
| ferias                   | date_range   | Não         |
| Especialidade            | text         | Não         |
| id_AgdtoFerias           | REDACTED     | Não         |
| OS_Especialidade         | REDACTED     | Não         |

## transfundidos

# transfundidos

## Summary
Este Data Type representa informações sobre transfusões. Ele possui um campo para o número total de transfusões.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| total | number | Não |

## confirmacao rg

# confirmacao rg

## Summary
Este DataType representa informações de confirmação de RG, contendo campos para identificar o membro e seu status de presença. O DataType está marcado como deletado.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| membro | text | Não |
| presente | boolean | Não |

## Med_hospitalar

# Med_hospitalar

## Summary
Este Data Type armazena informações de hospitais, incluindo nome, contato, endereço e observações.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| obs | text | Não |
| nome | text | Não |
| e-mail | text | Não |
| contato | text | Não |
| endereço | text | Não |
| telefone | text | Não |
| hor atendimento | text | Não |

## Palestraevento

# Palestraevento

## Summary
Este Data Type armazena informações sobre eventos de palestras, incluindo data, local, palestrante e detalhes adicionais.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| date | date | Não |
| Local | text | Não |
| turma de | text | Não |
| Assistencia | text | Não |
| Palestrante | text | Não |
| infoadicional | text | Não |

## casos_encerrados

# casos_encerrados

## Summary
Data type que armazena informações sobre casos encerrados, incluindo detalhes médicos, do membro, hospital, descrição e datas relevantes.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| medico | text | Não |
| membro | text | Não |
| hospital | text | Não |
| transpac - deleted | text | Não |
| descricao | text | Não |
| morbidade | text | Não |
| transpac | boolean | Não |
| data_encerra | date | Não |
| transfudido - deleted | text | Não |
| data_abertura | date | Não |
| especialidade | text | Não |
| transfudido | boolean | Não |

## med_farmaceutico

# med_farmaceutico

## Summary
Este DataType representa informações sobre medicamentos farmacêuticos, incluindo detalhes de contato, endereço e horário de atendimento.

## Campos

| Campo | Tipo | Obrigatório |
|---|---|---|
| obs | text | Não |
| Nome | text | Não |
| e-mail | text | Não |
| contato | text | Não |
| endereço | text | Não |
| Telefone | text | Não |
| hora_atendimento | text | Não |

## Subespecialidade

# Subespecialidade

## Summary
Este Data Type representa as subespecialidades dentro de especialidades médicas.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| nome_subespec | text | Não |
| especialidade | Especialidade | Não |

## cadastropalestrasinstituicao

# cadastropalestrasinstituicao

## Summary
Este Data Type armazena informações detalhadas sobre o cadastro de palestras em instituições. Inclui dados de localização, contato, detalhes da palestra e informações da instituição.

## Campos

| Campo              | Tipo              | Obrigatório |
|--------------------|-------------------|-------------|
| uf                 | text              | Não         |
| cidade             | text              | Não         |
| endereco           | text              | Não         |
| local pal          | text              | Não         |
| responsável        | text              | Não         |
| tel_contato        | text              | Não         |
| nome_contato       | text              | Não         |
| tipo_publico       | text              | Não         |
| arquivos           | file              | Não         |
| data_abertura      | text              | Não         |
| e-mail_contato     | text              | Não         |
| outrosctt_uteis    | text              | Não         |
| ultimaalternome    | text              | Não         |
| detalhes_contato   | text              | Não         |
| nome_instituicao   | text              | Não         |
| tipo_instituição   | text              | Não         |
| dptfuncao_contato  | text              | Não         |
| data_palestra      | list of text      | Não         |
| qtdade material    | list of text      | Não         |
| endereco - deleted | geographic_address| Não         |

## pesquisa e estudo

# pesquisa e estudo

## Summary
Este Data Type armazena informações relacionadas a pesquisas e estudos, incluindo siglas, arquivos e o nome do documento.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| siglas | text | Não |
| arquivo | file | Não |
| nome doc | text | Não |

## casos_transferencia

# casos_transferencia

## Summary
Este Data Type armazena informações detalhadas sobre casos de transferência, incluindo dados do paciente, médicos, hospitais e detalhes específicos do caso.

## Campos

| Campo                  | Tipo          | Obrigatório |
| ---------------------- | ------------- | ----------- |
| ajdt                   | text          | Não         |
| e-mail                 | text          | Não         |
| membro                 | text          | Não         |
| telzap                 | user          | Não         |
| hospital               | text          | Não         |
| paciente               | text          | Não         |
| descrição              | text          | Não         |
| morbidade              | text          | Não         |
| ajdt email             | text          | Não         |
| exam                   | list.image    | Não         |
| num_caso               | number        | Não         |
| batizado               | boolean       | Não         |
| congregação            | text          | Não         |
| medico_nome            | text          | Não         |
| nome_ancião            | text          | Não         |
| transpac               | boolean       | Não         |
| diretivas              | boolean       | Não         |
| tel_cttuteis           | text          | Não         |
| data_abertura          | date          | Não         |
| e-mail ancião          | text          | Não         |
| especialidade          | text          | Não         |
| nome_cttuteis          | text          | Não         |
| ajudante email         | user          | Não         |
| boacondespi            | boolean       | Não         |
| telefone_anciao        | text          | Não         |
| transfundido           | boolean       | Não         |
| compartilhadocom       | text          | Não         |
| tags                   | option        | Não         |
| check_condicao         | boolean       | Não         |
| ajudante               | custom.membros_espec | Não         |

## nome_subespecialidade

# nome_subespecialidade

## Summary
Este Data Type representa subespecialidades e está marcado como deletado, indicando que não está ativo no sistema.

## Campos

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| (Nenhum campo visível, pois o Data Type está deletado) | - | - |

---

# Option Sets

## tags

# tags (Option Set)

## Summary
Option Set para categorização de tags, utilizado para agrupar diferentes especialidades médicas ou tipos de atendimento.

## Opções

| Opção | Valor |
|---|---|
| SUS | SUS |
| PL | PLANO |
| GONEO | GEONEO |
| PLANTÃO | PLANTÃO |
| COVID-19 | COVID-19 |
| ORTO-NEURO | ORTO-NEURO |
| PARTICULAR | PARTICULAR |
| ONCO-HEMATO | ONCO-HEMATO |
| CARDIO-TÓRAX | CARDIO-TÓRAX |
| AD-Hepato-Uro | AD-Hepato-Uro |

## Membros

# Membros

## Summary
Option Set que armazena nomes de membros, provavelmente para fins de identificação ou seleção em listas.

## Opções

| Opção           | Valor        |
|-----------------|--------------|
| Aurélio Manse   | aur_lio_manse |
| Daniel Nasser   | daniel_nasser |
| Rafael Nasser   | rafael_nasser |
| Felippe Soares  | felippe_soares|
| Jorge Franzoni  | jorge_franzoni|
| Eduardo Crusdack| eduardo_crusdack|

## Categoria

# Categoria

## Summary
Este Option Set define as categorias de usuários dentro do aplicativo.

## Opções

| Opção             | Valor              |
|-------------------|--------------------|
| Publicador        | publicador         |
| Pioneiro Auxiliar | pioneiro_auxiliar  |
| Pioneiro Regular  | pioneiro_regular   |

## grupo gvp

# grupo gvp

## Summary
Option Set para agrupar opções relacionadas ao "GVP". Contém 6 opções numéricas.

## Opções

| Opção | Valor |
|---|---|
| 1 | 1_ |
| 2 | 2_ |
| 3 | 3_ |
| 4 | 4_ |
| 5 | 5_ |
| 6 | 6_ |

## hospitais

# Option Set: hospitais

## Summary
Este Option Set lista nomes de hospitais para seleção.

## Opções

| Opção | Valor |
|-------|-------|
| Vita BR | Vita BR |
| Santa Casa | Santa Casa |
| Vita Batel | Vita Batel |
| Marcelino Champagnat | Marcelino Champagnat |

## hospitais

# hospitais

## Summary
Option set que armazena nomes de hospitais.

## Opções

| Opção                                             | Valor                                              |
|---------------------------------------------------|----------------------------------------------------|
| Centro Medico Comunitario Bairro Novo             | centro\_medico\_comunitario\_bairro\_novo          |
| Centro Hospitalar De Reabilitacao Do Parana       | centro\_hospitalar\_de\_reabilitacao\_do\_parana   |

## Especialidades

# Especialidades

## Summary
Option set que define as especialidades médicas disponíveis no sistema.

## Opções

| Opção        | Valor       |
|--------------|-------------|
| Ad-Hepato-Uro| ad_hepato_uro |
| GONeo        | goneo       |
| GVP          | gvp         |
| Cárdio-Tórax | c_rdio_t_rax |
| Onco-Hemato  | onco_hemato |
| TMO          | tmo         |
| Orto-Neuro   | orto_neuro  |
| Treinamento  | treinamento |
| Plantão      | plant_o     |

---

# Páginas

## index

# index

## Summary
Esta página é a página inicial do aplicativo, exibindo um formulário de login com campos para e-mail e senha, um botão para entrar, e opções para continuar conectado e redefinir senha.

### UI
* **Popup reset** (Popup) - Formulário para redefinição de senha, contendo campos para e-mail e um botão para enviar.
  * **Group B** (Group) - Container para os elementos do formulário de redefinição de senha.
    * **Button B** (Button) - Botão para enviar o e-mail de redefinição.
    * **Input E-mail reset** (Input) - Campo de entrada para o e-mail do usuário.
    * **Text C** (Text) - Texto explicativo sobre o processo de redefinição de senha.
    * **Text D** (Text) - Instruções para o usuário inserir o e-mail.
* **Group A** (Group) - Container principal para o formulário de login.
  * **Text B** (Text) - Título do formulário de login.
  * **Button A** (Button) - Botão para submeter o login.
  * **Image A** (Image) - Exibe um ícone relacionado ao login ou ao aplicativo.
  * **Checkbox A** (Checkbox) - Opção para manter o usuário conectado.
  * **Group with border** (Group) - Agrupamento do ícone e campo de senha.
    * **Icon A** (Icon) - Ícone de cadeado, mudando para cadeado aberto quando a senha é revelada.
    * **Input B** (Input) - Campo de entrada para a senha.
  * **Group with border** (Group) - Agrupamento do campo de e-mail.
    * **Input A** (Input) - Campo de entrada para o e-mail.
* **PWA A** (REDACTED) - Componente relacionado à funcionalidade PWA.
* **Group C** (Group) - Container para elementos gráficos.
  * **Shape A** (Shape) - Elemento de forma gráfica.

### Workflows
Não há workflows associados diretamente a esta página no trecho fornecido.

### Workflow cmNIt

**Trigger:** `PageLoaded`

## Summary
Este workflow é acionado ao carregar a página inicial (index). Ele atualiza o campo `ult_acesso_date` do usuário logado com a data e hora atuais e, em seguida, redireciona o usuário para a página de menu.

## Actions
1.  **Modify the Current User**: Atualiza o campo `ult_acesso_date` com a data/hora atual.
2.  **Go to page menu**: Redireciona o usuário para a página **menu**.

### Workflow cmNcG

# Workflow Login de Usuário

**Trigger:** `ButtonClicked` (Elemento: Botão de Login implícito, pois não há ID explícito no JSON)

## Summary
Este workflow é acionado quando um botão de login é clicado. Ele coleta o email, senha e o estado "lembrar email" de elementos de entrada e, em seguida, tenta logar o usuário.

## Actions
1.  **Log in** - Autentica o usuário usando o email e senha fornecidos, e considera a opção "lembrar email".
    *   **Email:** `Email` (Elemento: `cmNbm`)
    *   **Password:** `Password` (Elemento: `cmNbp`)
    *   **Remember email:** `Yes` (Elemento: `cmNcB`)

### Workflow cmNcK

# Workflow cmNcK

**Trigger:** `Button "Signup / Login Popup" is clicked`

## Summary
Este workflow exibe o popup de login ou cadastro quando um botão específico é clicado.

## Actions
1.  **Show Element** - Exibe o elemento **Signup / Login Popup**.

### Workflow cmNcs

# Workflow cmNcs

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado, enviando um e-mail de redefinição de senha para o usuário e ocultando um elemento na página.

## Actions
1.  **Send Password Reset Email** - Envia um e-mail para redefinição de senha com um link e mensagem personalizada.
2.  **HideElement** - Oculta o elemento com ID `cmNck`.

### Workflow cmWRu

# Workflow cmWRu

**Trigger:** `ButtonClicked` (no elemento "cmWRb")

## Summary
Este workflow é acionado quando um botão específico é clicado, com o propósito de direcionar o usuário para a página de registro de um novo caso.

## Actions
1.  **Navegar para:** `reg_novo_caso`

### Workflow cmXOL

# Workflow cmXOL

**Trigger:** `ButtonClicked` (Elemento: `cmXNn`)

## Summary
Este workflow tem como objetivo exibir um elemento que estava oculto.

## Actions
1. **Show** - Exibe o elemento com ID `cmXNn`.

### Workflow length

# Calcular Duração Tarefa

**Trigger:** `PageLoaded`

## Summary
Este workflow é executado quando a página é carregada e tem como objetivo calcular a duração de uma tarefa, possivelmente para exibição ou processamento posterior.

## Actions
1.  **When Page is Loaded** - Executa o workflow quando a página `index` é carregada.
2.  **Create a new thing** - Cria um novo registro no tipo de dados `Length`.
    *   **Field: initial_date** - Define o valor do campo `initial_date` como a data e hora atuais (`current date/time`).
    *   **Field: final_date** - Define o valor do campo `final_date` como a data e hora atuais (`current date/time`).

## menu

# menu

## Summary
Página que exibe um menu de navegação com opções para casos abertos e encerrados. Inclui contadores para cada categoria.

### UI
* **Group QZ** (Group) - Container principal da página.
  * **Group QZ** (Group) - Container para a seção de casos abertos.
    * **Group QZ** (Group) - Container para o texto "Abertos".
      * **Text U** (Text) - Exibe o texto "Abertos".
    * **Group QZ** (Group) - Container para o contador de casos abertos.
      * **Text U** (Text) - Exibe a contagem de casos abertos que contêm "Santa Casa" no nome do hospital e estão com o status "Aberto".

---

### Workflow cmNZY

# Workflow cmNZY

**Trigger:** `Page is loaded`

## Summary
Este workflow redireciona o usuário para a página "plant_o" se a especialidade do usuário logado for "Voluntário (a) - Médicos".

## Actions
1.  **Change page** - Redireciona para a página **plant_o** se a condição for verdadeira.
    *   **Condition:** `specialidade_text` (CurrentUser) `equals` `"Voluntário (a) - Médicos"`.

### Workflow cmOYk

# Workflow Aceitar Caso

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Ele atualiza os dados de um caso, envia um email de notificação e exibe uma mensagem ao usuário.

## Actions
1.  **ChangeThing** - Atualiza o registro do caso com informações sobre quem aceitou, histórico e data/hora.
2.  **SendEmail** - Envia um email para o criador do caso informando que ele foi aceito.
3.  **AlertShowMessage** - Exibe uma mensagem pop-up ao usuário confirmando a ação.
4.  **HideElement** - Oculta um elemento específico na página (ID do elemento: `cmOYQ`).
5.  **RefreshPage** - Atualiza a página atual para refletir as mudanças.

### Workflow cmOZt

# Workflow cmOZs

**Trigger:** `ConditionTrue`

## Summary
Este workflow exibe um popup (elemento 'cmOYQ') quando a contagem de dados em um elemento específico ('cmOYW') é maior que zero.

## Actions
1. **Show Element** - Exibe o elemento `cmOYQ` se a condição for verdadeira. A condição verifica se a contagem de `get_list_data` do elemento `cmOYW` é maior que zero.

### Workflow cmROn

# Workflow cmROn

**Trigger:** `PageLoaded` (implícito, pois o workflow está associado à página "menu" e o tipo é "LoggedIn")

## Summary
Redireciona o usuário para a página "plant_o" se a especialidade do usuário logado for "Voluntário(a)".

## Actions
1.  **Change Page** - Redireciona para a página **plant_o** se a especialidade do usuário atual for igual a "Voluntário(a)".

### Workflow cmRnd

# Abrir Popup Criação Arquivo

**Trigger:** `ButtonClicked` (Elemento: botão "Criar Arquivo" - implícito pela ação "Open popup")

## Summary
Este workflow é acionado quando um botão específico é clicado, abrindo um popup com um título predefinido e buscando dados de arquivos para exibição.

## Actions
1.  **Open popup** - Abre o popup com o ID "ACr" (Signup / Login Popup).
2.  **REDACTED** - Executa uma ação não especificada (ID: `cmRne`). Esta ação parece configurar dados para o popup, definindo um título como "Carta de Doação - MEDICAMENTO" e iniciando uma busca por arquivos do tipo `custom.arquivos` que resultará em `first_element` e `arquivo_list_file`.

### Workflow cmSSO

# Workflow cmSSO

**Trigger:** `ButtonClicked` (Elemento: **Add Tarefa Popup**)

## Summary
Este workflow é acionado quando o botão "Add Tarefa Popup" é clicado. Sua principal função é exibir um elemento pop-up específico para o usuário.

## Actions
1.  **Show Element** - Exibe o elemento pop-up chamado **Popup Adicionar Tarefa** (ID: cmSSP).

### Workflow cmSSd

# Workflow cmSSd

**Trigger:** `Button Clicked` (Elemento `cmSSV`)

## Summary
Este workflow é acionado ao clicar em um botão. Ele cria um novo registro no tipo de dado "avisos", reseta os inputs do formulário e esconde um elemento específico (popup).

## Actions
1.  **Create a new thing** (`custom.avisos`) - Cria um novo registro no tipo de dado "avisos".
    *   `aviso_text`: O valor é obtido do elemento `cmSSS` (GetElement).
2.  **Reset inputs** - Reseta os campos de input.
3.  **Hide an element** (`cmSSP`) - Esconde o elemento com ID `cmSSP`.

### Workflow cmSSn

# Workflow cmSSn

**Trigger:** `ButtonClicked`

## Summary
Este workflow apaga registros do tipo de dado "avisos" do banco de dados.

## Actions
1.  **Delete Thing** - Remove registros do tipo de dado `custom.avisos` do banco de dados.

### Workflow cmTVO

# Workflow cmTVO

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e tem como objetivo navegar para uma página específica.

## Actions
1.  **Change Page** - Redireciona o usuário para a página **teste**.

### Workflow cmVcc

# Ir para página de cadastro de novos usuários

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e redireciona o usuário para a página de cadastro de novos usuários.

## Actions
1.  **Change Page** - Redireciona o usuário para a página `cadastro_newuser`.

### Workflow cmVpu

# Abrir Popup Carta de Doação

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão, abrindo um popup com um título específico e buscando informações de arquivos.

## Actions
1.  **REDACTED** - Exibe um popup com o título "Carta de Doação - TECNOLOGIA" e busca por arquivos do tipo "custom.arquivos".

### Workflow cmWUF

# Abrir formulário Google em nova aba

**Trigger:** `ButtonClicked`

## Summary
Este workflow abre um formulário específico do Google em uma nova aba do navegador quando um botão é clicado.

## Actions
1. **Open URL** - Abre a URL `https://forms.gle/hXtmpe17SzqVHfEG7` em uma nova aba.

### Workflow cmWbX

# Workflow cmWbX

**Trigger:** `ConditionTrue`

## Summary
Executa ações quando o campo 'gvp_custom_gvp' (associado ao usuário atual) não está vazio.

## Actions
1.  **Redireciona para página** - Redireciona o usuário para a página **menu** (ID: cmMYA).

### Workflow cmWdD

# Workflow cmWdD

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado na página "menu", redirecionando o usuário para a página "cadastro_newuser".

## Actions
1. **Navigate to Page** - Redireciona para a página `cadastro_newuser`.

### Workflow cmWeq

# Workflow cmWeq

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, com o objetivo de exibir um elemento específico (popup) e carregar dados para ele.

## Actions
1.  **Show Element** - Exibe o elemento popup (`cmWdn`).
2.  **Display Group Data** - Carrega dados para o popup (`cmWdn`) a partir de seu elemento pai.

### Workflow cmWjd

```markdown
# Workflow Menu - Ocultar Elemento

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico quando um botão é clicado.

## Actions
1. **Ocultar Elemento** - Oculta o elemento com ID `cmWdn`.
```

### Workflow cmWkS

# Salvar Histórico GVP

**Trigger:** `ButtonClicked` (Elemento: [mapa não fornecido para 'cmWkH'])

## Summary
Este workflow salva um novo registro no histórico de GVP e reseta os campos de entrada.

## Actions
1.  **Change Thing** - Atualiza o campo `gvphistacao_text` com o valor do elemento `cmWkB` (apenas se `cmWkB` for um elemento de texto) e adiciona este valor ao campo existente.
2.  **Reset Inputs** - Limpa todos os campos de entrada na página.

### Workflow cmWmp

# Workflow cmWmp

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento `float`.

### Workflow cmWqv

# Workflow Salvar Dados do Menu

**Trigger:** `ButtonClicked` (Elemento: `menuvertical AAA`)

## Summary
Este workflow é acionado ao clicar no botão "menuvertical AAA". Sua função é exibir um grupo de elementos (`float`) e carregar dados nesse grupo, provavelmente para exibir informações contextuais ou um formulário relacionado ao menu.

## Actions
1.  **Show Element**: Exibe o elemento `float`.
2.  **Display Group Data**: Carrega dados no elemento `float`.

### Workflow cmWsz

# Workflow cmWsz

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza os dados de um GVP (Grupo de Voluntários de Proteção), decrementa a quantidade de casos associada e envia notificações por e-mail com base em condições específicas.

## Actions
1.  **ChangeThing** - Decrementa a quantidade de casos (`qntdcaso_number`) do GVP selecionado (`cmWrN`).
2.  **ChangeThing** - Atualiza o campo `gvprespons_vel_custom_gvp` do GVP selecionado (`cmWrN`) com o valor do elemento pai.
3.  **ChangeThing** - Incrementa a quantidade de casos (`qntdcaso_number`) do GVP selecionado.
4.  **SendEmail** - Envia um e-mail com o assunto "Novo caso" e corpo detalhado para o remetente `felippescolih@gmail.com` (BCC) e o e-mail associado ao GVP (`e_mail_text`), *se* o campo `responsavel_boolean` for falso. O corpo do e-mail inclui o nome do membro, nome do paciente e nome do hospital.
5.  **SendEmail** - Envia um e-mail com o assunto "Novo caso" e corpo detalhado para o remetente `felippescolih@gmail.com` (BCC) e o e-mail associado ao GVP (`e_mail_text`), *se* o campo `responsavel_boolean` for verdadeiro. O corpo do e-mail inclui o nome do membro, nome do paciente e nome do hospital.

### Workflow cmWtf

# Workflow cmWtf

**Trigger:** `ButtonClicked`

## Summary
Este workflow tem a função de esconder um elemento específico quando um botão é clicado.

## Actions
1.  **Hide Element** - Esconde o elemento `float`

### Workflow cmWwv

# Workflow cmWwv

**Trigger:** `ButtonClicked`

## Summary
Este workflow abre uma nova aba no navegador, direcionando para um link do WhatsApp. O link contém um número de telefone e uma mensagem pré-definida, possivelmente para iniciar uma conversa com um contato específico ou grupo.

## Actions
1.  **Open URL** - Abre a URL `wa.me/` concatenada com um número de telefone e uma mensagem. A URL é aberta em uma nova aba.

### Workflow cmXAD

# Workflow cmXAD

**Trigger:** `Button Clicked`

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de exibir um grupo de dados associado a um elemento específico na página "menu".

## Actions
1.  **Show Element** (`cmXAB`) - Exibe o elemento com ID `cmWdn`.
2.  **Display Group Data** (`cmXAC`) - Exibe dados do grupo de um elemento pai (`data_source`) no elemento com ID `cmWdn`.

### Workflow cmTuU0

# Abrir/Fechar Menu Vertical

**Trigger:** `ButtonClicked` (Elemento: `Menuvertical AAA`)

## Summary
Este workflow é acionado quando o botão "Menuvertical AAA" é clicado, alternando a visibilidade do elemento "Menuvertical AAA".

## Actions
1. **Toggle Element** - Alterna a visibilidade do elemento `Menuvertical AAA`.

### Workflow cmTub0

# Workflow Salvar Dados

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, redirecionando o usuário para outra página.

## Actions
1.  **Change Page**: Redireciona para a página `plant_o`.

### Workflow length

# Ir para página de pesquisa

**Trigger:** `Button Text Clicked`

## Summary
Este workflow é acionado quando um botão específico é clicado, redirecionando o usuário para a página de pesquisa.

## Actions
1.  **Change page** - Redireciona para a página **pesquisaeestudo**.

## plant_o

# plant_o

## Summary
Esta página é um popup ("Popup C") destinado ao registro de plantões. Contém campos para definir o início e fim do plantão, um campo para o telefone do contato e um dropdown para selecionar o membro ajudante responsável, com filtros para excluir a especialidade 'gvp'.

### UI
* **Popup C** (Popup) - Container principal para o formulário de registro de plantão.
  * **Group G** (Group) - Agrupa os elementos do formulário de registro de plantão.
    * **Date/TimePicker inicio** (DateInput) - Campo para selecionar a data e hora de início do plantão.
    * **Date/TimePicker final** (DateInput) - Campo para selecionar a data e hora de término do plantão.
    * **Input telefone** (Input) - Campo para inserir o número de telefone de contato.
    * **Dropdown Membro Ajudante** (Dropdown) - Seleciona um membro para auxiliar no plantão, excluindo a especialidade 'gvp'.
    * **Dropdown Membro** (Dropdown) - Seleciona o membro responsável pelo plantão, excluindo a especialidade 'gvp'.

### Workflows
Não há workflows definidos para esta página.

---

### Workflow cmQXp

```markdown
# Workflow Salvar e Exibir Campo de Cabeçalho

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de exibir um campo de cabeçalho específico.

## Actions
1. **Show Element** - Exibe o elemento de cabeçalho com o ID `cmRQo`.
```

### Workflow cmSRl

```markdown
# Workflow Criar Plantão

**Trigger:** `ButtonClicked`

## Summary
Este workflow cria um novo registro do tipo "plantão" no banco de dados, programa um evento de API para processamento futuro e reseta os campos de entrada.

## Actions
1.  **Criar Novo "custom.plantao"** - Cria um novo registro no banco de dados com os dados dos campos de entrada: `data_date`, `data_final_date`, `membro_text`, `intervalo_date_range`, `e_mail1_text`, `telefone_text`, `cht_id_telegram_text`, `ajudante_custom_membros_espec`, `telefonezapajudante_text`, `chatidtelegramajudante_text`.
2.  **Resetar Inputs** - Limpa os valores de todos os campos de entrada utilizados neste workflow.
3.  **Agendar Evento de API** - Agenda a execução do evento de API "cmOLD0" para a data especificada em `data_final_date` do passo anterior.
4.  **Condição** - Verifica se o campo `ajudante_custom_membros_espec` (do elemento `cmXDx`) não está vazio. Se a condição for verdadeira, prossegue com as ações seguintes.
    *   **Ação de Celular:** Prepara os parâmetros para um envio de SMS/WhatsApp, utilizando `telefone_text` do passo "Criar Novo custom.plantao".
```

### Workflow cmVcx

# Cancelar Agendamentos e Deletar Item

**Trigger:** `ButtonClicked`

## Summary
Cancela agendamentos de API programados e deleta um item.

## Actions
1.  **Cancel Scheduled API Event** - Cancela o agendamento `codigo_agdto_telegramantes_text`.
2.  **Cancel Scheduled API Event** - Cancela o agendamento `codigo_agdto_telegramnodia_text`.
3.  **Cancel Scheduled API Event** - Cancela o agendamento `codigo_agdto_whatsnodia_text`.
4.  **Cancel Scheduled API Event** - Cancela o agendamento `codigo_agendamento_text`.
5.  **Delete Thing** - Deleta o item relacionado.

### Workflow cmXcP

# Workflow cmXcP

**Trigger:** `ButtonClicked`

## Summary
Este workflow reseta um grupo de elementos após um botão ser clicado, limpando os campos do formulário.

## Actions
1.  **REDACTED** - Realiza uma ação não especificada.
2.  **ResetGroup** - Reseta o grupo de elementos `cmXbP` para seus valores padrão.

### Workflow cmXcX

# Workflow cmXcX

**Trigger:** `ButtonClicked`

## Summary
Este workflow reseta um formulário, limpando seus campos, quando um botão específico é clicado.

## Actions
1.  **REDACTED** - Executa uma ação não especificada (ID: `cmXcV`).
2.  **ResetGroup** - Reseta o grupo de elementos associado ao ID `cmXbP`.

### Workflow cmXch

# Workflow cmXcb

**Trigger:** `ButtonClicked` (Elemento: Button)

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo exibir dados de um grupo pai.

## Actions
1.  **DisplayGroupData** - Exibe os dados do grupo pai.

### Workflow cmXdH

# Atualizar Dados de Contato

**Trigger:** `InputChanged`

## Summary
Este workflow é acionado quando um input muda, atualizando as datas e os campos de texto com base nas entradas do usuário.

## Actions
1.  **Set state of page... data_date** - Define o estado `data_date` para a hora atual (00:00:00).
2.  **Set state of page... data_final_date** - Define o estado `data_final_date` para 23:59:59.
3.  **Set state of page... membro_text** - Define o estado `membro_text` com o valor do input `cmXbg`.
4.  **Set state of page... intervalo_date_range** - Define o estado `intervalo_date_range` para um intervalo de datas que começa na hora atual e termina em 23:59:59.
5.  **Set state of page... e_mail1_text** - Define o estado `e_mail1_text` com o valor do input `cmXbg` (campo de email).
6.  **Set state of page... telefone_text** - Define o estado `telefone_text` com o valor do input `cmXbg` (campo de telefone celular).
7.  **Set state of page... cht_id_telegram_text** - Define o estado `cht_id_telegram_text` com o valor do input `cmXbg` (campo de ID do Telegram).
8.  **Set state of page... ajudante_custom_membros_espec** - Define o estado `ajudante_custom_membros_espec` com o valor do elemento `cmXbh`.
9.  **Set state of page... telefonezapajudante_text** - Define o estado `telefonezapajudante_text` com o valor do input `cmXbg` (campo de telefone WhatsApp).

### Workflow cmTtB0

# Workflow Salvar Dados Plant_o

**Trigger:** `Button Clicked` (Elemento: Botão "Salvar")

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de ocultar um elemento específico na página.

## Actions
1.  **Ocultar Elemento** - Oculta o elemento com ID "cmSQx".

### Workflow length

# Calcular Tamanho da Lista

**Trigger:** `PageLoaded`

## Summary
Este workflow é acionado ao carregar a página `plant_o` e tem como objetivo calcular e exibir o tamanho de uma lista de itens.

## Actions
1. **Display list in grid**: Exibe os dados da busca "Todos os Itens" no elemento de grade com ID `cmPKP`.
2. **Set state**: Define o estado `length` do elemento `Page` para o número total de itens retornados pela busca "Todos os Itens".

## minha_conta

# minha_conta

## Summary
Página de perfil do usuário, exibindo informações básicas como nome, especialidade, localização, e-mail e quantidade de membros responsáveis.

### UI
* **Head** (Group) - Container principal da página.
  * **menuvertical** (Group) - Container para o menu lateral.
    * **cabeçalho** (Group) - Cabeçalho do menu.
      * **HEAD VOLUN** (Group) - Grupo para o logo ou título.
        * **Head_copy** (Group) - Cópia do cabeçalho.
          * **Menuvertical AAA** (Group) - Container para os itens do menu.
            * **float** (Group) - Grupo de layout flutuante.
              * **Signup / Login Popup** (Group) - Popup para cadastro/login.
                * **Header** (Group) - Cabeçalho da página.
                  * **Footer** (Group) - Rodapé da página.
                    * **foot** (Group) - Rodapé principal.
                      * **menu2** (Group) - Segundo menu.
                        * **Group L** (Group) - Grupo de layout.
                          * **Group L** (Group) - Grupo de layout.
                            * **Group L** (Group) - Grupo de layout.
                              * **Group L** (Group) - Grupo de layout.
                                * **Text W** (Text) - Exibe o ícone de usuário e o nome do usuário.
                                * **Text W** (Text) - Exibe o ícone de globo e a localização do usuário (extraído do endereço).
                                * **Text W** (Text) - Exibe o ícone de envelope e o e-mail do usuário.
                                  * **Group L** (Group) - Grupo de layout.
                                    * **Group L** (Group) - Grupo de layout.
                                      * **Group L** (Group) - Grupo de layout.
                                        * **Text W** (Text) - Exibe o número de membros responsáveis.

### Workflows
(Nenhum workflow encontrado para esta página nos dados fornecidos.)

### Workflow cmPHr

# Workflow cmPHr

**Trigger:** `ButtonClicked` - Botão "cmPHn" clicado

## Summary
Este workflow oculta um elemento específico quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento "cmPHL".

### Workflow cmPIA

# Atualizar Dados do Usuário

**Trigger:** `Button SALVAR edit is clicked`

## Summary
Atualiza as informações de email e outros campos do perfil do usuário logado e oculta um elemento específico.

## Actions
1.  **ChangeEmailForAnotherUser** - Altera o email do usuário atual para um novo email obtido do elemento `cmPHR`.
2.  **ChangeThing** - Atualiza os campos do usuário logado com os valores dos seguintes elementos:
    *   `nome_text` (a partir de `cmPHO`)
    *   `congrega_ao_text` (a partir de `cmQpG`)
    *   `nomeesposa_text` (a partir de `cmQoz`)
    *   `reunioes_text` (a partir de `cmQpJ`)
    *   `telcelular_text` (a partir de `cmQow`)
    *   `telcomercial_text` (a partir de `cmQot`)
    *   `telesposa_text` (a partir de `cmQpC`)
    *   `telres_text` (a partir de `cmQoq`)
3.  **HideElement** - Oculta o elemento `cmPHL`.

### Workflow cmPIR

# Workflow cmPIR

**Trigger:** `ButtonClicked` (Elemento: `cmPHm`)

## Summary
Este workflow atualiza os campos 'e_mail_text' e 'membro_text' de um registro do tipo `custom.membros_espec` na conta do usuário.

## Actions
1.  **Change Thing** (`cmPIZ`) - Atualiza o registro de `custom.membros_espec` onde `membro_text` é igual ao nome do usuário atual. Os campos `e_mail_text` e `membro_text` são definidos com os valores dos elementos `cmPHR` e `cmPHO`, respectivamente.

### Workflow cmQZF

# Workflow Salvar Férias

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando o botão "SALVAR ferias" é clicado. Ele cria um novo registro de férias para o usuário, atualiza o registro do membro específico com a referência a essa nova entrada de férias e exibe uma mensagem de sucesso. Finalmente, reseta os campos de entrada.

## Actions
1.  **Criar Novo Objeto:** Cria um novo objeto do tipo `custom.agdtoferias` com `id_user_user` (usuário atual) e `periodo_date_range` (determinado pelos elementos `cmTdG` e `cmTdG`).
2.  **Modificar Objeto:** Atualiza o primeiro objeto encontrado do tipo `custom.membros_espec` onde o campo `telzap_user` é igual ao usuário atual, adicionando a referência do objeto recém-criado de férias.
3.  **Exibir Mensagem de Alerta:** Mostra a mensagem de alerta associada ao elemento `cmViE`.
4.  **Enviar Email:** Envia um email com o assunto "Ausência agendada" para `felippescolih@gmail.com` e o email do usuário atual. O corpo do email contém informações sobre o período de ausência agendado, formatado com data e hora.
5.  **Resetar Inputs:** Limpa todos os campos de entrada do formulário.

### Workflow cmTbk

# Workflow cmTbk

**Trigger:** `ButtonClicked` (Elemento: `Botão Salvar`)

## Summary
Este workflow é acionado ao clicar no botão "Salvar" e tem como objetivo habilitar a alteração do e-mail do usuário.

## Actions
1.  **Definir Custom State** - Define o custom state `changeemail_` do elemento `Botão Salvar` como `true`.

### Workflow cmTbo

# Workflow cmTbo

**Trigger:** `ButtonClicked`

## Summary
Este workflow habilita um campo personalizado para alteração de senha quando um botão específico é clicado.

## Actions
1. **Set Custom State** - Define o estado personalizado `custom.changepassword_` do elemento `cmTZS` como `true`.

### Workflow cmTbs

# Workflow cmTbs

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza as credenciais do usuário, incluindo email e senha, e também modifica um campo personalizado em um tipo de dado relacionado.

## Actions
1.  **Set Custom State** - Define o estado customizado `custom.changeemail_` como `false`.
2.  **Update Credentials** - Atualiza as credenciais do usuário. O novo email é obtido do elemento `cmTZp` e a senha antiga do elemento `cmTZs`.
3.  **Change Thing** - Modifica um registro do tipo de dado `custom.membros_espec`. O campo `e_mail_text` é atualizado com o valor do elemento `cmTZp`. A busca pelo registro a ser modificado é restrita ao usuário atual (`membro_text` igual ao nome do usuário corrente).

### Workflow cmTbw

# Workflow cmTbw

**Trigger:** `ButtonClicked`

## Summary
Reseta o estado customizado `changeemail_` para `false`.

## Actions
1.  **Set Custom State** - Define o custom state `changeemail_` do elemento `cmTZS` para `false`.

### Workflow cmTcA

# Workflow cmTcA

**Trigger:** `ButtonClicked`

## Summary
Workflow acionado ao clicar em um botão para atualizar as credenciais do usuário, incluindo a senha.

## Actions
1.  **Set Custom State** - Define o estado personalizado `custom.changepassword_` do elemento `cmTZS` como `false`.
2.  **Update Credentials** - Atualiza as credenciais do usuário.
    *   `password` obtido do elemento `cmTaD`.
    *   `password2` obtido do elemento `cmTaG`.
    *   `old_password` obtido do elemento `cmTaA`.
    *   `change_password` definido como `true`.
    *   `require_confirm` definido como `true`.

### Workflow cmTcE

# Workflow cmTcE

**Trigger:** `ButtonClicked` (no elemento `Button Laranja cmQCW` na página `minha_conta`)

## Summary
Este workflow desativa o estado customizado `custom.changepassword_` quando o botão "Button Laranja cmQCW" é clicado.

## Actions
1.  **Definir Estado Customizado** - Define o estado customizado `custom.changepassword_` do elemento `Input cmTZS` como `false`.

### Workflow cmTcL

# Workflow Exibir Popup de Cadastro

**Trigger:** `ButtonClicked`

## Summary
Exibe um popup de cadastro quando um botão é clicado.

## Actions
1.  **Show Element** - Exibe o elemento com ID `ACr` (Signup / Login Popup).

### btn SALVAR DADOS PESSOAIS is clicked

# btn SALVAR DADOS PESSOAIS is clicked

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando o botão "SALVAR DADOS PESSOAIS" é clicado. Ele atualiza os dados do usuário corrente com as informações fornecidas em campos de entrada específicos e exibe uma mensagem de confirmação.

## Actions
1.  **Modificar Coisa** (`CurrentUser`) - Atualiza os campos `nome_text`, `congrega_ao_text`, `nomeesposa_text`, `reunioes_text`, `telcelular_text`, `telcomercial_text`, `telesposa_text` e `telres_text` com os valores obtidos dos elementos de entrada com IDs `cmTYU`, `cmTcV`, `cmTcf`, `cmTca`, `cmTYY`, `cmTYe`, `cmTck` e `cmTcQ`, respectivamente.
2.  **Mostrar mensagem de alerta** - Exibe uma mensagem de sucesso para o usuário.

### Workflow cmXMV

# Excluir Conta do Usuário

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, com o objetivo de excluir a conta do usuário.

## Actions
1. **Delete Thing** - Exclui o elemento pai do elemento clicado.

### Workflow cmQOL0

# Workflow cmQOL0

**Trigger:** `ButtonClicked`

## Summary
Atualiza a imagem de avatar do usuário logado com um novo valor e oculta um elemento específico na página "minha_conta".

## Actions
1.  **Change Thing** - Atualiza o campo `avatar_image` do usuário atual para o valor de `avatar_image`.
2.  **Hide Element** - Oculta o elemento com ID `cmQNx0`.

### Workflow cmQOY0

# Atualizar Avatar do Usuário

**Trigger:** `ButtonClicked` (Elemento: `cmQNx0`)

## Summary
Atualiza a imagem do avatar do usuário logado com a imagem selecionada e oculta um elemento específico na página.

## Actions
1.  **Alterar este usuário**: Define o campo `avatar_image` do usuário atual com o resultado da ação `get_data` do elemento `cmQOQ0`.
2.  **Ocultar elemento**: Oculta o elemento com ID `cmQNx0`.

### Workflow length

# Workflow length

**Trigger:** `PageLoaded`

## Summary
Este workflow é acionado ao carregar a página "minha_conta" e calcula o tamanho do próprio workflow.

## Actions
1. **'length' workflow** - Obtém o comprimento do workflow "Workflow length".

## encerrado_estudar

# encerrado_estudar (Página)

## Summary
Esta página exibe uma lista de casos encerrados, com detalhes sobre paciente, idade, morbidade e o membro responsável. O layout inclui um menu vertical e um cabeçalho fixo.

### UI
* **Group A** (Group) - Container principal da página.
  * **Menuvertical AAA A** (CustomElement) - Menu de navegação vertical.
  * **Group B** (Group) - Container para o título e a lista de casos.
    * **Text A** (Text) - Título: "LISTA DE CASOS ENCERRADOS".
    * **Group B** (Group) - Container para o Repeating Group.
      * **RepeatingGroup A** (RepeatingGroup) - Exibe a lista de casos encerrados (tipo de dado `reg_caso`).
        * **Group B** (Group) - Container para os detalhes de cada caso.
          * **Text A** (Text) - Exibe o nome do paciente.
          * **Text A** (Text) - Exibe a idade do paciente, visível apenas em larguras de tela menores que 700px.
          * **Text A** (Text) - Exibe informações adicionais sobre morbidade.
          * **Text A** (Text) - Exibe o nome do membro responsável.

### Workflows
Não há workflows configurados nesta página.

### Workflow cmTjm

# Workflow cmTjm

**Trigger:** `ButtonClicked` (Elemento: `cmMjm` - Head)

## Summary
Este workflow é acionado ao clicar em um botão (Head) e redireciona o usuário para a página "menu".

## Actions
1.  **Change Page** - Redireciona para a página **menu**.

### Workflow cmTjq

# Workflow cmTjq

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e redireciona o usuário para a página de login.

## Actions
1.  **Change Page** - Redireciona para a página **Signup / Login Popup**.

### Workflow cmTju

# Workflow cmTju

**Trigger:** `ButtonClicked`

## Summary
Redireciona o usuário para a página "teste" ao clicar em um botão.

## Actions
1.  **Change Page** - Redireciona para a página `teste`.

### Workflow cmTjy

# Workflow cmTjy - Voltar para Lista Anterior

**Trigger:** `ButtonClicked` (Elemento: Botão Voltar)

## Summary
Este workflow é acionado quando o botão "Voltar" é clicado, exibindo a página anterior da lista de itens.

## Actions
1.  **Mostrar página anterior da lista** (`ListShowPrevious`) - Volta para a página anterior da lista de itens.

### Workflow cmTkC

# Workflow cmTkC

**Trigger:** `ButtonClicked`

## Summary
Avança para o próximo item em uma lista quando um botão é clicado.

## Actions
1.  **ListShowNext** - Exibe o próximo item na lista.

### Workflow cmTkF

# Workflow Ir para Página de Casos

**Trigger:** `ButtonClicked` (Elemento: Botão não especificado no mapa, ID: `cmTFp0`)

## Summary
Este workflow é acionado ao clicar em um botão, redirecionando o usuário para a página de casos.

## Actions
1.  **Change Page**: Redireciona para a página **casos** (`cmTEb0`).

### Workflow cmTkl

# Workflow Ir Para Item Anterior

**Trigger:** `ButtonClicked` (Elemento: `cmTkc`)

## Summary
Este workflow permite navegar para o item anterior em uma lista.

## Actions
1.  **Mostrar Item Anterior** (Elemento: `cmTkO`) - Exibe o item anterior na lista do elemento `cmTkO`.

### Workflow cmTkq

# Workflow Ir para Próximo Item

**Trigger:** `ButtonClicked` (botão com ID `cmTkO` na página `encerrado_estudar`)

## Summary
Este workflow exibe o próximo item em uma lista.

## Actions
1. **Exibir próximo item da lista** - Mostra o próximo elemento na lista associada ao elemento com ID `cmTkO`.

---

### Workflow cmTle

# Workflow Ir para Ler Caso Encerrado

**Trigger:** `Button Clicked` (Elemento: `cmMoL`)

## Summary
Este workflow é acionado ao clicar em um botão específico e redireciona o usuário para a página "ler_casoencerrado".

## Actions
1.  **Change Page** - Redireciona o usuário para a página `ler_casoencerrado`, passando o elemento pai como dado.

## teste

# teste (Página)

## Summary
Página destinada a testes, com formulário de entrada para nome e botões de ação "salvar" e "encerrar". Exibe contadores baseados em buscas no banco de dados.

### UI
*   **Popup A** (Popup) - Container para elementos de UI.
    *   **Input A** (Input) - Campo de entrada de texto para "Nome".
    *   **Button A** (Button) - Botão com o texto "salvar".
    *   **Text A** (Text) - Exibe texto dinâmico.
    *   **Button B** (Button) - Botão com o texto "encerrar".
    *   **Text C** (Text) - Exibe dados dinâmicos.
    *   **Text D** (Text) - Exibe dados dinâmicos.

### Workflows
*   **Input A - when Input's value is changed**:
    1.  `Action`: Set state of an element - `Popup A`'s `InputName` (estado) com o valor de `Input A`'s value.
    2.  `Action`: Set state of an element - `Popup A`'s `InputDescription` (estado) com o valor de `Input A`'s value.
*   **Button A - when Clicked**:
    1.  `Action`: Create a new Thing - `custom.zz_teste` com `Name` = `Popup A`'s `InputName`.
    2.  `Action`: Reset relevant inputs - `Input A`.
*   **Button B - when Clicked**:
    1.  `Action`: Close the popup - `Popup A`.

### Workflow cmUQX

```json
{
  "name_suggestion": "",
  "documentation": "# Criar Novo Teste\n\n**Trigger:** `ButtonClicked`\n\n## Summary\nCria um novo registro do tipo `zz_teste` com base nos valores de um campo de entrada.\n\n## Actions\n1. **Create a new thing** - Cria um novo registro do tipo `custom.zz_teste`.\n   - **Set Initial Values**:\n     - `nome_text`: Converte o valor do elemento `cmUQP` para maiúsculas e o armazena no campo `nome_text`."
}
```

### Workflow cmUQh

# Workflow cmUQh

**Trigger:** `ButtonClicked`

## Summary
Este workflow busca e atualiza dados de um tipo customizado `zz_teste`, removendo caracteres alfabéticos minúsculos do campo `nome_text` e salvando a alteração.

## Actions
1.  **Change Thing** (`cmUQk`) - Atualiza o registro do tipo `custom.zz_teste` encontrado.
    *   **Para o campo:** `nome_text`
    *   **Recebe o valor de:**
        *   Busca no elemento `Input cmUQP` (Tipo: Input).
        *   Aplica expressão regular para encontrar `[a-z]` e substituir por `""` (remover caracteres minúsculos).

### Workflow cmVna

# Enviar Mensagem WhatsApp

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e executa uma chamada de API para enviar uma mensagem via WhatsApp, utilizando dados obtidos de elementos na página.

## Actions
1.  **Enviar Mensagem (API Connector `cmRhD.cmRhE`)** - Envia uma mensagem via WhatsApp.
    *   **Número de Telefone:** Concatena strings vazias com dados de um elemento (`cmVZz1`) e outra string vazia.
    *   **Mensagem:** Concatena strings vazias com dados de um elemento (`cmVZt1`) e outra string vazia.

### Workflow cmVaE1

```markdown
# Workflow Enviar SMS

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e envia uma mensagem SMS através da API `cmSMS.cmSMT`.

## Actions
1. **Enviar SMS (API Connector)** - Chama a ação `cmSMT` do conector `cmSMS`, enviando dados configurados para a API.
```

## cadastro_newuser

# cadastro_newuser

## Summary
Página para cadastro de novos usuários. Contém campos para e-mail, senha, nome e especialidade, além de um botão para submeter o cadastro. Inclui um popup para redefinição de senha.

### UI
* **Text A** (Text) - Título "Casos Info"
* **Shape A** (Shape) - Elemento visual
* **Popup reset** (Popup) - Popup para redefinição de senha
  * **Button B** (Button) - Botão "Enviar"
  * **Input C** (Input) - Campo de entrada para e-mail
  * **Text C** (Text) - Título "Redefinir senha"
  * **Text D** (Text) - Instrução para redefinição de senha
* **Group A** (Group) - Grupo principal de campos de cadastro
  * **Input A** (Input) - Campo de entrada para e-mail
  * **Input B** (Input) - Campo de entrada para senha
  * **Button A** (Button) - Botão "Cadastrar"
  * **Image A** (Image) - Logo/ícone "icon casosinfo.png"
  * **Dropdown A** (Dropdown) - Campo de seleção para especialidade
  * **Input D** (Input) - Campo de entrada para nome

### Workflows
- **when Button A is Clicked**: Modifica os dados do usuário → Cria um novo usuário → Salva o e-mail do usuário → Salva a senha do usuário → Redireciona para a página 'painel_controle'

### Workflow cmNcG

# Workflow cmNcG

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Ele realiza o cadastro de um novo usuário, cria um novo registro no tipo de dado `membros_espec`, envia um email de boas-vindas e, por fim, redireciona o usuário para outra página.

## Actions
1.  **Sign Up** - Cria um novo usuário com o email e senha fornecidos nos inputs `cmOAN` e `cmOAO`, respectivamente. Define o texto da especialidade do input `cmODT` e o nome do membro do input `cmODX`.
2.  **Create a new thing** - Cria um novo registro no tipo de dado `custom.membros_espec` com os seguintes valores:
    *   `e_mail_text`: valor do input `cmOAN`.
    *   `especialidade_text`: valor do input `cmODT`.
    *   `membro_text`: valor do input `cmODX`.
3.  **Send email** - Envia um email com as seguintes configurações:
    *   **Para:** `felippesoares@gmail.com` (CC) e `crusdack@gmail.com` (BCC).
    *   **Assunto:** "Cadastro Casos Info".
    *   **Corpo:** "Olá [nome do membro]\nSeja bem-vindo ao casos info. Seu cadastro foi realizado com sucesso.\n\nAté mais!".
    *   **Nome do Remetente:** "Registro Casos Info".
4.  **Change page** - Redireciona o usuário para a página `index`.

### Workflow cmNcs

# Workflow cmNcs

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado e tem como objetivo enviar um email para redefinir a senha do usuário. Após o envio, ele oculta um elemento na tela.

## Actions
1.  **SendPasswordResetEmail**: Envia um email de redefinição de senha.
2.  **HideElement**: Oculta o elemento com o ID `cmOAH`.

### Workflow length

# Workflow length

**Trigger:** `PageLoaded`

## Summary
Atualiza o estado de um input com base em uma condição.

## Actions
1.  **Set state of a list** - Define o estado `new` do elemento `cmVpN` (float) como `True`.

## painel_controle

# painel_controle (Página)

## Summary
Página principal do painel de controle, com funcionalidades de exibição e gerenciamento de usuários. Inclui popups para confirmação de exclusão e criação de novos usuários.

### UI
* **Head A** (CustomElement) - Cabeçalho da página.
  * **Popup B** (Popup) - Popup para confirmar a exclusão de um usuário.
    * **Text HZ** (Text) - Exibe o nome do usuário a ser excluído.
    * **Text IZ** (Text) - Mensagem de confirmação para exclusão.
    * **Group C** (Group) - Grupo de botões para ação de exclusão.
      * **Text JZ** (Text) - Rótulo "Remover Usuário".
    * **Group D** (Group) - Grupo de botões de controle do popup.
      * **Group E** (Group) - Grupo que contém os botões "VOLTAR" e "REMOVER".
        * **Button E** (Button) - Botão para cancelar a ação.
        * **Button F** (Button) - Botão para confirmar a exclusão do usuário.
  * **Popup C** (Popup) - Popup para criação de novo usuário.
    * **Group F** (Group) - Grupo que contém o título do popup.
      * **Text C** (Text) - Título "Criar Usuário".
    * **Group G** (Group) - Grupo de botões de controle do popup.
      * **Group G** (Group) - Grupo que contém os botões "VOLTAR" e "CRIAR".
        * **Button B** (Button) - Botão para cancelar a criação de usuário.
        * **Button** (Button) - Botão para confirmar a criação de usuário.

### Workflows
(Não foram fornecidos dados de workflows para esta página.)

### Workflow cmOTs

# Mostrar Popup de Detalhes do Controle

**Trigger:** `ButtonClicked` (Elemento: `cmOTh`)

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de exibir um elemento (popup) e ocultar outro elemento simultaneamente.

## Actions
1.  **Show Element** (`cmOTt`) - Exibe o elemento com ID `cmOSl`.
2.  **Hide Element** (`cmOVK`) - Oculta o elemento com ID `cmOTu`.

### Workflow cmOUn

# Workflow Deletar Membro Específico

**Trigger:** `ButtonClicked` (Elemento: `cmOUi`)

## Summary
Este workflow deleta dados de um membro específico (`custom.membros_espec`) do banco de dados, com base nos valores de `membro_text` e `nome_text` de um elemento específico.

## Actions
1.  **DeleteThing** (`cmOUo`) - Deleta os dados do elemento `cmOUM` (get_group_data).
2.  **DeleteThing** (`cmWXn`) - Deleta os dados de `custom.membros_espec` onde `membro_text` é igual ao `nome_text` do elemento `cmOUM`.

### Workflow cmOUr

# Ocultar Popup Cad. Novo Usuário

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico (popup) quando um botão é clicado.

## Actions
1.  **HideElement** - Oculta o elemento com ID `cmOUM` (associado a `Signup / Login Popup`).

### Workflow cmOVH

# Mostrar/Ocultar Menu Painel

**Trigger:** `ButtonClicked` (Elemento: "cmOTn")

## Summary
Este workflow é acionado ao clicar em um botão para exibir e ocultar um menu lateral no painel de controle.

## Actions
1.  **Show Element** - Exibe o elemento "cmOTu".
2.  **Hide Element** - Oculta o elemento "cmOSl".

### Workflow cmOWE

# Cadastro de Novo Membro Especialista

**Trigger:** `ButtonClicked` (Elemento: `cmOVW`)

## Summary
Este workflow cadastra um novo membro especialista no sistema, envia um email de boas-vindas e esconde um elemento específico.

## Actions
1.  **SignUp** - Registra um novo usuário com email, senha e especialidade.
    *   `especialidade_text`: Obtém o valor do elemento `cmOVh`.
    *   `nome_text`: Obtém o valor do elemento `cmOVY`.
    *   `email`: Obtém o valor do elemento `cmOVb`.
    *   `password`: Obtém o valor do elemento `cmOVe`.
2.  **NewThing** - Cria um novo registro do tipo `custom.membros_espec` com os seguintes valores iniciais:
    *   `e_mail_text`: Obtém o valor do elemento `cmOVb` (resultado da ação anterior).
    *   `especialidade_text`: Obtém o valor do elemento `cmOVh` (resultado da ação anterior).
    *   `membro_text`: Obtém o valor do elemento `cmOVY` (resultado da ação anterior).
3.  **ResetInputs** - Limpa os campos de entrada do formulário.
4.  **SendEmail** - Envia um email de boas-vindas.
    *   `cc`: `felippesoares@gmail.com`
    *   `to`: `e_mail_text` (da ação `NewThing`).
    *   `body`: "Olá [membro_text]! Seja bem-vindo ao casos info. Seu cadastro foi realizado com sucesso. Faça bom proveito, e cuide bem dos seus casos ;-)\n\nAté mais!"
    *   `subject`: "Cadastro Casos Info"
    *   `bcc`: `crusdack@gmail.com`
    *   `sender_name`: "Registro Casos Info"
5.  **HideElement** - Esconde o elemento `cmOVL`.

### Workflow cmOWP

# Workflow cmOWN

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta o elemento com ID `cmOVL` quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento `cmOVL`.

### Workflow cmOWT

# Mostrar Popup de Elemento

**Trigger:** `ButtonClicked` (Botão: não especificado)

## Summary
Exibe um elemento pop-up quando um botão é clicado.

## Actions
1.  **Show Element** - Exibe o elemento pop-up (`cmOVL`).

### Workflow cmVhg

# Alternar visibilidade menu

**Trigger:** `ButtonClicked`

## Summary
Este workflow tem como objetivo alternar a visibilidade de dois elementos, provavelmente para exibir ou ocultar um menu.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento `menuvertical` (ID: cmPKP).
2.  **ToggleElement** - Alterna a visibilidade do elemento `Menuvertical AAA` (ID: cmTJQ).

### Workflow cmVtc

# Workflow cmVtc

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, chamando um conector de API para enviar mensagens, possivelmente para fins de notificações ou comunicação.

## Actions
1.  **apiconnector2-cmRhD.cmRhE** - Chama um conector de API para enviar mensagens.
    *   `body_params_celular`: Obtém dados do elemento "cmVti".
    *   `body_params_message`: Obtém dados do elemento "cmVtU".

### Workflow cmVtg

# Exibir popup de lembrete

**Trigger:** `ButtonClicked` (Elemento: `cmVsx`)

## Summary
Este workflow exibe um elemento popup quando um botão específico é clicado.

## Actions
1.  **Show Element** - Exibe o elemento `cmVtR` (popup).

### Workflow cmWCV

# Workflow cmWCV

**Trigger:** `ButtonClicked` (do elemento com ID `cmWCJ`)

## Summary
Este workflow atualiza o campo `especialidade_text` em dois itens diferentes: primeiro, tenta atualizar o elemento pai do elemento `cmWCL`, e em seguida, busca e atualiza o primeiro `custom.membros_espec` que corresponde ao `nome_text` do passo anterior. Por fim, esconde o elemento com ID `cmWCD`.

## Actions
1.  **Change Thing** - Atualiza o elemento pai do elemento `cmWCL` com o valor de `especialidade_text` obtido do elemento `cmWCL`.
2.  **Change Thing** - Busca o primeiro `custom.membros_espec` onde o campo `membro_text` é igual ao `nome_text` do passo anterior e atualiza o campo `especialidade_text` com o valor obtido do elemento `cmWCL`.
3.  **Hide Element** - Esconde o elemento com ID `cmWCD`.

### Workflow cmWCh

# Workflow cmWCh

**Trigger:** `ButtonClicked` (Elemento: `cmWBr`)

## Summary
Este workflow é acionado quando um botão específico é clicado para exibir um popup.

## Actions
1.  **Show Element** - Exibe o elemento popup (`cmWBr`).

### Workflow cmWCo

# Workflow de Exibição de Popup de Detalhes

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de exibir um elemento (popup) e carregar dados associados a ele.

## Actions
1.  **Show Element** - Exibe o elemento com o ID `cmWCD` (Popup de Detalhes).
2.  **Display Group Data** - Carrega os dados do elemento pai do botão clicado para o elemento com o ID `cmWCD` (Popup de Detalhes).

---

### Workflow cmQRk0

# Workflow cmQRk0

**Trigger:** `ButtonClicked` (do elemento "cmOUD")

## Summary
Este workflow é acionado ao clicar em um botão. Ele exibe um elemento popup (cmOUM) e carrega dados nesse mesmo popup.

## Actions
1.  **ShowElement** - Exibe o elemento "**cmOUM**".
2.  **DisplayGroupData** - Exibe dados do grupo pai no elemento "**cmOUM**".

### Workflow length

# Workflow length

**Trigger:** `PageLoaded`

## Summary
Este workflow é acionado ao carregar a página "painel_controle" e valida se o valor de um campo específico excede um limite de caracteres.

## Actions
1.  **Conditional Logic** - Executa um bloco de ações se a condição for verdadeira.
    *   **Condition:** `Length of Input 'Input CMP' value > 200`
    *   **Actions:**
        1.  **Show Alert** - Exibe um alerta ao usuário.
            *   **Message:** `O campo "C M P" permite no máximo 200 caracteres.`
            *   **Title:** `Campo inválido`
        2.  **Reset Input** - Limpa o valor do campo de entrada.
            *   **Input:** `Input CMP`

## minhasub

# minhasub (Página)

## Summary
Esta página exibe uma lista de "Casos" com status "Aberto", permitindo visualizar informações detalhadas sobre cada caso, como paciente e morbidade.

### UI
*   **Group** (`cmUwR`) - Container principal da página
    *   **Text** (`cmUwN`) - Título "CASOS"
    *   **RepeatingGroup** (`cmUwT`) - Exibe a lista de casos
        *   **Text** (`cmUwU`) - Exibe o nome do paciente
        *   **Text** (`cmUwV`) - Exibe a morbidade do caso

### Workflows
*   **Page Load**: `PageLoaded` → (Nenhum workflow encontrado)

---

## gvp

# gvp (Página)

## Summary
Esta página exibe um formulário para cadastro de GVP (Grupo de Validação e Permissões), permitindo a seleção de um hospital em um dropdown e a exibição de GVPs existentes em uma tabela. Inclui um botão para adicionar novos GVPs, condicionalmente visível para usuários com nível de acesso específico.

### UI
* **Head** (Group) - Container principal da página.
  * **Text A** (Text) - Título da página "GVP".
  * **Dropdown E** (Dropdown) - Campo para selecionar um hospital.
    * **RepeatingGroup C** (RepeatingGroup) - Exibe a lista de GVPs.
      * **Group H** (Group) - Container para cada item da lista de GVPs.
        * **addgvp** (Button) - Botão para adicionar um novo GVP.

### Workflows
Não há workflows associados diretamente a esta página na informação fornecida.

---

### Workflow cmPXB

# Ocultar e Deletar Elemento

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico e deleta seu elemento pai.

## Actions
1.  **Hide Element** - Oculta o elemento com ID `cmPqD`.
2.  **Delete Thing** - Deleta o elemento pai do elemento com ID `cmPqO`.

### Workflow cmPpU

# Criar Novo GVP

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando o botão "SALVAR novo gvp is clicked" é clicado. Ele cria um novo registro do tipo "custom.gvp", associa-o a "custom.hospitais1", reseta os inputs e oculta um elemento específico.

## Actions
1.  **Criar um novo `custom.gvp`** - Define os seguintes campos para o novo registro:
    *   `congrega__o_text`: Pega o valor do elemento com ID `cmPqX`.
    *   `ajudante_boolean`: Define como `true`.
    *   `nome_membro_text`: Pega o valor do elemento com ID `cmPqU`.
    *   `obs_text`: Pega o valor do elemento com ID `cmPqY`.
    *   `e_mail_text`: Pega o valor do elemento com ID `cmPqV`.
    *   `telefone_text`: Pega o valor do elemento com ID `cmPqW`.
    *   `grupo_text`: Pega o valor do elemento com ID `cmUjB0`.
    *   `responsavel_boolean`: Define como `true`.
    *   `REDACTED`: Pega o valor do elemento com ID `cmPrY`.
    *   `fun__o_text`: Pega o valor do elemento com ID `cmPrN`.
    *   `hosp_atua2_list_text`: Pega o valor do elemento com ID `cmPrY` (o nome do hospital).
2.  **Alterar a lista `gvp_membro_list_custom_gvp` de `custom.hospitais1`** - Adiciona o resultado do passo anterior ("Criar um novo `custom.gvp`") à lista.
3.  **Resetar inputs** - Limpa todos os campos de input na página.
4.  **Esconder elemento** - Oculta o elemento com ID `cmPqR`.

### Workflow cmPsp

# Workflow Salvar/Atualizar Lista de Membros GVP

**Trigger:** `ButtonClicked` (Elemento: Text SALVAR edit gvp copy is clicked)

## Summary
Este workflow é acionado quando o botão "Text SALVAR edit gvp copy is clicked" é clicado. Ele tem como objetivo modificar a lista de "hospitais1", adicionando ou garantindo a presença de um elemento pai específico.

## Actions
1.  **Change List of Things** - Adiciona um elemento pai à lista de `gvp_membro_list_custom_gvp` para o tipo `custom.hospitais1`, verificando se o elemento pai já existe na lista.

### Workflow cmPtP

# Workflow cmPtP

**Trigger:** `ButtonClicked` (Elemento: Text SALVAR edit gvp is clicked)

## Summary
Este workflow é acionado ao clicar no botão "Text SALVAR edit gvp is clicked". Ele atualiza um registro (Thing) com dados provenientes de campos de entrada e, em seguida, oculta um elemento específico.

## Actions
1.  **Change Thing** - Atualiza o registro:
    *   `ajudante_boolean` é definido como o valor atual do elemento pai.
    *   `congrega__o_text` é definido com o valor do elemento `Text ` (ID: cmPqL).
    *   `e_mail_text` é definido com o valor do elemento `Text ` (ID: cmPqH).
    *   `grupo_text` é definido com o valor do elemento `Text ` (ID: cmPrl).
    *   `REDACTED` é definido com a lista de valores do elemento `Text ` (ID: cmPre).
    *   `nome_membro_text` é definido com o valor do elemento `Text ` (ID: cmPqG).
    *   `obs_text` é definido com o valor do elemento `Text ` (ID: cmPqK).
    *   `telefone_text` é definido com o valor do elemento `Text ` (ID: cmPqI).
    *   `fun__o_text` é definido com o valor do elemento `Text ` (ID: cmPri).
    *   `hosp_atua2_list_text` é definido com a lista de valores do elemento `Text ` (ID: cmPre).
2.  **Hide Element** - Oculta o elemento `Popup` (ID: cmPqD).

---

### Workflow cmUjM0

# Ocultar Elemento CM_PqR

**Trigger:** `ButtonClicked` (Elemento: `Button Save`)

## Summary
Este workflow oculta um elemento específico da interface do usuário.

## Actions
1.  **Hide Element** - Oculta o elemento `Button Save` (ID: `cmPqR`).

### Workflow cmUkX0

# Workflow Abrir Menu Vertical

**Trigger:** `Button Clicked` (elemento `cmUkR0`)

## Summary
Este workflow é acionado ao clicar em um botão específico e tem como objetivo alternar a visibilidade de um elemento de menu vertical.

## Actions
1.  **Toggle Element** (`cmUkY0`) - Alterna a visibilidade do elemento `cmPkP` (Menuvertical).

### Workflow cmUkb0

# Abrir Popup de Menu Vertical

**Trigger:** `ButtonClicked` (Elemento: `cmUkE0`)

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo alternar a visibilidade de um elemento pop-up de menu vertical.

## Actions
1.  **Mostrar/Ocultar Elemento (`cmUkc0`)**: Alterna a visibilidade do elemento `cmUkH0`.

### Workflow cmUkf0

# Workflow GVP Popup

**Trigger:** `ButtonClicked`

## Summary
Exibe um popup e carrega dados relacionados a ele em um grupo.

## Actions
1.  **Show Element** - Exibe o elemento pop-up (**Popup GVP**).
2.  **Display Group Data** - Exibe os dados do grupo pai no elemento pop-up (**Popup GVP**).

### Workflow cmUkk0

# Workflow cmUkk0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e sua principal ação é esconder um elemento específico na página.

## Actions
1.  **Esconder elemento** - Esconde o elemento com ID `cmPqD`.

### Workflow cmUko0

# Abrir popup Signup / Login Popup

**Trigger:** `ButtonClicked`

## Summary
Abre um popup de cadastro ou login quando um botão é clicado.

## Actions
1. **Mostrar Elemento** - Exibe o popup `Signup / Login Popup`.

### Workflow cmUpO0

# Workflow cmUpO0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão específico e sua função é exibir um elemento na tela.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmUpU0`.

### Workflow cmUpm0

# Criar novo GVP e associar membro

**Trigger:** `ButtonClicked` (do elemento com ID `cmUpf0`)

## Summary
Este workflow cria um novo registro do tipo "GVP" e o associa a um membro existente. Ele também oculta um elemento específico após a conclusão.

## Actions
1.  **Criar um novo `custom.gvp`** - Cria um novo registro no banco de dados do tipo "custom.gvp" com os seguintes campos preenchidos:
    *   `congrega__o_text`: Valor do elemento com ID `cmUpa0`.
    *   `nome_membro_text`: Valor do elemento com ID `cmUpX0`.
    *   `e_mail_text`: Valor do elemento com ID `cmUpY0`.
    *   `telefone_text`: Valor do elemento com ID `cmUpZ0`.
    *   `REDACTED`: Valor do elemento com ID `cmUpd0`.
    *   `fun__o_text`: Valor do elemento com ID `cmUpc0`.
2.  **Adicionar `custom.gvp` à lista `gvp_membro_list_custom_gvp` do membro** - Associa o `custom.gvp` recém-criado à lista `gvp_membro_list_custom_gvp` do registro do tipo `custom.hospitais1` referenciado pela ação anterior.
3.  **Resetar Inputs** - Limpa todos os campos de input da página.
4.  **Esconder elemento** - Oculta o elemento com ID `cmUpU0`.

### Workflow cmUqG0

# Esconder menu vertical

**Trigger:** `ButtonClicked`

## Summary
Esconde o elemento de menu vertical ao ser clicado.

## Actions
1.  **Hide Element** - Esconde o elemento `menuvertical`.

## lembretes

# lembretes

## Summary
Esta página contém popups para a criação e edição de lembretes. Os popups permitem inserir um título e o corpo do lembrete, além de botões para salvar e deletar.

### UI
* **Popup lembrete EDIT** (Popup) - Permite a edição de um lembrete existente.
  * **Group E** (Group) - Contêiner para os campos de entrada e botões.
    * **Input título e** (Input) - Campo para o título do lembrete.
    * **MultilineInput lembrete e** (MultiLineInput) - Campo para o corpo do lembrete.
    * **Group B** (Group) - Contêiner para os botões de ação.
      * **Text C** (Text) - Botão para salvar o lembrete.
      * **Text E** (Text) - Botão para deletar o lembrete.
  * **Group H** (Group) - Cabeçalho do popup de edição.
    * **Text D** (Text) - Título do popup.
    * **Icon C** (Icon) - Ícone de fechar o popup.
* **Popup B** (Popup) - Permite a criação de um novo lembrete.
  * **Group D** (Group) - Contêiner para os campos de entrada e botões.
    * **Input titulo n** (Input) - Campo para o título do novo lembrete.
    * **MultilineInput lembrete n** (MultiLineInput) - Campo para o corpo do novo lembrete.

### Workflows
Não há workflows definidos diretamente nesta página.

### Workflow cmPWc

# Workflow Mostrar e Exibir Lembretes

**Trigger:** `ButtonClicked` (Elemento: `cmQBT`)

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de exibir um grupo de elementos e carregar os dados associados a ele.

## Actions
1.  **Show Element** (`cmQCG`) - Torna visível o elemento com ID `cmQBc`.
2.  **Display Group Data** (`cmQCH`) - Carrega dados do grupo pai para o elemento com ID `cmQBc`.

### Workflow cmPWh

# Atualizar Lembrete

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza os campos de texto de um lembrete e oculta um elemento específico.

## Actions
1.  **Alterar Coisa** - Atualiza os campos `texto_text` e `titulo_text` com os valores obtidos dos elementos com IDs `cmQBj` e `cmQBf`, respectivamente.
2.  **Ocultar Elemento** - Oculta o elemento com ID `cmQBc`.

### Workflow cmPXB

# Workflow cmPXB

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão. Ele esconde um elemento específico e, em seguida, deleta um item de dados.

## Actions
1.  **Hide Element** - Esconde o elemento com o ID `cmQBc`.
2.  **Delete Thing** - Deleta o elemento pai do elemento com o ID `cmQBn`.

### Workflow cmPpU

# Workflow Salvar Lembrete e Resetar Formulário

**Trigger:** `ButtonClicked` (elemento: `cmQBp`)

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de criar um novo registro do tipo `lembretes`, resetar os campos do formulário e ocultar um elemento específico.

## Actions
1.  **Create a new thing** (`custom.lembretes`) - Cria um novo registro na base de dados do tipo `lembretes`.
    *   **titulo_text:** Obtém o valor do elemento `cmQBs`.
    *   **texto_text:** Obtém o valor do elemento `cmQBw`.
2.  **Reset inputs** - Limpa os valores de todos os inputs do formulário.
3.  **Hide Element** - Oculta o elemento com ID `cmQBp`.

### Workflow cmPpo

# Exibir Popup de Lembrete

**Trigger:** `ButtonClicked`

## Summary
Este workflow exibe um elemento do tipo popup quando um botão específico é clicado.

## Actions
1.  **Exibir Elemento** - Exibe o elemento `Popup` (ID: `cmQBp`).

### Workflow cmUrh0

# Workflow Ocultar Elemento de Lembrete

**Trigger:** `ButtonClicked` (Botão com ID `cmQBc` clicado)

## Summary
Este workflow oculta um elemento específico quando um botão é clicado, geralmente usado para fechar ou esconder informações visuais em lembretes.

## Actions
1.  **Ocultar Elemento** - Oculta o elemento com ID `cmQBc`.

### Workflow cmUrq0

# Workflow Ocultar Popup Lembretes

**Trigger:** `ButtonClicked` (Elemento: `cmQBp` - Popup Lembretes)

## Summary
Este workflow oculta um elemento popup quando um botão é clicado.

## Actions
1.  **HideElement** - Oculta o elemento `cmQBp` (Popup Lembretes).

## pesquisaeestudo

# pesquisaeestudo (Página)

## Summary
Esta página, denominada "pesquisaeestudo", é destinada à gestão de pesquisas e estudos. Ela apresenta funcionalidades para a criação de novas siglas e o envio de arquivos, integradas através de popups modais.

### UI
* **Head A** (CustomElement) - Cabeçalho principal da página.
* **Popup nova sigla** (Popup) - Modal para inserção de novas siglas.
  * **Group D** (Group) - Container para o input e o botão de salvar.
    * **Input sigla n** (Input) - Campo para digitar a sigla.
    * **Group C** (Group) - Container para o botão de salvar.
      * **Text G** (Text) - Botão "SALVAR".
  * **Group J** (Group) - Cabeçalho do popup de nova sigla.
    * **Text E** (Text) - Título "Nova Sigla".
    * **Icon B** (Icon) - Ícone de fechar.
* **Popup novo arquivo** (Popup) - Modal para envio de arquivos.
  * **Group B** (Group) - Container para o input de nome de arquivo, file input e botão de salvar.
    * **Input nome arquivo n** (Input) - Campo para o nome do arquivo.
    * **Group B** (Group) - Container para o botão de salvar.
      * **Text C** (Text) - Botão "SALVAR".
    * **FileUploader A** (FileInput) - Campo para upload de arquivo.
  * **Group K** (Group) - Cabeçalho do popup de novo arquivo.
    * **Text J** (Text) - Título "Enviar arquivo".
    * **Icon A** (Icon) - Ícone de fechar.

### Workflows
* **UserClickedOpenPopupSigla**: Ao clicar em um elemento não especificado (trigger `UserClickedOpenPopupSigla`), exibe o popup "Popup B".
* **UserClickedClosePopupSigla**: Ao clicar em um elemento não especificado (trigger `UserClickedClosePopupSigla`), fecha o popup "Popup B".
* **UserClickedOpenPopupArquivo**: Ao clicar em um elemento não especificado (trigger `UserClickedOpenPopupArquivo`), exibe o popup "Popup A".
* **UserClickedClosePopupArquivo**: Ao clicar em um elemento não especificado (trigger `UserClickedClosePopupArquivo`), fecha o popup "Popup A".
* **UserClickedSaveSigla**: Ao clicar em um elemento não especificado (trigger `UserClickedSaveSigla`), cria um novo registro no banco de dados (tipo não especificado) com os dados do input "Input sigla n", e então fecha o popup "Popup B".
* **UserClickedSaveArquivo**: Ao clicar em um elemento não especificado (trigger `UserClickedSaveArquivo`), cria um novo registro no banco de dados (tipo não especificado) com os dados do input "Input nome arquivo n" e do file input "FileUploader A", e então fecha o popup "Popup A".

### Workflow cmPpU

# Salvar Pesquisa e Limpar Campos

**Trigger:** `ButtonClicked` (Elemento: Text SALVAR nsigla is clicked)

## Summary
Este workflow é acionado quando o botão "SALVAR nsigla" é clicado. Ele cria um novo registro no tipo de dado "pesquisa_e_estudo", reseta todos os campos de entrada e oculta um elemento específico.

## Actions
1.  **Criar um novo Thing** - Cria um novo registro do tipo `custom.pesquisa_e_estudo`.
    *   Define o campo `siglas_text` com o valor do elemento "Text SALVAR nsigla is clicked" (ID: cmQDG).
2.  **Reset Inputs** - Reseta todos os campos de entrada na página.
3.  **Ocultar Elemento** - Oculta o elemento com ID "cmQDD".

### Workflow cmPpo

# Workflow Abrir Popup de Pesquisa

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado na página de pesquisa e estudo, resultando na exibição de um elemento de popup.

## Actions
1.  **Show Element** - Exibe o elemento com o ID `cmQEh` (Popup de Pesquisa).

### Workflow cmQEF

# Abrir Popup de Elemento

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Ele exibe um elemento específico, que neste contexto, é um popup.

## Actions
1.  **ShowElement**: Exibe o elemento com ID `cmQDD` (Popup de Elemento).

### Workflow cmQEY

# Workflow Salvar Arquivo Pesquisa

**Trigger:** `ButtonClicked` (do elemento com ID `cmQEK`, que não possui nome legível no mapa)

## Summary
Este workflow é acionado pelo clique de um botão e parece estar relacionado ao salvamento de um arquivo.

## Actions
1. **REDACTED** - Realiza uma ação não especificada (REDACTED). Os parâmetros `AAG` e `AAI` referenciam um arquivo (`arquivo_file`) associado ao elemento pai, indicando uma possível interação com um input de upload de arquivo.

---

### Workflow cmQEf

# Excluir Registro Pesquisa Estudo

**Trigger:** `ButtonClicked`

## Summary
Este workflow exclui um registro específico relacionado à pesquisa e estudo.

## Actions
1.  **Delete Thing** - Exclui o registro pai do elemento acionador.

### Workflow cmQEx

# Workflow Salvar Pesquisa e Estudo

**Trigger:** `ButtonClicked` (Elemento: Button SALVAR arq is clicked)

## Summary
Este workflow é acionado quando o botão "SALVAR arq is clicked" é clicado. Ele cria um novo registro do tipo "pesquisa_e_estudo", definindo o arquivo e o nome do documento com base nos inputs do usuário, reseta os campos do formulário e oculta um elemento específico.

## Actions
1.  **Criar um novo `pesquisa_e_estudo`**:
    *   `arquivo_file` é definido com o valor do elemento `cmQEq`.
    *   `nome_doc_text` é definido com o valor do elemento `cmQEl`.
2.  **Resetear Inputs**: Reseta os campos de input do formulário.
3.  **Esconder Elemento**: Esconde o elemento com ID `cmQEh`.

### Workflow cmUtd0

```markdown
# Workflow Pesquisar e Estudar

**Trigger:** `ButtonClicked` (Elemento: `Button Pesquisar Estudo`)

## Summary
Este workflow oculta o elemento "Button Pesquisar Estudo" quando clicado.

## Actions
1. **Ocultar Elemento** - Oculta o elemento com ID `cmQDD`.
```

### Workflow cmUtr0

# Workflow cmUtr0

**Trigger:** `ButtonClicked`

## Summary
Este workflow tem como objetivo ocultar um elemento específico ao ser acionado por um clique.

## Actions
1.  **Ocultar Elemento** - Oculta o elemento com ID `cmQEh`.

## atas

# atas (Página)

## Summary
Esta página exibe uma lista de atas e permite o upload de novos arquivos. Possui um cabeçalho, menu vertical e um popup para adicionar novas atas.

### UI
* **Head A** (CustomElement) - Cabeçalho da página.
  * **Image A** (Image) - Exibe uma imagem condicionalmente visível baseada no status de login do usuário.
* **Group C** (Group) - Contém o título da página e o botão para adicionar novas atas.
  * **Group A** (Group) - Container para o título e botão de adicionar.
    * **Text A** (Text) - Título da página "ATAS".
    * **Text B** (Text) - Botão "Arquivo" que abre um popup, visível apenas para usuários com nível de acesso 1.
* **Popup novo arquivo** (Popup) - Popup para adicionar novas atas.
  * **Group B** (Group) - Container principal do popup.
    * **Input nome arquivo n** (Input) - Campo para inserir o nome do arquivo da ata.
    * **Group B** (Group) - Container para o botão de salvar.
      * **Text C** (Text) - Botão "SALVAR".
    * **FileUploader A** (FileInput) - Campo para upload do arquivo da ata.
  * **Group E** (Group) - Cabeçalho do popup com título e botão de fechar.
    * **Text D** (Text) - Título "Adicionar ATA".
    * **Icon A** (Icon) - Ícone de fechar o popup.

### Workflows
* **Button Clicled "Text C" (SALVAR)** → Show Popup "Popup A" → Create New Thing: `ata` (com dados do Input nome arquivo n e FileUploader A)

### Workflow cmPpo

# Workflow cmPpo

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado e exibe um elemento, provavelmente um popup de detalhes relacionado a atas.

## Actions
1. **Exibir Elemento** - Mostra o elemento com o ID `cmQFl` (provavelmente um popup).

### Workflow cmQEY

# Salvar Arquivo e Nome da Ata

**Trigger:** `ButtonClicked` (do elemento com ID `cmQFS` na página `atas`)

## Summary
Este workflow é acionado quando um botão é clicado. Ele parece salvar um arquivo e um nome de texto, possivelmente relacionados à criação ou edição de uma ata.

## Actions
1.  **REDACTED** - Salva um arquivo associado a um elemento pai e um nome de texto, possivelmente um campo de upload de arquivo e um campo de texto de nome.

### Workflow cmQEf

# Apagar Elemento Pai na Página Atas

**Trigger:** `ButtonClicked` (Elemento: `cmQFT` na página `atas`)

## Summary
Este workflow é acionado ao clicar em um botão e tem como única ação a exclusão de um elemento pai.

## Actions
1.  **Delete Thing** - Apaga o elemento pai.

### Workflow cmQEx

```markdown
# Salvar e Limpar Dados de Ata

**Trigger:** `ButtonClicked` - O botão "SALVAR arq is clicked" (ID: cmQFq) foi clicado.

## Summary
Este workflow salva as informações de um arquivo e um nome de texto no tipo de dado "custom.atas", reseta os campos de entrada e oculta um elemento específico.

## Actions
1.  **Criar novo dado:** Cria um registro no tipo de dado `custom.atas`.
    *   `documento_file`: Obtém o valor do elemento de arquivo com ID `cmQFs`.
    *   `nome_text`: Obtém o valor do elemento de texto com ID `cmQFo`.
2.  **Resetar entradas:** Limpa os valores de todos os campos de entrada no formulário atual.
3.  **Ocultar elemento:** Oculta o elemento com ID `cmQFl`.

```

### Workflow cmUvI0

# Workflow cmUvI0

**Trigger:** `ButtonClicked`

## Summary
Este workflow esconde um elemento específico da UI quando um botão é clicado.

## Actions
1.  **Hide Element** - Esconde o elemento `cmQFl`.

## membrosctba

# membrosctba

## Summary
Página que exibe a lista de membros da congregação CTBA, incluindo informações de contato, cônjuge e horários de reuniões.

### UI
* **Group C** (Group) - Container principal da página.
  * **Group B** (Group) - Container para o título e a lista de membros.
    * **Text A** (Text) - Exibe o título "MEMBROS COLIH CTBA".
    * **Group D** (Group) - Container para o RepeatingGroup.
      * **RepeatingGroup A** (RepeatingGroup) - Exibe a lista de usuários (membros).
        * **Group A** (Group) - Container para os detalhes de cada membro.
          * **Image B** (Image) - Exibe a imagem do avatar do membro.
          * **Group E** (Group) - Container para as informações de contato e detalhes do membro.
            * **Text E** (Text) - Exibe os telefones do membro (celular, comercial, residencial).
            * **Text F** (Text) - Exibe o nome do cônjuge e o telefone do cônjuge.
            * **Text G** (Text) - Exibe a congregação e o horário das reuniões.

### Workflows
Não há workflows definidos nesta página.

## pal_instituicao

# pal_instituicao

## Summary
Página dedicada à gestão de palestras e instituições. Permite buscar instituições, selecionar responsáveis e adicionar novas instituições.

### UI
* **Group** (`cmVbN`) - Container principal da página.
  * **Group** (`cmPVk`) - Grupo de navegação e título da página.
    * **Text** (`cmRFS`) - Título: "Palestrantes / Instituições".
  * **Group** (`cmRbv`) - Grupo de filtros e ações.
    * **Group** (`cmVbS`) - Grupo contendo os dropdowns de filtro.
      * **Group** (`cmRVx`) - Grupo do dropdown de instituição.
        * **Dropdown** (`cmRIS`) - Seleciona a instituição. Busca em `custom.cadastropalestras`. Opção de exibição: `nome_instituicao_text`.
        * **Icon** (`cmRVr`) - Ícone de busca para o dropdown de instituição.
      * **Group** (`cmRWC`) - Grupo do dropdown de responsável.
        * **Dropdown** (`cmRVo`) - Seleciona o responsável. Opções pré-definidas: Cristian A. de Lara, Louise Xavier, Thomas Karsten, Valquíria Zambão, Vítor Durães.
        * **Icon** (`cmRVu`) - Ícone de busca para o dropdown de responsável.
    * **Text** (`cmRFc`) - Botão para adicionar nova instituição com ícone de "+".
  * **Group** (`cmVbV`) - Grupo de conteúdo adicional, inicialmente oculto.
    * **Group** (`cmRWR`) - Grupo de links, inicialmente oculto.
      * **Text** (`cmRWT`) - Link "Acadêmicos".
      * **Text** (`cmRWU`) - Link "Eventos".
      * **Text** (`cmRWT`) - Link "Palestrantes".

### Workflows
(Não há workflows documentados para esta página com base nos dados fornecidos.)

### Workflow cmPpo

# Workflow cmPpo

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Sua principal ação é exibir um elemento do tipo popup.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmRFh`.

### Workflow cmQEx

# Workflow cmQEx

**Trigger:** `ButtonClicked` (Elemento: "Text SALVAR arq is clicked")

## Summary
Este workflow é acionado quando o botão "Text SALVAR arq is clicked" é clicado. Ele coleta dados de vários campos de entrada na página e os armazena, possivelmente criando ou atualizando um registro de instituição.

## Actions
1.  **Cria um novo thing ou modifica um thing existente** - Coleta os seguintes dados dos elementos da página e os associa às chaves indicadas:
    *   `arquivos_list_file` (do elemento "Elemento de Upload cmRIG") é adicionado à lista.
    *   `cidade_text` (do elemento "Input Cidade cmRHE").
    *   `data_abertura_text` (do elemento "Input Data Abertura cmRTv").
    *   `detalhes_contato_text` (do elemento "Input Detalhes Contato cmRHx").
    *   `dptfuncao_contato_text` (do elemento "Input Dpto/Função cmRHo").
    *   `e_mail_contato_text` (do elemento "Input Email Contato cmRHT").
    *   `endereco_text` (do elemento "Input Endereço cmRGy").
    *   `nome_contato_text` (do elemento "Input Nome Contato cmRHf").
    *   `nome_instituicao_text` (do elemento "Input Nome Instituição cmRFk").
    *   `outrosctt_uteis_text` (do elemento "Input Outros Contatos cmRHr") com um valor adicional vazio.
    *   `respons_vel_text` (do elemento "Input Responsável cmRGa").
    *   `tel_contato_text` (do elemento "Input Telefone Contato cmRHZ").
    *   `tipo_institui__o_text` (do elemento "Input Tipo Instituição cmRGp").
    *   `tipo_publico_text` (do elemento "Input Tipo Público cmRFo").
    *   `uf_text` (do elemento "Input UF cmRGE").

### Workflow cmQFL

# Workflow cmQFL

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e sua principal função é esconder um elemento específico.

## Actions
1. **Hide Element** - Esconde o elemento com `element_id` "cmRFh".

### Workflow cmRJh

# Workflow Remover Arquivo

**Trigger:** `ButtonClicked`

## Summary
Remove um arquivo da lista 'arquivos_list_file' do elemento 'Group Dados'.

## Actions
1.  **Remover Arquivo** - Remove a entrada 'ElementParent' da lista `arquivos_list_file` do elemento `Group Dados`.
2.  **Obter Dados do Grupo** - Executa a ação `get_group_data` no elemento `Group Dados`.

### Workflow cmRJl

# Workflow Salvar Instituição

**Trigger:** `ButtonClicked`

## Summary
Workflow acionado ao clicar em um botão, responsável por salvar os dados da instituição.

## Actions
1. **Salvar Instituição** - Salva os dados de "ElementParent" (Pai do Elemento) e "ElementParent" (Pai do Elemento) em um novo registro do tipo "Instituição".
2. **Redirecionar para página** - Redireciona o usuário para a página `pal_instituicao`.

### Workflow cmRKk

# Exibir Pop-up de Detalhes

**Trigger:** `ButtonClicked` (Elemento: `Button cmRKk`)

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de exibir um elemento de pop-up e carregar seus dados.

## Actions
1.  **Exibir Elemento** - Torna visível o elemento pop-up (`Popup cmRJu`).
2.  **Exibir Dados do Grupo** - Carrega os dados do elemento pai para o pop-up (`Popup cmRJu`).

### Workflow cmRNQ

# Salvar Dados do Contato da Instituição

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando o botão "SALVARedit" é clicado. Ele atualiza os dados de contato de uma instituição, salvando informações provenientes de diversos campos de entrada.

## Actions
1.  **Modificar Lista** (`arquivos_list_file`) - Adiciona o valor obtido do elemento "get_data" (`cmRNG`) à lista `arquivos_list_file`.
2.  **Modificar Texto** (`cidade_text`) - Define o campo `cidade_text` com o valor obtido do elemento `cmRMB`.
3.  **Modificar Texto** (`detalhes_contato_text`) - Define o campo `detalhes_contato_text` com o valor obtido do elemento `cmRNA`.
4.  **Modificar Texto** (`dptfuncao_contato_text`) - Define o campo `dptfuncao_contato_text` com o valor obtido do elemento `cmRMo`.
5.  **Modificar Texto** (`e_mail_contato_text`) - Define o campo `e_mail_contato_text` com o valor obtido do elemento `cmRMi`.
6.  **Modificar Texto** (`endereco_text`) - Define o campo `endereco_text` com o valor obtido do elemento `cmRLv`.
7.  **Modificar Texto** (`nome_contato_text`) - Define o campo `nome_contato_text` com o valor obtido do elemento `cmRMW`.
8.  **Modificar Texto** (`nome_instituicao_text`) - Define o campo `nome_instituicao_text` com o valor obtido do elemento `cmRLp`.
9.  **Modificar Texto** (`outrosctt_uteis_text`) - Define o campo `outrosctt_uteis_text` com o valor obtido do elemento `cmRMu`.
10. **Modificar Texto** (`respons_vel_text`) - Define o campo `respons_vel_text` com o valor obtido do elemento `cmRLX`.
11. **Modificar Texto** (`tel_contato_text`) - Define o campo `tel_contato_text` com o valor obtido do elemento `cmRMc`.
12. **Modificar Texto** (`tipo_institui__o_text`) - Define o campo `tipo_institui__o_text` com o valor obtido do elemento `cmRLj`.
13. **Modificar Texto** (`tipo_publico_text`) - Define o campo `tipo_publico_text` com o valor obtido do elemento `cmRMN`.
14. **Modificar Texto** (`uf_text`) - Define o campo `uf_text` com o valor obtido do elemento `cmRMH`.

### Workflow cmRRp

# Workflow Abrir Popup Detalhes Instituição

**Trigger:** `Button Clicked`

## Summary
Este workflow é acionado ao clicar em um botão, exibindo um popup com detalhes da instituição e carregando os dados relevantes para visualização.

## Actions
1. **Show Element** - Exibe o elemento "**float**" (ID: `cmVpN`), que provavelmente é o popup de detalhes.
2. **Display Group Data** - Carrega os dados do grupo "**float**" (ID: `cmVpN`) com base nos seus dados pai.

### Workflow cmRSY

# Workflow: Salvar Nova Palestra e Limpar Formulário

**Trigger:** `ButtonClicked` (Botão "Text SALVAR palestra is clicked")

## Summary
Este workflow é acionado quando o botão "SALVAR palestra" é clicado. Ele cria um novo registro de palestra no banco de dados, armazena informações provenientes de campos de entrada e, em seguida, redefine esses campos e oculta um elemento específico.

## Actions
1.  **Criar Novo `custom.novapalestra`**:
    *   `local_pal_text`: Valor do campo de entrada com ID `cmRSS`.
    *   `data_pal_text`: Valor do campo de entrada com ID `cmRTs`.
    *   `assist_pal_text`: Valor do campo de entrada com ID `cmRRh`.
    *   `qtdade_material_pal_text`: Valor do campo de entrada com ID `cmRRa`.
    *   `info_add_pal_text`: Valor do campo de entrada com ID `cmRRi`.
    *   `palestrante_pal_text`: Valor do campo de entrada com ID `cmRRg`.
2.  **Redefinir Campos de Entrada**: Limpa os valores de todos os campos de entrada utilizados na criação da nova palestra.
3.  **Esconder Elemento**: Esconde o elemento com ID `cmRRW`.

### Workflow cmRSv

# Workflow cmRSv

**Trigger:** `ButtonClicked` (Elemento: `pal_instituicao Button cmRJu`)

## Summary
Este workflow oculta um elemento específico na página "pal_instituicao" quando um botão é clicado.

## Actions
1.  **Ocultar Elemento** - Oculta o elemento com o ID `cmRJu`.

### Workflow cmRSz

# Ocultar Elemento Popup

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico da interface do usuário quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento com o ID `cmRRW`.

### Workflow cmRTh

# Workflow cmRTh

**Trigger:** `ButtonClicked` - Elemento `float`

## Summary
Este workflow é acionado quando o elemento "float" é clicado, executando a ação de ocultar o próprio elemento.

## Actions
1.  **Hide Element** - Oculta o elemento `float`.

### Workflow cmRTl

# Workflow SALVAR edit palestra

**Trigger:** `ButtonClicked` (Elemento: Text SALVAR edit palestra is clicked)

## Summary
Atualiza os dados de uma palestra existente com informações de campos de entrada e fecha um popup.

## Actions
1.  **Change Thing** - Atualiza os campos `assist_pal_text`, `data_pal_text`, `info_add_pal_text`, `palestrante_pal_text`, `qtdade_material_pal_text` e `user_ed_pal_text` do elemento `GroupPALESTRA_EDIT` (ID: cmRTI) com os valores dos campos de texto correspondentes (IDs: cmRTX, cmRTc, cmRTY, cmRTW, cmRTL, cmRUE).
2.  **Hide Element** - Esconde o elemento `GroupPALESTRA_EDIT` (ID: cmRTI).

### Workflow cmRTp

# Workflow cmRTp

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado pelo clique de um botão, exibindo um elemento e carregando dados nesse elemento.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmRTI`.
2.  **Display Group Data** - Carrega dados do elemento pai para o elemento com ID `cmRTI`.

### Workflow cmRWJ

# Workflow cmRWJ

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão, o que resulta na exibição de um elemento específico e na exibição de dados associados a esse elemento.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmRJu` (resolver para nome legível).
2.  **Display Group Data** - Exibe dados do grupo, utilizando os dados do elemento pai do elemento com ID `cmRJu` (resolver para nome legível).

### Workflow cmRWO

# Workflow cmRWO

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de exibir detalhes de uma instituição e carregar seus dados.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmRTI`.
2.  **Display Group Data** - Carrega os dados do elemento pai para o elemento com ID `cmRTI`.

### Workflow cmRWj

```json
{
  "pages": {
    "bTGbC": "index",
    "cmMYA": "menu",
    "cmMhM": "plant_o",
    "cmMjQ": "minha_conta",
    "cmMnf": "encerrado_estudar",
    "cmNrc": "teste",
    "cmOAd": "cadastro_newuser",
    "cmOQI": "painel_controle",
    "cmPFX": "minhasub",
    "cmPqu": "gvp",
    "cmQCW": "lembretes",
    "cmQDh": "pesquisaeestudo",
    "cmQGO": "atas",
    "cmQnY": "membrosctba",
    "cmRGZ": "pal_instituicao",
    "cmRob": "view_palestras",
    "cmSTT": "relatorio",
    "cmSYD": "reg_novo_caso",
    "cmSwE": "atualizar_ler_caso",
    "cmVPP": "colihcwb",
    "cmVuY": "medddicos",
    "cmVzV": "newgvp",
    "cmWRJ": "menugvp",
    "cmXCr": "fotogvp",
    "cmXGy": "sandbox",
    "cmNfP0": "endere_telefones",
    "cmNxh0": "med_cad_espec",
    "cmQHI0": "palestraseventos",
    "cmTEb0": "casos",
    "cmTHl0": "lista_de_casos",
    "AAW": "reset_pw",
    "AAX": "404",
    "cmMoM": "ler_casoencerrado"
  },
  "elements": {
    "cmMjm": "Head",
    "cmPKP": "menuvertical",
    "cmPTx": "cabeçalho",
    "cmRQo": "HEAD VOLUN",
    "cmSmf": "Head_copy",
    "cmTJQ": "Menuvertical AAA",
    "cmVpN": "float",
    "ACr": "Signup / Login Popup",
    "bTGiM": "Header",
    "bTGkF": "Footer",
    "cmMlO": "foot",
    "cmNTj": "menu2"
  },
  "dataTypes": {},
  "optionSets": {},
  "workflows": {
    "cmRWj": "Abrir Popup Cadastro Usuário"
  },
  "backendWorkflows": {
    "cmVcU": "del_ferias",
    "cmWUW": "sendWHATS_lembretedesign",
    "cmXEL": "sendtel_iniciodesign_ajudante",
    "cmXEX": "sendtel_lembretedesign_ajudante",
    "cmXEt": "REDACTED"
  }
}
```

# Abrir Popup Cadastro Usuário

**Trigger:** `ButtonClicked` (elemento: "Button Cadastrar novo")

## Summary
Este workflow aciona a exibição do popup de cadastro de novo usuário.

## Actions
1.  **Toggle Element** (element: "Signup / Login Popup") - Exibe o popup "Signup / Login Popup".

### Workflow cmRbB

# Ocultar Elemento

**Trigger:** `ButtonClicked` (Elemento: `cmRaw`)

## Summary
Este workflow oculta um elemento específico quando um botão é clicado.

## Actions
1. **Hide Element** - Oculta o elemento com ID `cmRaY`.

### Workflow cmRbO

# Workflow cmRbO

**Trigger:** `ButtonClicked` (Elemento: `Button`)

## Summary
Este workflow oculta um elemento específico na página `pal_instituicao` quando um botão é clicado.

## Actions
1.  **Ocultar Elemento** - Oculta o elemento com ID `cmRbD`.

### Workflow cmRbb

# Abrir/Fechar Popup

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de controlar a visibilidade de elementos na página.

## Actions
1.  **Show Element**: Exibe o elemento com ID `cmRaY`.
2.  **Toggle Element**: Alterna a visibilidade do elemento com ID `cmRWR`.

### Workflow cmRbf

# Workflow cmRbf

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado pelo clique de um botão para exibir ou alternar a visibilidade de elementos na página.

## Actions
1.  **Show Element** - Exibe o elemento com o ID `cmRbD`.
2.  **Toggle Element** - Alterna a visibilidade do elemento com o ID `cmRWR`.

### Workflow cmRbj

# Workflow cmRbj

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado pelo clique de um botão para exibir um elemento e alternar a visibilidade de outro.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmRbQ`.
2.  **Toggle Element** - Alterna a visibilidade do elemento com ID `cmRWR`.

### Workflow cmRbn

# Fechar Popup Instrução

**Trigger:** `ButtonClicked`

## Summary
Este workflow fecha um popup de elemento quando um botão é clicado.

## Actions
1.  **HideElement** - Oculta o elemento com ID `cmRbQ` (resolvido para o nome do elemento).

## view_palestras

# view_palestras

## Summary
Página dedicada à exibição de conteúdo relacionado a palestras e eventos, organizada em seções como LIVES e RG's.

### UI
* **Head** (Group) - Cabeçalho da página.
  * **menuvertical** (Group) - Menu de navegação vertical.
    * **cabeçalho** (Group) - Elemento de cabeçalho.
      * **Text A** (Text) - Título "Palestrantes".
      * **Group LIVES** (Group) - Seção para conteúdo LIVES.
        * **Group D** (Group) - Contêiner para o ícone e texto da seção LIVES.
          * **Text D** (Text) - Ícone de seta indicando expansão/retração.
          * **Text D** (Text) - Título "LIVES".
      * **Group RGS** (Group) - Seção para conteúdo RG's.
        * **Group E** (Group) - Contêiner para o ícone e texto da seção RG's.
          * **Text E** (Text) - Ícone de seta indicando expansão/retração.
          * **Text E** (Text) - Título "RG's".
      * **Group W** (Group) - Seção expansível para conteúdo LIVES.
        * **Group W** (Group) - Contêiner principal para o conteúdo LIVES.
          * **Group W** (Group) - Contêiner para elementos internos do conteúdo LIVES.

### Workflows
Não há workflows definidos para esta página no trecho fornecido.

### Workflow cmRsQ

# Workflow Alternar Visibilidade Menu Vertical

**Trigger:** `ButtonClicked` (Elemento: `cmRsX`)

## Summary
Alterna a visibilidade de um elemento específico.

## Actions
1.  **Alternar Elemento** (`ToggleElement`) - Altera o estado de visibilidade do elemento `cmPKP` (menuvertical).

### Workflow cmRse

# Workflow Alternar Popup Menu Vertical

**Trigger:** `ButtonClicked` (Elemento: `cmRrh`)

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de alternar a visibilidade de um elemento popup.

## Actions
1. **Alternar Elemento** (`cmRsf`) - Exibe ou oculta o elemento popup com ID `cmRsh`.

### Workflow cmRtC

# Mostrar Popup de Menu

**Trigger:** `ButtonClicked` (Elemento: `cmRst`)

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de exibir um elemento pop-up.

## Actions
1.  **ToggleElement** - Exibe o elemento `cmRsx` (Float).

### Workflow cmRtR

# Workflow cmRtR

**Trigger:** `ButtonClicked` - Elemento "**PALESTRAS A3**"

## Summary
Este workflow é acionado quando o botão "PALESTRAS A3" é clicado. Sua principal função é alternar a visibilidade de um elemento associado.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento "**PALESTRAS A3**".

### Workflow cmRte

# Alternar Visibilidade Grupo Palestra

**Trigger:** `ButtonClicked` (Elemento: `Group PALESTRAS A3 is clicked`)

## Summary
Este workflow alterna a visibilidade de um elemento específico quando um botão é clicado.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento `Group PALESTRAS A3 is clicked (Element ID: cmRtY)`.

### Workflow cmRtr

# Workflow cmRtr

**Trigger:** `ButtonClicked` (Elemento: PALESTRAS A3)

## Summary
Este workflow é acionado quando o botão "PALESTRAS A3" é clicado, com o objetivo de alternar a visibilidade de um elemento popup.

## Actions
1. **Toggle Element** - Alterna a visibilidade do elemento com ID `cmRtl`.

### Workflow cmRuE

# Workflow cmRuE

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado. Ele tem como objetivo alternar a visibilidade de um elemento.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento **float**.

### Workflow cmRuR

# Workflow cmRuR

**Trigger:** `ButtonClicked` (Elemento: Grupo PALESTRAS A3)

## Summary
Este workflow exibe ou oculta um grupo específico na página "view_palestras" quando o botão "Grupo PALESTRAS A3" é clicado.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento Grupo PALESTRAS A3.

### Workflow cmRue

```json
{
  "pages": {
    "bTGbC": "index",
    "cmMYA": "menu",
    "cmMhM": "plant_o",
    "cmMjQ": "minha_conta",
    "cmMnf": "encerrado_estudar",
    "cmNrc": "teste",
    "cmOAd": "cadastro_newuser",
    "cmOQI": "painel_controle",
    "cmPFX": "minhasub",
    "cmPqu": "gvp",
    "cmQCW": "lembretes",
    "cmQDh": "pesquisaeestudo",
    "cmQGO": "atas",
    "cmQnY": "membrosctba",
    "cmRGZ": "pal_instituicao",
    "cmRob": "view_palestras",
    "cmSTT": "relatorio",
    "cmSYD": "reg_novo_caso",
    "cmSwE": "atualizar_ler_caso",
    "cmVPP": "colihcwb",
    "cmVuY": "medddicos",
    "cmVzV": "newgvp",
    "cmWRJ": "menugvp",
    "cmXCr": "fotogvp",
    "cmXGy": "sandbox",
    "cmNfP0": "endere_telefones",
    "cmNxh0": "med_cad_espec",
    "cmQHI0": "palestraseventos",
    "cmTEb0": "casos",
    "cmTHl0": "lista_de_casos",
    "AAW": "reset_pw",
    "AAX": "404",
    "cmMoM": "ler_casoencerrado"
  },
  "elements": {
    "cmMjm": "Head",
    "cmPKP": "menuvertical",
    "cmPTx": "cabeçalho",
    "cmRQo": "HEAD VOLUN",
    "cmSmf": "Head_copy",
    "cmTJQ": "Menuvertical AAA",
    "cmVpN": "float",
    "ACr": "Signup / Login Popup",
    "bTGiM": "Header",
    "bTGkF": "Footer",
    "cmMlO": "foot",
    "cmNTj": "menu2"
  },
  "dataTypes": {},
  "optionSets": {},
  "workflows": {},
  "backendWorkflows": {
    "cmVcU": "del_ferias",
    "cmWUW": "sendWHATS_lembretedesign",
    "cmXEL": "sendtel_iniciodesign_ajudante",
    "cmXEX": "sendtel_lembretedesign_ajudante",
    "cmXEt": "REDACTED"
  }
}
```

# Workflow PALESTRAS A3 Clicked

**Trigger:** `ButtonClicked` (Elemento: `PALESTRAS A3`)

## Summary
Este workflow é acionado quando o botão "PALESTRAS A3" é clicado e tem como objetivo alternar a visibilidade de um elemento.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento `float`.

### Workflow cmRur

# Abrir Menu Lateral Palestras

**Trigger:** `ButtonClicked` (Elemento: `Group PALESTRAS A3`)

## Summary
Este workflow é acionado ao clicar em um grupo específico ("Group PALESTRAS A3") e tem como objetivo alternar a visibilidade de um elemento lateral.

## Actions
1. **ToggleElement** - Alterna a visibilidade do elemento `Group PALESTRAS A3 is clicked`.

### Workflow cmRyS

# Toggle Grupo Palestras

**Trigger:** `ButtonClicked` (Elemento: `Group PALESTRAS A3 is clicked`)

## Summary
Este workflow é acionado quando um grupo específico na página "view_palestras" é clicado, com o objetivo de alternar a visibilidade de outro elemento.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento `Group PALESTRAS A3 is clicked`.

### Workflow cmRyf

```json
{
  "name_sugerido": "Exibir/Ocultar Popup PALESTRAS A3"
}
```
# Workflow Exibir/Ocultar Popup PALESTRAS A3

**Trigger:** `ButtonClicked` - Elemento "PALESTRAS A3" na página "view_palestras"

## Summary
Este workflow é acionado quando o botão "PALESTRAS A3" é clicado, com o propósito de alternar a visibilidade de um elemento popup.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento popup com ID "cmRyZ".

### Workflow cmRzV

# Workflow cmRzV

**Trigger:** `ButtonClicked`

## Summary
Este workflow alterna a visibilidade de um elemento de menu lateral quando um botão específico é clicado.

## Actions
1. **ToggleElement** - Alterna a visibilidade do elemento **menuvertical** (ID: cmPKP).

### Workflow cmRzZ

# Workflow Abrir Menu Lateral

**Trigger:** `ButtonClicked` (Elemento: `cmPKP - menuvertical`)

## Summary
Este workflow é acionado ao clicar no botão do menu vertical e tem como objetivo alternar a visibilidade do elemento `float`.

## Actions
1. **Toggle Element** - Alterna a visibilidade do elemento `float`.

---

### Workflow cmRzd

```json
{
  "name_suggested": "Exibir/Ocultar Elemento Flutuante",
  "documentation": "# Exibir/Ocultar Elemento Flutuante\n\n**Trigger:** `ButtonClicked`\n\n## Summary\nEste workflow é acionado quando um botão é clicado e tem como objetivo exibir ou ocultar um elemento flutuante.\n\n## Actions\n1. **ToggleElement** - Alterna a visibilidade do elemento flutuante **float**."
}
```

### Workflow cmRzo

# Workflow cmRzo

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e sua principal função é alternar a visibilidade de um elemento popup.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento `float` (Popup).

### Workflow cmSAR

# Workflow cmSAR

**Trigger:** `ButtonClicked` (Elemento: **Botão Filtrar** - Este elemento não está no mapa de referências fornecido, assumindo que é o botão que dispara o workflow.)

## Summary
Este workflow é acionado pelo clique em um botão e tem como objetivo alternar a visibilidade de um elemento, provavelmente um popup de filtro.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento com ID `cmRzx` (nome legível não fornecido no mapa).

### Workflow cmSAV

# Workflow cmSAV

**Trigger:** `ButtonClicked` (Elemento: `cmSAE` - [Nome não encontrado no mapa de referências para elemento, use ID `cmSAE` se necessário])

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de alternar a visibilidade de um elemento popup.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento com ID `cmSAE` (Popup Notificação).

### Workflow cmSAZ

# Workflow cmSAZ

**Trigger:** `ButtonClicked` (Elemento: `PALESTRAS A3`)

## Summary
Este workflow ativa/desativa a visibilidade de um elemento popup (Float).

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento `float` (ID: cmVpN).

### Workflow cmSAc

```markdown
# Workflow cmSAc

**Trigger:** `ButtonClicked` - Botão "cmRrz"

## Summary
Este workflow ativa a funcionalidade de alternar a visibilidade de um elemento, provavelmente um menu lateral ou similar.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento "cmRzq" (Elemento não especificado no mapa de referência).
```

### Workflow cmSAq

# Workflow cmSAq

**Trigger:** `ButtonClicked` (Elemento: `Group PALESTRAS A3`)

## Summary
Este workflow é acionado quando o botão "Group PALESTRAS A3" é clicado. Sua principal função é alternar a visibilidade de outro elemento.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento `cmSAk`.

### Workflow cmRwx0

# Workflow cmRwu0

**Trigger:** `ButtonClicked` (Elemento: `cmRvV0`)

## Summary
Este workflow é acionado quando um botão é clicado para alternar a visibilidade de um elemento.

## Actions
1.  **Toggle Element** (`cmRww0`) - Alterna a visibilidade do elemento `cmRvZ0`.

### Workflow cmRxB0

# Workflow cmRxB0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, com o objetivo de alternar a visibilidade de um elemento float.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento **float**.

### Workflow cmRxF0

```markdown
# Workflow PALESTRAS A3 é clicado

**Trigger:** `ButtonClicked` (Elemento: `Group PALESTRAS A3`)

## Summary
Este workflow é acionado quando o elemento "Group PALESTRAS A3" é clicado e tem como objetivo alternar a visibilidade de outro elemento.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento `Group PALESTRAS A3`.

```

### Workflow cmRxq0

# Abrir popup PALESTRAS A3

**Trigger:** `ButtonClicked` (Elemento: `PALESTRAS A3`)

## Summary
Abre o popup "PALESTRAS A3" ao clicar no botão correspondente.

## Actions
1.  **Exibir/Ocultar Elemento** - Exibe o popup "PALESTRAS A3".

### Workflow cmRxy0

# Group PALESTRAS A3 is clicked

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando o botão "PALESTRAS A3" é clicado, com o objetivo de alternar a visibilidade de um elemento associado.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento **float**.

### Workflow cmRyE0

# Workflow Abrir Modal Palestras

**Trigger:** `ButtonSairNoPageLoaded`

## Summary
Este workflow é acionado quando o botão "Sair" é clicado na página `view_palestras`. Ele tem a função de fechar um elemento do tipo popup, possivelmente relacionado a um modal.

## Actions
1.  **Toggle Element** - Fecha o elemento popup de ID `cmRvS0`.

### Workflow cmSBP0

# Workflow cmSBP0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado, com o propósito de alternar a visibilidade de um elemento.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento `Menuvertical AAA`.

### Workflow cmSBc0

# Workflow cmSBc0

**Trigger:** `Button "PALESTRAS A3" is clicked`

## Summary
Este workflow é acionado ao clicar no botão "PALESTRAS A3". Sua função principal é alternar a visibilidade de um elemento específico.

## Actions
1.  **Toggle element** - Alterna a visibilidade do elemento `Group PALESTRAS A3` (ID: `cmSBW0`).

## relatorio

# relatorio (Página)

## Summary
Página que exibe um relatório com totais de casos. Apresenta contagens de casos encerrados, casos de transferência e casos transfundidos dentro de um período específico.

### UI
* **Group A** (Group) - Container principal da página.
  * **Text A** (Text) - Exibe o "Total de casos" e a contagem de casos encerrados nos últimos meses.
  * **Text B** (Text) - Exibe "Transpac's" e a contagem de casos com `transfundido_boolean` verdadeiro nos últimos meses.
  * **Text C** (Text) - Exibe "Transfundidos" e a contagem de casos com `transpac_boolean` verdadeiro nos últimos meses.

### Workflows
Não há workflows definidos para esta página.

## reg_novo_caso

# reg_novo_caso

## Summary
Página destinada ao registro de novos casos, permitindo a inserção de dados clínicos e resultados de exames.

### UI
* **Head** (Group) - Cabeçalho da página
  * **menuvertical** (Group) - Menu de navegação vertical
    * **cabeçalho** (Group) - Elemento de cabeçalho
    * **float** (Group) - Grupo flutuante para exibição de conteúdo
      * **Group CZZ** (Group) - Grupo para entrada de dados
        * **Group XZ** (Group) - Agrupamento interno para data e hora do exame
          * **Input dh ex 1** (Input) - Campo de entrada para data e hora do exame
          * **Text** (Text) - Rótulo "Data e hora do exame"
        * **Group YZ** (Group) - Agrupamento interno para Hemoglobina
          * **Input hb1** (Input) - Campo de entrada para Hemoglobina
          * **Text** (Text) - Rótulo "Hemoglobina (Hb g/dL):"
        * **Group ZZ** (Group) - Agrupamento interno para Plaquetas
          * **Input plq 1** (Input) - Campo de entrada para Plaquetas
          * **Text** (Text) - Rótulo "Plaquetas (Plq/μL):"
        * **Group AZZ** (Group) - Agrupamento interno para Hematócrito
          * **Input ht1** (Input) - Campo de entrada para Hematócrito
          * **Text** (Text) - Rótulo "Hematócrito (Ht %):"
        * **Group BZZ** (Group) - Agrupamento interno para outros valores de exame
          * **Input outro val exa1** (Input) - Campo de entrada para outros valores de exame
          * **Text** (Text) - Rótulo para outros valores de exame

### Workflows
Não há workflows definidos para esta página.

### Workflow cmMbP

# Workflow cmMbP

**Trigger:** `ButtonClicked` (Elemento: **[Elemento não encontrado no mapa: cmSXK]**)

## Summary
Este workflow atualiza contadores relacionados a casos e GVPs, e cria um novo registro de contato GVP.

## Actions
1.  **Change Thing** - Incrementa o campo `total_number` do tipo `custom.contador` onde `tipo_text` é "caso".
2.  **Change Thing** - Incrementa o campo `qntdcaso_number` do tipo `custom.gvp` onde `grupogvp_custom_gvpgrupo` contém o valor do elemento `cmSbj` e ordena por "Modified Date".
3.  **Create a new Thing** - Cria um novo registro do tipo `custom.contato_gvp` com os seguintes campos:
    *   `dat_ho_contato_text`: Valor do elemento `cmSYZ`.
    *   `nome_telefonou_text`: Valor do elemento `cmSYk`.
    *   `cont_q_telef_text`: Concatena valores dos elementos `cmVml`, "", `cmVmo`, "", `cmSYp`, "".
    *   `parent_c_pac_text`: Valor do elemento `cmSZI`.
    *   `membro_respons_text`: Valor do elemento `cmSZN`.
    *   `nome_paciente_text`: Valor do elemento `[Elemento não encontrado no mapa: cmSYv]`.

### Workflow cmVGZ

# Ocultar Elemento ao Clicar

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento com ID `cmVGQ`.

### Workflow cmVGx

# Salvar Novo Caso Médico

**Trigger:** `ButtonClicked` (Elemento: `cmVGx`)

## Summary
Este workflow é acionado quando o botão "Salvar" é clicado na página de registro de novo caso. Ele cria dois novos registros no banco de dados: um para informações médicas gerais e outro para detalhes específicos de médicos. Finalmente, limpa os campos de entrada e oculta um elemento.

## Actions
1.  **Create a new thing** (`custom.medicos1`)
    *   **Condição:** Nenhum
    *   **O que faz:** Cria um novo registro no tipo de dado `medicos1`.
    *   **Valores:**
        *   `nome_text`: Valor do campo de entrada `cmVGb`.
        *   `crm_uf_text`: Valor do campo de entrada `cmVGe`.
        *   `REDACTED`: Valor do campo de entrada `cmVHE`.
2.  **Create a new thing** (`custom.medicos_geral`)
    *   **Condição:** Nenhum
    *   **O que faz:** Cria um novo registro no tipo de dado `medicos_geral`.
    *   **Valores:**
        *   `crm_uf_text`: Valor do passo anterior (`cmVGy`).
        *   `REDACTED`: Valor do passo anterior (`cmVGy`).
        *   `nome_text`: Valor do passo anterior (`cmVGy`).
3.  **Reset inputs**
    *   **Condição:** Nenhum
    *   **O que faz:** Limpa todos os campos de entrada na página atual.
4.  **Hide**
    *   **Condição:** Nenhum
    *   **O que faz:** Oculta o elemento `cmVGQ`.

### Workflow cmVHM

# Workflow Exibir Elemento

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e sua principal função é exibir um elemento específico na interface do usuário.

## Actions
1.  **ShowElement** - Exibe o elemento "**float**" (Elemento).

### Workflow cmVWX

# Exibir Popup Novo Caso

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado pelo clique de um botão e tem como objetivo exibir um elemento popup.

## Actions
1.  **Exibir elemento** - Mostra o popup com ID `cmVGQ`.

### Workflow cmSxB0

# Workflow cmSwz0

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento com ID `cmSws0`.

### Workflow cmSxJ0

# Workflow cmSxJ0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado pelo clique de um botão e exibe um elemento na tela.

## Actions
1.  **Show Element**: Exibe o elemento `cmSws0`.

### Workflow cmWtw1

# Atualizar Contador e Criar Caso

**Trigger:** `ButtonClicked` (elemento "cmSXK" - **Não mapeado**)

## Summary
Este workflow atualiza um contador no banco de dados e cria um novo registro de caso com dados de formulário.

## Actions
1.  **Change Thing (custom.contador)**: Incrementa o campo `total_number` em 1 para o primeiro elemento encontrado com `tipo_text` igual a "caso".
2.  **Create Thing (custom.caso)**: Cria um novo registro do tipo `custom.caso` com os seguintes campos preenchidos a partir de inputs:
    *   `dat_ho_contato_text`: Valor do elemento "cmSYZ" (**Não mapeado**).
    *   `nome_telefonou_text`: Valor do elemento "cmSYk" (**Não mapeado**).
    *   `cont_q_telef_text`: Concatena valores dos elementos "cmVml" (**Não mapeado**), "" (vazio), "cmVmo" (**Não mapeado**), "" (vazio), "cmSYp" (**Não mapeado**), "" (vazio).
    *   `parent_c_pac_text`: Valor do elemento "cmSZI" (**Não mapeado**).
    *   `membro_respons_text`: Valor do elemento "cmSZN" (**Não mapeado**).
    *   `nome_paciente_text`: Valor do elemento "cmSZh" (**Não mapeado**), convertido para maiúsculas.
    *   `tipo_atend_pub_boolean`: Valor do elemento "cmSZv" (**Não mapeado**).
    *   `tipo_atend_part_boolean`: Valor do elemento "cmSaA" (**Não mapeado**).
    *   `tipo_atend_plano_boolean`: Valor do elemento "cmSaF" (**Não mapeado**).
    *   `nome_plano_text`: Valor do elemento "cmSaR" (**Não mapeado**).
    *   `sexo_text`: Valor do elemento "cmSaX" (**Não mapeado**).

## atualizar_ler_caso

# atualizar_ler_caso

## Summary
Página destinada à atualização e visualização de detalhes de um caso. Contém campos para informações como morbidade, especialidade, tags, e indicadores de notificação.

### UI
* **Head** (Elemento Reutilizável) - Cabeçalho da página.
* **Menuvertical AAA** (Elemento Reutilizável) - Menu de navegação lateral.
* **float** (Grupo) - Contêiner principal para os elementos da página.
    * **Group** (Grupo) - Container para o título da página.
        * **Text** (Texto) - Título "Atualizar / Ler Caso".
    * **Group** (Grupo) - Container para o formulário de atualização.
        * **Text** (Texto) - Rótulo "Morbidade".
        * **Input** (Campo de entrada) - Campo para inserir informações de morbidade.
        * **Text** (Texto) - Rótulo "Especialidade".
        * **Text** (Texto) - Rótulo "Tags".
        * **Group** (Grupo) - Container para toggles de notificação.
            * **Group** (Grupo) - Container para o toggle "Transpac?".
                * **IonicToggle** (Toggle) - Toggle para ativar/desativar notificação "Transpac".
                * **Text** (Texto) - Rótulo "Transpac?".
            * **Group** (Grupo) - Container para o toggle "Transfundido?".
                * **Text** (Texto) - Rótulo "Transfundido?".
                * **IonicToggle** (Toggle) - Toggle para ativar/desativar notificação "Transfundido".
        * **Multidropdown** (Multidropdown) - Campo para selecionar múltiplas tags.
        * **Text** (Texto) - Rótulo "NOTIFICAÇÃO".

### Workflows
* **When Page is Loaded**: Ao carregar a página, busca dados relacionados a notificações.
    * **Do when condition is true** (Gatilho de Condição Verdadeira) → **Element Action** (Ação de Elemento) → **Do when condition is true** (Gatilho de Condição Verdadeira) → **Element Action** (Ação de Elemento) → **Do when condition is true** (Gatilho de Condição Verdadeira) → **Element Action** (Ação de Elemento)

### Workflow cmMbP

# Workflow cmMbP

**Trigger:** `ButtonClicked` (Elemento: `cmSvz`)

## Summary
Este workflow atualiza um registro de caso (GVP) no banco de dados com informações provenientes de campos de entrada na página, e incrementa a quantidade de casos.

## Actions
1.  **Change Thing** - Atualiza o registro do tipo `custom.gvp` que corresponde ao hospital com nome `nome_hospital_text` (do elemento `cmSpk`), incrementando o campo `qntdcaso_number` em 1.
2.  **Change Thing** - Atualiza o registro `custom.gvp` encontrado (com base no hospital `nome_hospital_text` do elemento `cmSpk`):
    *   Define `anciaos_cont_tel_text` com o valor do elemento `cmSqA`.
    *   Define `anciaos_contatados_text` com o valor do elemento `cmSpx`.
    *   Define `batizado_boolean` com o valor do elemento `cmSpQ`.
    *   Define `boa_cond_esp_boolean` com o valor do elemento `cmSpK`.
    *   Define `cartao_diret_ok_boolean` com o valor do elemento `cmSpN`.
    *   Define `com_cond_esp_fami_text` com o valor do elemento `cmSqV`.
    *   Define `congregacao_text` com o valor do elemento `cmSpu`.
    *   Define `cont_q_telef_text` com o valor do elemento `cmSss`.
    *   Define `dat_ho_contato_text` com o valor do elemento `cmSsm`.
    *   Define `data_encerramento_date` com o valor do elemento `cmTHq`.

### Workflow cmTIM

# Workflow cmTIM

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento específico quando um botão é clicado, provavelmente para limpar a interface ou preparar para outra ação na página "atualizar_ler_caso".

## Actions
1.  **Hide Element**: Oculta o elemento com o ID `cmTHw`.

### Workflow cmTIQ

# Workflow cmTIQ

**Trigger:** `ButtonClicked` (Elemento: `cmTHw` - **Observação:** ID `cmTHw` não encontrado no mapa de referência, assumindo ser um botão específico para a ação)

## Summary
Este workflow é acionado quando um botão específico é clicado, com o propósito de exibir um elemento na tela.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmTHw`.

### Workflow cmTfv

# Workflow cmTfv

**Trigger:** `ButtonClicked` (Elemento: ID `cmTIH`, Nome Legível: não encontrado no mapa)

## Summary
Este workflow é acionado ao clicar em um botão. Ele atualiza o status de um item da página atual para "Encerrado", preenche campos de texto com dados específicos (incluindo o nome do paciente processado por regex), obtém um valor booleano de um elemento e, em seguida, envia um e-mail de notificação. Por fim, oculta um elemento específico.

## Actions
1.  **Change Thing** - Atualiza o item da página atual (`cmSwE` - `atualizar_ler_caso`):
    *   Define `status_text` como vazio.
    *   Define `nome_paciente_text` como o nome do paciente, removendo caracteres não alfabéticos minúsculos.
    *   Define `anciaos_cont_tel_text` como "x".
    *   Define `anciaos_contatados_text` como "x".
    *   Define `cont_q_telef_text` como "x".
    *   Define `membro_ajudte_text` como "x".
    *   Define `nome_mae_text` como "x".
    *   Define `nome_pai_text` como "x".
    *   Define `nome_telefonou_text` como "x".
    *   Define `gvp_boolean` obtendo o valor do elemento com ID `cmWqG1`.
2.  **Hide Element** - Oculta o elemento com ID `cmTHw`.
3.  **Send Email** - Envia um e-mail com o assunto "Caso encerrado" e remetente "Casos Info" para "felippescolih@gmail.com". O corpo do e-mail informa que o usuário atual (`nome_text`) encerrou o caso (usando `id_caso_text`), com detalhes de morbidade (`info_add_morbidade_text`).

### Workflow cmTmR

# Workflow cmTmR

**Trigger:** `ButtonClicked` (elemento `Button cmTmT`)

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo exibir um elemento popup na tela.

## Actions
1. **Show Element** - Exibe o elemento popup (`Popup cmTmT`).

### Workflow cmTnh

# Workflow cmTnh

**Trigger:** `ButtonClicked` (Elemento: `Text Current cell's Membr AD is clicked`)

## Summary
Este workflow cria um novo registro de membro específico, transfere um caso existente e atualiza o status do caso para indicar que está em transferência.

## Actions
1.  **Create a new thing** (`membros_espec`) - Cria um novo registro na base de dados com informações extraídas de elementos da página e dados anteriores.
    *   `especialidade_text`: `especialidade_text` (Elemento Pai)
    *   `membro_text`: `membro_text` (Elemento Pai)
    *   `e_mail_text`: `e_mail_text` (Elemento Pai)
    *   `telzap_user`: `telzap_user` (Elemento Pai)
    *   `ajdt_text`: Valor do elemento com ID `cmTmi`.
    *   `ajdt_email_text`: Valor do elemento com ID `cmTmj`.
    *   `chat_id_tele_text`: `chat_id_tele_text` (Elemento Pai)
    *   `color_text`: `color_text` (Elemento Pai)
    *   `REDACTED`: `REDACTED` (Elemento Pai)
2.  **Delete a thing** - Deleta o elemento pai.
3.  **Modify thing** - Atualiza um registro existente com os seguintes campos:
    *   `em_tranfer_boolean`: `true`
    *   `em_transf_para_text`: `membro_text` (Elemento Pai)
    *   `em_transfer_email_text`: `e_mail_text` (Elemento Pai)
    *   `em_transfer_historico_text`: Concatenação de strings com a data atual formatada, nome do usuário atual e `membro_text`.
    *   `em_transfer_data_date`: Data e hora atual.
    *   `membro_ajudte_text`: Valor do passo anterior (`Create a new thing`).

### Workflow cmTnu

# Workflow cmTnu

**Trigger:** `ButtonClicked` (Elemento: `Text Current cell's Membr cardio is clicked`)

## Summary
Este workflow é acionado quando o texto "Current cell's Membr cardio" é clicado. Ele cria um novo registro do tipo `membros_espec`, atualiza um registro existente, exclui um registro e define flags para indicar a transferência de um caso.

## Actions
1.  **Create a new thing (custom.membros_espec)** - Cria um novo registro no tipo de dado `custom.membros_espec` com os seguintes campos:
    *   `especialidade_text`: Valor do texto `especialidade_text` do elemento pai.
    *   `membro_text`: Valor do texto `membro_text` do elemento pai.
    *   `e_mail_text`: Valor do texto `e_mail_text` do elemento pai.
    *   `telzap_user`: Valor do texto `telzap_user` do elemento pai.
    *   `ajdt_text`: Valor do texto `get_data` do elemento `cmTmo`.
    *   `ajdt_email_text`: Valor do texto `get_data` do elemento `cmTmp`.
    *   `chat_id_tele_text`: Valor do texto `chat_id_tele_text` do elemento pai.
    *   `color_text`: Valor do texto `color_text` do elemento pai.
    *   `REDACTED`: Valor do `REDACTED` do elemento pai.
2.  **Delete Thing** - Exclui o registro do elemento pai.
3.  **Change something** - Modifica o registro criado na ação anterior ("Create a new thing"):
    *   `em_tranfer_boolean`: Define como `true`.
    *   `em_transf_para_text`: Define com o valor do texto `membro_text` do elemento pai.
    *   `em_transfer_email_text`: Define com o valor do texto `e_mail_text` do elemento pai.
    *   `em_transfer_historico_text`: Constrói um texto com a data/hora atual formatada, o nome do usuário atual e o texto `membro_text` do elemento pai, registrando a transferência.
    *   `em_transfer_data_date`: Define com a data e hora atuais.
    *   `membro_ajudte_text`: Define com o valor do texto `ajdt_text` do resultado da ação "Create a new thing".

### Workflow cmToH

# Workflow cmToH

**Trigger:** `ButtonClicked` (Elemento: `Text Current cell's Membr goneo is clicked`)

## Summary
Este workflow gerencia a transferência de um membro para um novo caso, criando um novo registro, excluindo o registro antigo e atualizando o status do membro transferido.

## Actions
1.  **Create a new thing** (`custom.membros_espec`) - Cria um novo registro na base de dados `custom.membros_espec` com os dados extraídos do elemento clicado e de outros elementos associados.
    *   `especialidade_text`: Valor do elemento `especialidade_text`
    *   `membro_text`: Valor do elemento `membro_text`
    *   `e_mail_text`: Valor do elemento `e_mail_text`
    *   `telzap_user`: Valor do elemento `telzap_user`
    *   `ajdt_text`: Valor do elemento `ajdt_text` (ID: `cmTmw`)
    *   `ajdt_email_text`: Valor do elemento `ajdt_email_text` (ID: `cmTmv`)
    *   `chat_id_tele_text`: Valor do elemento `chat_id_tele_text`
    *   `color_text`: Valor do elemento `color_text`
    *   `REDACTED`: Valor do elemento `REDACTED` (Adicionado à lista)
2.  **Delete thing** - Exclui o registro atual (membro) da base de dados.
3.  **Change something** (`custom.membros_espec`) - Atualiza o registro criado na etapa 1.
    *   `em_tranfer_boolean`: Define como `true`.
    *   `em_transf_para_text`: Define como o valor de `membro_text` do elemento pai.
    *   `em_transfer_email_text`: Define como o valor de `e_mail_text` do elemento pai.
    *   `em_transfer_historico_text`: Define um texto histórico concatenando a data/hora atual formatada, o nome do usuário atual e o `membro_text`.
    *   `em_transfer_data_date`: Define como a data e hora atuais.
    *   `membro_ajudte_text`: Define como o valor de `ajdt_text` do passo "Create a new thing".

### Workflow cmToU

# Workflow cmToU

**Trigger:** `ButtonClicked` (Elemento: Text Current cell's Membr onco is clicked)

## Summary
Este workflow é acionado quando o texto "Current cell's Membr onco" é clicado. Ele cria um novo registro do tipo `custom.membros_espec` com os dados do membro atual, exclui o registro original, e atualiza um registro existente com informações de transferência e histórico.

## Actions
1.  **Create a new thing** (`custom.membros_espec`) - Cria um novo registro com os seguintes campos:
    *   `especialidade_text`: `especialidade_text` (Elemento Pai)
    *   `membro_text`: `membro_text` (Elemento Pai)
    *   `e_mail_text`: `e_mail_text` (Elemento Pai)
    *   `telzap_user`: `telzap_user` (Elemento Pai)
    *   `ajdt_text`: `ajdt_text` (Elemento Get do elemento `cmTnD`)
    *   `ajdt_email_text`: `ajdt_email_text` (Elemento Get do elemento `cmTnC`)
    *   `chat_id_tele_text`: `chat_id_tele_text` (Elemento Pai)
    *   `color_text`: `color_text` (Elemento Pai)
    *   `REDACTED`: `REDACTED` (Elemento Pai), adiciona à lista.
2.  **Delete thing** - Exclui o registro original (Elemento Pai).
3.  **Make changes to thing** - Atualiza um registro existente com os seguintes campos:
    *   `em_tranfer_boolean`: `true`
    *   `em_transf_para_text`: `membro_text` (Elemento Pai)
    *   `em_transfer_email_text`: `e_mail_text` (Elemento Pai)
    *   `em_transfer_historico_text`: Constrói um texto com a data e hora atuais formatadas (`dd/mm/yyyy HH:MM`), o nome do usuário atual (`nome_text`) e o `membro_text` (Elemento Pai).
    *   `em_transfer_data_date`: Data e hora atuais.
    *   `membro_ajudte_text`: `ajdt_text` (Resultado da etapa 1).

### Workflow cmToh

# Workflow Atualizar e Ler Caso

**Trigger:** `ButtonClicked` (Elemento: Text Current cell's Membr Orto is clicked)

## Summary
Este workflow é acionado quando um texto específico em uma célula (indicando um membro ou orto) é clicado. Ele cria um novo registro em `membros_espec`, exclui o registro atual, atualiza o registro para refletir a transferência e exibe uma mensagem de sucesso.

## Actions
1.  **Criar um novo `membros_espec`** - Salva os dados extraídos de elementos na página e do elemento pai para um novo registro no tipo de dado `custom.membros_espec`. Os campos preenchidos são: `especialidade_text`, `membro_text`, `e_mail_text`, `telzap_user`, `ajdt_text`, `ajdt_email_text`, `chat_id_tele_text`, e um campo com valor `REDACTED`.
2.  **Deletar** - Exclui o registro atual da página.
3.  **Modificar `Current Page Item`** - Atualiza o registro atual da página, definindo `em_tranfer_boolean` como `true`. Preenche os campos de transferência com dados de outros elementos e do registro atual, incluindo um histórico formatado da transferência. O campo `em_transfer_data_date` recebe a data e hora atuais, e `membro_ajudte_text` é preenchido com o resultado do passo anterior.
4.  **Mostrar Mensagem de Alerta** - Exibe uma mensagem de alerta na página com o ID `cmTpl0`.
5.  **Enviar Mensagem (parâmetros de telefone)** - Configura parâmetros para enviar uma mensagem de telefone.

### Workflow cmTou

# Workflow cmTou

**Trigger:** `ButtonClicked` (O nome do elemento que disparou é "Text Current cell's Membr TMO is clicked")

## Summary
Este workflow é acionado ao clicar em um texto específico, com o objetivo de transferir ou atualizar informações de um membro em um caso. Ele cria um novo registro de membro, exclui um registro existente e modifica um registro, além de exibir um alerta.

## Actions
1.  **Criar um novo `custom.membros_espec` (NewThing)**
    *   Define os seguintes valores iniciais:
        *   `especialidade_text`: Valor do elemento pai "especialidade\_text".
        *   `membro_text`: Valor do elemento pai "membro\_text".
        *   `e_mail_text`: Valor do elemento pai "e\_mail\_text".
        *   `telzap_user`: Valor do elemento pai "telzap\_user".
        *   `ajdt_text`: Valor do elemento "get\_data" (ID: cmTnR).
        *   `ajdt_email_text`: Valor do elemento "get\_data" (ID: cmTnQ).
        *   `chat_id_tele_text`: Valor do elemento pai "chat\_id\_tele\_text".
        *   `color_text`: Valor do elemento pai "color\_text".
        *   (Campo REDIGIDO): Valor do elemento pai "(Campo REDIGIDO)".
2.  **Excluir um registro (DeleteThing)**
    *   Exclui o elemento pai atual.
3.  **Modificar um registro (ChangeThing)**
    *   Modifica o registro atual da página (`CurrentPageItem`) com as seguintes alterações:
        *   `em_tranfer_boolean`: `true`.
        *   `em_transf_para_text`: Valor do elemento pai "membro\_text".
        *   `em_transfer_email_text`: Valor do elemento pai "e\_mail\_text".
        *   `em_transfer_historico_text`: Constrói uma string formatada com a data e hora atuais, o nome do usuário atual e os valores de "nome\_text" e "membro\_text".
        *   `em_transfer_data_date`: Data e hora atuais.
4.  **Exibir mensagem de alerta (AlertShowMessage)**
    *   Exibe uma mensagem de alerta para o elemento com ID "cmTpi0".
5.  **(Ação incompleta)** O JSON fornecido está cortado e não é possível detalhar a ação após a configuração de `params_phone`.

### Workflow cmToy

# Workflow cmToy

**Trigger:** `ButtonClicked` (Elemento: `cmTmX`)

## Summary
Este workflow esconde um elemento específico (popup) quando um botão é clicado.

## Actions
1.  **Hide Element** - Esconde o elemento `cmTmT`.

### Workflow cmTpR

# Workflow cmTpR

**Trigger:** `ButtonClicked` (Elemento: "Text Current cell's Membr plantonista")

## Summary
Este workflow atualiza os campos de um registro de caso para indicar uma transferência, exibe uma mensagem de confirmação e agenda um evento de API para enviar uma notificação por WhatsApp.

## Actions
1.  **Change Thing** (Elemento: "Current Page's Caso") - Atualiza os seguintes campos:
    *   `em_tranfer_boolean` para `true`.
    *   `em_transf_para_text` com o valor do elemento pai `membro_text`.
    *   `em_transfer_email_text` com o valor do elemento pai `e_mail1_text`.
    *   `em_transfer_historico_text` com o histórico da transferência, incluindo data, hora, usuário que transferiu e o membro para quem foi transferido.
    *   `em_transfer_data_date` com a data e hora atuais.
    *   `cel_membro_respo_text` com o valor do elemento pai `telefone_text`.
2.  **Show Message** (Elemento: "cmTqA0") - Exibe uma mensagem de confirmação.
3.  **Schedule API event** (`cmOOS0`) - Agenda um evento de API para 1 dia após a data de criação do registro atual (`cmTpI`), associado ao parâmetro `_wf_param_emailpg` do passo anterior.
4.  **WhatsApp API** (`apiconnector2-cmRhD.cmRhE`) - Envia uma notificação por WhatsApp para o número `cmRhE` com os detalhes do caso registrado, incluindo nome do paciente, membro responsável e telefone, além de uma cópia da mensagem enviada ao membro responsável.
5.  **Change Page** (`cmTEb0`) - Redireciona o usuário para a página `casos`.

### Workflow cmVFb

# Workflow cmVFb

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, permitindo a atualização e leitura de dados relacionados a um caso.

## Actions
1. **REDACTED** - Executa uma ação REDIGIDA com base em expressões de texto.
2. **REDACTED** - Executa outra ação REDIGIDA com base em expressões de texto.

### Text Salvar art medicos

# Text Salvar art medicos

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza o campo `art_medicos_text` do item atual da página com base no valor de um elemento específico.

## Actions
1.  **Modify Thing** - Modifica o campo `art_medicos_text` do item atual da página. O novo valor é construído a partir do texto do elemento `cmStk` (obtido via `get_data`) concatenado com o valor atual de `art_medicos_text`.

### Workflow cmVXJ

# Atualizar Campo Texto do Caso

**Trigger:** `ButtonClicked` (Elemento: Botão Salvar Atualizações)

## Summary
Atualiza o campo de texto 'estrat_op__text' do item atual da página com um novo valor obtido de um elemento de entrada.

## Actions
1.  **Alterar Dado** - Atualiza o campo `estrat_op__text` do item atual da página com o valor do elemento de entrada `cmSti` (input Estratégia Operacional).

### Workflow cmVXU

# Workflow Atualizar Campo Plano Tratamento

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza o campo "plano_trat_med_text" da página atual com o valor do campo "plano_trat_med_text" de um elemento específico.

## Actions
1.  **Alterar "Current Page's Item"**: Atualiza o campo `plano_trat_med_text` com o valor retornado por `GetElement` (elemento `cmStg`).

### Workflow cmVXe

# Workflow Atualiza Campo info_med_caso_text

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza o campo `info_med_caso_text` de um item na página `atualizar_ler_caso` com o valor retornado por `get_data` do elemento `cmStG`.

## Actions
1.  **Change Thing** - Atualiza o campo `info_med_caso_text` do `CurrentPageItem` com o valor `get_data` do elemento `cmStG`.

### Workflow cmVXl

# Atualizar Resumo do Caso

**Trigger:** `ButtonClicked` (Botão "Button")

## Summary
Este workflow atualiza o campo `res_resumo_text` do item atual da página com o valor obtido do elemento `cmSud`.

## Actions
1.  **Change Thing** - Atualiza o campo `res_resumo_text` do item atual da página.
    *   O novo valor é construído pela concatenação:
        *   O valor atual de `res_resumo_text` do item atual da página.
        *   O resultado da ação `get_data` no elemento `cmSud`.

### Workflow cmVZn

# Workflow cmVZn

**Trigger:** `ButtonClicked`

## Summary
Este workflow aciona a abertura de um link do WhatsApp, possivelmente para enviar uma mensagem com um número de telefone específico.

## Actions
1.  **Open URL**: Abre o URL `wa.me/{cont_q_telef_text}` no navegador.

### Workflow cmVeE

# Workflow cmVeE

**Trigger:** `ButtonClicked` (Elemento: `Button Salvar` - ID: `cmSxL0`)

## Summary
Este workflow redireciona o usuário para a página de visualização do caso após um clique.

## Actions
1. **Change Page** - Redireciona para a página **atualizar_ler_caso** (ID: `cmSwE`).

### Workflow cmVlP

# Atualizar Campo 'membro_ajudte_text'

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza o campo `membro_ajudte_text` do item atual da página com dados obtidos de um elemento.

## Actions
1.  **Change Thing**: Atualiza o campo `membro_ajudte_text` do item atual da página. O valor é obtido concatenando a mensagem do elemento `cmTJB` com uma expressão que busca dados.

### Workflow cmVle

# Workflow Atualizar Campo Responsável

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza o campo `med_responsavel_text` de um elemento na página atual quando um botão é clicado.

## Actions
1.  **Modificar dado:** Altera o campo `med_responsavel_text` com base no valor do elemento `cmVlR` (elemento não especificado no mapa) na página `atualizar_ler_caso`.

### Workflow cmVmE

# Criar e Atualizar Dados de Médicos

**Trigger:** `ButtonClicked` (Elemento: `cmVlx` - Botão de clique não especificado)

## Summary
Este workflow cria registros em dois tipos de dados ("medicos1" e "medicos_geral"), reseta os campos de entrada e oculta um elemento. É acionado pelo clique de um botão.

## Actions
1.  **Criar novo `medicos1`**: Define os campos `nome_text`, `crm_uf_text` e um campo "REDACTED" com base nos valores de elementos `cmVlr`, `cmVls` e `cmVlw` respectivamente.
2.  **Criar novo `medicos_geral`**: Define os campos `crm_uf_text`, um campo "REDACTED" e `nome_text` utilizando os valores da etapa anterior (criação de `medicos1`).
3.  **Resetar Inputs**: Limpa os campos de entrada associados ao trigger.
4.  **Esconder Elemento**: Oculta o elemento `cmVlo`.

### Workflow cmVmL

# Workflow Atualizar Ler Caso

**Trigger:** `ButtonClicked` (Elemento: `[Botão Salvar]`)

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo exibir um elemento específico na página.

## Actions
1.  **Exibir Elemento** - Torna visível o elemento `[float]` na página `atualizar_ler_caso`.

### Workflow cmWuN

# Atualizar Dados do Caso

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza os dados de um caso com base nas informações inseridas em diversos campos de entrada e checkboxes.

## Actions
1.  **Update Case Fields** - Atualiza os campos do registro do caso no banco de dados. Os campos atualizados incluem: `anciaos_cont_tel_text`, `anciaos_contatados_text`, `batizado_boolean`, `boa_cond_esp_boolean`, `cartao_diret_ok_boolean`, `com_cond_esp_fami_text`, `congregacao_text`, `cont_q_telef_text`, `dat_ho_contato_text`, `data_encerramento_date`, `em_tranfer_boolean`, `eq_coop_boolean`, `eq_info_boolean`, `espec_med_respo_text`, `ex_data_hora1_text`, `ex_data_hora2_text`. Os valores são obtidos de elementos na página, como `cmSqA`, `cmSpx`, `cmSpQ`, `cmSpK`, `cmSpN`, `cmSqV`, `cmSpu`, `cmSss`, `cmSsm`, `cmTHq`, `cmStf`, `cmStc`, `cmStP`, `cmSqv`. O campo `em_tranfer_boolean` é definido como `false`.

### Workflow cmSwZ0

# Mostrar popup de atualização

**Trigger:** `ButtonClicked`

## Summary
Abre um popup para atualizar informações do caso.

## Actions
1.  **Show Element** - Exibe o elemento `cmSwI0` (popup).

### Workflow cmSwd0

# Fechar popup de atualização

**Trigger:** `ButtonClicked`

## Summary
Este workflow esconde um elemento popup específico quando um botão é clicado.

## Actions
1.  **Esconder elemento** - Esconde o elemento com ID `cmSwI0`.

## colihcwb

# colihcwb

## Summary
Esta página exibe informações sobre membros, casos atendidos, palestras e instituições, além de apresentar o organograma da organização "Colih - Curitiba". Possui um menu vertical e um cabeçalho.

### UI
*   **Head A** (CustomElement) - Contém o cabeçalho da página.
    *   **Group E** (Group) - Agrupa elementos de navegação e título.
        *   **Group D** (Group) - Agrupa textos de título.
            *   **Group A** (Group) - Agrupa textos com opções de navegação.
                *   **Text C** (Text) - Texto "MEMBROS".
                *   **Text B** (Text) - Texto "CASOS ATENDIDOS".
                *   **Text E** (Text) - Texto "PALESTRAS E INSTITUIÇÕES".
                *   **Text F** (Text) - Texto "ORGANOGRAMA".
            *   **Text A** (Text) - Título da página "Colih - Curitiba".
            *   **Group B** (Group) - Grupo de exibição oculta para palestras e instituições.
                *   **Text G** (Text) - Texto com ícone "[fa]microphone[/fa] Palestras e Instituições".
                *   **RepeatingGroup A** (RepeatingGroup) - Exibe a lista de palestras e instituições.
                    *   **Text G** (Text) - Exibe o local da palestra.
                    *   **Elemento Icone** (Icon) - Ícone de remoção, visível dependendo do nível de acesso.

### Workflows
*   **Element visibility**: `Element Visibility` - Ao carregar a página `colihcwb`, define a visibilidade do `Group B` como `false`.
*   **Button Clicked**: `Button Clicked` - Ao clicar no `Button G`, o `Group B` se torna visível.
*   **Button Clicked**: `Button Clicked` - Ao clicar no `Button F`, o `Group B` se torna invisível.
*   **Element Visibility**: `Element Visibility` - Ao carregar a página `colihcwb`, define a visibilidade do `Group B` como `false`.

### Workflow cmVPv

# Workflow cmVPv - Navegar para Tela de Lembretes

**Trigger:** `ButtonClicked` (Elemento: Botão "Lembretes")

## Summary
Este workflow é acionado ao clicar em um botão, redirecionando o usuário para a página de lembretes.

## Actions
1.  **Navigate to page**: Redireciona para a página **lembretes** (`cmQCW`).

### Workflow cmVPx

# Workflow cmVPx

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e redireciona o usuário para a página 'colihcwb'.

## Actions
1.  **Change Page**: Redireciona para a página **colihcwb**.

### Workflow cmVPz

# Workflow Navegar para Menu

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e navega o usuário para uma página específica.

## Actions
1.  **Change Page** - Redireciona para a página **menuvertical AAA**.

### Workflow cmVQd

# Workflow Excluir item da lista

**Trigger:** `ButtonClicked` (botão com ID: `cmVQM`)

## Summary
Este workflow é acionado quando um botão é clicado e sua principal função é excluir um item.

## Actions
1.  **Delete Thing** - Exclui o item referente ao elemento pai do botão clicado.

### Workflow cmVQi

```json
{
  "pages": {
    "bTGbC": "index",
    "cmMYA": "menu",
    "cmMhM": "plant_o",
    "cmMjQ": "minha_conta",
    "cmMnf": "encerrado_estudar",
    "cmNrc": "teste",
    "cmOAd": "cadastro_newuser",
    "cmOQI": "painel_controle",
    "cmPFX": "minhasub",
    "cmPqu": "gvp",
    "cmQCW": "lembretes",
    "cmQDh": "pesquisaeestudo",
    "cmQGO": "atas",
    "cmQnY": "membrosctba",
    "cmRGZ": "pal_instituicao",
    "cmRob": "view_palestras",
    "cmSTT": "relatorio",
    "cmSYD": "reg_novo_caso",
    "cmSwE": "atualizar_ler_caso",
    "cmVPP": "colihcwb",
    "cmVuY": "medddicos",
    "cmVzV": "newgvp",
    "cmWRJ": "menugvp",
    "cmXCr": "fotogvp",
    "cmXGy": "sandbox",
    "cmNfP0": "endere_telefones",
    "cmNxh0": "med_cad_espec",
    "cmQHI0": "palestraseventos",
    "cmTEb0": "casos",
    "cmTHl0": "lista_de_casos",
    "AAW": "reset_pw",
    "AAX": "404",
    "cmMoM": "ler_casoencerrado"
  },
  "elements": {
    "cmMjm": "Head",
    "cmPKP": "menuvertical",
    "cmPTx": "cabeçalho",
    "cmRQo": "HEAD VOLUN",
    "cmSmf": "Head_copy",
    "cmTJQ": "Menuvertical AAA",
    "cmVpN": "float",
    "ACr": "Signup / Login Popup",
    "bTGiM": "Header",
    "bTGkF": "Footer",
    "cmMlO": "foot",
    "cmNTj": "menu2"
  },
  "dataTypes": {},
  "optionSets": {},
  "workflows": {},
  "backendWorkflows": {
    "cmVcU": "del_ferias",
    "cmWUW": "sendWHATS_lembretedesign",
    "cmXEL": "sendtel_iniciodesign_ajudante",
    "cmXEt": "REDACTED"
  }
}
```


**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e redireciona o usuário para outra página.

## Actions
1. **Change page** - Redireciona para a página **colihcwb**.

### Workflow cmVQm

# Workflow cmVQm

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e executa uma ação para navegar para outra página.

## Actions
1.  **Change page** - Redireciona para a página **minha_conta**.

### Workflow cmVQq

# Workflow Redireciona para Página de Lembretes

**Trigger:** `ButtonClicked` (Botão não nomeado - ID: cmRFQ)

## Summary
Este workflow é acionado ao clicar em um botão e redireciona o usuário para a página de lembretes.

## Actions
1.  **Change Page** - Redireciona para a página **lembretes** (ID da página: cmQCW).

## medddicos

# medddicos (Página)

## Summary
Esta página exibe listas de médicos, médicos gerais e casos associados a médicos responsáveis. Utiliza grupos de repetição para exibir os dados de forma organizada.

### UI
*   **RepeatingGroup A** (RepeatingGroup) - Exibe a lista de médicos.
    *   **Text A** (Text) - Mostra o nome do médico.
*   **Text B** (Text) - Exibe a contagem total de médicos.
*   **RepeatingGroup B** (RepeatingGroup) - Exibe a lista de médicos gerais.
    *   **Text C** (Text) - Mostra o nome do médico geral.
*   **Text D** (Text) - Exibe a contagem total de médicos gerais.
*   **RepeatingGroup C** (RepeatingGroup) - Exibe os casos associados a um médico responsável.
    *   **Text E** (Text) - Mostra o nome do médico responsável pelo caso.
    *   **Text F** (Text) - Exibe a contagem de casos para o médico responsável, filtrando pelo nome do médico.

### Workflows
Não há workflows definidos nesta página.

## newgvp

# newgvp

## Summary
Página dedicada à visualização e interação com dados GVP. Contém formulários para cadastro, botões de ação e pop-ups para tarefas específicas como redefinição de senha.

### UI
* **Popup reset** (Popup) - Popup para redefinição de senha.
  * **Button B** (Button) - Botão para enviar a solicitação de redefinição.
  * **Input E-mail reset** (Input) - Campo para o usuário inserir o e-mail.
  * **Text C** (Text) - Título do popup.
  * **Text D** (Text) - Descrição do propósito do popup.
* **Group A** (Group) - Grupo principal que organiza o conteúdo da página.
  * **Group C** (Group) - Agrupa elementos de controle GVP.
    * **Button Cadastrar gvp** (Button) - Botão para iniciar o processo de cadastro GVP.
      * **State is_hovered** (State) - Muda a aparência do botão ao passar o mouse.
    * **Group F** (Group) - Agrupa o campo de nome e seus estados.
      * **Text B** (Text) - Rótulo do campo "Nome".
        * **State is empty** (State) - Altera a aparência do rótulo se o campo estiver vazio.
        * **State is_focused** (State) - Altera a aparência do rótulo quando o campo está focado.
        * **State isnt_valid** (State) - Altera a aparência do rótulo se o campo for inválido.
      * **Input Name** (Input) - Campo de entrada para o nome.

### Workflows
Não foram encontrados workflows nesta página.

### Workflow cmNcG

# Cadastro de Novo Usuário GVP

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado para realizar o cadastro de um novo usuário, coletando informações dos campos de entrada e executando a ação de "Sign Up".

## Actions
1.  **Sign Up**: Cria um novo usuário com os seguintes dados:
    *   `especialidade_text`: "gvp"
    *   `nome_text`: Valor do campo com ID `cmWAf`
    *   `telcelular_text`: Valor do campo com ID `cmWBB`
    *   `congrega_ao_text`: Valor do campo com ID `cmWDv`
    *   `hospitais_text`: Nome do hospital obtido através do elemento com ID `cmWEN` (após múltiplas chamadas `get_data` e processamento interno)
    *   `avatar_image`: Imagem obtida através do elemento com ID `cmXFr`
    *   `email`: Valor do campo com ID `cmWAq`
    *   `password2`: Valor do campo com ID `cmWBV`
    *   `password`: Valor do campo com ID `cmWBN`
    *   Requer confirmação de senha (`require_confirm`: true).
2.  **Set initial values**: Define os valores iniciais para um elemento (presumivelmente um formulário ou grupo de campos) com os seguintes dados:
    *   `congrega__o_text`: Valor do campo com ID `cmWDv`
    *   `e_mail_text`: Valor do campo com ID `cmWAq`
    *   `hosp_atua2_list_text`: Lista de hospitais obtida através do elemento com ID `cmWEN` (com processamento interno).
    *   Um campo com chave "REDACTED" é preenchido com dados obtidos através do elemento com ID `cmWEN`.
    *   `nome_membro_text`: Valor do campo com ID `cmWAf`

### Workflow cmNcs

# Enviar Email de Redefinição de Senha

**Trigger:** `ButtonClicked`

## Summary
Envia um email de redefinição de senha para o usuário e esconde um elemento popup.

## Actions
1.  **Send Password Reset Email**: Envia email de redefinição de senha.
2.  **Hide Element**: Esconde o elemento popup.

### Workflow length

# Workflow length

**Trigger:** `Page Loaded`

## Summary
Este workflow é acionado quando a página é carregada. Sua função é iniciar um contador de tempo, possivelmente para registrar a duração da sessão do usuário ou para fins de análise.

## Actions
1.  **Start/Resume a repeating group timer** - Inicia ou retoma o timer de um grupo de repetição.
    *   **Element:** `(Element ID: cmVpN)` - `float`
    *   **Timer:** `1`

## menugvp

# menugvp (Página)

## Summary
Esta página exibe um menu de navegação com opções para visualizar casos abertos e encerrados, possivelmente relacionados a hospitais ou instituições.

### UI
*   **Group QZ** (Group) - Container principal.
    *   **Group QZ** (Group) - Container para a seção "Abertos".
        *   **Group QZ** (Group) - Container para o texto "Abertos".
            *   **Text U** (Text) - Exibe o texto "Abertos".
        *   **Group QZ** (Group) - Container para a contagem de casos abertos.
            *   **Text U** (Text) - Exibe a contagem de casos abertos, filtrados por "Santa Casa" e status "Aberto".
    *   **Group RZ** (Group) - Container para a seção "Encerrados".
        *   **Group RZ** (Group) - Container para o texto "Encerrados".
            *   **Text RZ** (Text) - Exibe o texto "Encerrados".
        *   **Group RZ** (Group) - Container para a contagem de casos encerrados.
            *   **Text RZ** (Text) - Exibe a contagem de casos encerrados, filtrados por "Santa Casa" e status "Encerrado".

### Workflows
Não há workflows associados a esta página no trecho fornecido.

### Workflow cmNZY

# Workflow cmNZY - Navegar para Especialidade Médica

**Trigger:** `Page is loaded`

## Summary
Este workflow navega para a página de especialidades médicas se o usuário logado for um "Voluntário (a) - Médicos".

## Actions
1.  **Change Page** - Redireciona para a página "med_cad_espec" se a especialidade do usuário atual for igual a "Voluntário (a) - Médicos".

### Workflow cmOYk

# Aceitar e Notificar Caso

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza o status de um caso para indicar que foi aceito pelo membro atual, envia uma notificação por e-mail ao criador do caso e exibe uma mensagem de confirmação ao usuário.

## Actions
1.  **Change Thing (cmWQB)** - Atualiza o elemento pai:
    *   `em_tranfer_boolean` é definido como `false`.
    *   `em_transf_para_text` é definido como vazio.
    *   `em_transfer_email_text` é definido como vazio.
    *   `membro_respons_text` é definido com o nome do usuário atual.
    *   `em_transfer_historico_text` é construído concatenando o texto " / ", o nome do usuário atual, " aceitou o caso em ", a data e hora atuais formatadas como "dd/mm/yyyy HH:MM", e um campo vazio.
2.  **Send Email (cmWQC)** - Envia um e-mail:
    *   **Para:** O e-mail do criador do caso.
    *   **Assunto:** "Casos Info - Caso Aceito".
    *   **Corpo:** "O [nome do usuário atual] acabou de aceitar o caso do (a) paciente [nome do paciente]".
    *   **Nome do remetente:** O nome do usuário atual.
3.  **Show Message (cmWQD)** - Exibe a mensagem definida no elemento `cmWKs`.
4.  **Hide Element (cmWQH)** - Oculta o elemento `cmWOo`.
5.  **Refresh Page (cmWQI)** - Atualiza a página atual.

### Workflow cmOZt

# Workflow cmWQJ

**Trigger:** `ConditionTrue`

## Summary
Este workflow exibe um elemento de lista (cmWOo) se a contagem de dados de um elemento específico (cmWOt) for maior que zero.

## Actions
1.  **Show Element** (`cmWQN`) - Exibe o elemento **cmWOo** se a condição for verdadeira.
    *   **Condição:** A contagem (`count`) dos dados obtidos (`get_list_data`) do elemento `cmWOt` é maior que (`greater_than`) 0.

### Workflow cmROn

# Workflow cmROn

**Trigger:** `LoggedIn`

## Summary
Este workflow redireciona o usuário para a página `menugvp` com base na especialidade.

## Actions
1.  **Change Page** - Redireciona para a página `menugvp` se a especialidade do usuário atual for "Voluntário (a)".

### Workflow cmSSd

# Workflow cmSSd

**Trigger:** `ButtonClicked` (Elemento: Button Salvar Aviso)

## Summary
Este workflow salva um novo aviso no banco de dados, obtendo o texto de um elemento de entrada, e em seguida, fecha um popup de formulário.

## Actions
1.  **Criar nova coisa** (Tipo: `custom.avisos`) - Cria um novo registro na entidade `avisos` com o valor do campo de texto `aviso_text` do elemento `Input Texto Aviso`.
2.  **Resetar inputs** - Limpa todos os campos de entrada do formulário.
3.  **Ocultar elemento** (Elemento: Popup Formulário) - Fecha o popup exibindo o formulário de criação de avisos.

### Workflow cmWaL

# Workflow cmWaL

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão específico é clicado, redirecionando o usuário para a página inicial do aplicativo.

## Actions
1.  **Change Page** - Redireciona para a página **index**.

### Workflow cmTuU0

# Workflow cmTuU0

**Trigger:** `ButtonClicked` (elemento **float** - ID: cmVpN)

## Summary
Este workflow é acionado ao clicar no botão "float", com o objetivo de alternar a visibilidade do elemento "Menuvertical AAA".

## Actions
1. **Toggle Element** - Alterna a visibilidade do elemento "Menuvertical AAA" (ID: cmTJQ).

### Workflow cmTub0

# Workflow Redireciona para Menu GVP

**Trigger:** `ButtonClicked` (Elemento: `cmSxL0`)

## Summary
Este workflow é acionado quando um botão específico é clicado, redirecionando o usuário para a página `menugvp`.

## Actions
1. **Change Page:** Redireciona para a página `menugvp`.

### Workflow length

# Calcular Comprimento Texto

**Trigger:** `PageLoaded`

## Summary
Este workflow é acionado ao carregar a página `menugvp` e parece não ter ações configuradas.

## Actions
(Nenhuma ação configurada neste workflow)

## fotogvp

# fotogvp

## Summary
Página destinada ao cadastro de Grupos de Valorização do Paciente (GVP). Permite a seleção de hospitais e a definição de responsáveis.

### UI
* **Popup reset** (Popup) - Modal para redefinição de senha.
  * **Button B** (Button) - Botão para enviar o e-mail de redefinição.
  * **Input E-mail reset** (Input) - Campo para inserção do e-mail.
  * **Text C** (Text) - Título "Redefinir senha".
  * **Text D** (Text) - Instruções para redefinição de senha.
* **Group A** (Group) - Container principal da página.
  * **Group C** (Group) - Agrupa elementos de controle.
    * **Button A** (Button) - Botão "Salvar".
    * **Group M** (Group) - Container para seleção de grupo GVP.
      * **Text L** (Text) - Título "Grupo GVP".
      * **Dropdown A** (Dropdown) - Campo para selecionar o grupo GVP.

### Workflows
* **When Button A is clicked**: Create a new thing... → Create a new thing... → Show message → Go to page...

### Workflow cmNcG

# Workflow cmNcG

**Trigger:** `ButtonClicked` (Elemento: botão invisível com ID `cmXAt` na página `fotogvp`)

## Summary
Este workflow salva os dados inseridos em campos de um formulário, envia uma notificação de sucesso e reseta os campos do formulário.

## Actions
1.  **Create a new thing** - Cria um novo registro do tipo `fotogvp`.
    *   Define o campo `e_mail_text` com o valor do elemento de entrada com ID `cmXBn`.
    *   Define o campo `foto_image` com o valor do elemento de entrada com ID `cmXCv`.
2.  **Exibir mensagem de sucesso** - Exibe uma notificação centrada com o texto "Imagem salva com sucesso.".
3.  **Reset inputs** - Limpa os valores de todos os campos de entrada do formulário.

### Workflow cmNcs

# Workflow cmNcs

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Ele envia um email de redefinição de senha para o usuário e oculta um elemento específico na página.

## Actions
1.  **Send Password Reset Email** - Envia um email de redefinição de senha com o assunto "Redefinir Senha" e um corpo de mensagem predefinido.
2.  **Hide Element** - Oculta o elemento com ID `cmXAg`.

### Workflow length

# Workflow length

**Trigger:** `Page Load`

## Summary
Este workflow é acionado quando a página "fotogvp" é carregada. Sua principal função é ajustar a largura de um elemento específico.

## Actions
1.  **Set State** - Define o estado 'Width' do elemento 'float' para o valor 200.

## sandbox

# sandbox

## Summary
Página de exemplo ou "sandbox" para testes e visualização de componentes. Contém um input de imagem, uma imagem estática e textos que aparentam ser um cartão de perfil.

### UI
* **Group A** (Group) - Container principal para os elementos.
  * **PictureUploader A** (PictureInput) - Campo para upload de imagem com um placeholder e uma imagem de exemplo.
  * **Image A** (Image) - Exibe uma imagem estática.
  * **Group B** (Group) - Agrupa textos relacionados a um perfil.
    * **Text A** (Text) - Exibe o nome "Giovani Verdum".
    * **Text B** (Text) - Exibe o cargo "Ministro".

### Workflows
Não há workflows definidos para esta página.

## endere_telefones

# endere_telefones

## Summary
Página para visualização e gerenciamento de endereços e telefones cadastrados. Inclui funcionalidade para adicionar novos registros.

### UI
* **Head** (Group) - Cabeçalho da página.
  * **Group W** (Group) - Container principal.
    * **Icon J** (Icon) - Ícone de adição, visível conforme permissão de acesso.
    * **Group W** (Group) - Container para o RepeatingGroup.
      * **RepeatingGroup D** (RepeatingGroup) - Exibe a lista de equipamentos.
        * **Group W** (Group) - Grupo para cada item do RepeatingGroup.
          * **Text** (Text) - Exibe o nome do equipamento.

### Workflows
Não há workflows associados a esta página no trecho fornecido.

### Workflow cmUGn

# Workflow Salvar Telefone e Contato

**Trigger:** `ButtonClicked` (Elemento: `cmUGi`)

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo salvar informações de contato, exibir uma mensagem de sucesso e ocultar um elemento específico.

## Actions
1.  **Salvar `Congregacao_text`, `E_mail_text`, `Hospital_text`, `Nome_text`, `Obs_text`, `Profissao_text`, `Telefone_text`** - Atualiza os campos especificados no banco de dados, obtendo os valores dos elementos de input correspondentes (`cmUGH0`, `cmUGR0`, `cmUFu0`, `cmUGW0`, `cmUGb0`, `cmUGg`, `cmUGM0`).
2.  **Exibir mensagem de sucesso** - Mostra um alerta com uma mensagem de sucesso.
3.  **Ocultar elemento** - Oculta o elemento com ID `cmUFZ0`.

### Workflow cmUGw

# Workflow Ocultar Elemento Float

**Trigger:** `ButtonClicked` (do elemento "float")

## Summary
Oculta o elemento "float" quando um botão é clicado.

## Actions
1.  **Ocultar Elemento** - Oculta o elemento "float" (`cmVpN`).

### Workflow cmUHI

# Workflow cmUHI

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Ele executa duas ações: excluir um registro de telefone e ocultar um elemento.

## Actions
1.  **Delete Thing** - Exclui o registro relacionado ao elemento pai.
2.  **Hide Element** - Oculta o elemento com ID `cmUFZ0`.

### Workflow cmUHw

# Salvar Colaborador e Limpar Formulário

**Trigger:** `ButtonClicked` (botão com ID `cmUHr`)

## Summary
Este workflow salva as informações de um novo colaborador no banco de dados e, em seguida, limpa os campos do formulário e oculta um elemento.

## Actions
1.  **Criar novo 'colaboradores'**: Cria um novo registro no tipo de dado `colaboradores`, definindo os seguintes campos com base nos valores dos inputs correspondentes:
    *   `congregacao_text` ← valor do input `cmUHZ`
    *   `e_mail_text` ← valor do input `cmUHf`
    *   `hospital_text` ← valor do input `cmUHW`
    *   `nome_text` ← valor do input `cmUHi`
    *   `obs_text` ← valor do input `cmUHl`
    *   `profissao_text` ← valor do input `cmUHo`
    *   `telefone_text` ← valor do input `cmUHc`
2.  **Resetar Inputs**: Limpa o valor de todos os inputs do formulário.
3.  **Esconder Elemento**: Oculta o elemento com ID `cmUHO`.

### Workflow cmUIC

# Ocultar popup endereço/telefone

**Trigger:** `ButtonClicked`

## Summary
Oculta um elemento pop-up específico na página "endere_telefones".

## Actions
1. **Hide Element**: Oculta o elemento com ID `cmUHO`.

### Workflow cmUIG

# Workflow cmUIG

**Trigger:** `ButtonClicked` (Elemento: `cmUHL` - *verificar mapa de referência para nome legível*)

## Summary
Este workflow é acionado quando um botão específico é clicado e tem a função de exibir um elemento popup na tela.

## Actions
1.  **Show Element**: Exibe o elemento com o ID `cmUHO` (*verificar mapa de referência para nome legível*).

### Workflow cmUJE

# Workflow cmUJE

**Trigger:** `ButtonClicked` (Elemento: `cmUIR` - Ocultar Elemento)

## Summary
Este workflow tem como objetivo ocultar um elemento específico na página quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento com o ID `cmUIR`.

### Workflow cmUJI

# Workflow cmUJI

**Trigger:** `ButtonClicked` (Elemento: `cmUIu`)

## Summary
Este workflow é acionado quando um botão é clicado e tem como objetivo salvar as informações de endereço e telefone, além de ocultar um elemento específico.

## Actions
1.  **Change Thing** (`cmUJJ`) - Atualiza os campos do tipo "Thing" com os valores dos seguintes elementos:
    *   `bairro_text` (`cmUIZ`) para o campo `bairro_text`
    *   `cidade_text` (`cmUIc`) para o campo `cidade_text`
    *   `email_hosp_text` (`cmUIi`) para o campo `email_hosp_text`
    *   `endere_o_text` (`cmUIr`) para o campo `endere_o_text`
    *   `fone_uti_text` (`cmUJA`) para o campo `fone_uti_text`
    *   `nome_hospital_text` (`cmUIl`) para o campo `nome_hospital_text`
    *   `telefone_text` (`cmUIf`) para o campo `telefone_text`
    *   `website_text` (`cmUJN`) para o campo `website_text`
2.  **Hide Element** (`cmUJU`) - Oculta o elemento `cmUIR`.

### Workflow cmUJR

# Exibir e Atualizar Telefone

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, com o objetivo de exibir e carregar dados de um elemento específico, provavelmente relacionado a telefones.

## Actions
1.  **ShowElement** - Exibe o elemento com ID `cmUIR`.
2.  **DisplayGroupData** - Carrega dados no elemento com ID `cmUIR`, utilizando os dados do elemento pai como fonte.

### Workflow cmUJX

# Excluir registro de telefone

**Trigger:** `Button Clicked`

## Summary
Workflow para excluir um registro de telefone associado a um elemento pai.

## Actions
1.  **Delete Thing** - Exclui o registro de telefone.

### Workflow cmUKK

# Salvar dados de hospitais

**Trigger:** `ButtonClicked` (Elemento `cmUJz`)

## Summary
Este workflow é acionado quando um botão é clicado e salva as informações de um hospital no banco de dados, utilizando os dados inseridos em campos específicos da página.

## Actions
1.  **Criar um novo registro do tipo `hospitais1`**:
    *   Define os campos do novo registro:
        *   `bairro_text`: Obtém o valor do elemento `cmUJh`.
        *   `cidade_text`: Obtém o valor do elemento `cmUJk`.
        *   `email_hosp_text`: Obtém o valor do elemento `cmUJq`.
        *   `endere_o_text`: Obtém o valor do elemento `cmUJw`.
        *   `fone_uti_text`: Obtém o valor do elemento `cmUKD`.
        *   `nome_hospital_text`: Obtém o valor do elemento `cmUJt`.
        *   `telefone_text`: Obtém o valor do elemento `cmUJn`.
        *   `website_text`: Obtém o valor do elemento `cmUKG`.

### Workflow cmUKR

# Workflow para Mostrar Pop-up de Telefone

**Trigger:** `Button Clicked`

## Summary
Este workflow é acionado quando um botão específico é clicado, com o objetivo de exibir um pop-up relacionado a informações de telefone.

## Actions
1.  **Exibir Elemento** - Exibe o elemento com o ID `cmUJZ`.

### Workflow cmUKt

# Workflow cmUKt

**Trigger:** `ButtonClicked` (Elemento: `cmUKZ`)

## Summary
Este workflow é acionado pelo clique de um botão e tem como objetivo alternar a visibilidade de um elemento, provavelmente um menu lateral.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento `float` (ID: `cmVpN`).

### Workflow cmUKx

# Salvar Endereço Telefone

**Trigger:** `ButtonClicked` (no elemento "Button Salvar" - ID "cmUKd")

## Summary
Este workflow salva as informações de endereço e telefone preenchidas pelo usuário.

## Actions
1.  **Exibir/Ocultar Elemento:** Ativa/desativa a visibilidade do elemento "float" (ID "cmVpN").

### Workflow cmULk

# Workflow Salvar Telefone

**Trigger:** `ButtonClicked` (Elemento: **Botão Salvar** - ID: `cmUKz`)

## Summary
Workflow acionado ao clicar no botão "Salvar" para ocultar um elemento.

## Actions
1.  **Hide Element** - Oculta o elemento com o ID `cmUKz`.

### Workflow cmULo

```markdown
# Workflow Salvar Dados Endereço e Telefone

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo atualizar os dados de um registro de endereço e telefone com base nos valores de campos de entrada específicos.

## Actions
1.  **Salvar os dados de `endere_telefones`** - Atualiza o registro de `endere_telefones` com os valores dos campos de entrada: `nome_text`, `telefone_text`, `endereço_text`, `bairro_text` e `cidade_text`.
2.  **Esconder elemento** - Esconde o elemento com o ID `cmUKz`.
```

### Workflow cmULt

# Limpar Dados Temporários

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, com o objetivo de remover dados temporários e ocultar um elemento específico.

## Actions
1.  **DeleteThing** - Remove um elemento pai.
2.  **HideElement** - Oculta o elemento com o ID `cmUKz`.

### Workflow cmULy

# Workflow Salvar Telefone

**Trigger:** `ButtonClicked` (Elemento: Button Salvar)

## Summary
Este workflow salva as informações de telefone inseridas em um formulário.

## Actions
1.  **Exibir elemento** - Exibe o elemento "Popup Salvar Telefone".
2.  **Exibir dados do grupo** - Exibe os dados do grupo "Popup Salvar Telefone".

### Workflow cmUMd

# Esconder elemento float

**Trigger:** `ButtonClicked` (Elemento: `float`)

## Summary
Este workflow é acionado quando o botão "float" é clicado e tem como objetivo esconder o próprio elemento "float".

## Actions
1. **Hide Element** - Esconde o elemento "float".

### Workflow cmUMh

# Salvar Novo Endereço e Telefone

**Trigger:** `ButtonClicked` (Elemento `cmUMY`)

## Summary
Este workflow é acionado ao clicar em um botão. Ele cria um novo registro do tipo "custom.upa" (upa) com os dados inseridos em diversos campos, reseta os inputs e oculta um elemento específico.

## Actions
1.  **Create a new Thing** - Cria um novo registro do tipo `custom.upa` (upa).
    *   Define os seguintes campos:
        *   `bairro_text`: Valor do elemento `cmUMJ`.
        *   `cidade_text`: Valor do elemento `cmUMM`.
        *   `endere_o_text`: Valor do elemento `cmUMV`.
        *   `nome_text`: Valor do elemento `cmUMS`.
        *   `telefone_text`: Valor do elemento `cmUMP`.
2.  **Reset Inputs** - Limpa os valores de todos os campos de input associados ao elemento `cmUMY`.
3.  **Hide** - Oculta o elemento `cmUMB`.

### Workflow cmUMn

# Workflow cmUMn

**Trigger:** `ButtonClicked` (elemento: `cmUMB` - Assumindo que `cmUMB` é um botão)

## Summary
Exibe um popup específico relacionado a telefones.

## Actions
1.  **Exibir Elemento** - Mostra o elemento `cmUMB`.

### Workflow cmUNX

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Ele tem como objetivo excluir um item de telefone específico e ocultar um elemento de menu.

## Actions
1. **Delete Thing** - Exclui o item de telefone associado ao elemento pai.
2. **Hide Element** - Oculta o elemento de menu `Menuvertical AAA`.

### Workflow cmUNc

# Workflow Atualizar Contato

**Trigger:** `ButtonClicked`

## Summary
Este workflow atualiza os dados de um contato na página "endere_telefones" com base nos valores dos campos de entrada.

## Actions
1.  **Change Thing** - Atualiza os campos do contato:
    *   `contato_text`: Pega o valor do elemento "cmUNJ".
    *   `e_mail_text`: Pega o valor do elemento "cmUNG".
    *   `endere_o_text`: Pega o valor do elemento "cmUMx".
    *   `hor_atendimento_text`: Pega o valor do elemento "cmUNA".
    *   `nome_text`: Pega o valor do elemento "cmUNJ".
    *   `obs_text`: Pega o valor do elemento "cmUNM".
    *   `telefone_text`: Pega o valor do elemento "cmUND".

### Workflow cmUNg

```json
{
  "pages": {
    "bTGbC": "index",
    "cmMYA": "menu",
    "cmMhM": "plant_o",
    "cmMjQ": "minha_conta",
    "cmMnf": "encerrado_estudar",
    "cmNrc": "teste",
    "cmOAd": "cadastro_newuser",
    "cmOQI": "painel_controle",
    "cmPFX": "minhasub",
    "cmPqu": "gvp",
    "cmQCW": "lembretes",
    "cmQDh": "pesquisaeestudo",
    "cmQGO": "atas",
    "cmQnY": "membrosctba",
    "cmRGZ": "pal_instituicao",
    "cmRob": "view_palestras",
    "cmSTT": "relatorio",
    "cmSYD": "reg_novo_caso",
    "cmSwE": "atualizar_ler_caso",
    "cmVPP": "colihcwb",
    "cmVuY": "medddicos",
    "cmVzV": "newgvp",
    "cmWRJ": "menugvp",
    "cmXCr": "fotogvp",
    "cmXGy": "sandbox",
    "cmNfP0": "endere_telefones",
    "cmNxh0": "med_cad_espec",
    "cmQHI0": "palestraseventos",
    "cmTEb0": "casos",
    "cmTHl0": "lista_de_casos",
    "AAW": "reset_pw",
    "AAX": "404",
    "cmMoM": "ler_casoencerrado"
  },
  "elements": {
    "cmMjm": "Head",
    "cmPKP": "menuvertical",
    "cmPTx": "cabeçalho",
    "cmRQo": "HEAD VOLUN",
    "cmSmf": "Head_copy",
    "cmTJQ": "Menuvertical AAA",
    "cmVpN": "float",
    "ACr": "Signup / Login Popup",
    "bTGiM": "Header",
    "bTGkF": "Footer",
    "cmMlO": "foot",
    "cmNTj": "menu2"
  },
  "dataTypes": {},
  "optionSets": {},
  "workflows": {},
  "backendWorkflows": {
    "cmVcU": "del_ferias",
    "cmWUW": "sendWHATS_lembretedesign",
    "cmXEL": "sendtel_iniciodesign_ajudante",
    "cmXEX": "sendtel_lembretedesign_ajudante",
    "cmXEt": "REDACTED"
  }
}
```

# Esconder Elemento Popup

**Trigger:** `ButtonClicked` (do elemento `cmUMt`)

## Summary
Este workflow esconde um elemento popup quando um botão é clicado.

## Actions
1.  **Hide Element** - Esconde o elemento `cmUMp` (Signup / Login Popup).

### Workflow cmUNk

# Workflow cmUNk

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo exibir e carregar dados relacionados a telefones e endereços.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmUMp`.
2.  **Display Group Data** - Carrega os dados do grupo pai para o elemento com ID `cmUMp`.

### Workflow cmUOV

# Workflow cmUOV

**Trigger:** `ButtonClicked` (Elemento: não especificado no JSON, mas é acionado por um botão)

## Summary
Este workflow salva os dados de um formulário em um novo registro do tipo `custom.equipamentos` e, em seguida, reseta os campos de entrada e oculta um elemento específico.

## Actions
1.  **Criar novo Thing** (`custom.equipamentos`) - Cria um novo registro no tipo de dado `custom.equipamentos`, preenchendo os campos com os valores dos inputs:
    *   `contato_text`: Valor do elemento com ID `cmUON`.
    *   `e_mail_text`: Valor do elemento com ID `cmUOE`.
    *   `endere_o_text`: Valor do elemento com ID `cmUNv`.
    *   `hor_atendimento_text`: Valor do elemento com ID `cmUNy`.
    *   `nome_text`: Valor do elemento com ID `cmUOH`.
    *   `obs_text`: Valor do elemento com ID `cmUOK`.
    *   `telefone_text`: Valor do elemento com ID `cmUOB`.
2.  **Resetar Inputs** - Limpa todos os campos de entrada do formulário.
3.  **Esconder Elemento** - Oculta o elemento com ID `cmUNn`.

### Workflow cmUOb

# Workflow Esconder Elemento Endereço/Telefones

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão para esconder um elemento específico na página "endere_telefones".

## Actions
1.  **Hide Element** - Esconde o elemento "**float**" (ID: cmVpN).

### Workflow cmUOf

# Workflow Exibir Popup de Telefone

**Trigger:** `ButtonClicked` (Elemento: Button `cmUNn`)

## Summary
Este workflow é acionado quando um botão específico é clicado e tem como objetivo exibir um elemento popup.

## Actions
1.  **Exibir Elemento** (`ShowElement`) - Exibe o elemento popup com ID `cmUNn`.

### Workflow cmUPD

# Workflow cmUPD

**Trigger:** `ButtonClicked` (Elemento: `[Elemento ID cmUOo]`)

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de alternar a visibilidade de um elemento.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento `[Elemento ID cmUOo]`.

### Workflow cmUYp

# Salvar dados de endereço e telefone

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo criar um novo registro de "endere_telefones" no banco de dados, coletando informações de diversos campos de entrada. Após a criação do registro, os campos são resetados e um elemento específico (popup) é ocultado.

## Actions
1.  **Criar novo "endere_telefones"**: Cria uma nova entrada no tipo de dado "endere_telefones", populando os campos `contato_text`, `e_mail_text`, `endereco_text`, `hor_atendimento_text`, `nome_text`, `obs_text` e `telefone_text` com os valores dos elementos de entrada correspondentes (`cmUYP`, `cmUYf`, `cmUYW`, `cmUYZ`, `cmUYi`, `cmUYl`, `cmUYc`, respectivamente).
2.  **Resetar Inputs**: Limpa os valores de todos os campos de entrada associados a este workflow.
3.  **Esconder Elemento**: Oculta o elemento com ID `cmUYH`.

### Workflow cmUYv

# Workflow Mostrar Popup Contato

**Trigger:** `ButtonClicked` (Elemento: `cmUOv`)

## Summary
Este workflow é acionado quando um botão específico é clicado e sua função é exibir um elemento de popup.

## Actions
1.  **Show Element** (`cmUYw`) - Exibe o elemento com ID `cmUYH`.

### Workflow cmUYz

# Workflow cmUYz

**Trigger:** `ButtonClicked`

## Summary
Esconde um elemento específico após o clique de um botão.

## Actions
1.  **Hide Element** - Esconde o elemento com ID `cmUYH`.

### Workflow cmUbl

# Workflow Alternar Visibilidade Menu

**Trigger:** `Button PageElement Actions` (Button: cmUZd0)

## Summary
Este workflow é acionado quando um botão específico na página `endere_telefones` é clicado. Sua principal função é alternar a visibilidade de um elemento, provavelmente um menu ou painel lateral.

## Actions
1.  **Toggle Element** (`cmUbm`) - Alterna a visibilidade do elemento `cmUZV0`.

### Workflow cmUbp

# Workflow cmUbp

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e sua principal função é alternar a visibilidade de um elemento, provavelmente um menu ou popup.

## Actions
1.  **ToggleElement** - Alterna a visibilidade do elemento `cmUZZ0` (Menuvertical AAA).

---

### Workflow cmUcZ

# Workflow Salvar Dados de Endereço/Telefone

**Trigger:** `ButtonClicked` (elemento `cmUcC`)

## Summary
Este workflow é acionado quando um botão é clicado. Ele atualiza os dados de um registro existente com informações de campos de entrada (contato, email, endereço, horário de atendimento, nome, observações, telefone) e, em seguida, oculta um elemento específico (`cmUbr`).

## Actions
1.  **Change Thing** - Atualiza os seguintes campos do registro:
    *   `contato_text` com o valor do elemento `cmUbz`.
    *   `e_mail_text` com o valor do elemento `cmUcP`.
    *   `endere_o_text` com o valor do elemento `cmUcG`.
    *   `hor_atendimento_text` com o valor do elemento `cmUcJ`.
    *   `nome_text` com o valor do elemento `cmUcS`.
    *   `obs_text` com o valor do elemento `cmUcV`.
    *   `telefone_text` com o valor do elemento `cmUcM`.
2.  **Hide Element** - Oculta o elemento `cmUbr`.

### Workflow cmUce

# Excluir Telefone e Ocultar Menu

**Trigger:** `ButtonClicked` (Botão "excluir_telefone")

## Summary
Este workflow é acionado ao clicar em um botão para excluir um telefone e, em seguida, oculta um elemento de menu.

## Actions
1.  **Delete Thing** - Exclui o elemento pai do botão clicado.
2.  **Hide** - Oculta o elemento "Menuvertical AAA".

### Workflow cmUcj

# Ocultar Popup Telefone

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento do tipo popup ao ser acionado.

## Actions
1. **HideElement**: Oculta o elemento **float** (ID: cmVpN).

### Workflow cmUcn

# Workflow Exibir Detalhes Telefone

**Trigger:** `ButtonClicked` (do elemento "Button Exibir" - ID: cmUbr)

## Summary
Este workflow é acionado ao clicar em um botão para exibir detalhes de um telefone, mostrando informações relacionadas em um grupo.

## Actions
1.  **Show Element**: Exibe o elemento com ID "cmUbr" (presumivelmente um botão que dispara o workflow ou um elemento relacionado à exibição).
2.  **Display Group Data**: Exibe os dados do grupo pai do elemento com ID "cmUbr", provavelmente populando o grupo com informações de telefone.

### Workflow cmUdX

# Salvar Dados de Hospital/Endereço

**Trigger:** `ButtonClicked` (elemento `cmUdA`)

## Summary
Este workflow é acionado quando um botão é clicado. Ele cria um novo registro no tipo de dado `med_hospitalar` com os valores dos inputs, reseta os inputs e esconde um elemento específico.

## Actions
1.  **Create a new thing:** Cria um novo registro do tipo `custom.med_hospitalar`.
    *   `contato_text`: Valor do input `cmUcx`.
    *   `e_mail_text`: Valor do input `cmUdN`.
    *   `endere_o_text`: Valor do input `cmUdE`.
    *   `hor_atendimento_text`: Valor do input `cmUdH`.
    *   `nome_text`: Valor do input `cmUdQ`.
    *   `obs_text`: Valor do input `cmUdT`.
    *   `telefone_text`: Valor do input `cmUdK`.
2.  **Reset Inputs:** Reseta os campos de input do formulário.
3.  **Hide Element:** Esconde o elemento `cmUcp`.

### Workflow cmUdd

# Ocultar elemento popup

**Trigger:** `ButtonClicked` (Elemento: `ACr - Signup / Login Popup`)

## Summary
Oculta o elemento popup de login/cadastro quando um botão é clicado.

## Actions
1. **Esconder Elemento** - Oculta o elemento `ACr - Signup / Login Popup`.

### Workflow cmUdh

# Workflow cmUdh

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado para exibir um popup de detalhes de telefone.

## Actions
1. **Show Element** - Exibe o elemento com o ID `cmUcp`.

### Workflow cmUDP0

# Workflow Salvar Telefone

**Trigger:** `ButtonClicked` (Elemento: "Button Salvar Telefone" - ID: cmUDD0)

## Summary
Este workflow é acionado pelo clique no botão "Button Salvar Telefone", com o objetivo de alternar a visibilidade de um elemento específico.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento com ID "cmUDD0".

### Workflow cmUDc0

# Workflow cmUDc0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado para alternar a visibilidade de um elemento na página 'endere_telefones'.

## Actions
1.  **Toggle Element** - Alterna a visibilidade do elemento `float`.

### Workflow cmUDx0

# Workflow Salvar Telefone

**Trigger:** `ButtonClicked` (do elemento "cmUDk0")

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de salvar ou atualizar informações de telefone.

## Actions
1.  **Alternar Elemento** (`ToggleElement`) - Ativa/desativa o elemento "cmUDk0".

### Workflow cmUEB0

# Abrir/Fechar Menu Vertical

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e sua função é alternar a visibilidade de um elemento menu vertical.

## Actions
1. **Toggle Element** - Alterna a visibilidade do elemento **menuvertical** (ID: `cmPKP`).

---

### Workflow cmUES0

# Workflow Toggle Menu Vertical

**Trigger:** `ButtonClicked` (Elemento: `cmUEG0`)

## Summary
Este workflow é acionado quando um botão específico é clicado para alternar a visibilidade de um menu vertical.

## Actions
1. **ToggleElement**: Alterna a visibilidade do elemento `cmPKP` (Menuvertical).

### Workflow cmUEW0

# Workflow Toggle Menu Vertical

**Trigger:** `ButtonClicked` (elemento: `cmUEK0`)

## Summary
Este workflow tem a finalidade de alternar a visibilidade de um menu vertical.

## Actions
1.  **Toggle Element**: Alterna a visibilidade do elemento `Menuvertical AAA` (`cmTJQ`).

### Workflow cmUFV0

# Workflow Exibir/Atualizar Endereço e Telefone

**Trigger:** `ButtonClicked` (do elemento com ID `cmUFE0`)

## Summary
Este workflow é acionado quando um botão específico é clicado. Ele exibe um grupo de elementos (ID `cmUFZ0`) e, em seguida, carrega os dados desse grupo, provavelmente para exibir ou atualizar informações de endereço e telefone.

## Actions
1.  **Show Element** (`cmUGC0`) - Exibe o elemento/grupo com ID `cmUFZ0`.
2.  **Display Group Data** (`cmUGD0`) - Carrega os dados do elemento pai (`ElementParent`) para o elemento/grupo com ID `cmUFZ0`.

### Workflow cmUPq0

# Atualizar Dados de Contato

**Trigger:** `ButtonClicked`

## Summary
Atualiza os dados de contato do usuário na página "endere_telefones" com as informações inseridas nos campos do formulário.

## Actions
1.  **Change Thing** - Atualiza os campos `contato_text`, `e_mail_text`, `endereco_text`, `hor_atendimento_text`, `nome_text`, `obs_text` e `telefone_text` com os valores obtidos dos elementos de entrada correspondentes (com IDs `cmUPQ0`, `cmUPg0`, `cmUPX0`, `cmUPa0`, `cmUPj0`, `cmUPm0`, `cmUPd0`).
2.  **Hide Element** - Esconde o elemento com ID `cmUPI0`.

### Workflow cmUPv0

# Workflow cmUPv0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de excluir um item da base de dados e ocultar um elemento visual.

## Actions
1.  **Delete Thing** - Exclui o item pai do elemento referenciado.
2.  **Hide Element** - Oculta o elemento referenciado por `cmUPI0`.

### Workflow cmUQA0

# Workflow Salvar Telefone Endereço

**Trigger:** `ButtonClicked` (Elemento: **Button Salvar Telefone Endereço**)

## Summary
Este workflow é acionado ao clicar no botão "Salvar Telefone Endereço" e tem como objetivo ocultar o popup de edição de telefone.

## Actions
1. **HideElement** - Oculta o elemento **Popup Telefone Endereço**.

### Workflow cmUQI0

# Workflow cmUQI0

**Trigger:** `Button Clicked` (Elemento: `[Elemento não encontrado no mapa: cmUOk]`)

## Summary
Este workflow tem como objetivo alternar a visibilidade de um elemento específico.

## Actions
1. **Toggle Element** - Alterna a visibilidade do elemento `[Elemento não encontrado no mapa: cmUOk]`.

### Workflow cmUQM0

# Workflow Exibir Telefone

**Trigger:** `ButtonClicked` (Elemento: [Botão Exibir Telefone] - ID: cmUPI0)

## Summary
Este workflow é acionado ao clicar em um botão para exibir detalhes de telefone e mostrar os dados associados a um grupo.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmUPI0` (Botão Exibir Telefone).
2.  **Display Group Data** - Exibe dados no grupo com ID `cmUPI0` (Botão Exibir Telefone), utilizando os dados do seu elemento pai como fonte.

### Workflow cmUZj0

# Alternar Menu Vertical

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de alternar a visibilidade de um elemento de menu vertical.

## Actions
1.  **Alternar Elemento** - Alterna a visibilidade do elemento `Menuvertical AAA`.

### Workflow cmUZo0

# Workflow: Alterar visibilidade de popup

**Trigger:** `ButtonClicked` (Elemento: `[Referência do elemento com ID cmUZJ0 não encontrada no mapa]`)

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo alternar a visibilidade de um popup.

## Actions
1. **Alternar Elemento** (`ToggleElement`) - Alterna a visibilidade do elemento com ID `cmUZJ0`.

### Workflow cmUaZ0

# Workflow Atualizar dados de contato

**Trigger:** `ButtonClicked` (Elemento: Botão Salvar ou similar que aciona `cmUaX0`)

## Summary
Este workflow atualiza os dados de um contato na página "endere_telefones". Ele coleta informações de campos de entrada e salva essas atualizações no banco de dados.

## Actions
1.  **ChangeThing** (`cmUaa0`) - Atualiza o registro do contato.
    *   Define `contato_text` com o valor do elemento `cmUZz0`.
    *   Define `e_mail_text` com o valor do elemento `cmUaP0`.
    *   Define `endere_o_text` com o valor do elemento `cmUaG0`.
    *   Define `hora_atendimento_text` com o valor do elemento `cmUaJ0`.
    *   Define `nome_text` com o valor do elemento `cmUaS0`.
    *   Define `obs_text` com o valor do elemento `cmUaV0`.
    *   Define `telefone_text` com o valor do elemento `cmUaM0`.
2.  **HideElement** (`cmUab0`) - Oculta o elemento `cmUZr0`.

### Workflow cmUae0

# Workflow Salvar e Esconder Elemento

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado. Ele executa duas ações: excluir um elemento e esconder outro.

## Actions
1.  **Delete Thing** - Exclui um elemento do tipo `ElementParent`.
2.  **Hide Element** - Esconde o elemento com o ID `cmUZr0`.

### Workflow cmUaj0

# Workflow cmUah0

**Trigger:** `Button CLicked` (referente ao elemento com ID `cmUZr0`)

## Summary
Este workflow oculta um elemento quando um botão é clicado.

## Actions
1.  **Hide Element** - Oculta o elemento com ID `cmUZr0`.

### Workflow cmUan0

```markdown
# Workflow - Mostrar e Exibir Dados de Grupo

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão, com o objetivo de exibir um grupo específico e carregar seus dados.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmUZr0`.
2.  **Display Group Data** - Carrega os dados do grupo pai para o elemento com ID `cmUZr0`.
```

### Workflow cmUbX0

# Salvar e Resetar Dados de Contato

**Trigger:** `ButtonClicked` (Elemento: `cmUbB0`)

## Summary
Este workflow é acionado quando um botão é clicado. Ele cria um novo registro do tipo `med_farmaceutico`, populando os campos com dados de inputs específicos na página. Após a criação, reseta os inputs e oculta um elemento.

## Actions
1.  **Criar novo `med_farmaceutico`** - Cria uma nova entrada no tipo de dado `med_farmaceutico`.
    *   `contato_text`: Valor do input `cmUay0`.
    *   `e_mail_text`: Valor do input `cmUbN0`.
    *   `endere_o_text`: Valor do input `cmUbE0`.
    *   `hora_atendimento_text`: Valor do input `cmUbH0`.
    *   `nome_text`: Valor do input `cmUbQ0`.
    *   `obs_text`: Valor do input `cmUbT0` (pode ser vazio).
    *   `telefone_text`: Valor do input `cmUbK0`.
2.  **Resetar Inputs** - Limpa os valores de todos os inputs que foram previamente definidos para serem resetados.
3.  **Ocultar Elemento** - Esconde o elemento com ID `cmUaq0`.

### Workflow cmUbd0

# Workflow cmUbd0

**Trigger:** `ButtonClicked` (botão com ID `cmUaq0` na página `endere_telefones`)

## Summary
Este workflow oculta um elemento específico na página `endere_telefones` quando um botão é clicado.

## Actions
1.  **Ocultar Elemento** (`cmUbe0`) - Oculta o elemento com ID `cmUaq0`.

### Workflow cmUbh0

# Workflow Redireciona para Popup de Signup/Login

**Trigger:** `ButtonClicked` (Elemento: `Signup / Login Popup`)

## Summary
Este workflow é acionado quando o botão "Signup / Login Popup" é clicado. Ele exibe o popup de cadastro/login.

## Actions
1.  **Show Element** - Exibe o elemento `Signup / Login Popup`.

## med_cad_espec

# med_cad_espec

## Summary
Página destinada ao cadastro de médicos, permitindo a adição de suas especialidades. Contém funcionalidades de busca e exibição de médicos cadastrados.

### UI
* **Group C** (Group) - Container principal para botões de ação.
  * **Button B** (Button) - Botão para a ação de "Cadastrar".
  * **Button C** (Button) - Botão para a ação de "Add Espec".
* **Text HZ** (Text) - Título exibindo "Médicos" com um ícone de estetoscópio.
* **Group X** (Group) - Container para o campo de busca e ícone de pesquisa.
  * **Input Q** (Input) - Campo de texto para buscar por médicos.
  * **Icon F** (Icon) - Ícone de lupa para iniciar a busca.
* **RepeatingGroup D** (RepeatingGroup) - Exibe a lista de médicos cadastrados.
  * **Text XZ** (Text) - Exibe o nome e a especialidade de cada médico.

### Workflows
* **Button C Clicked**: `Button C` (Add Espec) Clicked → Ação 1: `open_popup` (Popup: `Signup / Login Popup`)

### Workflow cmOEv

# Workflow cmOEv

**Trigger:** `ButtonClicked` (elemento "cmOEm")

## Summary
Este workflow é acionado ao clicar em um botão específico, exibindo um elemento (popup) e carregando dados dentro dele.

## Actions
1.  **Show Element** - Exibe o elemento com ID "cmOFJ".
2.  **Display Group Data** - Carrega dados do elemento pai para o elemento com ID "cmOFJ".

### Workflow cmOGN

# Esconder Elemento Popup

**Trigger:** `ButtonClicked`

## Summary
Este workflow esconde um elemento específico quando um botão é clicado.

## Actions
1.  **Hide element** - Esconde o elemento com ID `cmOFJ`.

### Workflow cmOGn

# Workflow cmOGn

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo exibir um grupo específico de elementos (popup) e carregar os dados relacionados a ele.

## Actions
1.  **Show Element** (`cmOGo`) - Exibe o elemento com ID `cmOFJ`.
2.  **Display Group Data** (`cmOGp`) - Carrega dados no elemento com ID `cmOFJ`, utilizando os dados do elemento pai como fonte.

### Workflow cmPeI

# Workflow Salvar Especialidade

**Trigger:** `ButtonClicked` (Elemento: Botão não especificado no JSON, mas aciona o workflow na página `med_cad_espec`)

## Summary
Este workflow é acionado quando um botão é clicado. Ele cria um novo registro do tipo "especialidade", reseta os campos de entrada e oculta um elemento específico.

## Actions
1.  **Criar Novo Thing** - Cria um novo registro do tipo `custom.especialidade` com o valor do campo `nome_text` (Elemento ID: `cmOzZ`) como `nome_text`.
2.  **Reset Inputs** - Reseta todos os campos de entrada.
3.  **Hide Element** - Oculta o elemento com ID `cmOyU`.

### Workflow cmPfZ

# Workflow cmPfZ

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado, sua função principal é exibir um grupo de elementos e exibir os dados desse grupo.

## Actions
1.  **Exibir Elemento** (`cmPfa`) - Exibe o elemento com ID `cmPek`.
2.  **Exibir Dados do Grupo** (`cmPfb`) - Exibe os dados do grupo pai do elemento com ID `cmPek`.

### Workflow cmQcD

# Workflow Abrir Detalhes Espec.

**Trigger:** `ButtonClicked` (Elemento: `cmQbv`)

## Summary
Abre um grupo para exibir detalhes de uma especialidade médica e carrega os dados correspondentes.

## Actions
1. **Show Element** - Exibe o elemento `cmOFJ`.
2. **Display Group Data** - Carrega os dados do grupo pai no elemento `cmOFJ`.

### Workflow cmUWt

# Criar Novo Médico

**Trigger:** `ButtonClicked` (Elemento: `cmNys0`)

## Summary
Este workflow é acionado quando um botão é clicado. Ele coleta dados de vários elementos de entrada na página e os armazena.

## Actions
1.  **Define a set of custom states**: Define os seguintes estados customizados no elemento `cmNys0`:
    *   `acompanhante_text` com o valor do elemento `cmNyU0`.
    *   `atend_consult_boolean` com o valor do elemento `cmNyi0`.
    *   `endereco_consulto_text` com o valor do elemento `cmNyp0`.
    *   `hospitais_atua_text` com o valor do elemento `cmNyS0`.
    *   `infos_add_text` com o valor do elemento `cmNyq0`.
    *   `medico_tj_boolean` com o valor do elemento `cmNya0`.
    *   `membro_text` com o valor do elemento `cmNxk0`.
    *   `nome_text` com o valor do elemento `cmNxn0`.
    *   `pediatria_boolean` com o valor do elemento `cmNyA0`.
    *   `prim_visita_boolean` com o valor do elemento `cmNxv0`.
    *   `revisita_boolean` com o valor do elemento `cmNxs0`.
    *   `sus_boolean` com o valor do elemento `cmNyI0`.
    *   `tel_confidencial_text` com o valor do elemento `cmNyQ0`.
    *   `REDACTED` com o valor do elemento `cmOEx`.
    *   `e_mail_text` com o valor do elemento `cmOGW`.
    *   `end_hospital_text` com o valor do elemento `cmOHE`.

### Workflow cmUXe

# Workflow cmUXe

**Trigger:** `ButtonClicked` (Elemento: `cmOyU`)

## Summary
Este workflow exibe um elemento de interface gráfica (popup) quando um botão é clicado.

## Actions
1. **Show Element** - Exibe o elemento `cmOyU`.

### Workflow cmUXo

# Workflow cmUXo

**Trigger:** `ButtonClicked` (Elemento: `cmUXj` - Botão Implícito)

## Summary
Este workflow é acionado pela interação do usuário com um botão, ocultando um elemento e exibindo outro.

## Actions
1.  **Ocultar Elemento** - Oculta o elemento com ID `cmNxi0`.
2.  **Exibir Elemento** - Exibe o elemento com ID `cmUAE0`.

### Workflow cmVKE

# Workflow cmVKE

**Trigger:** `ButtonClicked`

## Summary
Atualiza o campo "nome_text" de um elemento e oculta outro elemento.

## Actions
1.  **Change Thing**: Modifica o campo `nome_text` do elemento pai para o valor obtido de `get_data` do elemento `cmVJM0`.
2.  **Hide Element**: Oculta o elemento `cmVJJ0`.

### Workflow cmNzH0

```markdown
# Workflow Ocultar/Exibir Elementos Específicos

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta ou exibe elementos na página "med_cad_espec" quando um botão é clicado.

## Actions
1. **Hide Element** - Oculta o elemento com ID `cmUAE0`.
2. **Show Element** - Exibe o elemento com ID `cmNxi0`.
3. **Hide Element** - Oculta o elemento com ID `cmOEf`.
4. **Hide Element** - Oculta o elemento com ID `cmOGh`.
```

### Workflow cmPiD0

# Atualizar dados do médico

**Trigger:** `ButtonClicked` (Elemento: "SALVARedit")

## Summary
Este workflow atualiza as informações de um médico com base nos dados inseridos nos campos da página "med_cad_espec".

## Actions
1.  **Modificar um campo de dado:** Salva os valores dos campos de texto (`nome_text`, `hospitais_atua_text`, `tel_contato_text`, `endereco_consulto_text`, `infos_add_text`, `tel_confidencial_text`, `e_mail_text`, `nome_secre_text`, `tel_secretaria_text`) e booleanos (`pediatria_boolean`, `sus_boolean`, `convenio_boolean`, `particular_boolean`, `telemedicina_boolean`, `medico_tj_boolean`) no registro do médico. Os valores são obtidos diretamente dos elementos de entrada correspondentes na página.
2.  **Modificar um campo de dado:** Atualiza o campo `ultima_visita_date` com o valor do elemento de entrada correspondente na página.

### Workflow cmPjc0

# Workflow Excluir e Ocultar Elementos

**Trigger:** `ButtonClicked` (Elemento: `cmPeR`)

## Summary
Este workflow é acionado quando um botão específico (ID: `cmPeR`) é clicado. Sua função é excluir um elemento pai (ID: `cmPjd0`) e ocultar outro elemento (ID: `cmPje0`).

## Actions
1.  **Delete Thing** (`cmPjd0`) - Exclui o elemento pai (ID: `to_delete`).
2.  **Hide Element** (`cmPje0`) - Oculta o elemento com o ID `cmOFJ`.

### Workflow cmUAY0

# Abrir/Fechar Popup Menu

**Trigger:** `ButtonClicked`

## Summary
Este workflow aciona a abertura ou fechamento de um popup de menu (float) ao clicar em um botão.

## Actions
1.  **Toggle** - Alterna a visibilidade do elemento `float`.

### Workflow cmUAn0

# Workflow cmUAl0

**Trigger:** `ButtonClicked`

## Summary
Exibe e carrega dados em um grupo específico na página "med_cad_espec".

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmOFJ` (grupo).
2.  **Display Group Data** - Carrega dados no grupo com ID `cmOFJ` a partir de seu elemento pai.

---

### Workflow cmVDz0

# Workflow Redireciona Pós Cadastro

**Trigger:** `ButtonClicked` (ao clicar em um botão específico)

## Summary
Este workflow é acionado quando um botão é clicado e tem como principal objetivo ocultar um elemento específico na página após a ação.

## Actions
1.  **HideElement** - Oculta o elemento com o ID "cmPek".

### Workflow cmVIu0

# Workflow MedEsp Form Submit

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e tem como objetivo ocultar um elemento específico na página.

## Actions
1.  **HideElement** - Oculta o elemento com ID `cmOyU`.

### Workflow cmVJE0

# Exibir popup de elemento

**Trigger:** `ButtonClicked` (do elemento com ID `cmOyU`)

## Summary
Este workflow é acionado quando um botão é clicado e exibe um elemento pop-up específico.

## Actions
1.  **Exibir elemento** - Exibe o elemento com ID `cmOyU`.

### Workflow cmVJV0

# Workflow cmVJV0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado pelo clique de um botão e tem como objetivo exibir um grupo e carregar dados nele.

## Actions
1.  **Show Element** - Exibe o elemento com ID `cmVJJ0`.
2.  **Display Group Data** - Carrega dados do elemento pai no elemento com ID `cmVJJ0`.

### Workflow cmVJa0

# Workflow cmVJa0

**Trigger:** `ButtonClicked`

## Summary
O workflow é acionado quando um botão específico é clicado, executando a ação de ocultar um elemento.

## Actions
1.  **Hide Element** - Oculta o elemento com ID `cmVJJ0`.

### Workflow cmVJi0

# Workflow Salvar Especialidade Médica

**Trigger:** `ButtonClicked` (botão com ID: cmVJd0)

## Summary
Este workflow é acionado ao clicar em um botão para salvar ou atualizar informações de especialidade médica. Ele deleta um elemento pai existente antes de uma possível ação de criação ou atualização de dados.

## Actions
1.  **Delete Thing**: Deleta o elemento pai (`ElementParent`).

## palestraseventos

# palestraseventos

## Summary
Esta página exibe um formulário para cadastro de palestras e eventos, permitindo a inserção de detalhes como local, palestrante, assistência e informações adicionais. Inclui campos para data e turma.

### UI
*   **Popup nova palestra** (Popup) - Contém o formulário de cadastro de palestras.
    *   **Group B** (Group) - Grupo principal do formulário.
        *   **Input Local n** (Input) - Campo para inserir o local da palestra.
        *   **Group B** (Group) - Container para o botão Salvar.
            *   **Text C** (Text) - Botão para salvar as informações.
        *   **Dropdown A** (Dropdown) - Campo para selecionar a turma (Estudantes, Enfermeiras (os), Médicos, Advogados).
        *   **Date/TimePicker A** (DateInput) - Campo para selecionar a data da palestra.
        *   **Input Palestrante n** (Input) - Campo para inserir o nome do palestrante.
        *   **Input Assistência n** (Input) - Campo para inserir o número de assistências.
        *   **MultilineInput info add** (MultiLineInput) - Campo para informações adicionais.
    *   **Group I** (Group) - Grupo do cabeçalho do popup.
        *   **Text L** (Text) - Título "Nova Palestra".
        *   **Icon A** (Icon) - Ícone de fechar (X).
*   **Popup nova palestra** (Popup) - Formulário duplicado para cadastro de palestras.
    *   **Group C** (Group) - Grupo principal do formulário.
        *   **Input Local e** (Input) - Campo para inserir o local da palestra.

### Workflows
*   **Popup A**: `Element is Visibly` → `Show popup` (Popup: `Popup A`) → `Element is Visibly` (Element: `Popup A`)
*   **Popup A**: `Element is Visibly` → `Show popup` (Popup: `Popup B`) → `Element is Visibly` (Element: `Popup B`)

### Workflow cmPpo

# Workflow cmPpo

**Trigger:** `ButtonClicked` (Elemento: `cmQGj0` - Nome Resolvido: Não encontrado no mapa)

## Summary
Este workflow tem como objetivo exibir um elemento modal ou popup específico quando um botão é clicado.

## Actions
1. **Exibir Elemento** (`ShowElement`) - Torna visível o elemento com o ID `cmQGn0` (Nome Resolvido: Não encontrado no mapa).

### Workflow cmQEY

# Mostrar popup e dados do evento

**Trigger:** `ButtonClicked`

## Summary
Exibe um popup e carrega dados associados a um evento quando um botão é clicado.

## Actions
1.  **Show Element** (`cmQHu`) - Exibe o elemento popup.
2.  **Display Group Data** (`cmQHu`) - Carrega e exibe dados no elemento popup.

### Workflow cmQEf

# Workflow cmQEf - Excluir Item

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e sua única ação é excluir um item específico.

## Actions
1.  **Delete Thing** - Exclui o item pai do elemento clicado.

### Workflow cmQEx

# Salvar Palestra/Evento

**Trigger:** `ButtonClicked` (Elemento: "Text SALVAR arq is clicked")

## Summary
Este workflow é acionado ao clicar no elemento "Text SALVAR arq is clicked". Sua função é criar um novo registro do tipo `custom.palestraevento` no banco de dados, populando seus campos com os valores dos inputs e elementos visuais correspondentes. Após a criação, ele reseta os inputs e oculta um elemento específico.

## Actions
1.  **Criar um novo `custom.palestraevento`** - Salva um novo registro no banco de dados.
    *   `assistencia_text`: Valor do elemento "cmQHj0" (GetElement).
    *   `infoadicional_text`: Valor do elemento "cmQHp0" (GetElement).
    *   `local_text`: Valor do elemento "cmQGq0" (GetElement).
    *   `palestrante_text`: Valor do elemento "cmQHd0" (GetElement).
    *   `turma_de_text`: Valor do elemento "cmQHm0" (GetElement).
    *   `date_date`: Valor do elemento "cmQHg0" (GetElement).
2.  **Reset inputs** - Limpa todos os campos de input do formulário.
3.  **Ocultar elemento** - Oculta o elemento "cmQGn0".

### Workflow cmQIK

# Atualizar Dados de Palestra

**Trigger:** `ButtonClicked` (Elemento: "Text SALVAR edit is clicked")

## Summary
Atualiza campos de uma palestra ou evento com dados obtidos de elementos de entrada na página "palestraseventos".

## Actions
1.  **Modificar Coisa** - Atualiza os seguintes campos do elemento pai (a palestra/evento sendo editada):
    *   `assistencia_text`: Obtém o valor do elemento com ID `cmQID`.
    *   `infoadicional_text`: Obtém o valor do elemento com ID `cmQIE`.
    *   `local_text`: Obtém o valor do elemento com ID `cmQHy`.
    *   `palestrante_text`: Obtém o valor do elemento com ID `cmQIC`.
    *   `turma_de_text`: Obtém o valor do elemento com ID `cmQIF`.
    *   `date_date`: Obtém o valor do elemento com ID `cmQIG`.

### Workflow cmROB

# Workflow cmROB

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado quando um botão é clicado e redireciona o usuário para a página "view_palestras".

## Actions
1.  **Change Page** - Redireciona para a página `view_palestras`.

### Workflow cmVav

# Workflow Ocultar Float ao Clicar Botão

**Trigger:** `ButtonClicked`

## Summary
Este workflow oculta um elemento do tipo 'float' quando um botão específico é clicado.

## Actions
1. **Hide Element** - Oculta o elemento **float**.

### Workflow cmVbE

# Workflow Ocultar Popup e Resetar Inputs

**Trigger:** `ButtonClicked` (Elemento: `cmQGn0`)

## Summary
Este workflow oculta um elemento específico (popup) e reseta todos os campos de input na página.

## Actions
1.  **Hide Element** (`cmVbF`) - Oculta o elemento com ID `cmQGn0`.
2.  **Reset Inputs** (`cmVbG`) - Reseta os valores de todos os inputs na página atual.

## casos

# casos (Página)

## Summary
Esta página exibe uma lista de casos compartilhados com o usuário. Filtra e apresenta casos com status "Aberto" e associados ao usuário atual.

### UI
* **Head** (Grupo) - Cabeçalho da página.
  * **Text A** (Texto) - Título "CASOS".
  * **Text L** (Texto) - Subtítulo "CASOS COMPARTILHADOS COMIGO".
  * **Group F** (Grupo) - Container para a lista de casos.
    * **RepeatingGroup C** (Grupo Repetindo) - Exibe a lista de casos.
      * **Group F** (Grupo) - Representa uma linha na lista de casos.
        * **Text M** (Texto) - Nome do paciente.
        * **Text M** (Texto) - Idade do paciente.
        * **Text** (Texto) - Informações adicionais de morbidade.

### Workflows
Nenhum workflow encontrado nesta página.

### Workflow cmTJJ

# Workflow cmTJJ

**Trigger:** `ButtonClicked`

## Summary
Redireciona o usuário para a página de detalhes de um caso específico após um clique.

## Actions
1.  **Change Page** - Redireciona para a página **casos** (página de destino com ID `cmTEb0`).

### Workflow cmTkJ

# Ir para Lista de Casos

**Trigger:** `ButtonClicked`

## Summary
Este workflow redireciona o usuário para a página "lista_de_casos".

## Actions
1.  **Ir para página** - Redireciona para a página `lista_de_casos`.

### Workflow cmVrW

# Navegar para página de Casos

**Trigger:** `ButtonClicked`

## Summary
Este workflow navega para a página de Casos quando um botão é clicado.

## Actions
1.  **Change Page** - Redireciona para a página `casos` (ID: `cmTEb0`).

### Workflow cmTEk0

```markdown
# Navegar para Lista de Casos

**Trigger:** `ButtonClicked` (Elemento: `cmSWn` - Nome Legível: Não encontrado no mapa de referência)

## Summary
Este workflow é acionado quando um botão específico é clicado e navega o usuário para a página "casos".

## Actions
1.  **Change Page** - Redireciona para a página `casos`.
```

### Workflow cmTFd0

# Ir para Casos

**Trigger:** `ButtonClicked`

## Summary
Redireciona para a página de Casos quando um botão é clicado.

## Actions
1. **Ir para página** - Redireciona o usuário para a página `casos`.

## lista_de_casos

# lista_de_casos

## Summary
Página que exibe uma lista de casos registrados, com detalhes como nome do paciente, idade, morbilidade e membro responsável.

### UI
* **Head** (Group) - Grupo principal de cabeçalho da página.
  * **Text A** (Text) - Título da página: "LISTA DE CASOS".
* **Group C** (Group) - Grupo que contém a lista de casos.
  * **RepeatingGroup B** (RepeatingGroup) - Exibe a lista de casos registrados.
    * **Group C** (Group) - Grupo de cada item da lista de casos.
      * **Text F** (Text) - Exibe o nome do paciente.
      * **Text F** (Text) - Exibe a idade do paciente (visível apenas em telas menores que 700px).
      * **Text F** (Text) - Exibe informações adicionais de morbilidade.
      * **Text** (Text) - Exibe o nome do membro responsável pelo caso.

### Workflows
Não há workflows configurados para esta página.

### Workflow cmTeR

# Workflow cmTeR

**Trigger:** `ButtonClicked` (Elemento: `cmTeK`)

## Summary
Este workflow navega para a página anterior quando um botão é clicado.

## Actions
1.  **Show Previous Page** - Exibe a página anterior.

### Workflow cmTeV

# Workflow cmTeV

**Trigger:** `ButtonClicked` (Elemento: `cmTdw` - **Botão com texto "avançar" não especificado no mapa de elementos**, mas inferido pela ação)

## Summary
Este workflow avança para o próximo item em uma lista quando um botão específico é clicado.

## Actions
1.  **ListShowNext** - Avança para o próximo item na lista do elemento `cmTdw`.

### Workflow cmTee

# Workflow cmTee

**Trigger:** `ButtonClicked`

## Summary
Este workflow redireciona o usuário para a página de detalhes de um caso após o clique em um botão.

## Actions
1.  **Change Page** - Redireciona para a página **lista_de_casos** (ID do elemento: `cmSoy`).

### Workflow cmVcY

# Workflow cmVcY

**Trigger:** `ButtonClicked` (Elemento: `(Button) Salvar`)

## Summary
Este workflow é acionado quando um botão é clicado e navega o usuário para a página "lista_de_casos".

## Actions
1.  **Change Page** - Navega para a página **lista_de_casos**.

### Workflow cmTEk0

# Workflow cmTEk0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão e redireciona o usuário para outra página.

## Actions
1.  **Change Page** - Redireciona o usuário para a página **casos**.

### Workflow cmTHo0

# Workflow cmTHo0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão específico e redireciona o usuário para outra página.

## Actions
1.  **Change Page** - Redireciona o usuário para a página **lista_de_casos**.

### Workflow cmVJo0

# Workflow cmVJm0

**Trigger:** `ButtonClicked`

## Summary
Este workflow é acionado ao clicar em um botão específico e redireciona o usuário para um popup de login ou cadastro.

## Actions
1.  **Change Page** - Redireciona para o popup **Signup / Login Popup** (`ACr`).

## reset_pw

# reset_pw (Página)

## Summary
Esta página, acessível pelo caminho `/reset_pw`, permite aos usuários redefinir suas senhas. Contém um título principal "Redefinir Senha" e um subtítulo explicativo sobre a funcionalidade da página.

### UI
* **Group G** (Group) - Container principal da página.
  * **Group M** (Group) - Container para o cabeçalho e conteúdo principal.
    * **Header A** (CustomElement) - Representa o cabeçalho da página.
    * **Group C** (Group) - Container para a seção de título e subtítulo.
      * **Group F** (Group) - Container para o cabeçalho responsivo.
        * **Header B** (CustomElement) - Cabeçalho responsivo com custom definition "Header".
      * **Group L** (Group) - Container para o conteúdo de texto.
        * **Group C** (Group) - Container para o título e subtítulo.
          * **Group C** (Group) - Container interno para o título.
            * **Group E** (Group) - Container para o título principal.
              * **Text A** (Text) - Título: "Redefinir Senha".
            * **Group K** (Group) - Container para o subtítulo.
              * **Text A** (Text) - Subtítulo: "Normal, acontece...". (Estilo: Text_h2_header_)
  * **Group N** (Group) - Container para a descrição e o formulário de redefinição de senha (formulário não totalmente visível nos dados fornecidos).
    * **Group B** (Group) - Container para o formulário.
      * **Group A** (Group) - Container principal do formulário.
        * **Group D** (Group) - Container para a descrição da página.
          * **Text J** (Text) - Descrição: "Esta página permite redefinir sua senha.".
        * **Group H** (Group) - Container para o formulário de redefinição (contém elementos não especificados completamente).

### Workflows
Nenhum workflow foi especificado nos dados fornecidos.

### Workflow AAh

# Resetar Senha - Focar no Campo de Email

**Trigger:** `PageLoaded`

## Summary
Este workflow foca no campo de entrada de email quando a página "reset_pw" é carregada.

## Actions
1.  **Set Focus to Element** - Define o foco do cursor para o elemento com ID `AEl`.

### Workflow bTGlk

# Workflow Resetar Senha e Redirecionar

**Trigger:** `ButtonClicked` (Botão com ID: `AEk`)

## Summary
Este workflow redefine a senha do usuário e o redireciona para a página de login após o sucesso.

## Actions
1.  **Reset Password** - Redefine a senha do usuário utilizando os valores dos campos de entrada de nova senha e confirmação de nova senha.
2.  **Change Page** - Redireciona o usuário para a página `index`.

### Workflow length

# Redirecionar para página de login

**Trigger:** `Page is loaded`

## Summary
Este workflow redireciona o usuário para a página de login (`index`) quando a página atual é carregada.

## Actions
1. **Change page** - Redireciona para a página `index`.

## 404

# 404

## Summary
Página de erro 404 exibida quando um usuário tenta acessar um link que não existe. Contém textos informativos e uma sugestão para designers.

### UI
*   **Header A** (CustomElement) - Componente de cabeçalho reutilizável.
*   **Footer A** (CustomElement) - Componente de rodapé reutilizável.
*   **Group main** (Group) - Container principal da página.
    *   **Group container** (Group) - Agrupa o conteúdo de texto.
        *   **Group text content** (Group) - Organiza os elementos de texto.
            *   **Text A** (Text) - Mensagem secundária: "It happens sometimes".
            *   **Text A** (Text) - Mensagem principal: "Oops! 404".
            *   **Text A** (Text) - Descrição detalhada do erro e sugestão para designers.
    *   **Header B** (CustomElement) - Componente de cabeçalho reutilizável (duplicado ou com variação).

### Workflows
Não há workflows definidos para esta página.

## ler_casoencerrado

# ler_casoencerrado

## Summary
Página para visualização detalhada de casos encerrados, exibindo informações como hospital, médico responsável, datas de abertura e encerramento, e o membro que cuidou do caso.

### UI
* **Head A** (CustomElement) - Contém o cabeçalho da página.
  * **Text C** (Text) - Exibe o rótulo "Hospital".
  * **Text D** (Text) - Exibe o nome do hospital associado ao caso.
  * **Text E** (Text) - Exibe o rótulo "Médico / Equipe".
  * **Text F** (Text) - Exibe o nome do médico ou equipe responsável pelo caso.
  * **Text G** (Text) - Exibe o rótulo "Data de Abertura".
  * **Text H** (Text) - Exibe a data de abertura do caso formatada.
  * **Text I** (Text) - Exibe o rótulo "Data de Encerramento".
  * **Text J** (Text) - Exibe a data de encerramento do caso formatada.
  * **Text K** (Text) - Exibe o rótulo "Quem cuidou".
  * **Text L** (Text) - Exibe o nome do membro que cuidou do caso.

### Workflows
Não há workflows associados diretamente a esta página.

---

# Elementos Reutilizáveis

## Head

# Head (Elemento Reutilizável)

## Summary
Elemento reutilizável que compõe o cabeçalho da aplicação, contendo links de navegação e opções de ação do usuário.

## Estrutura
* **cmMjt** (Group) - Contêiner principal do cabeçalho.
  * **cmRQo** (Group) - Grupo para elementos de navegação.
    * **[Elemento de Texto]** - Link "Início".
    * **[Elemento de Texto]** - Link "Plantão".
    * **[Elemento de Texto]** - Link "Minha Conta".
    * **[Elemento de Texto]** - Link "Palestras".
    * **[Elemento de Texto]** - Link "Casos Encerrados".
    * **[Elemento de Texto]** - Link "Médicos".
    * **[Elemento de Texto]** - Link "Casos".
    * **[Elemento de Texto]** - Link "Endereços e Telefones".
    * **[Elemento de Texto]** - Link "GVP".
    * **[Elemento de Texto]** - Link "Sair".

### Workflows
- **Menu A's clicked**: Trigger → Action 1 (ChangePage para index)
- **Plantão A's option is clicked**: Trigger → Action 1 (ChangePage para cmNrc)
- **Minha conta A's option is clicked**: Trigger → Action 1 (ChangePage para cmQDh)
- **Help A's option is clicked**: Trigger → Action 1 (ChangePage para cmRob)
- **Casos encerrados is clicked**: Trigger → Action 1 (ChangePage para cmMoM)
- **Médicos A's option is clicked**: Trigger → Action 1 (ChangePage para cmVuY)
- **Action**: Trigger → Action 1 (ChangePage para cmTEb0)
- **Action**: Trigger → Action 1 (ChangePage para cmNfP0)
- **Action**: Trigger → Action 1 (ChangePage para cmPqu)
- **Logout Button Clicked**: Trigger → Action 1 (LogOut) → Action 2 (ChangePage para AAW)

## menuvertical

# menuvertical (Elemento Reutilizável)

## Summary
Componente de navegação vertical que exibe links para diversas seções do aplicativo, permitindo ao usuário alternar entre elas ou acessar páginas específicas.

## Estrutura
* **menuvertical** (Group) - Container principal do menu.
  * **Text A** (Text) - Link "Início".
  * **Text** (Text) - Link "Plantão".
  * **Text** (Text) - Link "GVP".
  * **Text** (Text) - Link "Médicos".
  * **Text** (Text) - Link "UPAS".
  * **Text** (Text) - Link "Med Farmacêutico".
  * **Text** (Text) - Link "Med Hospitalar".
  * **Text** (Text) - Link "Casos Encerrados".
  * **Text** (Text) - Link "Lista de Casos".
  * **Text** (Text) - Link "Lembretes".
  * **Text** (Text) - Link "Pesq e Estudo".
  * **Text** (Text) - Link "ATA".
  * **Text** (Text) - Link "Palestras".
  * **Text** (Text) - Link "Organograma".
  * **Text** (Text) - Link "Minha conta".
  * **Text** (Text) - Link "Painel usuário".
  * **Text** (Text) - Link "HelpCWB".
  * **Button** (Button) - Botão associado ao link "Início".
  * **Button** (Button) - Botão associado ao link "Plantão".
  * **Button** (Button) - Botão associado ao link "GVP".
  * **Button** (Button) - Botão associado ao link "Médicos".
  * **Button** (Button) - Botão associado ao link "UPAS".
  * **Button** (Button) - Botão associado ao link "Med Farmacêutico".
  * **Button** (Button) - Botão associado ao link "Med Hospitalar".
  * **Button** (Button) - Botão associado ao link "Casos Encerrados".
  * **Button** (Button) - Botão associado ao link "Lista de Casos".
  * **Button** (Button) - Botão associado ao link "Lembretes".
  * **Button** (Button) - Botão associado ao link "Pesq e Estudo".
  * **Button** (Button) - Botão associado ao link "ATA".
  * **Button** (Button) - Botão associado ao link "Palestras".
  * **Button** (Button) - Botão associado ao link "Organograma".
  * **Button** (Button) - Botão associado ao link "Minha conta".
  * **Button** (Button) - Botão associado ao link "Painel usuário".
  * **Button** (Button) - Botão associado ao link "HelpCWB".

### Workflows
* **Início is clicked**: ButtonClicked → ChangePage para **index**
* **Palestrantes is clicked**: ButtonClicked → ChangePage para **view_palestras**
* **Plantão is clicked**: ButtonClicked → ChangePage para **cm_plant_o**
* **GVP is clicked**: ButtonClicked → ChangePage para **gvp**
* **Médicos is clicked**: ButtonClicked → ChangePage para **medddicos**
* **Casos encerrados**: ButtonClicked → ChangePage para **encerrado_estudar**
* **Lista de Casos**: ButtonClicked
* **UPAS is clicked**: ButtonClicked
* **Med Farmacêutico is clicked**: ButtonClicked
* **Med Hospitalar is clicked**: ButtonClicked
* **Lembretes is clicked**: ButtonClicked → ChangePage para **lembretes**
* **Pesq e Estudo is clicked**: ButtonClicked → ChangePage para **pesquisaeestudo**
* **ATA is clicked**: ButtonClicked → ChangePage para **atas**
* **Organograma is clicked**: ButtonClicked
* **Minha conta is clicked**: ButtonClicked → ChangePage para **minha_conta**
* **Painel usuário is clicked**: ButtonClicked → ChangePage para **painel_controle**
* **HelpCWB is clicked**: ButtonClicked → ChangePage para **colihcwb**

## cabeçalho

# cabeçalho (Elemento Reutilizável)

## Summary
Este elemento reutilizável compõe o cabeçalho da aplicação, apresentando o título "Casos Info", um ícone de menu para navegação e uma imagem de perfil.

## Estrutura
* **Shape A** (Shape) - Fundo visual do cabeçalho.
* **Casos Info** (Text) - Título da aplicação.
* **Image A** (Image) - Exibe a imagem do perfil do usuário logado.
    * **Constraint:** Se `membro_text` for igual ao nome do usuário logado, busca dados de `custom.membros_espec`.
* **Text B** (Text) - Exibe um ícone de alerta e informações sobre plantão.
    * **Constraint:** Busca dados de `custom.plantao` onde `intervalo_date_range` contém a data e hora atuais.
* **Icon A** (Icon) - Ícone de três barras horizontais (menu).
* **Group A** (Group) - Grupo que contém o menu vertical, visível apenas quando acionado.
    * **menuvertical A** (CustomElement) - Elemento personalizado para o menu vertical.

---

# ToggleElement (Workflow)

**Trigger:** `ButtonClicked` (Element: `Icon A`)

## Summary
Ao clicar no ícone de menu (`Icon A`), este workflow alterna a visibilidade do grupo que contém o menu vertical (`Group A`).

## Actions
1. **Toggle Element**: Alterna a visibilidade do elemento `Group A`.

---

## HEAD VOLUN

# HEAD VOLUN (Elemento Reutilizável)

## Summary
Este elemento reutilizável, denominado "HEAD VOLUN", funciona como um cabeçalho flutuante. Ele exibe o título "Casos Info", informações do usuário logado (nome e último acesso), e um botão para sair da aplicação.

## Estrutura
*   **Shape A** (Shape) - Elemento visual de fundo.
*   **Text A** (Text) - Exibe o título "Casos Info".
*   **Group A** (Group) - Container para informações do usuário e botão de sair.
    *   **Image A** (Image) - Exibe o avatar do usuário logado.
    *   **Shape B** (Shape) - Elemento visual de fundo para o grupo do usuário.
    *   **Text C** (Text) - Exibe a saudação "Olá " seguida pelo nome do usuário logado.
    *   **Text D** (Text) - Exibe o "Último acesso: " seguido pela data e hora do último acesso formatada.
*   **Icon A** (Icon) - Representa o botão de "SAIR" com o ícone de usuário com um X.

---

# Workflow: Sair da Aplicação

**Trigger:** `Icon A` é clicado

## Summary
Este workflow é acionado quando o ícone de "SAIR" é clicado. Ele desloga o usuário e o redireciona para a página inicial.

## Actions
1.  **Log the current User out** - Desloga o usuário atualmente logado.
2.  **Go to page** - Redireciona o usuário para a página `index`.

## Head_copy

# Head_copy

## Summary
Elemento reutilizável que exibe informações do usuário logado, como nome e último acesso, e permite o logout. Inclui um título "Casos Info" e detalhes sobre plantonistas.

## Estrutura
*   **Shape A** (Shape) - Fundo visual do componente.
*   **Text A** (Text) - Título do componente ("Casos Info").
*   **Text B** (Text) - Exibe informações do plantonista, buscando dados do tipo `custom.plantao` e aplicando regex para extrair o nome.
*   **Group A** (Group) - Container responsivo que agrupa elementos de perfil do usuário.
    *   **Image A** (Image) - Exibe o avatar do usuário logado.
    *   **Shape B** (Shape) - Separador visual.
    *   **Text C** (Text) - Saudação ao usuário ("Olá [Nome do Usuário]").
    *   **Text D** (Text) - Exibe a data e hora do último acesso do usuário, formatada.
    *   **Image B** (Image) - Ícone de "off" que, ao ser clicado, inicia o workflow de logout.

---

## Menuvertical AAA

# Menuvertical AAA

## Summary
Elemento reutilizável que compõe o menu de navegação principal da aplicação, apresentando opções de acesso rápido a diferentes seções.

## Estrutura
* **g MenuHeader** (Group) - Agrupa elementos visuais do cabeçalho do menu.
  * **Group A** (Group) - Container para elementos de imagem do cabeçalho.
    * **Image A** (Image) - Exibe o logo principal.
    * **Image A** (Image) - Exibe um ícone secundário.
* **Group A** (Group) - Container principal para os itens do menu.
  * **g Menu1 copy** (Group) - Representa o item de menu "Início".
    * **Text A** (Text) - Texto "Início".
    * **Icon A** (Icon) - Ícone de casa.
  * **Group A** (Group) - Representa o item de menu "Casos".
    * **Text A** (Text) - Texto "Casos".
    * **Icon A** (Icon) - Ícone de pasta.
  * **Group A** (Group) - Representa o item de menu "Membros".
    * **Text A** (Text) - Texto "Membros".
    * **Icon A** (Icon) - Ícone de usuário.
  * **Group A** (Group) - Representa o item de menu "Atas".
    * **Text A** (Text) - Texto "Atas".
    * **Icon A** (Icon) - Ícone de documento.
  * **Group A** (Group) - Representa o item de menu "GVP".
    * **Text A** (Text) - Texto "GVP".
    * **Icon A** (Icon) - Ícone de informação.
  * **Group A** (Group) - Representa o item de menu "Cadastros".
    * **Text A** (Text) - Texto "Cadastros".
    * **Icon A** (Icon) - Ícone de adição.
  * **Group A** (Group) - Representa o item de menu "Pesquisa e Estudo".
    * **Text A** (Text) - Texto "Pesquisa e Estudo".
    * **Icon A** (Icon) - Ícone de lupa.
  * **Group A** (Group) - Representa o item de menu "Relatório".
    * **Text A** (Text) - Texto "Relatório".
    * **Icon A** (Icon) - Ícone de gráfico.
  * **Group A** (Group) - Representa o item de menu "Minha Conta".
    * **Text A** (Text) - Texto "Minha Conta".
    * **Icon A** (Icon) - Ícone de perfil.

## float

# float (Elemento Reutilizável)

## Summary
Elemento reutilizável que contém um grupo, um grupo de repetição e um grupo flutuante com um ícone.

## Estrutura
* **Group A** (Group) - Container principal.
  * **RepeatingGroup A** (RepeatingGroup) - Exibe dados do usuário em 3 linhas.
    * **FloatingGroup A** (FloatingGroup) - Grupo flutuante posicionado na parte inferior.
      * **IonicIcon A** (ionic-IonicIcon) - Ícone com a classe 'ion-ios-plus'.

## Signup / Login Popup

# Signup / Login Popup

## Summary
Este elemento reutilizável é um popup que gerencia as funcionalidades de redefinição de senha. Ele exibe um formulário para o usuário inserir seu e-mail e um botão para solicitar o redefinição.

## Estrutura
* **Popup Reset Password** (Popup) - Container principal do popup.
  * **Button C** (Button) - Botão para enviar a solicitação de redefinição de senha.
  * **Input Email (reset pw)** (Input) - Campo para o usuário inserir o e-mail.
  * **Text Q** (Text) - Texto explicativo sobre o processo de redefinição.
  * **Text O** (Text) - Título do popup.

---

## Header

# Header

## Summary
Componente reutilizável para exibição de cabeçalho, contendo um popup de signup/login.

## Estrutura
* **Signup / Login Popup A** (CustomElement) - Gerencia funcionalidades de signup e login.

## Footer

# Footer

## Summary
Elemento reutilizável que compõe o rodapé da aplicação, exibindo links úteis e informações de contato.

## Estrutura
* **Group** (`Group A`) - Container principal do rodapé.
  * **Group** (`Group A`) - Container para o título do rodapé.
    * **Text** (`Text A`) - Exibe o título "Global Footer".
  * **Group** (`Group A`) - Container para os links de navegação e contato.
    * **Group** (`Connect and Ask`) - Container para links de suporte e comunidade.
      * **Link** (`Link A`) - Link para o "Bubble Forum".
      * **Link** (`Link A`) - Link para "Trusted Agencies".
      * **Link** (`Link A`) - Link para a página de "FAQ's".
      * **Text** (`Text A`) - Texto "Connect and Ask".
    * **Group** (`Group A`) - Container para links de recursos.
      * **Link** (`Link A`) - Link para o "Bubble Manual".
      * **Link** (`Link A`) - Link para a "Reference Library".
      * **Link** (`Link A`) - Link para a "Template Library".

## foot

# foot (Elemento Reutilizável)

## Summary
Elemento reutilizável que compõe o rodapé da página, exibindo informações de versão e ano.

## Estrutura
* **Group foot** (Group)
  * **Shape A** (Shape) - Background visual do rodapé.
  * **Text A** (Text) - Exibe a versão da aplicação ("v 1.0").
  * **Group A** (Group) - Contém o texto do ano.
    * **Text B** (Text) - Exibe o ano de copyright ("2020").

## menu2

# menu2 (Elemento Reutilizável)

## Summary
Elemento reutilizável que compõe o menu principal da aplicação, exibindo opções de navegação e acesso a funcionalidades como conta, plantão e listas de casos.

## Estrutura
* **menu2** (Group) - Contêiner principal do menu.
  * **Text A** (Text) - Link para a página de ajuda ("HelpCWB").
  * **Text B** (Text) - Link para a página "Minha Conta".
  * **Text C** (Text) - Link para a página "Plantão".
  * **Text D** (Text) - Link para a página "Lista de Casos".
  * **Text E** (Text) - Link para a página "Meus Casos".
  * **Text F** (Text) - Link para a página "Novo Caso".
  * **Text G** (Text) - Link para a página "Início".

---

# menu2 (Elemento Reutilizável) - Workflows

## Text A: ButtonClicked → OpenURL
**Trigger:** `ButtonClicked` (Elemento: Text A)
## Summary
Abre a página de ajuda da aplicação em uma nova aba.
## Actions
1. **Open URL**: Abre a URL `https://sites.google.com/site/contatoscolihcwb/home`

---

## Text B: ButtonClicked → ChangePage
**Trigger:** `ButtonClicked` (Elemento: Text B)
## Summary
Navega para a página "Minha Conta".
## Actions
1. **Change Page**: Redireciona para a página **minha_conta**

---

## Text C: ButtonClicked → ChangePage
**Trigger:** `ButtonClicked` (Elemento: Text C)
## Summary
Navega para a página "Plantão".
## Actions
1. **Change Page**: Redireciona para a página **plant_o**

---

## Text G: ButtonClicked → ChangePage
**Trigger:** `ButtonClicked` (Elemento: Text G)
## Summary
Navega para a página inicial da aplicação.
## Actions
1. **Change Page**: Redireciona para a página **index**

---

# Backend Workflows

## Sem Pasta

### cmOuT

# send_email_ENDPLANTAO

**Trigger:** `API Event`

## Summary
Envia um email de agradecimento e feedback ao final de um plantão, utilizando um parâmetro customizado para o email do destinatário.

## Actions
1.  **Send Email** - Envia um email com assunto "Obrigado!", remetente "Casos Info", para o endereço `felippescolih@gmail.com` e para o email especificado no parâmetro `custom.plantao`. O corpo do email contém uma mensagem de agradecimento e referência bíblica.

### cmQWJ

# send_email_triagem

**Trigger:** `API event cmQWG`

## Summary
Este workflow envia um email de lembrete para o início de uma triagem.

## Actions
1.  **SendEmail** - Envia um email para 'felippescolih@gmail.com' e para o endereço de email definido no parâmetro 'mail1' do evento API. O corpo do email inclui um lembrete com datas e horários de início e fim da triagem. O assunto é "Lembrete de Triagem" e o nome do remetente é "Casos Info".

### cmQWN

# Excluir Triagem

**Trigger:** `API`

## Summary
Workflow para excluir um registro de triagem do banco de dados.

## Actions
1.  **Excluir Registro** - Exclui o registro identificado pelo parâmetro `del1` (custom.triagem).

### cmQWR

# send_email_ENDtriagem

**Trigger:** `API Event`

## Summary
Envia um e-mail de lembrete de plantão para um destinatário específico.

## Actions
1.  **Send email** - Envia um e-mail com o assunto "Lembrete de Plantão" para "felippescolih@gmail.com" e o endereço definido pelo parâmetro `mail1` (custom.triagem). O corpo do e-mail inclui uma saudação personalizada com o nome do membro (`mail1` / custom.triagem) e uma mensagem de agradecimento e encorajamento.

### cmQsH

# send_email_dia antes

**Trigger:** `API Event`

## Summary
Este backend workflow envia um email de lembrete para a pessoa designada em um plantão, informando o início da sua designação no dia seguinte.

## Actions
1.  **Send email plantao** (`SendEmail`) - Envia um email com assunto "Lembrete de designação" e corpo personalizado para o destinatário `maildiaantes` (parâmetro do workflow). O email contém um cumprimento, o aviso sobre o início da designação no dia seguinte e a data/hora de início formatada.

### cmQsV

# send_email_TRIAGE_diaantes

**Trigger:** `APIEvent`

## Summary
Este backend workflow envia um email de lembrete para os participantes designados para uma triagem, informando o início e o fim do período da atividade no dia seguinte.

## Actions
1. **Send Email** - Envia um email com informações sobre a designação de triagem.
    * **Para:** `felippescolih@gmail.com` e o valor do parâmetro `maildiaantest` (origem: `custom.triagem`).
    * **Assunto:** "Lembrete de Triagem".
    * **Nome do remetente:** "Casos Info".
    * **Corpo:** Mensagem personalizada com o nome do destinatário, detalhando o início e fim da triagem (formatado para dia da semana, dia/mês/ano e hora/minuto). Utiliza os parâmetros `maildiaantest` (origem: `custom.triagem`) para obter dados de início e fim.

### cmQsh

# sendmail_compartilhado

**Trigger:** `APIEvent`

## Summary
Este backend workflow envia um email para o usuário atual informando sobre a atualização de um caso.

## Actions
1.  **Send Email**: Envia um email com o assunto "Atualização de caso" para o usuário atual. O corpo do email contém informações sobre a atualização do caso do paciente, incluindo um link para o relatório (se disponível). Os destinatários em cópia incluem o texto de `compartilhadocom_text` (que parece ser um email associado ao caso).

---

### cmRcW

# send_smspl_umdiaantes

**Trigger:** `API Event`

## Summary
Envia um SMS de lembrete um dia antes do plantão para um membro.

## Actions
1. **Send SMS** - Envia uma mensagem SMS customizada para o número de telefone associado ao plantão. A mensagem inclui o nome do membro, a data e hora de início do plantão, e uma saudação.

### cmRcf

```json
{
  "pages": {
    "bTGbC": "index",
    "cmMYA": "menu",
    "cmMhM": "plant_o",
    "cmMjQ": "minha_conta",
    "cmMnf": "encerrado_estudar",
    "cmNrc": "teste",
    "cmOAd": "cadastro_newuser",
    "cmOQI": "painel_controle",
    "cmPFX": "minhasub",
    "cmPqu": "gvp",
    "cmQCW": "lembretes",
    "cmQDh": "pesquisaeestudo",
    "cmQGO": "atas",
    "cmQnY": "membrosctba",
    "cmRGZ": "pal_instituicao",
    "cmRob": "view_palestras",
    "cmSTT": "relatorio",
    "cmSYD": "reg_novo_caso",
    "cmSwE": "atualizar_ler_caso",
    "cmVPP": "colihcwb",
    "cmVuY": "medddicos",
    "cmVzV": "newgvp",
    "cmWRJ": "menugvp",
    "cmXCr": "fotogvp",
    "cmXGy": "sandbox",
    "cmNfP0": "endere_telefones",
    "cmNxh0": "med_cad_espec",
    "cmQHI0": "palestraseventos",
    "cmTEb0": "casos",
    "cmTHl0": "lista_de_casos",
    "AAW": "reset_pw",
    "AAX": "404",
    "cmMoM": "ler_casoencerrado"
  },
  "elements": {
    "cmMjm": "Head",
    "cmPKP": "menuvertical",
    "cmPTx": "cabeçalho",
    "cmRQo": "HEAD VOLUN",
    "cmSmf": "Head_copy",
    "cmTJQ": "Menuvertical AAA",
    "cmVpN": "float",
    "ACr": "Signup / Login Popup",
    "bTGiM": "Header",
    "bTGkF": "Footer",
    "cmMlO": "foot",
    "cmNTj": "menu2"
  },
  "dataTypes": {},
  "optionSets": {},
  "workflows": {},
  "backendWorkflows": {
    "cmVcU": "del_ferias",
    "cmWUW": "sendWHATS_lembretedesign",
    "cmXEL": "sendtel_iniciodesign_ajudante",
    "cmXEX": "sendtel_lembretedesign_ajudante",
    "cmXEt": "REDACTED"
  }
}
```
```json
{
  "properties": {
    "name": "send_smstr_umdiaantes",
    "wf_name": "send_smstr_umdiaantes",
    "parameters": {
      "0": {
        "key": "sms",
        "value": "custom.triagem",
        "in_url": {
          "type": "Empty"
        },
        "is_list": {
          "type": "Empty"
        },
        "optional": {
          "type": "Empty"
        }
      }
    }
  },
  "type": "APIEvent",
  "id": "cmRcc",
  "actions": {
    "0": {
      "properties": {
        "params_Msg": {
          "entries": {
            "0": "Olá ",
            "1": {
              "next": {
                "type": "Message",
                "name": "membro_text"
              },
              "properties": {
                "key": "sms",
                "value": "custom.plantao"
              },
              "type": "APIEventParameter"
            },
            "2": "!Apenas para relembrar que sua próxima designação de triagem inicia amanhã. Início: ",
            "3": {
              "next": {
                "type": "Message",
                "name": "data_inicio_date"
              },
              "properties": {
                "key": "sms",
                "value": "custom.triagem"
              },
              "type": "APIEventParameter"
            },
            "4": "\n Tenha um bom plantão!"
          },
          "type": "TextExpression"
        },
        "params_Flash": {
          "entries": {
            "0": "0"
          },
          "type": "TextExpression"
        },
        "params_Number": {
          "entries": {
            "0": {
              "next": {
                "type": "Message",
                "name": "telefone_text"
              },
              "properties": {
                "key": "sms",
                "value": "custom.triagem"
              },
              "type": "APIEventParameter"
            }
          },
          "type": "TextExpression"
        }
      },
      "type": "apiconnector2-cmRej.cmRek",
      "id": "cmRgt"
    }
  }
}
```


# Enviar SMS Lembrete Triagem

**Trigger:** `APIEvent`

## Summary
Este backend workflow envia um lembrete por SMS um dia antes da próxima designação de triagem.

## Actions
1.  **Send SMS via API Connector (cmRek)** - Envia um SMS com mensagem personalizada para o número do membro, informando sobre o início da triagem no dia seguinte.
    *   **Mensagem (params_Msg):** Concatena "Olá ", o nome do membro, "!Apenas para relembrar que sua próxima designação de triagem inicia amanhã. Início: ", a data de início, e "\n Tenha um bom plantão!".
    *   **Número de Telefone (params_Number):** O número de telefone associado ao membro.
    *   **Flash (params_Flash):** Definido como "0".

### cmSND

# cmSND

**Trigger:** Backend Workflow Trigger

## Summary
Este backend workflow envia a programação semanal para uma lista de contatos via SMS, utilizando um conector de API.

## Actions
1.  **Enviar SMS via cmSMT** - Envia uma mensagem SMS com a programação da semana. A mensagem inclui um texto fixo e informações dinâmicas obtidas através de uma busca por "custom.plantao" com restrição de data.

### cmSNb

# Enviar início de designação

**Trigger:** `API Event`

## Summary
Este backend workflow envia notificações via Telegram para informar sobre o início de uma designação (plantão ou triagem), incluindo detalhes como o tipo de designação e o horário de início.

## Actions
1. **Enviar mensagem (Telegram - cmSMT)**: Envia uma mensagem formatada para o ID de chat especificado. A mensagem inclui uma saudação, o tipo de designação (triagem ou plantão), a data e hora de início formatadas, e uma mensagem final de bom desejo. O parâmetro `teliniciodesig` com valor `custom.plantao` é usado para configurar a mensagem.

### cmSNo

# sendtel_lembretedesign

**Trigger:** `API` (POST)

## Summary
Este backend workflow envia um lembrete via Telegram sobre uma designação de plantão ou triagem, incluindo detalhes sobre o membro, o tipo de designação e a data/hora de início.

## Actions
1.  **Enviar Mensagem Telegram** (`apiconnector2-cmSMS.cmSMT`)
    *   Envia uma mensagem formatada para o Telegram.
        *   **Conteúdo da Mensagem:**
            *   "Olá [nome do membro]! Passando pra relembrar que sua designação de [triagem/plantão] com o [nome do ajudante] começa amanhã. Início: [data e hora formatada]. Tenha um boa designação!"
        *   **Parâmetro `tellembretedesig`:** `custom.plantao`
        *   **Chat ID:** `cht_id_telegram_text`

### cmSNw

# Enviar Mensagem Final Design

**Trigger:** `APIEvent`

## Summary
Workflow que envia uma mensagem de agradecimento após a conclusão de uma designação (triagem ou plantão).

## Actions
1. **Enviar Mensagem** - Chama o conector `cmSMS.cmSMT` para enviar uma mensagem.
    - **Parâmetros de URL:**
        - `telfinaldesig`: Valor obtido de `custom.plantao`.
    - **Parâmetros de Corpo:**
        - `telfinaldesig`: Valor obtido de `custom.plantao`.
    - **Chat ID (URL):**
        - `cht_id_telegram_text`: Valor obtido de `custom.plantao`.
    - **Chat ID (Corpo):**
        - `cht_id_telegram_text`: Valor obtido de `custom.plantao`.
    - **Mensagem:** "Olá [Nome do Membro]! Agradecemos por você ter cumprido sua designação de [triagem/plantão]. Que Jeová continue abençoando seus esforços!"

### del_ferias

# del_ferias

**Trigger:** `API`

## Summary
Este backend workflow é acionado via API para deletar registros específicos da base de dados, identificados pelo parâmetro `delferias`.

## Actions
1.  **Delete Thing** - Deleta o registro referenciado pelo parâmetro `delferias` do tipo `membros_espec`.

---

### sendWHATS_lembretedesign

# sendWHATS_lembretedesign

**Trigger:** `APIEvent`

## Summary
Este backend workflow é projetado para enviar mensagens via WhatsApp. Ele recebe o número de telefone e a mensagem como parâmetros para realizar a ação.

## Actions
1.  **Send message (API Connector `cmRhD.cmRhE`)** - Envia a mensagem configurada para o número de WhatsApp especificado. Utiliza os parâmetros `numeroWHATS` e `Mensagem` recebidos pelo workflow.

---

### cmWXb

# Criar Plantão

**Trigger:** `API`

## Summary
Este backend workflow é acionado via API para criar um novo registro do tipo "Plantão", inicializando diversos campos com valores vazios.

## Actions
1.  **Create a new thing:** Cria um novo "Plantão" (tipo custom.plantao) com os seguintes campos inicializados como vazios:
    *   `cht_id_telegram_text` (Text)
    *   `color_text` (Text)
    *   `cor_option_membros` (Field Type: Option)
    *   `data_date` (Date)
    *   `data_final_date` (Date)
    *   `e_mail1_text` (Text)
    *   `id_tel_option_membros` (Field Type: Option)
    *   `intervalo_date_range` (Number)
    *   `membro_text` (Text)
    *   `telefone2_user` (Number)
    *   `telefone_text` (Text)
    *   `triagem_boolean` (Boolean)

### sendtel_iniciodesign_ajudante

# sendtel_iniciodesign_ajudante

**Trigger:** `recurring` (assumido pelo contexto de Backend Workflow que dispara em intervalos agendados)

## Summary
Este backend workflow é acionado periodicamente para enviar notificações via Telegram a membros designados como plantonistas ajudantes, informando o início de sua designação e o horário correspondente.

## Actions
1. **Send Telegram Message (cmSMT)**: Envia uma mensagem no Telegram.
    - **Mensagem (URL Params):** "Olá [Nome do Membro/Ajudante]! Passando pra relembrar que sua designação de plantonista ajudante está começando nesse momento. Início: [Data e Hora Formatada]. Tenha um boa designação!"
    - **Chat ID (URL Params):** [ID do Chat do Telegram do Ajudante]

---

### sendtel_lembretedesign_ajudante

# sendtel_lembretedesign_ajudante

**Trigger:** `APIEvent`

## Summary
Este backend workflow é acionado por um evento de API para enviar lembretes de designação de plantonista ajudante via SMS. Ele formata uma mensagem personalizada com detalhes da designação e data/hora de início.

## Actions
1.  **Send SMS via SMS API**: Envia uma mensagem SMS formatada para o destinatário. A mensagem inclui um cumprimento personalizado, detalhes da designação do plantonista ajudante e a data/hora de início formatada.

### REDACTED

# sendtel_lembretedesign

**Trigger:** `APIEvent`

## Summary
Este backend workflow é projetado para enviar notificações via WhatsApp, utilizando o número e a mensagem fornecidos como parâmetros.

## Actions
1. **Chamada de API `apiconnector2-cmRhD.cmRhE`**: Envia os parâmetros `numeroWHATS` e `Mensagem` para um endpoint de API específico para comunicação via WhatsApp.

---

### cmXUZ

# criar_novo_caso (Backend Workflow)

**Trigger:** `APIEvent`

## Summary
Este workflow é acionado via API para criar um novo registro de "caso" no banco de dados, populando diversos campos com informações fornecidas nos parâmetros de entrada.

## Actions
1.  **ChangeThing** - Incrementa o campo `total_number` do tipo `custom.contador` onde `tipo_text` é "caso".
2.  **Create a new thing** - Cria um novo registro do tipo `caso` (custom event `cmXUX` - criar\_novo\_caso) com os seguintes campos preenchidos:
    *   `dat_ho_contato_text`: Data e hora atuais.
    *   `nome_telefonou_text`: Valor do parâmetro `Nome_telefonou`.
    *   `cont_q_telef_text`: Concatenação de "55" com o valor do parâmetro `Cont_q_telef`.
    *   `parent_c_pac_text`: Valor do parâmetro `Parent_c_pac`.
    *   `membro_respons_text`: Busca um usuário cujo `_id` seja igual ao valor do parâmetro `Membro_responsavel` e retorna o campo `nome_text` (se encontrado).
    *   `nome_paciente_text`: Valor do parâmetro `Nome_paciente`.
    *   `sexo_text`: Valor do parâmetro `Sexo`.
    *   `idade_text`: Valor do parâmetro `Idade`.
    *   `batizado`: Valor do parâmetro `Batizado` (opcional).
    *   `cartao_diret_ok`: Valor do parâmetro `Cartao_diret_ok` (opcional).
    *   `boa_cond_esp`: Valor do parâmetro `Boa_cond_esp` (opcional).
    *   `info_add_transpac`: Valor do parâmetro `Info_add_Transpac`.
    *   `congregacao_text`: Valor do parâmetro `Congregacao`.
    *   `cidade_text`: Valor do parâmetro `cidade`.
    *   `uf_text`: Valor do parâmetro `UF`.
    *   `info_med_caso_text`: Valor do parâmetro `Info_med_caso`.
    *   `info_add_morbidade_text`: Valor do parâmetro `Info_add_Morbidade`.
    *   `info_add_espec_text`: Valor do parâmetro `Info_add_Espec`.
    *   `info_add_outras_infos_nec`: Valor do parâmetro `Info_add_outras_infos_nec` (opcional).
    *   `nome_hospital_text`: Valor do parâmetro `Nome_hospital` (opcional).

### cmOJL0

# send_email (Backend Workflow)

## Summary
Este backend workflow é responsável por enviar um e-mail de lembrete de plantão. Ele é acionado por um evento e utiliza um parâmetro `mail` para obter informações relevantes.

## Trigger
`APIEvent` (acionado pela API)

## Actions
1.  **Send email plantao** (`SendEmail`)
    *   Envia um e-mail com o assunto "Lembrete de Plantão" para o remetente `felippescolih@gmail.com` e para o destinatário dinâmico especificado pelo parâmetro `mail` (que é `custom.plantao`). O corpo do e-mail inclui uma saudação, um lembrete do início do plantão (com data e hora formatadas) e uma mensagem de encerramento. O nome do remetente é "Casos Info".

### cmOKC0

# sendmail_lembrete (Backend Workflow)

## Summary
Este backend workflow é acionado por um evento programado e envia um e-mail de lembrete para o usuário com informações sobre a atualização de um caso.

**Trigger:** `APIEvent`

## Parameters
| Parâmetro | Tipo | Obrigatório |
|-----------|------|-------------|
| email     | custom.caso | Sim         |

## Actions
1.  **Send Email**: Envia um e-mail para o destinatário.
    *   **Para**: `email` (parâmetro do workflow)
    *   **Nome do Remetente**: `Casos Info`
    *   **Assunto**: `Lembrete de atualização`
    *   **Corpo**:
        ```
        Olá [nome_text]!
        Você agendou uma atualização de caso nessa data.
        Paciente: [paciente_text]

        Dica do Lembrete: [dica_text]

        Dê uma passada em seus casos no casos info.

        Até mais!
        ```

### cmOLE0

# del_plantão

**Trigger:** `API Event`

## Summary
Workflow de backend acionado por evento de API para deletar dados relacionados a "plantão".

## Actions
1.  **DeleteThing** - Deleta o registro especificado pelo parâmetro `del` com o valor `custom.plantao`.

---

### cmOOT0

# send_email_pegarcaso

**Trigger:** `API`

## Summary
Este backend workflow envia um email de lembrete para que um usuário aceite um caso. O email inclui detalhes sobre o paciente e a morbidade associada.

## Actions
1. **SendEmail** - Envia um email com as seguintes configurações:
    * **Para:** `custom.casos_transferencia`
    * **Cc:** `custom.reg_caso`
    * **Corpo:** "Olá [custom.casos_transferencia]!\nTudo tranquilo?\nO caso do (a) paciente [custom.casos_transferencia], com a morbidade [custom.casos_transferencia], não vê a hora de você aceitar o caso dele (a)! Ele (a) tem certeza que vai estar em boas mãos!\nO que acha de aceitar agora?\n\nSe estiver difícil pra você, saiba que nós entendemos o seu lado, é só nos avisar ;-)\n\nForte abraço!"
    * **Assunto:** "Lembrete! Pegue o caso"
    * **Cco:** "felippescolih@gmail.com; crusdack@gmail.com"
    * **Nome do Remetente:** "Casos Info"

---

# Chamadas de API (API Connectors)

## smsci

# smsci (API Connector)

## Summary
Este conector gerencia chamadas para a API de envio de SMS. Inclui uma call para enviar SMS, configurando parâmetros essenciais.

## Calls

| Call | Método | Path |
|---|---|---|
| SMS envio | GET | https://api.smsdev.com.br/v1/send |

---

### SMS envio

# SMS envio

## Summary
Esta API Call é utilizada para enviar mensagens SMS. Ela permite configurar o destinatário, a mensagem e retorna o status do envio.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | GET |
| Path | https://api.smsdev.com.br/v1/send |
| Autenticação | Não especificada |

## Parâmetros

| Nome | Tipo | Obrigatório |
|------|------|-------------|
| Number | text | Sim |
| Msg | text | Sim |

## Response
Retorna um objeto JSON com os seguintes campos:
* **situacao**: (text) Status do envio da mensagem.
* **codigo**: (text) Código de retorno do serviço de SMS.
* **id**: (text) Identificador único da mensagem enviada.
* **descricao**: (text) Descrição detalhada do status do envio.

## whats

# whats (API Connector)

## Summary
Este conector API integra com serviços de mensagens, permitindo o envio de mensagens de texto e a recuperação de listas de chats e contatos.

## Calls

| Call          | Método | Path                                                                                                  |
|---------------|--------|-------------------------------------------------------------------------------------------------------|
| whatsenvio1   | POST   | https://api.w-api.app/v1/message/send-text?instanceId=[INSTANCE_ID]                                   |
| Chats         | GET    | https://api.z-api.io/instances/3B7898A5277F806E3FC8DE84F2265BFB/token/2BC0ADDBAE847C4AC9CE5E5E/chats?pageSize=50 |
| Contacts      | GET    | https://api.z-api.io/instances/3B7898A5277F806E3FC8DE84F2265BFB/token/2BC0ADDBAE847C4AC9CE5E5E/contacts |
| cURL Call msg | POST   | https://api.z-api.io/instances/3B7898A5277F806E3FC8DE84F2265BFB/token/2BC0ADDBAE847C4AC9CE5E5E/send-text |
| cURL Call     | GET    | http://*hnd                                                                                            |
| token_call    | POST   |                                                                                                       |

### whatsenvio1

# whatsenvio1

## Summary
Este API Call envia mensagens de texto via WhatsApp. Ele utiliza um método POST para enviar o número do celular e a mensagem desejada para a API.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | POST |
| Path | https://api.w-api.app/v1/message/send-text?instanceId=[INSTANCE_ID] |
| Autenticação | Não especificada |

## Parâmetros

| Nome | Tipo | Obrigatório |
|------|------|-------------|
| instanceId | text | Sim |
| celular | text | Sim |
| message | text | Sim |

## Response
| Propriedade | Tipo |
|-------------|------|
| instanceId | text |
| messageId | text |
| insertedId | text |

### Chats

# Chats (API Call)

## Summary
Esta API Call busca a lista de conversas de um usuário, incluindo detalhes como o último mensaje, status de leitura e informações do contato.

## Detalhes

| Propriedade | Valor |
|---|---|
| Método | GET |
| Path | https://api.z-api.io/instances/3B7898A5277F806E3FC8DE84F2265BFB/token/2BC0ADDBAE847C4AC9CE5E5E/chats?pageSize=50 |
| Autenticação | Não especificada |

## Parâmetros
Esta API Call não possui parâmetros definidos.

## Response
O retorno esperado é uma lista de objetos, cada um representando uma conversa com as seguintes propriedades:

| Nome | Tipo | Obrigatório |
|---|---|---|
| pinned | text | Não |
| messagesUnread | text | Não |
| unread | text | Não |
| lastMessageTime | text | Não |
| archived | text | Não |
| phone | text | Não |
| isMuted | text | Não |
| isMarkedSpam | text | Não |
| isGroup | boolean | Não |
| name | text | Não |

### Contacts

# Contacts (API Call)

## Summary
Esta API Call busca a lista de contatos de uma instância específica através do provedor Z-API.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | GET |
| Path | `/instances/3B7898A5277F806E3FC8DE84F2265BFB/token/2BC0ADDBAE847C4AC9CE5E5E/contacts` |
| Autenticação | Não especificada (implícito no URL) |

## Parâmetros
Esta chamada não possui parâmetros explícitos.

## Response
A resposta é uma lista de objetos de contato, onde cada contato pode conter os seguintes campos:

| Nome | Tipo |
|------|------|
| vname | text |
| phone | text |
| name | text |
| short | text |
| verify | text |

### cURL Call msg

# cURL Call msg

## Summary
Esta chamada de API envia mensagens de texto via Z-API. Utiliza um token específico para autenticação e envia o número do destinatário e a mensagem no corpo da requisição.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | POST |
| Path | https://api.z-api.io/instances/3B7898A5277F806E3FC8DE84F2265BFB/token/2BC0ADDBAE847C4AC9CE5E5E/send-text |
| Autenticação | Não especificada diretamente, mas o token está na URL |

## Parâmetros

| Nome | Tipo | Obrigatório |
|------|------|-------------|
| phone | text | Sim |
| message | text | Sim |

## Response
| Campo | Tipo |
|---|---|
| zaapId | text |
| messageId | text |
| id | text |

### cURL Call

# cURL Call

## Summary
Esta chamada API GET busca dados de um endpoint externo.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | GET |
| Path | http://*hnd |
| Autenticação | Nenhuma especificada |

## Parâmetros

| Nome | Tipo | Obrigatório |
|------|------|-------------|
| (Nenhum parâmetro especificado) | - | - |

## Response
(Nenhuma informação de response disponível para esta chamada)

### token_call

# token_call

## Summary
Esta chamada API é usada para obter um token de autenticação através do método POST.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | POST |
| Path | api-connectors/cmRhD/calls/token_call |
| Autenticação | Não especificada |

## Parâmetros
Nenhum parâmetro configurado.

## Response
Não especificado.

## medicoscolaboradores

# medicoscolaboradores

## Summary
Conector para a API Sheety que gerencia dados de médicos, permitindo a busca e edição de informações de profissionais.

## Calls

| Call | Método | Path |
|---|---|---|
| medicos | GET | https://api.sheety.co/f87fa8e1a8dccf3dedf53221cacce5c2/medicosDb/medicos |
| medicos edit | PATCH | https://api.sheety.co/f87fa8e1a8dccf3dedf53221cacce5c2/medicosDb/medicos/[Object ID] |

### medicos

# medicos

## Summary
Esta API Call busca dados de médicos a partir da base de dados "medicosDb" via Sheety. Retorna uma lista de médicos com seus respectivos detalhes.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | GET |
| Path | api-connectors/cmSCB/calls/cmSCC |
| Autenticação | Não especificada |

## Response
A resposta esperada é uma lista de objetos, onde cada objeto representa um médico e contém os seguintes campos:

| Campo | Tipo |
|-------|------|
| medicos | Lista de [Médico] |

O tipo [Médico] possui os seguintes campos:

| Campo | Tipo |
|-------|------|
| nome | Texto |
| especialidade1 | Texto |
| especialidade2 | Texto |
| especialidade3 | Texto |
| outraEspecialidade | Texto |
| crm | Texto |
| sus | Texto |
| convênio | Texto |
| particular | Texto |
| últimaVisita | Número |
| membroResponsável | Texto |
| tj | Texto |
| consultorAprovadoDoHid | Texto |
| telemedicina | Texto |
| atendeCrianças | Texto |
| hospital | Texto |
| telConsultorio | Texto |
| endConsultorio | Texto |
| telParticular | Texto |
| eMail | Texto |
| secretária | Texto |
| telSecretária | Texto |
| observaçao | Texto |
| id | Texto |

### medicos edit

# medicos edit

## Summary
Esta chamada de API atualiza as informações de um médico específico no banco de dados "medicosDb". Permite a modificação de diversos campos detalhados do registro do médico.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | PUT |
| Path | https://api.sheety.co/f87fa8e1a8dccf3dedf53221cacce5c2/medicosDb/medicos/[Object ID] |
| Autenticação | Nenhuma especificada |

## Parâmetros

| Nome | Tipo | Obrigatório |
|------|------|-------------|
| Object ID | number | Sim |
| nome | text | Não |
| sus | text | Não |
| hospital | text | Não |
| telParticular | text | Não |
| secretária | text | Não |
| telSecretária | text | Não |
| últimaVisita | text | Não |
| membroResponsável | text | Não |
| atendeCrianças | text | Não |
| convênio | text | Não |
| particular | text | Não |
| telemedicina | text | Não |
| tj | text | Não |
| crm | text | Não |
| telConsultorio | text | Não |
| endConsultorio | text | Não |
| especialidade1 | text | Não |
| especialidade2 | text | Não |
| especialidade3 | text | Não |
| outraEspecialidade | text | Não |
| consultorAprovadodoHid | text | Não |
| eMail | text | Não |
| observaçao | text | Não |

## Response
O retorno desta chamada de API contém os dados do médico atualizados, organizados em um objeto.

| Campo | Tipo |
|---|---|
| medico nome | text |
| medico especialidade1 | text |
| medico especialidade2 | text |
| medico especialidade3 | text |
| medico outraEspecialidade | text |
| medico crm | text |
| medico sus | text |
| medico convênio | text |
| medico particular | text |
| medico últimaVisita | text |
| medico membroResponsável | text |
| medico tj | text |
| medico telemedicina | text |
| medico atendeCrianças | text |
| medico hospital | text |
| medico telConsultorio | text |
| medico endConsultorio | text |
| medico telParticular | text |
| medico eMail | text |
| medico secretária | text |
| medico telSecretária | text |
| medico observaçao | text |
| medico id | number |

## telegram

# telegram (API Connector)

## Summary
Este conector integra a API do Telegram para envio de mensagens. Permite enviar mensagens para um chat específico com um texto definido.

## Calls

| Call    | Método | Path                                                                                                                             |
|---------|--------|----------------------------------------------------------------------------------------------------------------------------------|
| sendmsg | POST   | https://api.telegram.org/bot2140144820:AAGh85uXSS1HviX_UYpAsf5w2Fb-zruYuYo/sendmessage?chat_id=[chat_id]&text=[text] |

### sendmsg

# sendmsg

## Summary
Chamada de API para enviar mensagens via Telegram.

## Detalhes

| Propriedade | Valor |
|-------------|-------|
| Método | POST |
| Path | https://api.telegram.org/bot2140144820:AAGh85uXSS1HviX_UYpAsf5w2Fb-zruYuYo/sendmessage |
| Autenticação | Nenhuma especificada |

## Parâmetros

| Nome | Tipo | Obrigatório |
|------|------|-------------|
| chat_id | text | Sim |
| text | text | Sim |

## Response
Retorna um objeto JSON contendo informações sobre o status do envio da mensagem, incluindo `ok` (booleano), `result` (objeto com detalhes da mensagem enviada, como `message_id`, `from`, `chat`, `date` e `text`).

---
