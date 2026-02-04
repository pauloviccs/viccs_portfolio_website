import type { ReactNode } from "react";
import { useEffect } from "react";
import { FluidBackground } from "../components/FluidBackground";
import { useUIStore } from "../store/uiStore";
import { SystemToggles } from "../components/SystemToggles";
import { pt } from "../i18n/pt";
import { en } from "../i18n/en";

interface LiquidLayoutProps {
    children: ReactNode;
}

export function LiquidLayout({ children }: LiquidLayoutProps) {
    const { theme, language } = useUIStore();
    const t = language === 'pt' ? pt : en;

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <div className={`min-h-screen relative font-sans selection:bg-accent selection:text-black ${theme === 'dark' ? 'text-primary-foreground' : 'text-black bg-white'}`}>
            <FluidBackground />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center mix-blend-difference text-white">
                <div className="text-2xl font-display font-bold">VICCS</div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex gap-6 text-sm font-medium">
                        <a href="#about" className="hover:text-accent transition">{t.nav.about}</a>
                        <a href="#projects" className="hover:text-accent transition">{t.nav.works}</a>
                        <a href="#contact" className="hover:text-accent transition">{t.nav.contact}</a>
                    </div>
                    <SystemToggles />
                </div>
            </nav>

            <main>
                {children}
            </main>
        </div>
    );
}
