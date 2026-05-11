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
      className="block bg-white rounded-3xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 mb-4 transition-all hover:shadow-md hover:border-indigo-100 active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center shrink-0 border border-indigo-100">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 text-[15px] leading-relaxed mb-2 font-medium">
            {content}
          </p>
          <span className="text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
            {new Date(createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <MessageCircle className="w-4 h-4 text-indigo-400" />
            {commentsCount}
            <span className="text-gray-400 font-medium">
              {commentsCount === 1 ? "comentário" : "comentários"}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <Heart className="w-4 h-4 text-rose-400" />
            {likesCount}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-indigo-500">
          Abrir
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
