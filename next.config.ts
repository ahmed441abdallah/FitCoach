import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF first (smallest), then WebP, then the browser's native format.
    // Next.js negotiates via Accept header — no code changes needed in <Image>.
    formats: ["image/avif", "image/webp"],

    // Match the real breakpoints used in the design to avoid generating
    // unnecessary intermediate sizes.
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 64, 128, 256],

    // Cache optimised images on the CDN / Edge for 7 days.
    // Default is 60 s which causes redundant re-optimisation on Render's free tier.
    minimumCacheTTL: 604800, // 7 days

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Progress photos, payment proofs, and PDF thumbnails are served from Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    qualities: [75, 90],
  },
  // Prevent @react-pdf/renderer from being bundled server-side (it's client-only)
  serverExternalPackages: ["@react-pdf/renderer"],
  // Explicitly opt into Turbopack (Next.js 16 default) — silences the webpack warning
  turbopack: {},
};

export default withNextIntl(nextConfig);

