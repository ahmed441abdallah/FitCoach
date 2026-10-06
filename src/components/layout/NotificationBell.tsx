"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, X, CheckCheck, Dumbbell, Apple, CreditCard,
  Info, AlertCircle, ChevronRight, Loader2, LucideIcon
} from "lucide-react";
import axiosInstance from "@/lib/axios";

// ─── Types ─────────────────────────────────────────────────────────────
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "alerts" | "workout" | "diet" | "subscription" | "general";
  isRead: boolean;
  link: string;
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────
const LIME = "#c8fe1b";

const TYPE_META: Record<
  Notification["type"],
  { icon: LucideIcon; color: string; glow: string; bg: string }
> = {
  workout: {
    icon: Dumbbell,
    color: LIME,
    glow: "rgba(200,254,27,0.15)",
    bg: "rgba(200,254,27,0.08)",
  },
  diet: {
    icon: Apple,
    color: "#34d399",
    glow: "rgba(52,211,153,0.15)",
    bg: "rgba(52,211,153,0.08)",
  },
  subscription: {
    icon: CreditCard,
    color: "#94a3b8",
    glow: "rgba(148,163,184,0.12)",
    bg: "rgba(148,163,184,0.07)",
  },
  alerts: {
    icon: AlertCircle,
    color: "#f97316",
    glow: "rgba(249,115,22,0.15)",
    bg: "rgba(249,115,22,0.08)",
  },
  general: {
    icon: Info,
    color: "#94a3b8",
    glow: "rgba(148,163,184,0.15)",
    bg: "rgba(148,163,184,0.08)",
  },
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Component ──────────────────────────────────────────────────────────
export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/notifications/me");
      if (res.data.success) setNotifications(res.data.data);
    } catch {
      // silently fail — bell just stays empty
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 30 seconds while mounted
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Mark single notification as read + navigate
  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await axiosInstance.put(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x))
        );
      } catch {}
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  // Mark all as read
  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await axiosInstance.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
    setMarkingAll(false);
  };

  return (
    <div className="relative">
      {/* ── Bell Button ── */}
      <button
        ref={bellRef}
        id="notification-bell"
        aria-label="Toggle notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.08] hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200"
      >
        <Bell size={18} className={open ? "text-white" : "text-white/60"} />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center text-black"
              style={{ background: LIME, boxShadow: `0 0 10px ${LIME}80` }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            key="panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="absolute right-0 top-12 w-[380px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl z-50"
            style={{
              background:
                "linear-gradient(160deg, rgba(14,14,18,0.98) 0%, rgba(10,10,14,0.98) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(200,254,27,0.1)" }}
                >
                  <Bell size={13} style={{ color: LIME }} />
                </div>
                <span className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-black"
                    style={{ background: LIME }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={markingAll}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
                    style={{ color: LIME }}
                    title="Mark all as read"
                  >
                    {markingAll ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <CheckCheck size={11} />
                    )}
                    All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white transition-all"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-14 gap-3">
                  <Loader2 size={20} className="animate-spin text-white/30" />
                  <span className="text-white/30 text-sm font-semibold">Loading…</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <Bell size={22} className="text-white/15" />
                  </div>
                  <p className="text-white/30 text-sm font-semibold">No notifications yet</p>
                  <p className="text-white/20 text-xs">
                    You&apos;ll be notified about workouts, diet plans, and subscriptions here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {notifications.map((n, i) => {
                    const meta = TYPE_META[n.type] ?? TYPE_META.general;
                    const Icon = meta.icon;
                    return (
                      <motion.button
                        key={n._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleClick(n)}
                        className="w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-white/[0.04] transition-all duration-150 group relative"
                      >
                        {/* Unread indicator */}
                        {!n.isRead && (
                          <span
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: LIME }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                          style={{
                            background: meta.bg,
                            boxShadow: n.isRead ? "none" : `0 0 12px ${meta.glow}`,
                          }}
                        >
                          <Icon size={15} style={{ color: meta.color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold leading-tight mb-0.5 ${
                              n.isRead ? "text-white/60" : "text-white"
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] font-semibold mt-1.5" style={{ color: n.isRead ? "rgba(255,255,255,0.2)" : meta.color }}>
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>

                        {/* Arrow */}
                        {n.link && (
                          <ChevronRight
                            size={14}
                            className="text-white/20 group-hover:text-white/50 flex-shrink-0 mt-1 transition-colors"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.06] flex-shrink-0 text-center">
                <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""} total
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
