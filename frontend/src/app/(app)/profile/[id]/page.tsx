"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, BrainCircuit, ShieldAlert } from "lucide-react";
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
        supabase.from("ido_user_skills")
                .select("skill_id, current_level")
                .eq("user_id", id)
                .order("current_level", { ascending: false })
                .limit(4),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (skillsRes.data) {
        setTopSkills(
          skillsRes.data.map(s => ({ 
            name: s.skill_id.replace("_", " "), 
            level: s.current_level 
          }))
        );
      }

      setLoading(false);
    };

    fetchPublicData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-full">
        <ShieldAlert className="w-12 h-12 text-gray-300 mb-2" />
        <h2 className="text-xl font-bold text-gray-800">IDO não encontrado</h2>
        <p className="text-sm text-gray-500">Este perfil não existe ou é privado.</p>
      </div>
    );
  }

  // Descobrindo Nivel de Consciencia
  const getConsciousnessLabel = (level: number) => {
    if (level <= 10) return "Criança";
    if (level <= 20) return "Pré-Adolescente";
    if (level <= 30) return "Adolescente";
    if (level <= 40) return "Jovem Adulto";
    if (level <= 50) return "Adulto";
    return "Sábio";
  };

  return (
    <div className="p-6 flex-1 flex flex-col bg-gray-50 min-h-full pb-24 pt-16">
      {/* Header Público */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-8 relative mt-10">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner border-4 border-gray-50 absolute -top-12">
          <BrainCircuit className="w-10 h-10 text-indigo-600" />
        </div>
        <div className="mt-12 flex flex-col items-center w-full">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight text-center">
            IDO Alpha
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              Nível {profile.level}
            </span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              {getConsciousnessLabel(profile.level)}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-4 truncate w-full text-center px-4">
            #{profile.id.split("-")[0]}
          </p>
        </div>
      </div>

      <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 mb-4">DNA Público Dominante</h2>
      <div className="grid grid-cols-2 gap-4">
        {topSkills.map((skill, i) => (
          <StatBox 
            key={i}
            label={skill.name} 
            value={skill.level} 
            color="bg-indigo-50 text-indigo-700 border-indigo-100" 
          />
        ))}
        {topSkills.length === 0 && (
          <div className="col-span-2 p-6 bg-gray-50 border border-dashed rounded-3xl text-center text-gray-400 font-bold text-xs">
            Este IDO ainda não desenvolveu nenhuma habilidade.
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-gray-100 rounded-2xl p-4 flex items-center justify-center text-center">
         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           Energia e XP são privados
         </span>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className={`rounded-3xl p-5 border flex flex-col justify-center items-center gap-2 shadow-sm ${color}`}>
      <span className="text-4xl font-black tracking-tighter">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
    </div>
  );
}
