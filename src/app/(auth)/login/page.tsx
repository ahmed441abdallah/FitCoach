"use client";
import { useState, useCallback, useId, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { login, reset } from "@/lib/features/auth/authSlice";
import { Eye, EyeOff, Dumbbell, Zap, Trophy, Target, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { useTranslations } from "next-intl";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FieldError {
  [key: string]: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?\d{10,15})$/;

function validateLogin(data: { identifier: string; password: string }, t: any): FieldError {
  const errors: FieldError = {};
  if (!data.identifier.trim()) {
    errors.identifier = t("errIdentifierReq");
  } else if (
    !emailRegex.test(data.identifier) &&
    !phoneRegex.test(data.identifier.replace(/\s/g, ""))
  ) {
    errors.identifier = t("errIdentifierInvalid");
  }
  if (!data.password) {
    errors.password = t("errPassReq");
  } else if (data.password.length < 6) {
    errors.password = t("errPassShort");
  }
  return errors;
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
}: {
  id: string;
  label: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floated = focused || hasValue;

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

// ─── Animated Background Panel ────────────────────────────────────────────────
const getFitnessFeatures = (t: any) => [
  { icon: Dumbbell, text: t("feature1") },
  { icon: Zap, text: t("feature2") },
  { icon: Trophy, text: t("feature3") },
  { icon: Target, text: t("feature4") },
];

function MotivationalPanel({ t }: { t: any }) {
  const fitnessFeatures = getFitnessFeatures(t);
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

      {/* Animated glow orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200,254,27,0.18) 0%, transparent 70%)",
          top: "-10%",
          right: "-15%",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
          bottom: "10%",
          left: "-10%",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200,254,27,0.1) 0%, transparent 70%)",
          top: "45%",
          left: "40%",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Content */}
      <div className="relative z-10 p-12 flex flex-col justify-between h-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <TransitionLink href="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Dumbbell size={18} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold uppercase tracking-widest text-white">
              FitCoach
            </span>
          </TransitionLink>
        </motion.div>

        {/* Main copy */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.35em] mb-4 flex items-center gap-2">
              <span className="inline-block w-8 h-px bg-primary" />
              {t("welcomeBack")}
            </p>
            <h2 className="text-5xl xl:text-6xl font-extrabold leading-[1.05] uppercase text-white">
              {t("continueJourney1")}
              <br />
              <span className="inline-block text-primary">
                {t("continueJourney2")}
              </span>
            </h2>
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

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-2xl p-5 border border-white/8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 text-primary fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-white/55 text-xs leading-relaxed">
            {t("testimonial")}
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
              style={{ background: "linear-gradient(135deg, #c8fe1b, #86efac)" }}
            >
              A
            </div>
            <div>
              <p className="text-xs font-bold text-white/90">{t("testimonialName")}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{t("testimonialRole")}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-primary">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t("verified")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [form, setForm] = useState({ identifier: "", password: "", remember: false });
  const [errors, setErrors] = useState<FieldError>({});
  const [success, setSuccess] = useState(false);
  const uid = useId();
  const t = useTranslations("auth");
  const tc = useTranslations("common");

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
          router.push('/');
        }
      }, 1200);
      return () => clearTimeout(timer);
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, router, dispatch, searchParams]);

  const set = useCallback(
    (key: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({
          ...prev,
          [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
        })),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLogin({ identifier: form.identifier, password: form.password }, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    dispatch(login({ email: form.identifier, password: form.password }));
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
      <MotivationalPanel t={t} />

      {/* ── Form side ──────────────────────────────── */}
      <div className="relative flex flex-col min-h-screen bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0 lg:px-10">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <TransitionLink href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Dumbbell size={15} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold uppercase tracking-widest text-primary">FitCoach</span>
            </TransitionLink>
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Form area */}
        <div className="flex flex-1 flex-col justify-center items-center px-6 py-10 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
          >
            {/* Header */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
              >
                <Zap size={12} className="text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{t("signIn")}</span>
              </motion.div>
              <h1 className="text-3xl font-extrabold text-foreground uppercase tracking-tight leading-tight">
                {t("login")}<br />
                <span className="text-gradient">FitCoach</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-2.5 leading-relaxed">
                {t("hasAccount")}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-primary/10 border border-primary/30 px-6 py-8 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg uppercase tracking-wide">{tc("success")}!</h3>
                  <p className="text-muted-foreground text-sm mt-1">{tc("loading")}</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
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

                  <FloatingInput
                    id={`${uid}-identifier`}
                    label={t("email")}
                    type="text"
                    icon={Mail}
                    value={form.identifier}
                    onChange={set("identifier")}
                    error={errors.identifier}
                    autoComplete="email"
                  />

                  <FloatingPasswordInput
                    id={`${uid}-password`}
                    label={t("password")}
                    value={form.password}
                    onChange={set("password")}
                    error={errors.password}
                  />

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                      <div className="relative">
                        <input
                          id={`${uid}-remember`}
                          type="checkbox"
                          checked={form.remember}
                          onChange={set("remember")}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                            form.remember
                              ? "bg-primary border-primary"
                              : "border-foreground/20 bg-transparent group-hover:border-primary/50"
                          )}
                        >
                          {form.remember && (
                            <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        {t("rememberMe")}
                      </span>
                    </label>
                    <TransitionLink
                      href="/forgot-password"
                      className="text-primary hover:text-primary/80 transition-colors font-semibold text-xs uppercase tracking-wider"
                    >
                      {t("forgotPassword")}
                    </TransitionLink>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={isLoading ? {} : { scale: 1.02, y: -1 }}
                    whileTap={isLoading ? {} : { scale: 0.98 }}
                    className={cn(
                      "relative w-full rounded-2xl py-3.5 text-sm font-bold uppercase tracking-widest overflow-hidden",
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
                          {tc("loading")}
                        </>
                      ) : (
                        <>
                          {t("signIn")}
                          <ArrowRight size={15} />
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="flex-1 h-px bg-foreground/8" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] font-medium">or</span>
              <div className="flex-1 h-px bg-foreground/8" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <TransitionLink
                href={searchParams.get("redirect") ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect") as string)}` : "/register"}
                className="text-primary hover:text-primary/80 transition-colors font-bold uppercase tracking-wider text-xs"
              >
                {t("signUp")}
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
