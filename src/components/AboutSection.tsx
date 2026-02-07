import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { supabase } from '../supabaseClient';
import type { SiteSettings } from '../types/supabase';

const ProfileCard = ({ imageUrl }: { imageUrl: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const prismBg = useTransform(mouseX, [-0.5, 0.5], ["0% 50%", "100% 50%"]);

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-pointer"
    >
      {/* Glow behind */}
      <motion.div
        style={{ rotateX, rotateY, z: -50 }}
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-primary/40 via-secondary/40 to-accent/40 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Card Container */}
      <div className="relative glass rounded-[2rem] p-2 overflow-hidden border border-white/10 shadow-2xl">
        <div className="aspect-square rounded-[1.5rem] overflow-hidden relative z-10 bg-black">
          <img
            src={imageUrl}
            alt="Paulo Vinicios"
            className="w-full h-full object-cover"
          />

          {/* Prismatic Overlay */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none mix-blend-color-dodge"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.8) 45%, rgba(255,0,128,0.5) 50%, rgba(0,255,255,0.5) 55%, transparent 60%)",
              backgroundSize: "200% 200%",
              backgroundPosition: prismBg
            }}
          />

          {/* Surface Shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};

export const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Dynamic data from Supabase
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [projectsCount, setProjectsCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch site settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .single();

        if (settingsError) {
          console.error('Settings fetch error:', settingsError);
        } else if (isMounted) {
          setSettings(settingsData);
        }

        // Count projects
        const { count: projCount, error: projError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        if (projError) {
          console.error('Projects count error:', projError);
        } else if (isMounted) {
          setProjectsCount(projCount || 0);
        }

        // Count skills (as "Ferramentas")
        const { count: skillCount, error: skillError } = await supabase
          .from('skills')
          .select('*', { count: 'exact', head: true });

        if (skillError) {
          console.error('Skills count error:', skillError);
        } else if (isMounted) {
          setSkillsCount(skillCount || 0);
        }
      } catch (err) {
        console.error('AboutSection fetch error:', err);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fallback values - use placeholder if no profile image configured
  const imageUrl = settings?.profile_image_url || "/placeholder.svg";
  const bioText = settings?.bio_text || "Apaixonado por criação, trabalhei de forma informal desde os meus 12 anos...";
  const yearsExp = settings?.years_experience || 15;

  return (
    <section id="sobre" className="py-20 relative overflow-hidden">
      {/* Background Orb */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20"
      >
        <div className="w-full h-full rounded-full border border-primary/20" />
        <div className="absolute inset-8 rounded-full border border-secondary/20" />
        <div className="absolute inset-16 rounded-full border border-accent/20" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Profile Image with 3D Prism Effect */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative perspective-1000"
            >
              <ProfileCard imageUrl={imageUrl} />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-sm font-medium tracking-[0.3em] text-primary mb-4 block">SOBRE MIM</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Paulo Vinicios
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-6" />

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {bioText}
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass px-6 py-4 rounded-2xl text-center"
                >
                  <div className="text-3xl font-bold text-gradient">{yearsExp}+</div>
                  <div className="text-sm text-muted-foreground">Anos de Experiência</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass px-6 py-4 rounded-2xl text-center"
                >
                  <div className="text-3xl font-bold text-gradient">{projectsCount}+</div>
                  <div className="text-sm text-muted-foreground">Projetos Completos</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass px-6 py-4 rounded-2xl text-center"
                >
                  <div className="text-3xl font-bold text-gradient">{skillsCount}+</div>
                  <div className="text-sm text-muted-foreground">Ferramentas</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
