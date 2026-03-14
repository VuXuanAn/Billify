"use client";

import React, { useState, useMemo, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    UserPlus,
    Heart,
    BarChart3,
    Users,
    PieChart,
    Activity,
    ChevronRight,
    TrendingUp,
    Sparkles,
    Settings2,
    Edit3,
    UploadCloud,
    Trash2,
    Copy,
    Check
} from "lucide-react";
import CurrencyInput from 'react-currency-input-field';
import { IMaskInput } from "react-imask";

interface Member {
    id: string;
    name: string;
}

interface Item {
    id: string;
    name: string;
    amount: number;
}

interface Donation {
    id: string;
    memberId: string;
    amount: number;
}

interface BillTableData {
    groupName: string;
    paymentBank?: string;
    paymentAccount?: string;
    paymentQR?: string;
    members: Member[];
    items: Item[];
    donations: Donation[];
    participation: Record<string, Record<string, boolean>>;
    paymentStatus?: Record<string, boolean>;
}

interface BillTableProps {
    initialData?: BillTableData;
    isReadOnly?: boolean;
    onDataChange?: (data: BillTableData) => void;
}

export function BillTable({ initialData, isReadOnly, onDataChange }: BillTableProps) {
    const [groupName, setGroupName] = useState(initialData?.groupName || "Chuyến đi tuyệt vời");
    const [paymentBank, setPaymentBank] = useState(initialData?.paymentBank || "");
    const [paymentAccount, setPaymentAccount] = useState(initialData?.paymentAccount || "");
    const [paymentQR, setPaymentQR] = useState(initialData?.paymentQR || "");
    const [members, setMembers] = useState<Member[]>(initialData?.members || [
        { id: "m1", name: "Thành viên 1" },
    ]);
    const [items, setItems] = useState<Item[]>(initialData?.items || [
        { id: "i1", name: "Danh mục 1", amount: 100000 },
    ]);
    const [donations, setDonations] = useState<Donation[]>(initialData?.donations || []);
    const [participation, setParticipation] = useState<Record<string, Record<string, boolean>>>(
        initialData?.participation || { m1: { i1: true } }
    );
    const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(initialData?.paymentStatus || {});

    // Sync external data changes if needed
    React.useEffect(() => {
        if (!isReadOnly && onDataChange) {
            onDataChange({ groupName, paymentBank, paymentAccount, paymentQR, members, items, donations, participation, paymentStatus });
        }
    }, [groupName, paymentBank, paymentAccount, paymentQR, members, items, donations, participation, paymentStatus, onDataChange, isReadOnly]);

    // Modal States
    const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryAmount, setNewCategoryAmount] = useState<string>("0");
    const [selectedMembersForCat, setSelectedMembersForCat] = useState<Record<string, boolean>>({});

    const [isMemDialogOpen, setIsMemDialogOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState("");
    const [selectedItemsForMem, setSelectedItemsForMem] = useState<Record<string, boolean>>({});

    const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
    const [newDonationAmount, setNewDonationAmount] = useState<string>("0");
    const [newDonationMemberId, setNewDonationMemberId] = useState<string>("");

    // QR Cropper States
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState("");
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Makes crop preview update between images.
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || '')
            );
            reader.readAsDataURL(e.target.files[0]);
            setIsCropperOpen(true);
            e.target.value = ''; // Reset input so same file can be selected again
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1, // 1:1 aspect ratio for QR codes
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    }

    async function handleCropComplete() {
        if (!imgRef.current || !crop) {
            setIsCropperOpen(false);
            return;
        }

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        // Target 300x300 max to keep base64 tiny
        const targetSize = 250;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Draw the cropped image onto the tiny canvas
        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            targetSize,
            targetSize
        );

        // Compress heavily to keep the share URL tiny, QR codes survive jpeg compression surprisingly well
        const base64Image = canvas.toDataURL('image/jpeg', 0.6);
        setPaymentQR(base64Image);
        setIsCropperOpen(false);
    }

    // Copy state
    const [copiedAccount, setCopiedAccount] = useState(false);

    const handleCopyAccount = async () => {
        if (!paymentAccount) return;
        try {
            await navigator.clipboard.writeText(paymentAccount);
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Calculations
    const stats = useMemo(() => {
        const itemSplits: Record<string, number> = {};
        const memberShares: Record<string, number> = {};
        const memberDonated: Record<string, number> = {};

        members.forEach(m => {
            memberShares[m.id] = 0;
            memberDonated[m.id] = 0;
        });

        const totalBillAmount = items.reduce((acc, i) => acc + i.amount, 0);
        const totalDonationsAmount = donations.reduce((acc, d) => acc + d.amount, 0);

        items.forEach(item => {
            const participantCount = members.filter(m => participation[m.id]?.[item.id]).length;
            itemSplits[item.id] = participantCount > 0 ? item.amount / participantCount : 0;
        });

        members.forEach(member => {
            let share = 0;
            items.forEach(item => {
                if (participation[member.id]?.[item.id]) share += itemSplits[item.id];
            });
            memberShares[member.id] = share;
        });

        donations.forEach(d => {
            if (memberDonated[d.memberId] !== undefined) memberDonated[d.memberId] += d.amount;
        });

        const sponsors = [...members]
            .sort((a, b) => (memberDonated[b.id] || 0) - (memberDonated[a.id] || 0))
            .filter(m => (memberDonated[m.id] || 0) > 0)
            .slice(0, 3);

        const avgPerPerson = members.length > 0 ? totalBillAmount / members.length : 0;

        return {
            itemSplits,
            memberShares,
            memberDonated,
            sponsors,
            totalDonationsAmount,
            totalBillAmount,
            avgPerPerson
        };
    }, [members, items, donations, participation]);

    // CATEGORY LOGIC
    const openAddCategoryDialog = () => {
        setNewCategoryName(`Danh mục ${items.length + 1}`);
        setNewCategoryAmount("0");
        setSelectedMembersForCat(members.reduce((acc, m) => ({ ...acc, [m.id]: true }), {}));
        setIsCatDialogOpen(true);
    };

    const handleAddCategory = () => {
        const amount = parseFloat(newCategoryAmount) || 0;
        const newId = `i${Date.now()}`;
        setItems([...items, { id: newId, name: newCategoryName, amount }]);
        setParticipation(prev => {
            const next = { ...prev };
            members.forEach(m => {
                if (!next[m.id]) next[m.id] = {};
                next[m.id][newId] = selectedMembersForCat[m.id] || false;
            });
            return next;
        });
        setIsCatDialogOpen(false);
    };

    // DONATION LOGIC
    const openAddDonationDialog = () => {
        setNewDonationAmount("0");
        setNewDonationMemberId(members[0]?.id || "");
        setIsDonationDialogOpen(true);
    };

    const handleAddDonation = () => {
        const amount = parseFloat(newDonationAmount) || 0;
        if (amount <= 0) return;
        setDonations([...donations, { id: `d${Date.now()}`, memberId: newDonationMemberId, amount }]);
        setIsDonationDialogOpen(false);
    };

    // MEMBER LOGIC
    const openAddMemberDialog = () => {
        setNewMemberName(`Thành viên ${members.length + 1}`);
        setSelectedItemsForMem(items.reduce((acc, i) => ({ ...acc, [i.id]: true }), {}));
        setIsMemDialogOpen(true);
    };

    const handleAddMember = () => {
        const newId = `m${Date.now()}`;
        setMembers([...members, { id: newId, name: newMemberName }]);
        setParticipation(prev => ({ ...prev, [newId]: { ...selectedItemsForMem } }));
        setIsMemDialogOpen(false);
    };

    // HELPERS
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };
    const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const updateItemAmount = (id: string, val: number | undefined) => {
        const amount = val ?? 0;

        setItems(prevItems =>
            prevItems.map(i =>
                i.id === id ? { ...i, amount } : i
            )
        );
    };
    const updateMemberName = (id: string, name: string) => {
        setMembers(members.map(m => m.id === id ? { ...m, name } : m));
    };

    return (
        <div className="max-w-screen-2xl mx-auto py-12 px-6 space-y-12 text-stone-900 font-sans tracking-tight">

            <div className="flex flex-col gap-8 pb-6 border-b border-stone-200">
                <div className="space-y-6">
                    {/* Title and Members info */}
                    <div className="space-y-4">
                        <div className="relative max-w-2xl">
                            <Input
                                value={groupName}
                                onChange={(e) => !isReadOnly && setGroupName(e.target.value)}
                                readOnly={isReadOnly}
                                className={`text-5xl font-black tracking-tighter text-stone-900 h-auto p-0 border-none bg-transparent text-stone-900 placeholder:text-stone-400 focus-visible:ring-0 placeholder:text-stone-800 ${isReadOnly ? 'cursor-default' : ''}`}
                                placeholder="Tên nhóm của bạn..."
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-1.5">
                                <TooltipProvider>
                                    {members.map(member => (
                                        <Tooltip key={member.id}>
                                            <TooltipTrigger type="button" className="cursor-default border-none p-0 bg-transparent outline-none">
                                                <Avatar className="h-7 w-7 border-2 border-stone-200 shadow-sm block">
                                                    <AvatarFallback className="bg-stone-50 hover:bg-stone-100 text-stone-400 font-bold text-[9px]">{getInitials(member.name)}</AvatarFallback>
                                                </Avatar>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-bold text-[10px]">{member.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </TooltipProvider>
                            </div>
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                                {members.length} thành viên tham gia
                            </span>
                        </div>
                    </div>

                    {/* Payment Information Inputs */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 h-12 shadow-sm focus-within:border-indigo-500/50 transition-all">
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest whitespace-nowrap">Ngân hàng:</span>
                            <Input
                                value={paymentBank}
                                onChange={(e) => !isReadOnly && setPaymentBank(e.target.value)}
                                readOnly={isReadOnly}
                                className="border-none bg-transparent text-stone-900 placeholder:text-stone-400 h-8 p-0 text-sm font-bold text-stone-700 focus-visible:ring-0 min-w-[120px] placeholder:text-stone-700"
                                placeholder="VD: Techcombank..."
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 h-12 shadow-sm focus-within:border-indigo-500/50 transition-all group">
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest whitespace-nowrap">Số tài khoản:</span>
                            <Input
                                value={paymentAccount}
                                onChange={(e) => !isReadOnly && setPaymentAccount(e.target.value)}
                                readOnly={isReadOnly}
                                className="border-none bg-transparent text-stone-900 placeholder:text-stone-400 h-8 p-0 text-sm font-bold text-stone-700 focus-visible:ring-0 min-w-[150px] placeholder:text-stone-700 flex-1"
                                placeholder="Số tài khoản..."
                            />
                            {paymentAccount && (
                                <button
                                    onClick={handleCopyAccount}
                                    title="Copy số tài khoản"
                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center shrink-0 ${copiedAccount ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-700 border border-stone-200'} ${isReadOnly ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                                >
                                    {copiedAccount ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            )}
                        </div>
                        {!isReadOnly && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={onSelectFile}
                                    className="hidden"
                                />
                                {paymentQR ? (
                                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 h-12 shadow-sm">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest whitespace-nowrap">Đã tải mã QR ✔</span>
                                        <button
                                            onClick={() => setPaymentQR("")}
                                            className="text-indigo-400 hover:text-red-500 ml-1 p-1"
                                            title="Xóa mã QR"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-12 border-stone-200 text-stone-700 bg-white hover:bg-stone-50 rounded-xl shadow-sm px-4"
                                    >
                                        <UploadCloud className="h-4 w-4 mr-2 text-stone-400" />
                                        <span className="text-xs font-bold whitespace-nowrap">Tải mã QR</span>
                                    </Button>
                                )}
                            </div>
                        )}
                        {/* Prominent QR Code Display for View Mode */}
                        {isReadOnly && paymentQR && (
                            <div className="w-full mt-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                                <div className="bg-white p-2 rounded-xl shadow-sm border border-stone-200 shrink-0">
                                    <img src={paymentQR} alt="QR Code Thanh Toán" className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-black text-indigo-950">Quét mã để thanh toán</h3>
                                    <p className="text-sm font-semibold text-indigo-700/60 mt-1">Sử dụng ứng dụng ngân hàng của bạn để quét mã QR này và chuyển khoản nhanh chóng.</p>

                                    <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {paymentBank && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-100 text-xs font-bold text-indigo-900 shadow-sm">
                                                <span className="text-[10px] text-indigo-400 uppercase tracking-widest">Ngân hàng</span>
                                                {paymentBank}
                                            </span>
                                        )}
                                        {paymentAccount && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-100 text-xs font-bold text-indigo-900 shadow-sm ml-0">
                                                <span className="text-[10px] text-indigo-400 uppercase tracking-widest">STK</span>
                                                {paymentAccount}
                                                <button
                                                    onClick={handleCopyAccount}
                                                    title="Copy số tài khoản"
                                                    className={`ml-1 flex items-center justify-center p-1 rounded transition-colors ${copiedAccount ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600'}`}
                                                >
                                                    {copiedAccount ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${stats.totalDonationsAmount > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Tổng tiền hóa đơn</p>
                        <p className="text-3xl font-black text-stone-900 tracking-tighter"><span className="font-mono tracking-tighter">{formatCurrency(stats.totalBillAmount)}</span></p>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Số người tham gia</p>
                        <p className="text-3xl font-black text-stone-900 tracking-tighter flex items-end gap-2 leading-none">
                            <span className="font-mono tracking-tighter">{members.length}</span>
                            <span className="text-[13px] font-medium text-stone-500 tracking-normal mb-1">người</span>
                        </p>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Trung bình mỗi người</p>
                        <p className="text-3xl font-black text-stone-900 tracking-tighter"><span className="font-mono tracking-tighter">{formatCurrency(stats.avgPerPerson)}</span></p>
                    </div>
                    {stats.totalDonationsAmount > 0 && (
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Tổng quỹ ủng hộ</p>
                            <p className="text-3xl font-black text-indigo-600 tracking-tighter">+<span className="font-mono tracking-tighter">{formatCurrency(stats.totalDonationsAmount)}</span></p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sponsors Bar */}
            {stats.sponsors.length > 0 && (
                <section className="bg-gradient-to-r from-rose-50/50 to-orange-50/50 border border-rose-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-center">
                                <Heart className="h-6 w-6 text-rose-500 fill-rose-500/20" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-rose-950 uppercase tracking-widest">Vinh danh đóng góp</h3>
                                <p className="text-xs font-semibold text-rose-700/60 mt-0.5">Những thành viên đã ủng hộ thêm cho nhóm</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {stats.sponsors.map((sponsor, idx) => (
                                <div key={sponsor.id} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-rose-100/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-rose-100 text-rose-700 text-xs font-bold">{getInitials(sponsor.name)}</AvatarFallback>
                                        </Avatar>
                                        {idx === 0 && (
                                            <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-amber-400/20" title="Top 1">
                                                1
                                            </div>
                                        )}
                                        {idx === 1 && (
                                            <div className="absolute -top-2 -right-2 bg-slate-300 text-slate-800 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm" title="Top 2">
                                                2
                                            </div>
                                        )}
                                        {idx === 2 && (
                                            <div className="absolute -top-2 -right-2 bg-amber-700 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm" title="Top 3">
                                                3
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-stone-900">{sponsor.name}</p>
                                        <p className="text-xs text-rose-600 font-black">+<span className="font-mono tracking-tighter">{formatCurrency(stats.memberDonated[sponsor.id])}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {!isReadOnly && (
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={openAddDonationDialog}
                        className="border-stone-200 text-stone-700 hover:bg-stone-50 hover:bg-stone-100 font-bold rounded-lg h-10 px-4 transition-none"
                    >
                        <Heart className="h-4 w-4 mr-2" /> Ủng hộ
                    </Button>
                    <Button
                        variant="outline"
                        onClick={openAddMemberDialog}
                        className="border-stone-200 text-stone-700 hover:bg-stone-50 hover:bg-stone-100 font-bold rounded-lg h-10 px-4 transition-none"
                    >
                        <UserPlus className="h-4 w-4 mr-2" /> Thêm người
                    </Button>
                    <Button
                        onClick={openAddCategoryDialog}
                        className="bg-white text-stone-900 hover:bg-slate-200/90 text-stone-900 text-stone-900 font-bold rounded-lg h-10 px-4 transition-none"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Thêm khoản chi
                    </Button>
                </div>
            )}

            {/* Main Table Matrix - Simplified */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-md shadow-slate-100">
                <ScrollArea className="w-full">
                    <Table>
                        <TableHeader className="bg-stone-50 text-stone-900/30 border-b border-stone-200">
                            <TableRow className="hover:bg-transparent text-stone-900 placeholder:text-stone-400">
                                <TableHead className="w-[240px] p-0 border-r border-b border-stone-200 bg-stone-50 text-primary sticky left-0 z-20 rounded-tl-xl align-top relative overflow-hidden group">
                                    <div className="absolute inset-0 pointer-events-none">
                                        <svg className="absolute w-full h-full text-stone-200" preserveAspectRatio="none" viewBox="0 0 100 100">
                                            <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
                                        </svg>
                                    </div>
                                    <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary text-right group-hover:text-stone-900/60 transition-colors">
                                        Danh mục
                                    </div>
                                    <div className="absolute bottom-4 left-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary group-hover:text-stone-900/60 transition-colors">
                                        Thành viên
                                    </div>
                                </TableHead>
                                {items.map(item => (
                                    <TableHead key={item.id} className="min-w-[260px] border-l border-r border-b border-stone-200 p-0 align-top group/head transition-colors hover:bg-stone-50/50">
                                        <div className="p-4 flex flex-row items-center justify-between gap-3 h-full ">
                                            <div className="relative flex-1">
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => !isReadOnly && setItems(items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                                                    readOnly={isReadOnly}
                                                    className={`h-8 border border-transparent bg-transparent text-stone-900 placeholder:text-stone-400 font-black text-stone-800 px-2 -ml-2 text-sm focus-visible:ring-indigo-100 placeholder:text-stone-500 transition-all ${isReadOnly ? 'cursor-default' : 'hover:bg-white hover:border-stone-200 hover:shadow-sm cursor-text'}`}
                                                    placeholder="Tên mục..."
                                                    title={!isReadOnly ? 'Nhấn để sửa tên' : undefined}
                                                />
                                            </div>

                                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border border-transparent transition-all ${isReadOnly ? 'border-none shadow-none bg-transparent px-0' : 'hover:bg-white hover:border-stone-200 hover:shadow-sm focus-within:bg-white focus-within:border-stone-200 focus-within:shadow-sm shrink-0'}`}>
                                                <IMaskInput
                                                    id={`input-amount-${item.id}`}
                                                    name={`input-amount-${item.id}`}
                                                    placeholder="0"
                                                    value={item.amount === 0 ? "" : item.amount.toString()}
                                                    mask={Number}
                                                    scale={0}
                                                    thousandsSeparator="."
                                                    radix=","
                                                    mapToRadix={['.']}
                                                    min={0}
                                                    unmask={true}
                                                    onAccept={(value, mask) => {
                                                        if (!isReadOnly) {
                                                            const val = mask.unmaskedValue ? Number(mask.unmaskedValue) : 0;
                                                            updateItemAmount(item.id, val);
                                                        }
                                                    }}
                                                    disabled={isReadOnly}
                                                    className={`h-6 w-24 text-right font-mono text-stone-900 placeholder:text-stone-400 font-bold text-sm tracking-tighter p-0 bg-transparent border-none focus:outline-none focus:ring-0 ${isReadOnly ? 'cursor-default opacity-100 bg-transparent disabled:text-stone-900' : 'cursor-text '}`}
                                                    title={!isReadOnly ? 'Nhấn để sửa số tiền' : undefined}
                                                />
                                                <span className="text-[10px] font-black text-indigo-400">₫</span>
                                            </div>
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="w-[200px] font-black text-stone-900 bg-stone-50 text-primary backdrop-blur-xl sticky right-[120px] z-20 shadow-[inset_1px_-1px_0_0_theme(colors.stone.200),-5px_0_15px_rgba(0,0,0,0.02)] backdrop-blur-md py-10 text-center text-[10px] uppercase tracking-[0.2em]">
                                    Cần đóng
                                </TableHead>
                                <TableHead className="w-[120px] font-black text-stone-900 bg-stone-50 text-primary backdrop-blur-xl sticky right-0 z-20 shadow-[inset_1px_-1px_0_0_theme(colors.stone.200),-5px_0_15px_rgba(0,0,0,0.02)] backdrop-blur-md py-10 text-center text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-stone-50/50 rounded-tr-xl">
                                    Đã thanh toán
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map(member => {
                                const hasPaid = paymentStatus[member.id];
                                return (
                                    <TableRow
                                        key={member.id}
                                        className={`transition-colors duration-200 ${hasPaid ? 'bg-green-50/50 hover:bg-green-100/50' : 'hover:bg-stone-50 transition-none'}`}
                                    >
                                        <TableCell className={`p-4 border-r border-b border-stone-200 sticky left-0 z-10 transition-colors ${hasPaid ? 'bg-green-50/50' : 'bg-white'} ${member.id === members[members.length - 1]?.id ? 'rounded-bl-xl border-b-0' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-stone-200">
                                                    <AvatarFallback className="text-[10px] font-bold bg-stone-50 hover:bg-stone-100 text-stone-400">{getInitials(member.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <Input
                                                        value={member.name}
                                                        onChange={(e) => !isReadOnly && updateMemberName(member.id, e.target.value)}
                                                        readOnly={isReadOnly}
                                                        className={`h-8 border border-transparent bg-transparent text-stone-900 placeholder:text-stone-400 font-bold text-stone-800 px-2 -ml-2 text-sm focus-visible:ring-indigo-100 transition-all ${isReadOnly ? 'cursor-default' : 'hover:bg-white hover:border-stone-200 hover:shadow-sm cursor-text'}`}
                                                        title={!isReadOnly ? 'Nhấn để sửa tên' : undefined}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        {items.map(item => {
                                            const isParticipating = participation[member.id]?.[item.id] || false;
                                            return (
                                                <TableCell key={item.id} className="p-0 border-r border-stone-200">
                                                    <div className="flex flex-row items-center justify-center py-4 gap-3">
                                                        {!isReadOnly && (
                                                            <Checkbox
                                                                checked={isParticipating}
                                                                onCheckedChange={() => setParticipation(prev => ({
                                                                    ...prev,
                                                                    [member.id]: { ...prev[member.id], [item.id]: !prev[member.id]?.[item.id] }
                                                                }))}
                                                                className="h-5 w-5 rounded border-stone-300 transition-none"
                                                            />
                                                        )}

                                                        {isReadOnly ? (
                                                            <span className={`text-[10px] font-bold ${isParticipating ? 'text-indigo-600' : 'text-stone-300 italic'}`}>
                                                                {isParticipating ? formatCurrency(stats.itemSplits[item.id]) : "không sử dụng"}
                                                            </span>
                                                        ) : (
                                                            <span className={`text-[10px] font-medium ${isParticipating ? 'text-indigo-600' : 'text-stone-300'}`}>
                                                                <span className="font-mono tracking-tighter">{formatCurrency(stats.itemSplits[item.id])}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className={`text-center sticky right-[120px] z-10 border-l border-b border-stone-200 transition-colors ${hasPaid ? 'bg-green-50/50' : 'bg-white'} ${member.id === members[members.length - 1]?.id ? 'border-b-0' : ''}`}>
                                            <div className="flex flex-col items-center">
                                                <p className="text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200">
                                                    <span className="font-mono tracking-tighter">{formatCurrency(stats.memberShares[member.id])}</span>
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`p-0 border-l border-b border-stone-200 sticky right-0 z-10 transition-colors ${hasPaid ? 'bg-green-50/50' : 'bg-white'} ${member.id === members[members.length - 1]?.id ? 'rounded-br-xl border-b-0' : ''}`}>
                                            <div className="flex justify-center items-center py-4 h-full">
                                                <Checkbox
                                                    checked={paymentStatus[member.id] || false}
                                                    onCheckedChange={(checked) => !isReadOnly && setPaymentStatus(prev => ({
                                                        ...prev,
                                                        [member.id]: !!checked
                                                    }))}
                                                    disabled={isReadOnly}
                                                    className={`h-5 w-5 rounded-md transition-all ${paymentStatus[member.id] ? 'border-green-500 bg-green-500 text-white shadow-sm' : 'border-stone-300'} ${isReadOnly ? 'opacity-80' : ''}`}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>


            {/* DIALOGS - Simplified */}
            <Dialog open={isMemDialogOpen} onOpenChange={setIsMemDialogOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Thêm thành viên</DialogTitle>
                        <DialogDescription className="text-stone-300 text-sm">
                            Thêm người mới vào nhóm của bạn
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">Tên hiển thị</Label>
                            <Input
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Ví dụ: Hoàng Anh"
                                className="rounded-lg border-stone-200 h-10 px-3 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">Tham gia khoản chi</Label>
                            <ScrollArea className="h-[200px] rounded-lg border border-stone-200 p-2">
                                <div className="space-y-1">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 hover:bg-stone-100 rounded-md">
                                            <Checkbox
                                                checked={selectedItemsForMem[item.id]}
                                                onCheckedChange={() => setSelectedItemsForMem(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                className="h-4 w-4"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold">{item.name}</p>
                                                <p className="text-xs text-stone-400"><span className="font-mono tracking-tighter">{formatCurrency(item.amount)}</span></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button onClick={handleAddMember} className="w-full bg-white text-stone-900 hover:bg-slate-200/90 text-stone-900 text-stone-900 font-bold rounded-lg h-10 transition-none">Thêm thành viên</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Khoản chi mới</DialogTitle>
                        <DialogDescription className="text-stone-300 text-sm">
                            Nhập chi tiết khoản chi và người tham gia
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-stone-300 uppercase">Tên khoản chi</Label>
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Ví dụ: Tiền phòng, Ăn tối..."
                                    className="rounded-lg border-stone-200 h-10 px-3 font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-stone-300 uppercase">Giá trị (VNĐ)</Label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={newCategoryAmount}
                                            onChange={(e) => setNewCategoryAmount(e.target.value)}
                                            className="font-mono rounded-lg border-stone-200 h-10 pl-8 font-semibold text-stone-900"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₫</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[50000, 100000, 200000, 500000, 1000000].map(amount => (
                                            <button
                                                key={amount}
                                                type="button"
                                                onClick={() => setNewCategoryAmount(amount.toString())}
                                                className="px-3 py-1.5 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[10px] font-bold text-slate-600 hover:bg-stone-100 hover:border-stone-300 transition-colors"
                                            >
                                                {amount.toLocaleString('vi-VN')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">Người tham gia chia sẻ</Label>
                            <ScrollArea className="h-[180px] rounded-lg border border-stone-200 p-2">
                                <div className="space-y-1">
                                    {members.map(member => (
                                        <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 hover:bg-stone-100 rounded-md">
                                            <Checkbox
                                                checked={selectedMembersForCat[member.id]}
                                                onCheckedChange={() => setSelectedMembersForCat(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                                                className="h-4 w-4"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[10px] font-bold">{getInitials(member.name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-semibold">{member.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button onClick={handleAddCategory} className="w-full bg-white text-stone-900 hover:bg-slate-200/90 text-stone-900 text-stone-900 font-bold rounded-lg h-10 transition-none">Lưu khoản chi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Heart className="h-5 w-5 text-rose-500" /> Ủng hộ
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-sm">
                            Ghi nhận khoản tiền một thành viên đã đóng góp vào quỹ chung.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">Người ủng hộ</Label>
                            <Select value={newDonationMemberId} onValueChange={(val) => setNewDonationMemberId(val || "")}>
                                <SelectTrigger className="w-full rounded-lg border-stone-200 h-10 px-3 font-semibold text-stone-700">
                                    <SelectValue placeholder="Chọn người ủng hộ..." />
                                </SelectTrigger>
                                <SelectContent className="border-stone-200">
                                    {members.map(member => (
                                        <SelectItem key={member.id} value={member.id} className="font-medium text-stone-700">{member.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">Số tiền ủng hộ (VNĐ)</Label>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={newDonationAmount}
                                        onChange={(e) => setNewDonationAmount(e.target.value)}
                                        className="font-mono h-12 text-2xl font-bold border-none bg-transparent text-stone-900 placeholder:text-stone-400 p-0 focus-visible:ring-0 pl-8"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₫</span>
                                    <div className="h-0.5 bg-slate-200 w-full" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[50000, 100000, 200000, 500000, 1000000].map(amount => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => setNewDonationAmount(amount.toString())}
                                            className="px-3 py-1.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-slate-600 hover:bg-stone-100 hover:border-stone-300 transition-colors"
                                        >
                                            {amount.toLocaleString('vi-VN')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button onClick={handleAddDonation} className="w-full bg-white text-stone-900 hover:bg-slate-200/90 font-bold rounded-lg h-10 transition-none">Xác nhận</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
