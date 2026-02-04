import { useUIStore } from "../store/uiStore";
import { motion } from "framer-motion";

export function SystemToggles() {
    const { theme, toggleTheme, language, toggleLanguage } = useUIStore();

    return (
        <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="font-mono text-xs font-bold px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
                {language.toUpperCase()}
            </button>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition relative overflow-hidden"
                aria-label="Toggle Theme"
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.5 }}
                >
                    {theme === 'dark' ? (
                        // Moon Icon
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    ) : (
                        // Sun Icon
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    )}
                </motion.div>
            </button>
        </div>
    );
}
