"use client";

import Link from "next/link";
import {
  MessageSquare,
  Heart,
  ThumbsDown,
  Share2,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

interface PostCardProps {
  id: string;
  content: string;
  createdAt: string;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  sharesCount: number;
}

export function PostCard({
  id,
  content,
  createdAt,
  commentsCount,
  likesCount,
  dislikesCount,
  sharesCount,
}: PostCardProps) {
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

      <div
        className="mt-5 pt-4 flex items-center justify-between gap-3"
        style={{ borderTop: "1px solid #243240" }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <CounterChip
            icon={<MessageCircle className="w-4 h-4 text-accent" strokeWidth={2.5} />}
            value={commentsCount}
          />
          <CounterChip
            icon={<Heart className="w-4 h-4 text-gold fill-gold" />}
            value={likesCount}
          />
          <CounterChip
            icon={<ThumbsDown className="w-4 h-4 text-danger" strokeWidth={2.5} />}
            value={dislikesCount}
          />
          <CounterChip
            icon={<Share2 className="w-4 h-4 text-text-secondary" strokeWidth={2.5} />}
            value={sharesCount}
          />
        </div>
        <span className="flex items-center gap-1 text-[11px] font-display font-black uppercase tracking-widest text-accent shrink-0">
          Abrir
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

function CounterChip({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      {icon}
      <span className="text-white font-display font-black">{value}</span>
    </span>
  );
}
