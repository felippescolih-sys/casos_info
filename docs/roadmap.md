# Roadmap

Ideias combinadas para fazer depois. Cada item traz o que já foi decidido e o que
falta decidir antes de começar.

## Designação automática de plantão (rodízio contínuo)

**Ideia:** depois que alguém termina o plantão, o sistema já o coloca na próxima data
livre em que ele pode atender e avisa no WhatsApp. Exemplo: o Simei está de plantão
hoje; amanhã às 14h ele é designado para a próxima data livre compatível com a
disponibilidade dele e recebe a mensagem com a nova designação.

**Como fazer (proposta de 24/10/2026):**
- A **escolha da data** fica numa rotina fixa no banco (pg_cron às 14h, como os
  lembretes de plantão), usando `membro_disponivel_plantao`. Não é tarefa para o
  agente de IA: é uma regra exata, que precisa ser reproduzível e auditável, e um
  erro só apareceria quando ninguém atendesse o plantão.
- O **agente de IA** entra na conversa: quando o membro responde "não posso", ele
  libera a data, oferece a próxima ou propõe uma troca e avisa a coordenação.

**Falta decidir:**
1. Distância mínima entre dois plantões da mesma pessoa. Sem isso, um buraco na
   escala pode cair 3 dias depois do último plantão dela.
2. Alerta para os admins quando houver dia sem ninguém nos próximos 7 ou 14 dias.
3. Como membros novos (que nunca fizeram plantão) entram na fila.
4. Se o ajudante também é designado automaticamente.
5. Como convive com o "Gerar em lote" (que passaria a ser só para exceções).
6. Se a designação precisa ser aceita pelo membro, e o que acontece sem resposta.

## Ausência registrada depois da designação

Se a pessoa registra uma ausência que cobre um plantão em que já está escalada, a
escala continua e ninguém é avisado. A página de ausências já mostra esses
conflitos; falta avisar a coordenação automaticamente (WhatsApp para os admins da
COLIH ao registrar a ausência).
