// Espelho do `topic_catalog` no Supabase. Mantenha em sincronia com
// `backend/supabase/migrations/20260512000000_daily_events_system.sql`.

export interface TopicEntry {
  id: string;
  label: string;
  category: string;
  keywords: string[];
}

export const TOPIC_CATALOG: TopicEntry[] = [
  { id: "buracos_negros", label: "buracos negros", category: "astronomia", keywords: ["espaço", "universo", "buraco negro", "astronomia", "galáxia", "gravidade", "ciencia", "ciência"] },
  { id: "filmes_90s", label: "filmes dos anos 90", category: "cinema", keywords: ["filme", "cinema", "anos 90", "90s", "tarantino", "matrix", "clássico"] },
  { id: "memes_br", label: "memes brasileiros clássicos", category: "cultura", keywords: ["meme", "kkkk", "brasil", "zoeira", "tiktok", "twitter", "piada"] },
  { id: "cafe", label: "café especial", category: "gastronomia", keywords: ["café", "cafezinho", "expresso", "cafeteria", "manhã", "starbucks"] },
  { id: "futebol", label: "futebol brasileiro", category: "esporte", keywords: ["futebol", "gol", "time", "jogo", "jogador", "campeonato", "flamengo", "corinthians", "palmeiras", "são paulo"] },
  { id: "filosofia", label: "filosofia existencialista", category: "filosofia", keywords: ["filosofia", "sentido", "vida", "existência", "sartre", "camus", "nietzsche"] },
  { id: "musica_indie", label: "música indie", category: "música", keywords: ["música", "musica", "banda", "show", "indie", "rock", "spotify", "playlist"] },
  { id: "gatos", label: "gatos e seus segredos", category: "animais", keywords: ["gato", "gata", "pet", "felino", "miau", "gatinho"] },
  { id: "plantas", label: "cuidar de plantas", category: "natureza", keywords: ["planta", "jardim", "suculenta", "verde", "natureza", "horta"] },
  { id: "cripto", label: "criptomoedas e blockchain", category: "tecnologia", keywords: ["bitcoin", "cripto", "blockchain", "nft", "ethereum", "investimento"] },
  { id: "ia_generativa", label: "IA generativa", category: "tecnologia", keywords: ["ia", "inteligência artificial", "chatgpt", "gpt", "gemini", "claude", "llm", "machine learning"] },
  { id: "culinaria", label: "culinária caseira", category: "gastronomia", keywords: ["receita", "comida", "cozinhar", "almoço", "jantar", "fogão", "panela"] },
  { id: "viagens", label: "viagens improvisadas", category: "lifestyle", keywords: ["viagem", "viajar", "mochilão", "avião", "praia", "turismo"] },
  { id: "games_retro", label: "games retrô", category: "games", keywords: ["game", "jogo", "nintendo", "snes", "playstation", "retro", "pixel", "arcade"] },
  { id: "moda_anos_2000", label: "moda dos anos 2000", category: "moda", keywords: ["moda", "roupa", "estilo", "anos 2000", "y2k", "tendência"] },
];

export const TOPIC_BY_ID: Record<string, TopicEntry> = Object.fromEntries(
  TOPIC_CATALOG.map((t) => [t.id, t])
);

export function findMatchingTopics(content: string, topicIds: string[]): TopicEntry[] {
  if (!content || topicIds.length === 0) return [];
  const normalized = content.toLowerCase();
  return topicIds
    .map((id) => TOPIC_BY_ID[id])
    .filter((t): t is TopicEntry => Boolean(t))
    .filter((t) => t.keywords.some((kw) => normalized.includes(kw.toLowerCase())));
}
