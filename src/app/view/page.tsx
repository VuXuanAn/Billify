"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BillTable } from "@/components/BillTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, ArrowLeft, Share2 } from "lucide-react";
import { encodeBillData } from "@/lib/utils/share";
import { useBillStore } from "@/store/useBillStore";

export default function ViewPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);
    const setStoreData = useBillStore(state => state.setCurrentData);
    const setStoreGroup = useBillStore(state => state.setGroupName);
    const setStoreMembers = useBillStore(state => state.setSetupMembers);
    const setStoreStep = useBillStore(state => state.setStep);
    const currentData = useBillStore(state => state.currentData);

    useEffect(() => {
        if (currentData) {
            setData(currentData);
        } else {
            console.error("No bill data found in store");
            setError(true);
        }
    }, [currentData]);

    const handleShare = () => {
        if (data) {
            const encoded = encodeBillData(data);
            const shareUrl = `${window.location.origin}/view?data=${encoded}`;
            navigator.clipboard.writeText(shareUrl);
            alert("Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!");
        }
    };

    const handleEdit = () => {
        if (data) {
            setStoreData(data);
            setStoreGroup(data.groupName || "");
            setStoreMembers(data.members?.map((m: any) => m.name) || []);
            setStoreStep("editor");
            router.push("/");
        }
    };

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-900 p-6">
                <div className="text-center space-y-6 max-w-md">
                    <h1 className="text-2xl font-black text-stone-900">Không tìm thấy dữ liệu hóa đơn</h1>
                    <p className="text-stone-500">Liên kết của bạn có thể đã cũ hoặc không hợp lệ.</p>
                    <Button onClick={() => router.push("/")} className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white text-stone-900 rounded-2xl h-12 px-8">Quay lại trang chính</Button>
                </div>
            </main>
        );
    }

    if (!data) return null;

    return (
        <main className="flex min-h-screen flex-col items-center p-6 md:p-12 bg-stone-50 text-stone-900">
            <div className="w-full max-w-5xl space-y-8">
                <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-black tracking-tight text-stone-900">
                            Billify<span className="text-indigo-600">.</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleShare}
                            className="border-stone-200 text-stone-700 bg-white hover:bg-stone-50 text-stone-900 font-bold rounded-lg h-10 px-4 transition-none"
                        >
                            <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
                        </Button>
                        <Button
                            onClick={handleEdit}
                            className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white hover:bg-blue-600 text-white hover:bg-blue-700 text-stone-900 font-bold rounded-lg h-10 px-4 transition-none"
                        >
                            <Edit3 className="h-4 w-4 mr-2" /> Chỉnh sửa
                        </Button>
                    </div>
                </header>

                <div className="border border-stone-200 bg-white rounded-xl overflow-hidden shadow-sm">
                    <BillTable initialData={data} isReadOnly={true} />
                </div>

                <footer className="text-center py-8">
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.3em]">Cung cấp bởi Billify © 2024</p>
                </footer>
            </div>
        </main>
    );
}
