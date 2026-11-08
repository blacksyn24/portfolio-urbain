"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { profile } from "@/content/profile";

const suggestions = ["Quelles sont tes compétences ?", "Tu cherches un stage ?", "Parle-moi de tes labs GNS3"];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.85, y: 20, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{ transformOrigin: "bottom right" }}
            className="glass glass-dark flex h-[460px] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-[2rem]"
          >
            <div className="flex items-center gap-3 border-b border-white/8 p-4">
              <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/20">
                <Image src={profile.photo} alt="" fill sizes="36px" className="object-cover object-top" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Assistant d&apos;Urbain</p>
                <p className="text-xs text-ultra-200/70">Répond sur mon parcours et mes labs</p>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer le chat">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <p className="max-w-[85%] rounded-3xl rounded-bl-lg bg-white/8 px-4 py-2.5 text-sm">
                Salut 👋 Je suis l&apos;assistant d&apos;Urbain. Pose-moi une question sur son parcours, ses compétences ou ses projets.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <span key={s} className="chip cursor-not-allowed opacity-70">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 rounded-full bg-ink-950/50 p-1.5 pl-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/.08)]">
                <input disabled placeholder="Bientôt connecté…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-ultra-200/40" />
                <button disabled className="grid h-9 w-9 place-items-center rounded-full bg-ultra-500/50" aria-label="Envoyer">
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="glass glass-strong glass-refract grid h-14 w-14 place-items-center rounded-full"
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
}
