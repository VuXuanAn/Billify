"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
    QrCode, 
    Copy, 
    Check, 
    Download, 
    CreditCard, 
    User,
    Receipt,
    TrendingDown,
    Heart,
    Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface PersonalSlipProps {
    member: { id: string; name: string };
    items: any[];
    participation: Record<string, Record<string, boolean>>;
    donations: any[];
    allMembers: any[];
    paymentBank?: string;
    paymentAccount?: string;
    paymentQR?: string;
    paymentStatus?: Record<string, boolean>;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export function PersonalSlip({
    member,
    items,
    participation,
    donations,
    allMembers,
    paymentBank,
    paymentAccount,
    paymentQR,
    paymentStatus
}: PersonalSlipProps) {
    const [copied, setCopied] = React.useState(false);

    // Calculate personal items
    const personalItems = items.filter(item => participation[member.id]?.[item.id]);
    
    const itemsBreakdown = personalItems.map(item => {
        const participantCount = Object.values(participation).filter(p => p[item.id]).length;
        const share = item.amount / participantCount;
        return {
            ...item,
            participantCount,
            share
        };
    });

    // Logic for Global Reduction (Shared among all members)
    const totalGroupBill = items.reduce((acc, i) => acc + i.amount, 0);
    const totalGroupDonations = donations.reduce((acc, d) => acc + d.amount, 0);
    const reductionRatio = totalGroupBill > 0
        ? Math.max(0, (totalGroupBill - totalGroupDonations) / totalGroupBill)
        : (totalGroupDonations > 0 ? 0 : 1);
    const deductionFactor = 1 - reductionRatio;

    const originalItemsTotal = itemsBreakdown.reduce((sum, item) => sum + item.share, 0);
    const deductionAmount = originalItemsTotal * deductionFactor;
    const finalItemsTotal = originalItemsTotal * reductionRatio;

    // A person's own donation is NOT part of what they pay, but part of the group's "support" pool.
    // In BillTable, 'Cần đóng' is just the final items total.
    const grandTotal = finalItemsTotal;

    // Calculate all sponsors
    const memberDonated = donations.reduce((acc, d) => {
        acc[d.memberId] = (acc[d.memberId] || 0) + d.amount;
        return acc;
    }, {} as Record<string, number>);

    const sponsors = allMembers
        .filter(m => memberDonated[m.id] > 0)
        .sort((a, b) => memberDonated[b.id] - memberDonated[a.id]);

    const handleCopy = () => {
        if (paymentAccount) {
            navigator.clipboard.writeText(paymentAccount);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card className="max-w-xl mx-auto bg-white border border-stone-200 shadow-xl rounded-[2rem] overflow-hidden relative group transition-all hover:shadow-2xl">
            {/* Top Pattern Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                            <Receipt size={12} />
                            Hóa đơn cá nhân
                        </div>
                        <h2 className="text-3xl font-black text-stone-900 tracking-tight">{member.name}</h2>
                        <div className="pt-1">
                            {paymentStatus?.[member.id] ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-600 shadow-sm animate-in fade-in zoom-in duration-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <Check size={10} strokeWidth={3} />
                                    Đã thanh toán
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-600 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Chưa thanh toán
                                </div>
                            )}
                        </div>
                    </div>
                    <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-1 ring-stone-100">
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black text-lg">
                            {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Main Total */}
                <div className="bg-stone-50/50 border border-stone-100 rounded-3xl p-6 text-center space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tổng cộng cần thanh toán</p>
                    <div className="text-4xl font-black text-indigo-600 tracking-tighter">
                        {formatCurrency(Math.round(grandTotal))}
                    </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Chi tiết khoản chi</h3>
                        <div className="h-px flex-1 bg-stone-100 mx-4" />
                    </div>
                    
                    <div className="space-y-3">
                        {itemsBreakdown.map((item, idx) => (
                            <div key={item.id} className="flex justify-between items-center group/item">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-stone-800 group-hover/item:text-indigo-600 transition-colors">{item.name}</p>
                                    <p className="text-[10px] text-stone-400 font-medium">Chia {item.participantCount} người (Gốc: {formatCurrency(item.amount)})</p>
                                </div>
                                <div className="text-sm font-mono font-bold text-stone-900 bg-stone-50 px-3 py-1 rounded-lg">
                                    {formatCurrency(Math.round(item.share))}
                                </div>
                            </div>
                        ))}

                        {/* Totals Section with Deduction */}
                        <div className="pt-4 mt-2 border-t border-stone-100 space-y-2">
                             <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tam tính</p>
                                <p className="text-sm font-mono font-bold text-stone-600">{formatCurrency(Math.round(originalItemsTotal))}</p>
                            </div>
                            
                            {deductionAmount > 0 && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown size={12} className="text-emerald-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Trừ từ ủng hộ</p>
                                    </div>
                                    <p className="text-sm font-mono font-bold text-emerald-600">-{formatCurrency(Math.round(deductionAmount))}</p>
                                </div>
                            )}

                            {memberDonated[member.id] > 0 && (
                                <div className="flex justify-between items-center pb-2 border-b border-dashed border-stone-200">
                                    <div className="flex items-center gap-2">
                                        <Heart size={12} className="text-red-500 fill-red-500/10" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Bạn đã ủng hộ quỹ</p>
                                    </div>
                                    <p className="text-sm font-mono font-bold text-red-600">+{formatCurrency(memberDonated[member.id])}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Global Sponsors Honors */}
                {sponsors.length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                            <h3 className="text-[10px] font-black text-amber-950 uppercase tracking-widest leading-none">Vinh danh đóng góp</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sponsors.map((sponsor, idx) => (
                                <div key={sponsor.id} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-amber-100/50 shadow-sm">
                                    <span className="text-[10px] font-black text-amber-600">{idx + 1}</span>
                                    <Avatar className="h-6 w-6 border border-white">
                                        <AvatarFallback className="bg-amber-100 text-amber-700 text-[8px] font-black">{sponsor.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-[10px] font-bold text-stone-900 leading-none">{sponsor.name}</p>
                                        <p className="text-[8px] text-amber-600 font-black mt-0.5">+{formatCurrency(memberDonated[sponsor.id])}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Payment Info */}
                <div className="pt-8 border-t border-stone-100 flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="space-y-4 flex-1 w-full">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Thông tin chuyển khoản</p>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center shadow-sm">
                                    <CreditCard size={18} className="text-stone-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black text-stone-900">{paymentBank || "Chưa cập nhật ngân hàng"}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-mono font-bold text-stone-500">{paymentAccount || "Chưa cập nhật STK"}</p>
                                        {paymentAccount && (
                                            <button 
                                                onClick={handleCopy}
                                                className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-indigo-600"
                                            >
                                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {paymentQR && (
                        <div className="shrink-0 relative group/qr">
                            <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-0 group-hover/qr:opacity-10 transition-opacity" />
                            <div className="p-3 bg-white border-2 border-dashed border-stone-200 rounded-3xl shadow-sm hover:border-indigo-200 transition-all hover:scale-105">
                                <img 
                                    src={paymentQR} 
                                    alt="Payment QR" 
                                    className="h-32 w-32 object-contain rounded-xl"
                                />
                                <div className="mt-2 text-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 flex items-center justify-center gap-1">
                                        <QrCode size={10} /> Quét để trả
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Branding Footer */}
                <div className="text-center pt-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-200">Billify • Scientific Split</p>
                </div>
            </div>
        </Card>
    );
}
