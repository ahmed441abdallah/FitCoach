"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Users, CheckCircle2, AlertTriangle, XCircle, TrendingUp,
  Eye, Dumbbell, ArrowUpDown, ChevronRight, ChevronLeft, Mail,
  Trash2, X, Loader2, Target, Activity, Apple, ShieldCheck,
  Calendar, Weight, Ruler, Flame, User
} from "lucide-react";
import axiosInstance from "@/lib/axios";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Client {
  _id: string;
  user: { _id: string; email: string; phoneNumber?: string };
  goals: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  trainingDaysPerWeek: string;
  age: number;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  injuriesOrRestrictions?: string;
  foodPreferences?: string;
  images: string[];
  subscriptionPlan?: { _id: string; name: string; price: number } | null;
  createdAt: string;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EXPERIENCE_CONFIG = {
  Beginner:     { label: "Beginner",     class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Intermediate: { label: "Intermediate", class: "bg-amber-500/10  text-amber-400  border-amber-500/20"  },
  Advanced:     { label: "Advanced",     class: "bg-red-500/10    text-red-400    border-red-500/20"     },
};

const getInitials = (email: string) => email.slice(0, 2).toUpperCase();
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// â”€â”€â”€ Detail Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ClientDetailDrawer({ client, onClose, onDelete }: {
  client: Client;
  onClose: () => void;
  onDelete: () => void;
}) {
  const expConfig = EXPERIENCE_CONFIG[client.experienceLevel] || EXPERIENCE_CONFIG.Beginner;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 250 }}
        onClick={e => e.stopPropagation()}
        className="relative ml-auto w-full max-w-xl h-full bg-background border-l border-white/[0.08] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.07] bg-card/50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-extrabold text-violet-300">{getInitials(client.user.email)}</span>
            </div>
            <div>
              <p className="text-[9px] text-violet-400/60 font-bold uppercase tracking-[0.25em]">Client Profile</p>
              <h2 className="text-xl font-extrabold text-white truncate max-w-[200px]">{client.user.email}</h2>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 ${expConfig.class}`}>
                <Flame size={8} /> {expConfig.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.06] bg-white/[0.01] text-xs text-white/40 font-semibold flex-wrap">
          <span className="flex items-center gap-1.5"><Mail size={11} className="text-violet-400/50" />{client.user.email}</span>
          {client.user.phoneNumber && <><span className="w-1 h-1 rounded-full bg-white/20" /><span>{client.user.phoneNumber}</span></>}
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1.5"><Calendar size={11} /> Joined {fmtDate(client.createdAt)}</span>
        </div>

        {/* Subscription Badge */}
        {client.subscriptionPlan && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#c8fe1b]/[0.05] border border-[#c8fe1b]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={14} className="text-[#c8fe1b]" />
              <span className="text-[#c8fe1b] font-bold text-sm">{client.subscriptionPlan.name}</span>
            </div>
            <span className="text-[#c8fe1b]/60 text-xs font-bold">{client.subscriptionPlan.price} EGP</span>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 px-6 mt-4">
          {[
            { label: "Age",        value: `${client.age} yrs`,         icon: User   },
            { label: "Height",     value: client.height,                icon: Ruler  },
            { label: "Current Wt", value: client.currentWeight,         icon: Weight },
            { label: "Target Wt",  value: client.targetWeight,          icon: Target, highlight: true },
            { label: "Training",   value: `${client.trainingDaysPerWeek} days/wk`, icon: Activity },
            { label: "Experience", value: client.experienceLevel,       icon: TrendingUp },
          ].map(({ label, value, icon: Icon, highlight }) => (
            <div key={label} className={`rounded-xl border p-3 ${highlight ? "bg-[#c8fe1b]/[0.05] border-[#c8fe1b]/20" : "bg-white/[0.02] border-white/[0.06]"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={10} className={highlight ? "text-[#c8fe1b]/60" : "text-white/30"} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${highlight ? "text-[#c8fe1b]/60" : "text-white/30"}`}>{label}</span>
              </div>
              <p className={`text-sm font-extrabold capitalize ${highlight ? "text-[#c8fe1b]" : "text-white"}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Goals */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1.5">
              <Target size={12} className="text-violet-400" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Primary Goal</p>
            </div>
            <p className="text-sm text-white font-semibold">{client.goals}</p>
          </div>

          {client.foodPreferences && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1.5">
                <Apple size={12} className="text-emerald-400" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Food Preferences</p>
              </div>
              <p className="text-sm text-white font-semibold">{client.foodPreferences}</p>
            </div>
          )}

          {client.injuriesOrRestrictions && (
            <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck size={12} className="text-amber-400" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400/60">Injuries / Restrictions</p>
              </div>
              <p className="text-sm text-amber-200/80 font-semibold">{client.injuriesOrRestrictions}</p>
            </div>
          )}

          {/* Photos */}
          {client.images?.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Progress Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {client.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/[0.07]">
                    <img src={img} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.07] bg-card/50">
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-sm font-bold uppercase tracking-widest transition-all"
          >
            <Trash2 size={14} /> Delete Client
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Delete Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConfirmDelete({ email, onConfirm, onCancel, loading }: {
  email: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative w-full max-w-sm bg-card border border-red-500/20 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h3 className="text-lg font-extrabold text-white">Delete Client?</h3>
          <p className="text-sm text-white/50">
            Delete client <span className="text-white font-bold">"{email}"</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-white/60 text-sm font-bold uppercase tracking-wider hover:bg-white/[0.04] transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TraineesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [search, setSearch] = useState("");
  const [filterExp, setFilterExp] = useState<"all" | "Beginner" | "Intermediate" | "Advanced">("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/clients?page=${page}&limit=${LIMIT}`, { withCredentials: true });
      if (res.data.success) {
        setClients(res.data.data);
        setTotal(res.data.total || res.data.data.length);
      }
    } catch { showToast("Failed to load clients", false); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/clients/${deleteTarget._id}`, { withCredentials: true });
      setClients(prev => prev.filter(c => c._id !== deleteTarget._id));
      setTotal(t => t - 1);
      showToast("Client deleted successfully");
      setDetailClient(null);
    } catch { showToast("Failed to delete client", false); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(v => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const displayed = clients
    .filter(c => {
      const matchSearch = c.user.email.toLowerCase().includes(search.toLowerCase());
      const matchExp = filterExp === "all" || c.experienceLevel === filterExp;
      return matchSearch && matchExp;
    })
    .sort((a, b) => {
      let av: any = a[sortField as keyof Client];
      let bv: any = b[sortField as keyof Client];
      if (sortField === "email") { av = a.user.email; bv = b.user.email; }
      if (sortField === "plan") { av = a.subscriptionPlan?.name || ""; bv = b.subscriptionPlan?.name || ""; }
      if (typeof av === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors group">
      {label}
      <ArrowUpDown size={10} className={`transition-colors ${sortField === field ? "text-violet-400" : "text-white/20 group-hover:text-white/40"}`} />
    </button>
  );

  const totalPages = Math.ceil(total / LIMIT);
  const withSub    = clients.filter(c => c.subscriptionPlan).length;
  const beginners  = clients.filter(c => c.experienceLevel === "Beginner").length;
  const advanced   = clients.filter(c => c.experienceLevel === "Advanced").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-violet-400" /> Management
          </p>
          <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight leading-none">Clients</h1>
          <p className="text-white/40 text-sm mt-1">{total} total registered clients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Clients",  value: total,    icon: Users,        color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
          { label: "Subscribed",     value: withSub,  icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Beginners",      value: beginners, icon: TrendingUp,  color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20" },
          { label: "Advanced",       value: advanced, icon: Flame,        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className="text-white text-2xl font-extrabold leading-none">{loading ? "-" : s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative max-w-sm w-full">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/[0.07] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/40 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "Beginner", "Intermediate", "Advanced"] as const).map(f => (
            <button key={f} onClick={() => setFilterExp(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filterExp === f
                  ? "bg-violet-600/15 text-violet-300 border-violet-500/30"
                  : "bg-card text-white/40 border-white/[0.07] hover:text-white hover:border-white/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-white/25 text-xs font-semibold ml-auto">{displayed.length} shown</p>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.4fr_1.2fr_110px_140px_100px] gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
          <SortHeader field="email"      label="Client"     />
          <SortHeader field="plan"       label="Plan"       />
          <SortHeader field="goals"      label="Goal"       />
          <SortHeader field="age"        label="Age"        />
          <SortHeader field="experienceLevel" label="Level" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Actions</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-violet-400/40" />
            <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Loading clients...</p>
          </div>
        )}

        {/* Rows */}
        {!loading && (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {displayed.map((c, i) => {
                const expCfg = EXPERIENCE_CONFIG[c.experienceLevel] || EXPERIENCE_CONFIG.Beginner;
                return (
                  <motion.div
                    key={c._id} layout
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[2fr_1.4fr_1.2fr_110px_140px_100px] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Client */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-extrabold text-violet-300">{getInitials(c.user.email)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate">{c.user.email}</p>
                        <p className="text-white/30 text-[10px] mt-0.5">{c.user.phoneNumber || "-"}</p>
                      </div>
                    </div>

                    {/* Plan */}
                    <div>
                      {c.subscriptionPlan ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 text-[#c8fe1b] text-[10px] font-bold uppercase tracking-wider">
                            <Dumbbell size={9} /> {c.subscriptionPlan.name}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/30 text-[10px] font-bold uppercase tracking-wider">
                          No Plan
                        </span>
                      )}
                    </div>

                    {/* Goal */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Target size={11} className="text-white/20 flex-shrink-0" />
                      <span className="text-white/60 text-xs truncate capitalize">{c.goals}</span>
                    </div>

                    {/* Age */}
                    <p className="text-white/70 text-sm font-bold">{c.age} <span className="text-white/25 text-xs font-normal">yrs</span></p>

                    {/* Level */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border w-fit ${expCfg.class}`}>
                      <Flame size={9} /> {expCfg.label}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => setDetailClient(c)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        <Eye size={11} /> View
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 flex items-center justify-center text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty */}
        {!loading && displayed.length === 0 && (
          <div className="text-center py-20">
            <Users size={36} className="text-white/8 mx-auto mb-4" />
            <p className="text-white/25 font-bold uppercase tracking-wider text-sm">No clients found</p>
            <p className="text-white/15 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-3.5 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <p className="text-white/25 text-xs font-semibold">
            Page {page} of {totalPages || 1} · {total} total
          </p>
          <div className="flex gap-1 items-center">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  page === p
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-white/30 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {detailClient && (
          <ClientDetailDrawer
            client={detailClient}
            onClose={() => setDetailClient(null)}
            onDelete={() => { setDeleteTarget(detailClient); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDelete
            email={deleteTarget.user.email}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 border text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl z-[70] flex items-center gap-2 backdrop-blur-xl ${
              toast.ok ? "bg-muted/90 border-[#c8fe1b]/20 text-white" : "bg-muted/90 border-red-500/20 text-white"
            }`}
          >
            {toast.ok ? <CheckCircle2 size={14} className="text-[#c8fe1b]" /> : <XCircle size={14} className="text-red-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
