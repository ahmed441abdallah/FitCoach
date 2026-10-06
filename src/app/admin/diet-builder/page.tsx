"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, X, GripVertical, ChevronDown,
  Save, Loader2, CheckCircle2, Trash2, List, ArrowRight, Users, Utensils, AlertTriangle, Apple
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
    t.userName?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getInitials = (name: string) => name ? name.slice(0, 2).toUpperCase() : "??";

  return (
    <div ref={ref} className="relative w-72">
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border border-white/[0.09] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {trainees.length > 4 && (
              <div className="p-3 border-b border-white/[0.06]">
                <div className="relative">
                  <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input autoFocus placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 transition-all" />
                </div>
              </div>
            )}
            <div className="max-h-52 overflow-y-auto py-1.5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-1.5 text-white/25">
                  <Users size={20} />
                  <p className="text-xs font-semibold">No clients found</p>
                </div>
              ) : (
                filtered.map(t => (
                  <button
                    key={t._id} type="button" onClick={() => { onChange(t._id); setOpen(false); setSearch(""); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.05] transition-colors text-left group ${value === t._id ? "bg-[#c8fe1b]/[0.06]" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${value === t._id ? "bg-[#c8fe1b]/20 border border-[#c8fe1b]/30" : "bg-white/[0.05] border border-white/10 group-hover:border-white/20"}`}>
                      <span className={`text-[10px] font-extrabold ${value === t._id ? "text-[#c8fe1b]" : "text-white/50"}`}>{getInitials(t.userName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${value === t._id ? "text-[#c8fe1b]" : "text-white"}`}>{t.userName}</p>
                      <p className="text-[9px] text-white/35 truncate">{t.email}</p>
                    </div>
                    {value === t._id && <div className="w-1.5 h-1.5 rounded-full bg-[#c8fe1b] flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
            {trainees.length > 0 && (
              <div className="px-4 py-2 border-t border-white/[0.05] bg-white/[0.01]">
                <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">{filtered.length} active subscriber{filtered.length !== 1 ? "s" : ""}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// â”€â”€â”€ Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface MealItem {
  id: string; // purely for local key mapping
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id: string;
  mealName: string;
  mealDescription: string;
  mealItems: MealItem[];
}

export default function DietBuilderPage() {
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [description, setDescription] = useState("Custom Diet Plan");
  const [meals, setMeals] = useState<Meal[]>([
    { id: "1", mealName: "Breakfast", mealDescription: "", mealItems: [] }
  ]);

  const [trainees, setTrainees] = useState<{ _id: string; userName: string; email: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subRes = await axiosInstance.get("/subscriptions?limit=1000", { withCredentials: true });
        if (subRes.data.success) {
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
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Generators for temporary local IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Meal Operations
  const addMeal = () => setMeals(prev => [...prev, { id: generateId(), mealName: `Meal ${prev.length + 1}`, mealDescription: "", mealItems: [] }]);
  const removeMeal = (id: string) => setMeals(prev => prev.filter(m => m.id !== id));
  const updateMealName = (id: string, name: string) => setMeals(prev => prev.map(m => m.id === id ? { ...m, mealName: name } : m));
  const updateMealDescription = (id: string, desc: string) => setMeals(prev => prev.map(m => m.id === id ? { ...m, mealDescription: desc } : m));

  // Item Operations
  const addItem = (mealId: string) => setMeals(prev => prev.map(m => m.id === mealId ? {
    ...m, mealItems: [...m.mealItems, { id: generateId(), name: "New Item", calories: 0, protein: 0, carbs: 0, fats: 0 }]
  } : m));
  const removeItem = (mealId: string, itemId: string) => setMeals(prev => prev.map(m => m.id === mealId ? {
    ...m, mealItems: m.mealItems.filter(i => i.id !== itemId)
  } : m));
  const updateItem = (mealId: string, itemId: string, field: keyof MealItem, value: any) => setMeals(prev => prev.map(m => m.id === mealId ? {
    ...m, mealItems: m.mealItems.map(i => i.id === itemId ? { ...i, [field]: value } : i)
  } : m));

  // Calcs
  const totalCalories = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.calories, 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.protein, 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.carbs, 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.fats, 0), 0);
  const totalItems = meals.reduce((sum, m) => sum + m.mealItems.length, 0);

  const handleSave = async () => {
    if (!selectedTrainee || !description || totalItems === 0) return;
    setIsSaving(true);
    try {
      const payloadMeals = meals.map(m => ({
        mealName: m.mealName,
        mealDescription: m.mealDescription || "N/A",
        mealItems: m.mealItems.map(i => ({
          name: i.name, calories: i.calories, protein: i.protein, carbs: i.carbs, fats: i.fats
        }))
      }));
      const payload = {
        client: selectedTrainee,
        description,
        totalCalories,
        macros: { protein: totalProtein, carbs: totalCarbs, fats: totalFats },
        meals: payloadMeals
      };
      
      const res = await axiosInstance.post("/diet-plans", payload, { withCredentials: true });
      if (res.data.success) {
        setToast({ message: "Diet plan assigned successfully!", type: "success" });
        setMeals([{ id: generateId(), mealName: "Breakfast", mealDescription: "", mealItems: [] }]);
        setSelectedTrainee("");
        setDescription("Custom Diet Plan");
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || "Failed to save plan.";
      const isDuplicate = e.response?.status === 400 && msg.toLowerCase().includes("already exists");
      setToast({ message: isDuplicate ? `âš ï¸ ${msg} â€” go to Diet Plans to edit it.` : msg, type: isDuplicate ? "warning" : "error" });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* â•â•â• Top Bar â•â•â• */}
      <div className="flex-shrink-0 border-b border-white/[0.06] bg-card/60 backdrop-blur-xl px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center flex-shrink-0">
                <Apple size={16} className="text-[#c8fe1b]" />
              </div>
              <div>
                <p className="text-[#c8fe1b] text-[9px] font-bold uppercase tracking-[0.25em]">Coach Tool</p>
                <h1 className="text-white text-lg font-extrabold uppercase tracking-tight leading-none">Diet Builder</h1>
              </div>
              <Link href="/admin/diet-plans" className="ml-auto flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#c8fe1b] transition-colors uppercase tracking-widest">
                <List size={14} /> All Plans <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Plan description..."
                className="flex-1 text-base font-extrabold text-white uppercase tracking-tight bg-white/[0.03] border border-white/[0.08] focus:outline-none focus:border-[#c8fe1b]/50 rounded-xl px-4 py-2.5 transition-all placeholder:text-white/20 placeholder:font-normal placeholder:normal-case"
              />
              <TraineePicker
                trainees={trainees}
                value={selectedTrainee}
                onChange={setSelectedTrainee}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:flex-col lg:items-end">
            <div className="flex gap-3">
              <div className="text-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2">
                <p className="text-2xl font-extrabold text-[#c8fe1b]">{totalCalories}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">KCAL</p>
              </div>
              <div className="text-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 flex items-center gap-3">
                <div>
                   <p className="text-sm font-bold text-white">{totalProtein}g</p>
                   <p className="text-[8px] text-white/30 uppercase tracking-widest">Protein</p>
                </div>
                <div>
                   <p className="text-sm font-bold text-white">{totalCarbs}g</p>
                   <p className="text-[8px] text-white/30 uppercase tracking-widest">Carbs</p>
                </div>
                <div>
                   <p className="text-sm font-bold text-white">{totalFats}g</p>
                   <p className="text-[8px] text-white/30 uppercase tracking-widest">Fats</p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={totalItems === 0 || !selectedTrainee || isSaving || !description}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-widest hover:bg-lime-300 hover:shadow-[0_0_24px_rgba(200,254,27,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Saving..." : "Save Diet Plan"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* â•â•â• Main Area â•â•â• */}
      <div className="flex-1 overflow-y-auto p-5 md:p-8 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <AnimatePresence mode="popLayout">
            {meals.map((meal, mIdx) => {
              const mealCals = meal.mealItems.reduce((sum, item) => sum + item.calories, 0);
              const mealPro = meal.mealItems.reduce((sum, item) => sum + item.protein, 0);
              const mealCarb = meal.mealItems.reduce((sum, item) => sum + item.carbs, 0);
              const mealFat = meal.mealItems.reduce((sum, item) => sum + item.fats, 0);
              return (
                <motion.div
                  layout initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, height: 0 }}
                  key={meal.id} className="bg-card/80 border border-white/[0.07] rounded-2xl overflow-hidden"
                >
                  {/* Meal Header */}
                  <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3 bg-white/[0.01]">
                    <div className="w-7 h-7 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center text-[#c8fe1b] text-xs font-bold flex-shrink-0">
                      {mIdx + 1}
                    </div>
                    <input
                      type="text" value={meal.mealName} onChange={e => updateMealName(meal.id, e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-[#c8fe1b]/40 rounded-lg px-2 py-1 transition-all"
                    />
                    <input
                      type="text" value={meal.mealDescription} onChange={e => updateMealDescription(meal.id, e.target.value)}
                      placeholder="Meal note (e.g. 10:00 AM)"
                      className="flex-1 bg-transparent text-white/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-white/20 rounded-lg px-2 py-1 transition-all"
                    />
                    
                    <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-lg border border-white/[0.05]">
                      <span className="text-[#c8fe1b] text-xs font-extrabold">{mealCals} <span className="text-[9px] text-white/30 uppercase tracking-widest">kcal</span></span>
                      <div className="w-px h-3 bg-white/10" />
                      <span className="text-white text-xs font-bold">{mealPro}g <span className="text-[9px] text-white/30">P</span></span>
                      <span className="text-white text-xs font-bold">{mealCarb}g <span className="text-[9px] text-white/30">C</span></span>
                      <span className="text-white text-xs font-bold">{mealFat}g <span className="text-[9px] text-white/30">F</span></span>
                    </div>

                    <button onClick={() => removeMeal(meal.id)} className="w-7 h-7 ml-2 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Food Items */}
                  <div className="p-4 space-y-2">
                    <AnimatePresence>
                      {meal.mealItems.map((item, iIdx) => (
                        <motion.div
                          key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10, height: 0 }} transition={{ duration: 0.18 }}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all"
                        >
                          <GripVertical size={13} className="text-white/10 flex-shrink-0 cursor-grab" />
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white/50 bg-white/5 border border-white/10">
                            {iIdx + 1}
                          </div>
                          
                          <input
                            value={item.name} onChange={e => updateItem(meal.id, item.id, "name", e.target.value)} placeholder="Food name & quantity"
                            className="flex-1 bg-transparent text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#c8fe1b]/30 rounded-lg px-2 py-1 min-w-[200px]"
                          />

                          <div className="flex items-center divide-x divide-white/[0.06] bg-black/20 rounded-xl overflow-hidden border border-white/[0.04]">
                            {[
                              { label: "Kcal", field: "calories" as keyof MealItem, color: "#c8fe1b" },
                              { label: "Pro", field: "protein" as keyof MealItem, color: "#60a5fa" },
                              { label: "Carb", field: "carbs" as keyof MealItem, color: "#f472b6" },
                              { label: "Fat", field: "fats" as keyof MealItem, color: "#fbbf24" },
                            ].map(({ label, field, color: c }) => (
                              <div key={field} className="flex flex-col items-center px-3 py-1.5 hover:bg-white/5 transition-colors">
                                <span className="text-[8px] uppercase tracking-widest font-bold" style={{ color: c + "80" }}>{label}</span>
                                <input
                                  type="number" min={0} value={item[field]} onChange={e => updateItem(meal.id, item.id, field, parseFloat(e.target.value) || 0)}
                                  className="w-12 bg-transparent text-sm font-extrabold text-white text-center focus:outline-none" style={{ color: c }}
                                />
                              </div>
                            ))}
                          </div>

                          <button onClick={() => removeItem(meal.id, item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
                            <X size={13} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <button onClick={() => addItem(meal.id)} className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-[#c8fe1b]/40 hover:bg-[#c8fe1b]/[0.03] flex items-center justify-center gap-2 text-white/30 hover:text-[#c8fe1b] transition-all">
                      <Plus size={13} /><span className="text-[10px] font-bold uppercase tracking-widest">Add Food Item</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={addMeal}
            className="w-full py-5 rounded-2xl border border-dashed border-white/15 hover:border-[#c8fe1b]/40 hover:bg-[#c8fe1b]/[0.03] flex items-center justify-center gap-3 text-white/30 hover:text-[#c8fe1b] transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#c8fe1b]/10 flex items-center justify-center transition-colors"><Plus size={15} /></div>
            <span className="text-xs font-bold uppercase tracking-widest">Add New Meal</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl max-w-sm ${
              toast.type === "success" ? "bg-[#c8fe1b]/10 border-[#c8fe1b]/30 text-[#c8fe1b]" : toast.type === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} className="flex-shrink-0" /> : toast.type === "warning" ? <AlertTriangle size={18} className="flex-shrink-0" /> : <X size={18} className="flex-shrink-0" />}
            <p className="text-sm font-bold tracking-wide">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
