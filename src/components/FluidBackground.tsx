import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function FluidBackground() {
    const mouseX = useMotionValue(0.5); // Start center
    const mouseY = useMotionValue(0.5);

    const springConfig = { damping: 30, stiffness: 50, mass: 2 }; // Heavier feel for "liquid"
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    // Parallax & Thermal Shift
    // Blobs move opposite to mouse (parallax) and slightly shift color/scale
    const blob1X = useTransform(x, [0, 1], [-50, 50]);
    const blob1Y = useTransform(y, [0, 1], [-50, 50]);

    const blob2X = useTransform(x, [0, 1], [50, -50]);
    const blob2Y = useTransform(y, [0, 1], [50, -50]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const normalizedX = e.clientX / window.innerWidth;
            const normalizedY = e.clientY / window.innerHeight;
            mouseX.set(normalizedX);
            mouseY.set(normalizedY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 bg-black overflow-hidden pointer-events-none transition-colors duration-700">
            {/* Primary Thermal Blob (Warm/Accent) */}
            <motion.div
                style={{ x: blob1X, y: blob1Y }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.4, 0.3], // Boosted from 0.15
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                // Brighter colors (500/600) so mix-blend-screen works, but moderate opacity
                className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-[150px] mix-blend-screen filter hue-rotate-0"
            />

            {/* Secondary Thermal Blob (Cool/Blue) */}
            <motion.div
                style={{ x: blob2X, y: blob2Y }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3], // Boosted from 0.1
                    rotate: [0, -90, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                // Brighter colors (Blue/Cyan/Teal)
                className="absolute bottom-[-20%] right-[-10%] w-[90vw] h-[90vw] bg-gradient-to-tl from-blue-600/30 via-cyan-500/30 to-teal-400/30 rounded-full blur-[150px] mix-blend-screen filter hue-rotate-90"
            />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay brightness-150 contrast-150"></div>
        </div>
    );
}
