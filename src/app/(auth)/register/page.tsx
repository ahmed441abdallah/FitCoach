"use client";

import { useState, useCallback, useId, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { register, reset } from "@/lib/features/auth/authSlice";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye, EyeOff, Dumbbell, Zap, Trophy, Target,
  ArrowRight, CheckCircle2, User, Mail, Phone, Lock, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FieldError {
  [key: string]: string;
}

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?\d{10,15})$/;
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validateRegister(data: RegisterForm, t: any): FieldError {
  const errors: FieldError = {};
  if (!data.fullName.trim()) {
    errors.fullName = t("errNameReq");
  } else if (data.fullName.trim().split(" ").filter(Boolean).length < 2) {
    errors.fullName = t("errNameInvalid");
  }
  if (!data.email.trim()) {
    errors.email = t("errEmailReq");
  } else if (!emailRegex.test(data.email)) {
    errors.email = t("errEmailInvalid");
  }
  if (!data.phone.trim()) {
    errors.phone = t("errPhoneReq");
  } else if (!phoneRegex.test(data.phone.replace(/\s/g, ""))) {
    errors.phone = t("errPhoneInvalid");
  }
  if (!data.password) {
    errors.password = t("errPassReq");
  } else if (!strongPassword.test(data.password)) {
    errors.password = t("errPassInvalid");
  }
  if (!data.confirmPassword) {
    errors.confirmPassword = t("errPassConfirmReq");
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = t("errPassMismatch");
  }
  if (!data.acceptTerms) {
    errors.acceptTerms = t("errTermsReq");
  }
  return errors;
}

// ─── Password Strength ────────────────────────────────────────────────────────
function getPasswordStrength(pw: string, t: any): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, label: t("strengthWeak"), color: "bg-red-500" };
  if (score === 3) return { score, label: t("strengthFair"), color: "bg-amber-400" };
  if (score === 4) return { score, label: t("strengthGood"), color: "bg-emerald-400" };
  return { score, label: t("strengthStrong"), color: "bg-primary" };
}

// ─── Floating Label Input ─────────────────────────────────────────────────────
function FloatingInput({
  id,
  label,
  error,
  icon: Icon,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value && String(props.value).length > 0;
  const floated = focused || hasValue;

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className={cn(
            "absolute start-4 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none",
            focused ? "text-primary" : "text-foreground/35"
          )}>
            <Icon size={15} />
          </div>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "peer w-full rounded-2xl border-2 bg-transparent py-3.5 text-sm text-foreground",
            "transition-all duration-300 outline-none",
            "placeholder:text-transparent",
            Icon ? "ps-10 pe-4 pt-6 pb-2.5" : "px-4 pt-6 pb-2.5",
            focused
              ? "border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
              : error
                ? "border-destructive/60"
                : "border-foreground/12 dark:border-foreground/10 hover:border-foreground/25",
            className
          )}
          placeholder={label}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm font-medium transition-all duration-300 origin-top-left rtl:origin-top-right",
            Icon ? "start-10" : "start-4",
            floated
              ? "top-3.5 translate-y-0 scale-[0.78] text-xs"
              : "scale-100",
            focused
              ? "text-primary"
              : error
                ? "text-destructive"
                : "text-foreground/50"
          )}
        >
          {label}
        </label>
        <motion.div
          className="absolute bottom-0 inset-x-4 h-0.5 rounded-full bg-primary origin-center"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="err"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 ms-1 text-xs text-destructive flex items-center gap-1"
          >
            <span className="inline-block w-3.5 h-3.5 rounded-full border border-destructive/50 text-center leading-[14px] shrink-0 text-[10px]">!</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Floating Password Input ──────────────────────────────────────────────────
function FloatingPasswordInput({
  id,
  label,
  error,
  value,
  onChange,
  showStrength,
  t,
}: {
  id: string;
  label: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showStrength?: boolean;
  t?: any;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floated = focused || hasValue;
  const strength = useMemo(() => getPasswordStrength(value, t), [value, t]);

  return (
    <div>
      <div className="relative">
        <div className={cn(
          "absolute start-4 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none",
          focused ? "text-primary" : "text-foreground/35"
        )}>
          <Lock size={15} />
        </div>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "peer w-full rounded-2xl border-2 bg-transparent ps-10 pe-12 pt-6 pb-2.5 text-sm text-foreground",
            "transition-all duration-300 outline-none placeholder:text-transparent",
            focused
              ? "border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
              : error
                ? "border-destructive/60"
                : "border-foreground/12 dark:border-foreground/10 hover:border-foreground/25"
          )}
          placeholder={label}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm font-medium transition-all duration-300 origin-top-left rtl:origin-top-right start-10",
            floated ? "top-3.5 translate-y-0 scale-[0.78] text-xs" : "scale-100",
            focused ? "text-primary" : error ? "text-destructive" : "text-foreground/50"
          )}
        >
          {label}
        </label>
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          className="absolute end-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <motion.div
          className="absolute bottom-0 inset-x-4 h-0.5 rounded-full bg-primary origin-center"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>

      {/* Strength meter */}
      {showStrength && value.length > 0 && (
        <motion.div
          className="mt-2 px-1"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i < strength.score ? strength.color : "bg-foreground/10"
                )}
              />
            ))}
          </div>
          <p className={cn(
            "text-[10px] font-semibold uppercase tracking-widest",
            strength.score <= 2 ? "text-red-500" :
              strength.score === 3 ? "text-amber-400" :
                strength.score === 4 ? "text-emerald-400" :
                  "text-primary"
          )}>
            {strength.label} {t("strengthPassword")}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="err"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 ms-1 text-xs text-destructive flex items-center gap-1"
          >
            <span className="inline-block w-3.5 h-3.5 rounded-full border border-destructive/50 text-center leading-[14px] shrink-0 text-[10px]">!</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Motivational Panel ───────────────────────────────────────────────────────
const getFitnessFeatures = (t: any) => [
  { icon: Dumbbell, text: t("feature1") },
  { icon: Zap, text: t("feature2") },
  { icon: Trophy, text: t("feature3") },
  { icon: Target, text: t("feature4") },
];

const getStats = (t: any) => [
  { value: t("clientsCount"), label: t("clientsLbl") },
  { value: t("yearsCount"), label: t("yearsLbl") },
  { value: t("satCount"), label: t("satLbl") },
  { value: t("supportCount"), label: t("supportLbl") },
];

function MotivationalPanel({ t }: { t: any }) {
  const fitnessFeatures = getFitnessFeatures(t);
  const stats = getStats(t);
  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[oklch(0.09_0.015_250)]">
      {/* Animated grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200,254,27,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,254,27,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow orbs */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200,254,27,0.16) 0%, transparent 70%)",
          top: "-8%",
          right: "-12%",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
          bottom: "15%",
          left: "-8%",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Content */}
      <div className="relative z-10 p-12 flex flex-col justify-between h-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <TransitionLink href="/" className="inline-flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Dumbbell size={18} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold uppercase tracking-widest text-white">FitCoach</span>
          </TransitionLink>
        </motion.div>

        {/* Copy */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.35em] mb-4 flex items-center gap-2">
              <span className="inline-block w-8 h-px bg-primary" />
              {t("startToday")}
            </p>
            <h2 className="text-5xl xl:text-6xl font-extrabold leading-[1.05] uppercase text-white">
              {t("transformBody1")}
              <br />
              <span className="inline-block text-primary">
                {t("transformBody2")}
              </span>
            </h2>
            <p className="mt-4 text-white/50 text-sm leading-relaxed max-w-xs">
              {t("transformDesc")}
            </p>
          </div>

          <ul className="space-y-3.5">
            {fitnessFeatures.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                className="flex items-center gap-3.5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Icon size={15} className="text-primary" />
                </div>
                <span className="text-white/65 text-sm font-medium">{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center border border-white/8"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <p className="text-xl font-extrabold uppercase text-primary">
                {s.value}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full bg-primary"
          animate={{ width: i === current ? 24 : 6, opacity: i <= current ? 1 : 0.25 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(0); // 0 = personal info, 1 = password & terms
  const uid = useId();

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user, isLoading, isError, isSuccess, message } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      setErrors({ submit: message });
    }

    if (isSuccess || user) {
      setSuccess(true);
      const timer = setTimeout(() => {
        const redirect = searchParams.get('redirect');
        let sessionRedirect = null;
        try {
          const pending = sessionStorage.getItem("pendingCheckoutPlan");
          if (pending) {
            const { packageId, optionId } = JSON.parse(pending);
            sessionRedirect = `/checkout?packageId=${packageId}&optionId=${optionId}`;
          }
        } catch (e) { }

        if (redirect) {
          router.push(redirect);
        } else if (sessionRedirect) {
          router.push(sessionRedirect);
        } else if (user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/get-started');
        }
      }, 1400);
      return () => clearTimeout(timer);
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, router, dispatch, searchParams]);

  const set = useCallback(
    (key: keyof RegisterForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({
          ...prev,
          [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
        })),
    []
  );

  const goNext = () => {
    const errs: FieldError = {};
    if (!form.fullName.trim()) errs.fullName = t("errNameReq");
    else if (form.fullName.trim().split(" ").filter(Boolean).length < 2) errs.fullName = t("errNameInvalid");
    if (!form.email.trim()) errs.email = t("errEmailReq");
    else if (!emailRegex.test(form.email)) errs.email = t("errEmailInvalid");
    if (!form.phone.trim()) errs.phone = t("errPhoneReq");
    else if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) errs.phone = t("errPhoneInvalid");

    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRegister(form, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const userData = {
      userName: form.fullName,
      email: form.email,
      password: form.password,
      phoneNumber: form.phone,
    };

    dispatch(register(userData));
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
      <MotivationalPanel t={t} />

      {/* ── Form side ──────────────────────────────── */}
      <div className="relative flex flex-col min-h-screen bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 lg:px-10">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <TransitionLink href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Dumbbell size={15} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold uppercase tracking-widest text-primary">FitCoach</span>
            </TransitionLink>
          </div>
          <div className="hidden lg:block" />


        </div>

        {/* Form area */}
        <div className="flex flex-1 flex-col justify-center items-center px-6 py-8 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[440px]"
          >
            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                >
                  <ShieldCheck size={12} className="text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{t("freeAccount")}</span>
                </motion.div>
                <StepDots current={step} total={2} />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground uppercase tracking-tight leading-tight">
                {step === 0 ? (
                  <>{t("createAccount1")}<br /><span className="text-gradient">{t("createAccount2")}</span></>
                ) : (
                  <>{t("secureAccess1")}<br /><span className="text-gradient">{t("secureAccess2")}</span></>
                )}
              </h1>
              <p className="text-muted-foreground text-sm mt-2.5 leading-relaxed">
                {step === 0 ? t("step1") : t("step2")}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-primary/10 border border-primary/30 px-6 py-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-primary" />
                  </div>
                  <h3 className="font-extrabold text-foreground text-xl uppercase tracking-wide">{t("youAreIn")}</h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed whitespace-pre-line">
                    {t("welcomeSuccess")}
                  </p>
                  <div className="mt-5 flex justify-center gap-3 text-xs text-muted-foreground">
                    <span>🏋️ {t("programReady")}</span>
                    <span>•</span>
                    <span>📊 {t("dashboardSet")}</span>
                    <span>•</span>
                    <span>🎯 {t("goalsTracked")}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={step === 0 ? (e) => { e.preventDefault(); goNext(); } : handleSubmit}
                  noValidate
                  className="space-y-4"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Global error */}
                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-start gap-2"
                        role="alert"
                      >
                        <span className="mt-0.5 shrink-0">⚠</span>
                        {errors.submit}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {step === 0 ? (
                      <motion.div
                        key="step0"
                        className="space-y-4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <FloatingInput
                          id={`${uid}-fullName`}
                          label={t("username")}
                          type="text"
                          icon={User}
                          value={form.fullName}
                          onChange={set("fullName")}
                          error={errors.fullName}
                          autoComplete="name"
                        />
                        <FloatingInput
                          id={`${uid}-email`}
                          label={t("email")}
                          type="email"
                          icon={Mail}
                          value={form.email}
                          onChange={set("email")}
                          error={errors.email}
                          autoComplete="email"
                        />
                        <FloatingInput
                          id={`${uid}-phone`}
                          label={t("phone")}
                          type="tel"
                          icon={Phone}
                          value={form.phone}
                          onChange={set("phone")}
                          error={errors.phone}
                          autoComplete="tel"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step1"
                        className="space-y-4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <FloatingPasswordInput
                          id={`${uid}-password`}
                          label={t("password")}
                          value={form.password}
                          onChange={set("password")}
                          error={errors.password}
                          showStrength
                          t={t}
                        />
                        <FloatingPasswordInput
                          id={`${uid}-confirmPassword`}
                          label={t("confirmPassword")}
                          value={form.confirmPassword}
                          onChange={set("confirmPassword")}
                          error={errors.confirmPassword}
                          t={t}
                        />

                        {/* Terms checkbox */}
                        <div>
                          <label className="flex items-start gap-3 cursor-pointer group select-none">
                            <div className="relative mt-0.5 flex-shrink-0">
                              <input
                                id={`${uid}-acceptTerms`}
                                type="checkbox"
                                checked={form.acceptTerms}
                                onChange={set("acceptTerms")}
                                aria-invalid={!!errors.acceptTerms}
                                aria-describedby={errors.acceptTerms ? "terms-error" : undefined}
                                className="sr-only"
                              />
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                                  form.acceptTerms
                                    ? "bg-primary border-primary"
                                    : errors.acceptTerms
                                      ? "border-destructive"
                                      : "border-foreground/20 bg-transparent group-hover:border-primary/50"
                                )}
                              >
                                {form.acceptTerms && (
                                  <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className={cn(
                              "text-xs leading-relaxed transition-colors",
                              errors.acceptTerms ? "text-destructive" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {t("iAgreeTo")}{" "}
                              <TransitionLink href="/terms" className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium">
                                {t("terms")}
                              </TransitionLink>{" "}
                              {t("and")}{" "}
                              <TransitionLink href="/privacy" className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium">
                                {t("privacy")}
                              </TransitionLink>
                            </span>
                          </label>
                          {errors.acceptTerms && (
                            <motion.p
                              id="terms-error"
                              role="alert"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-destructive mt-1.5 ml-7 flex items-center gap-1"
                            >
                              <span className="inline-block w-3.5 h-3.5 rounded-full border border-destructive/50 text-center leading-[14px] shrink-0 text-[10px]">!</span>
                              {errors.acceptTerms}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={cn("flex gap-3", step === 0 ? "" : "")}>
                    {step === 1 && (
                      <motion.button
                        type="button"
                        onClick={() => { setStep(0); setErrors({}); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="rounded-2xl px-5 py-3.5 text-sm font-bold uppercase tracking-widest border-2 border-foreground/12 text-foreground/70 hover:border-primary/40 hover:text-foreground transition-all duration-200"
                      >
                        {t("back")}
                      </motion.button>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={isLoading ? {} : { scale: 1.02, y: -1 }}
                      whileTap={isLoading ? {} : { scale: 0.98 }}
                      className={cn(
                        "relative flex-1 rounded-2xl py-3.5 text-sm font-bold uppercase tracking-widest overflow-hidden",
                        "text-primary-foreground bg-primary",
                        "transition-all duration-300",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        "shadow-[0_4px_24px_hsl(var(--primary)/0.35)]",
                        "hover:shadow-[0_6px_32px_hsl(var(--primary)/0.5)]"
                      )}
                    >
                      {/* Shimmer */}
                      {!isLoading && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "200%" }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                      )}
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t("creatingAccount")}
                          </>
                        ) : step === 0 ? (
                          <>
                            {t("continueBtn")}
                            <ArrowRight size={15} />
                          </>
                        ) : (
                          <>
                            {t("register")}
                            <ArrowRight size={15} />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-foreground/8" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] font-medium">or</span>
              <div className="flex-1 h-px bg-foreground/8" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <TransitionLink href="/login" className="text-primary hover:text-primary/80 transition-colors font-bold uppercase tracking-wider text-xs">
                {t("signIn")}
              </TransitionLink>
            </p>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="px-6 pb-6 lg:px-10 text-center">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            © {new Date().getFullYear()} FitCoach · All rights reserved
          </p>
        </div>
      </div>
    </main>
  );
}
