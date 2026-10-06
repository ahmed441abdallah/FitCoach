"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { TransitionLink } from "../layout";
import { Dumbbell, UtensilsCrossed, CalendarCheck, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// Dynamically import SideRays (WebGL), which avoids SSR canvas issues
const SideRays = dynamic(() => import("@/components/ui/SideRays"), {
  ssr: false,
});

// ─── HeroSection ──────────────────────────────────────────────────────────────
export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const t = useTranslations("home.hero");
  const tc = useTranslations("home.trust");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 });

      tl.fromTo(
        "[data-h-badge]",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
        .fromTo(
          "[data-h-line]",
          { opacity: 0, y: 60, rotateX: 18 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.12, force3D: true },
          "-=0.25"
        )
        .fromTo(
          "[data-h-desc]",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          "[data-h-trust] > *",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
          "-=0.35"
        )
        .fromTo(
          "[data-h-buttons] > *",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 },
          "-=0.4"
        )
        .fromTo(
          "[data-h-scroll]",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.1"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Trust items using translations
  const trustItems = [
    { icon: Dumbbell, label: t("trust1") },
    { icon: UtensilsCrossed, label: t("trust2") },
    { icon: CalendarCheck, label: t("trust3") },
  ];

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-label="Hero — Bodybuilding Online Coaching"
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* ── Deep base gradient ────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -10%, oklch(0.18 0.04 80 / 0.35) 0%, oklch(0.08 0.015 250) 55%, oklch(0.06 0.01 250) 100%)",
        }}
      />

      {/* ── Side rays ─────────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none">
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={1.6}
          opacity={1}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-14 lg:px-20 pt-28 pb-32 flex flex-col items-center text-center">

        {/* Badge */}
        <div
          data-h-badge
          className="inline-flex items-center gap-2.5 mb-8 px-5 py-2 rounded-full
            border border-primary/30 bg-primary/10"
          style={{ opacity: 0 }}
        >
          <span className="text-primary text-[11px] font-bold uppercase tracking-[0.35em]">
            {t("tagline")}
          </span>
        </div>

        {/* Heading */}
        <h1
          className="font-extrabold uppercase leading-[0.9] tracking-tight mb-8"
          style={{ perspective: "900px" }}
        >
          <span
            data-h-line
            className="block text-white text-5xl sm:text-6xl md:text-7xl xl:text-[6rem]"
            style={{ opacity: 0, textShadow: "0 0 80px rgba(200,254,27,0.15)" }}
          >
            {t("line1")}
          </span>
          <span
            data-h-line
            className="block text-6xl sm:text-7xl md:text-8xl xl:text-[8rem]"
            style={{
              opacity: 0,
              color: "#c8ff00",
              textShadow: "0 0 48px rgba(200,255,0,0.45)",
            }}
          >
            {t("line2")}
          </span>
          <span
            data-h-line
            className="block text-white text-5xl sm:text-6xl md:text-7xl xl:text-[6rem]"
            style={{ opacity: 0, textShadow: "0 0 80px rgba(200,254,27,0.15)" }}
          >
            {t("line3")}
          </span>
        </h1>

        {/* Description */}
        <p
          data-h-desc
          className="text-white/60 text-base md:text-lg leading-relaxed font-normal
            normal-case tracking-normal max-w-xl mb-10"
          style={{ opacity: 0 }}
        >
          {t("subtitle")}
        </p>

        {/* Trust pills */}
        <div
          data-h-trust
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
          style={{ opacity: 0 }}
        >
          {trustItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full
                border border-white/10 bg-white/[0.06]"
            >
              <Icon size={13} className="text-primary shrink-0" />
              <span className="text-white/70 text-[11px] font-semibold uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div
          data-h-buttons
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary */}
          <TransitionLink
            href="/get-started"
            className="group relative inline-flex items-center justify-center gap-3
              h-[3.75rem] px-10 rounded-full overflow-hidden
              text-[0.78rem] font-extrabold uppercase tracking-[0.2em] text-black
              transition-all duration-300 ease-out
              hover:scale-[1.04] active:scale-[0.97]
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/60"
            style={{
              background: "linear-gradient(115deg, #d4ff35 0%, #c8fe1b 50%, #b8ee10 100%)",
              opacity: 0,
            }}
            data-h-btn-primary
          >
            {/* Shimmer */}
            <span
              aria-hidden
              className="absolute inset-0 -skew-x-12
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-transform duration-700 ease-in-out pointer-events-none"
            />
            <span className="relative z-10 whitespace-nowrap">
              {t("cta")}
            </span>

          </TransitionLink>

          {/* Secondary */}
          <TransitionLink
            href="/#coaching-plans"
            className="group relative inline-flex items-center justify-center gap-3
              h-[3.75rem] px-10 rounded-full
              text-[0.78rem] font-extrabold uppercase tracking-[0.2em] text-white
              border border-white/15
              transition-all duration-300 ease-out
              hover:border-white/40 hover:scale-[1.04] active:scale-[0.97]
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            style={{
              background: "rgba(255,255,255,0.07)",
              opacity: 0,
            }}
            data-h-btn-secondary
          >

            <span className="relative z-10 whitespace-nowrap">
              {t("ctaSecondary")}
            </span>


          </TransitionLink>
        </div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────────────── */}
      <div
        data-h-scroll
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
          flex flex-col items-center gap-2"
        style={{ opacity: 0 }}
      >
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/30 font-semibold">
          {t("scroll")}
        </span>
        <ChevronDown
          size={18}
          className="text-white/25"
          style={{ animation: "heroScrollBounce 1.8s ease-in-out infinite" }}
        />
      </div>

      {/* ── Keyframes ─────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes heroScrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50%       { transform: translateY(6px); opacity: 0.7; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-h-badge],
          [data-h-line],
          [data-h-desc],
          [data-h-trust] > *,
          [data-h-buttons] > *,
          [data-h-scroll] { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}