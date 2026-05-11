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
      const timer = setTimeout(() => {
        setClosing(true);
        setTimeout(() => {
          onClose();
          setClosing(false);
        }, 300);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [thought, onClose]);

  if (!isOpen && !closing) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`neo-raised w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 transform ${
          closing ? "scale-95 translate-y-4" : "scale-100 translate-y-0"
        }`}
      >
        {!thought ? (
          <>
            <div className="relative mb-6">
              <IDOAvatar size={88} priority />
              <Loader2 className="w-9 h-9 text-accent animate-spin absolute inset-0 m-auto" />
            </div>
            <h3 className="font-display text-lg font-black text-white mb-2 tracking-tight">
              IDO Analisando...
            </h3>
            <p className="text-sm text-text-secondary">
              Lendo a postagem e formulando o que acha disso.
            </p>
          </>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-5">
              <IDOAvatar size={72} />
            </div>
            <h3 className="font-display text-[10px] font-black text-accent uppercase tracking-widest mb-4">
              Monólogo Interno
            </h3>
            <div className="neo-pressed-sm rounded-3xl p-6 w-full relative">
              <span className="text-accent/30 text-5xl absolute -top-3 left-3 font-serif leading-none">
                &ldquo;
              </span>
              <p className="text-[15px] font-medium text-white italic relative z-10 leading-relaxed">
                {thought}
              </p>
              <span className="text-accent/30 text-5xl absolute -bottom-7 right-3 font-serif leading-none">
                &rdquo;
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
