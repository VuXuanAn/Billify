"use client";

import React, { useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { language } = useLanguageStore();
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error(language === 'vi' ? "Vui lòng nhập nội dung góp ý" : "Please enter your feedback");
      return;
    }
    
    const subject = encodeURIComponent("Billify Beta Feedback");
    const body = encodeURIComponent(`Email liên hệ: ${email || 'Không cung cấp'}\n\nNội dung góp ý:\n${content}`);
    window.location.href = `mailto:vuxuanan14798@gmail.com?subject=${subject}&body=${body}`;
    
    toast.success(language === 'vi' ? "Đã mở hộp thư để gửi email góp ý!" : "Opened mail client to send feedback!");
    setContent("");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 sm:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'vi' ? "Quay lại trang chủ" : "Back to Home"}
        </Link>

        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-3">
              {language === 'vi' ? "Góp ý & Báo lỗi" : "Feedback & Bug Report"}
            </h1>
            <p className="text-stone-500 leading-relaxed font-medium">
              {language === 'vi' 
                ? "Billify hiện đang trong quá trình thử nghiệm. Những đóng góp của bạn sẽ giúp chúng tôi phát triển sản phẩm tốt hơn mỗi ngày." 
                : "Billify is currently in beta. Your contributions help us build a better product every day."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-stone-900">
                {language === 'vi' ? "Email của bạn (Không bắt buộc)" : "Your Email (Optional)"}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'vi' ? "name@example.com" : "name@example.com"}
                className="h-12 bg-stone-50 border-stone-200 focus-visible:ring-indigo-500 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-bold text-stone-900">
                {language === 'vi' ? "Nội dung góp ý" : "Feedback Content"} <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={language === 'vi' ? "Hãy mô tả chi tiết góp ý hoặc lỗi bạn gặp phải..." : "Please describe your feedback or the bug you encountered..."}
                className="min-h-[160px] resize-y bg-stone-50 border-stone-200 focus-visible:ring-indigo-500 rounded-xl p-4 font-medium"
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base shadow-lg shadow-indigo-600/30 transition-all">
              <Send className="w-5 h-5 mr-2" />
              {language === 'vi' ? "Gửi Góp Ý" : "Send Feedback"}
            </Button>
            
            <p className="text-xs text-center text-stone-400 font-medium mt-4">
              {language === 'vi' 
                ? "Trình duyệt sẽ tự động mở ứng dụng email của bạn để chuyển phản hồi." 
                : "Your browser will automatically open your email client to forward the feedback."}
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
