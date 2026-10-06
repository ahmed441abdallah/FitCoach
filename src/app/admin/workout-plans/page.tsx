"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dumbbell, Trash2, Eye, Pencil, Search, X,
  Loader2, CheckCircle2, Users, Calendar,
  ClipboardList, AlertTriangle, Plus, GripVertical,
  ArrowUpDown, ChevronRight, ChevronLeft, Hash,
  FileText, Target
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface WorkoutPlan {
  _id: string;
  planName: string;
  description: string;
  notes: string;
  client: { _id: string; userName: string; email: string };
  days: {
    _id: string;
    dayName: string;
    exercises: {
      _id: string;
      exerciseId: { _id: string; name: string; bodyPart: string } | null;
      sets: number;
      reps: number;
      restTimeMinutes: number;
    }[];
  }[];
  createdAt: string;
}

type EditDay = {
  _id?: string;
  dayName: string;
  exercises: {
    _id?: string;
    exerciseId: { _id: string; name: string; bodyPart: string } | null;
    sets: number;
    reps: number;
    restTimeMinutes: number;
  }[];
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BODY_PART_COLORS: Record<string, string> = {
  chest: "#c8fe1b", back: "#7c3aed", legs: "#2563eb",
  shoulders: "#d97706", arms: "#db2777", "upper arms": "#db2777",
  "lower arms": "#f472b6", waist: "#10b981", "upper legs": "#2563eb",
  "lower legs": "#60a5fa", cardio: "#ef4444",
};
const getBPC = (bp: string) => BODY_PART_COLORS[bp?.toLowerCase()] || "#6b7280";
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || "??";

// â”€â”€â”€ Detail Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DetailDrawer({ plan, onClose, onEdit, onDelete }: {
  plan: WorkoutPlan; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const totalEx = plan.days.reduce((a, d) => a + d.exercises.length, 0);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex" onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 250 }}
        onClick={e => e.stopPropagation()}
        className="relative ml-auto w-full max-w-2xl h-full bg-background border-l border-white/[0.08] flex flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between p-6 border-b border-white/[0.07] bg-card/50">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[9px] text-[#c8fe1b]/60 font-bold uppercase tracking-[0.25em] mb-1">Workout Plan</p>
            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight truncate">{plan.planName}</h2>
            {plan.description && <p className="text-sm text-white/50 mt-1">{plan.description}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.06] bg-white/[0.01] flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
            <Users size={12} className="text-[#c8fe1b]/60" />{plan.client?.userName}
          </div>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
            <Calendar size={12} className="text-white/30" />{fmtDate(plan.createdAt)}
          </div>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-xs text-white/50 font-semibold">{plan.days.length} Days</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-xs text-[#c8fe1b] font-bold">{totalEx} Exercises</span>
        </div>
        {plan.notes && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#c8fe1b]/[0.05] border border-[#c8fe1b]/20">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#c8fe1b]/70 mb-1">Coach Notes</p>
            <p className="text-sm text-white/70">{plan.notes}</p>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {plan.days.map((day, dIdx) => (
            <div key={day._id || dIdx} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center text-[#c8fe1b] text-[10px] font-bold">{dIdx + 1}</span>
                  <p className="text-sm font-bold text-white uppercase tracking-wide">{day.dayName}</p>
                </div>
                <span className="text-[10px] font-bold text-white/30">{day.exercises.length} exercises</span>
              </div>
              <div className="p-3 space-y-2">
                {day.exercises.map((ex, eIdx) => {
                  const name = ex.exerciseId?.name || "Unknown Exercise";
                  const bp = ex.exerciseId?.bodyPart || "";
                  const color = getBPC(bp);
                  return (
                    <div key={ex._id || eIdx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: color + "18" }}>
                        <Dumbbell size={10} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{name}</p>
                        <p className="text-[9px] text-white/30 capitalize">{bp}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs flex-shrink-0">
                        <span className="font-extrabold text-[#c8fe1b]">{ex.sets}Ã—{ex.reps}</span>
                        {ex.restTimeMinutes > 0 && <span className="text-white/30 font-semibold">{ex.restTimeMinutes}m rest</span>}
                      </div>
                    </div>
                  );
                })}
                {day.exercises.length === 0 && <p className="text-center text-xs text-white/20 py-3">Rest Day</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-6 border-t border-white/[0.07] bg-card/50">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white text-sm font-bold uppercase tracking-widest transition-all">
            <Pencil size={14} /> Edit Plan
          </button>
          <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-sm font-bold uppercase tracking-widest transition-all">
            <Trash2 size={14} /> Delete Plan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Full Edit Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EditModal({ plan, onClose, onSave }: {
  plan: WorkoutPlan;
  onClose: () => void;
  onSave: (id: string, data: {
    planName: string; description: string; notes: string;
    days: { dayName: string; exercises: { exerciseId: string; sets: number; reps: number; restTimeMinutes: number }[] }[];
  }) => Promise<void>;
}) {
  const [planName, setPlanName] = useState(plan.planName);
  const [description, setDescription] = useState(plan.description || "");
  const [notes, setNotes] = useState(plan.notes || "");
  const [days, setDays] = useState<EditDay[]>(plan.days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e })) })));
  const [saving, setSaving] = useState(false);
  const [exSearch, setExSearch] = useState("");
  const [exPool, setExPool] = useState<{ _id: string; name: string; bodyPart: string }[]>([]);
  const [exLoading, setExLoading] = useState(false);
  const [addingToDay, setAddingToDay] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setExLoading(true);
      try {
        const res = await axiosInstance.get("/exercises?limit=2000", { withCredentials: true });
        if (res.data.success) setExPool(res.data.data);
      } finally { setExLoading(false); }
    };
    load();
  }, []);

  const filteredPool = exPool.filter(e => e.name.toLowerCase().includes(exSearch.toLowerCase()));
  const addDay = () => setDays(prev => [...prev, { dayName: `Day ${prev.length + 1}`, exercises: [] }]);
  const removeDay = (i: number) => setDays(prev => prev.filter((_, idx) => idx !== i));
  const updateDayName = (i: number, name: string) => setDays(prev => prev.map((d, idx) => idx === i ? { ...d, dayName: name } : d));
  const addExToDay = (dayIdx: number, ex: { _id: string; name: string; bodyPart: string }) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      if (d.exercises.find(e => e.exerciseId?._id === ex._id)) return d;
      return { ...d, exercises: [...d.exercises, { exerciseId: ex, sets: 3, reps: 10, restTimeMinutes: 2 }] };
    }));
  };
  const removeExFromDay = (dayIdx: number, exIdx: number) => setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, exercises: d.exercises.filter((_, ei) => ei !== exIdx) } : d));
  const updateExField = (dayIdx: number, exIdx: number, field: "sets" | "reps" | "restTimeMinutes", val: number) => {
    setDays(prev => prev.map((d, i) => i === dayIdx ? { ...d, exercises: d.exercises.map((e, ei) => ei === exIdx ? { ...e, [field]: val } : e) } : d));
  };

  const handle = async () => {
    setSaving(true);
    await onSave(plan._id, {
      planName, description, notes,
      days: days.map(d => ({ dayName: d.dayName, exercises: d.exercises.filter(e => e.exerciseId).map(e => ({ exerciseId: e.exerciseId!._id, sets: e.sets, reps: e.reps, restTimeMinutes: e.restTimeMinutes })) }))
    });
    setSaving(false);
  };

  const getC = (bp: string) => getBPC(bp);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 250 }}
        onClick={e => e.stopPropagation()}
        className="relative ml-auto w-full max-w-3xl h-full bg-background border-l border-white/[0.08] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/[0.07] bg-card/50 flex-shrink-0">
          <div>
            <p className="text-[9px] text-[#c8fe1b]/60 font-bold uppercase tracking-[0.25em]">Edit Plan</p>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">{plan.planName}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white transition-all"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 border-b border-white/[0.06]">
            <div>
              <label className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1.5">Plan Name</label>
              <input value={planName} onChange={e => setPlanName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-bold uppercase tracking-wide focus:outline-none focus:border-[#c8fe1b]/40 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1.5">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20" />
              </div>
              <div>
                <label className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1.5">Coach Notes</label>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes for the trainee..." className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20" />
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Training Days</p>
              <button onClick={addDay} className="flex items-center gap-1.5 text-xs font-bold text-[#c8fe1b]/70 hover:text-[#c8fe1b] transition-colors uppercase tracking-wider"><Plus size={12} /> Add Day</button>
            </div>
            <AnimatePresence mode="popLayout">
              {days.map((day, dayIdx) => (
                <motion.div key={dayIdx} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
                    <span className="w-6 h-6 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center text-[#c8fe1b] text-[10px] font-bold flex-shrink-0">{dayIdx + 1}</span>
                    <input type="text" value={day.dayName} onChange={e => updateDayName(dayIdx, e.target.value)} className="flex-1 bg-transparent text-white text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-[#c8fe1b]/30 rounded-lg px-2 py-0.5" />
                    <span className="text-white/25 text-[10px] font-semibold">{day.exercises.length} ex</span>
                    <button onClick={() => setAddingToDay(addingToDay === dayIdx ? null : dayIdx)} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${addingToDay === dayIdx ? "bg-[#c8fe1b]/15 border-[#c8fe1b]/30 text-[#c8fe1b]" : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-[#c8fe1b] hover:border-[#c8fe1b]/20"}`}><Plus size={10} /> Add</button>
                    <button onClick={() => removeDay(dayIdx)} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={11} /></button>
                  </div>
                  <AnimatePresence>
                    {addingToDay === dayIdx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-white/[0.06] bg-black/20 overflow-hidden">
                        <div className="p-3">
                          <div className="relative mb-2">
                            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                            <input autoFocus placeholder="Search exercise..." value={exSearch} onChange={e => setExSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40" />
                          </div>
                          {exLoading ? <div className="flex justify-center py-3"><Loader2 size={14} className="animate-spin text-white/20" /></div> : (
                            <div className="max-h-36 overflow-y-auto space-y-1">
                              {filteredPool.slice(0, 30).map(ex => {
                                const c = getC(ex.bodyPart);
                                return (
                                  <button key={ex._id} onClick={() => addExToDay(dayIdx, ex)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-left transition-colors group">
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: c + "20" }}><Dumbbell size={9} style={{ color: c }} /></div>
                                    <span className="text-xs text-white font-semibold flex-1 truncate">{ex.name}</span>
                                    <span className="text-[9px] text-white/30 capitalize">{ex.bodyPart}</span>
                                    <Plus size={10} className="text-[#c8fe1b]/50 group-hover:text-[#c8fe1b] flex-shrink-0" />
                                  </button>
                                );
                              })}
                              {filteredPool.length === 0 && <p className="text-center text-xs text-white/20 py-3">No exercises found</p>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="p-3 space-y-2">
                    <AnimatePresence>
                      {day.exercises.map((ex, exIdx) => {
                        const name = ex.exerciseId?.name || "Unknown";
                        const bp = ex.exerciseId?.bodyPart || "";
                        const color = getC(bp);
                        return (
                          <motion.div key={`${ex.exerciseId?._id}-${exIdx}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all">
                            <GripVertical size={12} className="text-white/10 flex-shrink-0" />
                            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: color + "18" }}><Dumbbell size={9} style={{ color }} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{name}</p>
                              <p className="text-[9px] text-white/30 capitalize">{bp}</p>
                            </div>
                            <div className="flex items-center divide-x divide-white/[0.06] bg-black/20 rounded-xl overflow-hidden border border-white/[0.04]">
                              {([{ label: "Sets", field: "sets" as const, color: "#c8fe1b" }, { label: "Reps", field: "reps" as const, color: "#c8fe1b" }, { label: "Rest m", field: "restTimeMinutes" as const, color: "#60a5fa" }]).map(({ label, field, color: fc }) => (
                                <div key={field} className="flex flex-col items-center px-2.5 py-1.5 hover:bg-white/5">
                                  <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: fc + "80" }}>{label}</span>
                                  <input type="number" min={0} step={field === "restTimeMinutes" ? 0.5 : 1} value={ex[field]} onChange={e => updateExField(dayIdx, exIdx, field, parseFloat(e.target.value) || 0)} className="w-8 bg-transparent text-sm font-extrabold text-center focus:outline-none" style={{ color: fc }} />
                                </div>
                              ))}
                            </div>
                            <button onClick={() => removeExFromDay(dayIdx, exIdx)} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"><X size={11} /></button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {day.exercises.length === 0 && <div className="flex items-center justify-center h-14 rounded-xl border border-dashed border-white/[0.07] text-white/20 text-xs">Click "Add" to add exercises</div>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={addDay} className="w-full py-4 rounded-2xl border border-dashed border-white/15 hover:border-[#c8fe1b]/40 hover:bg-[#c8fe1b]/[0.03] flex items-center justify-center gap-2 text-white/30 hover:text-[#c8fe1b] transition-all">
              <Plus size={14} /><span className="text-xs font-bold uppercase tracking-widest">Add New Day</span>
            </button>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/[0.07] bg-card/50 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.07] text-white/60 text-sm font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all">Cancel</button>
          <button onClick={handle} disabled={saving || !planName} className="flex-1 py-3 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-widest hover:bg-lime-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}{saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Delete Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConfirmDelete({ planName, onConfirm, onCancel, loading }: {
  planName: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm bg-card border border-red-500/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertTriangle size={24} className="text-red-400" /></div>
          <h3 className="text-lg font-extrabold text-white">Delete Plan?</h3>
          <p className="text-sm text-white/50">Delete <span className="text-white font-bold">"{planName}"</span>? This cannot be undone.</p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/[0.07] text-white/60 text-sm font-bold uppercase tracking-wider hover:bg-white/[0.04] transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}{loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  const [detailPlan, setDetailPlan] = useState<WorkoutPlan | null>(null);
  const [editPlan, setEditPlan] = useState<WorkoutPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutPlan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/workout-plans", { withCredentials: true });
      if (res.data.success) setPlans(res.data.data);
    } catch { showToast("Failed to fetch workout plans", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/workout-plans/${deleteTarget._id}`, { withCredentials: true });
      setPlans(prev => prev.filter(p => p._id !== deleteTarget._id));
      showToast("Plan deleted successfully", "success");
      setDetailPlan(null);
    } catch { showToast("Failed to delete plan", "error"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleEdit = async (id: string, data: {
    planName: string; description: string; notes: string;
    days: { dayName: string; exercises: { exerciseId: string; sets: number; reps: number; restTimeMinutes: number }[] }[];
  }) => {
    try {
      const res = await axiosInstance.put(`/workout-plans/${id}`, data, { withCredentials: true });
      if (res.data.success) {
        await fetchPlans();
        showToast("Plan updated successfully", "success");
        setEditPlan(null);
        setDetailPlan(null);
      }
    } catch { showToast("Failed to update plan", "error"); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(v => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = plans
    .filter(p =>
      p.planName?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.userName?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: any, bv: any;
      if (sortField === "planName") { av = a.planName; bv = b.planName; }
      else if (sortField === "client") { av = a.client?.userName; bv = b.client?.userName; }
      else if (sortField === "days") { av = a.days.length; bv = b.days.length; }
      else if (sortField === "exercises") { av = a.days.reduce((x, d) => x + d.exercises.length, 0); bv = b.days.reduce((x, d) => x + d.exercises.length, 0); }
      else { av = a.createdAt; bv = b.createdAt; }
      if (typeof av === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors group">
      {label}
      <ArrowUpDown size={10} className={`transition-colors ${sortField === field ? "text-[#c8fe1b]" : "text-white/20 group-hover:text-white/40"}`} />
    </button>
  );

  return (
    <div className="min-h-full p-6 bg-background">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[#c8fe1b] text-[9px] font-bold uppercase tracking-[0.25em] mb-1 flex items-center gap-2">
            <span className="w-4 h-px bg-[#c8fe1b]" /> Coach Panel
          </p>
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">Workout Plans</h1>
          <p className="text-white/40 text-sm mt-1">{plans.length} plans assigned</p>
        </div>
        <Link
          href="/admin/workout-builder"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-widest hover:bg-lime-300 hover:shadow-[0_0_20px_rgba(200,254,27,0.4)] transition-all"
        >
          <Dumbbell size={15} /> New Plan
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by plan name or trainee..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 transition-all"
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Table Header */}
        <div className="grid grid-cols-[2.5fr_1.8fr_90px_90px_100px_130px] gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
          <SortHeader field="planName" label="Plan" />
          <SortHeader field="client"   label="Trainee" />
          <SortHeader field="days"     label="Days" />
          <SortHeader field="exercises" label="Exercises" />
          <SortHeader field="createdAt" label="Created" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Actions</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={28} className="animate-spin text-[#c8fe1b]/40" />
            <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Loading plans...</p>
          </div>
        )}

        {/* Rows */}
        {!loading && (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {filtered.map((plan, i) => {
                const totalEx = plan.days.reduce((a, d) => a + d.exercises.length, 0);
                return (
                  <motion.div
                    key={plan._id} layout
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[2.5fr_1.8fr_90px_90px_100px_130px] gap-4 items-center px-6 py-4 hover:bg-white/[0.025] transition-colors group"
                  >
                    {/* Plan */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#c8fe1b]/8 border border-[#c8fe1b]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c8fe1b]/15 transition-all">
                        <Dumbbell size={14} className="text-[#c8fe1b]/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white uppercase tracking-tight truncate">{plan.planName}</p>
                        {plan.description && <p className="text-[10px] text-white/35 truncate mt-0.5">{plan.description}</p>}
                      </div>
                    </div>

                    {/* Trainee */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-extrabold text-violet-300">{getInitials(plan.client?.userName || "")}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white/80 truncate">{plan.client?.userName || "â€”"}</p>
                        <p className="text-[9px] text-white/30 truncate">{plan.client?.email || ""}</p>
                      </div>
                    </div>

                    {/* Days */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                        <span className="text-sm font-extrabold text-white">{plan.days.length}</span>
                      </div>
                      <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">days</span>
                    </div>

                    {/* Exercises */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#c8fe1b]/8 border border-[#c8fe1b]/15 flex items-center justify-center">
                        <span className="text-sm font-extrabold text-[#c8fe1b]">{totalEx}</span>
                      </div>
                      <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">ex</span>
                    </div>

                    {/* Date */}
                    <p className="text-[11px] text-white/35 font-semibold">{fmtDate(plan.createdAt)}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => setDetailPlan(plan)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        <Eye size={11} /> View
                      </button>
                      <button
                        onClick={() => setEditPlan(plan)}
                        className="w-7 h-7 rounded-lg bg-[#c8fe1b]/8 hover:bg-[#c8fe1b]/20 border border-[#c8fe1b]/15 flex items-center justify-center text-[#c8fe1b]/70 hover:text-[#c8fe1b] transition-all"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(plan)}
                        className="w-7 h-7 rounded-lg bg-red-500/8 hover:bg-red-500/20 border border-red-500/15 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all"
                        title="Delete"
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
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <ClipboardList size={24} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-semibold">
              {search ? "No plans match your search" : "No workout plans created yet"}
            </p>
            {!search && (
              <Link href="/admin/workout-builder" className="text-[#c8fe1b] text-xs font-bold uppercase tracking-widest hover:underline">
                Create your first plan â†’
              </Link>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
          <p className="text-white/25 text-xs font-semibold">
            Showing {filtered.length} of {plans.length} plans
          </p>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
            {plans.reduce((a, p) => a + p.days.reduce((x, d) => x + d.exercises.length, 0), 0)} total exercises assigned
          </p>
        </div>
      </motion.div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {detailPlan && (
          <DetailDrawer
            plan={detailPlan}
            onClose={() => setDetailPlan(null)}
            onEdit={() => { setEditPlan(detailPlan); setDetailPlan(null); }}
            onDelete={() => setDeleteTarget(detailPlan)}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editPlan && <EditModal plan={editPlan} onClose={() => setEditPlan(null)} onSave={handleEdit} />}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDelete planName={deleteTarget.planName} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[70] px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === "success" ? "bg-[#c8fe1b]/10 border-[#c8fe1b]/30 text-[#c8fe1b]" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}
            <p className="text-sm font-bold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
