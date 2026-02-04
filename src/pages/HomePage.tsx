import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { SkillsSection } from '@/components/SkillsSection';
import { WorksSection } from '@/components/WorksSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { FluidBackground } from '@/components/FluidBackground';

const Index = () => {
  return (
    <div className="min-h-screen text-foreground relative">
      <div className="fixed inset-0 z-[-1]">
        <FluidBackground />
      </div>
      <Navigation />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <WorksSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
