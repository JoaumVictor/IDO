// ============================================================================
// SAMPLE FINDER — busca samples relevantes no banco pra injetar no prompt
// ----------------------------------------------------------------------------
// Lógica simples (suficiente até ~500 samples):
//   1. Tokeniza post: lowercase, sem acentos, sem pontuação, sem stopwords PT-BR.
//   2. Pra cada sample, conta overlap entre tokens do post e topics do sample.
//   3. Boost +2 se sample.category bate com a categoria dominante do IDO.
//   4. Boost +1 se nível do IDO está dentro do sample.level_range. -1 se fora.
//   5. Boost +1.5 se sample.skill_hint está nas skills do IDO.
//   6. Filtra entries com score > 0, ordena desc, devolve top-N (default 3).
//
// Quando crescer pra >500 samples ou recall ficar ruim: trocar por embeddings.
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

const STOPWORDS = new Set([
  "a","o","as","os","um","uma","uns","umas","de","do","da","dos","das",
  "em","no","na","nos","nas","que","e","ou","mas","se","com","sem","por",
  "para","pra","pro","como","mais","menos","muito","muita","muitos","muitas",
  "ja","agora","tao","tanto","aqui","ali","la","aonde","onde","quando",
  "isso","isto","esse","essa","esses","essas","este","esta","aquele","aquela",
  "eu","tu","voce","vc","ele","ela","nos","vos","eles","elas","meu","minha",
  "seu","sua","nosso","nossa","ser","estar","tem","ter","tinha","foi","era",
  "vai","vou","ir","fazer","faz","feito","fez","sim","nao","n","tbm","tambem",
  "so","ate","sobre","ne","sera","seria","entao","tipo","coisa","essa","esse",
  "to","ta","tava","ne","ah","oh","ai","la","ali","ca",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (combining marks)
    .replace(/[^\p{L}\s]/gu, " ");   // troca pontuação por espaço
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export type FindSamplesParams = {
  postContent: string;
  idoLevel: number;
  dominantCategory: SkillCategory | null;
  idoSkillIds?: string[];
  samples: ToneSample[];
  limit?: number;
};

export function findRelevantSamples({
  postContent,
  idoLevel,
  dominantCategory,
  idoSkillIds,
  samples,
  limit = 3,
}: FindSamplesParams): ToneSample[] {
  const postTokens = new Set(tokenize(postContent));
  if (postTokens.size === 0) return [];

  const skillIdSet = new Set(idoSkillIds ?? []);

  const scored = samples
    .map((sample) => {
      let overlap = 0;
      for (const topic of sample.topics) {
        const topicTokens = tokenize(topic);
        for (const tt of topicTokens) {
          if (postTokens.has(tt)) {
            overlap += 1;
            break;
          }
        }
      }

      if (overlap === 0) return { sample, score: -1 };

      let score = overlap;
      if (dominantCategory && sample.category === dominantCategory) score += 2;

      const [lo, hi] = sample.level_range;
      if (idoLevel >= lo && idoLevel <= hi) score += 1;
      else score -= 1;

      if (sample.skill_hint && skillIdSet.has(sample.skill_hint)) score += 1.5;

      return { sample, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.sample);

  return scored;
}
