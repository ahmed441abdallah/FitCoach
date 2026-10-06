"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageCircle, Loader2, User, Search, ArrowLeft } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAppSelector } from "@/lib/hooks";
import { useSocket } from "@/lib/useSocket";

interface Participant {
  _id: string;
  userName: string;
  email: string;
  role: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: Participant;
  text: string;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  return name ? name.slice(0, 2).toUpperCase() : "??";
}

export default function AdminChatPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileMsgOpen, setMobileMsgOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { joinRoom, sendSocketMessage, onMessage } = useSocket();

  // Load all conversations
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingConvs(true);
        const res = await axiosInstance.get("/chat/conversations", { withCredentials: true });
        setConversations(res.data.conversations ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetch();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConv) return;
    const fetch = async () => {
      try {
        setLoadingMsgs(true);
        const res = await axiosInstance.get(`/chat/messages/${activeConv._id}`, { withCredentials: true });
        setMessages(res.data.messages ?? []);
        joinRoom(activeConv._id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMsgs(false);
      }
    };
    fetch();
  }, [activeConv, joinRoom]);

  // Real-time messages
  useEffect(() => {
    const off = onMessage((data) => {
      if (data.conversationId === activeConv?._id) {
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now().toString(),
            conversationId: data.conversationId,
            sender: { _id: data.sender, userName: "Client", email: "", role: "client" },
            text: data.text,
            createdAt: data.createdAt ?? new Date().toISOString(),
          },
        ]);
      }
      // Update lastMessage in sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c._id === data.conversationId ? { ...c, lastMessage: data.text, updatedAt: new Date().toISOString() } : c
        )
      );
    });
    return off;
  }, [activeConv, onMessage]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
    setMobileMsgOpen(true);
    setText("");
  };

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find((p) => p._id !== user?._id) ?? conv.participants[0];

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    const other = getOtherParticipant(activeConv);

    setSending(true);
    const optimistic: Message = {
      _id: Date.now().toString(),
      conversationId: activeConv._id,
      sender: { _id: user?._id ?? "", userName: user?.userName ?? "Coach", email: "", role: "admin" },
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    const msgText = text.trim();
    setText("");

    try {
      const res = await axiosInstance.post(
        `/chat/send/${other._id}`,
        { text: msgText },
        { withCredentials: true }
      );
      sendSocketMessage({ conversationId: activeConv._id, text: msgText, sender: user?._id ?? "" });
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? { ...optimistic, ...res.data.message, sender: optimistic.sender } : m))
      );
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConv._id ? { ...c, lastMessage: msgText, updatedAt: new Date().toISOString() } : c
        )
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

  const filtered = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return (
      other.userName?.toLowerCase().includes(search.toLowerCase()) ||
      other.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="h-screen flex" style={{ background: "#0a0a0a" }}>
      {/* ── Sidebar: Conversations ── */}
      <div
        className={`w-full md:w-80 xl:w-96 flex-shrink-0 border-r border-white/[0.06] flex flex-col ${
          mobileMsgOpen ? "hidden md:flex" : "flex"
        }`}
        style={{ background: "#111111" }}
      >
        {/* Sidebar header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/[0.06] flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">FitCoach</p>
          <h1 className="text-xl font-extrabold text-white mb-4">Messages</h1>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.07] text-white placeholder-white/25 outline-none focus:border-primary/30 transition-colors"
            />
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 size={18} className="animate-spin text-white/30" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 px-4 text-center">
              <MessageCircle size={28} className="text-white/20" />
              <p className="text-white/30 text-sm font-semibold">No conversations yet</p>
            </div>
          ) : (
            filtered.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConv?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-white/[0.04] ${
                    isActive ? "bg-white/[0.06]" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-extrabold"
                    style={{
                      background: isActive ? "rgba(200,254,27,0.12)" : "rgba(255,255,255,0.05)",
                      color: isActive ? "#c8fe1b" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {getInitials(other.userName ?? other.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-white/70"}`}>
                      {other.userName ?? other.email}
                    </p>
                    <p className="text-xs text-white/30 truncate">{conv.lastMessage || "No messages yet"}</p>
                  </div>
                  <span className="text-[10px] text-white/20 flex-shrink-0">{timeAgo(conv.updatedAt)}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div
        className={`flex-1 flex flex-col ${mobileMsgOpen ? "flex" : "hidden md:flex"}`}
        style={{ background: "#0a0a0a" }}
      >
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6">
            <div
              className="w-20 h-20 rounded-3xl border border-white/[0.06] flex items-center justify-center"
              style={{ background: "rgba(200,254,27,0.04)" }}
            >
              <MessageCircle size={34} className="text-primary/30" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white mb-2">Select a Conversation</h2>
              <p className="text-white/35 text-sm max-w-sm leading-relaxed">
                Pick a client from the left panel to start chatting.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div
              className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.06] flex-shrink-0"
              style={{ background: "#111111" }}
            >
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/[0.05] text-white/50"
                onClick={() => setMobileMsgOpen(false)}
              >
                <ArrowLeft size={18} />
              </button>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                style={{ background: "rgba(200,254,27,0.08)", color: "#c8fe1b" }}
              >
                {getInitials(getOtherParticipant(activeConv).userName ?? getOtherParticipant(activeConv).email)}
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">
                  {getOtherParticipant(activeConv).userName}
                </p>
                <p className="text-xs text-white/30">{getOtherParticipant(activeConv).email}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full gap-3">
                  <Loader2 size={20} className="animate-spin text-white/30" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <MessageCircle size={28} className="text-white/20" />
                  <p className="text-white/30 text-sm font-semibold">No messages yet — say hello!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMe = msg.sender._id === user?._id || msg.sender.role === "admin";
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
                          <div
                            className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                            style={
                              isMe
                                ? { background: "#c8fe1b", color: "#000", borderRadius: "18px 18px 4px 18px" }
                                : {
                                    background: "rgba(255,255,255,0.06)",
                                    color: "#fff",
                                    borderRadius: "18px 18px 18px 4px",
                                  }
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
              className="flex items-end gap-3 p-4 border-t border-white/[0.06] flex-shrink-0"
              style={{ background: "#111111" }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message client… (Enter to send)"
                rows={1}
                className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl text-white placeholder-white/25 text-sm resize-none outline-none py-2.5 px-4 max-h-32 focus:border-primary/30 transition-colors"
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
          </>
        )}
      </div>
    </div>
  );
}
