"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, X, GripVertical, Dumbbell, ChevronDown,
  Save, Loader2, CheckCircle2, Trash2, List, ArrowRight, Users, User, AlertTriangle
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";

// â”€â”€â”€ Custom Trainee Picker Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TraineePicker({
  trainees, value, onChange
}: {
  trainees: { _id: string; userName: string; email: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = trainees.find(t => t._id === value);
  const filtered = trainees.filter(t =>
    t.userName.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative w-72">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
          open
            ? "bg-[#c8fe1b]/[0.06] border-[#c8fe1b]/40 shadow-[0_0_16px_rgba(200,254,27,0.08)]"
            : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
        }`}
      >
        {selected ? (
          <>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c8fe1b]/30 to-lime-400/10 border border-[#c8fe1b]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-extrabold text-[#c8fe1b]">{getInitials(selected.userName)}</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-white truncate">{selected.userName}</p>
              <p className="text-[9px] text-white/40 truncate">{selected.email}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0">
              <Users size={12} className="text-white/30" />
            </div>
            <span className="flex-1 text-left text-sm text-white/40 font-semibold">
              {trainees.length === 0 ? "No active subscribers" : `Assign to trainee...`}
            </span>
            {trainees.length > 0 && (
              <span className="text-[9px] font-bold text-[#c8fe1b]/60 bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 px-1.5 py-0.5 rounded-full">
                {trainees.length}
              </span>
            )}
          </>
        )}
        <ChevronDown
          size={13}
          className={`text-white/30 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#c8fe1b]/60" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Search */}
            {trainees.length > 4 && (
              <div className="p-3 border-b border-white/[0.06]">
                <div className="relative">
                  <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    autoFocus
                    placeholder="Search clients..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-52 overflow-y-auto py-1.5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-1.5 text-white/25">
                  <Users size={20} />
                  <p className="text-xs font-semibold">No clients found</p>
                </div>
              ) : (
                filtered.map(t => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => { onChange(t._id); setOpen(false); setSearch(""); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.05] transition-colors text-left group ${
                      value === t._id ? "bg-[#c8fe1b]/[0.06]" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      value === t._id
                        ? "bg-[#c8fe1b]/20 border border-[#c8fe1b]/30"
                        : "bg-white/[0.05] border border-white/10 group-hover:border-white/20"
                    }`}>
                      <span className={`text-[10px] font-extrabold ${
                        value === t._id ? "text-[#c8fe1b]" : "text-white/50"
                      }`}>{getInitials(t.userName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${
                        value === t._id ? "text-[#c8fe1b]" : "text-white"
                      }`}>{t.userName}</p>
                      <p className="text-[9px] text-white/35 truncate">{t.email}</p>
                    </div>
                    {value === t._id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c8fe1b] flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer count */}
            {trainees.length > 0 && (
              <div className="px-4 py-2 border-t border-white/[0.05] bg-white/[0.01]">
                <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">
                  {filtered.length} active subscriber{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DBExercise {
  _id: string;
  name: string;
  bodyPart: string;
}

interface AssignedExercise extends DBExercise {
  sets: number;
  reps: number;
  restTimeMinutes: number;
}

interface DayPlan {
  dayName: string;
  exercises: AssignedExercise[];
}

const BODY_PART_COLORS: Record<string, string> = {
  chest: "#c8fe1b", back: "#7c3aed", legs: "#2563eb",
  shoulders: "#d97706", arms: "#db2777", "upper arms": "#db2777",
  "lower arms": "#f472b6", waist: "#10b981", "upper legs": "#2563eb",
  "lower legs": "#60a5fa", cardio: "#ef4444",
};

const getBodyPartColor = (bodyPart: string) =>
  BODY_PART_COLORS[bodyPart?.toLowerCase()] || "#6b7280";

export default function WorkoutBuilderPage() {
  const [search, setSearch] = useState("");
  const [bodyPartFilter, setBodyPartFilter] = useState("all");
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [planName, setPlanName] = useState("New Custom Plan");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const [days, setDays] = useState<DayPlan[]>([
    { dayName: "Day 1 â€” Full Body", exercises: [] }
  ]);

  const [exercises, setExercises] = useState<DBExercise[]>([]);
  const [trainees, setTrainees] = useState<{ _id: string; userName: string; email: string }[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingExercises(true);
        // Fetch all subscriptions (large limit) + exercises in parallel
        const [exRes, subRes] = await Promise.all([
          axiosInstance.get("/exercises?limit=2000", { withCredentials: true }),
          axiosInstance.get("/subscriptions?limit=1000", { withCredentials: true })
        ]);
        if (exRes.data.success) setExercises(exRes.data.data);
        if (subRes.data.success) {
          // Only keep active subscriptions and deduplicate by client _id
          const activeSubs = subRes.data.data.filter((s: any) => s.status === "active");
          const uniqueClients = new Map<string, { _id: string; userName: string; email: string }>();
          activeSubs.forEach((sub: any) => {
            if (sub.client && !uniqueClients.has(sub.client._id)) {
              uniqueClients.set(sub.client._id, {
                _id: sub.client._id,
                userName: sub.client.userName || sub.client.email || "Unknown",
                email: sub.client.email || "",
              });
            }
          });
          setTrainees(Array.from(uniqueClients.values()));
        }
      } catch (e) { console.error(e); }
      finally { setLoadingExercises(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Unique body parts for filter pills
  const bodyParts = ["all", ...Array.from(new Set(exercises.map(e => e.bodyPart?.toLowerCase()).filter(Boolean))).sort()];

  const filteredPool = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesPart = bodyPartFilter === "all" || ex.bodyPart?.toLowerCase() === bodyPartFilter;
    return matchesSearch && matchesPart;
  });

  const addExercise = (exercise: DBExercise, dayIdx: number) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIdx
        ? { ...d, exercises: d.exercises.find(e => e._id === exercise._id) ? d.exercises : [...d.exercises, { ...exercise, sets: 3, reps: 10, restTimeMinutes: 2 }] }
        : d
    ));
  };

  const removeExercise = (exId: string, dayIdx: number) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, exercises: d.exercises.filter(e => e._id !== exId) } : d
    ));
  };

  const updateExerciseField = (dayIdx: number, exId: string, field: "sets" | "reps" | "restTimeMinutes", value: number) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIdx ? { ...d, exercises: d.exercises.map(e => e._id === exId ? { ...e, [field]: value } : e) } : d
    ));
  };

  const addDay = () => setDays(prev => [...prev, { dayName: `Day ${prev.length + 1}`, exercises: [] }]);
  const removeDay = (idx: number) => setDays(prev => prev.filter((_, i) => i !== idx));
  const updateDayName = (idx: number, name: string) => setDays(prev => prev.map((d, i) => i === idx ? { ...d, dayName: name } : d));

  const totalExercises = days.reduce((acc, d) => acc + d.exercises.length, 0);

  const handleSave = async () => {
    if (totalExercises === 0 || !selectedTrainee || !planName) return;
    setIsSaving(true);
    try {
      const payloadDays = days.filter(d => d.exercises.length > 0).map(d => ({
        dayName: d.dayName,
        exercises: d.exercises.map(ex => ({
          exerciseId: ex._id,
          sets: ex.sets,
          reps: ex.reps,
          restTimeMinutes: ex.restTimeMinutes
        }))
      }));
      const res = await axiosInstance.post("/workout-plans", {
        clientId: selectedTrainee, planName, description, notes, days: payloadDays
      }, { withCredentials: true });
      if (res.data.success) {
        setToast({ message: "Plan assigned successfully!", type: "success" });
        setDays([{ dayName: "Day 1 â€” Full Body", exercises: [] }]);
        setSelectedTrainee(""); setPlanName("New Custom Plan");
        setDescription(""); setNotes("");
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || "Failed to save plan.";
      const isDuplicate = e.response?.status === 400 && msg.toLowerCase().includes("already exists");
      setToast({ message: isDuplicate ? `âš ï¸ ${msg} â€” go to Workout Plans to edit it.` : msg, type: isDuplicate ? "warning" : "error" });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* â•â•â• Top Bar â•â•â• */}
      <div className="flex-shrink-0 border-b border-white/[0.06] bg-card/60 backdrop-blur-xl px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left: Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center flex-shrink-0">
                <Dumbbell size={16} className="text-[#c8fe1b]" />
              </div>
              <div>
                <p className="text-[#c8fe1b] text-[9px] font-bold uppercase tracking-[0.25em]">Coach Tool</p>
                <h1 className="text-white text-lg font-extrabold uppercase tracking-tight leading-none">Workout Builder</h1>
              </div>
              <Link
                href="/admin/workout-plans"
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#c8fe1b] transition-colors uppercase tracking-widest"
              >
                <List size={14} /> All Plans <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Plan name */}
              <input
                type="text"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                placeholder="Plan name..."
                className="flex-1 text-base font-extrabold text-white uppercase tracking-tight bg-white/[0.03] border border-white/[0.08] focus:outline-none focus:border-[#c8fe1b]/50 rounded-xl px-4 py-2.5 transition-all placeholder:text-white/20 placeholder:font-normal placeholder:normal-case"
              />
              {/* Trainee picker */}
              <TraineePicker
                trainees={trainees}
                value={selectedTrainee}
                onChange={setSelectedTrainee}
              />
            </div>

            <div className="flex gap-3 mt-3">
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="flex-1 text-sm text-white bg-white/[0.02] border border-white/[0.06] focus:outline-none focus:border-white/15 rounded-lg px-3 py-2 transition-all placeholder:text-white/20"
              />
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Coach notes (optional)..."
                className="flex-1 text-sm text-white bg-white/[0.02] border border-white/[0.06] focus:outline-none focus:border-white/15 rounded-lg px-3 py-2 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Right: stats + save */}
          <div className="flex items-center gap-4 lg:flex-col lg:items-end">
            <div className="flex gap-3">
              <div className="text-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2">
                <p className="text-2xl font-extrabold text-white">{days.length}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Days</p>
              </div>
              <div className="text-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2">
                <p className="text-2xl font-extrabold text-[#c8fe1b]">{totalExercises}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Exercises</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={totalExercises === 0 || !selectedTrainee || isSaving || !planName}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-widest hover:bg-lime-300 hover:shadow-[0_0_24px_rgba(200,254,27,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Saving..." : "Send Plan"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* â•â•â• Split Body â•â•â• */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

        {/* â”€â”€ Exercise Pool (Left) â”€â”€ */}
        <div className="w-full lg:w-[300px] xl:w-[340px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-card/40 h-[280px] lg:h-auto">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                <Dumbbell size={11} /> Exercise Pool
              </p>
              <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                {filteredPool.length} / {exercises.length}
              </span>
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 transition-all"
              />
            </div>
            {/* Body part filter pills */}
            <div className="flex gap-1.5 flex-wrap max-h-16 overflow-y-auto">
              {bodyParts.slice(0, 12).map(part => (
                <button
                  key={part}
                  onClick={() => setBodyPartFilter(part)}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                    bodyPartFilter === part
                      ? "bg-[#c8fe1b]/15 border-[#c8fe1b]/40 text-[#c8fe1b]"
                      : "border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loadingExercises ? (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <Loader2 size={20} className="animate-spin text-[#c8fe1b]/40" />
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Loading library...</p>
              </div>
            ) : filteredPool.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-xs text-white/30 font-semibold">No exercises found</p>
              </div>
            ) : filteredPool.map(ex => {
              const color = getBodyPartColor(ex.bodyPart);
              return (
                <div key={ex._id} className="group flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/10 transition-all">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
                    <Dumbbell size={11} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{ex.name}</p>
                    <p className="text-white/30 text-[9px] capitalize">{ex.bodyPart}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {days.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => addExercise(ex, i)}
                        title={`Add to Day ${i + 1}`}
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold bg-[#c8fe1b]/10 hover:bg-[#c8fe1b] hover:text-black text-[#c8fe1b] border border-[#c8fe1b]/20 transition-all"
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* â”€â”€ Day Canvas (Right) â”€â”€ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="popLayout">
            {days.map((day, dayIdx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, height: 0 }}
                key={`day-${dayIdx}`}
                className="bg-card/80 border border-white/[0.07] rounded-2xl overflow-hidden"
              >
                {/* Day Header */}
                <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3 bg-white/[0.01]">
                  <div className="w-7 h-7 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center text-[#c8fe1b] text-xs font-bold flex-shrink-0">
                    {dayIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={day.dayName}
                    onChange={e => updateDayName(dayIdx, e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-[#c8fe1b]/40 rounded-lg px-2 py-1 min-w-0 transition-all"
                  />
                  <span className="text-white/25 text-xs font-semibold flex-shrink-0">{day.exercises.length} ex</span>
                  <button
                    onClick={() => removeDay(dayIdx)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Exercises */}
                <div className="p-4 space-y-2">
                  <AnimatePresence>
                    {day.exercises.map((ex, exIdx) => {
                      const color = getBodyPartColor(ex.bodyPart);
                      return (
                        <motion.div
                          key={`${ex._id}-${exIdx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <GripVertical size={13} className="text-white/10 flex-shrink-0 cursor-grab" />
                            <div
                              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white/50"
                              style={{ background: color + "15", border: `1px solid ${color}25` }}
                            >
                              {exIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-bold truncate">{ex.name}</p>
                              <p className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5 capitalize">{ex.bodyPart}</p>
                            </div>
                          </div>

                          {/* Sets / Reps / Rest */}
                          <div className="flex items-center divide-x divide-white/[0.06] bg-black/20 rounded-xl overflow-hidden border border-white/[0.04]">
                            {[
                              { label: "Sets", field: "sets" as const, min: 1, max: 20, step: 1, color: "#c8fe1b" },
                              { label: "Reps", field: "reps" as const, min: 1, max: 100, step: 1, color: "#c8fe1b" },
                              { label: "Rest m", field: "restTimeMinutes" as const, min: 0, max: 10, step: 0.5, color: "#60a5fa" },
                            ].map(({ label, field, min, max, step, color: c }) => (
                              <div key={field} className="flex flex-col items-center px-3 py-1.5 hover:bg-white/5 transition-colors">
                                <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: c + "80" }}>{label}</span>
                                <input
                                  type="number"
                                  min={min} max={max} step={step}
                                  value={field === "restTimeMinutes" ? ex.restTimeMinutes : ex[field]}
                                  onChange={e => updateExerciseField(dayIdx, ex._id, field, parseFloat(e.target.value) || 0)}
                                  className="w-9 bg-transparent text-sm font-extrabold text-white text-center focus:outline-none"
                                  style={{ color: c }}
                                />
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => removeExercise(ex._id, dayIdx)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                          >
                            <X size={13} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {day.exercises.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] text-center">
                      <Plus size={18} className="text-white/10 mb-1.5" />
                      <p className="text-white/25 text-xs font-semibold uppercase tracking-wider">Hover an exercise â†’ click day number</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Day Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={addDay}
            className="w-full py-5 rounded-2xl border border-dashed border-white/15 hover:border-[#c8fe1b]/40 hover:bg-[#c8fe1b]/[0.03] flex items-center justify-center gap-3 text-white/30 hover:text-[#c8fe1b] transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c8fe1b]/10 flex items-center justify-center transition-colors">
              <Plus size={15} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Add New Day</span>
          </motion.button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl max-w-sm ${
              toast.type === "success"
                ? "bg-[#c8fe1b]/10 border-[#c8fe1b]/30 text-[#c8fe1b]"
                : toast.type === "warning"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="flex-shrink-0" />
            ) : toast.type === "warning" ? (
              <AlertTriangle size={18} className="flex-shrink-0" />
            ) : (
              <X size={18} className="flex-shrink-0" />
            )}
            <p className="text-sm font-bold tracking-wide">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
