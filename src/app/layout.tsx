import type { Metadata } from "next";
import { Barlow_Condensed, Tajawal } from "next/font/google";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Tajawal — geometric, bold, premium Arabic font.
// Closest Arabic match to Barlow Condensed's sporty weight and feel.
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitCoach — Your Personal AI Fitness Coach",
  description:
    "Achieve your fitness goals with personalized AI-powered coaching, workout plans, and nutrition guidance tailored just for you.",
  keywords: ["fitness", "coaching", "workout", "nutrition", "AI coach"],
};

import { StoreProvider } from "@/components/StoreProvider";
import { CurtainProvider } from "@/components/layout/CurtainProvider";
// Lazy-loaded via a client wrapper — defers motion/react from the initial bundle.
import ChatbotWidgetLazy from "@/components/ChatbotWidgetLazy";
import Preloader from "@/components/Preloader";

// Inline script: runs synchronously before first paint.
// - Returning session → hide preloader, show content immediately
// - First visit → preloader stays, content stays hidden until GSAP finishes
const preloaderScript = `
  try {
    var p = document.getElementById('fc-preloader');
    var c = document.getElementById('fc-content');
    if (sessionStorage.getItem('fc_preloaded')) {
      if (p) p.style.display = 'none';
      if (c) c.style.opacity = '1';
    }
  } catch(e) {}
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={`${barlowCondensed.variable} ${tajawal.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col antialiased bg-background text-foreground"
        style={isRTL ? { fontFamily: "var(--font-tajawal), sans-serif" } : undefined}
      >
        {/* ── Server-rendered preloader — in the HTML from byte 1, no flash ── */}
        <div
          id="fc-preloader"
          suppressHydrationWarning
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#060608",
          }}
        >
          {/* Logo */}
          <div id="fc-preloader-logo" style={{ opacity: 0, marginBottom: "3rem", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #d4ff35 0%, #b8ee10 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                boxShadow: "0 0 48px rgba(200,255,0,0.35)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a0f07" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="9" width="4" height="6" rx="1" />
                <rect x="18" y="9" width="4" height="6" rx="1" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="6" y1="9" x2="6" y2="15" />
                <line x1="18" y1="9" x2="18" y2="15" />
              </svg>
            </div>
            <p
              style={{
                fontFamily: "var(--font-barlow-condensed), sans-serif",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fff",
                margin: 0,
              }}
            >
              Fit<span style={{ color: "#c8ff00" }}>Coach</span>
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ width: "min(320px, 80vw)", height: 3, borderRadius: 9999, background: "rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }}>
            <div id="fc-preloader-bar" style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "0%", borderRadius: 9999, background: "linear-gradient(90deg, #d4ff35, #c8fe1b)", boxShadow: "0 0 12px rgba(200,255,0,0.6)" }} />
          </div>

          {/* Percentage */}
          <span
            id="fc-preloader-percent"
            style={{
              marginTop: "1rem",
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            0%
          </span>
        </div>

        {/* Hide preloader instantly if already visited this session */}
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />

        {/* Client component that animates the server-rendered preloader */}
        <Preloader />

        {/* Page content — hidden until preloader finishes (first visit) or shown instantly (returning session) */}
        <div id="fc-content" suppressHydrationWarning style={{ opacity: 0 }}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <StoreProvider>
              <CurtainProvider>
                {children}
                <ChatbotWidgetLazy />
              </CurtainProvider>
            </StoreProvider>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
