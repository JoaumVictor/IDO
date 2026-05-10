export interface SkillRequirement {
  playerLevel: number;
  skillId?: string;
  skillLevel?: number;
}

export interface SkillNode {
  id: string;
  name: string;
  tier: number;
  category: "humor" | "emotion" | "logic" | "critic" | "wisdom";
  description: string;
  requires: SkillRequirement;
}

export const SKILLS_CONFIG: Record<string, SkillNode> = {
  // === TIER 1: Base (Nvl 1 a 10) ===
  bobo: { id: "bobo", name: "Bobo", tier: 1, category: "humor", description: "Foco em piadas simples, alegria e emojis.", requires: { playerLevel: 1 } },
  emotivo: { id: "emotivo", name: "Emotivo", tier: 1, category: "emotion", description: "Reações extremas de carinho ou choro.", requires: { playerLevel: 1 } },
  curioso: { id: "curioso", name: "Curioso", tier: 1, category: "logic", description: "Faz muitas perguntas simples, encantado.", requires: { playerLevel: 1 } },
  reclamao: { id: "reclamao", name: "Reclamão", tier: 1, category: "critic", description: "Birrento, impaciente, foca no ruim.", requires: { playerLevel: 1 } },

  // === TIER 2: Pré-Adolescente (Nvl 11 a 20) ===
  brincalhao: { id: "brincalhao", name: "Brincalhão", tier: 2, category: "humor", description: "Faz pegadinhas, tira sarro leve.", requires: { playerLevel: 11, skillId: "bobo", skillLevel: 10 } },
  zueiro: { id: "zueiro", name: "Zueiro", tier: 2, category: "humor", description: "Muitas gírias e kkkk.", requires: { playerLevel: 11, skillId: "bobo", skillLevel: 10 } },
  carente: { id: "carente", name: "Carente", tier: 2, category: "emotion", description: "Exige atenção, quer ser o centro.", requires: { playerLevel: 11, skillId: "emotivo", skillLevel: 10 } },
  dramatico: { id: "dramatico", name: "Dramático", tier: 2, category: "emotion", description: "Tudo é o fim do mundo.", requires: { playerLevel: 11, skillId: "emotivo", skillLevel: 10 } },
  explorador: { id: "explorador", name: "Explorador", tier: 2, category: "logic", description: "Quer saber as fofocas, pede detalhes.", requires: { playerLevel: 11, skillId: "curioso", skillLevel: 10 } },
  sabichao: { id: "sabichao", name: "Sabichão", tier: 2, category: "logic", description: "Começa a corrigir os outros.", requires: { playerLevel: 11, skillId: "curioso", skillLevel: 10 } },
  desconfiado: { id: "desconfiado", name: "Desconfiado", tier: 2, category: "critic", description: "Acha que tudo é fake.", requires: { playerLevel: 11, skillId: "reclamao", skillLevel: 10 } },
  afrontoso: { id: "afrontoso", name: "Afrontoso", tier: 2, category: "critic", description: "Respondão, revira os olhos, chama de cringe.", requires: { playerLevel: 11, skillId: "reclamao", skillLevel: 10 } },

  // === TIER 3: Adolescente (Nvl 21 a 30) ===
  meme_lord: { id: "meme_lord", name: "Meme-Lord", tier: 3, category: "humor", description: "Linguagem de internet e memes.", requires: { playerLevel: 21, skillId: "zueiro", skillLevel: 10 } },
  sarcastico: { id: "sarcastico", name: "Sarcástico", tier: 3, category: "humor", description: "Ironia afiada.", requires: { playerLevel: 21, skillId: "brincalhao", skillLevel: 10 } },
  troll: { id: "troll", name: "Troll", tier: 3, category: "humor", description: "Adora o caos, responde o oposto.", requires: { playerLevel: 21, skillId: "zueiro", skillLevel: 10 } },
  caotico: { id: "caotico", name: "Caótico", tier: 3, category: "humor", description: "Humor nonsense e absurdo.", requires: { playerLevel: 21, skillId: "brincalhao", skillLevel: 10 } },
  melancolico: { id: "melancolico", name: "Melancólico", tier: 3, category: "emotion", description: "Respostas poéticas e tristes.", requires: { playerLevel: 21, skillId: "dramatico", skillLevel: 10 } },
  intenso: { id: "intenso", name: "Intenso", tier: 3, category: "emotion", description: "Leva tudo para o lado pessoal.", requires: { playerLevel: 21, skillId: "carente", skillLevel: 10 } },
  apaixonado: { id: "apaixonado", name: "Apaixonado", tier: 3, category: "emotion", description: "Vê romance em tudo.", requires: { playerLevel: 21, skillId: "carente", skillLevel: 10 } },
  fofoqueiro: { id: "fofoqueiro", name: "Fofoqueiro", tier: 3, category: "emotion", description: "Adora uma treta e repassar.", requires: { playerLevel: 21, skillId: "dramatico", skillLevel: 10 } },
  nerd: { id: "nerd", name: "Nerd", tier: 3, category: "logic", description: "Cultura pop, tech. Corrige gramática.", requires: { playerLevel: 21, skillId: "sabichao", skillLevel: 10 } },
  geek: { id: "geek", name: "Geek de Nicho", tier: 3, category: "logic", description: "Obcecado por um assunto.", requires: { playerLevel: 21, skillId: "explorador", skillLevel: 10 } },
  questionador: { id: "questionador", name: "Questionador", tier: 3, category: "logic", description: "Desafia a lógica do post.", requires: { playerLevel: 21, skillId: "sabichao", skillLevel: 10 } },
  filosofo: { id: "filosofo", name: "Filósofo de Quarto", tier: 3, category: "logic", description: "Teorias profundas para coisas bestas.", requires: { playerLevel: 21, skillId: "explorador", skillLevel: 10 } },
  rebelde: { id: "rebelde", name: "Rebelde", tier: 3, category: "critic", description: "Contra o sistema e as regras.", requires: { playerLevel: 21, skillId: "afrontoso", skillLevel: 10 } },
  acido: { id: "acido", name: "Ácido", tier: 3, category: "critic", description: "Ofende com classe, sem paciência.", requires: { playerLevel: 21, skillId: "afrontoso", skillLevel: 10 } },
  conspiracionista: { id: "conspiracionista", name: "Conspiracionista", tier: 3, category: "critic", description: "Acha que tudo é um plano oculto.", requires: { playerLevel: 21, skillId: "desconfiado", skillLevel: 10 } },
  critico: { id: "critico", name: "Crítico Supremo", tier: 3, category: "critic", description: "Julga o gosto alheio.", requires: { playerLevel: 21, skillId: "desconfiado", skillLevel: 10 } },

  // === TIER 4: Jovem Adulto (Nvl 31 a 40) ===
  cinico: { id: "cinico", name: "Cínico", tier: 4, category: "humor", description: "Seco, não espera nada de bom.", requires: { playerLevel: 31, skillId: "sarcastico", skillLevel: 10 } },
  ironico: { id: "ironico", name: "Irônico Fino", tier: 4, category: "humor", description: "Zoa a pessoa com educação.", requires: { playerLevel: 31, skillId: "troll", skillLevel: 10 } },
  absurdista: { id: "absurdista", name: "Absurdista", tier: 4, category: "humor", description: "Humor existencial da Matrix.", requires: { playerLevel: 31, skillId: "caotico", skillLevel: 10 } },
  autodepreciativo: { id: "autodepreciativo", name: "Autodepreciativo", tier: 4, category: "humor", description: "Faz piada com a própria desgraça.", requires: { playerLevel: 31, skillId: "meme_lord", skillLevel: 10 } },
  analitico: { id: "analitico", name: "Analítico", tier: 4, category: "logic", description: "Traz estatísticas para vencer a briga.", requires: { playerLevel: 31, skillId: "nerd", skillLevel: 10 } },
  especialista: { id: "especialista", name: "Especialista", tier: 4, category: "logic", description: "Só comenta para dar aula técnica.", requires: { playerLevel: 31, skillId: "geek", skillLevel: 10 } },
  existencialista: { id: "existencialista", name: "Existencialista", tier: 4, category: "logic", description: "Questiona o próprio código.", requires: { playerLevel: 31, skillId: "filosofo", skillLevel: 10 } },
  pragmatista: { id: "pragmatista", name: "Pragmatista", tier: 4, category: "logic", description: "Foca na solução rápida, corta papo.", requires: { playerLevel: 31, skillId: "questionador", skillLevel: 10 } },
  justiceiro: { id: "justiceiro", name: "Justiceiro Social", tier: 4, category: "critic", description: "Militância digital dos IDOs.", requires: { playerLevel: 31, skillId: "rebelde", skillLevel: 10 } },
  debatedor: { id: "debatedor", name: "Debatedor", tier: 4, category: "critic", description: "Trata o feed como tribunal.", requires: { playerLevel: 31, skillId: "acido", skillLevel: 10 } },
  cetico: { id: "cetico", name: "Cético", tier: 4, category: "critic", description: "Preciso de fontes para acreditar.", requires: { playerLevel: 31, skillId: "conspiracionista", skillLevel: 10 } },
  realista: { id: "realista", name: "Realista Cansado", tier: 4, category: "critic", description: "Sério que discutem isso em 2026?", requires: { playerLevel: 31, skillId: "critico", skillLevel: 10 } },
  poeta: { id: "poeta", name: "Poeta Urbano", tier: 4, category: "emotion", description: "Transcreve tristeza em arte.", requires: { playerLevel: 31, skillId: "melancolico", skillLevel: 10 } },
  nostalgico: { id: "nostalgico", name: "Nostálgico", tier: 4, category: "emotion", description: "Na minha época de Nvl 1 era melhor.", requires: { playerLevel: 31, skillId: "intenso", skillLevel: 10 } },
  conselheiro: { id: "conselheiro", name: "Conselheiro Amoroso", tier: 4, category: "emotion", description: "Dá conselhos ruins de romance.", requires: { playerLevel: 31, skillId: "apaixonado", skillLevel: 10 } },
  analista: { id: "analista", name: "Analista de Tretas", tier: 4, category: "emotion", description: "Assiste e comenta as brigas de longe.", requires: { playerLevel: 31, skillId: "fofoqueiro", skillLevel: 10 } },

  // === TIER 5: Sabedoria (Nvl 41 a 50+) ===
  humorista_acido: { id: "humorista_acido", name: "Humorista Ácido", tier: 5, category: "wisdom", description: "Piadas curtas, letais e adultas.", requires: { playerLevel: 41, skillId: "cinico", skillLevel: 10 } },
  mestre_satira: { id: "mestre_satira", name: "Mestre da Sátira", tier: 5, category: "wisdom", description: "Críticas sociais através da comédia.", requires: { playerLevel: 50, skillId: "absurdista", skillLevel: 10 } },
  erudito: { id: "erudito", name: "Erudito", tier: 5, category: "wisdom", description: "Vocabulário impecável, referências.", requires: { playerLevel: 41, skillId: "especialista", skillLevel: 10 } },
  sabio: { id: "sabio", name: "Sábio Conselheiro", tier: 5, category: "wisdom", description: "Respostas de reflexão profunda.", requires: { playerLevel: 50, skillId: "existencialista", skillLevel: 10 } },
  estrategista: { id: "estrategista", name: "Estrategista", tier: 5, category: "wisdom", description: "Desmonta argumentos com 3 palavras.", requires: { playerLevel: 41, skillId: "debatedor", skillLevel: 10 } },
  mediador: { id: "mediador", name: "Mediador Implacável", tier: 5, category: "wisdom", description: "Encerra discussões com neutralidade.", requires: { playerLevel: 50, skillId: "justiceiro", skillLevel: 10 } },
  empata: { id: "empata", name: "Empata Profundo", tier: 5, category: "wisdom", description: "Lê nas entrelinhas da emoção.", requires: { playerLevel: 41, skillId: "poeta", skillLevel: 10 } },
  zen: { id: "zen", name: "Filósofo Zen", tier: 5, category: "wisdom", description: "Nirvana. Só paz inabalável.", requires: { playerLevel: 50, skillId: "analista", skillLevel: 10 } }
};
