"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BillTable } from "@/components/BillTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, ArrowLeft, Share2 } from "lucide-react";
import { encodeBillData } from "@/lib/utils/share";
import { useBillStore } from "@/store/useBillStore";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">
            <Header />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 py-12 space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-stone-900 tracking-tight">{data.groupName || "Hóa đơn"}</h1>
                            <p className="text-sm text-stone-500 font-medium">Hóa đơn công khai</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleShare}
                                className="font-bold border-stone-200 text-stone-700 bg-white hover:bg-stone-50 h-10 px-4 transition-none"
                            >
                                <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
                            </Button>
                            <Button
                                onClick={handleEdit}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-10 px-6 flex items-center gap-2 shadow-sm transition-none"
                            >
                                <Edit3 className="h-4 w-4 mr-2" /> Chỉnh sửa
                            </Button>
                        </div>
                    </div>

                    <div className="border border-stone-200 bg-white rounded-xl overflow-hidden shadow-sm">
                        <BillTable initialData={data} isReadOnly={true} />
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
