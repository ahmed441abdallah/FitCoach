"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageCircle, Loader2, ShieldCheck } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAppSelector } from "@/lib/hooks";
import Navbar from "@/components/layout/Navbar";
import { useSocket } from "@/lib/useSocket";
import { useTranslations } from "next-intl";

interface Message {
  _id: string;
  conversationId: string;
  sender: { _id: string; userName: string; email: string; role: string };
  text: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: { _id: string; userName: string; email: string; role: string }[];
  lastMessage: string;
  updatedAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ClientChatPage() {
  const t = useTranslations("chatPage");
  const { user } = useAppSelector((s) => s.auth);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { joinRoom, sendSocketMessage, onMessage } = useSocket();

  // Load the coach conversation
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingConv(true);
        // Fetch the coach (admin user) via a dedicated chat endpoint
        const coachRes = await axiosInstance.get("/chat/coach", { withCredentials: true });
        const admin = coachRes.data?.coach;
        if (!admin) return;

        const convRes = await axiosInstance.get(`/chat/with/${admin._id}`, { withCredentials: true });
        const conv: Conversation = convRes.data.conversation;
        setConversation(conv);

        const msgRes = await axiosInstance.get(`/chat/messages/${conv._id}`, { withCredentials: true });
        setMessages(msgRes.data.messages ?? []);

        joinRoom(conv._id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingConv(false);
      }
    };
    init();
  }, [joinRoom]);

  // Real-time incoming messages
  useEffect(() => {
    const off = onMessage((data) => {
      if (data.conversationId === conversation?._id) {
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now().toString(),
            conversationId: data.conversationId,
            sender: { _id: data.sender, userName: "Coach", email: "", role: "admin" },
            text: data.text,
            createdAt: data.createdAt ?? new Date().toISOString(),
          },
        ]);
      }
    });
    return off;
  }, [conversation, onMessage]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !conversation) return;
    const coach = conversation.participants.find((p) => p.role === "admin");
    if (!coach) return;

    setSending(true);
    const optimistic: Message = {
      _id: Date.now().toString(),
      conversationId: conversation._id,
      sender: { _id: user?._id ?? "", userName: user?.userName ?? "You", email: "", role: "client" },
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    const msgText = text.trim();
    setText("");

    try {
      const res = await axiosInstance.post(
        `/chat/send/${coach._id}`,
        { text: msgText },
        { withCredentials: true }
      );
      sendSocketMessage({ conversationId: conversation._id, text: msgText, sender: user?._id ?? "" });
      // Replace optimistic with real one but keep our populated sender object
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? { ...optimistic, ...res.data.message, sender: optimistic.sender } : m))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-6 h-screen flex flex-col">
        {/* Header */}
        <div
          className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] mb-4 flex-shrink-0"
          style={{ background: "#111111" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(200,254,27,0.08)" }}
          >
            <ShieldCheck size={22} style={{ color: "#c8fe1b" }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-0.5">{t("directMessage")}</p>
            <h1 className="text-lg font-extrabold text-white">{t("yourCoach")}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">{t("online")}</span>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.07] p-4 space-y-3 flex flex-col"
          style={{ background: "#111111" }}
        >
          {loadingConv ? (
            <div className="flex items-center justify-center flex-1 gap-3">
              <Loader2 size={20} className="animate-spin text-white/30" />
              <span className="text-white/30 text-sm">{t("loading")}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
              <div
                className="w-16 h-16 rounded-3xl border border-white/[0.06] flex items-center justify-center"
                style={{ background: "rgba(200,254,27,0.04)" }}
              >
                <MessageCircle size={28} className="text-primary/40" />
              </div>
              <div>
                <p className="text-white/60 font-bold text-sm">{t("noMessagesTitle")}</p>
                <p className="text-white/30 text-xs mt-1">{t("noMessagesDesc")}</p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isMe = msg.sender._id === user?._id || msg.sender.role === "client";
                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
                      {!isMe && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">
                          {t("coach")}
                        </span>
                      )}
                      <div
                        className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                        style={
                          isMe
                            ? { background: "#c8fe1b", color: "#000", borderRadius: "18px 18px 4px 18px" }
                            : { background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: "18px 18px 18px 4px" }
                        }
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-white/20 px-1">{timeAgo(msg.createdAt)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="mt-4 flex items-end gap-3 p-3 rounded-2xl border border-white/[0.07] flex-shrink-0"
          style={{ background: "#111111" }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t("placeholder")}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm resize-none outline-none py-1.5 px-1 max-h-32"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "#c8fe1b" }}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin text-black" />
            ) : (
              <Send size={16} className="text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
