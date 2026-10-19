"use client";
import { useState, useCallback, useId, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { login, reset } from "@/lib/features/auth/authSlice";
import { Eye, EyeOff, Dumbbell, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
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
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <TransitionLink href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Dumbbell size={17} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold uppercase tracking-widest text-foreground">
              FitCoach
            </span>
          </TransitionLink>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-extrabold text-foreground uppercase tracking-tight">
            {t("login")} <span className="text-gradient">FitCoach</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {t("hasAccount")}
          </p>
        </motion.div>

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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
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

        {/* Bottom bar */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            © {new Date().getFullYear()} FitCoach · All rights reserved
          </p>
        </div>
      </motion.div>
    </main>
  );
}
