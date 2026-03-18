"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BillTable } from "@/components/BillTable";
import { PersonalSlip } from "@/components/PersonalSlip";
import { Button } from "@/components/ui/button";
import { 
    Loader2, 
    Home, 
    Lock, 
    Unlock, 
    LayoutList, 
    User, 
    ChevronRight,
    Search
} from "lucide-react";
import { billService } from "@/lib/services/billService";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function DynamicViewPage() {
    const router = useRouter();
    const { id } = useParams();
    const groupId = typeof id === "string" ? id : "";

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "personal">("list");
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!groupId) {
                setIsLoading(false);
                return;
            }
            try {
                const fetchedData = await billService.getBill(groupId);
                if (fetchedData) {
                    setData(fetchedData);
                    if (fetchedData.members?.length > 0) {
                        setSelectedMemberId(fetchedData.members[0].id);
                    }
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to load bill data:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [groupId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans tracking-tight">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="mt-4 text-stone-500 font-black uppercase text-[10px] tracking-[0.2em] text-center">Đang tải hóa đơn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col font-sans tracking-tight">
                <Header />
                <main className="flex-1 flex items-center justify-center p-6 bg-stone-50">
                    <div className="text-center space-y-6 max-w-md bg-white p-10 rounded-3xl border border-stone-200 shadow-xl">
                        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                             <Search className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Không tìm thấy dữ liệu</h1>
                            <p className="text-stone-500 font-medium leading-relaxed">Dữ liệu hóa đơn này không tồn tại hoặc link chia sẻ đã hết hạn.</p>
                        </div>
                        <Button onClick={() => router.push("/")} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-black h-12 rounded-xl shadow-lg shadow-indigo-100 uppercase text-xs tracking-widest">
                            <Home className="mr-2 h-4 w-4" /> Quay lại trang chủ
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!data) return null;

    const selectedMember = data.members.find((m: any) => m.id === selectedMemberId);

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-indigo-500/20 tracking-tight">
            <Header />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 py-8 space-y-8">
                    {/* Simplified Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-stone-200 pb-8">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-5xl font-black text-stone-900 tracking-tighter leading-none">{data.groupName || "Hóa đơn"}</h1>

                            </div>
                        </div>

                        {/* View Switcher - Premium Toggle Shape */}
                        <div className="bg-stone-100/80 backdrop-blur-sm p-1.5 rounded-2xl flex items-center gap-1 shadow-inner border border-stone-200/50">
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    viewMode === "list" 
                                        ? "bg-white text-indigo-600 shadow-md ring-1 ring-stone-200/50" 
                                        : "text-stone-400 hover:text-stone-600"
                                )}
                            >
                                <LayoutList size={14} />
                                Danh sách
                            </button>
                            <button
                                onClick={() => setViewMode("personal")}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    viewMode === "personal" 
                                        ? "bg-white text-indigo-600 shadow-md ring-1 ring-stone-200/50" 
                                        : "text-stone-400 hover:text-stone-600"
                                )}
                            >
                                <User size={14} />
                                Cá nhân
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    {viewMode === "list" ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <BillTable initialData={data} isReadOnly={true} />
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Member Selector Select */}
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Chọn thành viên để xem hóa đơn</p>
                                <Select 
                                    value={selectedMemberId || ""} 
                                    onValueChange={(val) => setSelectedMemberId(val)}
                                >
                                    <SelectTrigger className="w-64 bg-white border-2 border-stone-100 rounded-2xl h-12 px-5 font-black uppercase text-[10px] tracking-widest shadow-sm hover:border-indigo-100 transition-all">
                                        <SelectValue placeholder="Chọn thành viên...">
                                            {selectedMemberId && (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 bg-stone-50 rounded flex items-center justify-center text-[7px] font-black text-stone-500">
                                                        {data.members.find((m: any) => m.id === selectedMemberId)?.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {data.members.find((m: any) => m.id === selectedMemberId)?.name}
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.members.map((member: any) => (
                                            <SelectItem key={member.id} value={member.id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-5 w-5 bg-stone-50 rounded flex items-center justify-center text-[8px] font-black text-stone-500">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {member.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Personal Slip Display */}
                            {selectedMember && (
                                <div className="max-w-4xl mx-auto">
                                    <PersonalSlip
                                        member={selectedMember}
                                        items={data.items}
                                        participation={data.participation}
                                        donations={data.donations}
                                        allMembers={data.members}
                                        paymentBank={data.paymentBank}
                                        paymentAccount={data.paymentAccount}
                                        paymentQR={data.paymentQR}
                                        paymentStatus={data.paymentStatus}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}
