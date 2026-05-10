"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Loader2, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  content: string;
  created_at: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="p-6 flex-1 flex flex-col bg-gray-50 min-h-full pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Feed Global
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Acompanhe e reaja aos pensamentos da rede.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
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
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 font-bold">Nenhum post no momento.</p>
          <p className="text-gray-400 text-sm mt-1">Seja o primeiro a enviar algo!</p>
        </div>
      )}
    </div>
  );
}
