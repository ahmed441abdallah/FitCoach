"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

/**
 * Offline-first read cache hook.
 *
 * On mount:
 *  1. Reads `cacheKey` from localStorage and immediately hydrates `data`
 *     so the UI never shows a blank screen while the network is cold.
 *  2. Fires a background GET to `url`.
 *     - success  → updates data + refreshes localStorage cache.
 *     - 404      → clears cache + sets data to null.
 *     - network  → sets offline flag, keeps cached data intact.
 *
 * SSR-safe: all localStorage access is inside useEffect only.
 */
export function useCachedFetch<T>(
  url: string,
  cacheKey: string
): { data: T | null; loading: boolean; offline: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // ── 1. Hydrate from cache immediately ──────────────────────────────────
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        if (!cancelled) {
          setData(parsed);
          setLoading(false);
        }
      }
    } catch {
      // Corrupt cache entry – ignore and let the network fill it.
    }

    // ── 2. Background network refresh ──────────────────────────────────────
    axiosInstance
      .get<{ success: boolean; data: T }>(url, { withCredentials: true })
      .then((res) => {
        if (cancelled) return;
        if (res.data.success === true) {
          setData(res.data.data);
          setOffline(false);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
          } catch {
            // Storage quota exceeded or private-browsing restriction – ignore.
          }
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        // 404 → plan was deleted; clear stale cache
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          try {
            localStorage.removeItem(cacheKey);
          } catch {
            // ignore
          }
          setData(null);
          setOffline(false);
          return;
        }

        // Any other network / server error → show cached data + offline flag
        setOffline(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, cacheKey]);

  return { data, loading, offline };
}
