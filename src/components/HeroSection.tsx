import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Mail, Phone, Download, ArrowDown } from 'lucide-react';

const FRAME_COUNT = 80;
const IMAGES_BASE_PATH = "/hero-sequence/1_";

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Track scroll progress within this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll to frame index
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // Opacity for content - fade out as we scroll down
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const imgPromises = Array.from({ length: FRAME_COUNT }, (_, i) => {
        const paddedIndex = i.toString().padStart(3, "0");
        const img = new Image();
        img.src = `${IMAGES_BASE_PATH}${paddedIndex}.jpg`;
        return new Promise<HTMLImageElement>((resolve) => {
          img.onload = () => resolve(img);
          img.onerror = () => {
            console.warn(`Failed to load frame ${i}`);
            resolve(img);
          }
        });
      });

      const loadedImages = await Promise.all(imgPromises);
      setImages(loadedImages);
      setLoaded(true);
    };

    loadImages();
  }, []);

  // Render canvas
  useEffect(() => {
    if (!loaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false }); // Optimize
    if (!ctx) return;

    const render = (index: number) => {
      const img = images[Math.round(index)];
      if (!img) return;

      // "Cover" fit logic
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Initial render
    render(frameIndex.get());

    // Sync with Framer Motion value
    const unsubscribe = frameIndex.on("change", (latest) => {
      requestAnimationFrame(() => render(latest));
    });

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(frameIndex.get());
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [loaded, images, frameIndex]);

  return (
    <section ref={containerRef} id="home" className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">

        {/* Canvas Background */}
        <div className="absolute inset-0 z-0">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <span className="text-white/50 animate-pulse">Loading Experience...</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="block w-full h-full object-cover"
          />
          {/* Dark Overlay to make text pop */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content Overlay */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 container mx-auto px-6 h-full flex flex-col items-center justify-center pt-20"
        >
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                className="inline-block text-sm font-medium tracking-[0.3em] text-white/80 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                OLÁ! EU SOU
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 text-white drop-shadow-2xl"
            >
              Paulo Vinicios
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-4 font-light drop-shadow-md"
            >
              Designer Gráfico & Eterno Estudante da Arte Audiovisual
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">3D Art</span>
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">Motion</span>
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">Graphic Design</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.a
                href="mailto:pauloviccsdesign@gmail.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all border border-white/20 text-white"
              >
                <Mail size={18} />
                Email
              </motion.a>
              <motion.a
                href="tel:+5575998432564"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all border border-white/20 text-white"
              >
                <Phone size={18} />
                (75) 99843-2564
              </motion.a>
              <motion.a
                href="https://drive.google.com/file/d/1avGZTtsUWcTlgkrU7ggvvKiSakRco8ms/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsla(180, 70%, 50%, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-2xl flex items-center gap-2 font-medium text-white shadow-lg"
              >
                <Download size={18} />
                Baixar CV
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/70"
          >
            <span className="text-xs tracking-widest">SCROLL</span>
            <ArrowDown size={16} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
