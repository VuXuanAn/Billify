"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useBillStore } from "@/store/useBillStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';

export function Header() {
  const { setStep } = useBillStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenBill = () => {
    let id;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      id = uuidv4();
    }
    setStep("setup");
    router.push(`/${id}`);
  };

  const handleLogoClick = () => {
    if (pathname !== "/") {
      router.push("/");
    }
    setStep("landing");
  };

  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-stone-900">
            Billify
          </h1>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleOpenBill}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 shadow-sm"
          >
            Bắt đầu ngay
          </Button>
        </div>
      </div>
    </header>
  );
}
