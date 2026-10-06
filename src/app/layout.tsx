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
import ChatbotWidget from "@/components/ChatbotWidget";

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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <StoreProvider>
            <CurtainProvider>
              {children}
              <ChatbotWidget />
            </CurtainProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
