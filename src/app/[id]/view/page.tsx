"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BillTable } from "@/components/BillTable";
import { Button } from "@/components/ui/button";
import { Edit3, Share2, Loader2, Home } from "lucide-react";
import { billService } from "@/lib/services/billService";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function DynamicViewPage() {
    const router = useRouter();
    const { id } = useParams();
    const groupId = typeof id === "string" ? id : "";
    
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

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

    const handleShare = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl);
        alert("Đã sao chép liên kết chia sẻ vào bộ nhớ tạm!");
    };

    const handleEdit = () => {
        router.push(`/${groupId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="mt-4 text-stone-500 font-medium">Đang tải hóa đơn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
                <Header />
                <main className="flex-1 flex items-center justify-center p-6 bg-stone-50">
                    <div className="text-center space-y-6 max-w-md bg-white p-10 rounded-2xl border border-stone-200 shadow-sm">
                        <h1 className="text-2xl font-black text-stone-900">Không tìm thấy dữ liệu</h1>
                        <p className="text-stone-500 font-medium leading-relaxed">Dữ liệu hóa đơn này không tồn tại hoặc link chia sẻ đã hết hạn.</p>
                        <Button onClick={() => router.push("/")} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold h-12 rounded-lg shadow-sm">
                            <Home className="mr-2 h-4 w-4" /> Quay lại trang chủ
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
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
                                className="font-bold border-stone-200 text-stone-700 bg-white hover:bg-stone-50 h-10 px-4 shadow-sm"
                            >
                                <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
                            </Button>
                            <Button
                                onClick={handleEdit}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-10 px-6 flex items-center gap-2 shadow-sm"
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
