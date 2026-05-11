"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Loader2, MessageCircle, Zap } from "lucide-react";

interface PostWithCounts {
  id: string;
  content: string;
  created_at: string;
  interactions: { count: number }[];
  post_likes: { count: number }[];
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [energy, setEnergy] = useState<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [postsRes, authData] = await Promise.all([
        supabase
          .from("posts")
          .select("id, content, created_at, interactions(count), post_likes(count)")
          .order("created_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);

      if (postsRes.data) {
        setPosts(postsRes.data as PostWithCounts[]);
      }

      if (authData.data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("energy")
          .eq("id", authData.data.user.id)
          .single();
        if (profile) setEnergy(profile.energy);
      }

      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-linear-to-b from-indigo-50/40 via-gray-50 to-gray-50 min-h-full pb-24">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 z-10 bg-linear-to-b from-indigo-50/90 via-gray-50/90 to-transparent backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Feed Global
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Solte seu IDO na rede
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur border border-yellow-200/50 px-3 py-1.5 rounded-full shadow-sm">
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
          <span className="text-xs font-black text-gray-800 tracking-tight">
            {energy ?? "—"}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            energia
          </span>
        </div>
      </div>

      <div className="px-6 pt-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                content={post.content}
                createdAt={post.created_at}
                commentsCount={post.interactions?.[0]?.count ?? 0}
                likesCount={post.post_likes?.[0]?.count ?? 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold">Nenhum post no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
