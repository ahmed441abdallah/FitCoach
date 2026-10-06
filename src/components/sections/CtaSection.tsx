"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainProvider";
import { useTranslations } from "next-intl";

export default function CtaSection() {
  const t = useTranslations("home.cta");
  const { navigate } = useCurtain();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-background py-32 px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span
          className="font-extrabold uppercase leading-none text-foreground/[0.04]"
          style={{ fontSize: "clamp(10rem, 38vw, 30rem)", letterSpacing: "-0.04em" }}
        >
          {t("bgWord")}
        </span>
      </div>

      {/* ── Content wrapper ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">

        {/* Oval border — drawn with SVG so it's always perfectly elliptical */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <motion.svg
            viewBox="0 0 1000 320"
            preserveAspectRatio="none"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <ellipse
              cx="500"
              cy="160"
              rx="490"
              ry="145"
              fill="none"
              stroke="#c8ff00"
              strokeWidth="1.2"
              strokeOpacity="0.55"
            />
          </motion.svg>
        </div>

        {/* Inner content */}
        <div className="relative py-16 px-8">
          {/* Kicker */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-primary font-bold text-[11px] uppercase tracking-[0.35em] mb-6"
          >
            {t("kicker")}
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-foreground font-extrabold leading-[1.05] mb-6"
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              textTransform: "none",
            }}
          >
            {t("title1")}
            <br />
            {t("title2")}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground/50 text-sm font-normal leading-relaxed max-w-md mx-auto mb-10 normal-case tracking-normal"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.3 }}
          >
            <button
              onClick={() => navigate("/#plans")}
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: "#c8ff00",
                color: "#080a06",
                boxShadow: "0 0 0 1px #c8ff00, 0 8px 32px rgba(200,255,0,0.25)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 0 1px #c8ff00, 0 8px 48px rgba(200,255,0,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 0 1px #c8ff00, 0 8px 32px rgba(200,255,0,0.25)";
              }}
            >
              {t("button")}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
              />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
