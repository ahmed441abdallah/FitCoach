"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, reset } from "@/lib/features/auth/authSlice";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, LogOut, Package as PackageIcon, Calendar,
  CreditCard, ShieldCheck, Clock, CheckCircle2, XCircle,
  Target, Activity, Dumbbell, Apple, Image as ImageIcon,
  ChevronRight, TrendingUp, Zap, ArrowUpRight, Flame, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { TransitionLink } from "@/components/layout/TransitionLink";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import Beams from "@/components/Beams";

const DownloadPlanBtn = dynamic(
  () => import("@/components/pdf/DownloadPlanBtn"),
  { ssr: false }
);

const DownloadDietBtn = dynamic(
  () => import("@/components/pdf/DownloadDietBtn"),
  { ssr: false }
);

interface Subscription {
  _id: string;
  package: { _id: string; name: string };
  status: string;
  paymentStatus: string;
  totalPrice: number;
  durationInMonths: number;
  endDate: string;
  startDate: string;
  createdAt: string;
}

interface ClientProfile {
  _id: string;
  goals: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  trainingDaysPerWeek: string;
  age: number;
  experienceLevel: string;
  injuriesOrRestrictions: string;
  foodPreferences: string;
  images: string[];
}

interface WorkoutPlan {
  _id: string;
  planName: string;
  description: string;
  notes: string;
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
}

interface DietPlan {
  _id: string;
  description: string;
  totalCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  meals: {
    _id?: string;
    mealName: string;
    mealDescription: string;
    mealItems: {
      _id?: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }[];
  }[];
}

type Tab = "overview" | "workout" | "diet" | "programs" | "photos";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const t = useTranslations("profile");
  const tw = useTranslations("workout");
  const td = useTranslations("diet");

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    const fetchData = async () => {
      try {
        const [subRes, clientRes, workoutRes, dietRes] = await Promise.allSettled([
          axiosInstance.get("/subscriptions/me", { withCredentials: true }),
          axiosInstance.get("/clients/me", { withCredentials: true }),
          axiosInstance.get("/workout-plans/me", { withCredentials: true }),
          axiosInstance.get("/diet-plans/my-diet-plan", { withCredentials: true }),
        ]);
        if (subRes.status === "fulfilled" && subRes.value.data.success)
          setSubscriptions(subRes.value.data.data);
        if (clientRes.status === "fulfilled" && clientRes.value.data.success)
          setClientProfile(clientRes.value.data.data);
        if (workoutRes.status === "fulfilled" && workoutRes.value.data.success)
          setWorkoutPlan(workoutRes.value.data.data);
        if (dietRes.status === "fulfilled" && dietRes.value.data.success)
          setDietPlan(dietRes.value.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user, router]);

  const handleLogout = () => { dispatch(logout()); dispatch(reset()); router.push("/"); };

  if (!mounted || !user) return null;

  const activeSub = subscriptions.find((s) => s.status === "active");
  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "overview", label: t("overview"), icon: User },
    { id: "workout", label: t("workout"), icon: Dumbbell },
    { id: "diet", label: t("diet"), icon: Apple },
    { id: "programs", label: t("programs"), icon: PackageIcon },
    { id: "photos", label: t("photos"), icon: ImageIcon },
  ];

  const experienceColor = {
    Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Advanced: "text-red-400 bg-red-400/10 border-red-400/20",
  }[clientProfile?.experienceLevel ?? ""] ?? "text-primary bg-primary/10 border-primary/20";

  return (
    <main className="min-h-screen text-foreground" style={{ background: "#0a0a0a" }}>
      <Navbar />

      {/* ── Page Header — matches Exercises / Calories style ─── */}
      <section className="relative overflow-hidden py-24 px-6 border-b border-foreground/[0.06]">
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

        <div className="relative z-10 max-w-6xl mx-auto">
          <TransitionLink
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-primary transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </TransitionLink>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            {/* Left — icon + text */}
            <div className="flex items-start gap-5">
              {/* Avatar / Icon Badge */}
              <div className="relative flex-shrink-0 mt-1">
                <div className="w-16 h-16 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center text-primary">
                  <User size={24} className="text-primary" />
                </div>
                {/* Online dot */}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 shadow-[0_0_8px_rgba(200,255,0,0.8)]" style={{ borderColor: "#090909" }} />
              </div>

              {/* Text Content */}
              <div>
                <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <span className="inline-block w-5 h-px bg-primary" />
                  {t("title")}
                </p>
                <h1 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-foreground leading-none drop-shadow-xl mb-3">
                  {user.userName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/50">
                  <span className="flex items-center gap-1.5"><Mail size={13} /> {user.email}</span>
                  {clientProfile && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-foreground/20" />
                      <span className="flex items-center gap-1.5">
                        <Target size={13} className="text-primary/70" />
                        {clientProfile.goals}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-foreground/20" />
                      <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider", experienceColor)}>
                        <Flame size={10} /> {clientProfile.experienceLevel}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right — action + member badge */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {activeSub && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest">
                  <Zap size={11} fill="currentColor" /> {t("proMember")}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-foreground/10 text-foreground/50 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all duration-200 font-bold uppercase tracking-wider text-sm"
              >
                <LogOut size={15} /> {t("signOut")}
              </button>
            </div>
          </motion.div>

          {/* Stat Strip */}
          {clientProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8"
            >
              {[
                { label: t("height"), value: clientProfile.height, icon: Activity },
                { label: t("current"), value: clientProfile.currentWeight, icon: TrendingUp },
                { label: t("target"), value: clientProfile.targetWeight, icon: Target, highlight: true },
                { label: t("training"), value: `${clientProfile.trainingDaysPerWeek}× / ${t("wk")}`, icon: Dumbbell },
              ].map(({ label, value, icon: Icon, highlight }) => (
                <div
                  key={label}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4",
                    highlight
                      ? "bg-primary/10 border-primary/30"
                      : "bg-foreground/[0.03] border-foreground/[0.07]"
                  )}
                >
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest mb-1 block", highlight ? "text-primary/80" : "text-foreground/40")}>{label}</span>
                  <span className={cn("text-xl font-extrabold", highlight ? "text-primary" : "text-foreground")}>{value}</span>
                  <Icon size={28} className={cn("absolute right-3 bottom-3 opacity-10", highlight ? "text-primary" : "text-foreground")} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex gap-1 mt-8 border-b border-foreground/[0.07]"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors duration-200",
                  activeTab === id ? "text-primary" : "text-foreground/40 hover:text-foreground/70"
                )}
              >
                <Icon size={14} />
                {label}
                {activeTab === id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(200,255,0,0.7)]"
                  />
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tab Content ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Body Profile */}
              {clientProfile ? (
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <span className="w-4 h-px bg-primary" /> {t("bodyProfile")}
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: t("age"), value: `${clientProfile.age} ${t("yrs")}` },
                      { label: t("height"), value: clientProfile.height },
                      { label: t("currentWeight"), value: clientProfile.currentWeight },
                      { label: t("targetWeight"), value: clientProfile.targetWeight, highlight: true },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className={cn("rounded-2xl p-4 border", highlight ? "bg-primary/8 border-primary/20" : "bg-white/[0.03] border-white/[0.06]")}>
                        <span className={cn("text-[10px] uppercase tracking-widest font-semibold block mb-1", highlight ? "text-primary/70" : "text-white/40")}>{label}</span>
                        <span className={cn("text-xl font-extrabold", highlight ? "text-primary" : "text-white")}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { icon: Target, label: t("primaryGoal"), value: clientProfile.goals },
                      { icon: Activity, label: t("experienceLevel"), value: clientProfile.experienceLevel },
                      { icon: Dumbbell, label: t("trainingDays"), value: `${clientProfile.trainingDaysPerWeek}` },
                      ...(clientProfile.foodPreferences ? [{ icon: Apple, label: t("foodPreferences"), value: clientProfile.foodPreferences }] : []),
                      ...(clientProfile.injuriesOrRestrictions ? [{ icon: ShieldCheck, label: t("injuriesOrRestrictions"), value: clientProfile.injuriesOrRestrictions }] : []),
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon size={14} className="text-primary" />
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold">{label}</span>
                          <span className="text-sm font-bold text-white capitalize">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <User size={24} className="text-white/30" />
                  </div>
                  <p className="text-white/50 font-semibold mb-4">{t("noBodyProfile")}</p>
                  <TransitionLink
                    href="/get-started"
                    className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                  >
                    {t("completeProfile")}
                  </TransitionLink>
                </div>
              )}

              {/* Active Subscription Card */}
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <span className="w-4 h-px bg-primary" /> {t("activeProgram")}
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : activeSub ? (
                  <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-2xl font-extrabold uppercase text-white mb-1">{activeSub.package?.name}</p>
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                          <CheckCircle2 size={10} /> {t("active")}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Zap size={18} className="text-primary" fill="currentColor" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: t("duration"), value: t("durationMonths", { duration: activeSub.durationInMonths }), icon: Calendar },
                        { label: t("totalPaid"), value: t("paidAmount", { price: activeSub.totalPrice }), icon: CreditCard },
                        { label: t("expires"), value: new Date(activeSub.endDate).toLocaleDateString(), icon: Clock },
                        { label: t("since"), value: new Date(activeSub.createdAt).toLocaleDateString(), icon: Calendar },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-black/20 backdrop-blur-sm rounded-xl p-3">
                          <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold flex items-center gap-1 mb-1">
                            <Icon size={10} /> {label}
                          </span>
                          <span className="text-sm font-bold text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <PackageIcon size={22} className="text-white/30" />
                    </div>
                    <p className="text-white/50 font-semibold mb-1 text-sm">{t("noActiveProgram")}</p>
                    <p className="text-white/30 text-xs mb-5">{t("subscribeToUnlock")}</p>
                    <TransitionLink
                      href="/#plans"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                    >
                      {t("viewPackages")} <ArrowUpRight size={13} />
                    </TransitionLink>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Workout Tab */}
          {activeTab === "workout" && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {workoutPlan ? (
                <>
                  {/* Plan Header */}
                  <div className="rounded-3xl border border-white/[0.07] p-6 relative overflow-hidden" style={{ background: "#111111" }}>
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(200,254,27,0.04)" }} />
                    <div className="relative">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-1 flex items-center gap-2">
                            <span className="w-4 h-px bg-primary" /> {t("workoutPlan")}
                          </p>
                          <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight">
                            {workoutPlan.planName}
                          </h2>
                          {workoutPlan.description && (
                            <p className="text-sm text-white/60 mt-2 leading-relaxed">{workoutPlan.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex flex-col items-center px-4 py-3 rounded-2xl border border-white/[0.07]" style={{ background: "rgba(200,254,27,0.06)" }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{t("days")}</span>
                            <span className="text-2xl font-extrabold text-primary">{workoutPlan.days.length}</span>
                          </div>
                          <div className="flex flex-col items-center px-4 py-3 rounded-2xl border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{t("exercises")}</span>
                            <span className="text-2xl font-extrabold text-white">
                              {workoutPlan.days.reduce((t, d) => t + d.exercises.length, 0)}
                            </span>
                          </div>
                          {/* ── PDF Download ──────────────────────────── */}
                          <DownloadPlanBtn
                            plan={{
                              planName: workoutPlan.planName,
                              description: workoutPlan.description,
                              notes: workoutPlan.notes,
                              days: workoutPlan.days,
                              clientName: user?.userName,
                              goal: clientProfile?.goals,
                            }}
                            label={t("downloadPdf")}
                          />
                        </div>
                      </div>

                      {workoutPlan.notes && (
                        <div className="mt-2 p-4 rounded-2xl border border-primary/20" style={{ background: "rgba(200,254,27,0.04)" }}>
                          <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1.5">📋 {t("coachNotes")}</p>
                          <p className="text-sm text-white/70 leading-relaxed">{workoutPlan.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Day Cards */}
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {workoutPlan.days.map((day, idx) => (
                      <motion.div
                        key={day._id || idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col"
                        style={{ background: "#111111" }}
                      >
                        {/* Day header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]" style={{ background: "rgba(200,254,27,0.04)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-black" style={{ background: "#c8fe1b" }}>
                              {idx + 1}
                            </div>
                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{day.dayName}</h3>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20 text-primary" style={{ background: "rgba(200,254,27,0.08)" }}>
                            {day.exercises.length} {t("ex")}
                          </span>
                        </div>

                        {/* Exercise list */}
                        <div className="p-4 space-y-2.5 flex-1">
                          {day.exercises.length === 0 ? (
                            <p className="text-center text-xs text-white/30 py-6">{t("restDay")}</p>
                          ) : (
                            day.exercises.map((ex, exIdx) => (
                              <div key={ex._id || exIdx} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] hover:border-primary/20 transition-all group" style={{ background: "rgba(255,255,255,0.02)" }}>
                                {/* Number */}
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold flex-shrink-0" style={{ background: "rgba(200,254,27,0.08)", color: "#c8fe1b" }}>
                                  {exIdx + 1}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white truncate">
                                    {(ex.exerciseId as any)?.name || (ex as any).name || (ex as any).exerciseName || t("unknownExercise")}
                                  </p>
                                  <p className="text-[10px] text-white/35 capitalize font-semibold">
                                    {(ex.exerciseId as any)?.bodyPart || (ex as any).bodyPart || (ex as any).target || t("general")}
                                  </p>
                                </div>
                                {/* Stats */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-extrabold text-primary">
                                    {ex.sets} <span className="text-white/30 font-normal">x</span> {ex.reps}
                                  </p>
                                  {ex.restTimeMinutes > 0 && (
                                    <p className="text-[9px] text-white/30 font-semibold mt-0.5">{ex.restTimeMinutes}m {t("rest")}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-white/[0.07] p-16 flex flex-col items-center justify-center text-center" style={{ background: "#111111" }}>
                  <div className="w-20 h-20 rounded-3xl border border-white/[0.06] flex items-center justify-center mb-5" style={{ background: "rgba(200,254,27,0.04)" }}>
                    <Dumbbell size={32} className="text-primary/40" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">{t("noWorkoutPlanYet")}</h3>
                  <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                    {t("noWorkoutPlanDesc")}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Diet Tab */}
          {activeTab === "diet" && (
            <motion.div
              key="diet"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {dietPlan ? (
                <>
                  {/* Nutrition Summary Header */}
                  <div className="rounded-3xl border border-white/[0.07] p-6 relative overflow-hidden" style={{ background: "#111111" }}>
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(52,211,153,0.04)" }} />
                    <div className="relative">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1 flex items-center gap-2" style={{ color: "#34d399" }}>
                            <span className="w-4 h-px" style={{ background: "#34d399" }} /> {t("nutritionPlan")}
                          </p>
                          {dietPlan.description && (
                            <p className="text-sm text-white/60 leading-relaxed">{dietPlan.description}</p>
                          )}
                        </div>
                        <DownloadDietBtn 
                          plan={{
                            ...dietPlan,
                            clientName: user?.userName,
                          }}
                        />
                      </div>

                      {/* Calorie + Macro strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: t("totalCalories"), value: dietPlan.totalCalories, unit: t("kcal"), color: "#c8fe1b", glow: "rgba(200,254,27,0.08)" },
                          { label: t("protein"), value: dietPlan.macros?.protein, unit: t("g"), color: "#34d399", glow: "rgba(52,211,153,0.08)" },
                          { label: t("carbs"), value: dietPlan.macros?.carbs, unit: t("g"), color: "#f97316", glow: "rgba(249,115,22,0.08)" },
                          { label: t("fats"), value: dietPlan.macros?.fats, unit: t("g"), color: "#f59e0b", glow: "rgba(245,158,11,0.08)" },
                        ].map(({ label, value, unit, color, glow }) => (
                          <div key={label} className="rounded-2xl border border-white/[0.07] p-4 text-center" style={{ background: glow }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                            <p className="text-2xl font-extrabold" style={{ color }}>
                              {value ?? "—"}
                              <span className="text-xs font-semibold ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>{unit}</span>
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Macro bar */}
                      {dietPlan.macros && (() => {
                        const p = (dietPlan.macros.protein * 4);
                        const c = (dietPlan.macros.carbs * 4);
                        const f = (dietPlan.macros.fats * 9);
                        const total = p + c + f || 1;
                        return (
                          <div className="mt-4">
                            <div className="flex overflow-hidden rounded-full h-2">
                              <div className="h-full transition-all" style={{ width: `${(p/total)*100}%`, background: "#34d399" }} />
                              <div className="h-full transition-all" style={{ width: `${(c/total)*100}%`, background: "#f97316" }} />
                              <div className="h-full transition-all" style={{ width: `${(f/total)*100}%`, background: "#f59e0b" }} />
                            </div>
                            <div className="flex gap-4 mt-2">
                              {[{label:t("protein"),pct:Math.round((p/total)*100),color:"#34d399"},{label:t("carbs"),pct:Math.round((c/total)*100),color:"#f97316"},{label:t("fats"),pct:Math.round((f/total)*100),color:"#f59e0b"}].map(m=>(
                                <span key={m.label} className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
                                  <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                                  {m.label} {m.pct}%
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Meal Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {dietPlan.meals.map((meal, idx) => (
                      <motion.div
                        key={meal._id || idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col"
                        style={{ background: "#111111" }}
                      >
                        {/* Meal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]" style={{ background: "rgba(52,211,153,0.04)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-black" style={{ background: "#34d399" }}>
                              {idx + 1}
                            </div>
                            <div>
                              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{meal.mealName}</h3>
                              {meal.mealDescription && (
                                <p className="text-[10px] text-white/40 font-semibold mt-0.5">{meal.mealDescription}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border text-emerald-400 border-emerald-500/20" style={{ background: "rgba(52,211,153,0.08)" }}>
                            {meal.mealItems.length} {t("items")}
                          </span>
                        </div>

                        {/* Meal items */}
                        <div className="p-4 space-y-2.5 flex-1">
                          {meal.mealItems.map((item, itemIdx) => (
                            <div key={item._id || itemIdx} className="rounded-xl border border-white/[0.05] p-3 hover:border-emerald-500/20 transition-all" style={{ background: "rgba(255,255,255,0.02)" }}>
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-sm font-bold text-white">{item.name}</p>
                                <span className="text-xs font-extrabold text-primary">{item.calories} {t("kcal")}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                {[
                                  { label: "P", value: item.protein, color: "#34d399" },
                                  { label: "C", value: item.carbs, color: "#f97316" },
                                  { label: "F", value: item.fats, color: "#f59e0b" },
                                ].map(({ label, value, color }) => (
                                  <span key={label} className="text-[10px] font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                    <span style={{ color }}>{label}</span>
                                    <span className="text-white/35">{value}{t("g")}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-white/[0.07] p-16 flex flex-col items-center justify-center text-center" style={{ background: "#111111" }}>
                  <div className="w-20 h-20 rounded-3xl border border-white/[0.06] flex items-center justify-center mb-5" style={{ background: "rgba(52,211,153,0.04)" }}>
                    <Apple size={32} className="text-emerald-400/40" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">{t("noDietPlanYet")}</h3>
                  <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                    {t("noDietPlanDesc")}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Programs Tab */}
          {activeTab === "programs" && (
            <motion.div
              key="programs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold uppercase tracking-widest text-white">{t("allPrograms")}</h2>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                  {subscriptions.length} {t("total")}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-16 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                    <PackageIcon size={26} className="text-white/30" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">{t("noProgramsYet")}</h3>
                  <p className="text-white/40 text-sm max-w-sm mb-7 leading-relaxed">
                    {t("noProgramsDesc")}
                  </p>
                  <TransitionLink
                    href="/#plans"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(200,254,27,0.25)]"
                  >
                    {t("browsePlans")} <ChevronRight size={15} />
                  </TransitionLink>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub, i) => (
                    <motion.div
                      key={sub._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
                    >
                      {/* Colored left strip */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        sub.status === "active" ? "bg-primary" :
                        sub.status === "pending" ? "bg-amber-400" : "bg-red-500"
                      )} />

                      <div className="pl-5 pr-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
                        {/* Icon */}
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          sub.status === "active" ? "bg-primary/10" :
                          sub.status === "pending" ? "bg-amber-400/10" : "bg-red-500/10"
                        )}>
                          <PackageIcon size={20} className={
                            sub.status === "active" ? "text-primary" :
                            sub.status === "pending" ? "text-amber-400" : "text-red-400"
                          } />
                        </div>

                        {/* Package info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg font-extrabold text-white">{sub.package?.name ?? t("package")}</h3>
                            {sub.status === "active" ? (
                              <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                <CheckCircle2 size={9} /> {t("active")}
                              </span>
                            ) : sub.status === "pending" ? (
                              <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                <Clock size={9} /> {t("pendingReview")}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                                <XCircle size={9} /> {t("rejected")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/40">{t("subscribedOn", { date: new Date(sub.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) })}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">{t("duration")}</span>
                            <span className="font-bold text-white">{t("durationMonths", { duration: sub.durationInMonths })}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">{t("totalPaid")}</span>
                            <span className="font-bold text-white">{t("paidAmount", { price: sub.totalPrice })}</span>
                          </div>
                          {sub.status === "active" && (
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">{t("expires")}</span>
                              <span className="font-bold text-primary">{new Date(sub.endDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Photos Tab */}
          {activeTab === "photos" && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-bold uppercase tracking-widest text-white mb-6">{t("progressPhotos")}</h2>

              {!clientProfile || !clientProfile.images || clientProfile.images.length === 0 ? (
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-16 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
                    <ImageIcon size={26} className="text-white/30" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">{t("noPhotosYet")}</h3>
                  <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                    {t("noPhotosDesc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {clientProfile.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-white/[0.08] cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Progress photo ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-white">{t("photoNumber", { number: idx + 1 })}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
