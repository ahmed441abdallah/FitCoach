"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";

const LOCALES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "ar", label: "ع", fullLabel: "العربية", dir: "rtl" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  function switchLocale(locale: string) {
    startTransition(() => {
      // Set the locale cookie
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
      // Reload so the server picks up the new cookie
      window.location.reload();
    });
  }

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];
  const other = LOCALES.find((l) => l.code !== currentLocale) ?? LOCALES[1];

  return (
    <div className={`relative flex items-center gap-1 ${className}`}>
      {/* Pill toggle */}
      <div
        className="relative flex items-center rounded-full border border-white/[0.12] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", padding: "2px" }}
      >
        {LOCALES.map((locale) => {
          const isActive = locale.code === currentLocale;
          return (
            <button
              key={locale.code}
              onClick={() => !isActive && switchLocale(locale.code)}
              disabled={isPending}
              title={locale.fullLabel}
              className={[
                "relative z-10 w-9 h-7 rounded-full text-xs font-bold transition-colors duration-200",
                "flex items-center justify-center cursor-pointer select-none",
                isActive
                  ? "text-black"
                  : "text-white/50 hover:text-white/80",
              ].join(" ")}
              style={{ fontFamily: locale.code === "ar" ? "Arial, sans-serif" : undefined }}
            >
              {/* Active background */}
              {isActive && (
                <motion.span
                  layoutId="lang-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#c8ff00" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{locale.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading spinner */}
      {isPending && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -right-5 w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"
          />
        </AnimatePresence>
      )}
    </div>
  );
}
