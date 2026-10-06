"use client";

import { useTranslations } from "next-intl";

export function StatsSection() {
  const t = useTranslations("home.stats");
  
  return (
    <section id="features" className="py-24">
      <div>
        <div className="text-center mb-16 px-6">
          <p className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-3">
            {t("tagline")}
          </p>
          <h2 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-foreground">
            {t("title1")}
            <br />
            <span className="text-accent">{t("title2")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 p-0 m-0">
          {[
            { value: "2,000+", label: t("clients") },
            { value: "8+", label: t("experience") },
            { value: "99.9%", label: t("accuracy") },
            { value: "24/7", label: t("support") },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className={`border border-foreground/20 text-center p-16 ${i === 0 ? "border-l-0" : ""} ${i === arr.length - 1 ? "border-r-0" : ""}`}
            >
              <h2 className="text-4xl font-extrabold uppercase tracking-tight mb-2">
                {stat.value}
              </h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
