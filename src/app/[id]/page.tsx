"use client";

import React, { useState, useEffect } from "react";
import { BillTable } from "@/components/BillTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Save, Loader2, Check, AlertCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useBillStore } from "@/store/useBillStore";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { billService } from "@/lib/services/billService";

export default function GroupPage() {
  const { id } = useParams();
  const groupId = typeof id === "string" ? id : "";

  const { step, setStep, groupName, setGroupName, setupMembers, setSetupMembers, currentData, setCurrentData } = useBillStore();
  const [newMemberName, setNewMemberName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load data from Supabase if exists
  useEffect(() => {
    async function loadData() {
      if (!groupId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await billService.getBill(groupId);
        if (data) {
          setCurrentData(data);
          setGroupName(data.groupName);
          setSetupMembers(data.members.map(m => m.name));
          setStep("editor");
        }
      } catch (error) {
        console.error("Failed to load bill data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [groupId, setCurrentData, setGroupName, setSetupMembers, setStep]);

  // If we arrived here and the store says landing, automatically set step to setup
  useEffect(() => {
    if (step === "landing") {
      setStep("setup");
    }
  }, [step, setStep]);

  const handleSave = async () => {
    if (!groupId || !currentData) return;
    setSaveStatus("saving");
    try {
      await billService.saveBill(groupId, currentData);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  };

  const handleGoToView = () => {
    if (!currentData) {
      alert("Đang chuẩn bị dữ liệu, vui lòng thử lại sau!");
      return;
    }
    router.push(`/${groupId}/view`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-stone-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">
      <Header />
      <div className="flex-1 flex flex-col">
        {(step === "setup" || step === "landing") && (
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
                    onClick={() => router.push("/")}
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
              <div className="flex-1 max-w-2xl">
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Hóa đơn..."
                  className="text-2xl font-black text-stone-900 tracking-tight h-auto p-0 border-none bg-transparent focus-visible:ring-0 placeholder:text-stone-300 transition-all hover:bg-stone-100/50 rounded px-2 -ml-2"
                />
                <p className="text-sm text-stone-500 font-medium px-2 -ml-2">Quản lý và chia sẻ chi tiêu của nhóm</p>
              </div>
              <div className="flex flex-wrap gap-3">
                
                <Button
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className={`font-bold rounded-lg h-10 px-6 flex items-center gap-2 shadow-sm transition-all ${
                    saveStatus === "success" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : saveStatus === "error"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {saveStatus === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saveStatus === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : saveStatus === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saveStatus === "saving" ? "Đang lưu..." : saveStatus === "success" ? "Đã lưu!" : saveStatus === "error" ? "Lỗi!" : "Lưu"}
                </Button>

                <Button
                  onClick={handleGoToView}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-10 px-6 flex items-center gap-2 shadow-sm"
                >
                  <Eye className="h-4 w-4" /> Xem bản in & Chia sẻ
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
      <Footer />
    </div>
  );
}
