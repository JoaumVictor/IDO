"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import { SkillNode } from "@/config/skills_config";
import { computeSkillLayout, MAX_SKILL_LEVEL } from "@/lib/skills/layout";
import { SkillTreeCanvas } from "@/components/SkillTreeCanvas";
import { SkillNodeModal } from "@/components/SkillNodeModal";

interface ProfileData {
  points: number;
  level: number;
}

export default function SkillsTreePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userSkills, setUserSkills] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [selected, setSelected] = useState<SkillNode | null>(null);

  const layout = useMemo(() => computeSkillLayout(), []);

  useEffect(() => {
    const fetchFullData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }

      const [profileRes, skillsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("points, level")
          .eq("id", authData.user.id)
          .single(),
        supabase
          .from("ido_user_skills")
          .select("skill_id, current_level")
          .eq("user_id", authData.user.id),
      ]);

      if (profileRes.data) setProfile(profileRes.data);

      if (skillsRes.data) {
        const skillsMap: Record<string, number> = {};
        skillsRes.data.forEach((s) => {
          skillsMap[s.skill_id] = s.current_level;
        });
        setUserSkills(skillsMap);
      }

      setLoading(false);
    };

    fetchFullData();
  }, []);

  const handleUpgrade = async (skill: SkillNode) => {
    if (!profile || profile.points <= 0) return;
    const currentLevel = userSkills[skill.id] || 0;
    if (currentLevel >= MAX_SKILL_LEVEL) return;

    setUpgrading(skill.id);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setUpgrading(null);
      return;
    }

    const newLevel = currentLevel + 1;
    const newPoints = profile.points - 1;

    setProfile({ ...profile, points: newPoints });
    setUserSkills({ ...userSkills, [skill.id]: newLevel });

    await Promise.all([
      supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", authData.user.id),
      supabase.from("ido_user_skills").upsert(
        {
          user_id: authData.user.id,
          skill_id: skill.id,
          current_level: newLevel,
        },
        { onConflict: "user_id, skill_id" }
      ),
    ]);

    setUpgrading(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 min-h-full">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bottom-16 bg-zinc-950">
      <SkillTreeCanvas
        layout={layout}
        userSkills={userSkills}
        playerLevel={profile?.level || 1}
        onSelect={(s) => setSelected(s)}
      />

      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 z-10 pointer-events-none">
        <div className="pointer-events-auto rounded-2xl bg-zinc-900/85 backdrop-blur border border-zinc-800 px-4 py-2.5 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">
            DNA Tree
          </p>
          <p className="text-base font-black text-white tracking-tight mt-0.5">
            Rede Neural IDO
          </p>
        </div>

        <div className="pointer-events-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 border border-indigo-400/30 px-4 py-2.5 shadow-xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white" />
          <div className="text-right leading-none">
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">
              Pontos
            </p>
            <p className="text-2xl font-black text-white tracking-tight mt-0.5">
              {profile?.points ?? 0}
            </p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-left leading-none">
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">
              Level
            </p>
            <p className="text-2xl font-black text-white tracking-tight mt-0.5">
              {profile?.level ?? 1}
            </p>
          </div>
        </div>
      </div>

      {selected && (
        <SkillNodeModal
          skill={selected}
          currentLevel={userSkills[selected.id] || 0}
          playerLevel={profile?.level || 1}
          points={profile?.points || 0}
          userSkills={userSkills}
          isUpgrading={upgrading === selected.id}
          onUpgrade={() => handleUpgrade(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
