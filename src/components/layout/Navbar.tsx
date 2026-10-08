"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { useCurtain } from "@/components/layout/CurtainProvider";
import { useAppSelector } from "@/lib/hooks";
import NotificationBell from "@/components/layout/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import axiosInstance from "@/lib/axios";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { navigate } = useCurtain();
  const { user } = useAppSelector((state) => state.auth);
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  const [mounted, setMounted] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fetch subscription status whenever user changes
  useEffect(() => {
    if (!user || user.role === "admin") {
      setHasActiveSub(false);
      return;
    }
    axiosInstance
      .get("/subscriptions/me", { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          const subs: { status: string }[] = res.data.data;
          setHasActiveSub(subs.some((s) => s.status === "active"));
        }
      })
      .catch(() => setHasActiveSub(false));
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-foreground/[0.06] hidden md:block">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <TransitionLink
          href="/"
          className="text-2xl font-extrabold uppercase tracking-widest text-primary"
        >
          FitCoach
        </TransitionLink>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          <TransitionLink
            href="/exercises"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            {t("exercises")}
          </TransitionLink>
          <TransitionLink
            href="/calories"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            {t("calories")}
          </TransitionLink>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3 min-w-[150px] justify-end">
          <LanguageSwitcher />
          {mounted ? (
            user ? (
              <div className="flex items-center gap-4">
                {/* Authenticated Links in a Glass Pill — only for subscribed users */}
                {hasActiveSub && (
                  <div className="hidden lg:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.05]">
                    <button
                      onClick={() => navigate("/progress")}
                      className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                    >
                      {t("progress")}
                    </button>
                    <button
                      onClick={() => navigate("/workout-log")}
                      className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                    >
                      {t("workoutLog")}
                    </button>
                    <button
                      onClick={() => navigate("/chat")}
                      className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                    >
                      {t("chat")}
                    </button>
                  </div>
                )}

                {/* Notification Bell — subscribed users only */}
                {hasActiveSub && (
                  <div className="flex-shrink-0">
                    <NotificationBell />
                  </div>
                )}

                {/* Profile Button */}
                <button
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/profile')}
                  className="relative flex items-center justify-center px-6 h-10 rounded-xl text-xs font-extrabold uppercase tracking-[0.15em] text-black overflow-hidden group transition-transform hover:scale-105 active:scale-95"
                  style={{ background: "#c8fe1b", boxShadow: "0 0 20px rgba(200,254,27,0.3), inset 0 -2px 5px rgba(0,0,0,0.2)" }}
                >
                  <span className="relative z-10">{t("profile")}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              </div>
            ) : (
              <>
                <TransitionLink
                  href="/login"
                  className="uppercase tracking-wider font-semibold text-sm text-foreground hover:text-primary transition-colors duration-200"
                >
                  {t("login")}
                </TransitionLink>
                <button
                  onClick={() => navigate("/register")}
                  className="uppercase tracking-wider font-bold text-sm glow-primary-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-3 h-8 rounded-lg"
                >
                  {t("register")}
                </button>
              </>
            )
          ) : (
            <div className="h-9 w-full" />
          )}
        </div>

        {/* Mobile hamburger — triggers Sheet */}
        <div className="md:hidden flex items-center gap-2">
          {mounted && user && hasActiveSub && <NotificationBell />}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              id="mobile-menu-trigger"
              aria-label="Open navigation menu"
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] rounded-lg hover:bg-foreground/5 transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[8.5px]" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[8.5px]" : ""}`} />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[280px] glass-card border-r border-foreground/[0.06] flex flex-col p-0"
            >
              <SheetHeader className="px-6 py-5 border-b border-foreground/[0.06]">
                <SheetTitle className="text-left text-2xl font-extrabold uppercase tracking-widest text-gradient">
                  FitCoach
                </SheetTitle>
              </SheetHeader>

              {/* Mobile nav links */}
              <nav className="flex flex-col px-4 py-6 gap-1 flex-1">
                <button
                  onClick={() => { setOpen(false); navigate("/exercises"); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-foreground/5 transition-all duration-200 text-left"
                >
                  {t("exercises")}
                </button>
                <button
                  onClick={() => { setOpen(false); navigate("/calories"); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-foreground/5 transition-all duration-200 text-left"
                >
                  {t("calories")}
                </button>
                {/* Mobile: Workout Log & Progress — subscribed users only */}
                {mounted && hasActiveSub && (
                  <>
                    <button onClick={() => { setOpen(false); navigate("/progress"); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 text-left">
                      {t("progress")}
                    </button>
                    <button onClick={() => { setOpen(false); navigate("/workout-log"); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 text-left">
                      {t("workoutLog")}
                    </button>
                    <button onClick={() => { setOpen(false); navigate("/chat"); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 text-left">
                      {t("chat")}
                    </button>
                  </>
                )}
              </nav>

              {/* Mobile CTA buttons */}
              <div className="px-6 py-6 border-t border-foreground/[0.06] flex flex-col gap-3 min-h-[120px]">
                <LanguageSwitcher className="self-start" />
                {mounted && (
                  user ? (
                    <Button
                      className="w-full uppercase tracking-wider font-bold text-sm glow-primary-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                      onClick={() => { setOpen(false); navigate(user.role === 'admin' ? '/admin' : '/profile'); }}
                    >
                      {t("profile")}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full uppercase tracking-wider font-bold text-sm border-foreground/10 hover:bg-foreground/5"
                        onClick={() => { setOpen(false); navigate("/login"); }}
                      >
                        {t("login")}
                      </Button>
                      <Button
                        className="w-full uppercase tracking-wider font-bold text-sm glow-primary-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        onClick={() => { setOpen(false); navigate("/register"); }}
                      >
                        {t("register")}
                      </Button>
                    </>
                  )
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
