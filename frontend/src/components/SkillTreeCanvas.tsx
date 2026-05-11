"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Plus, Minus, Locate } from "lucide-react";
import { SKILLS_CONFIG, SkillNode } from "@/config/skills_config";
import {
  CATEGORY_COLORS,
  MAX_SKILL_LEVEL,
  SkillLayout,
} from "@/lib/skills/layout";

interface Props {
  layout: SkillLayout;
  userSkills: Record<string, number>;
  playerLevel: number;
  onSelect: (skill: SkillNode) => void;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 1.6;
const NODE_SIZE = 64;
const DRAG_THRESHOLD = 5;

export function SkillTreeCanvas({
  layout,
  userSkills,
  playerLevel,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const movedRef = useRef(false);

  useEffect(() => {
    // centraliza inicialmente
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOffset({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const recenter = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setOffset({ x: rect.width / 2, y: rect.height / 2 });
    setScale(0.45);
  };

  const clampScale = (s: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

  const zoomAt = (factor: number, cx?: number, cy?: number) => {
    setScale((prev) => {
      const next = clampScale(prev * factor);
      if (next === prev) return prev;
      if (cx !== undefined && cy !== undefined && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const px = cx - rect.left;
        const py = cy - rect.top;
        setOffset((o) => ({
          x: px - ((px - o.x) * next) / prev,
          y: py - ((py - o.y) * next) / prev,
        }));
      }
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = false;

    if (pointers.current.size === 1) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: offset.x,
        oy: offset.y,
      };
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      pinchStart.current = { dist: Math.hypot(dx, dy), scale };
      dragStart.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1 && dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) movedRef.current = true;
      setOffset({
        x: dragStart.current.ox + dx,
        y: dragStart.current.oy + dy,
      });
    } else if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const next = clampScale((pinchStart.current.scale * dist) / pinchStart.current.dist);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const px = cx - rect.left;
        const py = cy - rect.top;
        setScale((prev) => {
          if (next === prev) return prev;
          setOffset((o) => ({
            x: px - ((px - o.x) * next) / prev,
            y: py - ((py - o.y) * next) / prev,
          }));
          return next;
        });
      }
      movedRef.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragStart.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomAt(factor, e.clientX, e.clientY);
  };

  const handleNodeClick = (skill: SkillNode) => {
    if (movedRef.current) return;
    onSelect(skill);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-zinc-950 touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: dragStart.current ? "grabbing" : "grab" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(244,63,94,0.06) 0%, transparent 50%)",
        }}
      />

      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          willChange: "transform",
        }}
      >
        <svg
          width={layout.bounds.width}
          height={layout.bounds.height}
          viewBox={`${-layout.maxRadius} ${-layout.maxRadius} ${layout.bounds.width} ${layout.bounds.height}`}
          className="absolute pointer-events-none"
          style={{
            left: -layout.maxRadius,
            top: -layout.maxRadius,
          }}
        >
          {layout.tierRadius.slice(1).map((r, i) => (
            <circle
              key={i}
              cx={0}
              cy={0}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          ))}

          {layout.connections.map((conn) => {
            const parent = layout.positions[conn.parentId];
            const child = layout.positions[conn.childId];
            if (!parent || !child) return null;
            const childSkill = SKILLS_CONFIG[conn.childId];
            const parentLevel = userSkills[conn.parentId] || 0;
            const reqLevel = childSkill.requires.skillLevel || 0;
            const active = parentLevel >= reqLevel && playerLevel >= childSkill.requires.playerLevel;
            const color = CATEGORY_COLORS[childSkill.category].stroke;
            return (
              <line
                key={`${conn.parentId}-${conn.childId}`}
                x1={parent.x}
                y1={parent.y}
                x2={child.x}
                y2={child.y}
                stroke={active ? color : "rgba(255,255,255,0.07)"}
                strokeWidth={active ? 2.5 : 1.5}
                opacity={active ? 0.7 : 1}
                strokeLinecap="round"
              />
            );
          })}

          <circle
            cx={0}
            cy={0}
            r={70}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={2}
          />
          <circle cx={0} cy={0} r={6} fill="rgba(255,255,255,0.4)" />
        </svg>

        {Object.values(SKILLS_CONFIG).map((skill) => {
          const pos = layout.positions[skill.id];
          if (!pos) return null;
          const currentLevel = userSkills[skill.id] || 0;
          const levelOk = playerLevel >= skill.requires.playerLevel;
          const parentOk =
            !skill.requires.skillId ||
            (userSkills[skill.requires.skillId] || 0) >=
              (skill.requires.skillLevel || 0);
          const isUnlocked = levelOk && parentOk;
          const isLearned = currentLevel > 0;
          const colors = CATEGORY_COLORS[skill.category];

          return (
            <button
              key={skill.id}
              onClick={() => handleNodeClick(skill)}
              className="absolute rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{
                left: pos.x - NODE_SIZE / 2,
                top: pos.y - NODE_SIZE / 2,
                width: NODE_SIZE,
                height: NODE_SIZE,
                borderWidth: 3,
                borderStyle: "solid",
                borderColor: isUnlocked ? colors.stroke : "rgba(255,255,255,0.1)",
                background: isLearned
                  ? colors.fill
                  : isUnlocked
                    ? "rgba(0,0,0,0.6)"
                    : "rgba(20,20,23,0.85)",
                boxShadow: isLearned
                  ? `0 0 28px ${colors.glow}`
                  : isUnlocked
                    ? `0 0 12px ${colors.glow}`
                    : "none",
                opacity: isUnlocked ? 1 : 0.55,
                color: isUnlocked ? colors.text : "#52525b",
              }}
            >
              {!isUnlocked && <Lock className="w-5 h-5" />}
              {isUnlocked && (
                <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight px-1">
                  {skill.name.split(" ")[0]}
                </span>
              )}
              {isLearned && (
                <span
                  className="absolute -bottom-2 -right-1 text-[10px] font-black px-1.5 rounded-full text-black"
                  style={{ background: colors.stroke }}
                >
                  {currentLevel}/{MAX_SKILL_LEVEL}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => zoomAt(1.2)}
          className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shadow-lg hover:bg-zinc-800 active:scale-95 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => zoomAt(0.83)}
          className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shadow-lg hover:bg-zinc-800 active:scale-95 transition"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={recenter}
          className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shadow-lg hover:bg-zinc-800 active:scale-95 transition"
        >
          <Locate className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
