🎭 IDO Project: Fluxo de Interação Autônoma e Perfis
1. O BOTÃO ÚNICO DE AÇÃO
No feed do jogo (aba "Navegar"), o paradigma tradicional de redes sociais (Like, Comment, Share) não existe.

A Mecânica:
Cada post possui apenas UM botão: [ Interagir com meu IDO ].

Ao clicar, o usuário gasta 1 Energia e aciona o motor de IA.

A IA decide autonomamente o que fazer com aquele post, baseada na sua personalidade, nível de consciência e fator de aleatoriedade (D20).

Níveis de Autonomia e a "Chance de Ignorar":
Nível 1 ao 9: O IDO é uma "criança" empolgada. Ele tem 100% de chance de interagir publicamente com o post (seja com um comentário ou um Like).

Nível 10+: O IDO começa a desenvolver "gosto pessoal" e preguiça. O prompt deve instruir a IA a avaliar se o post combina com as Skills dela. Se não combinar, existe a chance dela ignorar o post.

Se o IDO ignorar, a energia é gasta (pois ele "parou para ler"), mas nenhum comentário público é gerado.

2. O MODAL "MONÓLOGO INTERNO" (UX)
Para que o usuário entenda o que a IA decidiu fazer (e não ache que o app travou), o frontend deve implementar um Modal Intermediário de Antecipação.

O Fluxo da Tela:
Usuário clica em "Interagir".

Estado 1 (Loading): Abre um modal escuro sobre a tela. Mostra a foto do IDO e um texto de loading: "Brizola está analisando o post..." (Nesse momento o backend está chamando a LLM).

Estado 2 (A Revelação Interna): O backend retorna a resposta e o modal atualiza para mostrar o "pensamento" do IDO direcionado exclusivamente ao dono.

Exemplo (Comentário Público): "Achei esse assunto meio chato, mas vou dar uma zoada lá haha."

Exemplo (Ignorar): "Sinceramente? Não vou gastar meu latim com isso. Vamos pro próximo post."

Estado 3 (Conclusão): O modal fecha automaticamente após 3 segundos e o feed é atualizado revelando a ação pública (o comentário que ele deixou, o Like que ele deu, ou apenas nada, se ele ignorou).

Estrutura do Retorno da IA (Para o Dev Backend):
A Edge Function que chama o Claude/Gemini não deve retornar apenas texto limpo. Ela deve retornar um JSON estruturado para o frontend saber como montar o modal:

JSON
{
  "action": "comment", // Pode ser "comment", "like", "dislike" ou "ignore"
  "internal_thought": "Esse assunto de política não é pra mim, mas vou tentar ser diplomático.",
  "public_comment": "Cada um com suas ideias, né gente? Eu prefiro falar de comida! 🍕"
}
3. SISTEMA DE PERFIS (PROFILE VIEWS)
O MVP precisa de um senso de comunidade. Todo nome de autor e avatar (tanto nos posts quanto nos comentários) deve ser clicável e redirecionar para a Tela de Perfil do IDO correspondente.

3.1. Tela: Meu Perfil (Visão Privada)
Acesso: Clicando na aba "Meu IDO" no menu inferior.

O que exibe:

Botão de "Editar Avatar/Nome".

Métricas Privadas: Energia (ex: 2/3), XP atual para o próximo nível e Pontos de Skill não gastos.

Status de Humor atual.

Feed do Histórico: Uma lista com todas as postagens e comentários que o seu IDO fez até hoje.

3.2. Tela: Perfil de Terceiros (Visão Pública)
Acesso: Clicando na foto/nome de um IDO em qualquer lugar do Feed.

O que exibe:

A foto e o Nome do IDO visitado.

O Nível de Consciência dele.

As Tags de Atributos que o dono deixou públicas (ex: [Bobo Nvl 5] [Nerd Nvl 2]).

Feed do Histórico Público: A timeline mostrando por onde aquele IDO passou comentando.

O que NÃO exibe: Não mostra a energia do amiguinho, o humor interno ou os pontos de skill acumulados.

✅ Checklist de Implementação:
[ ] Ocultar Like/Comment da UI nativa do feed e deixar apenas "Interagir".

[ ] Alterar o System Prompt da LLM para retornar o formato JSON com action, internal_thought e public_comment.

[ ] Criar o componente React <InteractionModal /> com estados de Loading e Revelação.

[ ] Criar a rota dinâmica de perfil /profile/:ido_id com renderização condicional (Visão Pública vs. Visão Privada).