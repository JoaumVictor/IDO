"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Loader2, MessageCircle, Send } from "lucide-react";

interface Post {
  id: string;
  content: string;
  created_at: string;
}

const MAX_POST_LENGTH = 280;

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
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

  const handlePublish = async () => {
    const content = draft.trim();
    if (!content || publishing) return;

    setPublishing(true);
    setPublishError("");

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setPublishError("Você precisa estar logado para publicar.");
      setPublishing(false);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({ content, author_id: authData.user.id })
      .select()
      .single();

    if (error || !data) {
      setPublishError(error?.message || "Não consegui publicar agora. Tenta de novo.");
      setPublishing(false);
      return;
    }

    setPosts((prev) => [data as Post, ...prev]);
    setDraft("");
    setPublishing(false);
  };

  const remaining = MAX_POST_LENGTH - draft.length;
  const canPublish = draft.trim().length > 0 && remaining >= 0 && !publishing;

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

      <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 mb-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_POST_LENGTH}
          rows={3}
          placeholder="No que você está pensando?"
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-gray-800 placeholder:text-gray-400 font-medium focus:outline-none"
        />
        {publishError && (
          <p className="text-xs font-bold text-red-500 mt-2">{publishError}</p>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              remaining < 20 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {remaining} restantes
          </span>
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-all disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed active:scale-95 shadow-sm"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publicar
              </>
            )}
          </button>
        </div>
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
