"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dumbbell, Flame, Clock, TrendingUp, Calendar,
  Plus, X, Loader2, AlertCircle, CheckCircle2, Minus,
  BarChart2, TableProperties, Zap, Activity, Target,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/layout/Navbar";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";

// ══════════════════════════ TYPES ══════════════════════════
interface ExercisePlan {
  exerciseId: { _id: string; name: string; bodyPart: string } | null;
  sets: number;
  reps: number;
  restTimeMinutes: number;
}
interface DayPlan { _id: string; dayName: string; exercises: ExercisePlan[]; }
interface WorkoutPlan { _id: string; planName: string; days: DayPlan[]; }
interface WorkoutLog {
  _id: string; date: string; dayName: string;
  durationMinutes?: number; overallMood?: string; generalNotes?: string;
  exercises: { exerciseId: { name: string; bodyPart: string } | null; sets: { reps: number; weight: number }[]; }[];
  createdAt: string;
}
interface Stats {
  weekly: { sessions: number; totalVolumeKg: number; avgDurationMin: number };
  monthly: { sessions: number; totalVolumeKg: number; avgDurationMin: number };
  allTime: { totalSessions: number; currentStreak: number };
  monthlyBreakdown: { month: string; sessions: number; volume: number }[];
}
interface SetEntry { reps: string; weight: string; }
interface ExerciseEntry { exerciseId: string; name: string; sets: SetEntry[]; exerciseNotes: string; }

// ══════════════════════════ CONSTS ══════════════════════════
const LIME = "#c8fe1b";
const MOODS = ["Excellent", "Good", "Normal", "Tired", "Bad"] as const;
const MOOD_ICON: Record<string, string> = { Excellent: "🔥", Good: "💪", Normal: "😐", Tired: "😴", Bad: "😞" };
const MOOD_COLOR: Record<string, string> = {
  Excellent: "text-lime-400 border-lime-500/30 bg-lime-500/10",
  Good: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  Normal: "text-slate-300 border-slate-500/30 bg-slate-500/10",
  Tired: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Bad: "text-red-400 border-red-500/30 bg-red-500/10",
};
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ══════════════════════════ CHART TOOLTIP ══════════════════════════
function BarTooltip({ active, payload, label, t }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-4 py-3 border border-white/10 shadow-2xl" style={{ background: "rgba(6,6,6,0.95)", backdropFilter: "blur(16px)" }}>
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-white font-extrabold text-sm">{payload[0].value} <span className="text-white/40 font-normal">{t("sessions")}</span></p>
    </div>
  );
}

// ══════════════════════════ LOG SESSION MODAL ══════════════════════════
function LogModal({ open, plan, onClose, onSaved, t }: {
  open: boolean; plan: WorkoutPlan | null;
  onClose: () => void; onSaved: (log: WorkoutLog) => void;
  t: any;
}) {
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [mood, setMood] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pickDay = (day: DayPlan) => {
    setSelectedDay(day);
    setExercises(day.exercises.map(e => ({
      exerciseId: (e.exerciseId as any)?._id ?? e.exerciseId,
      name: (e.exerciseId as any)?.name || (e as any).name || (e as any).exerciseName || "Unknown Exercise",
      bodyPart: (e.exerciseId as any)?.bodyPart || (e as any).bodyPart || (e as any).target || "General",
      sets: Array.from({ length: e.sets }, () => ({ reps: String(e.reps), weight: "" })),
      exerciseNotes: "",
    })));
  };

  const updateSet = (ei: number, si: number, k: "reps" | "weight", v: string) =>
    setExercises(p => p.map((ex, i) => i !== ei ? ex : { ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [k]: v }) }));

  const addSet = (ei: number) =>
    setExercises(p => p.map((ex, i) => i !== ei ? ex : { ...ex, sets: [...ex.sets, { reps: "", weight: "" }] }));

  const removeSet = (ei: number, si: number) =>
    setExercises(p => p.map((ex, i) => i !== ei ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== si) }));

  const reset = () => {
    setSelectedDay(null); setExercises([]); setMood(""); setDuration(""); setNotes("");
    setDate(new Date().toISOString().slice(0, 10)); setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!selectedDay) { setError("Please select a training day."); return; }
    if (!plan) return;
    setError(""); setSaving(true);
    try {
      const res = await axiosInstance.post("/workout-logs", {
        workoutPlan: plan._id, dayName: selectedDay.dayName, date,
        durationMinutes: duration ? Number(duration) : undefined,
        overallMood: mood || undefined, generalNotes: notes || undefined,
        exercises: exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.filter(s => s.reps && s.weight).map(s => ({ reps: Number(s.reps), weight: Number(s.weight) })),
          exerciseNotes: ex.exerciseNotes || undefined,
        })).filter(ex => ex.sets.length > 0),
      });
      onSaved(res.data.data);
      reset(); onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const IC = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-semibold focus:outline-none transition-all placeholder:text-white/15";
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "rgba(200,254,27,0.4)");
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "rgba(255,255,255,0.08)");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md" onClick={handleClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-2 sm:inset-6 lg:inset-10 z-50 rounded-2xl sm:rounded-3xl border border-white/[0.09] flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(145deg,#141414 0%,#0c0c0c 100%)" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(200,254,27,0.1)", borderColor: "rgba(200,254,27,0.25)" }}>
                  <Dumbbell size={18} style={{ color: LIME }} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: LIME }}>{t("trainingSession")}</p>
                  <h2 className="text-lg font-extrabold text-white tracking-tight leading-none">{t("logWorkout")}</h2>
                </div>
              </div>
              <button onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/[0.07] flex items-center justify-center text-white/40 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            {!plan ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Dumbbell size={28} className="text-white/15" />
                </div>
                <p className="text-white/40 text-base font-semibold">{t("noPlan")}</p>
                <p className="text-white/25 text-sm">{t("askCoach")}</p>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden min-h-0">

                {/* ── LEFT COLUMN ── */}
                <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col border-r border-white/[0.06] overflow-y-auto">
                  <div className="p-6 space-y-5">

                    {/* Plan info */}
                    <div className="px-4 py-3 rounded-2xl border border-white/[0.06]" style={{ background: "rgba(200,254,27,0.03)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: LIME }}>{t("activePlan")}</p>
                      <p className="text-white font-extrabold text-base leading-tight">{plan.planName}</p>
                      <p className="text-white/30 text-xs mt-0.5">{plan.days.length} {t("trainingDays")}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">{t("date")}</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} className={IC} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    {/* Day picker */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">{t("selectDay")}</label>
                      <div className="space-y-2">
                        {plan.days.map(day => {
                          const active = selectedDay?._id === day._id;
                          return (
                            <button key={day._id} onClick={() => pickDay(day)}
                              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-left border transition-all"
                              style={{
                                borderColor: active ? "rgba(200,254,27,0.35)" : "rgba(255,255,255,0.07)",
                                background: active ? "rgba(200,254,27,0.07)" : "rgba(255,255,255,0.02)",
                                color: active ? LIME : "rgba(255,255,255,0.55)",
                              }}
                            >
                              <span>{day.dayName}</span>
                              <span className="text-[10px] font-semibold opacity-60">{day.exercises.length} {t("ex")}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mood */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">{t("howDidYouFeel")}</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {MOODS.map(m => (
                          <button key={m} onClick={() => setMood(m)}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all ${mood === m ? MOOD_COLOR[m] : "border-white/[0.07] text-white/30 hover:text-white/50 hover:bg-white/[0.03]"}`}
                          >
                            <span className="text-xl">{MOOD_ICON[m]}</span>
                            <span className="text-[9px]">{t(`moods.${m}`)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration + Notes */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2 flex items-center gap-1"><Clock size={10} /> {t("min")}</label>
                        <input type="number" placeholder="60" value={duration} onChange={e => setDuration(e.target.value)} className={IC} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">{t("notes")}</label>
                        <input type="text" placeholder={t("notesPlaceholder")} value={notes} onChange={e => setNotes(e.target.value)} className={IC} onFocus={onFocus} onBlur={onBlur} />
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
                </div>

                {/* ── RIGHT COLUMN: Exercise logging ── */}
                <div className="hidden lg:flex flex-1 flex-col overflow-hidden min-h-0">
                  {!selectedDay ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-12">
                      <div className="w-24 h-24 rounded-3xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                        <Dumbbell size={34} className="text-white/10" />
                      </div>
                      <div>
                        <p className="text-white/30 text-base font-bold">{t("noDaySelected")}</p>
                        <p className="text-white/20 text-sm mt-1">{t("pickDayLeft")}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Right panel header */}
                      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">{t("logging")}</p>
                          <h3 className="text-xl font-extrabold text-white tracking-tight">{selectedDay.dayName}</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold"
                          style={{ color: LIME, borderColor: "rgba(200,254,27,0.2)", background: "rgba(200,254,27,0.07)" }}
                        >
                          <Dumbbell size={12} /> {exercises.length} {t("exercises")}
                        </div>
                      </div>

                      {/* Exercise cards grid — scrollable */}
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {exercises.map((ex, ei) => (
                            <div key={ei} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                              {/* Card header */}
                              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]"
                                style={{ background: "rgba(200,254,27,0.025)" }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{ background: "rgba(200,254,27,0.12)" }}>
                                  <Dumbbell size={14} style={{ color: LIME }} />
                                </div>
                                <p className="text-white text-sm font-extrabold flex-1 truncate">{ex.name}</p>
                                <span className="text-[10px] text-white/25 font-semibold">{ex.sets.length} {t("sets")}</span>
                              </div>

                              {/* Sets */}
                              <div className="px-4 py-3 space-y-2">
                                <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2">
                                  <span className="text-[9px] text-white/20 font-bold uppercase text-center">#</span>
                                  <span className="text-[9px] text-white/20 font-bold uppercase">{t("reps")}</span>
                                  <span className="text-[9px] text-white/20 font-bold uppercase">{t("kg")}</span>
                                  <span />
                                </div>
                                {ex.sets.map((set, si) => (
                                  <div key={si} className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 items-center">
                                    <span className="text-xs font-extrabold text-white/20 text-center">{si + 1}</span>
                                    <input type="number" min="0" placeholder="0" value={set.reps}
                                      onChange={e => updateSet(ei, si, "reps", e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07] text-white text-sm font-bold text-center focus:outline-none transition-all placeholder:text-white/15"
                                      onFocus={e => (e.target.style.borderColor = "rgba(200,254,27,0.35)")}
                                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                                    />
                                    <input type="number" min="0" step="0.5" placeholder="0" value={set.weight}
                                      onChange={e => updateSet(ei, si, "weight", e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07] text-white text-sm font-bold text-center focus:outline-none transition-all placeholder:text-white/15"
                                      onFocus={e => (e.target.style.borderColor = "rgba(200,254,27,0.35)")}
                                      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                                    />
                                    <button onClick={() => removeSet(ei, si)} disabled={ex.sets.length <= 1}
                                      className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-red-400/30 hover:text-red-400 transition-all disabled:opacity-20">
                                      <Minus size={12} />
                                    </button>
                                  </div>
                                ))}
                                <button onClick={() => addSet(ei)}
                                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
                                  style={{ color: LIME }}>
                                  <Plus size={11} /> {t("addSet")}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bottom action bar */}
            {plan && (
              <div className="px-6 py-4 border-t border-white/[0.07] flex items-center gap-3 flex-shrink-0"
                style={{ background: "rgba(0,0,0,0.25)" }}>
                <button onClick={handleClose}
                  className="px-6 py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm font-bold uppercase tracking-wider hover:bg-white/[0.03] transition-all">
                  {t("cancel")}
                </button>
                <button onClick={handleSubmit} disabled={saving}
                  className="flex-1 py-3 rounded-xl text-black text-sm font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: LIME, boxShadow: "0 0 28px rgba(200,254,27,0.35)" }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} strokeWidth={2.5} />}
                  {saving ? t("saving") : t("saveWorkout")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════ MAIN PAGE ══════════════════════════
type Tab = "stats" | "history";

export default function WorkoutLogPage() {
  const t = useTranslations("workoutLogPage");

  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, logsRes, planRes] = await Promise.allSettled([
          axiosInstance.get("/workout-logs/me/stats"),
          axiosInstance.get("/workout-logs/me"),
          axiosInstance.get("/workout-plans/me"),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (logsRes.status === "fulfilled") setLogs(logsRes.value.data.data ?? []);
        if (planRes.status === "fulfilled") setPlan(planRes.value.data.data);
      } catch { setFetchError("Failed to load workout data."); }
      finally { setLoading(false); }
    })();
  }, []);

  const TABS: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: "stats", label: t("tabStats"), icon: BarChart2 },
    { id: "history", label: t("tabHistory"), icon: TableProperties },
  ];

  const STAT_CARDS = stats ? [
    { label: t("thisWeek"), value: stats.weekly.sessions, unit: t("sessions"), icon: Calendar, color: LIME, glow: "rgba(200,254,27,0.06)" },
    { label: t("thisMonth"), value: stats.monthly.sessions, unit: t("sessions"), icon: Activity, color: "#e2e8f0", glow: "rgba(226,232,240,0.04)" },
    { label: t("currentStreak"), value: stats.allTime.currentStreak, unit: t("days"), icon: Flame, color: "#f97316", glow: "rgba(249,115,22,0.06)" },
    { label: t("avgDuration"), value: stats.monthly.avgDurationMin, unit: t("min"), icon: Clock, color: "#34d399", glow: "rgba(52,211,153,0.06)" },
  ] : [];

  if (loading) {
    return (
      <main className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={36} className="animate-spin" style={{ color: LIME }} />
            <p className="text-white/40 text-sm font-semibold uppercase tracking-widest">{t("loading")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-5 pt-28 pb-20">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-2" style={{ color: LIME }}>
                <span className="w-5 h-px" style={{ background: LIME }} /> {t("trainingTitle")}
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter">
                {t("title1")} <span style={{ color: LIME }}>{t("title2")}</span>
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-black text-sm font-extrabold uppercase tracking-widest transition-all"
              style={{ background: LIME, boxShadow: "0 0 28px rgba(200,254,27,0.4)" }}
            >
              <Plus size={17} strokeWidth={2.5} /> {t("logSessionBtn")}
            </motion.button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {fetchError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-8">
                <AlertCircle size={18} /> {fetchError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {STAT_CARDS.map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.09 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative border border-white/[0.07] rounded-2xl p-5 overflow-hidden"
                style={{ background: "#111111", boxShadow: `0 0 30px ${card.glow}` }}
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl pointer-events-none" style={{ background: card.glow }} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4"
                    style={{ background: `${card.color}14`, borderColor: `${card.color}30` }}>
                    <card.icon size={18} style={{ color: card.color }} />
                  </div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <p className="text-3xl font-extrabold text-white">{card.value}<span className="text-sm text-white/30 ml-1">{card.unit}</span></p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {!stats && logs.length === 0 && !fetchError && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Dumbbell size={30} className="text-white/15" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-extrabold text-white mb-2">{t("noSessionsTitle")}</h3>
                <p className="text-white/35 text-sm mb-6">{t("noSessionsDesc")}</p>
                <button onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-black text-sm font-bold uppercase tracking-widest mx-auto"
                  style={{ background: LIME }}>
                  <Plus size={16} /> {t("logFirstBtn")}
                </button>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          {(stats || logs.length > 0) && (
            <>
              <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl border border-white/[0.06] w-fit" style={{ background: "#111111" }}>
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    style={{ color: activeTab === tab.id ? "#000" : "rgba(255,255,255,0.35)" }}>
                    {activeTab === tab.id && (
                      <motion.div layoutId="wl-tab" className="absolute inset-0 rounded-xl"
                        style={{ background: LIME, boxShadow: "0 0 20px rgba(200,254,27,0.4)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                    <tab.icon size={14} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">

                {/* Stats Tab */}
                {activeTab === "stats" && stats && (
                  <motion.div key="stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                      {/* Chart */}
                      <div className="xl:col-span-2 border border-white/[0.07] rounded-2xl p-6" style={{ background: "#111111" }}>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-1">{t("trend6Month")}</p>
                            <h2 className="text-xl font-extrabold uppercase tracking-tight">{t("sessionsPerMonth")}</h2>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border"
                            style={{ color: LIME, background: "rgba(200,254,27,0.08)", borderColor: "rgba(200,254,27,0.2)" }}>
                            <TrendingUp size={13} /> {stats.monthly.sessions} {t("thisMonthCount")}
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={stats.monthlyBreakdown} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                            <Tooltip content={<BarTooltip t={t} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="sessions" fill={LIME} radius={[6, 6, 0, 0]} maxBarSize={48} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Side stats */}
                      <div className="space-y-4">
                        <div className="border border-white/[0.07] rounded-2xl p-6" style={{ background: "#111111" }}>
                          <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-4">{t("allTime")}</p>
                          <div className="space-y-4">
                            {[
                              { label: t("totalSessions"), value: stats.allTime.totalSessions, icon: Target },
                              { label: t("currentStreak"), value: `${stats.allTime.currentStreak} ${t("days")}`, icon: Flame },
                              { label: t("monthlyVolume"), value: `${(stats.monthly.totalVolumeKg / 1000).toFixed(1)}t`, icon: Zap },
                              { label: t("weeklyVolume"), value: `${(stats.weekly.totalVolumeKg / 1000).toFixed(1)}t`, icon: TrendingUp },
                            ].map(({ label, value, icon: Icon }) => (
                              <div key={label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(200,254,27,0.08)" }}>
                                    <Icon size={13} style={{ color: LIME }} />
                                  </div>
                                  <span className="text-white/50 text-xs font-semibold">{label}</span>
                                </div>
                                <span className="text-white font-extrabold text-sm">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="border border-white/[0.07] rounded-2xl p-5" style={{ background: "#111111" }}>
                          <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">{t("thisWeek")}</p>
                          <p className="text-3xl font-extrabold text-white">{stats.weekly.sessions}<span className="text-sm text-white/30 ml-1">{t("sessions")}</span></p>
                          <p className="text-white/30 text-xs mt-1">{t("avgMinPerSession", { min: stats.weekly.avgDurationMin })}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                  <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    {logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Dumbbell size={32} className="text-white/15" />
                        <p className="text-white/35 text-sm font-semibold">{t("noLogsYet")}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {logs.map((log, i) => (
                            <motion.div key={log._id}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all"
                              style={{ background: "#111111" }}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: "rgba(200,254,27,0.08)", borderColor: "rgba(200,254,27,0.2)" }}>
                                    <Dumbbell size={18} style={{ color: LIME }} />
                                  </div>
                                  <div>
                                    <h3 className="text-white font-extrabold text-base">{log.dayName}</h3>
                                    <p className="text-white/40 text-xs font-semibold mt-0.5">{fmtDate(log.date)}</p>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                      {log.durationMinutes && (
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-white/50">
                                          <Clock size={11} /> {log.durationMinutes} {t("min")}
                                        </span>
                                      )}
                                      {log.overallMood && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${MOOD_COLOR[log.overallMood]}`}>
                                          {MOOD_ICON[log.overallMood]} {t(`moods.${log.overallMood}`)}
                                        </span>
                                      )}
                                      <span className="text-[11px] font-bold text-white/40">
                                        {log.exercises.length} {t("exercises")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">{t("volume")}</p>
                                  <p className="text-xl font-extrabold text-white">
                                    {log.exercises.reduce((t, ex) => t + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0).toLocaleString()}
                                    <span className="text-sm text-white/30 ml-1">{t("kg")}</span>
                                  </p>
                                </div>
                              </div>
                              {log.exercises.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/[0.05] flex flex-wrap gap-2">
                                  {log.exercises.slice(0, 6).map((ex, j) => (
                                    <span key={j} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.07] text-white/50">
                                      {ex.exerciseId?.name ?? "Exercise"} · {ex.sets.length} {t("sets")}
                                    </span>
                                  ))}
                                  {log.exercises.length > 6 && (
                                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.07] text-white/30">
                                      +{log.exercises.length - 6} {t("more")}
                                    </span>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      <LogModal
        open={modalOpen}
        plan={plan}
        onClose={() => setModalOpen(false)}
        onSaved={log => setLogs(prev => [log, ...prev])}
        t={t}
      />
    </>
  );
}
