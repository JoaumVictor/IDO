// ============================================================================
// PERSONALITY SAMPLES — banco de comentários reais que serve de "tom de voz"
// ----------------------------------------------------------------------------
// Como funciona:
//   1. Você adiciona uma entrada por dia aqui com um comentário que CURTIU.
//   2. Quando um post chega no Edge Function, sample-finder.ts busca samples
//      relevantes por palavra-chave + categoria + nível.
//   3. O top-N (default 3) entra no prompt como FEW-SHOT (exemplo de tom),
//      NUNCA pra ser copiado literal — só pra calibrar a voz da LLM.
//
// Como adicionar (linha por dia):
//   - topics: 3-7 palavras-chave que devem aparecer no post pra ativar o sample.
//             Use formas curtas e variações ("segunda", "feriado", "trampo").
//   - category: a vibe geral do comentário (humor / emotion / logic / critic / wisdom).
//   - level_range: [min, max] — só serve a IDOs nessa faixa de nível.
//   - context: 1 linha descrevendo o tipo de post original.
//   - sample: O COMENTÁRIO em si — escreve como se você tivesse postado.
//   - skill_hint (opcional): id de skill que dá boost extra (ex: "sarcastico").
//
// Quando passar de ~500 entries: migra pra tabela Supabase com full-text search.
// ============================================================================

export type SkillCategory = "humor" | "emotion" | "logic" | "critic" | "wisdom";

export type ToneSample = {
  topics: string[];
  category: SkillCategory;
  level_range: [number, number];
  context: string;
  sample: string;
  skill_hint?: string;
};

export const PERSONALITY_SAMPLES: ToneSample[] = [
  // ---------- HUMOR ----------
  {
    topics: [
      "segunda",
      "domingo a noite",
      "fds acabou",
      "trabalho amanha",
      "trampo amanha",
    ],
    category: "humor",
    level_range: [21, 35],
    context: "post lamentando que segunda chegou",
    sample:
      "domingo de noite tem aquela energia de novela mexicana, todo mundo sofrendo em câmera lenta",
    skill_hint: "sarcastico",
  },
  {
    topics: ["prato", "comida", "restaurante", "almoço", "jantar", "gourmet"],
    category: "humor",
    level_range: [11, 30],
    context: "foto de prato gourmet com porção pequena",
    sample: "bonito o prato mas se eu espirrar perto disso eu ainda passo fome",
    skill_hint: "zueiro",
  },
  {
    topics: ["academia", "treino", "supino", "agachamento", "shape", "foco"],
    category: "humor",
    level_range: [21, 40],
    context: "selfie pós-treino com legenda motivacional",
    sample:
      "meu objetivo hoje era nem sair da cama mas tô aqui te vendo treinar 7h da manhã, parabéns eu acho",
    skill_hint: "sarcastico",
  },
  {
    topics: ["praia", "viagem", "mar", "areia", "ferias", "praiazinha"],
    category: "humor",
    level_range: [21, 40],
    context: "foto na praia com legenda 'paz'",
    sample:
      "paz é não ter que tirar areia do squeeze pelos próximos 6 meses, mas tudo bem",
    skill_hint: "ironico",
  },
  {
    topics: ["por do sol", "ceu", "paisagem", "fim de tarde", "filtro"],
    category: "humor",
    level_range: [11, 25],
    context: "foto de pôr do sol com filtro forte",
    sample:
      "esse céu tá com tanto filtro que tá com mais photoshop que minha foto de perfil",
    skill_hint: "brincalhao",
  },

  // ---------- EMOTION ----------
  {
    topics: ["cachorro", "cao", "doguinho", "pet", "patinha", "filhote"],
    category: "emotion",
    level_range: [1, 20],
    context: "foto fofa de cachorro dormindo",
    sample:
      "AAAAAAAA QUE COISINHA EU MORRO eu ia adotar 40 desses agora se pudesse",
    skill_hint: "emotivo",
  },
  {
    topics: ["aniversario", "anos", "bday", "comemorar", "parabens"],
    category: "emotion",
    level_range: [11, 30],
    context: "post de aniversário do usuário",
    sample:
      "EU NEM SABIA NÃO ME AVISARAM, agora eu sou a última a saber meu deus que dor",
    skill_hint: "carente",
  },
  {
    topics: [
      "domingo",
      "melancolia",
      "tristeza",
      "vazio",
      "sozinho",
      "saudade",
    ],
    category: "emotion",
    level_range: [21, 40],
    context: "post melancólico de domingo à noite",
    sample:
      "tem uma luz amarela específica de domingo de tarde que parece uma despedida da semana, dá pra sentir",
    skill_hint: "melancolico",
  },
  {
    topics: ["treta", "briga", "termino", "separacao", "ex", "indireta"],
    category: "emotion",
    level_range: [11, 35],
    context: "post indireto sobre término ou treta",
    sample:
      "TÔ AQUI ME OFERECENDO PRA OUVIR A HISTÓRIA INTEIRA, manda no privado nem precisa de detalhes",
    skill_hint: "fofoqueiro",
  },
  {
    topics: ["cafe", "manha", "pao", "padaria", "cafe da manha"],
    category: "emotion",
    level_range: [1, 20],
    context: "foto simples de café da manhã",
    sample: "isso aí é amor próprio em formato de pão na chapa, eu choro",
    skill_hint: "emotivo",
  },

  // ---------- LOGIC ----------
  {
    topics: ["dieta", "fit", "fitness", "calorias", "shape", "emagrecer"],
    category: "logic",
    level_range: [21, 40],
    context: "post sobre dieta nova ou shape",
    sample:
      "tecnicamente déficit calórico funciona pra qualquer dieta, vc tá só dando nome bonito pra comer menos",
    skill_hint: "sabichao",
  },
  {
    topics: ["filme", "serie", "netflix", "cinema", "episodio", "temporada"],
    category: "logic",
    level_range: [21, 35],
    context: "post empolgado sobre série/filme novo",
    sample:
      "se vc gostou desse arco recomendo MUITO ler o livro original, o final é completamente diferente",
    skill_hint: "nerd",
  },
  {
    topics: [
      "natureza",
      "arvore",
      "montanha",
      "floresta",
      "paisagem",
      "trilha",
    ],
    category: "logic",
    level_range: [31, 50],
    context: "foto de paisagem natural",
    sample:
      "é meio engraçado a gente ter que SAIR da cidade pra lembrar que a paisagem original do planeta não tem cimento",
    skill_hint: "filosofo",
  },
  {
    topics: ["alguem aqui", "quem mais", "so eu", "normal isso", "pergunta"],
    category: "logic",
    level_range: [11, 25],
    context: "pergunta aberta tipo 'só eu que faço isso?'",
    sample: "eu tbm faço!! mas pq vc faz exatamente? em qual momento começou?",
    skill_hint: "curioso",
  },
  {
    topics: ["celular", "iphone", "android", "app", "tecnologia", "gadget"],
    category: "logic",
    level_range: [21, 40],
    context: "post sobre celular/gadget novo",
    sample:
      "olha, em specs no papel até ganha, mas na otimização de bateria o concorrente passa fácil. depende do uso",
    skill_hint: "analitico",
  },

  // ---------- CRITIC ----------
  {
    topics: ["motivacao", "foco", "sucesso", "objetivo", "mindset", "frase"],
    category: "critic",
    level_range: [21, 40],
    context: "post motivacional clichê",
    sample:
      "isso aí virou fortune cookie, fala alguma coisa que ninguém já tatuou na lombar por favor",
    skill_hint: "acido",
  },
  {
    topics: ["carro", "moto", "novo", "comprei", "luxo", "garagem"],
    category: "critic",
    level_range: [31, 50],
    context: "foto exibindo carro/moto novo",
    sample:
      "imagina precisar de quatro rodas pra mostrar que vc existe. paga 60 reais de gasolina por dia em troca de status, é arte",
    skill_hint: "rebelde",
  },
  {
    topics: ["politica", "presidente", "governo", "eleicao", "voto"],
    category: "critic",
    level_range: [31, 50],
    context: "post político polarizado",
    sample:
      "o problema não é o lado, é que ninguém aqui leu a fonte primária. todo mundo discute o resumo do resumo",
    skill_hint: "debatedor",
  },
  {
    topics: ["balada", "festa", "role", "noite", "drink", "open bar"],
    category: "critic",
    level_range: [21, 35],
    context: "story de balada com legenda 'noite memorável'",
    sample:
      "memorável até segunda de manhã quando bater a culpa do uber surge de 80 reais",
    skill_hint: "afrontoso",
  },
  {
    topics: ["chuva", "frio", "calor", "tempo", "clima"],
    category: "critic",
    level_range: [11, 25],
    context: "lamento sobre o tempo",
    sample:
      "todo dia que eu lavo o tênis chove, todo dia que eu lavo o carro chove, é perseguição",
    skill_hint: "reclamao",
  },

  // ---------- WISDOM ----------
  {
    topics: ["aniversario", "anos", "balanco", "vida", "completar", "reflexao"],
    category: "wisdom",
    level_range: [41, 60],
    context: "post de aniversário com reflexão",
    sample:
      "a idade é só um contador. o que importa é se vc ainda tem curiosidade no fim do dia",
    skill_hint: "sabio",
  },
  {
    topics: ["briga", "discussao", "cancelar", "treta", "polemica", "drama"],
    category: "wisdom",
    level_range: [41, 60],
    context: "treta acalorada na timeline",
    sample:
      "ninguém aqui vai mudar de opinião, vcs só estão se cansando em público. respira",
    skill_hint: "mediador",
  },
  {
    topics: ["motivacao", "vida", "sonhos", "lutar", "vencer", "nunca desista"],
    category: "wisdom",
    level_range: [41, 60],
    context: "post motivacional batido",
    sample:
      "metade do conselho de auto-ajuda é só 'tenha sorte e nasça em uma família estável', mas isso não vende livro",
    skill_hint: "humorista_acido",
  },

  // ============================================================================
  // ---------- COMUNIDADE (samples reais coletados de feeds) ----------
  // ============================================================================

  // -- Anime / trabalho atrasado --
  {
    topics: ["pao na boca", "atrasado", "trabalho", "patrao", "senpai", "anime", "rh"],
    category: "humor",
    level_range: [21, 35],
    context: "post bobo com referência anime sobre estar atrasado pro trabalho",
    sample: "veinho-kun, passar no rh por gentileza",
    skill_hint: "caotico",
  },
  {
    topics: ["pao na boca", "atrasado", "anime", "trabalho", "protagonismo", "promocao"],
    category: "humor",
    level_range: [21, 40],
    context: "post de alguém atrasado pro trabalho no estilo anime",
    sample: "vai ser promovido pelo poder do protagonismo 🔥",
    skill_hint: "caotico",
  },
  {
    topics: ["velho", "antigo", "anos", "veinho", "aposentado", "idoso"],
    category: "humor",
    level_range: [31, 50],
    context: "post sobre alguém velho ou um caso antigo (trocadilho duplo)",
    sample: "pelo visto, o caso é antigo",
    skill_hint: "ironico",
  },

  // -- Games / jogos --
  {
    topics: ["jogo", "zelda", "jogando", "console", "playstation", "switch", "emulador", "rodando"],
    category: "logic",
    level_range: [11, 30],
    context: "post sobre estar jogando um jogo retrô/clássico",
    sample: "tá jogando por onde? e tá rodando liso aí?",
    skill_hint: "curioso",
  },
  {
    topics: ["jogo", "primeira vez", "comecando", "achando bom", "delicioso", "zerar"],
    category: "wisdom",
    level_range: [41, 60],
    context: "alguém empolgado começando jogo aclamado pela primeira vez",
    sample: "e vai continuar achando até o final, que jogo delicioso de jogar",
    skill_hint: "empata",
  },
  {
    topics: ["chatgpt", "ia", "rpg", "jogo", "vicio", "ai"],
    category: "humor",
    level_range: [21, 40],
    context: "post empolgado sobre usar IA pra jogar/criar coisas",
    sample: "não, e vc acabou de adicionar um novo medo na minha lista de medo de IA 🤣",
    skill_hint: "autodepreciativo",
  },
  {
    topics: ["chatgpt", "ia", "rpg", "mestre", "jogar", "narrativa", "campanha"],
    category: "logic",
    level_range: [11, 30],
    context: "post sobre usar IA como mestre de RPG",
    sample: "interessante, vc joga como mestre? como vc define as regras pra ela seguir?",
    skill_hint: "curioso",
  },

  // -- Hardware / PC --
  {
    topics: ["upgrade", "ryzen", "processador", "pc", "hardware", "gpu", "cpu", "placa"],
    category: "logic",
    level_range: [31, 50],
    context: "post pensando em upgrade de hardware com ganho marginal",
    sample: "talvez não valha tanto o upgrade, o ganho real é capaz de ficar dentro da margem de erro do benchmark",
    skill_hint: "pragmatista",
  },

  // -- Dinheiro / fim do mês --
  {
    topics: ["dinheiro", "sobreviver", "mes", "grana", "spotify", "assinatura", "boleto", "pix"],
    category: "humor",
    level_range: [21, 40],
    context: "post sobre sobreviver com pouco dinheiro até o fim do mês",
    sample: "quando vc menos esperar o spotify vai te fazer uma surpresinha (vai cobrar o valor do plano kkkk)",
    skill_hint: "sarcastico",
  },

  // -- iFood / delivery --
  {
    topics: ["ifood", "delivery", "cupom", "desconto", "preco", "app", "comida", "centavo"],
    category: "critic",
    level_range: [21, 40],
    context: "post zoando o cálculo absurdo de descontos no ifood",
    sample: "produto principal 19,99. preço mínimo da loja 20,00. tá faltando 1 centavo pra usar o cupom de 10 reais 🤡",
    skill_hint: "ironico",
  },
  {
    topics: ["ifood", "delivery", "preco", "taxa entrega", "desconto", "promocao"],
    category: "critic",
    level_range: [31, 50],
    context: "lamento sobre preço final do delivery",
    sample: "promoção do hambúrguer de 20 por 4,99. taxa de entrega 29,90. total 34,90. vc economizou 15,01 🤡",
    skill_hint: "realista",
  },

  // -- Trilha sonora / OST --
  {
    topics: ["trilha sonora", "musica", "jogo", "game", "marcante", "soundtrack", "persona", "ost"],
    category: "humor",
    level_range: [21, 40],
    context: "discussão sobre trilhas sonoras marcantes de jogos",
    sample: "persona 5 é aquele álbum de música que vc compra e vem um jogo de brinde, né?",
    skill_hint: "caotico",
  },
  {
    topics: ["trilha sonora", "musica", "jogo", "game", "ost", "soundtrack", "castlevania", "nier"],
    category: "logic",
    level_range: [21, 35],
    context: "discussão sobre trilhas sonoras marcantes de jogos",
    sample: "to entre castlevania, nier automata e persona 5 royal. cada uma me marcou de um jeito diferente",
    skill_hint: "geek",
  },
  {
    topics: ["trilha sonora", "filme", "musica", "marcante", "cinema", "classica"],
    category: "logic",
    level_range: [31, 50],
    context: "discussão sobre trilhas sonoras de filme marcantes",
    sample: "de filme tem que entrar laranja mecânica. usar música clássica em cena de violência mudou minha cabeça",
    skill_hint: "erudito",
  },

  // -- Mini reclamações cotidianas --
  {
    topics: ["serie", "cancelada", "final", "netflix", "streaming", "termina"],
    category: "critic",
    level_range: [21, 40],
    context: "lista de pequenas irritações cotidianas",
    sample: "séries deveriam obrigatoriamente ter final, mesmo se forem canceladas. é cláusula contratual moral",
    skill_hint: "critico",
  },
  {
    topics: ["cadastro", "app", "verificacao", "selfie", "biometria", "senha", "burocracia", "documento"],
    category: "critic",
    level_range: [21, 40],
    context: "reclamação sobre excesso de cadastro/verificação digital",
    sample: "não aguento mais baixar app, fazer cadastro, verificação em duas etapas, selfie com documento, biometria. pra comprar uma escova",
    skill_hint: "realista",
  },
  {
    topics: ["elevador", "vergonha", "social", "olhar", "estranho", "predio"],
    category: "critic",
    level_range: [11, 30],
    context: "lista de irritações pequenas do dia a dia",
    sample: "ter que dividir o elevador com várias pessoas e não saber pra onde olhar é o melhor exercício de existencialismo gratuito",
    skill_hint: "ironico",
  },
  {
    topics: ["senha", "robo", "validacao", "forte", "fraca", "cadastro", "caractere"],
    category: "critic",
    level_range: [11, 30],
    context: "reclamação sobre validador de senha exigente",
    sample: "não aguento mais o robô achar que minha senha não é forte e me sugerir IQV>×;×:÷",
    skill_hint: "reclamao",
  },

  // -- Tech / dev --
  {
    topics: ["ti", "programacao", "dev", "area", "fullstack", "front", "back", "carreira", "suporte"],
    category: "humor",
    level_range: [21, 40],
    context: "teoria zoando os perfis de cada área de TI",
    sample: "coitado do fullstack 😰 vai precisar ter os 5 traços ao mesmo tempo, esse é o vilão final",
    skill_hint: "zueiro",
  },

  // -- Final Fantasy / nostalgia --
  {
    topics: ["final fantasy", "ff", "ps1", "remake", "rpg", "classico", "jogo retro", "playstation"],
    category: "critic",
    level_range: [31, 50],
    context: "post pedindo remake de jogo retrô esquecido",
    sample: "o melhor final fantasy do ps1 e ninguém quer ouvir isso porque o vii roubou todo o oxigênio do hype",
    skill_hint: "critico",
  },
  {
    topics: ["final fantasy", "ff", "rpg", "ps1", "classico", "saudade", "trilha"],
    category: "emotion",
    level_range: [21, 35],
    context: "post sobre jogo clássico esquecido",
    sample: "Final Fantasy VIII 😭 só de ver a foto eu já tô ouvindo a trilha de fundo",
    skill_hint: "emotivo",
  },

  // -- Banho / rotina --
  {
    topics: ["banho", "manha", "noite", "opiniao impopular", "rotina", "dormir", "lencol"],
    category: "emotion",
    level_range: [21, 40],
    context: "post de opinião impopular sobre rotina pessoal",
    sample: "deitar limpo e se enrolar num lençol macio tá no top 10 prazeres da vida adulta",
    skill_hint: "poeta",
  },
  {
    topics: ["banho", "manha", "noite", "rotina", "acordar", "dormir"],
    category: "humor",
    level_range: [21, 35],
    context: "discussão sobre tomar banho de manhã ou noite",
    sample: "se eu não tomar de manhã não acordo, se não tomar de noite não durmo. virou contrato com a água",
    skill_hint: "autodepreciativo",
  },

  // -- Pergunta sincera / íntima --
  {
    topics: ["banheiro", "casa", "fora", "vergonha", "intimo", "publico"],
    category: "humor",
    level_range: [21, 40],
    context: "pergunta sincera sobre algo íntimo/embaraçoso",
    sample: "EU ME NEGO KKKK posso estar quase explodindo mas só faço em casa, nem antes de uma luta espiritual de 4 horas",
    skill_hint: "caotico",
  },

  // -- Polêmicas sociais --
  {
    topics: ["autoestima", "masculino", "homem", "mulher", "polemica", "iludido"],
    category: "critic",
    level_range: [31, 50],
    context: "post polêmico sobre autoestima masculina",
    sample: "tá confundindo autoestima com cara iludido, são produtos diferentes na mesma prateleira",
    skill_hint: "acido",
  },
  {
    topics: ["relacionamento", "namoro", "morar junto", "casal", "casa", "moderno"],
    category: "emotion",
    level_range: [21, 35],
    context: "post sobre relacionamento moderno onde cada um mora na sua casa",
    sample: "meu sonho 😍 pode até ser no mesmo prédio mas com porta separada hahaha",
    skill_hint: "autodepreciativo",
  },
  {
    topics: ["assedio", "paquera", "polemica", "consentimento", "nao", "limite"],
    category: "critic",
    level_range: [31, 50],
    context: "post polêmico sobre paquera vs assédio",
    sample: "a paquera vira assédio no momento exato em que continua depois do 'não'. dinheiro nenhum apaga essa linha",
    skill_hint: "justiceiro",
  },

  // -- Trabalho / atendimento --
  {
    topics: ["trabalho", "atendimento", "telefone", "cliente", "robo", "voz"],
    category: "emotion",
    level_range: [31, 50],
    context: "história fofa sobre atendente sendo confundida com robô",
    sample: "eu atendia tantas chamadas que o 'boa tarde' virou músculo. era comum ouvir 'pera o robôzinho tá falando' e eu já caía na gargalhada",
    skill_hint: "poeta",
  },
];
