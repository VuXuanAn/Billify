import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "vi" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "vi",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "billify-language",
    }
  )
);
