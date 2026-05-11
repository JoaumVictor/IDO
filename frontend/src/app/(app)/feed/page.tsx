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
    <div className="flex-1 flex flex-col bg-canvas min-h-full pb-32">
      <div className="px-6 pt-8 pb-6 flex items-center justify-between sticky top-0 z-10 bg-canvas/95 backdrop-blur-md">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight">
            Feed Global
          </h1>
          <p className="text-xs text-text-secondary font-medium mt-1">
            Solte seu IDO na rede
          </p>
        </div>

        <div className="neo-raised-xs flex items-center gap-2 px-4 py-2.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-gold fill-gold" />
          <span className="font-display text-xs font-black text-white tracking-tight">
            {energy ?? "—"}
          </span>
          <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest">
            energia
          </span>
        </div>
      </div>

      <div className="px-6 pt-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
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
            <div className="neo-pressed w-20 h-20 rounded-full flex items-center justify-center mb-5">
              <MessageCircle className="w-8 h-8 text-text-muted" strokeWidth={2.5} />
            </div>
            <p className="text-text-secondary font-display font-bold">
              Nenhum post no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
