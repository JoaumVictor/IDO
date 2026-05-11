"use client";

import Link from "next/link";
import { MessageSquare, Heart, MessageCircle, ChevronRight } from "lucide-react";

interface PostCardProps {
  id: string;
  content: string;
  createdAt: string;
  commentsCount: number;
  likesCount: number;
}

export function PostCard({ id, content, createdAt, commentsCount, likesCount }: PostCardProps) {
  return (
    <Link
      href={`/post/${id}`}
      className="neo-raised-sm block rounded-3xl p-6 mb-5 transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className="neo-pressed-sm w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] leading-relaxed mb-3 font-medium">
            {content}
          </p>
          <span className="text-[11px] text-text-muted font-display font-bold tracking-widest uppercase">
            {new Date(createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid #243240" }}>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
            <MessageCircle className="w-4 h-4 text-accent" />
            <span className="text-white font-display font-black">{commentsCount}</span>
            <span className="text-text-muted font-medium">
              {commentsCount === 1 ? "comentário" : "comentários"}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
            <Heart className="w-4 h-4 text-gold fill-gold" />
            <span className="text-white font-display font-black">{likesCount}</span>
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-display font-black uppercase tracking-widest text-accent">
          Abrir
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}
