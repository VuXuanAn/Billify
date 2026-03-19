import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language].common;

  return (
    <footer className="w-full bg-stone-50 border-t border-stone-200 py-6 sm:py-8 mt-auto">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs sm:text-sm text-stone-400 font-medium">{t.copyright}</p>
        <div className="flex gap-4 sm:gap-6">
          <a href="/terms" className="text-xs sm:text-sm text-stone-400 hover:text-stone-600 font-bold transition-colors">{t.terms}</a>
          <a href="https://ko-fi.com/vuxuanan14798" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-bold transition-colors">{t.supportOnKofi}</a>
          <a href="#" className="text-xs sm:text-sm text-stone-400 hover:text-stone-600 font-bold transition-colors">Twitter</a>
          <a href="#" className="text-xs sm:text-sm text-stone-400 hover:text-stone-600 font-bold transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
