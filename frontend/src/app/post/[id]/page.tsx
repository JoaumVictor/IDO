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
  MessageCircle,
  Sparkles,
  Zap,
  AlertCircle,
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

interface LikeRow {
  ido_id: string;
  profiles: { email: string } | null;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = use(params);

  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<LikeRow[]>([]);
  const [energy, setEnergy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [interacting, setInteracting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [thought, setThought] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const loadAll = useCallback(async () => {
    const [postRes, commentsRes, likesRes, authData] = await Promise.all([
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
      supabase.auth.getUser(),
    ]);

    if (!postRes.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setPost(postRes.data as PostData);
    setComments((commentsRes.data ?? []) as unknown as Comment[]);
    setLikes((likesRes.data ?? []) as unknown as LikeRow[]);

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
        // supabase-js engole o body em FunctionsHttpError; vamos extrair manualmente
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
        // Recarrega comentários / likes / energia
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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-bold">Post não encontrado.</p>
        <Link
          href="/feed"
          className="mt-4 px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full"
        >
          Voltar pro feed
        </Link>
      </div>
    );
  }

  const canInteract = (energy ?? 0) > 0 && !interacting;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-linear-to-b from-indigo-50/40 via-gray-50 to-gray-50 pb-32">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/feed"
          className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">
            Publicação
          </p>
          <p className="text-sm font-black text-gray-900 mt-0.5">
            Reações dos IDOs
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-yellow-200/50 px-3 py-1.5 rounded-full shadow-sm">
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
          <span className="text-xs font-black text-gray-800">{energy ?? "—"}</span>
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center shrink-0 border border-indigo-100">
              <MessageSquare className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-[17px] leading-relaxed font-medium mb-2">
                {post.content}
              </p>
              <span className="text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
                {new Date(post.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
              <MessageCircle className="w-4 h-4 text-indigo-500" />
              {comments.length}
              <span className="text-gray-400 font-medium text-xs">
                {comments.length === 1 ? "comentário" : "comentários"}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              {likes.length}
              <span className="text-gray-400 font-medium text-xs">
                {likes.length === 1 ? "curtida" : "curtidas"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 flex-1">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 px-1">
          Comentários dos IDOs
        </h2>

        {comments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-gray-200 flex flex-col items-center text-center">
            <MessageCircle className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 font-bold">
              Nenhum IDO comentou ainda.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Seja o primeiro a soltar seu IDO aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <IDOAvatar size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {c.profiles?.email ?? "IDO anônimo"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                      {new Date(c.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-[14px] text-gray-700 italic pl-1">
                  "{c.response}"
                </p>
              </div>
            ))}
          </div>
        )}

        {likes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 px-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Curtidas
            </h2>
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
              {likes.map((l) => (
                <span
                  key={l.ido_id}
                  className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full truncate max-w-45"
                >
                  {l.profiles?.email ?? "anônimo"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-150 px-4 pb-5 pt-3 bg-linear-to-t from-gray-50 via-gray-50/95 to-transparent pointer-events-auto">
          {errorMsg && (
            <div className="mb-3 px-3 py-2 bg-red-50 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-bold border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}
          <button
            onClick={handleInteract}
            disabled={!canInteract}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gray-900 text-white text-sm font-black tracking-wider uppercase rounded-2xl hover:bg-gray-800 transition active:scale-[0.99] shadow-xl shadow-gray-900/30 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {interacting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : (energy ?? 0) <= 0 ? (
              <>
                <Zap className="w-5 h-5" />
                Sem energia
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-300" />
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
