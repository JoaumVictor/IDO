import { SKILLS_CONFIG } from "@/config/skills_config";
import {
  EMPTY_STATUSES,
  STATUS_T1,
  STATUS_T2,
  STATUS_T3,
  getLevelFlavor,
} from "../prompts/status-templates";

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

  const seedSource = `${level}-${top.join("-")}`;
  const seed = hash(seedSource);

  if (top.length === 0) {
    return pick(EMPTY_STATUSES, seed);
  }

  let template: string;
  if (top.length === 1) {
    template = pick(STATUS_T1, seed);
  } else if (top.length === 2) {
    template = pick(STATUS_T2, seed);
  } else {
    template = pick(STATUS_T3, seed);
  }

  const filled = template
    .replace("{a}", top[0])
    .replace("{b}", top[1] ?? "")
    .replace("{c}", top[2] ?? "");

  return `${filled}\n${getLevelFlavor(level)}`;
}
