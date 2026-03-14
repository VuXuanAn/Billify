import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import GridPattern from "@/components/magicui/grid-pattern";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Billify - Chia Tiền Sòng Phẳng",
  description: "Ứng dụng chia hóa đơn chuyên nghiệp và sòng phẳng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${roboto.variable} ${roboto.className} antialiased min-h-screen bg-stone-50 text-stone-900 selection:bg-blue-500/20 relative overflow-x-hidden`}
      >
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] opacity-50"
        />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
