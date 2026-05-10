"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Sparkles, Network, Lock, Plus } from "lucide-react";
import { SKILLS_CONFIG, SkillNode } from "@/config/skills_config";

interface ProfileData {
  points: number;
  level: number;
}

export default function SkillsTreePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userSkills, setUserSkills] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const fetchFullData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }

    const [profileRes, skillsRes] = await Promise.all([
      supabase.from("profiles").select("points, level").eq("id", authData.user.id).single(),
      supabase.from("ido_user_skills").select("skill_id, current_level").eq("user_id", authData.user.id),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    
    if (skillsRes.data) {
      const skillsMap: Record<string, number> = {};
      skillsRes.data.forEach(s => {
        skillsMap[s.skill_id] = s.current_level;
      });
      setUserSkills(skillsMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFullData();
  }, []);

  const handleUpgrade = async (skillId: string) => {
    if (!profile || profile.points <= 0) return;
    setUpgrading(skillId);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const currentLevel = userSkills[skillId] || 0;
    const newLevel = currentLevel + 1;
    const newPoints = profile.points - 1;

    // Otimista
    setProfile({ ...profile, points: newPoints });
    setUserSkills({ ...userSkills, [skillId]: newLevel });

    // DB: Upsert para não duplicar linha
    await Promise.all([
      supabase.from("profiles").update({ points: newPoints }).eq("id", authData.user.id),
      supabase.from("ido_user_skills").upsert({ 
        user_id: authData.user.id, 
        skill_id: skillId, 
        current_level: newLevel 
      }, { onConflict: 'user_id, skill_id' })
    ]);

    setUpgrading(null);
  };

  const checkRequirements = (node: SkillNode) => {
    if (!profile) return false;
    
    const req = node.requires;
    if (profile.level < req.playerLevel) return false;
    
    if (req.skillId) {
      const requiredSkillLevel = userSkills[req.skillId] || 0;
      if (requiredSkillLevel < (req.skillLevel || 1)) return false;
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const hasPoints = profile !== null && profile.points > 0;
  const tiers = [1, 2, 3, 4, 5];

  return (
    <div className="p-6 flex-1 flex flex-col bg-gray-50 min-h-full pb-24">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            DNA Tree
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Rede Neural IDO
          </p>
        </div>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
          <Network className="w-7 h-7 text-indigo-600" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 mb-8 text-white relative overflow-hidden shadow-lg border border-indigo-800">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Pontos Disponíveis</span>
          <span className="text-7xl font-black tracking-tighter">{profile?.points || 0}</span>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-indigo-100 mt-3 font-bold tracking-wide">
            Player Level {profile?.level || 1}
          </span>
        </div>
      </div>

      {tiers.map(tier => {
        const skillsInTier = Object.values(SKILLS_CONFIG).filter(s => s.tier === tier);
        if (skillsInTier.length === 0) return null;
        
        return (
          <div key={`tier-${tier}`} className="mb-10">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 mb-4 border-b border-gray-200 pb-2">
              Tier {tier}
            </h2>
            <div className="space-y-4">
              {skillsInTier.map(skill => {
                const isUnlocked = checkRequirements(skill);
                const currentLevel = userSkills[skill.id] || 0;
                
                return (
                  <SkillNodeCard 
                    key={skill.id}
                    skill={skill}
                    isUnlocked={isUnlocked}
                    currentLevel={currentLevel}
                    canUpgrade={hasPoints && isUnlocked}
                    isUpgrading={upgrading === skill.id}
                    onUpgrade={() => handleUpgrade(skill.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillNodeCard({ skill, isUnlocked, currentLevel, canUpgrade, isUpgrading, onUpgrade }: any) {
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case "humor": return "bg-emerald-500";
      case "emotion": return "bg-slate-500";
      case "logic": return "bg-blue-500";
      case "critic": return "bg-red-500";
      case "wisdom": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryBg = (cat: string) => {
    switch(cat) {
      case "humor": return "bg-emerald-50 border-emerald-100";
      case "emotion": return "bg-slate-50 border-slate-200";
      case "logic": return "bg-blue-50 border-blue-100";
      case "critic": return "bg-red-50 border-red-100";
      case "wisdom": return "bg-purple-50 border-purple-100";
      default: return "bg-gray-50 border-gray-100";
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-between p-4 rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 opacity-60 grayscale transition-all">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-gray-600 tracking-wide uppercase text-[12px]">{skill.name}</span>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
              Req: Nível {skill.requires.playerLevel} {skill.requires.skillId ? `+ Atributo ${skill.requires.skillId}` : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const catColor = getCategoryColor(skill.category);
  const catBg = getCategoryBg(skill.category);

  return (
    <div className={`flex items-center justify-between p-4 rounded-3xl border shadow-sm transition-all ${catBg}`}>
      <div className="flex-1 pr-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-extrabold text-gray-900 tracking-wide uppercase text-[13px]">{skill.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-black tracking-wide ${catColor}`}>
            NVL {currentLevel}
          </span>
        </div>
        <p className="text-[11px] text-gray-600 font-bold uppercase tracking-wider opacity-70 leading-tight">{skill.description}</p>
      </div>
      
      <button
        onClick={onUpgrade}
        disabled={!canUpgrade || isUpgrading}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ml-1 ${
          canUpgrade 
            ? "bg-white text-indigo-600 shadow-md hover:scale-105 active:scale-95 hover:shadow-lg border border-white" 
            : "bg-gray-100/50 text-gray-400 cursor-not-allowed border border-gray-200"
        }`}
      >
        {isUpgrading ? (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        ) : (
          <Plus className="w-6 h-6" strokeWidth={canUpgrade ? 3 : 2} />
        )}
      </button>
    </div>
  );
}
