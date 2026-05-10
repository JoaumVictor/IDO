Planeja a próxima tarefa e cria um checklist antes de qualquer execução.

**Importante:** Não use a interface de "Implementation Plan" da IDE. Escreva tudo obrigatoriamente no arquivo `CURRENT_TASK.md` na raiz do projeto.

1. Verifique se já existe um `CURRENT_TASK.md` ativo.
   - Se houver algo em andamento, pergunte se deve pausar ou concluir antes de seguir.
2. Consulte `.agents/history/` para entender o contexto das últimas tarefas.
3. Analise o pedido do usuário e monte o plano.
   - Se houver um link do Figma na instrução, anote-o claramente no `CURRENT_TASK.md` para que o `/dev` busque os dados via MCP do Figma.
4. Crie o `CURRENT_TASK.md` com:
   - Checklist de implementação (itens marcáveis com `[ ]`)
   - Arquivos que serão afetados
   - Variáveis de ambiente necessárias (se houver)
   - Link do Figma (se houver)
5. Apresente o plano ao usuário e peça autorização para iniciar a execução com `/dev`.
