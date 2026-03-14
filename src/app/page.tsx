"use client";

import React, { useState } from "react";
import { BillTable } from "@/components/BillTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { encodeBillData } from "@/lib/utils/share";
import { useBillStore } from "@/store/useBillStore";

export default function Home() {
  const { step, setStep, groupName, setGroupName, setupMembers, setSetupMembers, currentData, setCurrentData } = useBillStore();
  const [newMemberName, setNewMemberName] = useState("");
  const router = useRouter();

  const handleGoToView = () => {
    if (!currentData) {
      alert("Đang chuẩn bị dữ liệu, vui lòng thử lại sau!");
      return;
    }
    router.push(`/view`);
  };

  // Main Minimalist Wrapper
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">

      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-stone-900">
              Billify
            </h1>
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-stone-500 hover:text-stone-900 font-medium hidden sm:flex"
            >
              Tài liệu
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep("setup")}
              className="font-bold border-stone-200 text-stone-700 bg-white hover:bg-stone-50"
            >
              Mở hóa đơn
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {step === "landing" && (
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
                  onClick={() => setStep("setup")}
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
        )}

        {step === "landing" && (
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
        )}

        {step === "setup" && (
          <main className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-50 py-24">
            <div className="w-full max-w-md bg-white border border-stone-200 shadow-sm p-10 rounded-2xl space-y-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Tạo hóa đơn mới</h2>
                <p className="text-sm text-stone-500 font-medium">Đặt tên cho chuyến đi hoặc sự kiện của bạn để bắt đầu theo dõi chi tiêu.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Tên sự kiện</label>
                  <Input
                    autoFocus
                    value={groupName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
                    placeholder="Ví dụ: Du lịch Đà Lạt 2024..."
                    className="h-12 text-base font-medium rounded-lg border-stone-300 bg-white focus-visible:ring-blue-500 placeholder:text-stone-400"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter" && groupName) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Thành viên tham gia</label>

                  <div className="flex gap-2">
                    <Input
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Thêm tên thành viên..."
                      className="h-10 text-sm font-medium rounded-lg border-stone-300 focus-visible:ring-blue-500 placeholder:text-stone-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMemberName.trim()) {
                          e.preventDefault();
                          setSetupMembers([...setupMembers, newMemberName.trim()]);
                          setNewMemberName("");
                        }
                      }}
                    />
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        if (newMemberName.trim()) {
                          setSetupMembers([...setupMembers, newMemberName.trim()]);
                          setNewMemberName("");
                        }
                      }}
                      className="h-10 px-4 whitespace-nowrap font-bold"
                    >
                      Thêm
                    </Button>
                  </div>

                  {setupMembers.length > 0 && (
                    <div className="flex flex-wrap gap-4 py-2">
                      {setupMembers.map((member, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 w-14">
                          <div className="relative">
                            <div className="h-12 w-12 bg-blue-100 text-blue-700 border-2 border-white shadow-sm rounded-full flex items-center justify-center font-bold text-sm">
                              {member.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <button
                              onClick={() => setSetupMembers(setupMembers.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-[10px] hover:bg-red-200 transition-colors border-2 border-white"
                              title="Xóa thành viên"
                            >
                              &times;
                            </button>
                          </div>
                          <span className="text-[10px] font-bold text-stone-600 truncate w-full text-center">{member}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  disabled={!groupName || setupMembers.length === 0}
                  onClick={() => setStep("editor")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-12 text-base transition-colors"
                >
                  Tiếp tục
                </Button>
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setStep("landing")}
                    className="text-stone-400 text-sm font-medium hover:text-stone-900 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {step === "editor" && (
          <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 py-12 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">{groupName || "Hóa đơn"}</h1>
                <p className="text-sm text-stone-500 font-medium">Quản lý và chia sẻ chi tiêu của nhóm</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("setup")}
                  className="font-bold border-stone-200 text-stone-700 bg-white hover:bg-stone-50 h-10 px-4"
                >
                  Đổi tên
                </Button>
                <Button
                  onClick={handleGoToView}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-10 px-6 flex items-center gap-2 shadow-sm"
                >
                  <Eye className="h-4 w-4" /> Xuất bản & Chia sẻ
                </Button>
              </div>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
              <BillTable
                initialData={currentData || {
                  groupName: groupName,
                  members: setupMembers.map((name, idx) => ({ id: `m${idx + 1}`, name })),
                  items: [],
                  donations: [],
                  participation: {}
                }}
                onDataChange={setCurrentData}
              />
            </div>
          </main>
        )}
      </div>

      {!['editor'].includes(step) && step !== "setup" && (
        <footer className="w-full border-t border-stone-200 bg-white py-8 px-6 mt-auto">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm font-medium">© 2024 Billify.</p>
            <div className="flex gap-6">
              <a href="#" className="text-stone-500 text-sm font-medium hover:text-stone-900">Bảo mật</a>
              <a href="#" className="text-stone-500 text-sm font-medium hover:text-stone-900">Điều khoản</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
