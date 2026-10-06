import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FitCoach — Authentication",
  description: "Sign in or create a new FitCoach account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No <html> or <body> here — only the root layout.tsx can define those.
  // The root layout already applies the dark class, Barlow Condensed font,
  // and bg-background / text-foreground.
  return <>{children}</>;
}
