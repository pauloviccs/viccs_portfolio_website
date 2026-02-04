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
                    <button
                        onClick={async () => {
                            const { supabase } = await import('../supabaseClient');
                            await supabase.auth.signOut();
                            window.location.href = '/';
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-red-400"
                        title="Sair"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </nav>

            <main>
                {children}
            </main>
        </div>
    );
}
