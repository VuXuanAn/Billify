"use client";

import React from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import { Github, Twitter, Mail, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language].footer;
  const commonT = translations[language].common;

  return (
    <footer className="w-full bg-white border-t border-stone-100 pt-16 pb-12 mt-auto font-sans">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
                <span className="text-white font-black text-xl">B</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-stone-900 uppercase">Billify</span>
            </Link>
            <p className="text-stone-500 font-medium leading-relaxed max-w-xs">
              {t.slogan}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-stone-900 hover:text-white transition-all">
                <Github size={18} />
              </a>
              <a href="mailto:contact@billify.com" className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-pink-50 hover:text-pink-600 transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">{t.product}</h4>
            <ul className="space-y-4">
              <li><Link href="/#features" className="text-stone-500 hover:text-stone-900 font-bold transition-colors">{t.features}</Link></li>
              <li><Link href="/#pricing" className="text-stone-500 hover:text-stone-900 font-bold transition-colors">{t.pricing}</Link></li>
              <li><Link href="/dashboard" className="text-stone-500 hover:text-stone-900 font-bold transition-colors">{commonT.dashboard}</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">{t.company}</h4>
            <ul className="space-y-4">
              <li><Link href="/#about" className="text-stone-500 hover:text-stone-900 font-bold transition-colors">{t.about}</Link></li>
              <li><Link href="/#contact" className="text-stone-500 hover:text-stone-900 font-bold transition-colors">{t.contact}</Link></li>
              <li><Link href="/terms" className="text-stone-500 hover:text-stone-900 font-bold transition-colors">{commonT.terms}</Link></li>
              <li><Link href="/#privacy" className="text-stone-500 hover:text-stone-900 font-bold transition-colors">{t.privacy}</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">{t.newsletter}</h4>
            <div className="space-y-4">
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                {language === 'vi'
                  ? "Nhận thông tin cập nhật mới nhất về các tính năng và ưu đãi."
                  : "Get the latest updates on features and offers."}
              </p>
              <div className="flex gap-2 p-1.5 bg-stone-50 rounded-2xl border border-stone-100 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Input
                  placeholder={t.newsletterPlaceholder}
                  className="bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-medium placeholder:text-stone-400 placeholder:font-normal"
                />
                <Button size="icon" className="bg-stone-900 hover:bg-stone-800 rounded-xl shrink-0">
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>


      </div>
    </footer>
  );
}
