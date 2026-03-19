"use client";

import React from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 w-9 border border-stone-200 flex items-center justify-center rounded-xl hover:bg-stone-50 transition-all active:scale-95 group shadow-sm bg-white">
        <Globe className="h-4 w-4 text-stone-500 group-hover:text-stone-700 transition-colors" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage("vi")}
          className={language === "vi" ? "bg-stone-100 font-bold" : ""}
        >
          Tiếng Việt (VI)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={language === "en" ? "bg-stone-100 font-bold" : ""}
        >
          English (EN)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
