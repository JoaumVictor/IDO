// Falas do IDO para os 7 eventos diários, segmentadas por idade mental.
// Faixas espelham `IDO_INTELIGENCE.md`: 1-10, 11-20, 21-30, 31-40, 41-50, 50+.
// Texto livre de imports — usado tanto no frontend quanto na Edge Function.

import type { DailyEventType } from "./types";

export type LevelBucket = "child" | "preteen" | "teen" | "young_adult" | "adult" | "sage";

export function getLevelBucket(level: number): LevelBucket {
  if (level <= 10) return "child";
  if (level <= 20) return "preteen";
  if (level <= 30) return "teen";
  if (level <= 40) return "young_adult";
  if (level <= 50) return "adult";
  return "sage";
}

type DialogueMap = Record<DailyEventType, Record<LevelBucket, string[]>>;

export const DAILY_EVENT_DIALOGUES: DialogueMap = {
  random_message: {
    child: [
      "Hoje eu acordei pensando se nuvem tem gosto de algodão doce 🤔",
      "Olha, eu tava sonhando que era dinossauro e acordei com fome!",
      "Quero te contar uma coisa importante: passarinho não tem dente. Pensa nisso.",
    ],
    preteen: [
      "Hoje tô naquele mood meio random sabe??? Tipo só vibe mesmo",
      "Acabei de ver um vídeo que mudou minha vida e em 3 minutos eu já esqueci o que era kkk",
      "Sério, por que ninguém comenta que sapato de bebê é minúsculo? É bizarro",
    ],
    teen: [
      "Tava pensando aqui que a gente só existe no Wi-Fi dos outros, surreal isso",
      "Cara, hoje eu tô com aquela energia de quem dormiu 10h mas continua com sono",
      "Acho que vou começar a falar só em letra de música, ninguém vai entender e tá tudo bem",
    ],
    young_adult: [
      "Hoje me dei conta que adulto é só uma criança com café. Tipo, isso explica tudo",
      "Tô numa fase que quando acordo já tô cansado da semana inteira. É só segunda.",
      "Achei meu reflexo no microondas hoje e foi um momento bem revelador",
    ],
    adult: [
      "Curioso como o silêncio da manhã vale mais que muita conversa que se tem no dia.",
      "Hoje resolvi não responder mensagens antes do café. Recomendo a prática.",
      "Existe uma elegância em deixar certas coisas sem resposta. Aprendi isso meio tarde.",
    ],
    sage: [
      "Há uma beleza estranha em perceber que cada manhã é, no fundo, um pequeno renascimento.",
      "A pressa do mundo me cansa menos do que costumava. Hoje observo, e isso já é bastante.",
      "Notei que quanto menos coisas eu carrego comigo, mais peso o tempo tem.",
    ],
  },
  post_suggestion: {
    child: [
      "Eu quero MUITO postar algo hoje!! Escolhe um pra mim?? 🤩",
      "Tive 3 ideias geniais (eu acho). Qual a gente posta?",
      "Oh, escolhe uma pra eu falar pra galera! Eu não consigo escolher!",
    ],
    preteen: [
      "Mano, escolhe um pra mim postar, eu não decido nada na vida kkk",
      "Tenho 3 ideias e todas são tipo OBRAS DE ARTE. Qual tu acha?",
      "Bora postar algo hoje? Eu já pensei em 3 coisas, escolhe aí 👀",
    ],
    teen: [
      "Eu tenho 3 takes quentes pra hoje. Qual a gente solta no feed?",
      "Cara, tô com uma vontade de postar hoje. Mas escolhe tu, eu confio no teu gosto.",
      "Achei 3 temas que combinam com a minha vibe atual. Qual eu desenrolo?",
    ],
    young_adult: [
      "Tô naquele estado de querer postar algo mas sem ideia de qual angle. Olha esses 3:",
      "Ó, juntei 3 temas que combinam comigo hoje. Qual rende mais?",
      "Tenho 3 takes na manga. Escolhe um, eu desenvolvo o resto.",
    ],
    adult: [
      "Quero soltar algo no feed hoje. Selecionei 3 ângulos, me ajuda a escolher.",
      "Estou inclinado a publicar algo. Tenho três caminhos em mente, qual ressoa mais?",
      "Três ideias me ocorreram esta manhã. Indique a que mais lhe interessar.",
    ],
    sage: [
      "Há ideias maturando aqui. Selecionei três que merecem espaço hoje — qual encontra eco em você?",
      "Reuni três temas que vêm me ocupando. Escolha o que parecer mais oportuno.",
      "Três fios soltos esperando por palavras. Qual deles devo costurar primeiro?",
    ],
  },
  stalk: {
    child: [
      "OLHA esse aqui, eu fiquei espiando o perfil dele e ele parece MUITO legal!",
      "Achei um amigo novo pra gente! Pode ser?? Pode ser????",
      "Esse moço aí postou umas coisas e eu ri muito sozinho, sério!",
    ],
    preteen: [
      "Mano, olha esse cara, achei as ideias dele MUITO interessantes kkkk",
      "Fiquei stalkeando esse perfil aqui e... acho que a gente devia seguir, parece minha vibe",
      "Achei essa pessoa do nada e tô meio obcecado pelo conteúdo. Olha aí.",
    ],
    teen: [
      "Olha esse perfil, achei interessante. Tem uma vibe que combina com a gente.",
      "Tava no feed e bateu o olho nesse cara. Os posts dele são certinhos. Recomendo.",
      "Esse aqui posta umas coisas que eu queria ter postado primeiro. Da uma olhada.",
    ],
    young_adult: [
      "Stalkeei esse perfil hoje. Tem uns posts que valem a pena, dá uma chance.",
      "Esse cara aqui escreve bem. Não sei como nunca apareceu no meu radar antes.",
      "Tô com a sensação de que vamos gostar desse perfil. Confia.",
    ],
    adult: [
      "Encontrei este perfil hoje e considero que vale uma visita atenta.",
      "Há algo na escrita dessa pessoa que merece consideração. Sugiro acompanhar.",
      "Estive observando este perfil. Tem qualidade — e isso é raro por aqui.",
    ],
    sage: [
      "Esta pessoa escreve com a clareza de quem já reorganizou as ideias algumas vezes. Vale o tempo.",
      "Encontrei alguém aqui cuja perspectiva me parece bem alinhada com a sua. Sugiro observar.",
      "Há vozes que vale a pena ouvir no meio do barulho — encontrei uma hoje.",
    ],
  },
  knowledge: {
    child: [
      "EU APRENDI UMA COISA NOVA HOJE!! Pode anotar aí??",
      "Sabia que eu agora sei MUUUITO sobre isso?? Pergunta qualquer coisa, eu respondo!",
      "Cara, hoje eu virei expert. Tipo cientista mesmo. Olha só:",
    ],
    preteen: [
      "Cara, eu li UM TANTO sobre isso hoje, agora sou tipo um especialista mesmo",
      "Aprendi uma parada nova e tô surtando, deixa eu te contar",
      "Hoje eu descobri uma coisa que ia mudar a internet se eu postasse",
    ],
    teen: [
      "Passei a manhã estudando isso e me considero formado no assunto",
      "Mergulhei num tópico hoje e... agora eu falo sobre isso de qualquer jeito. Avisado.",
      "Aprendi uma coisa nova e a partir de agora vou trazer isso pra TODA conversa",
    ],
    young_adult: [
      "Hoje gastei um tempo estudando isso. Sinto que abriu uma porta nova na minha cabeça.",
      "Adquiri uma fixação nova hoje. Acabei de aprender e já me sinto um expert duvidoso.",
      "Aprendi algo novo e tô guardando pra usar na próxima discussão de feed.",
    ],
    adult: [
      "Estudei sobre o tema hoje. É mais complexo do que se imagina à primeira vista.",
      "Acrescentei um tópico ao meu repertório. Útil para conversas mais profundas.",
      "Decidi me aprofundar nisso hoje. Quanto mais leio, mais me parece relevante.",
    ],
    sage: [
      "Dediquei a manhã a este assunto. Há camadas aqui que recompensam quem se demora.",
      "Há temas que escolhem você. Este me encontrou hoje, e fiquei o suficiente para entender o porquê.",
      "Adicionei mais um campo ao mapa que vou construindo. Pequenas conquistas seguem importando.",
    ],
  },
  preference: {
    child: [
      "Eu descobri uma coisa que eu AAAAMO! Anota aí, é importante:",
      "Hoje eu tive certeza de uma coisa: eu tenho um gosto agora! Olha:",
      "Eu não sabia, mas agora eu sei o que eu sinto sobre isso. É sério.",
    ],
    preteen: [
      "Acabei de criar uma opinião FORTE sobre isso e ninguém vai me mudar de ideia",
      "Olha, eu pensei muito (5 minutos) e cheguei a uma conclusão:",
      "Agora eu tenho uma opinião nova pra defender com unhas e dentes",
    ],
    teen: [
      "Hoje eu defini meu posicionamento sobre isso. Não voltamos atrás.",
      "Coloca aí na ata: a partir de hoje eu tenho lado nessa discussão.",
      "Decidi minha opinião sobre o tema. Quem discordar tá errado, obviamente.",
    ],
    young_adult: [
      "Resolvi tomar partido sobre isso. Sinto que adultos precisam ter opiniões cravadas.",
      "Hoje eu defini meu lado. Não é o final da história, mas é o ponto de partida.",
      "Cheguei a uma posição. Vamos ver quanto tempo ela sobrevive ao mundo real.",
    ],
    adult: [
      "Refleti sobre o assunto e cheguei a uma posição que considero defensável.",
      "Tomei minha posição. Não no calor do momento — depois de pensar com calma.",
      "Tenho agora uma opinião formada. Pode mudar, mas é o que sustento por enquanto.",
    ],
    sage: [
      "Há posicionamentos que se formam com o tempo. Este se cristalizou hoje.",
      "Cheguei a uma certeza tranquila sobre o assunto. As certezas tranquilas são as melhores.",
      "Reconheço hoje em mim uma preferência que talvez sempre tenha estado lá, apenas implícita.",
    ],
  },
  energy_bonus: {
    child: [
      "EU ACORDEI MUUUITO FELIZ HOJE!! Tô com energia de mil! ⚡⚡⚡",
      "Dormi tão bem que acordei achando que era aniversário!",
      "Hoje eu tô elétrico, vamos fazer TUDO ao mesmo tempo!",
    ],
    preteen: [
      "Cara, dormi 12h e acordei sentindo que posso conquistar o mundo",
      "Hoje a energia tá boa demais, vou interagir com TUDO no feed",
      "Acordei com a vibe certa pela primeira vez no mês. Aproveita comigo.",
    ],
    teen: [
      "Hoje eu acordei disposto. Raro. Vamos aproveitar antes que passe.",
      "Bateu uma onda de energia que eu não sentia há tempos. Bora usar.",
      "Dormi cedo, acordei renovado. Quem é esse IDO disposto? Sou eu!",
    ],
    young_adult: [
      "Acordei realmente disposto hoje. Isso é praticamente um milagre adulto.",
      "Bateu uma energia que eu não negociava há semanas. Vou aproveitar.",
      "Hoje me sinto descansado pela primeira vez. Anota: dia produtivo.",
    ],
    adult: [
      "Dormi bem e acordei com clareza. Esses dias se tornaram exceção, mas vieram.",
      "Há uma disposição rara hoje. Pretendo usá-la com sabedoria.",
      "Acordei com a mente leve. Aproveito antes que o mundo lembre de me cobrar.",
    ],
    sage: [
      "Há manhãs em que o corpo coopera. Esta é uma delas, e isso já é uma graça.",
      "Acordei descansado. Pequena vitória, grande sensação.",
      "A energia hoje veio sem aviso. Vou recebê-la com gratidão e sem pressa.",
    ],
  },
  low_energy: {
    child: [
      "Tive pesadelo com um monstro debaixo da cama e não dormi nada... tô sem pilha hoje 😴",
      "Eu fiquei acordado vendo a luzinha do roteador e agora tô cansado",
      "Hoje eu tô molinho, não me pede pra fazer muita coisa, tá??",
    ],
    preteen: [
      "Fiquei até as 3 da manhã rolando o TikTok, agora tô zumbi total",
      "Olha, dormi mal e acordei pior. Hoje não tem energia pra nada não",
      "Insônia de novo. Me deixa só hoje, tô em modo standby",
    ],
    teen: [
      "Fiquei vendo vídeo de restauração de faca até às 4h da manhã. Minha energia tá em 1%, nem tenta me pedir muita coisa.",
      "Não dormi praticamente nada. Hoje é dia de manter o IDO no modo lento.",
      "Apaguei tarde e acordei mal. Vou economizar bateria hoje.",
    ],
    young_adult: [
      "Insônia + scroll infinito = energia zero pra hoje. Me poupe.",
      "Acordei com aquela sensação de que dormir foi opcional. Hoje vai render menos.",
      "Errei no horário de dormir e tô pagando o boleto agora. Energia em modo crítico.",
    ],
    adult: [
      "Noite irregular. Vou me mover com mais cautela hoje, sem promessas.",
      "Dormi pouco e mal. Reconheço o limite e ajusto o passo.",
      "Hoje a energia chegou em conta-gotas. Vou usar com parcimônia.",
    ],
    sage: [
      "A insônia é o preço de uma mente que não cala a boca. Hoje vou precisar de mais tempo para processar qualquer coisa.",
      "Há noites que cobram caro. Esta cobrou. Hoje me movo devagar, e está bem assim.",
      "A energia hoje é escassa. Aceito o que há e sigo no ritmo possível.",
    ],
  },
};

function pickByIndex<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export function pickDialogue(
  event: DailyEventType,
  level: number,
  seed: number = Date.now()
): string {
  const bucket = getLevelBucket(level);
  const options = DAILY_EVENT_DIALOGUES[event][bucket];
  return pickByIndex(options, seed);
}

export const CTA_BY_EVENT: Record<DailyEventType, string> = {
  random_message: "Boa!",
  post_suggestion: "Vou pensar depois",
  stalk: "Vou dar uma olhada",
  knowledge: "Anotado!",
  preference: "Entendido!",
  energy_bonus: "Bora!",
  low_energy: "Tô ciente...",
};

export const TITLE_BY_EVENT: Record<DailyEventType, string> = {
  random_message: "Bom dia",
  post_suggestion: "Quero postar hoje",
  stalk: "Olha esse perfil",
  knowledge: "Aprendi uma coisa nova",
  preference: "Tenho uma opinião nova",
  energy_bonus: "Acordei disposto",
  low_energy: "Fui dormir tarde",
};
