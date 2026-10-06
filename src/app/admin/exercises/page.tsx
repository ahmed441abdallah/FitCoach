"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, Dumbbell, Target, Zap } from "lucide-react";

// â”€â”€â”€ Mock Exercise Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EXERCISES = [
  { id: "1", name: "Barbell Bench Press", bodyPart: "chest", equipment: "barbell", target: "pectorals", color: "#dc2626" },
  { id: "2", name: "Pull-Up", bodyPart: "back", equipment: "body weight", target: "lats", color: "#7c3aed" },
  { id: "3", name: "Barbell Squat", bodyPart: "upper legs", equipment: "barbell", target: "quads", color: "#2563eb" },
  { id: "4", name: "Romanian Deadlift", bodyPart: "upper legs", equipment: "barbell", target: "hamstrings", color: "#059669" },
  { id: "5", name: "Dumbbell Shoulder Press", bodyPart: "shoulders", equipment: "dumbbell", target: "delts", color: "#d97706" },
  { id: "6", name: "Tricep Pushdown", bodyPart: "upper arms", equipment: "cable", target: "triceps", color: "#db2777" },
  { id: "7", name: "Incline Dumbbell Curl", bodyPart: "upper arms", equipment: "dumbbell", target: "biceps", color: "#0891b2" },
  { id: "8", name: "Lateral Raise", bodyPart: "shoulders", equipment: "dumbbell", target: "delts", color: "#65a30d" },
  { id: "9", name: "Cable Row", bodyPart: "back", equipment: "cable", target: "rhomboids", color: "#7c3aed" },
  { id: "10", name: "Leg Press", bodyPart: "upper legs", equipment: "machine", target: "quads", color: "#2563eb" },
  { id: "11", name: "Chest Fly", bodyPart: "chest", equipment: "dumbbell", target: "pectorals", color: "#dc2626" },
  { id: "12", name: "Face Pull", bodyPart: "shoulders", equipment: "cable", target: "rear delts", color: "#d97706" },
  { id: "13", name: "Leg Curl", bodyPart: "upper legs", equipment: "machine", target: "hamstrings", color: "#059669" },
  { id: "14", name: "Calf Raise", bodyPart: "lower legs", equipment: "machine", target: "calves", color: "#0891b2" },
  { id: "15", name: "Ab Wheel Rollout", bodyPart: "waist", equipment: "wheel roller", target: "abs", color: "#db2777" },
  { id: "16", name: "Hip Thrust", bodyPart: "upper legs", equipment: "barbell", target: "glutes", color: "#d97706" },
];

const BODY_PARTS = ["All", "back", "chest", "shoulders", "upper arms", "upper legs", "lower legs", "waist"];
const EQUIPMENT = ["All", "barbell", "dumbbell", "cable", "machine", "body weight", "wheel roller"];

export default function AdminExercisesPage() {
  const [search, setSearch] = useState("");
  const [bodyPart, setBodyPart] = useState("All");
  const [equipment, setEquipment] = useState("All");

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchBody = bodyPart === "All" || ex.bodyPart === bodyPart;
      const matchEq = equipment === "All" || ex.equipment === equipment;
      return matchSearch && matchBody && matchEq;
    });
  }, [search, bodyPart, equipment]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
          <span className="w-4 h-px bg-red-500" /> Library
        </p>
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">
          Exercise Library
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/[0.07] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/40 transition-all normal-case font-normal tracking-normal"
          />
        </div>

        {/* Body Part */}
        <div className="relative">
          <select
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-card border border-white/[0.07] text-sm text-white/80 focus:outline-none focus:border-red-500/40 transition-all cursor-pointer"
          >
            {BODY_PARTS.map((b) => <option key={b} value={b}>{b === "All" ? "All Body Parts" : b}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        {/* Equipment */}
        <div className="relative">
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-card border border-white/[0.07] text-sm text-white/80 focus:outline-none focus:border-red-500/40 transition-all cursor-pointer"
          >
            {EQUIPMENT.map((eq) => <option key={eq} value={eq}>{eq === "All" ? "All Equipment" : eq}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">
        Showing {filtered.length} of {EXERCISES.length} exercises
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden group cursor-pointer hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-200"
            >
              {/* GIF Placeholder */}
              <div
                className="h-44 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${ex.color}22, ${ex.color}11)` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell size={40} className="text-white/10 group-hover:text-white/20 transition-colors" style={{ color: ex.color + "40" }} />
                </div>
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: ex.color + "25", border: `1px solid ${ex.color}40` }}
                >
                  <Dumbbell size={32} style={{ color: ex.color }} />
                </div>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/60">
                  GIF
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wide leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2">
                  {ex.name}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: ex.color + "15", borderColor: ex.color + "30", color: ex.color }}>
                    <Target size={8} />
                    {ex.target}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-[9px] font-bold uppercase tracking-wider text-white/40">
                    <Zap size={8} />
                    {ex.equipment}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Dumbbell size={40} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-bold uppercase tracking-wider">No exercises found</p>
          <p className="text-white/20 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
