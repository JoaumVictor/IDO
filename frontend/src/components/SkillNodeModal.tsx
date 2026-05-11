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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="neo-raised w-full max-w-sm rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative p-6 pb-5"
          style={{
            background: `linear-gradient(180deg, ${colors.fill} 0%, transparent 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="neo-raised-xs absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-white transition"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div
              className="neo-pressed-sm w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                boxShadow: `inset 4px 4px 8px #0a1015, inset -4px -4px 8px #243240, 0 0 24px ${colors.glow}`,
              }}
            >
              {isUnlocked ? (
                <Sparkles
                  className="w-7 h-7"
                  style={{ color: colors.stroke }}
                  strokeWidth={2.5}
                />
              ) : (
                <Lock className="w-5 h-5 text-text-muted" strokeWidth={2.5} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] font-display font-black uppercase tracking-widest"
                style={{ color: colors.text }}
              >
                {skill.category} · Tier {skill.tier}
              </p>
              <h2 className="font-display text-xl font-black text-white tracking-tight truncate mt-0.5">
                {skill.name}
              </h2>
            </div>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            {skill.description}
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-display font-black uppercase tracking-widest text-text-muted">
              Nível
            </span>
            <span className="text-xs font-display font-black text-white">
              {currentLevel} <span className="text-text-muted">/ {MAX_SKILL_LEVEL}</span>
            </span>
          </div>
          <div className="neo-pressed-sm h-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(currentLevel / MAX_SKILL_LEVEL) * 100}%`,
                background: colors.stroke,
                boxShadow: `0 0 12px ${colors.glow}`,
              }}
            />
          </div>
        </div>

        {!isUnlocked && (
          <div className="px-6 pb-5">
            <div className="neo-pressed-sm rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-display font-black uppercase tracking-widest text-text-muted mb-2">
                Requisitos
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className={levelOk ? "text-accent font-black" : "text-text-muted"}>
                  {levelOk ? "✓" : "✗"}
                </span>
                <span className="text-text-secondary">
                  Player Level {skill.requires.playerLevel}
                  <span className="text-text-muted"> (você está no {playerLevel})</span>
                </span>
              </div>
              {skill.requires.skillId && (
                <div className="flex items-center gap-2 text-xs">
                  <span className={parentOk ? "text-accent font-black" : "text-text-muted"}>
                    {parentOk ? "✓" : "✗"}
                  </span>
                  <span className="text-text-secondary">
                    {SKILLS_CONFIG[skill.requires.skillId]?.name} Nv{" "}
                    {skill.requires.skillLevel}
                    <span className="text-text-muted">
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
          <div className="px-6 pb-5">
            <p className="text-[10px] font-display font-black uppercase tracking-widest text-text-muted mb-3">
              Desbloqueia
            </p>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => {
                const cColors = CATEGORY_COLORS[c.category];
                return (
                  <span
                    key={c.id}
                    className="text-[10px] font-display font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                    style={{
                      color: cColors.text,
                      background: cColors.fill,
                      boxShadow: `inset 2px 2px 4px #0a1015, inset -2px -2px 4px #243240`,
                    }}
                  >
                    {c.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-5 pb-5">
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade || isUpgrading}
            className="w-full h-13 rounded-full flex items-center justify-center gap-2 font-display font-black uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              background: canUpgrade ? colors.stroke : "#243240",
              color: canUpgrade ? "#0a1015" : "#6b7a8f",
              boxShadow: canUpgrade
                ? `0 0 24px ${colors.glow}, 0 0 48px ${colors.glow}`
                : "inset 4px 4px 8px #0a1015, inset -4px -4px 8px #243240",
              padding: "14px 20px",
            }}
          >
            {isUpgrading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isMaxed ? (
              <>Máximo atingido</>
            ) : !isUnlocked ? (
              <>
                <Lock className="w-4 h-4" strokeWidth={2.5} /> Bloqueado
              </>
            ) : !hasPoints ? (
              <>
                <Zap className="w-4 h-4" strokeWidth={2.5} /> Sem pontos
              </>
            ) : (
              <>
                <ArrowUpCircle className="w-5 h-5" strokeWidth={2.5} /> Evoluir (-1 pt)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
