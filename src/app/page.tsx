import { Navbar, Footer } from "@/components/layout";
import StaggeredMenu from "@/components/layout/StaggeredMenu";
import CoachingPlans from "@/components/sections/CoachingPlans";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { Faq } from "@/components/sections/Faq";
import HeroSection from "@/components/sections/HeroSection";
import CtaSection from "@/components/sections/CtaSection";
import { StatsSection } from "@/components/sections/StatsSection";
import Results from "@/components/sections/Results";
import Testimonial from "@/components/sections/Testimonial";
import Process from "@/components/sections/Process";
import { getFitcoachApiUrl } from "@/lib/server-config";

/**
 * Fetch packages at build / revalidate time (ISR 300 s).
 * This eliminates the client-side loading skeleton for the pricing section —
 * the data is baked into the HTML on first paint.
 */
async function fetchPackages(): Promise<unknown[]> {
  try {
    const res = await fetch(`${getFitcoachApiUrl()}/api/v1/package`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const initialPackages = await fetchPackages();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop nav — visible on md+ */}
      <Navbar />
      {/* Mobile nav — visible below md, hidden on desktop via CSS */}
      <StaggeredMenu />

      <HeroSection />
      <Process />
      <StatsSection />
      <FeaturesSection />
      <Results />
      <Testimonial />
      {/* Pass server-prefetched data; CoachingPlans will hydrate Redux from it */}
      <CoachingPlans initialPackages={initialPackages} />
      <Faq />
      <CtaSection />


      <Footer />
    </div>
  );
}
