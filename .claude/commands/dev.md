Executa o plano do CURRENT_TASK.md e registra o histórico da alteração.

1. **Leitura e checklist em tempo real:** Abra o `CURRENT_TASK.md`, leia cada item e, ao concluir uma subtarefa, marque-a com `[x]` imediatamente. Se algo falhar no meio, o usuário saberá exatamente onde parou.

2. **Figma:** Se houver qualquer link do Figma no `CURRENT_TASK.md`, chame o MCP do Figma para verificar estilos, tokens e layout antes de gerar o código. Isso garante alinhamento pixel-perfect com o design.

3. **Segurança e padrões:** Antes de qualquer `git add` ou geração de código, confira o `CLAUDE.md` para garantir padrões (nomes, estrutura, escopo de permissão) e nunca inclua chaves de API ou variáveis sensíveis.

4- Histórico e Limpeza: Terminou tudo? Vou registrar o log em `.agents/history/{{data}}_resumo.md`. **Regra importante:** antes de criar o arquivo, verifico se já existe um history com a data de hoje. Se existir, **acrescento** o novo resumo no final do arquivo existente com uma seção separada — nunca crio um arquivo novo. Isso garante que haja no máximo um arquivo de history por dia. Depois disso, eu deleto o CURRENT_TASK.md pra deixar a mesa limpa pro próximo turno. 🧹

5. **Commit:** Sugira a mensagem de commit no padrão Conventional Commits e pergunte: _"O commit está pronto com a mensagem: '[mensagem]'. Quer que eu execute o /commit agora?"_
