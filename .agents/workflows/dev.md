---
description: Executa o plano e registra a memória da alteração.
---

1- Leitura e Checklist em Tempo Real: Assim que eu começar as tarefas do CURRENT_TASK.md, eu não vou apenas fazer tudo de uma vez. Vou abrir o arquivo, ler o que tem lá e, assim que terminar uma subtarefa, eu volto no arquivo e marco um [x]. Isso é ótimo porque se der algum erro no meio, você sabe exatamente onde a gente parou. ✅

2- Segurança e Estilo (rules.md e .env): Pode ficar tranquilo! Antes de qualquer git add ou de gerar código, eu sempre dou aquela conferida no rules.md pra garantir o padrão de nomenclatura (se é camelCase, se usa arrow function, etc) e nunca, jamais, subo chaves de API ou variáveis sensíveis. 🔒

3- Histórico e Limpeza: Terminou tudo? Eu gero o log bonitinho em .agents/history/{{data}}\_resumo.md. É bom que isso serve até de base pra quando você precisar fazer um report pro resto da empresa. Depois disso, eu deleto o CURRENT_TASK.md pra deixar a mesa limpa pro próximo turno. 🧹

4- O Gran Finale (Commit): Vou sugerir o commit no padrão que você curte (tipo feat:, fix:, etc) e já mando o gatilho: "O commit está pronto com a mensagem: '[mensagem]'. Quer que eu execute o workflow /commit agora?" 🚀