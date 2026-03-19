"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ShieldCheck, Scale, Database, Clock } from "lucide-react";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function TermsPage() {
  const { language } = useLanguageStore();
  const t = translations[language].terms;
  const commonT = translations[language].common;

  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Scale className="w-6 h-6" />;
      case 1: return <Database className="w-6 h-6" />;
      case 2: return <ShieldCheck className="w-6 h-6" />;
      case 3: return <Clock className="w-6 h-6" />;
      default: return <Scale className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-blue-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {commonT.backToHome}
        </Link>

        <div className="space-y-4 mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-stone-900 leading-tight">
            {t.title}
          </h1>
          <p className="text-stone-500 font-medium">{t.lastUpdated}</p>
        </div>

        <div className="space-y-12 bg-white border border-stone-200 rounded-3xl p-8 md:p-12 shadow-sm">
          {t.sections.map((section, index) => (
            <section key={index} className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                {getIcon(index)}
                <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
              </div>
              <p className="text-stone-600 leading-relaxed font-medium">
                {section.content}
              </p>
              {section.list && (
                <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4 font-medium">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="pt-8 border-t border-stone-100">
            <p className="text-sm text-stone-400 italic">
              {t.footer}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
