import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type Language = 'vi' | 'en';

interface UiState {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'vi',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        set({ theme: current === 'light' ? 'dark' : 'light' });
      },
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'admin-ui-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

