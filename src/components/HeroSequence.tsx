import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 80;
const IMAGES_BASE_PATH = "/hero-sequence/1_";

export function HeroSequence() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(false);
    const { scrollYProgress } = useScroll();

    // Map scroll (0 to 1) to frame index (0 to 79)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

    useEffect(() => {
        const loadImages = async () => {
            const imgPromises = Array.from({ length: FRAME_COUNT }, (_, i) => {
                const paddedIndex = i.toString().padStart(3, "0");
                const img = new Image();
                img.src = `${IMAGES_BASE_PATH}${paddedIndex}.jpg`;
                return new Promise<HTMLImageElement>((resolve) => {
                    img.onload = () => resolve(img);
                    img.onerror = () => {
                        // Fallback for missing frames? Just resolve to prevent blocking
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

    useEffect(() => {
        if (!loaded || !canvasRef.current || images.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw function
        const render = (index: number) => {
            const img = images[Math.round(index)];
            if (!img) return;

            // Calculate "cover" dimensions
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

        // Subscribe to scroll changes
        const unsubscribe = frameIndex.on("change", (latest) => {
            requestAnimationFrame(() => render(latest));
        });

        // Resize handler
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render(frameIndex.get());
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Set initial size

        return () => {
            unsubscribe();
            window.removeEventListener("resize", handleResize);
        };
    }, [loaded, images, frameIndex]);

    return (
        <div className="h-[300vh] relative">
            <div className="sticky top-0 w-full h-screen overflow-hidden bg-black">
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center text-white z-50">
                        Loading Experience...
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    className="block w-full h-full object-cover"
                />

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white z-20 pointer-events-none"
                >
                    <span className="text-xs font-medium uppercase tracking-widest opacity-80">Scroll to Explore</span>
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-2 bg-white rounded-full"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
