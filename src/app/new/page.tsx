"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { billService } from "@/lib/services/billService";
import { useAuthStore } from "@/store/useAuthStore";
import { useBillStore } from "@/store/useBillStore";

export default function NewBillPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setGroupName, setSetupMembers } = useBillStore();
  
  const [groupName, setGroupNameLocal] = useState("");
  const [setupMembers, setSetupMembersLocal] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!groupName || setupMembers.length === 0) return;
    
    setIsCreating(true);
    
    // 1. Generate local UUID
    const id = crypto.randomUUID();
    
    // 2. Set the global store state to pass to the editor
    setGroupName(groupName);
    setSetupMembers(setupMembers);
    
    // 3. Navigate to the editor
    router.push(`/${id}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">
      <Header />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-50 py-24">
          <div className="w-full max-w-md bg-white border border-stone-200 shadow-sm p-10 rounded-2xl space-y-8">
            <div className="space-y-3 text-center sm:text-left">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">Thiết lập hóa đơn mới</h2>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">Đặt tên cho chuyến đi hoặc sự kiện của bạn để bắt đầu theo dõi chi tiêu.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Tên sự kiện</label>
                <Input
                  autoFocus
                  disabled={isCreating}
                  value={groupName}
                  onChange={(e) => setGroupNameLocal(e.target.value)}
                  placeholder="Ví dụ: Du lịch Đà Lạt 2024..."
                  className="h-12 text-base font-medium rounded-lg border-stone-300 bg-white focus-visible:ring-blue-500 placeholder:text-stone-400"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Thành viên tham gia</label>
                
                <div className="flex gap-2">
                  <Input
                    disabled={isCreating}
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Thêm tên thành viên..."
                    className="h-10 text-sm font-medium rounded-lg border-stone-300 focus-visible:ring-blue-500 placeholder:text-stone-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMemberName.trim()) {
                        e.preventDefault();
                        setSetupMembersLocal([...setupMembers, newMemberName.trim()]);
                        setNewMemberName("");
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={isCreating || !newMemberName.trim()}
                    onClick={() => {
                      if (newMemberName.trim()) {
                        setSetupMembersLocal([...setupMembers, newMemberName.trim()]);
                        setNewMemberName("");
                      }
                    }}
                    className="h-10 px-4 whitespace-nowrap font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border-none shadow-none"
                  >
                    Thêm
                  </Button>
                </div>

                {setupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-4 py-2 mt-2">
                    {setupMembers.map((member, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 w-14 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                          <div className="h-12 w-12 bg-blue-50 text-blue-700 border-2 border-white shadow-sm rounded-full flex items-center justify-center font-bold text-sm">
                            {member.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          {!isCreating && (
                            <button
                              onClick={() => setSetupMembersLocal(setupMembers.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-[10px] hover:bg-red-200 transition-colors border-2 border-white shadow-sm"
                              title="Xóa thành viên"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-stone-600 truncate w-full text-center">{member}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  disabled={isCreating || !groupName || setupMembers.length === 0}
                  onClick={handleCreate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-12 text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang tạo hóa đơn...
                    </>
                  ) : (
                    "Tiếp tục"
                  )}
                </Button>
                <div className="text-center">
                  <button
                    disabled={isCreating}
                    onClick={() => router.push("/")}
                    className="text-stone-400 text-sm font-medium hover:text-stone-900 transition-colors disabled:opacity-30"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
