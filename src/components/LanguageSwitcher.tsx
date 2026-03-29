"use client";

import React from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="h-9 px-3 border border-stone-200 flex items-center justify-center gap-2 rounded-xl hover:bg-stone-50 transition-all active:scale-95 group shadow-sm bg-white"
      title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Globe className="h-4 w-4 text-stone-500 group-hover:text-stone-700 transition-colors" />
      <span className="text-xs font-bold text-stone-600 group-hover:text-stone-800">
        {language === "vi" ? "VI" : "EN"}
      </span>
    </button>
  );
}
