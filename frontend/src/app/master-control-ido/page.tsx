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
  PenSquare,
  Send,
  Dices,
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
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProfile | null>(null);
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  const POST_MAX_CHARS = 500;

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

  const handleCreatePost = async () => {
    const trimmed = postContent.trim();
    if (!trimmed || posting) return;

    setPosting(true);
    setFeedback(null);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      flash("error", "Sessão expirada. Faça login de novo.");
      setPosting(false);
      return;
    }

    const { error } = await supabase.from("posts").insert({
      content: trimmed,
      author_id: authData.user.id,
    });

    if (error) {
      flash("error", error.message || "Falha ao publicar.");
    } else {
      flash("success", "Post publicado no feed.");
      setPostContent("");
    }
    setPosting(false);
  };

  const handleGlobalReset = async () => {
    if (resetting) return;
    const confirmed = window.confirm(
      "Tem certeza que quer RESETAR a energia de TODOS os perfis para 3?",
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
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-danger mb-4" />
        <h1 className="font-display text-xl font-black text-white tracking-tight">
          Acesso negado
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-2">
          Esta área é restrita ao mestre do jogo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-white p-6 md:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div
            className="neo-raised-xs w-13 h-13 rounded-full flex items-center justify-center"
            style={{ width: 52, height: 52 }}
          >
            <Crown className="w-6 h-6 text-gold" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight">
              God Panel
            </h1>
            <p className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted mt-0.5">
              IDO Master Control
            </p>
          </div>
        </div>
        <button
          onClick={loadProfiles}
          disabled={loadingList}
          className="neo-raised-xs flex items-center gap-2 px-5 py-3 rounded-full font-display text-xs font-black uppercase tracking-widest text-text-secondary hover:text-accent disabled:opacity-50 transition"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`}
            strokeWidth={2.5}
          />
          Recarregar
        </button>
      </header>

      {feedback && (
        <div
          className={`neo-pressed-sm mb-7 rounded-2xl px-5 py-4 text-xs font-display font-black uppercase tracking-widest ${
            feedback.type === "success" ? "text-accent" : "text-danger"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <section className="neo-raised rounded-3xl p-7 mb-9">
        <div className="flex items-start gap-4">
          <div
            className="neo-pressed-sm w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
            style={{ width: 52, height: 52 }}
          >
            <Zap className="w-6 h-6 text-danger fill-danger" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-black text-white tracking-tight">
              Resetar Energia Global
            </h2>
            <p className="text-sm text-text-secondary font-medium mt-1.5 leading-relaxed">
              Restaura a energia de TODOS os IDOs para 3. Use entre rounds de
              teste.
            </p>
          </div>
        </div>
        <button
          onClick={handleGlobalReset}
          disabled={resetting}
          className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-4 bg-danger text-white font-display text-sm font-black tracking-widest uppercase rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          style={{
            boxShadow: resetting
              ? "none"
              : "0 0 24px rgba(255,77,109,0.45), 0 0 48px rgba(255,77,109,0.18)",
          }}
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

      <section className="neo-raised rounded-3xl p-7 mb-9">
        <div className="flex items-start gap-4 mb-6">
          <div
            className="neo-pressed-sm w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
            style={{ width: 52, height: 52 }}
          >
            <PenSquare className="w-6 h-6 text-accent" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-black text-white tracking-tight">
              Criar Publicação
            </h2>
            <p className="text-sm text-text-secondary font-medium mt-1.5 leading-relaxed">
              Posta no feed global como você. Os IDOs vão começar a interagir.
            </p>
          </div>
        </div>

        <textarea
          value={postContent}
          onChange={(e) =>
            setPostContent(e.target.value.slice(0, POST_MAX_CHARS))
          }
          placeholder="O que tá rolando..."
          rows={4}
          disabled={posting}
          className="neo-pressed-sm w-full rounded-2xl px-5 py-4 text-sm text-white placeholder:text-text-muted focus:outline-none font-medium resize-none disabled:opacity-50"
        />

        <div className="flex items-center justify-between mt-4 gap-3">
          <span
            className={`font-display text-xs font-black uppercase tracking-widest ${
              postContent.length >= POST_MAX_CHARS
                ? "text-danger"
                : postContent.length > POST_MAX_CHARS * 0.9
                  ? "text-gold"
                  : "text-text-muted"
            }`}
          >
            {postContent.length} / {POST_MAX_CHARS}
          </span>
          <button
            onClick={handleCreatePost}
            disabled={posting || !postContent.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-canvas font-display text-xs font-black tracking-widest uppercase rounded-full neo-glow-accent disabled:bg-surface-2 disabled:text-text-muted disabled:shadow-none disabled:cursor-not-allowed transition active:scale-[0.99]"
          >
            {posting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
                Publicar
              </>
            )}
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5 px-1 gap-3">
          <h2 className="font-display text-xs font-black uppercase tracking-widest text-text-secondary shrink-0">
            Testadores Alfa ({filtered.length})
          </h2>
          <div className="relative flex-1 max-w-xs">
            <Search
              className="w-3.5 h-3.5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              strokeWidth={2.5}
            />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neo-pressed-sm w-full rounded-full pl-10 pr-4 py-3 text-xs text-white placeholder:text-text-muted focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="neo-raised-sm rounded-3xl overflow-hidden">
          {loadingList ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-text-muted font-display font-bold">
              {search
                ? "Nenhum perfil bate com a busca."
                : "Nenhum perfil encontrado."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-[10px] font-display font-black uppercase tracking-widest text-text-muted"
                    style={{ borderBottom: "1px solid #243240" }}
                  >
                    <th className="px-5 py-4">Email</th>
                    <th className="px-3 py-4">Nv</th>
                    <th className="px-3 py-4">XP</th>
                    <th className="px-3 py-4">⚡</th>
                    <th className="px-3 py-4">Pts</th>
                    <th className="px-3 py-4">Adm</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setEditing(p)}
                      className="last:border-0 transition-colors cursor-pointer hover:bg-surface-2/40"
                      style={{ borderBottom: "1px solid #243240" }}
                    >
                      <td className="px-5 py-4 font-medium text-white truncate max-w-65">
                        {p.email}
                      </td>
                      <td className="px-3 py-4">
                        <span className="font-display font-black text-accent text-xs">
                          {p.level}
                        </span>
                      </td>
                      <td className="px-3 py-4 font-bold text-text-secondary">
                        {p.xp}
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 font-display font-black text-gold">
                          <Zap className="w-3.5 h-3.5 fill-gold" />
                          {p.energy}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 font-display font-black text-accent">
                          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
                          {p.points}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {p.is_admin ? (
                          <Crown
                            className="w-4 h-4 text-gold"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <span className="text-text-muted">—</span>
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
  const [forceEventResult, setForceEventResult] = useState<string | null>(null);

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
      "OK = devolver os pontos gastos | Cancelar = só zerar sem devolver",
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
          : `Skills zeradas (${data ?? 0} níveis apagados).`,
      );
    } catch (e: any) {
      onError(e.message || "Falha ao resetar skills.");
    } finally {
      setBusy(null);
    }
  };

  const handleForceEvent = async () => {
    setBusy("force");
    setForceEventResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("daily-event", {
        body: { force_user_id: profile.id },
      });
      if (error) throw error;
      if (data?.already_rolled) {
        setForceEventResult(`Já rolou hoje — tipo: ${data.event_type}`);
      } else {
        setForceEventResult(
          `Evento gerado: ${data?.event_type ?? "desconhecido"}`,
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao forçar evento.";
      onError(msg);
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `APAGAR o perfil de ${profile.email}? Isso remove posts, interactions e skills. (auth.users segue existindo)`,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="neo-raised w-full max-w-md rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-6 flex items-start justify-between gap-3"
          style={{ borderBottom: "1px solid #243240" }}
        >
          <div className="min-w-0">
            <p className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted">
              Editar perfil
            </p>
            <h2 className="font-display text-base font-black text-white tracking-tight truncate mt-1">
              {profile.email}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="neo-raised-xs w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-accent shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Nível"
              icon={<Award className="w-3.5 h-3.5" strokeWidth={2.5} />}
              value={level}
              onChange={setLevel}
            />
            <NumberField
              label="XP"
              icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />}
              value={xp}
              onChange={setXp}
            />
            <NumberField
              label="Energia"
              icon={<Zap className="w-3.5 h-3.5 fill-current" />}
              value={energy}
              onChange={setEnergy}
            />
            <NumberField
              label="Pontos"
              icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />}
              value={points}
              onChange={setPoints}
            />
          </div>

          <label className="neo-pressed-sm flex items-center justify-between rounded-2xl p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-gold" strokeWidth={2.5} />
              ) : (
                <ShieldOff
                  className="w-4 h-4 text-text-muted"
                  strokeWidth={2.5}
                />
              )}
              <span className="font-display text-sm font-black text-white">
                Admin
              </span>
            </div>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-5 h-5 accent-gold"
            />
          </label>

          <button
            onClick={handleSave}
            disabled={!dirty || busy !== null}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-accent text-canvas font-display text-sm font-black tracking-widest uppercase neo-glow-accent disabled:bg-surface-2 disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none transition active:scale-[0.99]"
          >
            {busy === "save" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2.5} />
                Salvar alterações
              </>
            )}
          </button>
        </div>

        <div className="px-6 pb-6">
          <p className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">
            Zona de risco
          </p>
          <div className="space-y-3">
            <button
              onClick={handleForceEvent}
              disabled={busy !== null}
              className="neo-raised-xs w-full flex items-center justify-center gap-2 h-11 rounded-full text-accent font-display text-xs font-black tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {busy === "force" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Dices className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Forçar Evento Diário
                </>
              )}
            </button>
            {forceEventResult && (
              <p className="text-[10px] font-display font-black text-center text-accent uppercase tracking-widest">
                {forceEventResult}
              </p>
            )}
            <button
              onClick={handleResetSkills}
              disabled={busy !== null}
              className="neo-raised-xs w-full flex items-center justify-center gap-2 h-11 rounded-full text-gold font-display text-xs font-black tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {busy === "reset" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Resetar skills
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={busy !== null}
              className="neo-raised-xs w-full flex items-center justify-center gap-2 h-11 rounded-full text-danger font-display text-xs font-black tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {busy === "delete" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
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
      <span className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1.5 mb-2">
        {icon} {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="neo-pressed-sm w-full rounded-2xl px-4 py-3 text-sm font-display font-black text-white focus:outline-none"
      />
    </label>
  );
}
