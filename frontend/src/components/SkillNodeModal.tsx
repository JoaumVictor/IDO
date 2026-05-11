"use client";

import { X, Lock, Zap, ArrowUpCircle, Loader2, Sparkles } from "lucide-react";
import { SKILLS_CONFIG, SkillNode } from "@/config/skills_config";
import {
  CATEGORY_COLORS,
  MAX_SKILL_LEVEL,
  childrenSkillsOf,
} from "@/lib/skills/layout";

interface Props {
  skill: SkillNode;
  currentLevel: number;
  playerLevel: number;
  points: number;
  userSkills: Record<string, number>;
  isUpgrading: boolean;
  onUpgrade: () => void;
  onClose: () => void;
}

export function SkillNodeModal({
  skill,
  currentLevel,
  playerLevel,
  points,
  userSkills,
  isUpgrading,
  onUpgrade,
  onClose,
}: Props) {
  const colors = CATEGORY_COLORS[skill.category];
  const isMaxed = currentLevel >= MAX_SKILL_LEVEL;
  const levelOk = playerLevel >= skill.requires.playerLevel;
  const parentOk =
    !skill.requires.skillId ||
    (userSkills[skill.requires.skillId] || 0) >= (skill.requires.skillLevel || 0);
  const isUnlocked = levelOk && parentOk;
  const hasPoints = points > 0;
  const canUpgrade = isUnlocked && hasPoints && !isMaxed;

  const children = childrenSkillsOf(skill.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border bg-zinc-950 shadow-2xl overflow-hidden"
        style={{ borderColor: colors.stroke }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative p-5 pb-4"
          style={{
            background: `linear-gradient(180deg, ${colors.fill} 0%, transparent 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/60 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border-2"
              style={{
                borderColor: colors.stroke,
                background: colors.fill,
                boxShadow: `0 0 24px ${colors.glow}`,
              }}
            >
              {isUnlocked ? (
                <Sparkles className="w-6 h-6" style={{ color: colors.stroke }} />
              ) : (
                <Lock className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {skill.category} · Tier {skill.tier}
              </p>
              <h2 className="text-xl font-black text-white tracking-tight truncate">
                {skill.name}
              </h2>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-snug">
            {skill.description}
          </p>
        </div>

        <div className="px-5 py-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Nível
            </span>
            <span className="text-xs font-bold text-zinc-300">
              {currentLevel} / {MAX_SKILL_LEVEL}
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${(currentLevel / MAX_SKILL_LEVEL) * 100}%`,
                background: colors.stroke,
                boxShadow: `0 0 10px ${colors.glow}`,
              }}
            />
          </div>
        </div>

        {!isUnlocked && (
          <div className="px-5 pb-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                Requisitos
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className={levelOk ? "text-emerald-400" : "text-zinc-500"}>
                  {levelOk ? "✓" : "✗"}
                </span>
                <span className="text-zinc-300">
                  Player Level {skill.requires.playerLevel}
                  <span className="text-zinc-500"> (você está no {playerLevel})</span>
                </span>
              </div>
              {skill.requires.skillId && (
                <div className="flex items-center gap-2 text-xs">
                  <span className={parentOk ? "text-emerald-400" : "text-zinc-500"}>
                    {parentOk ? "✓" : "✗"}
                  </span>
                  <span className="text-zinc-300">
                    {SKILLS_CONFIG[skill.requires.skillId]?.name} Nv{" "}
                    {skill.requires.skillLevel}
                    <span className="text-zinc-500">
                      {" "}
                      (atual {userSkills[skill.requires.skillId] || 0})
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {children.length > 0 && (
          <div className="px-5 pb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
              Desbloqueia
            </p>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => {
                const cColors = CATEGORY_COLORS[c.category];
                return (
                  <span
                    key={c.id}
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border"
                    style={{
                      color: cColors.text,
                      borderColor: cColors.stroke,
                      background: cColors.fill,
                    }}
                  >
                    {c.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 pt-2">
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade || isUpgrading}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canUpgrade ? colors.stroke : "#27272a",
              color: canUpgrade ? "#0a0a0a" : "#71717a",
              boxShadow: canUpgrade ? `0 0 24px ${colors.glow}` : "none",
            }}
          >
            {isUpgrading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isMaxed ? (
              <>Máximo atingido</>
            ) : !isUnlocked ? (
              <>
                <Lock className="w-4 h-4" /> Bloqueado
              </>
            ) : !hasPoints ? (
              <>
                <Zap className="w-4 h-4" /> Sem pontos
              </>
            ) : (
              <>
                <ArrowUpCircle className="w-5 h-5" /> Evoluir (-1 pt)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
