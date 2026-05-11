import { SKILLS_CONFIG, SkillNode } from "@/config/skills_config";

export type SkillCategory = SkillNode["category"];

export interface SkillPosition {
  x: number;
  y: number;
  angle: number;
  rootCategory: SkillCategory;
}

export interface SkillConnection {
  parentId: string;
  childId: string;
}

export interface SkillLayout {
  positions: Record<string, SkillPosition>;
  connections: SkillConnection[];
  bounds: { width: number; height: number };
  tierRadius: number[];
  maxRadius: number;
}

export const MAX_SKILL_LEVEL = 10;

const TIER_RADIUS = [0, 260, 500, 760, 1040, 1340];

const TRUNK_ANGLES: Record<string, number> = {
  humor: -Math.PI / 2,
  emotion: 0,
  logic: Math.PI / 2,
  critic: Math.PI,
};

const ROOT_TIER1_BY_CATEGORY: Record<string, string> = {
  humor: "bobo",
  emotion: "emotivo",
  logic: "curioso",
  critic: "reclamao",
};

const HALF_ARC = Math.PI / 4;

function childrenOf(parentId: string): SkillNode[] {
  return Object.values(SKILLS_CONFIG).filter(
    (s) => s.requires.skillId === parentId
  );
}

function place(
  skill: SkillNode,
  angle: number,
  halfArc: number,
  rootCategory: SkillCategory,
  positions: Record<string, SkillPosition>
) {
  const r = TIER_RADIUS[skill.tier];
  positions[skill.id] = {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    angle,
    rootCategory,
  };

  const children = childrenOf(skill.id);
  if (children.length === 0) return;

  if (children.length === 1) {
    place(children[0], angle, halfArc * 0.6, rootCategory, positions);
    return;
  }

  const childArc = halfArc * 0.85;
  const step = (childArc * 2) / (children.length - 1);
  children.forEach((child, i) => {
    const childAngle = angle - childArc + step * i;
    place(child, childAngle, halfArc * 0.5, rootCategory, positions);
  });
}

export function computeSkillLayout(): SkillLayout {
  const positions: Record<string, SkillPosition> = {};
  const connections: SkillConnection[] = [];

  Object.keys(ROOT_TIER1_BY_CATEGORY).forEach((category) => {
    const rootId = ROOT_TIER1_BY_CATEGORY[category];
    const root = SKILLS_CONFIG[rootId];
    place(
      root,
      TRUNK_ANGLES[category],
      HALF_ARC,
      category as SkillCategory,
      positions
    );
  });

  Object.values(SKILLS_CONFIG).forEach((skill) => {
    if (skill.requires.skillId && positions[skill.requires.skillId]) {
      connections.push({
        parentId: skill.requires.skillId,
        childId: skill.id,
      });
    }
  });

  const maxRadius = TIER_RADIUS[TIER_RADIUS.length - 1] + 120;
  return {
    positions,
    connections,
    bounds: { width: maxRadius * 2, height: maxRadius * 2 },
    tierRadius: TIER_RADIUS,
    maxRadius,
  };
}

export function childrenSkillsOf(skillId: string): SkillNode[] {
  return childrenOf(skillId);
}

export const CATEGORY_COLORS: Record<SkillCategory, { stroke: string; fill: string; glow: string; text: string }> = {
  humor:   { stroke: "#10b981", fill: "#064e3b", glow: "rgba(16,185,129,0.35)", text: "#6ee7b7" },
  emotion: { stroke: "#f43f5e", fill: "#4c0519", glow: "rgba(244,63,94,0.35)",  text: "#fda4af" },
  logic:   { stroke: "#3b82f6", fill: "#1e3a8a", glow: "rgba(59,130,246,0.35)", text: "#93c5fd" },
  critic:  { stroke: "#ef4444", fill: "#450a0a", glow: "rgba(239,68,68,0.35)",  text: "#fca5a5" },
  wisdom:  { stroke: "#a855f7", fill: "#3b0764", glow: "rgba(168,85,247,0.35)", text: "#d8b4fe" },
};
