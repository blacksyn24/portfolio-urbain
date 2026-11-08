"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { sessionId, track } from "@/lib/track";
import { useIsland } from "./IslandProvider";

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = ["Quelles sont tes compétences ?", "Tu cherches un stage ?", "Parle-moi de tes labs GNS3"];
const MAX_HISTORY = 20;

export function ChatWidget({ photo, firstName }: { photo: string; firstName: string }) {
  const { notify, clear } = useIsland();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const convId = useRef<string>("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function toggle() {
    setOpen((o) => {
      if (!o) track("chat_open");
      return !o;
    });
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    if (!convId.current) convId.current = crypto.randomUUID();
    const history: Msg[] = [...messages, { role: "user" as const, content }].slice(-MAX_HISTORY);
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const typing = notify({ title: `Assistant de ${firstName}`, subtitle: "écrit…", tone: "typing", duration: 0 });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId.current, sessionId: sessionId(), messages: history }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Le chatbot est indisponible pour le moment.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: acc }]);
      }
      if (!open) notify({ title: "Nouvelle réponse", subtitle: "Ouvrez le chat pour la lire", tone: "info" });
    } catch (e) {
      setMessages([...history, { role: "assistant", content: e instanceof Error ? e.message : "Une erreur est survenue." }]);
    } finally {
      clear(typing);
      setBusy(false);
    }
  }

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
            className="glass glass-dark flex h-[min(520px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-[2rem]"
            role="dialog"
            aria-label="Chat avec l'assistant"
          >
            <div className="flex items-center gap-3 border-b border-white/8 p-4">
              <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/20">
                <Image src={photo} alt="" fill sizes="36px" className="object-cover object-top" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Assistant de {firstName}</p>
                <p className="text-xs text-ultra-200/70">Répond sur mon parcours et mes labs</p>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer le chat">
                <X size={16} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              <Bubble role="assistant">
                Salut 👋 Je suis l&apos;assistant de {firstName}. Pose-moi une question sur son parcours, ses compétences ou ses projets.
              </Bubble>
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role}>
                  {!m.content ? (
                    <Loader2 size={15} className="animate-spin text-ultra-300" />
                  ) : m.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} className="underline" target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </Bubble>
              ))}
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="chip transition-colors hover:bg-white/12">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              className="p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <div className="flex items-center gap-2 rounded-full bg-ink-950/50 p-1.5 pl-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/.08)]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={1000}
                  placeholder="Écrivez votre question…"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ultra-200/40"
                  aria-label="Votre message"
                />
                <button type="submit" disabled={busy || !input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ultra-500 transition-opacity disabled:opacity-40" aria-label="Envoyer">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggle}
        className="glass glass-strong glass-refract grid h-14 w-14 place-items-center rounded-full"
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div
      className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
        role === "user"
          ? "ml-auto whitespace-pre-wrap rounded-3xl rounded-br-lg bg-ultra-500/80 text-white"
          : "chat-md rounded-3xl rounded-bl-lg bg-white/8"
      }`}
    >
      {children}
    </div>
  );
}
