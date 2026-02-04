import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'dark' | 'light';
    language: 'pt' | 'en';
    setTheme: (theme: 'dark' | 'light') => void;
    setLanguage: (lang: 'pt' | 'en') => void;
    toggleTheme: () => void;
    toggleLanguage: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'dark', // Default to dark for "Liquid Glass" vibe
            language: 'pt', // Default to Portuguese as requested
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
            toggleLanguage: () => set((state) => ({ language: state.language === 'pt' ? 'en' : 'pt' })),
        }),
        {
            name: 'viccs-ui-storage',
        }
    )
);
