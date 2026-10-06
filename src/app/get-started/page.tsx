"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { useAppSelector } from "@/lib/hooks";
import axiosInstance from "@/lib/axios";

import {
  Target, Flame, Heart, Zap, Trophy, TrendingUp,
  ChevronRight, ChevronLeft, Upload, X, Check,
  Dumbbell, Apple, AlertCircle, User, Camera
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  goals: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  age: string;
  trainingDaysPerWeek: string;
  experienceLevel: string;
  injuriesOrRestrictions: string;
  foodPreferences: string;
  images: File[];
}

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Goal", icon: Target },
  { id: 2, label: "Body", icon: User },
  { id: 3, label: "Training", icon: Dumbbell },
  { id: 4, label: "Health", icon: Heart },
  { id: 5, label: "Photos", icon: Camera },
];

// ─── Goal options ─────────────────────────────────────────────────────────────
const GOALS = [
  { value: "Lose Fat", icon: Flame, desc: "Burn fat & get lean" },
  { value: "Build Muscle", icon: Dumbbell, desc: "Gain mass & strength" },
  { value: "Improve Endurance", icon: TrendingUp, desc: "Boost stamina & cardio" },
  { value: "Get Athletic", icon: Zap, desc: "Speed, power & agility" },
  { value: "Stay Healthy", icon: Heart, desc: "Wellness & longevity" },
  { value: "Competition Prep", icon: Trophy, desc: "Stage-ready physique" },
];

// ─── Experience options ───────────────────────────────────────────────────────
const EXPERIENCE = [
  { value: "Beginner", label: "Beginner", desc: "Less than 1 year of training", color: "var(--chart-2)" },
  { value: "Intermediate", label: "Intermediate", desc: "1–3 years of consistent training", color: "var(--chart-4)" },
  { value: "Advanced", label: "Advanced", desc: "3+ years, serious athlete", color: "var(--destructive)" },
];

const TRAINING_DAYS = ["2", "3", "4", "5", "6"];
const FOOD_OPTIONS = [
  "No Restrictions", "Vegetarian", "Vegan", "Gluten-Free",
  "Dairy-Free", "Keto", "High Protein", "Low Carb",
];

const PLANS = [
  {
    id: "basic",
    name: "Starter",
    duration: "1 Month",
    price: 149,
    features: ["Custom workout plan", "Nutrition guide", "Weekly check-in"],
    accent: "var(--chart-2)",
  },
  {
    id: "pro",
    name: "Transform",
    duration: "3 Months",
    price: 399,
    popular: true,
    features: ["Custom workout plan", "Personalized nutrition", "Bi-weekly calls", "Progress tracking", "Priority support"],
    accent: "var(--primary)",
  },
  {
    id: "elite",
    name: "Elite",
    duration: "6 Months",
    price: 699,
    features: ["Everything in Transform", "Daily check-ins", "1-on-1 coaching", "Supplement guide", "Lifetime alumni access"],
    accent: "var(--chart-3)",
  },
];

// ─── Reusable field ───────────────────────────────────────────────────────────
function Field({
  id, label, type = "text", value, onChange, placeholder, unit, min, max,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; unit?: string;
  min?: string; max?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id}
        className="text-sm font-semibold uppercase tracking-wider text-foreground dark:text-foreground/70">
        {label}{unit && <span className="text-primary/80 normal-case tracking-normal ml-1">({unit})</span>}
      </label>
      <input
        id={id} type={type} value={value} min={min} max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition-all duration-200",
          // Light mode: strong contrast
          "border-black/15 bg-black/4 text-black placeholder:text-black/35",
          "hover:border-black/30 focus:border-primary focus:ring-2 focus:ring-primary/25",
          // Dark mode override
          "dark:border-foreground/10 dark:bg-foreground/5 dark:text-foreground dark:placeholder:text-muted-foreground",
          "dark:hover:border-foreground/20"
        )}
      />
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────
function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 w-full mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                done ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(200,254,27,0.5)]" :
                  active ? "bg-primary/15 border-2 border-primary text-primary dark:bg-primary/20" :
                    "bg-black/6 border border-black/12 text-black/40 dark:bg-foreground/5 dark:border-foreground/10 dark:text-muted-foreground"
              )}>
                {done ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider hidden sm:block",
                active ? "text-primary" :
                  done ? "text-black/50 dark:text-foreground/60" :
                    "text-black/35 dark:text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "h-px flex-1 mx-1 transition-all duration-500",
                done ? "bg-primary/50" : "bg-black/10 dark:bg-foreground/10"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Guard: not logged in → /login, already onboarded → /
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Check if user already has a client profile
    axiosInstance.get("/clients/me").then(() => {
      // profile exists — redirect home
      router.push("/");
    }).catch(() => {
      // 404 means no profile yet — stay on this page
    });
  }, [user, router]);

  const [form, setForm] = useState<FormData>({
    goals: "", height: "", currentWeight: "", targetWeight: "", age: "",
    trainingDaysPerWeek: "", experienceLevel: "", injuriesOrRestrictions: "",
    foodPreferences: "", images: [],
  });

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, STEPS.length)); };
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleImageAdd = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4 - form.images.length);
    set("images", [...form.images, ...arr]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("goals", form.goals);
      payload.append("height", form.height);
      payload.append("currentWeight", form.currentWeight);
      payload.append("targetWeight", form.targetWeight);
      payload.append("trainingDaysPerWeek", form.trainingDaysPerWeek);
      payload.append("age", form.age);
      payload.append("experienceLevel", form.experienceLevel);
      if (form.injuriesOrRestrictions) payload.append("injuriesOrRestrictions", form.injuriesOrRestrictions);
      if (form.foodPreferences) payload.append("foodPreferences", form.foodPreferences);

      form.images.forEach((file) => {
        payload.append("images", file);
      });

      await axiosInstance.post("/clients", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  // ── Submitted ──────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center mx-auto mb-6 glow-primary">
            <Check size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-3 text-black dark:text-foreground">
            You&apos;re In!
          </h1>
          <p className="text-black/60 dark:text-muted-foreground text-sm leading-relaxed mb-8">
            Your profile has been submitted. Your coach will review it and reach out within 24 hours.
          </p>
          <TransitionLink
            href="/"
            className="inline-block bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm px-8 py-3.5 rounded-xl glow-primary-sm hover:opacity-85 transition-opacity"
          >
            Back to Home
          </TransitionLink>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 dark:border-foreground/[0.06]">
        <TransitionLink href="/" className="text-lg font-extrabold uppercase tracking-widest text-gradient">
          FitCoach
        </TransitionLink>
        <span className="text-xs font-semibold uppercase tracking-widest text-black/45 dark:text-muted-foreground">
          Step {step} of {STEPS.length}
        </span>
      </div>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-chart-2 opacity-10 dark:opacity-15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary opacity-10 dark:opacity-15 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <StepProgress current={step} />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ── Step 1: Goals ──────────────────────────────────────── */}
              {step === 1 && (
                <StepShell title="What's your primary goal?" subtitle="We'll build your program around this.">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {GOALS.map(({ value, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => set("goals", value)}
                        className={cn(
                          "flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-200",
                          form.goals === value
                            ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(200,254,27,0.2)]"
                            : "border-black/10 bg-black/4 hover:border-black/20 hover:bg-black/6",
                          "dark:border-foreground/10 dark:bg-foreground/5 dark:hover:border-foreground/20 dark:hover:bg-foreground/8",
                          form.goals === value && "dark:border-primary dark:bg-primary/10"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center",
                          form.goals === value ? "bg-primary/20" : "bg-black/8 dark:bg-foreground/8"
                        )}>
                          <Icon size={18} className={form.goals === value ? "text-primary" : "text-black/50 dark:text-foreground/60"} />
                        </div>
                        <div>
                          <p className={cn("text-sm font-bold", form.goals === value ? "text-primary" : "text-black dark:text-foreground")}>{value}</p>
                          <p className="text-xs text-black/50 dark:text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </StepShell>
              )}

              {/* ── Step 2: Body ───────────────────────────────────────── */}
              {step === 2 && (
                <StepShell title="Tell us about your body" subtitle="We use this to calibrate your plan precisely.">
                  <div className="grid grid-cols-2 gap-4">
                    <Field id="height" label="Height" unit="cm" type="number" min="100" max="250"
                      value={form.height} onChange={v => set("height", v)} placeholder="e.g. 178" />
                    <Field id="age" label="Age" unit="years" type="number" min="14" max="80"
                      value={form.age} onChange={v => set("age", v)} placeholder="e.g. 25" />
                    <Field id="currentWeight" label="Current Weight" unit="kg" type="number"
                      value={form.currentWeight} onChange={v => set("currentWeight", v)} placeholder="e.g. 85" />
                    <Field id="targetWeight" label="Target Weight" unit="kg" type="number"
                      value={form.targetWeight} onChange={v => set("targetWeight", v)} placeholder="e.g. 75" />
                  </div>
                </StepShell>
              )}

              {/* ── Step 3: Training ───────────────────────────────────── */}
              {step === 3 && (
                <StepShell title="Your training schedule" subtitle="How often can you commit to training?">
                  <div className="space-y-8">
                    {/* Days */}
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-black/60 dark:text-foreground/70 mb-3">
                        Days per week
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {TRAINING_DAYS.map(d => (
                          <button
                            key={d}
                            onClick={() => set("trainingDaysPerWeek", d)}
                            className={cn(
                              "w-14 h-14 rounded-2xl border text-lg font-extrabold transition-all duration-200",
                              form.trainingDaysPerWeek === d
                                ? "border-primary bg-primary/10 text-primary shadow-[0_0_16px_rgba(200,254,27,0.2)]"
                                : "border-black/12 bg-black/5 text-black hover:border-black/25",
                              "dark:border-foreground/10 dark:bg-foreground/5 dark:text-foreground dark:hover:border-foreground/25",
                              form.trainingDaysPerWeek === d && "dark:border-primary dark:bg-primary/10 dark:text-primary"
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-black/60 dark:text-foreground/70 mb-3">
                        Experience level
                      </p>
                      <div className="flex flex-col gap-3">
                        {EXPERIENCE.map(({ value, label, desc, color }) => (
                          <button
                            key={value}
                            onClick={() => set("experienceLevel", value)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200",
                              form.experienceLevel === value
                                ? "border-primary bg-primary/8"
                                : "border-black/10 bg-black/4 hover:border-black/20",
                              "dark:border-foreground/10 dark:bg-foreground/5 dark:hover:border-foreground/20",
                              form.experienceLevel === value && "dark:border-primary dark:bg-primary/8"
                            )}
                          >
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ background: color, boxShadow: form.experienceLevel === value ? `0 0 10px ${color}` : "none" }}
                            />
                            <div>
                              <p className={cn("font-bold text-sm", form.experienceLevel === value ? "text-primary" : "text-black dark:text-foreground")}>
                                {label}
                              </p>
                              <p className="text-xs text-black/50 dark:text-muted-foreground">{desc}</p>
                            </div>
                            {form.experienceLevel === value && (
                              <Check size={16} className="text-primary ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </StepShell>
              )}

              {/* ── Step 4: Health ─────────────────────────────────────── */}
              {step === 4 && (
                <StepShell title="Health & diet preferences" subtitle="Help us keep your plan safe and enjoyable.">
                  <div className="space-y-6">
                    {/* Injuries */}
                    <div>
                      <label htmlFor="injuries"
                        className="text-sm font-semibold uppercase tracking-wider text-black/60 dark:text-foreground/70 mb-2 flex items-center gap-2">
                        <AlertCircle size={14} className="text-destructive/70" />
                        Injuries or physical restrictions
                      </label>
                      <textarea
                        id="injuries"
                        rows={3}
                        value={form.injuriesOrRestrictions}
                        onChange={e => set("injuriesOrRestrictions", e.target.value)}
                        placeholder="e.g. Lower back pain, knee injury... or leave blank if none"
                        className={cn(
                          "w-full mt-2 rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-all duration-200",
                          "border-black/15 bg-black/4 text-black placeholder:text-black/35",
                          "hover:border-black/25 focus:border-primary focus:ring-2 focus:ring-primary/20",
                          "dark:border-foreground/10 dark:bg-foreground/5 dark:text-foreground dark:placeholder:text-muted-foreground",
                          "dark:hover:border-foreground/20"
                        )}
                      />
                    </div>

                    {/* Food */}
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-black/60 dark:text-foreground/70 mb-3 flex items-center gap-2">
                        <Apple size={14} className="text-chart-2" />
                        Food preferences
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {FOOD_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            onClick={() => set("foodPreferences", form.foodPreferences === opt ? "" : opt)}
                            className={cn(
                              "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200",
                              form.foodPreferences === opt
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-black/12 bg-black/5 text-black/70 hover:border-black/25 hover:text-black",
                              "dark:border-foreground/10 dark:bg-foreground/5 dark:text-foreground/70 dark:hover:border-foreground/25",
                              form.foodPreferences === opt && "dark:border-primary dark:bg-primary/10 dark:text-primary"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </StepShell>
              )}

              {/* ── Step 5: Photos ─────────────────────────────────────── */}
              {step === 5 && (
                <StepShell title="Progress photos" subtitle="Optional but recommended — helps your coach personalize your program.">
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleImageAdd(e.dataTransfer.files); }}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
                        form.images.length > 0
                          ? "border-primary/40 bg-primary/5"
                          : "border-black/15 bg-black/3 hover:border-primary/35 hover:bg-primary/4",
                        "dark:border-foreground/10 dark:bg-foreground/3 dark:hover:border-primary/30 dark:hover:bg-primary/5",
                        form.images.length > 0 && "dark:border-primary/30 dark:bg-primary/5"
                      )}
                    >
                      <Upload size={32} className="mx-auto text-black/30 dark:text-muted-foreground mb-3" />
                      <p className="text-sm font-semibold text-black dark:text-foreground">
                        Click to upload or drag &amp; drop
                      </p>
                      <p className="text-xs text-black/45 dark:text-muted-foreground mt-1">
                        PNG, JPG up to 5MB each · Max 4 photos
                      </p>
                    </div>
                    <input
                      ref={fileInputRef} type="file" accept="image/*" multiple hidden
                      onChange={e => handleImageAdd(e.target.files)}
                    />

                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {form.images.map((file, i) => (
                          <div key={i} className="relative group aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`preview ${i + 1}`}
                              className="w-full h-full object-cover rounded-xl border border-black/10 dark:border-foreground/10"
                            />
                            <button
                              onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-center text-xs text-black/40 dark:text-muted-foreground">
                      You can skip this step — photos can be added later
                    </p>
                  </div>
                </StepShell>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Error message ──────────────────────────────────────────────── */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
              ⚠ {error}
            </div>
          )}

          {/* ── Navigation ─────────────────────────────────────────────────── */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={goPrev}
              disabled={step === 1}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all duration-200",
                step === 1
                  ? "border-black/6 text-black/25 cursor-not-allowed dark:border-foreground/5 dark:text-muted-foreground/40"
                  : "border-black/15 hover:border-black/30 text-black dark:border-foreground/10 dark:hover:border-foreground/25 dark:text-foreground"
              )}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length ? (
              <button
                onClick={goNext}
                disabled={!isStepValid(step, form)}
                className={cn(
                  "flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200",
                  isStepValid(step, form)
                    ? "bg-primary text-primary-foreground hover:opacity-85 shadow-[0_4px_20px_rgba(200,254,27,0.4)]"
                    : "bg-black/8 text-black/30 cursor-not-allowed dark:bg-foreground/8 dark:text-muted-foreground"
                )}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !isStepValid(step, form)}
                className={cn(
                  "flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200",
                  !loading && isStepValid(step, form)
                    ? "bg-primary text-primary-foreground hover:opacity-85 shadow-[0_4px_20px_rgba(200,254,27,0.4)]"
                    : "bg-black/8 text-black/30 cursor-not-allowed dark:bg-foreground/8 dark:text-muted-foreground"
                )}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <><Check size={16} /> Submit Profile</>
                )}
              </button>
            )}
          </div>

          {/* Skip photos */}
          {step === 5 && (
            <p className="text-center mt-4">
              <button onClick={handleSubmit} disabled={loading} className="text-xs text-black/40 hover:text-black dark:text-muted-foreground dark:hover:text-foreground transition-colors underline underline-offset-2 disabled:opacity-50">
                {loading ? "Submitting..." : "Skip for now"}
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

// ─── Step Shell ───────────────────────────────────────────────────────────────
function StepShell({ title, subtitle, children }: {
  title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-black dark:text-foreground">
          {title}
        </h1>
        <p className="text-black/55 dark:text-muted-foreground text-sm mt-2">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function isStepValid(step: number, form: FormData): boolean {
  switch (step) {
    case 1: return !!form.goals;
    case 2: return !!(form.height && form.currentWeight && form.targetWeight && form.age);
    case 3: return !!(form.trainingDaysPerWeek && form.experienceLevel);
    case 4: return true;
    case 5: return true;
    default: return true;
  }
}
