"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
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
    <div className="fixed bottom-6 right-6 z-[100] sm:bottom-8 sm:right-8">
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger>
            <motion.a
              href="https://ko-fi.com/vuxuanan14798"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white border border-rose-100 rounded-full shadow-lg shadow-rose-200/50 text-rose-600 hover:bg-rose-50 transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-500 opacity-0 group-hover:opacity-5 transition-opacity" />
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-rose-600 animate-pulse" />
            </motion.a>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-3 bg-stone-900 border-none text-white font-bold py-2 px-4 shadow-xl">
            <p>{t.supportOnKofi}!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
