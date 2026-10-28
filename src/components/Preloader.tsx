"use client";

import { useEffect } from "react";
import gsap from "gsap";

/**
 * Client-side animator for the server-rendered preloader (#fc-preloader).
 *
 * The HTML is rendered in layout.tsx (server component) so it's visible
 * from the very first byte — no flash of content underneath.
 *
 * An inline <script> in layout.tsx hides it instantly for returning sessions
 * (sessionStorage check). This component only runs the GSAP entrance animation
 * on the first visit and then removes the overlay.
 */
export default function Preloader() {
  useEffect(() => {
    const overlay = document.getElementById("fc-preloader");
    if (!overlay) return;

    // Already hidden by the inline script (returning session) → clean up
    if (overlay.style.display === "none") {
      overlay.style.display = "none";
      // Content should already be visible via the inline script,
      // but ensure it in case the script ran before the element existed
      const content = document.getElementById("fc-content");
      if (content) content.style.opacity = "1";
      return;
    }

    const logo = document.getElementById("fc-preloader-logo");
    const bar = document.getElementById("fc-preloader-bar");
    const percentEl = document.getElementById("fc-preloader-percent");

    if (!logo || !bar || !percentEl) return;

    // Lock scroll while the preloader is active
    document.body.style.overflow = "hidden";

    const counter = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out preloader, then reveal content
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            document.body.style.overflow = "";
            overlay.style.display = "none";
            sessionStorage.setItem("fc_preloaded", "1");

            // Reveal the page content
            const content = document.getElementById("fc-content");
            if (content) {
              gsap.to(content, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
              });
            }
          },
        });
      },
    });

    // Animate logo in
    tl.fromTo(
      logo,
      { opacity: 0, y: 24, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
    )
      // Count 0 → 100 while filling the bar
      .to(
        counter,
        {
          val: 100,
          duration: 2.5,
          ease: "power2.inOut",
          onUpdate() {
            const v = Math.round(counter.val);
            percentEl.textContent = `${v}%`;
            bar.style.width = `${v}%`;
          },
        },
        "-=0.1"
      );

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  // No JSX — the HTML lives in layout.tsx (server-rendered)
  return null;
}
