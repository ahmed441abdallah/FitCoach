'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useCurtain } from '@/components/layout/CurtainProvider';
import { useAppSelector } from '@/lib/hooks';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/layout/NotificationBell';

export const StaggeredMenu: React.FC = () => {
  const { navigate } = useCurtain();
  const { user } = useAppSelector((state) => state.auth);
  const t = useTranslations('nav');
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);

  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Close']);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  // Build nav items based on auth state
  const baseItems = [
    { label: t('home'), ariaLabel: 'Go to home page', href: '/' },
    { label: t('exercises'), ariaLabel: 'Exercise library', href: '/exercises' },
    { label: t('calories'), ariaLabel: 'Calorie calculator', href: '/calories' },
  ];

  const authItems = mounted && user && user.role !== 'admin' ? [
    { label: t('progress'), ariaLabel: 'My progress', href: '/progress' },
    { label: t('workoutLog'), ariaLabel: 'Workout log', href: '/workout-log' },
    { label: t('chat'), ariaLabel: 'Chat with coach', href: '/chat' },
  ] : [];

  const allItems = [...baseItems, ...authItems];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      gsap.set([panel, ...preLayers], { xPercent: 100, opacity: 1 });
      if (preContainer) gsap.set(preContainer, { xPercent: 0, opacity: 1 });

      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: '#ffffff' });
    });
    return () => ctx.revert();
  }, []);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) { closeTweenRef.current.kill(); closeTweenRef.current = null; }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')) as HTMLElement[];
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];

    const layerStates = layers.map(el => ({ el, start: 100 }));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as any]: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } }, itemsStart);
      if (numberEls.length) {
        tl.to(numberEls, { duration: 0.6, ease: 'power2.out', ['--sm-num-opacity' as any]: 1, stagger: { each: 0.08, from: 'start' } }, itemsStart + 0.1);
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(socialLinks, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: { each: 0.08, from: 'start' }, onComplete: () => gsap.set(socialLinks, { clearProps: 'opacity' }) }, socialsStart + 0.04);
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) { tl.eventCallback('onComplete', () => { busyRef.current = false; }); tl.play(0); }
    else { busyRef.current = false; }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill(); openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;
    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to(all, {
      xPercent: 100, duration: 0.32, ease: 'power3.in', overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as any]: 0 });
        const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        busyRef.current = false;
      }
    });
  }, []);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;
    spinTweenRef.current?.kill();
    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power4.out' } }).to(h, { rotate: 45, duration: 0.5 }, 0).to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power3.inOut' } }).to(h, { rotate: 0, duration: 0.35 }, 0).to(v, { rotate: 90, duration: 0.35 }, 0).to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback((opening: boolean) => {
    const btn = toggleBtnRef.current;
    if (!btn) return;
    colorTweenRef.current?.kill();
    colorTweenRef.current = gsap.to(btn, { color: '#ffffff', delay: 0.18, duration: 0.3, ease: 'power2.out' });
  }, []);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();
    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq: string[] = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) { last = last === 'Menu' ? 'Close' : 'Menu'; seq.push(last); }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, { yPercent: -finalShift, duration: 0.5 + lineCount * 0.07, ease: 'power4.out' });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) { playOpen(); } else { playClose(); }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false; setOpen(false);
      playClose(); animateIcon(false); animateColor(false); animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && toggleBtnRef.current && !toggleBtnRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeMenu]);

  return (
    <div className="sm-scope">
      <div
        className="staggered-menu-wrapper"
        style={{ '--sm-accent': '#c8fe1b' } as React.CSSProperties}
        data-position="right"
        data-open={open || undefined}
      >
        {/* Pre-layers (dark wipe) */}
        <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
          <div className="sm-prelayer" style={{ background: '#111111' }} />
          <div className="sm-prelayer" style={{ background: '#090909' }} />
        </div>

        {/* Header bar — always visible, fixed at top */}
        <header className="sm-header" aria-label="Main navigation header">
          {/* Logo */}
          <button
            onClick={() => { closeMenu(); navigate('/'); }}
            className="text-2xl font-extrabold uppercase tracking-widest text-primary bg-transparent border-none cursor-pointer"
          >
            FitCoach
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {mounted && user && user.role !== 'admin' && <NotificationBell />}
            <LanguageSwitcher />

            <button
              ref={toggleBtnRef}
              className="sm-toggle relative inline-flex items-center gap-[0.3rem] bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible text-white"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="staggered-menu-panel"
              onClick={toggleMenu}
              type="button"
            >
              <span className="sm-toggle-textWrap relative inline-block h-[1em] overflow-hidden whitespace-nowrap" aria-hidden="true">
                <span ref={textInnerRef} className="sm-toggle-textInner flex flex-col leading-none">
                  {textLines.map((l, i) => (
                    <span className="sm-toggle-line block h-[1em] leading-none" key={i}>{l}</span>
                  ))}
                </span>
              </span>
              <span ref={iconRef} className="sm-icon relative w-[14px] h-[14px] shrink-0 inline-flex items-center justify-center" aria-hidden="true">
                <span ref={plusHRef} className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2" />
                <span ref={plusVRef} className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2" />
              </span>
            </button>
          </div>
        </header>

        {/* Panel — slides in from right, covers full viewport height */}
        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="sm-panel"
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            {/* Nav items */}
            <ul className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2" role="list" data-numbering>
              {allItems.map((item, idx) => (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={item.href + idx}>
                  <button
                    className="sm-panel-item relative font-semibold cursor-pointer leading-none uppercase bg-transparent border-none text-left w-full"
                    aria-label={item.ariaLabel}
                    data-index={idx + 1}
                    onClick={() => { closeMenu(); navigate(item.href); }}
                  >
                    <span className="sm-panel-itemLabel inline-block">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Auth CTA — pinned to the bottom */}
            <div className="mt-auto pt-8 flex flex-col gap-3">
              {mounted && (
                user ? (
                  <button
                    onClick={() => { closeMenu(); navigate(user.role === 'admin' ? '/admin' : '/profile'); }}
                    className="inline-flex items-center justify-center px-6 py-4 rounded-xl text-sm font-extrabold uppercase tracking-[0.15em] text-black w-full"
                    style={{ background: 'var(--primary, #c8ff00)', boxShadow: '0 0 20px rgba(200,255,0,0.25)' }}
                  >
                    {t('profile')}
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { closeMenu(); navigate('/register'); }}
                      className="w-full px-6 py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest text-black"
                      style={{ background: 'var(--primary, #c8ff00)', boxShadow: '0 0 20px rgba(200,255,0,0.25)' }}
                    >
                      {t('register')}
                    </button>
                    <button
                      onClick={() => { closeMenu(); navigate('/login'); }}
                      className="w-full px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest border text-foreground hover:bg-foreground/5 transition-colors"
                      style={{ borderColor: 'var(--border, #272727)' }}
                    >
                      {t('login')}
                    </button>
                  </div>
                )
              )}
            </div>

          </div>
        </aside>
      </div>

      <style>{`
/* ─── Root scope ─────────────────────────────────── */
.sm-scope { position: fixed; top: 0; left: 0; width: 100%; z-index: 50; pointer-events: none; }
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; pointer-events: none; }

/* ─── Header bar ─────────────────────────────────── */
.sm-scope .sm-header { position: fixed; top: 0; left: 0; right: 0; height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; z-index: 60; pointer-events: auto; background: transparent; font-family: var(--font-barlow-condensed), system-ui, sans-serif; }

/* ─── Pre-layers ─────────────────────────────────── */
.sm-scope .sm-prelayers { position: fixed; top: 0; right: 0; bottom: 0; width: clamp(280px, 42vw, 520px); pointer-events: none; z-index: 55; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; }

/* ─── Panel ──────────────────────────────────────── */
.sm-scope .sm-panel { position: fixed; top: 0; right: 0; height: 100vh; width: clamp(280px, 42vw, 520px); display: flex; flex-direction: column; overflow-y: auto; z-index: 57; pointer-events: auto; background: var(--background, #090909); border-left: 1px solid var(--border, #272727); font-family: var(--font-barlow-condensed), system-ui, sans-serif; }

/* ─── Panel inner ────────────────────────────────── */
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; padding: 5.5rem 2.5rem 2.5rem 2.5rem; }

/* ─── Nav items ──────────────────────────────────── */
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-panel-item { color: var(--foreground, #f1ede5); font-size: clamp(2.4rem, 5vw, 4.2rem); font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase; line-height: 1; cursor: pointer; background: transparent; border: none; text-align: left; width: 100%; padding-right: 1.4em; position: relative; transition: color 0.2s; font-family: var(--font-barlow-condensed), system-ui, sans-serif; }
.sm-scope .sm-panel-item:hover { color: var(--primary, #c8ff00); }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.15em; right: 2em; font-size: 13px; font-weight: 400; color: var(--primary, #c8ff00); letter-spacing: 0.05em; pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); font-family: var(--font-barlow-condensed), system-ui, sans-serif; }

/* ─── Toggle button ──────────────────────────────── */
.sm-scope .sm-toggle { background: transparent; border: none; cursor: pointer; color: var(--foreground, #f1ede5); font-size: 1rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.3rem; line-height: 1; font-family: var(--font-barlow-condensed), system-ui, sans-serif; letter-spacing: 0.05em; text-transform: uppercase; }
.sm-scope .sm-toggle-textWrap { position: relative; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; margin-right: 0.4em; }
.sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
.sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }

/* ─── Icon ───────────────────────────────────────── */
.sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform; }

/* ─── Responsive: mobile-only ────────────────────── */
/* On md+ screens the StaggeredMenu is completely hidden — Navbar takes over */
@media (min-width: 768px) { .sm-scope { display: none !important; } }
@media (max-width: 767px) { .sm-scope .sm-panel, .sm-scope .sm-prelayers { width: 100%; border-left: none; } }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
