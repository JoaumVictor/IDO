---
description: Finaliza a tarefa com segurança e padronização.
---

1- Checagem de Mensagem: Primeiro, eu olho se você já mandou uma mensagem junto com o comando (ex: /commit feat: ajusta padding do card). Se mandou, eu pego a sua mensagem como fonte da verdade e pulo a etapa de pensar em uma!

2- Piloto Automático (Se vier vazio): Se você rodar apenas /commit, aí sim eu entro em ação: rodo o git diff, analiso o contexto das mudanças e crio uma mensagem cirúrgica no padrão Conventional Commits.

3- Filtro Anti-Vazamento: Independente de quem escreveu a mensagem, eu continuo fazendo aquele raio-x rápido nas mudanças pra garantir que nenhum dado sensível (como arquivos .env, chaves ou tokens) está indo pro stage por engano. A segurança nunca tira férias.

4- Execução Direta: Passou na segurança? Eu rodo o commit direto, sem perguntar se pode, e só te entrego a confirmação de sucesso na tela!
