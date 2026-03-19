"use client";

import React, { useEffect } from "react";
import { Activity, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useBillStore } from "@/store/useBillStore";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function Home() {
  const { setStep } = useBillStore();
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].home;

  // Reset step to landing when visiting root
  useEffect(() => {
    setStep("landing");
  }, [setStep]);

  const handleStart = () => {
    router.push("/new");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">

      <Header />

      <div className="flex-1 flex flex-col overflow-x-hidden">
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-12 md:py-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          <div className="flex-1 space-y-8 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-stone-900 leading-[1.15] sm:leading-[1.1]">
              {t.hero.title1} <span className="text-blue-600">{t.hero.titleHighlight}</span>, <br className="hidden sm:block" />
              {t.hero.title2}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-stone-500 font-medium leading-relaxed max-w-xl">
              {t.hero.description}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-sm w-full sm:w-auto"
              >
                {t.hero.getStarted}
              </Button>
              <Button
                variant="outline"
                className="border-stone-200 text-stone-700 bg-white hover:bg-stone-50 font-bold h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
              >
                {t.hero.learnMore}
              </Button>
            </div>
          </div>

          {/* Abstract visual representation of a receipt/dashboard */}
          <div className="flex-1 w-full max-w-xl hidden lg:block">
            <div className="bg-white border border-stone-200 shadow-xl shadow-stone-200/50 rounded-2xl p-8 space-y-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <div className="h-4 w-32 bg-stone-100 rounded"></div>
                <div className="h-4 w-16 bg-blue-100 rounded"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-24 bg-stone-200 rounded"></div>
                        <div className="h-2 w-16 bg-stone-100 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-stone-800 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="h-5 w-24 bg-stone-200 rounded"></div>
                <div className="h-6 w-32 bg-blue-600 rounded"></div>
              </div>
            </div>
          </div>
        </main>
 
        <section className="w-full bg-stone-50 border-t border-stone-200 py-16 md:py-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center space-y-3 sm:space-y-4 mb-12 md:mb-20">
              <h2 className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-[0.2em] sm:tracking-[0.3em]">{t.features.sectionTitle}</h2>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">{t.features.sectionSubtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { 
                  icon: <Activity className="h-8 w-8 text-blue-600" />, 
                  title: t.features.feature1.title, 
                  desc: t.features.feature1.desc,
                  color: "bg-blue-100/50"
                },
                { 
                  icon: <Crown className="h-8 w-8 text-amber-500" />, 
                  title: t.features.feature2.title, 
                  desc: t.features.feature2.desc,
                  color: "bg-amber-100/50"
                },
                { 
                  icon: <div className="text-3xl font-black text-indigo-600">QR</div>, 
                  title: t.features.feature3.title, 
                  desc: t.features.feature3.desc,
                  color: "bg-indigo-100/50"
                },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white border border-stone-200 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 border border-white shadow-sm transition-transform group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 mb-3 sm:mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-stone-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-16 md:py-24 border-t border-stone-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 md:space-y-12">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">{t.faq.title}</h2>
              <p className="text-sm sm:text-base text-stone-500 font-medium max-w-2xl mx-auto">{t.faq.subtitle}</p>
            </div>
            <div className="grid gap-6">
              {[
                {
                  q: t.faq.q1,
                  a: t.faq.a1
                },
                {
                  q: t.faq.q2,
                  a: t.faq.a2
                },
                {
                  q: t.faq.q3,
                  a: t.faq.a3
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-5 sm:p-6 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">{faq.q}</h3>
                  <p className="text-sm sm:text-base text-stone-600 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
