import { motion, useScroll, useSpring } from "framer-motion";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import StatsSection from "../components/landing/StatsSection";
import AIModulesSection from "../components/landing/AIModulesSection";
import CollaborationSection from "../components/landing/CollaborationSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 origin-left"
      />

      <LandingNavbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <AIModulesSection />
        <CollaborationSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
