import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    ],
    qualities: [75, 90],
  },
  // Prevent @react-pdf/renderer from being bundled server-side (it's client-only)
  serverExternalPackages: ["@react-pdf/renderer"],
  // Explicitly opt into Turbopack (Next.js 16 default) — silences the webpack warning
  turbopack: {},
};

export default withNextIntl(nextConfig);
