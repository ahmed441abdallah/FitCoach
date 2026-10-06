"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  ArrowLeft,
  ChevronDown,
  Scale,
  Ruler,
  Calendar,
  Activity,
  Target,
  Beef,
  Wheat,
  Droplet,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { TransitionLink } from "@/components/layout/TransitionLink";
import Navbar from "@/components/layout/Navbar";
import Beams from "@/components/Beams";
import { useTranslations } from "next-intl";

// ─── Types ────────────────────────────────────────────────────────────────────
type Gender = "male" | "female";
type Unit = "metric" | "imperial";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Goal = "lose" | "maintain" | "gain";

interface FormState {
  gender: Gender;
  unit: Unit;
  age: string;
  weightKg: string;
  weightLbs: string;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  activity: ActivityLevel;
  goal: Goal;
}

interface Results {
  bmr: number;
  tdee: number;
  target: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_DELTAS: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

// ─── Calculation Logic ────────────────────────────────────────────────────────
function calculate(form: FormState): Results | null {
  const age = parseInt(form.age);
  const activity = ACTIVITY_MULTIPLIERS[form.activity];

  let weightKg: number;
  let heightCm: number;

  if (form.unit === "metric") {
    weightKg = parseFloat(form.weightKg);
    heightCm = parseFloat(form.heightCm);
  } else {
    weightKg = parseFloat(form.weightLbs) * 0.453592;
    heightCm = parseInt(form.heightFt) * 30.48 + parseFloat(form.heightIn || "0") * 2.54;
  }

  if (!age || !weightKg || !heightCm || isNaN(age) || isNaN(weightKg) || isNaN(heightCm)) return null;
  if (age < 10 || age > 120) return null;

  // Mifflin-St Jeor Equation
  const bmr =
    form.gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = bmr * activity;
  const goalDelta = GOAL_DELTAS[form.goal] ?? 0;
  const target = Math.round(tdee + goalDelta);

  // Macros (protein: 30%, carbs: 45%, fat: 25% of target calories)
  const protein = Math.round((target * 0.3) / 4);
  const carbs = Math.round((target * 0.45) / 4);
  const fat = Math.round((target * 0.25) / 9);

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), target, protein, carbs, fat };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/35 mb-3 flex items-center gap-2">
      <span className="inline-block w-4 h-px bg-primary" />
      {children}
    </p>
  );
}

function NumberInput({
  id,
  label,
  unit,
  value,
  onChange,
  min,
  max,
  placeholder,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/40 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className="w-full pr-12 pl-4 py-3 rounded-2xl border border-black/10 dark:border-white/8 bg-black/4 dark:bg-white/4 text-sm text-black dark:text-foreground placeholder:text-black/25 dark:placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all normal-case font-normal tracking-normal"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wider text-black/30 dark:text-white/30 pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function SelectInput<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/40 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none pl-4 pr-10 py-3 rounded-2xl border border-black/10 dark:border-white/8 bg-black/4 dark:bg-white/4 text-sm text-black dark:text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all normal-case font-normal tracking-normal"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 pointer-events-none"
        />
      </div>
    </div>
  );
}

// Macro ring (simple arc SVG)
function MacroRing({
  label,
  grams,
  calories,
  color,
  icon: Icon,
  pct,
}: {
  label: string;
  grams: number;
  calories: number;
  color: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  pct: number;
}) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" className="text-black/8 dark:text-white/8" strokeWidth="7" />
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-extrabold text-black dark:text-white">{grams}<span className="text-xs font-bold text-black/40 dark:text-white/40 ml-0.5">g</span></p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 dark:text-white/40">{label}</p>
        <p className="text-[10px] text-black/35 dark:text-white/30 normal-case font-normal tracking-normal">{calories} kcal</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CaloriesPage() {
  const t = useTranslations("calories");

  const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: "sedentary", label: t("sedentary"), desc: t("sedentaryDesc") },
    { value: "light", label: t("light"), desc: t("lightDesc") },
    { value: "moderate", label: t("moderate"), desc: t("moderateDesc") },
    { value: "active", label: t("active"), desc: t("activeDesc") },
    { value: "very_active", label: t("veryActive"), desc: t("veryActiveDesc") },
  ];

  const GOAL_OPTIONS: { value: Goal; label: string; delta: number; icon: typeof TrendingDown }[] = [
    { value: "lose", label: t("loseFat"), delta: -500, icon: TrendingDown },
    { value: "maintain", label: t("maintain"), delta: 0, icon: Minus },
    { value: "gain", label: t("buildMuscle"), delta: +300, icon: TrendingUp },
  ];

  const [form, setForm] = useState<FormState>({
    gender: "male",
    unit: "metric",
    age: "",
    weightKg: "",
    weightLbs: "",
    heightCm: "",
    heightFt: "",
    heightIn: "",
    activity: "moderate",
    goal: "maintain",
  });

  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState("");
  const [calculated, setCalculated] = useState(false);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCalculate = () => {
    const res = calculate(form);
    if (!res) {
      setError(t("errorFill"));
      setResults(null);
      return;
    }
    setError("");
    setResults(res);
    setCalculated(true);
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const goalConfig = GOAL_OPTIONS.find((g) => g.value === form.goal)!;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* ── Hero Header ─────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 px-6 border-b border-black/[0.06] dark:border-foreground/[0.06]">
          {/* Beams Background */}
          <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
            <Beams
              beamWidth={4}
              beamHeight={35}
              beamNumber={25}
              lightColor="#888888"
              speed={1.5}
              noiseIntensity={1.5}
              scale={0.2}
              rotation={25}
              beamColor="#333333"
              backgroundColor="#0a0a12"
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <TransitionLink
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/50 dark:text-muted-foreground hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              {t("backHome")}
            </TransitionLink>

            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Flame size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary flex items-center gap-2">
                  <span className="inline-block w-5 h-px bg-primary" />
                  {t("freeTool")}
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-black dark:text-foreground leading-none">
                  {t("title1")} <span className="text-primary dark:bg-clip-text">{t("title2")}</span>
                </h1>
              </div>
            </div>
            <p className="text-black/55 dark:text-muted-foreground text-sm normal-case font-normal tracking-normal max-w-lg">
              {t("description")}
            </p>
          </div>
        </section>

        {/* ── Calculator Form ──────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-10 space-y-8">

          {/* Unit + Gender Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit */}
            <div className="glass-card rounded-2xl p-5">
              <SectionLabel>{t("unitSystem")}</SectionLabel>
              <div className="flex rounded-xl border border-black/8 dark:border-white/8 overflow-hidden">
                {(["metric", "imperial"] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => set("unit", u)}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${form.unit === u
                      ? "bg-primary text-black shadow-[0_0_12px_rgba(200,254,27,0.35)]"
                      : "text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white"
                      }`}
                  >
                    {u === "metric" ? t("metric") : t("imperial")}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="glass-card rounded-2xl p-5">
              <SectionLabel>{t("bioSex")}</SectionLabel>
              <div className="flex rounded-xl border border-black/8 dark:border-white/8 overflow-hidden">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => set("gender", g)}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${form.gender === g
                      ? "bg-primary text-black shadow-[0_0_12px_rgba(200,254,27,0.35)]"
                      : "text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white"
                      }`}
                  >
                    {g === "male" ? t("male") : t("female")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Body Stats */}
          <div className="glass-card rounded-2xl p-6">
            <SectionLabel>{t("bodyStats")}</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Age */}
              <NumberInput
                id="age"
                label={t("age")}
                unit=""
                value={form.age}
                onChange={(v) => set("age", v)}
                min={10} max={120}
                placeholder="25"
              />

              {/* Weight */}
              {form.unit === "metric" ? (
                <NumberInput
                  id="weight-kg"
                  label={t("weight")}
                  unit="kg"
                  value={form.weightKg}
                  onChange={(v) => set("weightKg", v)}
                  placeholder="75"
                />
              ) : (
                <NumberInput
                  id="weight-lbs"
                  label={t("weight")}
                  unit="lbs"
                  value={form.weightLbs}
                  onChange={(v) => set("weightLbs", v)}
                  placeholder="165"
                />
              )}

              {/* Height */}
              {form.unit === "metric" ? (
                <NumberInput
                  id="height-cm"
                  label={t("height")}
                  unit="cm"
                  value={form.heightCm}
                  onChange={(v) => set("heightCm", v)}
                  placeholder="175"
                />
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/40 mb-1.5">{t("height")}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        id="height-ft"
                        type="number"
                        inputMode="decimal"
                        min={1} max={8}
                        value={form.heightFt}
                        onChange={(e) => set("heightFt", e.target.value)}
                        placeholder="5"
                        className="w-full pr-8 pl-3 py-3 rounded-2xl border border-black/10 dark:border-white/8 bg-black/4 dark:bg-white/4 text-sm text-black dark:text-foreground placeholder:text-black/25 dark:placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all normal-case font-normal tracking-normal"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-black/30 dark:text-white/30 pointer-events-none">ft</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        id="height-in"
                        type="number"
                        inputMode="decimal"
                        min={0} max={11}
                        value={form.heightIn}
                        onChange={(e) => set("heightIn", e.target.value)}
                        placeholder="10"
                        className="w-full pr-8 pl-3 py-3 rounded-2xl border border-black/10 dark:border-white/8 bg-black/4 dark:bg-white/4 text-sm text-black dark:text-foreground placeholder:text-black/25 dark:placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all normal-case font-normal tracking-normal"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-black/30 dark:text-white/30 pointer-events-none">in</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Level */}
          <div className="glass-card rounded-2xl p-6">
            <SectionLabel>{t("activityLevel")}</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("activity", opt.value)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 ${form.activity === opt.value
                    ? "border-primary bg-primary/10 dark:bg-primary/15 shadow-[0_0_14px_rgba(200,254,27,0.2)]"
                    : "border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/3 hover:border-primary/40"
                    }`}
                >
                  <Activity
                    size={16}
                    className={form.activity === opt.value ? "text-primary mb-1.5" : "text-black/30 dark:text-white/30 mb-1.5"}
                  />
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${form.activity === opt.value ? "text-black dark:text-foreground" : "text-black/50 dark:text-white/40"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-[9px] normal-case font-normal tracking-normal mt-0.5 ${form.activity === opt.value ? "text-black/55 dark:text-foreground/60" : "text-black/30 dark:text-white/25"}`}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="glass-card rounded-2xl p-6">
            <SectionLabel>{t("yourGoal")}</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("goal", opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${form.goal === opt.value
                    ? "border-primary bg-primary/10 dark:bg-primary/15 shadow-[0_0_18px_rgba(200,254,27,0.2)]"
                    : "border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/3 hover:border-primary/40"
                    }`}
                >
                  <opt.icon
                    size={20}
                    className={form.goal === opt.value ? "text-primary" : "text-black/30 dark:text-white/30"}
                  />
                  <p className={`text-xs font-bold uppercase tracking-wider ${form.goal === opt.value ? "text-black dark:text-foreground" : "text-black/50 dark:text-white/40"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-[10px] font-semibold ${opt.delta === 0 ? "text-black/30 dark:text-white/30" :
                    opt.delta > 0 ? "text-emerald-500" : "text-sky-400"
                    }`}>
                    {opt.delta === 0 ? t("maintenance") : opt.delta > 0 ? `+${opt.delta} kcal` : `${opt.delta} kcal`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2"
                role="alert"
              >
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calculate Button */}
          <motion.button
            id="calculate-btn"
            onClick={handleCalculate}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full rounded-2xl py-4 text-base font-extrabold uppercase tracking-widest overflow-hidden bg-primary text-black shadow-[0_6px_32px_rgba(200,254,27,0.4)] hover:shadow-[0_8px_40px_rgba(200,254,27,0.55)] transition-all duration-300"
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative flex items-center justify-center gap-2">
              <Flame size={18} />
              {t("calcButton")}
            </span>
          </motion.button>
        </section>

        {/* ── Results ──────────────────────────────────────────── */}
        <AnimatePresence>
          {results && (
            <motion.section
              id="results-section"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto px-6 pb-16 space-y-6"
            >
              {/* Headline banner */}
              <div
                className="relative rounded-3xl overflow-hidden p-8 text-center"
                style={{ background: "oklch(0.1 0.015 250)" }}
              >
                {/* Grid bg */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(rgba(200,254,27,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,254,27,0.07) 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,254,27,0.1) 0%, transparent 70%)" }}
                />

                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-2 flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-px bg-primary" />
                    {t("yourDailyTarget")}
                    <span className="inline-block w-5 h-px bg-primary" />
                  </p>
                  <div className="flex items-end justify-center gap-2">
                    <motion.span
                      className="text-7xl md:text-8xl font-extrabold text-white leading-none"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {results.target.toLocaleString()}
                    </motion.span>
                    <span className="text-2xl font-bold text-white/40 mb-2">kcal</span>
                  </div>
                  <p className="text-white/50 text-sm normal-case font-normal tracking-normal mt-1">
                    {goalConfig.label} · {t(form.activity.replace("_", "") as any)} {t("lifestyle")}
                  </p>

                  {/* BMR / TDEE stats */}
                  <div className="flex justify-center gap-6 mt-6">
                    {[
                      { label: t("bmr"), value: results.bmr, tooltip: t("bmrTooltip") },
                      { label: t("tdee"), value: results.tdee, tooltip: t("tdeeTooltip") },
                    ].map(({ label, value, tooltip }) => (
                      <div key={label} className="text-center" title={tooltip}>
                        <p className="text-2xl font-extrabold text-white">{value.toLocaleString()}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Macros breakdown */}
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <SectionLabel>{t("dailyMacros")}</SectionLabel>
                <p className="text-xs text-black/45 dark:text-white/35 normal-case font-normal tracking-normal mb-8 -mt-1">
                  {t("macrosDesc")}
                </p>

                <div className="grid grid-cols-3 gap-6 justify-items-center">
                  <MacroRing
                    label={t("protein")}
                    grams={results.protein}
                    calories={results.protein * 4}
                    color="#c8fe1b"
                    icon={Beef}
                    pct={30}
                  />
                  <MacroRing
                    label={t("carbs")}
                    grams={results.carbs}
                    calories={results.carbs * 4}
                    color="#38bdf8"
                    icon={Wheat}
                    pct={45}
                  />
                  <MacroRing
                    label={t("fat")}
                    grams={results.fat}
                    calories={results.fat * 9}
                    color="#a78bfa"
                    icon={Droplet}
                    pct={25}
                  />
                </div>

                {/* Macro bars */}
                <div className="mt-8 space-y-3">
                  {[
                    { label: t("protein"), pct: 30, color: "#c8fe1b", g: results.protein },
                    { label: t("carbs"), pct: 45, color: "#38bdf8", g: results.carbs },
                    { label: t("fat"), pct: 25, color: "#a78bfa", g: results.fat },
                  ].map(({ label, pct, color, g }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
                        <span className="text-black/60 dark:text-white/50">{label}</span>
                        <span className="text-black dark:text-white">{g}g · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Scale,
                    color: "text-primary",
                    bg: "bg-primary/10 border-primary/20",
                    title: t("weighWeekly"),
                    tip: t("weighTip"),
                  },
                  {
                    icon: Target,
                    color: "text-sky-400",
                    bg: "bg-sky-500/10 border-sky-500/20",
                    title: t("hitProtein"),
                    tip: t("hitProteinTip", { grams: results.protein }),
                  },
                  {
                    icon: Flame,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10 border-orange-500/20",
                    title: t("stayConsistent"),
                    tip: t("stayTip"),
                  },
                ].map(({ icon: Icon, color, bg, title, tip }) => (
                  <div key={title} className={`glass-card rounded-2xl p-5 border ${bg}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                      <Icon size={16} className={color} />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-black dark:text-foreground mb-1">{title}</h3>
                    <p className="text-xs text-black/50 dark:text-white/40 normal-case font-normal tracking-normal leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Recalculate */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setResults(null);
                    setCalculated(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("recalc")}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
