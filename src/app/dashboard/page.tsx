"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { billService } from "@/lib/services/billService";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, ChevronRight, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthStore();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    async function fetchBills() {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await billService.getUserBills(user.id);
          setBills(data || []);
        } catch (error) {
          console.error("Dashboard: Failed to fetch bills:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (user?.id) {
      fetchBills();
    }
  }, [user, authLoading, router]);

  const handleDelete = async (e: React.MouseEvent, billId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?")) {
      try {
        await billService.deleteBill(billId);
        setBills(prev => prev.filter(b => b.id !== billId));
      } catch (error) {
        console.error("Lỗi khi xóa hóa đơn:", error);
        alert("Có lỗi xảy ra khi xóa hóa đơn.");
      }
    }
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-stone-500 font-medium tracking-tight">Đang tải danh sách hóa đơn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">
      <Header />
      
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
              <LayoutDashboard size={14} />
              <span>Tổng quan tài khoản</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-stone-900">
              Hóa đơn của bạn
            </h1>
            <p className="text-stone-500 font-medium max-w-md">
              Danh sách tất cả các hóa đơn chi tiêu nhóm mà bạn đã tạo và quản lý.
            </p>
          </div>
          
          <Button 
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 self-start md:self-auto"
          >
            <Plus size={18} />
            Tạo hóa đơn mới
          </Button>
        </div>

        {bills.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto border border-stone-100">
              <LayoutDashboard className="text-stone-300" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900">Chưa có hóa đơn nào</h3>
              <p className="text-stone-500 font-medium max-w-sm mx-auto text-sm">
                Bạn chưa tạo hóa đơn nào gắn với tài khoản này. Hãy bắt đầu ngay để quản lý chi tiêu nhóm dễ dàng hơn.
              </p>
            </div>
            <Button 
              onClick={() => router.push("/")}
              variant="outline"
              className="border-stone-200 text-stone-700 font-bold h-10 px-6 hover:bg-stone-50 rounded-lg"
            >
              Bắt đầu tạo ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => (
              <Link 
                key={bill.id} 
                href={`/${bill.id}`}
                className="group bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-48 relative"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider border border-blue-100">
                      Hóa đơn
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, bill.id)}
                      className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      title="Xóa hóa đơn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {bill.name || "Hóa đơn không tên"}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                    <Calendar size={12} />
                    <span>{new Date(bill.updated_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
