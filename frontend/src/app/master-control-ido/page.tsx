"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Loader2,
  ShieldAlert,
  Zap,
  RefreshCw,
  Crown,
  Search,
  X,
  Save,
  Sparkles,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Award,
} from "lucide-react";

interface AdminProfile {
  id: string;
  email: string;
  level: number;
  xp: number;
  energy: number;
  points: number;
  is_admin: boolean;
}

type AccessState = "checking" | "denied" | "granted";

export default function MasterControlPage() {
  const [access, setAccess] = useState<AccessState>("checking");
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProfile | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setAccess("denied");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", authData.user.id)
        .single();

      if (!profile?.is_admin) {
        setAccess("denied");
        return;
      }

      setAccess("granted");
      await loadProfiles();
    };

    verifyAdmin();
  }, []);

  const loadProfiles = async () => {
    setLoadingList(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, level, xp, energy, points, is_admin")
      .order("level", { ascending: false });

    if (data) setProfiles(data as AdminProfile[]);
    setLoadingList(false);
  };

  const flash = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleGlobalReset = async () => {
    if (resetting) return;
    const confirmed = window.confirm(
      "Tem certeza que quer RESETAR a energia de TODOS os perfis para 3?"
    );
    if (!confirmed) return;

    setResetting(true);
    setFeedback(null);

    const { data, error } = await supabase.rpc("reset_global_energy");

    if (error) {
      flash("error", error.message || "Falha ao resetar energia.");
    } else {
      flash("success", `Energia resetada em ${data ?? 0} perfis.`);
      await loadProfiles();
    }
    setResetting(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => p.email.toLowerCase().includes(q));
  }, [profiles, search]);

  if (access === "checking") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-black text-gray-100 tracking-tight">Acesso negado</h1>
        <p className="text-sm text-gray-400 font-medium mt-2">
          Esta área é restrita ao mestre do jogo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6 text-gray-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">God Panel</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              IDO Master Control
            </p>
          </div>
        </div>
        <button
          onClick={loadProfiles}
          disabled={loadingList}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-xs font-bold uppercase tracking-wider hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
          Recarregar
        </button>
      </header>

      {feedback && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-xs font-bold border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <section className="bg-gradient-to-br from-red-900/40 to-red-950 border border-red-800/50 rounded-3xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-red-400 fill-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-red-100 tracking-tight">
              Resetar Energia Global
            </h2>
            <p className="text-sm text-red-200/70 font-medium mt-1">
              Restaura a energia de TODOS os IDOs para 3. Use entre rounds de teste.
            </p>
          </div>
        </div>
        <button
          onClick={handleGlobalReset}
          disabled={resetting}
          className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-white text-sm font-black tracking-wider uppercase rounded-2xl hover:bg-red-400 transition-all disabled:bg-red-900 disabled:cursor-not-allowed active:scale-[0.99] shadow-lg shadow-red-500/30"
        >
          {resetting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              Acionar Reset Global
            </>
          )}
        </button>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 px-1 gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 shrink-0">
            Testadores Alfa ({filtered.length})
          </h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-full pl-8 pr-3 py-2 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-gray-900"
            />
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl overflow-hidden">
          {loadingList ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500 font-bold">
              {search ? "Nenhum perfil bate com a busca." : "Nenhum perfil encontrado."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 border-b border-gray-800">
                  <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <th className="px-5 py-3">Email</th>
                    <th className="px-3 py-3">Nv</th>
                    <th className="px-3 py-3">XP</th>
                    <th className="px-3 py-3">⚡</th>
                    <th className="px-3 py-3">Pts</th>
                    <th className="px-3 py-3">Adm</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setEditing(p)}
                      className="border-b border-gray-800/60 last:border-0 hover:bg-gray-900/80 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 font-medium text-gray-200 truncate max-w-65">
                        {p.email}
                      </td>
                      <td className="px-3 py-4">
                        <span className="font-black text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full text-xs">
                          {p.level}
                        </span>
                      </td>
                      <td className="px-3 py-4 font-bold text-gray-300">{p.xp}</td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 font-black text-yellow-300">
                          <Zap className="w-3.5 h-3.5 fill-yellow-300" />
                          {p.energy}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 font-black text-purple-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          {p.points}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {p.is_admin ? (
                          <Crown className="w-4 h-4 text-amber-400" />
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {editing && (
        <EditProfileModal
          profile={editing}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => {
            await loadProfiles();
            setEditing(null);
            flash("success", msg);
          }}
          onError={(msg) => flash("error", msg)}
        />
      )}
    </div>
  );
}

interface EditProps {
  profile: AdminProfile;
  onClose: () => void;
  onSaved: (msg: string) => Promise<void> | void;
  onError: (msg: string) => void;
}

function EditProfileModal({ profile, onClose, onSaved, onError }: EditProps) {
  const [level, setLevel] = useState(profile.level);
  const [xp, setXp] = useState(profile.xp);
  const [energy, setEnergy] = useState(profile.energy);
  const [points, setPoints] = useState(profile.points);
  const [isAdmin, setIsAdmin] = useState(profile.is_admin);
  const [busy, setBusy] = useState<null | string>(null);

  const dirty =
    level !== profile.level ||
    xp !== profile.xp ||
    energy !== profile.energy ||
    points !== profile.points ||
    isAdmin !== profile.is_admin;

  const handleSave = async () => {
    setBusy("save");
    try {
      if (
        level !== profile.level ||
        xp !== profile.xp ||
        energy !== profile.energy ||
        points !== profile.points
      ) {
        const { error } = await supabase.rpc("admin_update_profile", {
          target_user_id: profile.id,
          new_level: level,
          new_xp: xp,
          new_energy: energy,
          new_points: points,
        });
        if (error) throw error;
      }

      if (isAdmin !== profile.is_admin) {
        const { error } = await supabase.rpc("admin_set_admin", {
          target_user_id: profile.id,
          value: isAdmin,
        });
        if (error) throw error;
      }

      await onSaved("Perfil atualizado.");
    } catch (e: any) {
      onError(e.message || "Falha ao salvar.");
    } finally {
      setBusy(null);
    }
  };

  const handleResetSkills = async () => {
    const refund = window.confirm(
      "OK = devolver os pontos gastos | Cancelar = só zerar sem devolver"
    );
    setBusy("reset");
    try {
      const { data, error } = await supabase.rpc("admin_reset_user_skills", {
        target_user_id: profile.id,
        refund_points: refund,
      });
      if (error) throw error;
      await onSaved(
        refund
          ? `Skills zeradas. ${data ?? 0} pontos devolvidos.`
          : `Skills zeradas (${data ?? 0} níveis apagados).`
      );
    } catch (e: any) {
      onError(e.message || "Falha ao resetar skills.");
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `APAGAR o perfil de ${profile.email}? Isso remove posts, interactions e skills. (auth.users segue existindo)`
      )
    )
      return;
    setBusy("delete");
    try {
      const { error } = await supabase.rpc("admin_delete_profile", {
        target_user_id: profile.id,
      });
      if (error) throw error;
      await onSaved("Perfil apagado.");
    } catch (e: any) {
      onError(e.message || "Falha ao apagar.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Editar perfil
            </p>
            <h2 className="text-base font-black text-white tracking-tight truncate mt-0.5">
              {profile.email}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Nível" icon={<Award className="w-3.5 h-3.5" />} value={level} onChange={setLevel} />
            <NumberField label="XP" icon={<Sparkles className="w-3.5 h-3.5" />} value={xp} onChange={setXp} />
            <NumberField label="Energia" icon={<Zap className="w-3.5 h-3.5 fill-current" />} value={energy} onChange={setEnergy} />
            <NumberField label="Pontos" icon={<Sparkles className="w-3.5 h-3.5" />} value={points} onChange={setPoints} />
          </div>

          <label className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-2xl p-3 cursor-pointer">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              ) : (
                <ShieldOff className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-bold text-gray-200">Admin</span>
            </div>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
          </label>

          <button
            onClick={handleSave}
            disabled={!dirty || busy !== null}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-emerald-500 text-emerald-950 text-sm font-black tracking-wider uppercase hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition active:scale-[0.99]"
          >
            {busy === "save" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar alterações
              </>
            )}
          </button>
        </div>

        <div className="px-5 pb-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Zona de risco
          </p>
          <div className="space-y-2">
            <button
              onClick={handleResetSkills}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black tracking-wider uppercase hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {busy === "reset" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resetar skills
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-black tracking-wider uppercase hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {busy === "delete" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Apagar perfil
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 mb-1.5">
        {icon} {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50"
      />
    </label>
  );
}
