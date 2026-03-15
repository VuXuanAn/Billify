export function Footer() {
  return (
    <footer className="w-full bg-stone-50 border-t border-stone-200 py-6 sm:py-8 mt-auto">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs sm:text-sm text-stone-400 font-medium">© 2026 Billify. Built for fair sharing.</p>
        <div className="flex gap-4 sm:gap-6">
          <a href="#" className="text-xs sm:text-sm text-stone-400 hover:text-stone-600 font-bold transition-colors">Twitter</a>
          <a href="#" className="text-xs sm:text-sm text-stone-400 hover:text-stone-600 font-bold transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
