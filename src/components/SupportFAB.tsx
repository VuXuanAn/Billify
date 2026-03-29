"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coffee } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export function SupportFAB() {
  const { language } = useLanguageStore();
  const t = translations[language].common;

  return (
    <div className="fixed bottom-6 right-6 z-[100] sm:bottom-8 sm:right-8 flex flex-col items-end gap-2">
      <motion.a
        href="https://ko-fi.com/vuxuanan14798"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 h-12 sm:h-14 bg-gradient-to-r from-[#FFDD00] via-[#FFE54C] to-[#FFDD00] bg-[length:200%_auto] hover:bg-right text-stone-900 rounded-full shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transition-all duration-500 group relative overflow-hidden ring-4 ring-white/70"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 w-full h-full">
            <div className="absolute w-8 h-full bg-white/50 skew-x-12 -left-12 group-hover:animate-[shine_1.5s_ease-out_infinite]" />
        </div>
        
        <Coffee strokeWidth={2.5} className="w-5 h-5 sm:w-6 sm:h-6 text-stone-900 fill-stone-900/10 rotate-0 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 relative z-10" />
        <span className="text-xs sm:text-sm font-black whitespace-nowrap uppercase tracking-widest relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">
          {t.supportOnKofi}
        </span>
      </motion.a>
    </div>
  );
}
