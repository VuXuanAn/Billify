"use client";

import React, { useEffect } from "react";
import { Eye, Save, Loader2, Check, AlertCircle, Activity, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useBillStore } from "@/store/useBillStore";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { v4 as uuidv4 } from 'uuid'; // Fallback for environments lacking crypto.randomUUID

export default function Home() {
  const { setStep } = useBillStore();
  const router = useRouter();

  // Reset step to landing when visiting root
  useEffect(() => {
    setStep("landing");
  }, [setStep]);

  const handleStart = () => {
    let id;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      id = uuidv4();
    }
    setStep("setup");
    router.push(`/${id}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">

      <Header />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 max-w-screen-2xl mx-auto w-full px-6 py-24 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-8 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-stone-900 leading-[1.1]">
              Chia tiền <span className="text-blue-600">sòng phẳng</span>, <br />
              giữ trọn niềm vui.
            </h1>
            <p className="text-lg md:text-xl text-stone-500 font-medium leading-relaxed">
              Billify là công cụ quản lý tài chính nhóm tối giản, giúp bạn theo dõi chi tiêu, chia sẻ hóa đơn và thanh toán nhanh chóng chỉ trong vài thao tác.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 text-lg shadow-sm"
              >
                Bắt đầu ngay
              </Button>
              <Button
                variant="outline"
                className="border-stone-200 text-stone-700 bg-white hover:bg-stone-50 font-bold h-14 px-8 text-lg"
              >
                Tìm hiểu thêm
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
 
        <section className="w-full bg-stone-50 border-t border-stone-200 py-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
          <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em]">Tại sao chọn Billify?</h2>
              <p className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">Mọi thứ bạn cần cho <br className="hidden md:block" /> việc quản lý tài chính nhóm.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Activity className="h-8 w-8 text-blue-600" />, 
                  title: "Chia tiền công bằng", 
                  desc: "Tự động tính toán chi phí chính xác đến từng xu cho mỗi thành viên dựa trên những gì họ thực sự tham gia.",
                  color: "bg-blue-100/50"
                },
                { 
                  icon: <Crown className="h-8 w-8 text-amber-500" />, 
                  title: "Vinh danh ủng hộ", 
                  desc: "Cho phép thành viên ủng hộ thêm vào quỹ chung, tự động khấu trừ giảm tiền cho cả nhóm một cách sòng phẳng.",
                  color: "bg-amber-100/50"
                },
                { 
                  icon: <div className="text-3xl font-black text-indigo-600">QR</div>, 
                  title: "Thanh toán 1-chạm", 
                  desc: "Tích hợp mã QR VietQR tự động giúp bạn nhận tiền nhanh chóng mà không cần sao chép số tài khoản.",
                  color: "bg-indigo-100/50"
                },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white border border-stone-200 p-10 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 border border-white shadow-sm transition-transform group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-stone-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-24 border-t border-stone-200">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-stone-900 tracking-tight">Câu hỏi thường gặp</h2>
              <p className="text-stone-500 font-medium max-w-2xl mx-auto">Mọi thắc mắc của bạn về việc sử dụng Billify.</p>
            </div>
            <div className="grid gap-6">
              {[
                {
                  q: "Billify có miễn phí không?",
                  a: "Có, Billify hoàn toàn miễn phí cho tất cả mọi người sử dụng. Không có bất kỳ khoản phí ẩn nào."
                },
                {
                  q: "Dữ liệu của tôi được lưu trữ ở đâu?",
                  a: "Dữ liệu hóa đơn của bạn được mã hóa trực tiếp trên URL chia sẻ, nghĩa là bạn hoàn toàn sở hữu và giữ liên kết đó. Chúng tôi không lưu trữ dữ liệu người dùng trên máy chủ (database) để đảm bảo tính riêng tư tối đa."
                },
                {
                  q: "Làm sao để chia sẻ hóa đơn cho bạn bè?",
                  a: "Sau khi tính toán xong, bạn chỉ cần bấm nút 'Xuất bản & Chia sẻ', sau đó gửi liên kết cho bạn bè. Họ có thể xem trực tiếp phân chia mà ko cần tải app."
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-2">
                  <h3 className="text-lg font-bold text-stone-900">{faq.q}</h3>
                  <p className="text-stone-600 font-medium leading-relaxed">{faq.a}</p>
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
