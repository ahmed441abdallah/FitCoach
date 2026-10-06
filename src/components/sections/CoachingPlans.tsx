"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Check, Zap, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getPackages } from "@/lib/features/packages/packageSlice";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { useTranslations } from "next-intl";

// ─── Types ───────────────────────────────────────────────────────────────────
type PricingOption = { durationInMonths: number; price: number; _id?: string };

interface Plan {
  _id?: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
  pricingOptionId?: string;
}

// ─── Helper: map backend doc → Plan ──────────────────────────────────────────
function mapToPlan(pkg: any, isFeatured: boolean, selectedDuration: number, t: any): Plan {
  const opts: PricingOption[] = pkg.pricingOptions ?? [];
  // Find the pricing option for the selected duration, fallback to first if missing
  const opt = opts.find((o) => o.durationInMonths === selectedDuration) ?? opts[0];

  return {
    _id: pkg._id,
    name: pkg.name ?? t("unknown"),
    price: opt ? `$${opt.price}` : t("custom"),
    period: opt ? `/${opt.durationInMonths}${t("mo")}` : "",
    description: t("defaultDesc"),
    features: Array.isArray(pkg.description) ? pkg.description : [],
    featured: isFeatured,
    cta: t("getStarted"),
    pricingOptionId: opt?._id,
  };
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, index, t }: { plan: Plan; index: number; t: any }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${plan.featured
        ? "bg-primary text-primary-foreground shadow-[0_0_64px_rgba(200,255,0,0.2)] scale-[1.03]"
        : "bg-white/[0.04] border border-white/10 hover:border-primary/30 hover:bg-white/[0.07]"
        }`}
    >
      {/* Most Popular badge */}
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="flex items-center gap-1.5 bg-black text-primary text-[10px] font-extrabold uppercase tracking-[0.22em] px-4 py-1.5 rounded-full whitespace-nowrap border border-primary/30">
            <Zap size={10} className="fill-primary" />
            {t("mostPopular")}
          </span>
        </div>
      )}

      {/* Name & price */}
      <div className="mb-6 mt-2">
        <p className={`text-xs font-bold uppercase tracking-[0.25em] mb-2 ${plan.featured ? "text-primary-foreground/70" : "text-primary"}`}>
          {plan.name}
        </p>
        <div className="flex items-end gap-1 mb-2">
          <motion.span
            key={plan.price}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-5xl font-extrabold leading-none ${plan.featured ? "text-primary-foreground" : "text-white"}`}
          >
            {plan.price}
          </motion.span>
          {plan.period && (
            <span className={`text-sm mb-1 font-semibold ${plan.featured ? "text-primary-foreground/60" : "text-white/50"}`}>
              {plan.period}
            </span>
          )}
        </div>
        <p className={`text-xs leading-relaxed font-normal normalcase tracking-normal ${plan.featured ? "text-primary-foreground/65" : "text-white/50"}`}>
          {plan.description}
        </p>
      </div>

      {/* CTA */}
      <TransitionLink
        href={`/checkout?packageId=${plan._id}&optionId=${plan.pricingOptionId}`}
        className={`w-full text-center flex items-center justify-center rounded-xl py-3 text-sm font-bold uppercase tracking-widest mb-8 transition-all duration-200 ${plan.featured
          ? "bg-black text-primary hover:bg-black/80"
          : "bg-primary text-black hover:opacity-90"
          }`}
      >
        {plan.cta} →
      </TransitionLink>

      {/* Divider */}
      <div className={`w-full h-px mb-6 ${plan.featured ? "bg-primary-foreground/20" : "bg-white/10"}`} />

      {/* Features */}
      <ul className="flex flex-col gap-3 flex-1">
        {plan.features.map((feat: string) => (
          <li key={feat} className="flex items-start gap-2.5">
            <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${plan.featured ? "bg-primary-foreground/20" : "bg-primary/20"
              }`}>
              <Check size={9} className={plan.featured ? "text-primary-foreground" : "text-primary"} strokeWidth={3} />
            </span>
            <span className={`text-xs leading-relaxed font-normal normal-case tracking-normal ${plan.featured ? "text-primary-foreground/80" : "text-white/60"
              }`}>
              {feat}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────
function PlanSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/10 p-8 animate-pulse">
          <div className="h-3 w-16 bg-white/10 rounded mb-4" />
          <div className="h-12 w-24 bg-white/10 rounded mb-4" />
          <div className="h-3 w-full bg-white/10 rounded mb-8" />
          <div className="h-10 w-full bg-white/10 rounded mb-8" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-3 w-full bg-white/10 rounded mb-3" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CoachingPlans() {
  const t = useTranslations("home.plans");
  const dispatch = useAppDispatch();
  const { packages, loading, error } = useAppSelector((state) => state.package);

  // State for duration toggle (defaults to 1 month, will update when data loads)
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  useEffect(() => {
    dispatch(getPackages());
  }, [dispatch]);

  // Derive unique available durations from the backend data
  const availableDurations = useMemo(() => {
    if (!packages) return [];
    const durations = new Set<number>();
    packages.forEach((pkg: any) => {
      pkg.pricingOptions?.forEach((opt: any) => durations.add(opt.durationInMonths));
    });
    return Array.from(durations).sort((a, b) => a - b);
  }, [packages]);

  // Set the default selected duration once data arrives if it's not set to a valid one
  useEffect(() => {
    if (availableDurations.length > 0 && !availableDurations.includes(selectedDuration)) {
      // Default to the first available option (e.g. 1 month)
      setSelectedDuration(availableDurations[0]);
    }
  }, [availableDurations, selectedDuration]);

  // Mark the middle package as "Most Popular" and pass selected duration
  const displayPlans: Plan[] = useMemo(() => {
    if (!packages || packages.length === 0) return [];
    const midIndex = Math.floor(packages.length / 2);
    return packages.map((pkg: any, i: number) => mapToPlan(pkg, i === midIndex, selectedDuration, t));
  }, [packages, selectedDuration, t]);

  return (
    <section id="plans" className="relative py-24 px-6 overflow-hidden" style={{ contain: "layout style" }}>
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.pexels.com/photos/13129482/pexels-photo-13129482.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Gym background"
          fill
          loading="lazy"
          quality={75}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: "rgba(10, 10, 18, 0.90)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header & Toggle */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <p className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 flex items-center justify-center lg:justify-start gap-2">
              <span className="inline-block w-8 h-px bg-primary" />
              {t("tagline")}
            </p>
            <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight mb-3 text-foreground">
              {t("title")}
            </h2>
            <p className="text-white/50 text-base normal-case font-normal tracking-normal max-w-xl mx-auto lg:mx-0">
              {t("subtitle")}
            </p>

            {loading && (
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-5 text-primary text-sm">
                <Loader2 size={14} className="animate-spin" />
                <span>{t("loading")}</span>
              </div>
            )}
            {error && !loading && (
              <p className="text-destructive text-xs mt-4 normal-case text-center lg:text-left">
                {t("error")} {error}
              </p>
            )}
          </motion.div>

          {/* Duration Toggle */}
          {availableDurations.length > 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-1.5 rounded-full flex items-center bg-white/[0.03] border border-white/10"
            >
              {availableDurations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${selectedDuration === duration
                      ? "text-black"
                      : "text-white/60 hover:text-white"
                    }`}
                >
                  {selectedDuration === duration && (
                    <motion.div
                      layoutId="duration-indicator"
                      className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(200,254,27,0.4)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{duration} {duration > 1 ? t("months") : t("month")}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Cards */}
        {loading && packages.length === 0 ? (
          <PlanSkeleton />
        ) : displayPlans.length === 0 && !loading ? (
          <div className="py-12 text-center border border-white/10 rounded-2xl bg-white/[0.02]">
            <p className="text-white/40 mb-2">{t("empty")}</p>
            <p className="text-xs text-white/20">{t("emptySub")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            <AnimatePresence mode="wait">
              {displayPlans.map((plan, index) => (
                <PlanCard key={plan._id ?? plan.name} plan={plan} index={index} t={t} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
