🌳 IDO Skill Tree: Interface de Progressão Circular
1. CONCEITO VISUAL
A tela de habilidades deve abandonar listas verticais e adotar um layout Radial/Circular, inspirado em RPGs clássicos (estilo Path of Exile ou Final Fantasy X), mas com a estética "Clean & Cute" do IDO.

2. ESTRUTURA DA TELA
2.1. O Núcleo (Center Hub)
Posição: Centro exato da tela.

Conteúdo: Uma moldura circular com a imagem do IDO atual do usuário.

Feedback: Quando o usuário tem pontos para gastar, o centro deve ter uma pulsação leve (animação ping ou glow).

2.2. Camadas de Skills (Orbits)
As habilidades são organizadas em "anéis" de distância do centro:

Anel Interno (Básicas): As 4 habilidades iniciais (Bobo, Nerd, Afrontoso, Melancólico) posicionadas a 90 graus uma da outra.

Anel Externo (Evoluções): Habilidades que dependem do nível das básicas. Elas aparecem conectadas por uma linha (vértice) à skill de origem.

2.3. As Conexões (Edges)
Linha Inativa: Cor cinza opaco ou pontilhada.

Linha Ativa: Cor vibrante (neon ou pastel) indicando que o caminho foi desbloqueado.

3. INTERAÇÃO E UI/UX
3.1. O "Click" no Nodo (Skill Node)
Ao clicar em um círculo de skill, abre-se uma Folha de Detalhes (BottomSheet ou Modal Lateral):

Título: Skill Bobo [ Nvl {x} ]

Flavor Text: "Um pouco de bobagem nunca é demais" (em itálico).

Efeito: "Aumenta a chance de respostas positivas e uso de emojis".

Dependências: "Libera as skills: 'Piadista' (Nvl 5) e 'Humorista' (Nvl 10)".

Custo: "Custo: 1 Ponto de Habilidade".

Botão de Ação: "UPAR SKILL" (Habilitado apenas se user.points > 0).

3.2. Feedback Visual de Nível
Cada círculo de skill deve ter uma pequena barra de progresso circular em volta dele ou um número pequeno no canto indicando o nível atual.

4. EXEMPLO DE LÓGICA DE SKILLS (TREE)
[NÚCLEO CENTRAL]

➡️ Nó: BOBO (Nível 1-10)

➡️ Link nível 5: PIADISTA (Novas interações de trocadilhos).

➡️ Link nível 10: HUMORISTA (Tag especial "Engraçado" desbloqueada).

➡️ Nó: NERD (Nível 1-10)

➡️ Link nível 5: ANALISTA (Habilita ver status básicos de outros IDOs).

➡️ Link nível 10: CDF (Desbloqueia a aba de Telemetria/Dados).

5. NOTAS TÉCNICAS PARA IMPLEMENTAÇÃO (CÓDIGO)
Layout Dinâmico: Recomenda-se o uso de SVG para as linhas de conexão e CSS Flex/Absolute Positioning com cálculos de sin() e cos() para posicionar os círculos em volta do centro.

Estado Global: O frontend deve consultar o array ido_skills do Supabase para decidir quais círculos renderizar como "Ativos", "Disponíveis" ou "Bloqueados".

Responsividade: No mobile, a árvore deve permitir Pan & Zoom (estilo Google Maps) caso ela cresça muito e saia das bordas da tela.

✅ Checklist da Aba Skills:
[ ] Renderizar foto do IDO no centro.

[ ] Posicionar as 4 skills básicas em formato de cruz (+).

[ ] Implementar o modal de upgrade ao clicar em uma skill.

[ ] Garantir que o botão de upgrade só funcione se o usuário tiver points > 0.


----------------------

🧩 IDO Project: Arquitetura Escalável da Skill Tree
1. O CONCEITO "DATA-DRIVEN"
Para garantir que o Victor (Admin/Dev) possa adicionar centenas de skills no futuro sem precisar refazer o layout ou o código de validação, a Skill Tree será orientada a dados. As habilidades não serão "hardcodadas" no React. O sistema consumirá um "Dicionário de Skills" centralizado.

2. O DICIONÁRIO DE SKILLS (A FONTE DA VERDADE)
Devemos criar um arquivo de configuração central (ex: skills_config.json no Frontend e no Backend, ou uma tabela estática no Supabase) que define absolutamente tudo sobre cada nó da árvore.

Exemplo do Modelo de Dados (JSON):
JSON
{
  "bobo_base": {
    "id": "bobo_base",
    "name": "Bobo",
    "type": "primary",
    "max_level": 10,
    "cost_per_level": 1,
    "position": { "x": 0, "y": -100 }, 
    "requirements": null
  },
  "sagaz_avancado": {
    "id": "sagaz_avancado",
    "name": "Sagaz",
    "type": "secondary",
    "max_level": 5,
    "cost_per_level": 2,
    "position": { "x": 50, "y": -150 },
    "requirements": {
      "min_player_level": 15,
      "required_skills": [
        { "skill_id": "curioso_base", "min_level": 5 },
        { "skill_id": "atencioso_base", "min_level": 1 }
      ]
    }
  }
}
3. MOTOR DE VALIDAÇÃO (BACKEND)
A função que processa o "Upgrade" no Supabase (upgrade-skill) será genérica. Ela vai receber apenas o user_id e o skill_id. O fluxo de validação universal será:

Busca o Perfil: Pega o level, pontos disponíveis e skills atuais do usuário.

Busca a Regra: Olha no dicionário de skills qual é o requisito da skill solicitada.

A Regra da Trava (The Lock Engine):

O usuário tem pontos suficientes? (Se não, bloqueia).

A skill já está no nível máximo? (Se sim, bloqueia).

Verificação de Trava Complexa: O usuário atende a requirements.min_player_level? O usuário possui as skills listadas em required_skills nos níveis exigidos?

Ação: Se passar em tudo, debita o ponto e faz o UPSERT do nível da skill na conta do usuário.

4. RENDERIZAÇÃO DINÂMICA (FRONTEND)
O componente React <SkillTree /> não vai ter <div>Bobo</div>. Ele vai fazer um .map() no dicionário de skills.

As Linhas (Edges): O frontend lê os required_skills e desenha automaticamente uma linha SVG conectando o nó "Sagaz" aos nós "Curioso" e "Atencioso".

Estado Visual (Cadeados): O frontend roda a mesma função de validação do backend (visual-only). Se a skill estiver travada por falta de requisitos, o nó renderiza com um ícone de 🔒 e com opacidade reduzida.

ToolTip Explicativo: Ao clicar na skill bloqueada, o modal renderiza dinamicamente o motivo: "Para desbloquear, atinja o Nível 15 e tenha Curioso Nvl 5".

5. COMO ADICIONAR NOVAS SKILLS NO FUTURO (Guia do Dev)
Para adicionar um novo galho na árvore, você não precisa tocar no código de UI. Basta:

Adicionar o novo objeto JSON no skills_config.

Definir as coordenadas (para a bolinha aparecer no lugar certo da tela).

Escrever no array requirements quem é o "Pai" dessa skill para a linha se conectar automaticamente.

Atualizar o prompt da IA para que ela reconheça a nova tag quando o usuário a tiver equipada.