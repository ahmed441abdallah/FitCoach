import { NextResponse } from "next/server";
import { getFitcoachApiUrl } from "@/lib/server-config";

/**
 * Dedicated cached route for the public /api/v1/package endpoint.
 *
 * Unlike the catch-all proxy (which forces cache:"no-store"), this handler
 * asks Next.js to revalidate the upstream response every 5 minutes (300 s).
 * The packages list is public, rarely changes, and is the first data the
 * homepage needs — serving it from the CDN/ISR cache eliminates the round-trip
 * to the cold-started Render server for every visitor.
 *
 * This file takes precedence over the [[...path]] catch-all because Next.js
 * always prefers more-specific routes.
 */
export const revalidate = 300; // ISR: re-fetch at most every 5 min
export const dynamic = "force-static"; // allow full static/edge caching

export async function GET() {
  const apiUrl = `${getFitcoachApiUrl()}/api/v1/package`;

  const upstream = await fetch(apiUrl, {
    next: { revalidate: 300 },
    headers: { "Content-Type": "application/json" },
  });

  const data = await upstream.json();

  return NextResponse.json(data, {
    status: upstream.status,
    headers: {
      // Allow CDN / browser to cache for 5 min, serve stale for up to 10 min
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
