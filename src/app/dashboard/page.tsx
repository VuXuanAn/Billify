"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { billService } from "@/lib/services/billService";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, ChevronRight, LayoutDashboard, Plus, Trash2, Users, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthStore();
  const [bills, setBills] = useState<any[]>([]);
  const [billSummaries, setBillSummaries] = useState<Record<string, { memberCount: number, totalAmount: number }>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language].dashboard;
  const commonT = translations[language].common;

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
          console.log("Dashboard: Bills fetched:", data);
          setBills(data || []);

          // Fetch summaries in parallel
          const summaries: Record<string, any> = {};
          if (data && data.length > 0) {
            await Promise.all(data.map(async (bill: any) => {
              try {
                const summary = await billService.getBillSummary(bill.id);
                summaries[bill.id] = summary;
              } catch (e) {
                console.error(`Error fetching summary for bill ${bill.id}:`, e);
                summaries[bill.id] = { memberCount: 0, totalAmount: 0 };
              }
            }));
            setBillSummaries(summaries);
          }
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

    if (window.confirm(t.deleteConfirm)) {
      try {
        await billService.deleteBill(billId);
        setBills(prev => prev.filter(b => b.id !== billId));
      } catch (error) {
        console.error("Lỗi khi xóa hóa đơn:", error);
        alert(t.deleteError);
      }
    }
  };

  const groupedBills = useMemo(() => {
    const groups: Record<number, any[]> = {};
    bills.forEach(bill => {
      const year = new Date(bill.updated_at || bill.created_at).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(bill);
    });
    // Sort years descending
    return Object.entries(groups)
      .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
      .map(([year, items]) => ({ year: Number(year), items }));
  }, [bills]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-stone-500 font-medium tracking-tight">{t.loading}</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">
      <Header />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">

            <h1 className="text-4xl md:text-4xl font-black tracking-tighter text-primary uppercase">
              {t.title}
            </h1>
            <p className="text-stone-500 font-medium max-w-md leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <Button
            onClick={() => router.push("/")}
            className="bg-stone-900 hover:bg-stone-800 text-white font-black h-14 px-8 rounded-2xl shadow-2xl shadow-stone-200 flex items-center gap-3 self-start md:self-auto transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-xs tracking-widest"
          >
            <Plus size={20} />
            {t.newBill}
          </Button>
        </div>

        {bills.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-stone-200 rounded-[3rem] p-16 text-center space-y-8 shadow-sm">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto border border-stone-100 italic text-stone-300">
              <Receipt size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">{t.noBills}</h3>
              <p className="text-stone-500 font-medium max-w-sm mx-auto leading-relaxed">
                {t.noBillsDesc}
              </p>
            </div>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-stone-200 text-stone-900 font-black h-12 px-8 hover:bg-stone-50 rounded-xl uppercase text-[10px] tracking-widest hover:border-stone-300 transition-all"
            >
              {t.startNow}
            </Button>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedBills.map(({ year, items }) => (
              <div key={year} className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t.yearHeading} {year}</h2>
                  <div className="h-px flex-1 bg-stone-200/60" />
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">{items.length} {t.bill}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((bill) => {
                    const summary = billSummaries[bill.id] || { memberCount: 0, totalAmount: 0 };
                    const memberCount = summary.memberCount;
                    const totalAmount = summary.totalAmount;

                    return (
                      <Link
                        key={bill.id}
                        href={`/${bill.id}`}
                        className="group relative bg-white border border-stone-200 rounded-3xl p-6 hover:border-indigo-300 shadow-sm hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] hover:-translate-y-1 transition-all duration-400 flex flex-col min-h-[220px] overflow-hidden"
                      >
                        {/* Interactive Accent Line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-cyan-400 transition-all duration-500" />

                        {/* Top: Date & Action */}
                        <div className="flex justify-between items-start mb-4 mt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                            <Calendar size={12} />
                            {new Date(bill.updated_at || bill.created_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                          <button
                            onClick={(e) => handleDelete(e, bill.id)}
                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            title="Xóa hóa đơn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-stone-800 leading-snug line-clamp-2 mb-auto group-hover:text-stone-950 transition-colors">
                          {bill.name || (language === 'vi' ? "Hóa đơn không tên" : "Untitled Bill")}
                        </h3>

                        {/* Bottom: Total & Members */}
                        <div className="mt-8 pt-5 border-t border-dashed border-stone-200 flex items-end justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t.totalAmount}</p>
                            <p className="text-2xl font-black text-stone-900 group-hover:text-indigo-600 transition-colors">
                              {formatCurrency(totalAmount)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-stone-500 font-bold text-xs bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <Users size={14} />
                              <span>{memberCount}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white border border-stone-100 group-hover:border-indigo-600 transition-all transform group-hover:translate-x-1">
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
