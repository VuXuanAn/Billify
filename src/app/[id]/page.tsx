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
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function GroupPage() {
  const { id } = useParams();
  const groupId = typeof id === "string" ? id : "";

  const { groupName, setGroupName, setupMembers, setSetupMembers, currentData, setCurrentData } = useBillStore();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].editor;
  const commonT = translations[language].common;
  const billT = translations[language].billTable;

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
          setCurrentData(data);

          // Ownership Check
          const isOwner = data.userId === user?.id;
          setCanEdit(isOwner);
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
      await billService.saveBill(groupId, { ...currentData }, user?.id);
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
      alert(commonT.loading);
      return;
    }
    router.push(`/${groupId}/view`);
  };

  const handleDataChange = useCallback((newData: any) => {
    setCurrentData({ ...newData });
  }, [setCurrentData]);

  const handleDelete = async () => {
    try {
      await billService.deleteBill(groupId);
      router.push("/dashboard");
    } catch (error) {
      alert(t.deleteError);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans tracking-tight">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-50">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="mt-4 text-stone-500 font-black uppercase text-[10px] tracking-widest text-center">{commonT.loading}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans tracking-tight">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-stone-50">
          <div className="text-center space-y-6 max-w-md bg-white p-10 rounded-2xl border border-stone-200 shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">{t.accessDenied}</h1>
              <p className="text-stone-500 font-medium leading-relaxed">
                {t.privateMessage}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <Button 
                onClick={handleGoToView} 
                variant="outline"
                className="w-full border-stone-200 text-stone-700 hover:bg-stone-50 font-bold h-12 rounded-lg transition-all"
              >
                <Eye className="mr-2 h-4 w-4" /> Xem bản in & Chia sẻ
              </Button>
              <Button 
                onClick={() => router.push("/")} 
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold h-12 rounded-lg shadow-sm shadow-indigo-200 transition-all"
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
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-indigo-500/20 tracking-tight">
      <Header />
      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 py-12 space-y-8">
        <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden min-h-[800px]">
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
            saveStatus={saveStatus}
            handleSave={handleSave}
            handleGoToView={handleGoToView}
            onDelete={handleDelete}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
