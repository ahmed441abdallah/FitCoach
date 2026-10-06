"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Apple, Trash2, Eye, Pencil, Search, X,
  Loader2, CheckCircle2, Users, Calendar,
  ClipboardList, AlertTriangle, Plus, GripVertical,
  ArrowUpDown, List
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface DietPlan {
  _id: string;
  description: string;
  totalCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  client: { _id: string; userName: string; email: string };
  meals: {
    _id: string;
    mealName: string;
    mealDescription: string;
    mealItems: {
      _id: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }[];
  }[];
  createdAt: string;
}

type EditMeal = {
  _id?: string;
  id: string;
  mealName: string;
  mealDescription: string;
  mealItems: {
    _id?: string;
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[];
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || "??";
const generateId = () => Math.random().toString(36).substr(2, 9);

// â”€â”€â”€ Detail Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DetailDrawer({ plan, onClose, onEdit, onDelete }: {
  plan: DietPlan; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const totalItems = plan.meals.reduce((a, m) => a + m.mealItems.length, 0);
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
            <p className="text-[9px] text-[#c8fe1b]/60 font-bold uppercase tracking-[0.25em] mb-1">Diet Plan</p>
            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight truncate">{plan.description}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.06] bg-white/[0.01] flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
            <Users size={12} className="text-[#c8fe1b]/60" />{plan.client?.userName || "Unknown"}
          </div>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1.5 text-xs text-white/50 font-semibold">
            <Calendar size={12} className="text-white/30" />{fmtDate(plan.createdAt)}
          </div>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-xs text-[#c8fe1b] font-bold">{plan.totalCalories} kcal</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-xs text-white/50 font-bold">{plan.meals.length} Meals</span>
        </div>

        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-6">
          <div className="flex flex-col">
             <span className="text-white text-sm font-bold">{plan.macros.protein}g</span>
             <span className="text-[9px] text-white/40 uppercase tracking-widest">Protein</span>
          </div>
          <div className="flex flex-col">
             <span className="text-white text-sm font-bold">{plan.macros.carbs}g</span>
             <span className="text-[9px] text-white/40 uppercase tracking-widest">Carbs</span>
          </div>
          <div className="flex flex-col">
             <span className="text-white text-sm font-bold">{plan.macros.fats}g</span>
             <span className="text-[9px] text-white/40 uppercase tracking-widest">Fats</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {plan.meals.map((meal, mIdx) => {
            const mealCals = meal.mealItems.reduce((sum, item) => sum + item.calories, 0);
            return (
              <div key={meal._id || mIdx} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center text-[#c8fe1b] text-[10px] font-bold">{mIdx + 1}</span>
                    <p className="text-sm font-bold text-white uppercase tracking-wide">{meal.mealName}</p>
                    {meal.mealDescription && <span className="text-xs text-white/40 ml-2">{meal.mealDescription}</span>}
                  </div>
                  <span className="text-xs font-bold text-[#c8fe1b]">{mealCals} kcal</span>
                </div>
                <div className="p-3 space-y-2">
                  {meal.mealItems.map((item, iIdx) => (
                    <div key={item._id || iIdx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-white/5">
                        <Apple size={10} className="text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs flex-shrink-0 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                        <span className="font-extrabold text-[#c8fe1b]">{item.calories} <span className="text-[9px] text-white/30 font-normal">kcal</span></span>
                        <span className="font-bold text-white/70">{item.protein}g <span className="text-[9px] text-white/30 font-normal">P</span></span>
                        <span className="font-bold text-white/70">{item.carbs}g <span className="text-[9px] text-white/30 font-normal">C</span></span>
                        <span className="font-bold text-white/70">{item.fats}g <span className="text-[9px] text-white/30 font-normal">F</span></span>
                      </div>
                    </div>
                  ))}
                  {meal.mealItems.length === 0 && <p className="text-center text-xs text-white/20 py-3">No items</p>}
                </div>
              </div>
            );
          })}
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
  plan: DietPlan;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}) {
  const [description, setDescription] = useState(plan.description || "");
  const [meals, setMeals] = useState<EditMeal[]>(
    plan.meals.map(m => ({ ...m, id: generateId(), mealItems: m.mealItems.map(i => ({ ...i, id: generateId() })) }))
  );
  const [saving, setSaving] = useState(false);

  const addMeal = () => setMeals(prev => [...prev, { id: generateId(), mealName: `Meal ${prev.length + 1}`, mealDescription: "", mealItems: [] }]);
  const removeMeal = (id: string) => setMeals(prev => prev.filter(m => m.id !== id));
  const updateMealName = (id: string, name: string) => setMeals(prev => prev.map(m => m.id === id ? { ...m, mealName: name } : m));
  const updateMealDescription = (id: string, desc: string) => setMeals(prev => prev.map(m => m.id === id ? { ...m, mealDescription: desc } : m));

  const addItem = (mealId: string) => setMeals(prev => prev.map(m => m.id === mealId ? { ...m, mealItems: [...m.mealItems, { id: generateId(), name: "New Item", calories: 0, protein: 0, carbs: 0, fats: 0 }] } : m));
  const removeItem = (mealId: string, itemId: string) => setMeals(prev => prev.map(m => m.id === mealId ? { ...m, mealItems: m.mealItems.filter(i => i.id !== itemId) } : m));
  const updateItem = (mealId: string, itemId: string, field: string, value: any) => setMeals(prev => prev.map(m => m.id === mealId ? { ...m, mealItems: m.mealItems.map(i => i.id === itemId ? { ...i, [field]: value } : i) } : m));

  const totalCalories = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.calories, 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.protein, 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.carbs, 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.mealItems.reduce((acc, item) => acc + item.fats, 0), 0);

  const handle = async () => {
    setSaving(true);
    const payloadMeals = meals.map(m => ({
      mealName: m.mealName, mealDescription: m.mealDescription || "N/A",
      mealItems: m.mealItems.map(i => ({ name: i.name, calories: i.calories, protein: i.protein, carbs: i.carbs, fats: i.fats }))
    }));
    await onSave(plan._id, {
      description, totalCalories, macros: { protein: totalProtein, carbs: totalCarbs, fats: totalFats }, meals: payloadMeals
    });
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 250 }}
        onClick={e => e.stopPropagation()}
        className="relative ml-auto w-full max-w-3xl h-full bg-background border-l border-white/[0.08] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/[0.07] bg-card/50 flex-shrink-0">
          <div>
            <p className="text-[9px] text-[#c8fe1b]/60 font-bold uppercase tracking-[0.25em]">Edit Diet Plan</p>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">{plan.client?.userName || "Client"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white transition-all"><X size={16} /></button>
        </div>
        
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-6 bg-white/[0.01]">
          <div className="flex flex-col">
             <span className="text-[#c8fe1b] text-xl font-extrabold">{totalCalories}</span>
             <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Total Kcal</span>
          </div>
          <div className="flex flex-col">
             <span className="text-white text-lg font-bold">{totalProtein}g</span>
             <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Protein</span>
          </div>
          <div className="flex flex-col">
             <span className="text-white text-lg font-bold">{totalCarbs}g</span>
             <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Carbs</span>
          </div>
          <div className="flex flex-col">
             <span className="text-white text-lg font-bold">{totalFats}g</span>
             <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Fats</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4 border-b border-white/[0.06]">
            <div>
              <label className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1.5">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-bold uppercase tracking-wide focus:outline-none focus:border-[#c8fe1b]/40 transition-all" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {meals.map((meal, mIdx) => (
                <motion.div key={meal.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
                    <span className="w-6 h-6 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center text-[#c8fe1b] text-[10px] font-bold flex-shrink-0">{mIdx + 1}</span>
                    <input type="text" value={meal.mealName} onChange={e => updateMealName(meal.id, e.target.value)} className="w-32 bg-transparent text-white text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-[#c8fe1b]/30 rounded-lg px-2 py-0.5" />
                    <input type="text" value={meal.mealDescription} onChange={e => updateMealDescription(meal.id, e.target.value)} className="flex-1 bg-transparent text-white/50 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 rounded-lg px-2 py-0.5" placeholder="Time/Note" />
                    <button onClick={() => removeMeal(meal.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={11} /></button>
                  </div>
                  <div className="p-3 space-y-2">
                    <AnimatePresence>
                      {meal.mealItems.map((item, exIdx) => (
                        <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex flex-col sm:flex-row sm:items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all">
                          <GripVertical size={12} className="text-white/10 flex-shrink-0" />
                          <input value={item.name} onChange={e => updateItem(meal.id, item.id, "name", e.target.value)} className="flex-1 min-w-0 bg-transparent text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white/30 rounded-lg px-2 py-1" />
                          <div className="flex items-center divide-x divide-white/[0.06] bg-black/20 rounded-xl overflow-hidden border border-white/[0.04]">
                            {([{ label: "Kcal", field: "calories", color: "#c8fe1b" }, { label: "Pro", field: "protein", color: "#60a5fa" }, { label: "Carb", field: "carbs", color: "#f472b6" }, { label: "Fat", field: "fats", color: "#fbbf24" }]).map(({ label, field, color: fc }) => (
                              <div key={field} className="flex flex-col items-center px-2.5 py-1.5 hover:bg-white/5">
                                <span className="text-[7px] uppercase tracking-widest font-bold" style={{ color: fc + "80" }}>{label}</span>
                                <input type="number" min={0} value={(item as any)[field]} onChange={e => updateItem(meal.id, item.id, field, parseFloat(e.target.value) || 0)} className="w-10 bg-transparent text-sm font-extrabold text-center focus:outline-none" style={{ color: fc }} />
                              </div>
                            ))}
                          </div>
                          <button onClick={() => removeItem(meal.id, item.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"><X size={11} /></button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button onClick={() => addItem(meal.id)} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-[#c8fe1b]/40 hover:bg-[#c8fe1b]/[0.03] flex items-center justify-center gap-2 text-white/30 hover:text-[#c8fe1b] transition-all"><Plus size={12} /><span className="text-[10px] font-bold uppercase tracking-widest">Add Food</span></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={addMeal} className="w-full py-4 rounded-2xl border border-dashed border-white/15 hover:border-[#c8fe1b]/40 hover:bg-[#c8fe1b]/[0.03] flex items-center justify-center gap-2 text-white/30 hover:text-[#c8fe1b] transition-all">
              <Plus size={14} /><span className="text-xs font-bold uppercase tracking-widest">Add New Meal</span>
            </button>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/[0.07] bg-card/50 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/[0.07] text-white/60 text-sm font-bold uppercase tracking-widest hover:bg-white/[0.04] transition-all">Cancel</button>
          <button onClick={handle} disabled={saving || !description} className="flex-1 py-3 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-widest hover:bg-lime-300 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}{saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Delete Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConfirmDelete({ planDesc, onConfirm, onCancel, loading }: {
  planDesc: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm bg-card border border-red-500/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertTriangle size={24} className="text-red-400" /></div>
          <h3 className="text-lg font-extrabold text-white">Delete Diet Plan?</h3>
          <p className="text-sm text-white/50">Delete <span className="text-white font-bold">"{planDesc}"</span>? This cannot be undone.</p>
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
export default function DietPlansPage() {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  const [detailPlan, setDetailPlan] = useState<DietPlan | null>(null);
  const [editPlan, setEditPlan] = useState<DietPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DietPlan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/diet-plans", { withCredentials: true });
      if (res.data.success) setPlans(res.data.data);
    } catch { showToast("Failed to fetch diet plans", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/diet-plans/${deleteTarget._id}`, { withCredentials: true });
      setPlans(prev => prev.filter(p => p._id !== deleteTarget._id));
      showToast("Plan deleted successfully", "success");
      setDetailPlan(null);
    } catch { showToast("Failed to delete plan", "error"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      const res = await axiosInstance.put(`/diet-plans/${id}`, data, { withCredentials: true });
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
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.userName?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: any, bv: any;
      if (sortField === "description") { av = a.description; bv = b.description; }
      else if (sortField === "client") { av = a.client?.userName; bv = b.client?.userName; }
      else if (sortField === "calories") { av = a.totalCalories; bv = b.totalCalories; }
      else if (sortField === "meals") { av = a.meals.length; bv = b.meals.length; }
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[#c8fe1b] text-[9px] font-bold uppercase tracking-[0.25em] mb-1 flex items-center gap-2">
            <span className="w-4 h-px bg-[#c8fe1b]" /> Coach Panel
          </p>
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">Diet Plans</h1>
          <p className="text-white/40 text-sm mt-1">{plans.length} plans assigned</p>
        </div>
        <Link
          href="/admin/diet-builder"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-widest hover:bg-lime-300 hover:shadow-[0_0_20px_rgba(200,254,27,0.4)] transition-all"
        >
          <Apple size={15} /> New Diet Plan
        </Link>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by plan name or trainee..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 transition-all"
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden">

        <div className="grid grid-cols-[2.5fr_1.8fr_90px_100px_100px_130px] gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
          <SortHeader field="description" label="Plan" />
          <SortHeader field="client"   label="Trainee" />
          <SortHeader field="meals"     label="Meals" />
          <SortHeader field="calories" label="Calories" />
          <SortHeader field="createdAt" label="Created" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Actions</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={28} className="animate-spin text-[#c8fe1b]/40" />
            <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Loading plans...</p>
          </div>
        )}

        {!loading && (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {filtered.map((plan, i) => (
                <motion.div
                  key={plan._id} layout
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[2.5fr_1.8fr_90px_100px_100px_130px] gap-4 items-center px-6 py-4 hover:bg-white/[0.025] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#c8fe1b]/8 border border-[#c8fe1b]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c8fe1b]/15 transition-all">
                      <Apple size={14} className="text-[#c8fe1b]/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-white uppercase tracking-tight truncate">{plan.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-extrabold text-violet-300">{getInitials(plan.client?.userName || "")}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/80 truncate">{plan.client?.userName || "â€”"}</p>
                      <p className="text-[9px] text-white/30 truncate">{plan.client?.email || ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                      <span className="text-sm font-extrabold text-white">{plan.meals.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-[#c8fe1b]">{plan.totalCalories} <span className="text-[10px] text-white/30 uppercase">kcal</span></span>
                  </div>

                  <p className="text-[11px] text-white/35 font-semibold">{fmtDate(plan.createdAt)}</p>

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
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <ClipboardList size={24} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-semibold">
              {search ? "No plans match your search" : "No diet plans created yet"}
            </p>
            {!search && (
              <Link href="/admin/diet-builder" className="text-[#c8fe1b] text-xs font-bold uppercase tracking-widest hover:underline">
                Create your first diet plan â†’
              </Link>
            )}
          </div>
        )}

        <div className="px-6 py-3.5 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
          <p className="text-white/25 text-xs font-semibold">
            Showing {filtered.length} of {plans.length} plans
          </p>
        </div>
      </motion.div>

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

      <AnimatePresence>
        {editPlan && <EditModal plan={editPlan} onClose={() => setEditPlan(null)} onSave={handleEdit} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDelete planDesc={deleteTarget.description} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
        )}
      </AnimatePresence>

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
