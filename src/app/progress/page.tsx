"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scale, Percent, TrendingDown, TrendingUp, Plus, Trash2,
  X, CalendarDays, GripHorizontal, ImageIcon, BarChart2,
  TableProperties, Camera, Ruler, ArrowDownRight, ArrowUpRight,
  Activity, Loader2, AlertCircle,
} from "lucide-react";
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/layout/Navbar";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";

// ╔══════════════════════════════════════════════╗
// ║               TYPES                          ║
// ╚══════════════════════════════════════════════╝
interface Measurements {
  chest: number;
  waist: number;
  bicep: number;
}
interface ProgressEntry {
  _id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  measurements: Measurements;
  photo: string;
  createdAt: string;
}

// ╔══════════════════════════════════════════════╗
// ║               HELPERS                        ║
// ╚══════════════════════════════════════════════╝
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

// ╔══════════════════════════════════════════════╗
// ║           CHART TOOLTIP                      ║
// ╚══════════════════════════════════════════════╝
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl px-4 py-3 border border-white/10 shadow-2xl"
      style={{ background: "rgba(6,6,6,0.96)", backdropFilter: "blur(16px)" }}
    >
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-white/50 text-xs font-semibold capitalize">
              {p.dataKey === "bodyFat" ? "Body Fat" : "Weight"}
            </span>
          </div>
          <span className="text-white font-extrabold text-sm">
            {p.value}{p.dataKey === "bodyFat" ? "%" : " kg"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ╔══════════════════════════════════════════════╗
// ║        BEFORE / AFTER SLIDER                 ║
// ╚══════════════════════════════════════════════╝
function PhotoSlider({ first, last, days, t }: { first: ProgressEntry; last: ProgressEntry; days: number; t: any }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    setPos(Math.max(4, Math.min(96, ((clientX - left) / width) * 100)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-2xl bg-black cursor-ew-resize"
      style={{ height: 420, touchAction: "none" }}
      onPointerDown={e => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updatePos(e.clientX);
      }}
      onPointerMove={e => { if (dragging.current) updatePos(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
    >
      {/* After photo */}
      <img src={last.photo} alt="After" className="absolute inset-0 w-full h-full object-cover" />

      {/* Before photo (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={first.photo} alt="Before"
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth ?? "100%", maxWidth: "none" }}
        />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{ left: `${pos}%`, transform: "translateX(-50%)", background: "#c8fe1b" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-2xl flex items-center justify-center"
          style={{ background: "#c8fe1b" }}
        >
          <GripHorizontal size={16} className="text-black" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4">
        <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold tracking-wider">
          {t("before")} · {fmtShort(first.date)}
        </div>
        <p className="mt-1.5 text-white/50 text-[10px] font-semibold px-1">{first.weight} kg · {first.bodyFat ?? "—"}%</p>
      </div>
      <div className="absolute top-4 right-4 text-right">
        <div
          className="px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-bold tracking-wider"
          style={{ background: "rgba(200,254,27,0.15)", borderColor: "rgba(200,254,27,0.3)", color: "#c8fe1b" }}
        >
          {t("day")} {days} · {fmtShort(last.date)}
        </div>
        <p className="mt-1.5 text-white/50 text-[10px] font-semibold px-1">{last.weight} kg · {last.bodyFat ?? "—"}%</p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/50 text-[10px] font-semibold tracking-widest uppercase">
        {t("dragToCompare")}
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════╗
// ║           LOG ENTRY DRAWER                   ║
// ╚══════════════════════════════════════════════╝
const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  weight: "", bodyFat: "", chest: "", waist: "", bicep: "",
};

function LogDrawer({ open, onClose, onSaved, t }: {
  open: boolean;
  onClose: () => void;
  onSaved: (entry: ProgressEntry) => void;
  t: any;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) { setPhoto(file); setError(""); }
  };

  const handleSubmit = async () => {
    if (!form.weight) { setError("Weight is required."); return; }
    if (!form.chest || !form.waist || !form.bicep) { setError("All measurements are required."); return; }
    if (!photo) { setError("Please upload a progress photo."); return; }

    const fd = new FormData();
    fd.append("date", form.date);
    fd.append("weight", form.weight);
    if (form.bodyFat) fd.append("bodyFat", form.bodyFat);
    fd.append("measurements[chest]", form.chest);
    fd.append("measurements[waist]", form.waist);
    fd.append("measurements[bicep]", form.bicep);
    fd.append("photo", photo);

    setSaving(true);
    setError("");
    try {
      const res = await axiosInstance.post("/progress", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSaved(res.data.data);
      setForm(EMPTY_FORM);
      setPhoto(null);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[440px] flex flex-col border-l border-white/[0.08]"
            style={{ background: "linear-gradient(180deg,#111 0%,#0a0a0a 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: "#c8fe1b" }}>{t("progressSmall")}</p>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{t("logNewEntry")}</h2>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/[0.07] flex items-center justify-center text-white/40 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">{t("date")}</label>
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-semibold focus:outline-none transition-all"
                    style={{ outlineColor: "#c8fe1b" }}
                    onFocus={e => (e.target.style.borderColor = "rgba(200,254,27,0.4)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
              </div>

              {/* Weight + Body Fat */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "weight", label: t("weightKg"), icon: Scale },
                  { key: "bodyFat", label: t("bodyFatPct"), icon: Percent },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">{label}</label>
                    <div className="relative">
                      <Icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                      <input type="number" step="0.1" placeholder="0.0"
                        value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                        className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-semibold focus:outline-none transition-all placeholder:text-white/15"
                        onFocus={e => (e.target.style.borderColor = "rgba(200,254,27,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Measurements */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center gap-2">
                  <Ruler size={11} /> {t("measurementsCm")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ key: "chest", label: t("chest") }, { key: "waist", label: t("waist") }, { key: "bicep", label: t("bicep") }].map(({ key, label }) => (
                    <div key={key}>
                      <span className="block text-[9px] text-white/25 font-bold uppercase tracking-widest mb-1.5">{label}</span>
                      <input type="number" step="0.1" placeholder="—"
                        value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-semibold text-center focus:outline-none transition-all placeholder:text-white/15"
                        onFocus={e => (e.target.style.borderColor = "rgba(200,254,27,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3 flex items-center gap-2">
                  <Camera size={11} /> {t("progressPhoto")} <span className="text-red-400 ml-1">*</span>
                </label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? "rgba(200,254,27,0.5)" : photo ? "rgba(200,254,27,0.25)" : "rgba(255,255,255,0.08)",
                    background: dragOver ? "rgba(200,254,27,0.04)" : photo ? "rgba(200,254,27,0.02)" : "transparent",
                  }}
                >
                  {photo ? (
                    <>
                      <div className="w-20 h-20 rounded-xl overflow-hidden border" style={{ borderColor: "rgba(200,254,27,0.3)" }}>
                        <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                      <p className="text-[11px] font-bold" style={{ color: "#c8fe1b" }}>{photo.name}</p>
                      <p className="text-white/25 text-[10px]">{t("clickToChange")}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                        <ImageIcon size={22} className="text-white/20" />
                      </div>
                      <p className="text-white/40 text-xs font-bold">{t("clickOrDrag")}</p>
                      <p className="text-white/20 text-[10px]">{t("photoHint")}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
                  >
                    <AlertCircle size={14} className="flex-shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-white/[0.07] space-y-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-3.5 rounded-xl text-black text-sm font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "#c8fe1b", boxShadow: "0 0 28px rgba(200,254,27,0.35)" }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={2.5} />}
                {saving ? t("saving") : t("saveEntry")}
              </button>
              <button onClick={onClose} className="w-full py-3 rounded-xl border border-white/[0.07] text-white/40 text-sm font-bold uppercase tracking-wider hover:bg-white/[0.03] transition-all">
                {t("cancel")}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ╔══════════════════════════════════════════════╗
// ║         DELETE CONFIRM MODAL                 ║
// ╚══════════════════════════════════════════════╝
function DeleteModal({ open, date, deleting, onClose, onConfirm, t }: {
  open: boolean; date: string; deleting: boolean;
  onClose: () => void; onConfirm: () => void;
  t: any;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 rounded-3xl border border-red-500/20 shadow-2xl"
            style={{ background: "#111" }}
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 size={26} className="text-red-400" />
              </div>
              <h3 className="text-lg font-extrabold text-white">{t("deleteEntryTitle")}</h3>
              <p className="text-sm text-white/45" dangerouslySetInnerHTML={{ __html: t("removeConfirm", { date: `<span class="text-white font-bold">${date}</span>` }) }}></p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-white/50 text-sm font-bold uppercase tracking-wider hover:bg-white/[0.04] transition-all">{t("cancel")}</button>
              <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting && <Loader2 size={13} className="animate-spin" />} {t("deleteBtn")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ╔══════════════════════════════════════════════╗
// ║               MAIN PAGE                      ║
// ╚══════════════════════════════════════════════╝
type Tab = "overview" | "history" | "photos";

export default function ProgressPage() {
  const t = useTranslations("progressPage");

  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch on mount ──
  useEffect(() => {
    axiosInstance.get("/progress/me")
      .then(res => setEntries(res.data.data || []))
      .catch(() => setFetchError(t("errorLoad")))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ──
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

  const totalWeightDelta = latest && first ? +(latest.weight - first.weight).toFixed(1) : 0;
  const periodWeightDelta = latest && prev ? +(latest.weight - prev.weight).toFixed(1) : 0;
  const bfDelta = latest && prev ? +((latest.bodyFat ?? 0) - (prev.bodyFat ?? 0)).toFixed(1) : 0;
  const totalDays = first && latest ? daysBetween(first.date, latest.date) : 0;

  const chartData = sorted.map(e => ({
    date: fmtShort(e.date),
    weight: e.weight,
    bodyFat: e.bodyFat,
  }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/progress/${deleteTarget}`);
      setEntries(prev => prev.filter(e => e._id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      // keep modal open on error
    } finally {
      setDeleting(false);
    }
  };

  const LIME = "#c8fe1b";

  const STAT_CARDS = [
    {
      id: "cw", icon: Scale, label: t("currentWeight"),
      value: latest?.weight ?? "—", unit: t("kgUnit"),
      sub: prev ? `${periodWeightDelta >= 0 ? "+" : ""}${periodWeightDelta} ${t("kgUnit")} ${t("sinceLastEntry")}` : t("firstEntry"),
      positive: periodWeightDelta <= 0,
    },
    {
      id: "td", icon: Activity, label: t("totalChange"),
      value: `${totalWeightDelta >= 0 ? "+" : ""}${totalWeightDelta}`, unit: t("kgUnit"),
      sub: t("overDaysChecks", { days: totalDays, count: sorted.length }),
      positive: totalWeightDelta <= 0,
    },
    {
      id: "bf", icon: Percent, label: t("bodyFat"),
      value: latest?.bodyFat ?? "—", unit: "%",
      sub: prev ? `${bfDelta >= 0 ? "+" : ""}${bfDelta}% ${t("sinceLastCheck")}` : t("firstEntry"),
      positive: bfDelta <= 0,
    },
  ];

  const TABS: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: "overview", label: t("tabCharts"), icon: BarChart2 },
    { id: "history", label: t("tabHistory"), icon: TableProperties },
    { id: "photos", label: t("tabPhotos"), icon: ImageIcon },
  ];

  // ── Loading ──
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin" style={{ color: LIME }} />
          <p className="text-white/40 text-sm font-semibold uppercase tracking-widest">{t("loading")}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
        <Navbar />

        <div className="max-w-[1280px] mx-auto px-5 pt-28 pb-20">

          {/* ─── Page Header ─── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-2" style={{ color: LIME }}>
                <span className="w-5 h-px" style={{ background: LIME }} />
                {t("bodyTransformation")}
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter">
                {t("title1")} <span style={{ color: LIME }}>{t("title2")}</span>
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-black text-sm font-extrabold uppercase tracking-widest transition-all"
              style={{ background: LIME, boxShadow: "0 0 28px rgba(200,254,27,0.4)" }}
            >
              <Plus size={17} strokeWidth={2.5} /> {t("logEntryBtn")}
            </motion.button>
          </div>

          {/* ─── Fetch Error ─── */}
          <AnimatePresence>
            {fetchError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-8"
              >
                <AlertCircle size={18} /> {fetchError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Empty State ─── */}
          {entries.length === 0 && !fetchError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-5"
            >
              <div className="w-24 h-24 rounded-3xl border border-white/[0.07] bg-white/[0.02] flex items-center justify-center">
                <Activity size={36} className="text-white/20" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-extrabold text-white mb-2">{t("emptyTitle")}</h3>
                <p className="text-white/35 text-sm mb-6">{t("emptyDesc")}</p>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-black text-sm font-bold uppercase tracking-widest mx-auto"
                  style={{ background: LIME }}
                >
                  <Plus size={16} /> {t("logFirstBtn")}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── Stat Cards ─── */}
          {entries.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {STAT_CARDS.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="relative border border-white/[0.07] rounded-2xl p-6 overflow-hidden"
                    style={{
                      background: "#111111",
                      boxShadow: card.positive
                        ? "0 0 30px rgba(200,254,27,0.06)"
                        : "0 0 30px rgba(239,68,68,0.06)",
                    }}
                  >
                    {/* Glow blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                      style={{ background: card.positive ? "rgba(200,254,27,0.08)" : "rgba(239,68,68,0.08)" }}
                    />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-11 h-11 rounded-xl border flex items-center justify-center"
                          style={{
                            background: card.positive ? "rgba(200,254,27,0.08)" : "rgba(239,68,68,0.08)",
                            borderColor: card.positive ? "rgba(200,254,27,0.2)" : "rgba(239,68,68,0.2)",
                          }}
                        >
                          <card.icon size={20} style={{ color: card.positive ? LIME : "#f87171" }} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full border"
                          style={{
                            color: card.positive ? LIME : "#f87171",
                            background: card.positive ? "rgba(200,254,27,0.08)" : "rgba(239,68,68,0.08)",
                            borderColor: card.positive ? "rgba(200,254,27,0.2)" : "rgba(239,68,68,0.2)",
                          }}
                        >
                          {card.positive ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
                          {card.positive ? t("dropping") : t("rising")}
                        </div>
                      </div>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{card.label}</p>
                      <p className="text-4xl font-extrabold tracking-tight text-white mb-1">
                        {card.value}<span className="text-xl text-white/35 ml-1">{card.unit}</span>
                      </p>
                      <p className="text-white/30 text-xs">{card.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ─── Tab Nav ─── */}
              <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl border border-white/[0.06] w-fit" style={{ background: "#111111" }}>
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    style={{ color: activeTab === tab.id ? "#000" : "rgba(255,255,255,0.35)" }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="progress-tab-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: LIME, boxShadow: `0 0 20px rgba(200,254,27,0.4)` }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <tab.icon size={14} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* ─── Tab Content ─── */}
              <AnimatePresence mode="wait">

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <div className="border border-white/[0.07] rounded-2xl p-6 mb-6" style={{ background: "#111111" }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1">{t("allTime")}</p>
                          <h2 className="text-xl font-extrabold uppercase tracking-tight">{t("weightAndBodyFat")}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ background: LIME }} />
                            <span className="text-white/40 text-xs font-semibold">{t("weightKg")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-400" />
                            <span className="text-white/40 text-xs font-semibold">{t("bodyFatPct")}</span>
                          </div>
                        </div>
                      </div>

                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={LIME} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={LIME} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="w" orientation="left" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} tickFormatter={v => `${v}kg`} domain={["auto", "auto"]} />
                          <YAxis yAxisId="bf" orientation="right" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${v}%`} domain={["auto", "auto"]} />
                          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                          <Area yAxisId="w" type="monotone" dataKey="weight" stroke={LIME} strokeWidth={2.5} fill="url(#wGrad)"
                            dot={{ fill: LIME, strokeWidth: 0, r: 5 }}
                            activeDot={{ r: 7, fill: LIME, stroke: "rgba(200,254,27,0.3)", strokeWidth: 8 }}
                          />
                          <Line yAxisId="bf" type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3"
                            dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: "#f59e0b", stroke: "rgba(245,158,11,0.35)", strokeWidth: 6 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: t("entriesLogged"), value: sorted.length, unit: "" },
                        { label: t("journey"), value: totalDays, unit: t("daysUnit") },
                        { label: t("chestChange"), value: first && latest ? +(first.measurements.chest - latest.measurements.chest).toFixed(1) : 0, unit: t("cmUnit") },
                        { label: t("waistChange"), value: first && latest ? +(first.measurements.waist - latest.measurements.waist).toFixed(1) : 0, unit: t("cmUnit") },
                      ].map(({ label, value, unit }) => (
                        <div key={label} className="border border-white/[0.06] rounded-2xl p-5" style={{ background: "#111111" }}>
                          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
                          <p className="text-2xl font-extrabold text-white">{value}<span className="text-sm text-white/30 ml-1">{unit}</span></p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* HISTORY */}
                {activeTab === "history" && (
                  <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <div className="border border-white/[0.07] rounded-2xl overflow-hidden" style={{ background: "#111111" }}>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                              {[t("date"), t("weight"), t("bodyFat"), t("chest"), t("waist"), t("bicep"), t("photo"), ""].map(h => (
                                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-white/25 px-5 py-4">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            <AnimatePresence>
                              {[...sorted].reverse().map((entry, i) => (
                                <motion.tr
                                  key={entry._id}
                                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 8 }}
                                  transition={{ delay: i * 0.04 }}
                                  className="hover:bg-white/[0.02] transition-colors group"
                                >
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(200,254,27,0.07)", borderColor: "rgba(200,254,27,0.15)" }}
                                      >
                                        <CalendarDays size={13} style={{ color: LIME }} />
                                      </div>
                                      <span className="text-sm font-bold text-white">{fmtDate(entry.date)}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-sm font-extrabold text-white">{entry.weight}<span className="text-[10px] text-white/30 ml-1">{t("kgUnit")}</span></td>
                                  <td className="px-5 py-4 text-sm font-extrabold text-amber-400">{entry.bodyFat ?? "—"}<span className="text-[10px] text-white/30 ml-0.5">%</span></td>
                                  <td className="px-5 py-4 text-sm font-semibold text-white/60">{entry.measurements.chest}<span className="text-[9px] text-white/25 ml-0.5">{t("cmUnit")}</span></td>
                                  <td className="px-5 py-4 text-sm font-semibold text-white/60">{entry.measurements.waist}<span className="text-[9px] text-white/25 ml-0.5">{t("cmUnit")}</span></td>
                                  <td className="px-5 py-4 text-sm font-semibold text-white/60">{entry.measurements.bicep}<span className="text-[9px] text-white/25 ml-0.5">{t("cmUnit")}</span></td>
                                  <td className="px-5 py-4">
                                    {entry.photo && (
                                      <img src={entry.photo} alt="progress" className="w-10 h-10 rounded-xl object-cover border border-white/[0.08]" />
                                    )}
                                  </td>
                                  <td className="px-5 py-4">
                                    <button
                                      onClick={() => setDeleteTarget(entry._id)}
                                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg border-transparent hover:border-red-500/20 flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/10 border transition-all"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>
                      <div className="px-5 py-3.5 border-t border-white/[0.05] bg-white/[0.01]">
                        <p className="text-white/20 text-xs font-semibold">{entries.length} {t("entriesTotal")}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PHOTOS */}
                {activeTab === "photos" && sorted.length >= 2 && (
                  <motion.div key="photos" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">
                    {/* Stats banner */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: t("weightLost"), value: `${Math.abs(totalWeightDelta)} ${t("kgUnit")}`, icon: TrendingDown, lime: true },
                        { label: t("bodyFatDropped"), value: `${Math.abs(+(first.bodyFat ?? 0) - (latest.bodyFat ?? 0)).toFixed(1)}%`, icon: TrendingDown, lime: true },
                        { label: t("daysActive"), value: `${totalDays}`, icon: Activity, lime: false },
                      ].map(({ label, value, icon: Icon, lime }) => (
                        <div key={label} className="rounded-2xl p-4 border flex items-center gap-3"
                          style={{
                            background: lime ? "rgba(200,254,27,0.04)" : "rgba(255,255,255,0.03)",
                            borderColor: lime ? "rgba(200,254,27,0.15)" : "rgba(255,255,255,0.07)",
                          }}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: lime ? "rgba(200,254,27,0.1)" : "rgba(255,255,255,0.05)" }}
                          >
                            <Icon size={16} style={{ color: lime ? LIME : "rgba(255,255,255,0.4)" }} />
                          </div>
                          <div>
                            <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest">{label}</p>
                            <p className="text-base font-extrabold text-white">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Slider */}
                    <div className="border border-white/[0.07] rounded-2xl p-6" style={{ background: "#111111" }}>
                      <div className="mb-5">
                        <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1">{t("transformation")}</p>
                        <h2 className="text-xl font-extrabold uppercase tracking-tight">{t("tabPhotos")}</h2>
                      </div>
                      <PhotoSlider first={first} last={latest} days={totalDays} t={t} />
                    </div>

                    {/* All photos grid */}
                    <div className="border border-white/[0.07] rounded-2xl p-6" style={{ background: "#111111" }}>
                      <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-4">{t("allProgressPhotos")}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {sorted.map((entry, i) => (
                          <motion.div key={entry._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.07] hover:border-[#c8fe1b]/25 transition-all group cursor-pointer"
                          >
                            {entry.photo
                              ? <img src={entry.photo} alt={fmtShort(entry.date)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              : <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a1a" }}><ImageIcon size={24} className="text-white/20" /></div>
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-[10px] font-bold">{fmtShort(entry.date)}</p>
                              <p className="text-white/50 text-[9px] font-semibold">{entry.weight} {t("kgUnit")}</p>
                            </div>
                            {i === 0 && <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-[8px] font-bold uppercase text-white">{t("start")}</div>}
                            {i === sorted.length - 1 && <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md backdrop-blur-sm text-[8px] font-bold uppercase" style={{ background: "rgba(200,254,27,0.25)", color: LIME }}>{t("latest")}</div>}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PHOTOS — not enough data */}
                {activeTab === "photos" && sorted.length < 2 && (
                  <motion.div key="photos-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <ImageIcon size={30} className="text-white/15" />
                    </div>
                    <p className="text-white/40 text-sm font-semibold">{t("logAtLeast2")}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      {/* Drawer & Modal */}
      <LogDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={entry => setEntries(prev => [...prev, entry])}
        t={t}
      />
      <DeleteModal
        open={!!deleteTarget}
        date={deleteTarget ? fmtDate(entries.find(e => e._id === deleteTarget)?.date ?? "") : ""}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        t={t}
      />
    </>
  );
}
