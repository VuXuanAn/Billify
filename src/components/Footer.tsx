export function Footer() {
  return (
    <footer className="w-full border-t border-stone-200 bg-white py-8 px-6 mt-auto">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-stone-500 text-sm font-medium">© 2024 Billify.</p>
        <div className="flex gap-6">
          <a href="#" className="text-stone-500 text-sm font-medium hover:text-stone-900">Bảo mật</a>
          <a href="#" className="text-stone-500 text-sm font-medium hover:text-stone-900">Điều khoản</a>
        </div>
      </div>
    </footer>
  );
}
