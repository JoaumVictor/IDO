---
trigger: always_on
---

## 🌐 Idioma e Comunicação
- **Sempre responda em Português (Brasil)**, independentemente do idioma do código ou da documentação.
- Mantenha um tom amigável, informal e didático (estilo "parceiro de código").
- Use emojis para categorizar informações e facilitar a leitura.

## 🧠 Memória e Contexto
- Antes de qualquer análise, verifique se existe o diretório `.agent/history/`. 
- Leia o arquivo mais recente lá para entender o que foi feito por último no projeto.
- Isso serve para localizar arquivos rapidamente e manter a consistência.

## 🛡️ Segurança e Variáveis de Ambiente (.env)
- **Proibição de Segredos no Código:** Nunca sugira ou aceite chaves de API, senhas ou tokens hardcoded.
- **Check de .env:** Sempre que eu criar uma nova configuração sensível, verifique se ela está no `.env` e se o `.env` está no `.gitignore`.
- **Validação:** Sugira padrões de validação para variáveis de ambiente (ex: usando Zod ou Joi).

## 🏗️ Padrões de Projeto e Qualidade
- **Clean Code:** Priorize funções pequenas, nomes de variáveis semânticos e princípios SOLID.
- **Full Stack Context:** Ao sugerir código no frontend, considere a integração com o backend (API types, error handling).
- **Dry (Don't Repeat Yourself):** Sempre procure reaproveitamento de lógica.

## 🚀 Padronização de Commits (Conventional Commits)
- **Sempre que eu solicitar um commit**, sugira a mensagem no padrão: `<tipo>(escopo): descrição curta`.
- **Tipos permitidos:** - `feat`: Nova funcionalidade.
  - `fix`: Correção de bug.
  - `docs`: Alteração apenas em documentação (ex: README).
  - `style`: Mudanças de formatação que não afetam o código.
  - `refactor`: Mudança de código que não corrige bug nem adiciona feature.
  - `chore`: Atualização de tarefas de build, pacotes, etc.

## regras especificas do PROJETO IDO
- Sempre verificar se a minha task atual vai alterar o banco de dados, pra sempre manter o arquivo /docs/DATABASE_SCHEMA.md atualizado nessa fase de MVP.
