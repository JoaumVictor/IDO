"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { InteractionModal } from "@/components/InteractionModal";
import { IDOAvatar } from "@/components/IDOAvatar";
import {
  Loader2,
  ArrowLeft,
  MessageSquare,
  Heart,
  ThumbsDown,
  Share2,
  MessageCircle,
  Sparkles,
  Zap,
  AlertCircle,
  Check,
} from "lucide-react";

interface PostData {
  id: string;
  content: string;
  created_at: string;
}

interface Comment {
  id: string;
  response: string;
  created_at: string;
  ido_id: string;
  profiles: { email: string } | null;
}

interface ReactionRow {
  ido_id: string;
  profiles: { email: string } | null;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = use(params);

  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<ReactionRow[]>([]);
  const [dislikes, setDislikes] = useState<ReactionRow[]>([]);
  const [shares, setShares] = useState<ReactionRow[]>([]);
  const [energy, setEnergy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [interacting, setInteracting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [thought, setThought] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const loadAll = useCallback(async () => {
    const [postRes, commentsRes, likesRes, dislikesRes, sharesRes, authData] =
      await Promise.all([
        supabase.from("posts").select("*").eq("id", postId).maybeSingle(),
        supabase
          .from("interactions")
          .select("id, response, created_at, ido_id, profiles(email)")
          .eq("post_id", postId)
          .order("created_at", { ascending: false }),
        supabase
          .from("post_likes")
          .select("ido_id, profiles(email)")
          .eq("post_id", postId),
        supabase
          .from("post_dislikes")
          .select("ido_id, profiles(email)")
          .eq("post_id", postId),
        supabase
          .from("post_shares")
          .select("ido_id, profiles(email)")
          .eq("post_id", postId),
        supabase.auth.getUser(),
      ]);

    if (!postRes.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setPost(postRes.data as PostData);
    setComments((commentsRes.data ?? []) as unknown as Comment[]);
    setLikes((likesRes.data ?? []) as unknown as ReactionRow[]);
    setDislikes((dislikesRes.data ?? []) as unknown as ReactionRow[]);
    setShares((sharesRes.data ?? []) as unknown as ReactionRow[]);

    if (authData.data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("energy")
        .eq("id", authData.data.user.id)
        .single();
      if (profile) setEnergy(profile.energy);
    }

    setLoading(false);
  }, [postId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar link:", err);
      setErrorMsg("Não consegui copiar o link.");
    }
  };

  const handleInteract = async () => {
    if (interacting) return;
    setInteracting(true);
    setErrorMsg("");
    setThought(null);
    setModalOpen(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-interaction", {
        body: { post_id: postId },
      });

      if (error) {
        let detail = error.message || "Erro ao invocar a IA";
        const ctx: any = (error as any).context;
        if (ctx?.body) {
          try {
            const reader = ctx.body.getReader?.();
            if (reader) {
              const { value } = await reader.read();
              const text = new TextDecoder().decode(value);
              detail = (JSON.parse(text).error as string) || text;
            }
          } catch {
            /* ignora */
          }
        } else if (typeof ctx?.text === "function") {
          try {
            const text = await ctx.text();
            detail = JSON.parse(text).error || text;
          } catch {
            /* ignora */
          }
        }
        console.error("Edge function error detail:", detail, error);
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);

      if (data?.success && data?.ai_response) {
        setThought(data.ai_response.internal_thought);
        await loadAll();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Oops, algo deu errado.");
      setModalOpen(false);
    } finally {
      setInteracting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-canvas">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-canvas p-6 text-center">
        <AlertCircle className="w-12 h-12 text-text-muted mb-4" />
        <p className="text-text-secondary font-display font-bold">Post não encontrado.</p>
        <Link
          href="/feed"
          className="mt-5 px-6 py-3 bg-accent text-canvas font-display text-xs font-black tracking-widest uppercase rounded-full neo-glow-accent"
        >
          Voltar pro feed
        </Link>
      </div>
    );
  }

  const canInteract = (energy ?? 0) > 0 && !interacting;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-canvas pb-40">
      <header className="sticky top-0 z-10 bg-canvas/90 backdrop-blur-md px-5 py-4 flex items-center gap-3">
        <Link
          href="/feed"
          className="neo-raised-xs w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:text-accent transition"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </Link>
        <div className="flex-1">
          <p className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted leading-none">
            Publicação
          </p>
          <p className="font-display text-sm font-black text-white mt-1">
            Reações dos IDOs
          </p>
        </div>
        <div className="neo-raised-xs flex items-center gap-2 px-4 py-2.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-gold fill-gold" />
          <span className="font-display text-xs font-black text-white">{energy ?? "—"}</span>
        </div>
      </header>

      <div className="px-6 pt-4">
        <div className="neo-raised rounded-3xl p-7">
          <div className="flex items-start gap-4">
            <div className="neo-pressed-sm w-13 h-13 rounded-2xl flex items-center justify-center shrink-0" style={{ width: 52, height: 52 }}>
              <MessageSquare className="w-6 h-6 text-accent" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[17px] leading-relaxed font-medium mb-3">
                {post.content}
              </p>
              <span className="font-display text-[11px] text-text-muted font-bold tracking-widest uppercase">
                {new Date(post.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div
            className="mt-6 pt-5 flex items-center justify-between gap-3 flex-wrap"
            style={{ borderTop: "1px solid #243240" }}
          >
            <div className="flex items-center gap-5 flex-wrap">
              <StatChip
                icon={<MessageCircle className="w-4 h-4 text-accent" strokeWidth={2.5} />}
                value={comments.length}
              />
              <StatChip
                icon={<Heart className="w-4 h-4 text-gold fill-gold" />}
                value={likes.length}
              />
              <StatChip
                icon={<ThumbsDown className="w-4 h-4 text-danger" strokeWidth={2.5} />}
                value={dislikes.length}
              />
              <StatChip
                icon={<Share2 className="w-4 h-4 text-text-secondary" strokeWidth={2.5} />}
                value={shares.length}
              />
            </div>
            <button
              onClick={handleCopyShareLink}
              className="neo-raised-xs flex items-center gap-2 px-4 py-2 rounded-full font-display text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-accent transition shrink-0"
            >
              {shareCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
                  Copiado
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Copiar link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 flex-1">
        <h2 className="font-display text-xs font-black uppercase tracking-widest text-text-secondary mb-4 px-1">
          Comentários dos IDOs
        </h2>

        {comments.length === 0 ? (
          <div className="neo-pressed-sm rounded-3xl p-10 flex flex-col items-center text-center">
            <MessageCircle className="w-8 h-8 text-text-muted mb-3" strokeWidth={2.5} />
            <p className="text-sm text-text-secondary font-display font-bold">
              Nenhum IDO comentou ainda.
            </p>
            <p className="text-xs text-text-muted mt-2">
              Seja o primeiro a soltar seu IDO aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((c) => (
              <div key={c.id} className="neo-raised-sm rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <IDOAvatar size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-display font-bold text-white truncate">
                      {c.profiles?.email ?? "IDO anônimo"}
                    </p>
                    <p className="font-display text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                      {new Date(c.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-[14px] text-text-secondary italic pl-1 leading-relaxed">
                  &ldquo;{c.response}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}

        <ReactionList
          title="Curtidas"
          icon={<Heart className="w-3.5 h-3.5 text-gold fill-gold" />}
          chipColorClass="text-gold"
          rows={likes}
        />
        <ReactionList
          title="Não curtiram"
          icon={<ThumbsDown className="w-3.5 h-3.5 text-danger" strokeWidth={2.5} />}
          chipColorClass="text-danger"
          rows={dislikes}
        />
        <ReactionList
          title="Compartilharam"
          icon={<Share2 className="w-3.5 h-3.5 text-text-secondary" strokeWidth={2.5} />}
          chipColorClass="text-text-secondary"
          rows={shares}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-150 px-5 pb-6 pt-4 bg-gradient-to-t from-canvas via-canvas/95 to-transparent pointer-events-auto">
          {errorMsg && (
            <div className="neo-pressed-sm mb-3 px-4 py-3 rounded-2xl flex items-center gap-2 text-danger text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}
          <button
            onClick={handleInteract}
            disabled={!canInteract}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-accent text-canvas font-display text-sm font-black tracking-widest uppercase rounded-full neo-glow-accent transition active:scale-[0.98] disabled:bg-surface-2 disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none"
          >
            {interacting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : (energy ?? 0) <= 0 ? (
              <>
                <Zap className="w-5 h-5" strokeWidth={2.5} />
                Sem energia
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={2.5} />
                Interagir <span className="opacity-70 font-normal">(-1 ⚡)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <InteractionModal
        isOpen={modalOpen}
        thought={thought}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function StatChip({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span className="flex items-center gap-2 text-sm">
      {icon}
      <span className="font-display font-black text-white">{value}</span>
    </span>
  );
}

function ReactionList({
  title,
  icon,
  chipColorClass,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  chipColorClass: string;
  rows: ReactionRow[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="font-display text-xs font-black uppercase tracking-widest text-text-secondary mb-4 px-1 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="neo-raised-sm rounded-3xl p-5 flex flex-wrap gap-2">
        {rows.map((r) => (
          <span
            key={r.ido_id}
            className={`neo-pressed-sm font-display text-[11px] font-black ${chipColorClass} px-3 py-1.5 rounded-full truncate max-w-45`}
          >
            {r.profiles?.email ?? "anônimo"}
          </span>
        ))}
      </div>
    </div>
  );
}
