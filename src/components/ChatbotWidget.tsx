"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot, X, Send, Loader2, User, ChevronDown, Sparkles,
  Dumbbell, Apple, Flame, RotateCcw
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const getSuggestions = (t: any) => [
  { icon: Dumbbell, label: t("sugg1") },
  { icon: Apple, label: t("sugg2") },
  { icon: Flame, label: t("sugg3") },
  { icon: Sparkles, label: t("sugg4") },
];

export default function ChatbotWidget() {
  const t = useTranslations("chatbot");
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show widget after scroll
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Notification dot
  useEffect(() => {
    const t = setTimeout(() => { if (!open) setShowDot(true); }, 4000);
    return () => clearTimeout(t);
  }, []);

  // Add greeting when first opened
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
          setMessages([{
          id: "welcome",
          role: "bot",
          text: t("welcome"),
          timestamp: new Date(),
        }]);
      }, 400);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350);
      setShowDot(false);
    }
  }, [open, hasGreeted]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: generateId(), role: "user", text: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/chatbot", { question: trimmed });
      const botMsg: Message = {
        id: generateId(),
        role: "bot",
        text: res.data.reply || t("errorReply"),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message;
      setMessages(prev => [...prev, {
        id: generateId(),
        role: "bot",
        text: serverMsg || t("errorServer"),
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      id: generateId(),
      role: "bot",
      text: t("newSession"),
      timestamp: new Date(),
    }]);
  };

  const fmtTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const showSuggestions = messages.length <= 1 && !loading;
  const suggestionsList = getSuggestions(t);

  return (
    <>
      {/* ═══ FAB Button ═══ */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 16 }}
            transition={{ type: "spring", damping: 18, stiffness: 320 }}
            className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3"
          >
            {/* Pulse rings when closed */}
            {!open && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.18, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-[#c8fe1b]"
                  style={{ zIndex: -1 }}
                />
                <motion.div
                  animate={{ scale: [1, 1.35], opacity: [0.12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                  className="absolute inset-0 rounded-full bg-[#c8fe1b]"
                  style={{ zIndex: -1 }}
                />
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setOpen(v => !v)}
              className={`relative w-[58px] h-[58px] rounded-full flex items-center justify-center transition-all duration-300 ${
                open
                  ? "bg-slate-800 border border-white/10 shadow-xl"
                  : "bg-[#c8fe1b] shadow-[0_0_32px_rgba(200,254,27,0.6)]"
              }`}
              aria-label={open ? t("close") : t("open")}
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <X size={22} className="text-white/70" />
                  </motion.div>
                ) : (
                  <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Bot size={24} className="text-black" strokeWidth={2.2} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification badge */}
              <AnimatePresence>
                {showDot && !open && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center"
                  >
                    <span className="text-[9px] font-black text-white">1</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Label tag */}
            <AnimatePresence>
              {!open && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: 0.6, duration: 0.25 }}
                  className="absolute right-[70px] top-1/2 -translate-y-1/2 flex items-center gap-2 bg-slate-900/95 border border-white/[0.09] rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-xl pointer-events-none whitespace-nowrap"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-white text-xs font-bold tracking-wide">{t("miniCoach")}</span>
                  <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-900/95" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Chat Window ═══ */}
      <AnimatePresence>
        {open && visible && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-[88px] right-6 z-50 w-[400px] max-w-[calc(100vw-20px)] h-[560px] max-h-[calc(100vh-110px)] flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(12,12,12,0.99) 0%, rgba(6,6,6,1) 100%)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px rgba(200,254,27,0.06)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* ── Header ── */}
            <div className="relative flex-shrink-0 overflow-hidden">
              {/* Gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e0a] via-[#111111] to-[#0c0c0c]" />
              {/* Decorative glow */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#c8fe1b]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-4 right-8 w-20 h-20 bg-[#c8fe1b]/8 rounded-full blur-xl pointer-events-none" />

              <div className="relative flex items-center gap-3.5 px-5 py-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c8fe1b] to-lime-400 flex items-center justify-center shadow-[0_0_20px_rgba(200,254,27,0.5)]">
                    <Bot size={20} className="text-black" strokeWidth={2.3} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f1f06] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                </div>

                {/* Title */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-extrabold text-base tracking-wide">{t("miniCoach")}</p>
                    <span className="text-[9px] font-bold bg-[#c8fe1b]/15 text-[#c8fe1b] border border-[#c8fe1b]/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{t("aiBadge")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-emerald-400/80 text-[10px] font-semibold tracking-wider">{t("status")}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.07] flex items-center justify-center text-white/30 hover:text-white/70 transition-all"
                    title={t("newChat")}
                  >
                    <RotateCcw size={13} />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.07] flex items-center justify-center text-white/30 hover:text-white/70 transition-all"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Divider line ── */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#c8fe1b]/20 to-transparent flex-shrink-0" />

            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scrollbar-thin scrollbar-thumb-white/[0.07] scrollbar-track-transparent" style={{ background: 'transparent' }}>

              {/* Welcome graphic when empty */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center pt-6 pb-2 gap-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c8fe1b]/20 to-lime-400/5 border border-[#c8fe1b]/20 flex items-center justify-center shadow-[0_0_30px_rgba(200,254,27,0.08)]">
                    <Bot size={28} className="text-[#c8fe1b]" strokeWidth={1.8} />
                  </div>
                  <p className="text-white/30 text-xs font-semibold">{t("loading")}</p>
                </motion.div>
              )}

              {/* Messages */}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                      msg.role === "bot"
                        ? "bg-gradient-to-br from-[#c8fe1b]/20 to-lime-400/5 border border-[#c8fe1b]/20"
                        : "bg-gradient-to-br from-violet-500/20 to-violet-600/5 border border-violet-500/25"
                    }`}>
                      {msg.role === "bot"
                        ? <Bot size={14} className="text-[#c8fe1b]" />
                        : <User size={14} className="text-violet-300" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col max-w-[78%] gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-[#c8fe1b]/18 to-lime-400/8 border border-[#c8fe1b]/20 text-white rounded-br-sm shadow-[0_2px_12px_rgba(200,254,27,0.08)]"
                          : "bg-white/[0.05] border border-white/[0.07] text-white/90 rounded-bl-sm"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-white/20 font-semibold px-1">
                        {fmtTime(msg.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-end gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c8fe1b]/20 to-lime-400/5 border border-[#c8fe1b]/20 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-[#c8fe1b]" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.07] flex items-center gap-1.5">
                      {[0, 150, 300].map((delay, i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: delay / 1000, ease: "easeInOut" }}
                          className="w-1.5 h-1.5 rounded-full bg-[#c8fe1b]/50 block"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* ── Suggestions ── */}
            <AnimatePresence>
              {showSuggestions && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 px-4 pb-3 overflow-hidden"
                >
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mb-2.5">{t("tryAsking")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestionsList.map(({ icon: Icon, label }) => (
                      <motion.button
                        key={label}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => sendMessage(label)}
                        className="text-left text-[11px] font-semibold text-white/55 hover:text-[#c8fe1b] px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#c8fe1b]/30 hover:bg-[#c8fe1b]/[0.04] transition-all leading-tight flex items-center gap-2"
                      >
                        <Icon size={11} className="text-white/30 flex-shrink-0" />
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Divider ── */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent flex-shrink-0" />

            {/* ── Input Bar ── */}
            <div className="flex-shrink-0 px-4 py-3.5" style={{ background: 'rgba(10,10,10,0.6)' }}>
              <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 transition-all duration-200 border ${
                input
                  ? "bg-[#c8fe1b]/[0.04] border-[#c8fe1b]/30 shadow-[0_0_20px_rgba(200,254,27,0.05)]"
                  : "bg-white/[0.04] border-white/[0.08] focus-within:border-white/20"
              }`}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder={t("placeholder")}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none font-medium disabled:opacity-40"
                />
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-25 disabled:cursor-not-allowed bg-[#c8fe1b] hover:bg-lime-200 shadow-[0_0_16px_rgba(200,254,27,0.35)] disabled:shadow-none"
                >
                  {loading
                    ? <Loader2 size={14} className="text-black animate-spin" />
                    : <Send size={14} className="text-black" strokeWidth={2.5} />
                  }
                </motion.button>
              </div>
              <p className="text-center text-[9px] text-white/10 font-semibold mt-2 tracking-widest uppercase">
                {t("poweredBy")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
