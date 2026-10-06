"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { animate } from "motion";

/* ── Same as app --background, pure dark no hue ── */
const PANEL_BG = "#090909";

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */
interface CurtainContextType {
  navigate: (href: string) => void;
}

const CurtainContext = createContext<CurtainContextType | undefined>(undefined);

/* ─────────────────────────────────────────────
   Timing constants
───────────────────────────────────────────── */
const CLOSE_DURATION = 0.55; // panels slide in (close)
const HOLD_DURATION  = 120;  // ms pause at full-closed before pushing route
const OPEN_DURATION  = 0.55; // panels slide out (open)
const EASE_IN        = [0.76, 0, 0.24, 1] as const;
const EASE_OUT       = [0.76, 0, 0.24, 1] as const;

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */
export function CurtainProvider({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const leftRef  = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const logoRef  = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const navigate = useCallback(
    async (href: string) => {
      if (busy) return;
      setBusy(true);

      const left   = leftRef.current!;
      const right  = rightRef.current!;
      const logo   = logoRef.current!;

      /* ── 1. Doors CLOSE — panels scaleX 0→1, logo fades in ── */
      await Promise.all([
        animate(left,  { transform: ["scaleX(0)", "scaleX(1)"] } as any, { duration: CLOSE_DURATION, ease: EASE_IN }),
        animate(right, { transform: ["scaleX(0)", "scaleX(1)"] } as any, { duration: CLOSE_DURATION, ease: EASE_IN }),
        animate(logo,  { opacity: [0, 1] } as any, { duration: CLOSE_DURATION * 0.6, delay: CLOSE_DURATION * 0.4, ease: "easeOut" }),
      ]);

      /* ── 2. Navigate while curtains are closed ── */
      await new Promise<void>((res) => setTimeout(res, HOLD_DURATION));
      router.push(href);
      await new Promise<void>((res) => setTimeout(res, HOLD_DURATION));

      /* ── 3. Doors OPEN — logo fades out first, then panels retract ── */
      await animate(logo, { opacity: [1, 0] } as any, { duration: 0.2, ease: "easeIn" });
      await Promise.all([
        animate(left,  { transform: ["scaleX(1)", "scaleX(0)"] } as any, { duration: OPEN_DURATION, ease: EASE_OUT }),
        animate(right, { transform: ["scaleX(1)", "scaleX(0)"] } as any, { duration: OPEN_DURATION, ease: EASE_OUT }),
      ]);

      setBusy(false);
    },
    [busy, router]
  );

  return (
    <CurtainContext.Provider value={{ navigate }}>
      {children}

      {/* ── Left door panel ── */}
      <div
        ref={leftRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          right: "50%",
          zIndex: 9999,
          background: PANEL_BG,
          transformOrigin: "left center",
          transform: "scaleX(0)",
          pointerEvents: busy ? "all" : "none",
          willChange: "transform",
        }}
      />

      {/* ── Right door panel ── */}
      <div
        ref={rightRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          left: "50%",
          zIndex: 9999,
          background: PANEL_BG,
          transformOrigin: "right center",
          transform: "scaleX(0)",
          pointerEvents: busy ? "all" : "none",
          willChange: "transform",
        }}
      />

      {/* ── Centred logo — sits above both panels ── */}
      <div
        ref={logoRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {/* Wordmark — same colour as Navbar logo (--primary) */}
        <span
          style={{
            fontFamily: "var(--font-barlow-condensed), sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 900,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#c8ff00",
            lineHeight: 1,
          }}
        >
          FitCoach
        </span>
      </div>
    </CurtainContext.Provider>
  );
}

/* ─────────────────────────────────────────────
   Hook
───────────────────────────────────────────── */
export function useCurtain() {
  const context = useContext(CurtainContext);
  if (context === undefined) {
    throw new Error("useCurtain must be used within a CurtainProvider");
  }
  return context;
}
