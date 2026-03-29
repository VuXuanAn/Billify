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
              <a href="mailto:vuxuanan14798@gmail.com?subject=Billify Feedback" className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-pink-50 hover:text-pink-600 transition-all" title="Góp ý cho Billify">
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

          {/* Feedback Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">
              {language === 'vi' ? 'Góp ý' : 'Feedback'}
            </h4>
            <div className="space-y-4">
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                {language === 'vi'
                  ? "Billify đang trải qua bản thử nghiệm, vì thế rất mong nhận được những góp ý để dịch vụ ngày càng hoàn thiện hơn."
                  : "Billify is in beta. We'd love to hear your thoughts so we can improve the service."}
              </p>
              <Link href="/feedback" className="inline-block group">
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white text-stone-600 hover:text-stone-900 font-bold text-sm transition-all hover:shadow-sm">
                  <Mail className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
                  <span>{language === 'vi' ? 'Viết Góp Ý' : 'Write Feedback'}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-3 group-hover:opacity-100 group-hover:translate-x-1 group-hover:ml-0 transition-all duration-300 text-stone-400 group-hover:text-stone-900" />
                </div>
              </Link>
            </div>
          </div>
        </div>


      </div>
    </footer>
  );
}
