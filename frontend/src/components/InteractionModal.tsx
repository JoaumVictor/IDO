"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { IDOAvatar } from "./IDOAvatar";

interface InteractionModalProps {
  isOpen: boolean;
  thought: string | null;
  onClose: () => void;
}

export function InteractionModal({ isOpen, thought, onClose }: InteractionModalProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (thought) {
      // Fecha automaticamente 3.5 segundos depois que o pensamento chega
      const timer = setTimeout(() => {
        setClosing(true);
        setTimeout(() => {
          onClose();
          setClosing(false);
        }, 300); // tempo do fade out
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [thought, onClose]);

  if (!isOpen && !closing) return null;

  return (
    <div className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center transition-all duration-300 transform ${closing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
        
        {!thought ? (
          <>
            <div className="relative mb-5">
              <IDOAvatar size={80} priority />
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin absolute inset-0 m-auto" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">IDO Analisando...</h3>
            <p className="text-sm text-gray-500">Lendo a postagem e formulando o que acha disso.</p>
          </>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-4">
              <IDOAvatar size={64} />
            </div>
            <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-3">Monólogo Interno</h3>
            <div className="bg-gray-50 rounded-2xl p-5 w-full relative">
              <span className="text-gray-300 text-5xl absolute -top-4 left-1 font-serif leading-none">"</span>
              <p className="text-[15px] font-semibold text-gray-700 italic relative z-10">
                {thought}
              </p>
              <span className="text-gray-300 text-5xl absolute -bottom-8 right-2 font-serif leading-none">"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
