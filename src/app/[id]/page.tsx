"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BillTable } from "@/components/BillTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Save, Loader2, Check, AlertCircle, Trash2, Lock, Unlock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter, useParams } from "next/navigation";
import { useBillStore } from "@/store/useBillStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { billService } from "@/lib/services/billService";

export default function GroupPage() {
  const { id } = useParams();
  const groupId = typeof id === "string" ? id : "";

  const { groupName, setGroupName, setupMembers, setSetupMembers, currentData, setCurrentData } = useBillStore();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  // Load data from Supabase if exists
  useEffect(() => {
    async function loadData() {
      if (!groupId || groupId === "dashboard" || groupId === "register") {
        setIsLoading(false);
        return;
      }
      try {
        const data = await billService.getBill(groupId);
        if (data) {
          setGroupName(data.groupName);
          setIsPrivate(data.isPrivate || false);
          setCurrentData(data);
          
          // Ownership Check
          const isOwner = data.userId === user?.id;
          const isPublic = !data.isPrivate;
          setCanEdit(isPublic || isOwner);
        } else {
          // Data is null - check if we have it in the local store (newly created FE-only)
          if (groupName && setupMembers.length > 0) {
            // Initialize empty data for a brand new bill
            const initialData = {
              groupName: groupName,
              members: setupMembers.map((name, idx) => ({ id: `m${idx + 1}`, name })),
              items: [],
              donations: [],
              participation: {},
              isPrivate: false
            };
            setCurrentData(initialData);
            setCanEdit(true);
          } else {
            // Truly missing or restricted
            setCanEdit(false);
          }
        }
      } catch (error) {
        console.error("Failed to load bill data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [groupId, setCurrentData, setGroupName, user?.id]);




  const handleSave = async () => {
    if (!groupId || !currentData) return;
    setSaveStatus("saving");
    try {
      await billService.saveBill(groupId, { ...currentData, isPrivate }, user?.id);
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
  
  const handleDataChange = useCallback((newData: any) => {
    setCurrentData({ ...newData, isPrivate });
  }, [isPrivate, setCurrentData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-stone-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-stone-50">
          <div className="text-center space-y-6 max-w-md bg-white p-10 rounded-2xl border border-stone-200 shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-stone-900">Truy cập bị từ chối</h1>
              <p className="text-stone-500 font-medium leading-relaxed">
                Hóa đơn này ở chế độ riêng tư. Bạn không có quyền chỉnh sửa nội dung này.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <Button 
                onClick={handleGoToView} 
                variant="outline"
                className="w-full border-stone-200 text-stone-700 hover:bg-stone-50 font-bold h-12 rounded-lg"
              >
                <Eye className="mr-2 h-4 w-4" /> Xem bản in & Chia sẻ
              </Button>
              <Button 
                onClick={() => router.push("/")} 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold h-12 rounded-lg shadow-sm"
              >
                Quay lại trang chủ
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">
      <Header />
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
              <div className="flex flex-wrap items-center gap-3">
                {user && (
                    <div className="flex items-center gap-2 mr-1 bg-white border border-stone-200 rounded-lg h-10 px-3 shadow-sm transition-all hover:border-blue-200">
                        <Checkbox 
                        id="isPrivate" 
                        checked={isPrivate}
                        onCheckedChange={(checked) => {
                            const val = !!checked;
                            setIsPrivate(val);
                            if (currentData) {
                                setCurrentData({ ...currentData, isPrivate: val });
                            }
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor="isPrivate" className="text-xs font-bold text-stone-700 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                        {isPrivate ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} className="text-stone-400" />}
                        Chế độ riêng tư
                        </Label>
                    </div>
                )}
                
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

                <Button
                  variant="ghost"
                  onClick={async () => {
                    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?")) {
                      try {
                        await billService.deleteBill(groupId);
                        router.push("/dashboard");
                      } catch (error) {
                        alert("Không thể xóa hóa đơn. Vui lòng thử lại.");
                      }
                    }
                  }}
                  className="text-stone-400 hover:text-red-600 hover:bg-red-50 font-bold rounded-lg h-10 px-3 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
              <BillTable
                groupId={groupId}
                initialData={currentData || {
                  groupName: groupName,
                  members: [],
                  items: [],
                  donations: [],
                  participation: {}
                }}
                onDataChange={handleDataChange}
              />
            </div>
          </main>
          <Footer />
        </div>
      );
    }
