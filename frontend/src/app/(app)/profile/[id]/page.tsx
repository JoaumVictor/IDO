"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";
import { IDOAvatar } from "@/components/IDOAvatar";
import { IDOCommentsList } from "@/components/IDOCommentsList";
import { useParams } from "next/navigation";

interface ProfileData {
  id: string;
  level: number;
}

interface TopSkill {
  name: string;
  level: number;
}

export default function PublicProfilePage() {
  const { id } = useParams() as { id: string };
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      if (!id) return;

      const [profileRes, skillsRes] = await Promise.all([
        supabase.from("profiles").select("id, level").eq("id", id).single(),
        supabase
          .from("ido_user_skills")
          .select("skill_id, current_level")
          .eq("user_id", id)
          .order("current_level", { ascending: false })
          .limit(4),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (skillsRes.data) {
        setTopSkills(
          skillsRes.data.map((s) => ({
            name: s.skill_id.replace("_", " "),
            level: s.current_level,
          }))
        );
      }

      setLoading(false);
    };

    fetchPublicData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas min-h-full">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-canvas min-h-full">
        <ShieldAlert className="w-12 h-12 text-text-muted mb-2" />
        <h2 className="font-display text-xl font-black text-white">IDO não encontrado</h2>
        <p className="text-sm text-text-secondary">Este perfil não existe ou é privado.</p>
      </div>
    );
  }

  const getConsciousnessLabel = (level: number) => {
    if (level <= 10) return "Criança";
    if (level <= 20) return "Pré-Adolescente";
    if (level <= 30) return "Adolescente";
    if (level <= 40) return "Jovem Adulto";
    if (level <= 50) return "Adulto";
    return "Sábio";
  };

  return (
    <div className="p-6 flex-1 flex flex-col bg-canvas min-h-full pb-32 pt-20">
      <div className="neo-raised rounded-3xl p-7 flex flex-col items-center mb-10 relative mt-14">
        <div className="absolute -top-14">
          <div className="neo-raised p-2 rounded-full">
            <IDOAvatar size={88} priority />
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center w-full">
          <h1 className="font-display text-2xl font-black text-white tracking-tight text-center">
            IDO Alpha
          </h1>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="neo-pressed-sm font-display text-accent px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
              Nível {profile.level}
            </span>
            <span className="neo-pressed-sm font-display text-gold px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
              {getConsciousnessLabel(profile.level)}
            </span>
          </div>
          <p className="text-xs text-text-muted font-mono mt-5 truncate w-full text-center px-4">
            #{profile.id.split("-")[0]}
          </p>
        </div>
      </div>

      <h2 className="font-display text-xs font-black text-text-secondary uppercase tracking-widest px-2 mb-5">
        DNA Público Dominante
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {topSkills.map((skill, i) => (
          <StatBox key={i} label={skill.name} value={skill.level} />
        ))}
        {topSkills.length === 0 && (
          <div className="neo-pressed-sm col-span-2 p-7 rounded-3xl text-center text-text-muted font-display font-bold text-xs">
            Este IDO ainda não desenvolveu nenhuma habilidade.
          </div>
        )}
      </div>

      <div className="neo-pressed-sm mt-8 rounded-2xl p-5 flex items-center justify-center text-center">
        <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest">
          Energia e XP são privados
        </span>
      </div>

      <IDOCommentsList userId={profile.id} />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="neo-raised-sm rounded-3xl p-6 flex flex-col justify-center items-center gap-2">
      <span className="font-display text-4xl font-black tracking-tighter text-accent">
        {value}
      </span>
      <span className="text-[10px] font-display font-black uppercase tracking-widest text-text-secondary">
        {label}
      </span>
    </div>
  );
}
