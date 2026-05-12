"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Loader2, MessageCircle, ChevronRight } from "lucide-react";

interface IDOComment {
  id: string;
  response: string;
  created_at: string;
  post_id: string;
  posts: { content: string } | null;
}

interface Props {
  userId: string;
  title?: string;
  emptyMessage?: string;
  limit?: number;
}

export function IDOCommentsList({
  userId,
  title = "Comentários do IDO",
  emptyMessage = "Esse IDO ainda não comentou em nenhum post.",
  limit = 20,
}: Props) {
  const [comments, setComments] = useState<IDOComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchComments = async () => {
      const { data } = await supabase
        .from("interactions")
        .select("id, response, created_at, post_id, posts(content)")
        .eq("ido_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      setComments((data ?? []) as unknown as IDOComment[]);
      setLoading(false);
    };
    fetchComments();
  }, [userId, limit]);

  return (
    <div className="mt-10">
      <h2 className="font-display text-xs font-black uppercase tracking-widest text-text-secondary mb-5 px-1 flex items-center gap-2">
        <MessageCircle className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
        {title}
        {!loading && (
          <span className="text-text-muted">({comments.length})</span>
        )}
      </h2>

      {loading ? (
        <div className="neo-pressed-sm rounded-3xl p-8 flex justify-center">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="neo-pressed-sm rounded-3xl p-8 text-center">
          <p className="text-sm text-text-muted font-display font-bold">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <Link
              key={c.id}
              href={`/post/${c.post_id}`}
              className="neo-raised-sm block rounded-2xl p-5 transition-transform active:scale-[0.99]"
            >
              <p className="text-[10px] text-text-muted font-display font-bold uppercase tracking-widest mb-2">
                Em resposta a
              </p>
              <p
                className="text-xs text-text-secondary mb-3 font-medium leading-relaxed overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                &ldquo;{c.posts?.content ?? "(post removido)"}&rdquo;
              </p>
              <p className="text-[14px] text-white italic leading-relaxed mb-3">
                &ldquo;{c.response}&rdquo;
              </p>
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid #243240" }}
              >
                <span className="font-display text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  {new Date(c.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-display font-black uppercase tracking-widest text-accent">
                  Ver post
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
