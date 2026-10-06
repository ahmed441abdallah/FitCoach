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

export default function Home() {
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
      <CoachingPlans />
      <Faq />
      <CtaSection />


      <Footer />
    </div>
  );
}
