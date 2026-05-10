"use client";

import { useState } from "react";
import { MessageSquare, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { InteractionModal } from "./InteractionModal";

interface PostCardProps {
  id: string;
  content: string;
  createdAt: string;
}

export function PostCard({ id, content, createdAt }: PostCardProps) {
  const [loading, setLoading] = useState(false);
  const [replied, setReplied] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // States para o Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [internalThought, setInternalThought] = useState<string | null>(null);

  const handleInteract = async () => {
    setLoading(true);
    setErrorMsg("");
    setInternalThought(null);
    setModalOpen(true); // Abre o modal em estado de Loading

    try {
      const { data, error } = await supabase.functions.invoke("generate-interaction", {
        body: { post_id: id },
      });

      if (error) {
        throw new Error(error.message || "Erro desconhecido ao invocar a Edge Function");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.ai_response) {
        // Exibe o pensamento no modal
        setInternalThought(data.ai_response.internal_thought);
        
        // Só define a mensagem publica se a acao nao for ignore
        if (data.ai_response.action !== "ignore") {
          setResponseMsg(data.ai_response.public_comment);
        } else {
          setResponseMsg(""); // Ignorou
        }
        setReplied(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Oops, algo deu errado com a IA.");
      setModalOpen(false); // Fecha o modal se deu erro pra mostrar o erro no card
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 mb-5 transition-all hover:shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 pt-1">
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

        <div className="mt-5 pt-4 flex flex-col justify-end">
          {errorMsg && (
            <div className="mb-3 px-3 py-2 bg-red-50 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {!replied ? (
            <button
              onClick={handleInteract}
              disabled={loading}
              className="self-end flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Interagir com meu IDO <span className="opacity-70 ml-1 font-normal">(-1 ⚡)</span>
                </>
              )}
            </button>
          ) : (
            responseMsg ? (
              <div className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 mt-2 border border-indigo-100/50 relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-indigo-700" />
                  </div>
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                    Seu IDO comentou
                  </span>
                </div>
                <p className="text-[14px] text-indigo-900/80 font-medium italic pl-1">
                  "{responseMsg}"
                </p>
              </div>
            ) : (
              <div className="w-full bg-gray-50 rounded-2xl p-4 mt-2 border border-gray-100 flex items-center justify-center gap-2 animate-in fade-in duration-500">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">O IDO ignorou publicamente este post</span>
              </div>
            )
          )}
        </div>
      </div>
      
      <InteractionModal 
        isOpen={modalOpen} 
        thought={internalThought} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
}
