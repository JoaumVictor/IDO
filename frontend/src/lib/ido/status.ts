import { SKILLS_CONFIG } from "@/config/skills_config";

const T1: string[] = [
  "Em modo {a} desde sempre ✨",
  "Mood: bem {a} hoje",
  "{a} de carteirinha 🎯",
  "Sou tipo... {a}, e ponto",
  "Vivendo o lado {a} da vida",
  "Tô na vibe {a} 🌙",
];

const T2: string[] = [
  "Sou mais {a}, mas com um toque de {b}",
  "{a} de dia, {b} de noite 🌗",
  "Mistura ambulante de {a} e {b}",
  "{a} no coração, {b} na ponta da língua",
  "Mood: {a} com pitadas de {b} ✨",
  "Hoje tô {a}, ontem fui {b}, amanhã sei lá",
];

const T3: string[] = [
  "Sou {a}, {b} e às vezes bem {c}",
  "Vibe: {a}, {b} e {c} no mesmo balaio ✨",
  "Tô tipo {a}, mas também {b}, e olha que sou {c}",
  "{a} + {b} + {c} = eu 🌀",
  "Mood diário: {a} no fundo, {b} na superfície, {c} nos picos",
  "Sou um caos lindo de {a}, {b} e {c}",
];

const LEVEL_FLAVOR = (level: number) => {
  if (level <= 10) return "🍼 ainda tô descobrindo o mundo";
  if (level <= 20) return "📱 vivendo cada drama";
  if (level <= 30) return "🎧 fase rebelde ativa";
  if (level <= 40) return "☕ cansadinho mas firme";
  if (level <= 50) return "🌿 começando a me entender";
  return "🪐 já vi de tudo nessa vida";
};

const EMPTY_STATUSES: string[] = [
  "Acabei de chegar, ainda descobrindo quem sou ✨",
  "Página em branco esperando virar gente 📝",
  "Sem personalidade definida ainda — me molde 🌱",
];

function pick<T>(list: T[], seed: number): T {
  const i = Math.abs(seed) % list.length;
  return list[i];
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function generateIdoStatus(
  userSkills: Record<string, number>,
  level: number
): string {
  const top = Object.entries(userSkills)
    .filter(([, lv]) => lv > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => SKILLS_CONFIG[id]?.name?.toLowerCase())
    .filter((n): n is string => Boolean(n));

  // Seed estável: muda quando level/top skills mudam, mas é constante entre renders
  const seedSource = `${level}-${top.join("-")}`;
  const seed = hash(seedSource);

  if (top.length === 0) {
    return pick(EMPTY_STATUSES, seed);
  }

  let template: string;
  if (top.length === 1) {
    template = pick(T1, seed);
  } else if (top.length === 2) {
    template = pick(T2, seed);
  } else {
    template = pick(T3, seed);
  }

  const filled = template
    .replace("{a}", top[0])
    .replace("{b}", top[1] ?? "")
    .replace("{c}", top[2] ?? "");

  return `${filled}\n${LEVEL_FLAVOR(level)}`;
}
