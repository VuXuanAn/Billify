"use client";
import React, { useState, useMemo, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import jsQR from "jsqr";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
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
    Crown,
    BarChart3,
    Users,
    PieChart,
    Activity,
    ChevronRight,
    ChevronsUpDown,
    TrendingUp,
    Sparkles,
    Settings2,
    Edit3,
    UploadCloud,
    Trash2,
    Copy,
    Check,
    Loader2,
    AlertCircle,
    Save,
    ImageIcon,
    Download,
    CreditCard,
    Lock,
    Unlock,
    Eye,
    QrCode
} from "lucide-react";
import CurrencyInput from 'react-currency-input-field';
import { IMaskInput } from "react-imask";
import { VIETNAMESE_BANKS } from "@/lib/constants/banks";
import { billService } from "@/lib/services/billService";
import { QRUploadArea } from "./QRUploadArea";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

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
    groupId?: string;
    initialData?: BillTableData;
    isReadOnly?: boolean;
    onDataChange?: (data: BillTableData) => void;
    // Action Props
    saveStatus?: "idle" | "saving" | "success" | "error";
    handleSave?: () => void;
    handleGoToView?: () => void;
    onDelete?: () => void;
}

export function BillTable({
    groupId,
    initialData,
    isReadOnly,
    onDataChange,
    saveStatus,
    handleSave,
    handleGoToView,
    onDelete
}: BillTableProps) {
    const { language } = useLanguageStore();
    const t = translations[language].billTable;
    const commonT = translations[language].common;
    const editorT = translations[language].editor;

    const [groupName, setGroupName] = useState(initialData?.groupName || "");
    const [paymentBank, setPaymentBank] = useState(initialData?.paymentBank || "");
    const [paymentAccount, setPaymentAccount] = useState(initialData?.paymentAccount || "");
    const [paymentQR, setPaymentQR] = useState(initialData?.paymentQR || "");
    const [members, setMembers] = useState<Member[]>(initialData?.members || [
        { id: "m1", name: `${t.members} 1` },
    ]);
    const [items, setItems] = useState<Item[]>(initialData?.items || [
        { id: "i1", name: `${t.category} 1`, amount: 100000 },
    ]);
    const [donations, setDonations] = useState<Donation[]>(initialData?.donations || []);
    const [participation, setParticipation] = useState<Record<string, Record<string, boolean>>>(
        initialData?.participation || { m1: { i1: true } }
    );
    const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>(initialData?.paymentStatus || {});
    const paymentMethod = 'qr';
    const [isQRZoomOpen, setIsQRZoomOpen] = useState(false);

    // Mobile View States
    const [activeTab, setActiveTab] = useState<'member' | 'item'>('member');
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const lastDataRef = useRef<string>("");

    // Sync external data changes if needed
    React.useEffect(() => {
        if (!isReadOnly && onDataChange) {
            const currentDataObj = { groupName, paymentBank, paymentAccount, paymentQR, members, items, donations, participation, paymentStatus };
            const dataString = JSON.stringify(currentDataObj);

            if (dataString !== lastDataRef.current) {
                lastDataRef.current = dataString;
                onDataChange(currentDataObj);
            }
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
    const [openBankDropdown, setOpenBankDropdown] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // QR Cropper States
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState("");
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();

    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            console.log("File selected:", e.target.files[0].name);

            // Clean up old object URL if any
            if (imgSrc && imgSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imgSrc);
            }

            const url = URL.createObjectURL(e.target.files[0]);
            setImgSrc(url);
            setCrop({
                unit: '%',
                x: 0,
                y: 0,
                width: 100,
                height: 100
            });
            setIsCropperOpen(true);
            e.target.value = '';
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        console.log("Image loaded into preview");
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(initialCrop);
    }

    const [isUploadingQR, setIsUploadingQR] = useState(false);

    async function handleCropComplete() {
        if (!imgRef.current || !crop) {
            setIsCropperOpen(false);
            return;
        }

        // Helper for parsing EMVCo TLV (Tag-Length-Value)
        const parseTLV = (data: string) => {
            const tags: Record<string, string> = {};
            try {
                let offset = 0;
                while (offset < data.length - 4) {
                    const tag = data.substring(offset, offset + 2);
                    const lenStr = data.substring(offset + 2, offset + 4);
                    const len = parseInt(lenStr, 10);
                    if (isNaN(len)) break;
                    const val = data.substring(offset + 4, offset + 4 + len);
                    tags[tag] = val;
                    offset += 4 + len;
                }
            } catch (e) {
                console.error("TLVs parsing failed:", e);
            }
            return tags;
        };

        const canvas = document.createElement('canvas');
        const { naturalWidth, naturalHeight } = imgRef.current;

        // Ensure we handle percentage-based crops correctly
        const pixelX = (crop.x * naturalWidth) / 100;
        const pixelY = (crop.y * naturalHeight) / 100;
        const pixelWidth = (crop.width * naturalWidth) / 100;
        const pixelHeight = (crop.height * naturalHeight) / 100;

        // Use a slightly larger size for better QR detection accuracy
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) return;

        // Fill background with white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, targetSize, targetSize);

        ctx.drawImage(
            imgRef.current,
            pixelX,
            pixelY,
            pixelWidth,
            pixelHeight,
            0,
            0,
            targetSize,
            targetSize
        );

        // QR Code Detection
        const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (!code) {
            toast.warning(t.noQRFound, {
                description: t.noQRDescription,
                action: {
                    label: commonT.confirm,
                    onClick: () => proceedWithUpload(canvas)
                },
                cancel: {
                    label: commonT.cancel,
                    onClick: () => { }
                }
            });
            return;
        } else {
            console.log("QR Code detected:", code.data);

            // VietQR / Bank QR processing
            const isVietQR = code.data.startsWith("000201");
            if (isVietQR) {
                const rootTags = parseTLV(code.data);
                const merchantInfo = rootTags["38"]; // Tag 38 is VietQR info

                if (merchantInfo) {
                    const subTags = parseTLV(merchantInfo);
                    const paymentDetail = subTags["01"];

                    if (paymentDetail) {
                        const detailTags = parseTLV(paymentDetail);
                        const bin = detailTags["00"]; // Bank Identification Number
                        const account = detailTags["01"]; // Account Number

                        if (account) {
                            setPaymentAccount(account);

                            // Map popular BINs to bank names
                            const binMap: Record<string, string> = {
                                "970436": "Vietcombank",
                                "970415": "VietinBank",
                                "970418": "BIDV",
                                "970405": "Agribank",
                                "970422": "MB Bank",
                                "970432": "VPBank",
                                "970407": "Techcombank",
                                "970416": "ACB",
                                "970423": "TPBank",
                                "970403": "Sacombank",
                                "970441": "VIB",
                                "970437": "HDBank"
                            };

                            if (bin && binMap[bin]) {
                                setPaymentBank(binMap[bin]);
                                toast.success("Đã tự động điền thông tin ngân hàng!", {
                                    description: `${binMap[bin]} - STK: ${account}`
                                });
                            } else {
                                toast.success("Đã tìm thấy mã QR ngân hàng!", {
                                    description: `STK: ${account}. Vui lòng chọn ngân hàng thủ công.`
                                });
                            }
                        }
                    }
                }
            } else {
                toast.info("Tìm thấy mã QR", {
                    description: "Đã tìm thấy mã QR, nhưng có vẻ không phải là VietQR chuẩn."
                });
            }

            proceedWithUpload(canvas);
        }
    }

    async function proceedWithUpload(canvas: HTMLCanvasElement) {
        setIsUploadingQR(true);
        try {
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((b) => {
                    if (b) resolve(b);
                    else reject(new Error("Canvas to Blob conversion failed"));
                }, 'image/jpeg', 0.8);
            });

            const billId = groupId || initialData?.groupName || 'temp';
            const publicUrl = await billService.uploadQR(billId, blob);
            setPaymentQR(publicUrl);

            // Cleanup
            if (imgSrc && imgSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imgSrc);
                setImgSrc("");
            }
        } catch (error) {
            console.error("Failed to upload QR:", error);
            alert("Không thể tải lên mã QR. Vui lòng thử lại.");
        } finally {
            setIsUploadingQR(false);
            setIsCropperOpen(false);
        }
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

    const handleDownloadQR = async () => {
        if (!paymentQR) return;
        try {
            const response = await fetch(paymentQR);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-${groupId || 'code'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert("Không thể tải xuống mã QR. Vui lòng thử lại.");
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

        const reductionRatio = totalBillAmount > 0
            ? Math.max(0, (totalBillAmount - totalDonationsAmount) / totalBillAmount)
            : (totalDonationsAmount > 0 ? 0 : 1);

        members.forEach(member => {
            let share = 0;
            items.forEach(item => {
                if (participation[member.id]?.[item.id]) share += itemSplits[item.id];
            });
            memberShares[member.id] = share * reductionRatio;
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
            avgPerPerson,
            reductionRatio
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

    const handleRemoveDonations = (memberId: string) => {
        if (isReadOnly) return;
        setDonations(prev => prev.filter(d => d.memberId !== memberId));
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
        <div className="max-w-screen-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-12 text-stone-900 font-sans tracking-tight">

            {/* --- COMPACT HERO HEADER --- */}
            <div className="pb-8 sm:pb-12 border-b border-stone-200">
                {/* 1. Header: Name & Payment Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="shrink-0 order-last md:order-first">
                        {!isReadOnly ? (
                            <div className="flex flex-col items-start md:items-end gap-3">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Mã QR & Thanh toán</p>
                                <QRUploadArea
                                    paymentQR={paymentQR}
                                    isUploadingQR={isUploadingQR}
                                    onSelectFile={onSelectFile}
                                    onDownload={handleDownloadQR}
                                    onClear={() => setPaymentQR("")}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                {paymentQR ? (
                                    <div
                                        className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-2 pr-6 hover:bg-indigo-100 transition-colors cursor-pointer group/qr-btn shadow-sm"
                                        onClick={() => setIsQRZoomOpen(true)}
                                    >
                                        <QrCode />
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-indigo-900 group-hover/qr-btn:text-indigo-700">Mã QR <br /> thanh toán</p>
                                        </div>
                                    </div>
                                ) : (paymentBank || paymentAccount) && (
                                    <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 shadow-sm group/bank-info transition-colors hover:bg-white">
                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-stone-200 text-indigo-600 shadow-sm">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest leading-none">{paymentBank || 'Tài khoản'}</span>
                                            <span className="text-sm font-black text-indigo-900 font-mono tracking-tight">{paymentAccount}</span>
                                        </div>
                                        <button
                                            onClick={handleCopyAccount}
                                            className="ml-2 p-1.5 bg-white border border-stone-100 rounded-lg text-stone-400 hover:text-indigo-600 opacity-0 group-hover/bank-info:opacity-100 transition-all shadow-sm"
                                        >
                                            {copiedAccount ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Left: Group Name with Action Buttons */}
                    <div className="flex-1 min-w-0 order-first md:order-last">
                        {isReadOnly ? (
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-primary leading-[0.9] sm:leading-[0.8]">
                                {groupName || "Tên nhóm..."}
                            </h1>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* Group name */}
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-primary leading-[0.9] sm:leading-[0.8]">
                                    {groupName || "Tên nhóm..."}
                                </h1>

                                {/* Action pill */}
                                <div className="inline-flex items-center self-start bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                                    {/* Edit name */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex items-center gap-2 px-4 py-2.5 text-stone-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-[11px] font-black uppercase tracking-widest group/edit">
                                                <Edit3 className="h-3.5 w-3.5" />
                                                <span>Sửa tên</span>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-4 shadow-2xl border-indigo-100 rounded-2xl" align="start">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Đổi tên nhóm</p>
                                                    <Input
                                                        value={groupName}
                                                        onChange={(e) => setGroupName(e.target.value)}
                                                        className="font-bold border-indigo-100 focus-visible:ring-indigo-500"
                                                        placeholder="Nhập tên nhóm mới..."
                                                        autoFocus
                                                    />
                                                </div>
                                                <p className="text-[10px] text-stone-400 italic">Tên nhóm sẽ được cập nhật ngay lập tức.</p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    {handleGoToView && (
                                        <>
                                            <div className="w-px h-5 bg-stone-200" />
                                            <button
                                                onClick={handleGoToView}
                                                className="flex items-center gap-2 px-4 py-2.5 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors text-[11px] font-black uppercase tracking-widest"
                                                title={commonT.view}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Xem</span>
                                            </button>
                                        </>
                                    )}

                                    {onDelete && (
                                        <>
                                            <div className="w-px h-5 bg-stone-200" />
                                            <button
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors text-[11px] font-black uppercase tracking-widest"
                                                title="Xóa bill này"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span>Xóa</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Payment Shortcut */}

                </div>

                {/* 2. Unified Info Bar */}
                <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                    {/* Members List */}
                    <div className="flex items-center gap-4 group/members">
                        <div className="flex -space-x-4">
                            <TooltipProvider>
                                {members.slice(0, 8).map(member => (
                                    <Tooltip key={member.id}>
                                        <TooltipTrigger>
                                            <Avatar className="h-10 w-10 border-4 border-white shadow-sm block transition-transform hover:scale-110 hover:z-10">
                                                <AvatarFallback className="bg-stone-50 text-stone-400 font-bold text-[10px]">{getInitials(member.name)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold text-[10px]">{member.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                                {members.length > 8 && (
                                    <div className="h-10 w-10 rounded-full border-4 border-white bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-400">
                                        +{members.length - 8}
                                    </div>
                                )}
                            </TooltipProvider>
                        </div>
                        {!isReadOnly && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMemDialogOpen(true)}
                                className="h-8 w-8 rounded-full p-0 border border-stone-200 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Stats Divider */}
                    <div className="hidden md:block h-8 w-px bg-stone-200" />

                    {/* Key Stats Line */}
                    <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-10 gap-y-2">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Tổng cộng</p>
                            <p className="text-xl sm:text-2xl font-black text-stone-900 tracking-tighter">{formatCurrency(stats.totalBillAmount)}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Mỗi người</p>
                            <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tighter">{formatCurrency(stats.avgPerPerson)}</p>
                        </div>
                        {stats.totalDonationsAmount > 0 && (
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Quỹ đóng góp</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl sm:text-2xl font-black text-amber-600 tracking-tighter">+{formatCurrency(stats.totalDonationsAmount)}</p>
                                    <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">-{Math.round((1 - stats.reductionRatio) * 100)}%</span>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>


            {/* Sponsors Bar */}
            {stats.sponsors.length > 0 && (
                <section className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-center">
                                <Crown className="h-6 w-6 text-amber-500 fill-amber-500/20" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-amber-950 uppercase tracking-widest">Vinh danh đóng góp</h3>
                                <p className="text-xs font-semibold text-amber-700/60 mt-0.5">Những thành viên đã ủng hộ thêm cho nhóm</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {stats.sponsors.map((sponsor, idx) => (
                                <div key={sponsor.id} className="relative group/sponsor">
                                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-amber-100/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-bold">{getInitials(sponsor.name)}</AvatarFallback>
                                            </Avatar>
                                            {idx === 0 && (
                                                <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-amber-400/20" title="Hạng 1">
                                                    1
                                                </div>
                                            )}
                                            {idx === 1 && (
                                                <div className="absolute -top-2 -right-2 bg-slate-300 text-slate-800 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm" title="Hạng 2">
                                                    2
                                                </div>
                                            )}
                                            {idx === 2 && (
                                                <div className="absolute -top-2 -right-2 bg-amber-700 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm" title="Hạng 3">
                                                    3
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-900">{sponsor.name}</p>
                                            <p className="text-xs text-amber-600 font-black">+<span className="font-mono tracking-tighter">{formatCurrency(stats.memberDonated[sponsor.id])}</span></p>
                                        </div>
                                    </div>
                                    {!isReadOnly && (
                                        <button
                                            onClick={() => handleRemoveDonations(sponsor.id)}
                                            className="absolute -top-2 -right-2 h-6 w-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/sponsor:opacity-100 transition-opacity hover:bg-amber-600 z-20"
                                            title="Xóa ủng hộ của người này"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {!isReadOnly && (
                <div className="mb-8">
                    {/* Mobile: 2-column grid | Desktop: flex row */}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={openAddDonationDialog}
                            className="border-stone-100 text-stone-700 hover:bg-stone-100 font-bold rounded-lg h-10 px-3 sm:px-4 transition-none shadow-sm shadow-stone-200/50 flex items-center justify-center gap-2"
                        >
                            <Crown className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] uppercase tracking-widest font-black">Ủng hộ</span>
                        </Button>

                        {handleSave && (
                            <Button
                                onClick={handleSave}
                                disabled={saveStatus === "saving"}
                                className={`font-bold rounded-lg h-10 px-3 sm:px-5 flex items-center justify-center gap-2 shadow-sm transition-all ${saveStatus === "success"
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                    : saveStatus === "error"
                                        ? "bg-red-600 hover:bg-red-700 text-white border-none"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-indigo-100 shadow-md"
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
                                <span className="text-[10px] uppercase tracking-widest font-black">
                                    {saveStatus === "saving" ? commonT.saving : saveStatus === "success" ? commonT.saved : saveStatus === "error" ? commonT.error : commonT.save}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Table Matrix - Adaptive Layout */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-md shadow-slate-100 overflow-hidden">
                {/* 1. Desktop Table View */}
                <div className="hidden lg:block">
                    <ScrollArea className="w-full">
                        <Table>
                            <TableHeader className="bg-stone-50 text-stone-900/30 border-b border-stone-200">
                                <TableRow className="hover:bg-transparent text-stone-900 placeholder:text-stone-400">
                                    <TableHead className="w-[140px] sm:w-[180px] md:w-[240px] p-0 border-r border-b border-stone-200 bg-stone-50 text-primary sticky left-0 z-20 rounded-tl-xl align-top relative overflow-hidden group">
                                        <div className="absolute inset-0 pointer-events-none">
                                            <svg className="absolute w-full h-full text-stone-200" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
                                            </svg>
                                        </div>
                                        <div className="absolute top-4 right-3 sm:right-6 text-[10px] font-black tracking-[0.2em] text-primary text-right group-hover:text-stone-900/60 transition-colors">
                                            {t.category}
                                        </div>
                                        <div className="absolute bottom-4 left-3 sm:left-6 text-[10px] font-black tracking-[0.2em] text-primary group-hover:text-stone-900/60 transition-colors">
                                            {t.members}
                                        </div>
                                    </TableHead>
                                    {!isReadOnly && (
                                        <TableHead
                                            onClick={openAddCategoryDialog}
                                            className="w-[130px] border-l border-r border-b border-indigo-100 bg-indigo-50/60 p-0 align-middle cursor-pointer hover:bg-indigo-100/60 transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-indigo-400 hover:text-indigo-600 transition-colors">
                                                <Plus className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{t.addItem}</span>
                                            </div>
                                        </TableHead>
                                    )}
                                    {items.map(item => (
                                        <TableHead key={item.id} className="min-w-[180px] sm:min-w-[220px] md:min-w-[260px] border-l border-r border-b border-stone-200 p-0 align-top group/head transition-colors hover:bg-stone-50/50">
                                            <div className="text-primary p-4 flex flex-row items-center justify-between gap-3 h-full ">
                                                <div className="relative flex-1">
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) => !isReadOnly && setItems(items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                                                        readOnly={isReadOnly}
                                                        className={`h-8 border border-transparent bg-transparent  placeholder:text-primary font-black text-primary px-2 -ml-2 text-sm focus-visible:ring-indigo-100 placeholder:text-stone-500 transition-all ${isReadOnly ? 'cursor-default' : 'hover:bg-white hover:border-stone-200 hover:shadow-sm cursor-text'}`}
                                                        placeholder="Tên khoản chi..."
                                                        title={!isReadOnly ? 'Nhấn để sửa' : undefined}
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
                                                        className={`h-6 w-24 text-right font-mono text-primary placeholder:text-stone-400 font-bold text-sm tracking-tighter p-0 bg-transparent border-none focus:outline-none focus:ring-0 ${isReadOnly ? 'cursor-default opacity-100 bg-transparent disabled:text-stone-900' : 'cursor-text '}`}
                                                        title={!isReadOnly ? 'Nhấn để sửa số tiền' : undefined}
                                                    />
                                                     <span className="text-[10px] font-black text-primary">VND</span>
                                                 </div>
                                             </div>
                                         </TableHead>
                                     ))}
                                    <TableHead className="w-[110px] sm:w-[150px] md:w-[200px] font-black text-stone-900 bg-stone-50 text-primary backdrop-blur-xl sticky right-[100px] sm:right-[120px] z-20 shadow-[inset_1px_-1px_0_0_theme(colors.stone.200),-5px_0_15px_rgba(0,0,0,0.02)] backdrop-blur-md py-10 text-center text-[10px] uppercase tracking-[0.2em]">
                                        Cần đóng
                                    </TableHead>
                                    <TableHead className="w-[100px] sm:w-[120px] font-black text-stone-900 bg-stone-50 text-primary backdrop-blur-xl sticky right-0 z-20 shadow-[inset_1px_-1px_0_0_theme(colors.stone.200),-5px_0_15px_rgba(0,0,0,0.02)] backdrop-blur-md py-10 text-center text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-stone-50/50 rounded-tr-xl">
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
                                                    <div className="relative">
                                                        <Avatar className={`h-8 w-8 border transition-all ${stats.memberDonated[member.id] > 0 ? 'border-amber-300 ring-2 ring-amber-50/50' : 'border-stone-200'}`}>
                                                            <AvatarFallback className={`text-[10px] font-bold transition-colors ${stats.memberDonated[member.id] > 0 ? 'bg-amber-50 text-amber-600' : 'bg-stone-50 hover:bg-stone-100 text-stone-400'}`}>
                                                                {getInitials(member.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {stats.memberDonated[member.id] > 0 && (
                                                            <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm ring-2 ring-white">
                                                                <Check className="h-2 w-2 fill-current" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex items-center gap-2">
                                                        <Input
                                                            value={member.name}
                                                            onChange={(e) => !isReadOnly && updateMemberName(member.id, e.target.value)}
                                                            readOnly={isReadOnly}
                                                            className={`h-8 border border-transparent bg-transparent text-stone-900 placeholder:text-stone-400 font-bold px-2 -ml-2 text-sm focus-visible:ring-indigo-100 transition-all ${stats.memberDonated[member.id] > 0 ? 'text-amber-900' : 'text-stone-800'} ${isReadOnly ? 'cursor-default' : 'hover:bg-white hover:border-stone-200 hover:shadow-sm cursor-text'}`}
                                                            title={!isReadOnly ? 'Nhấn để sửa tên' : undefined}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {!isReadOnly && (
                                                <TableCell className="p-0 border-r border-b border-stone-200 text-center text-stone-200 text-sm font-bold select-none">
                                                    —
                                                </TableCell>
                                            )}
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
                                                                    {isParticipating ? formatCurrency(stats.itemSplits[item.id]) : ""}
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
                                            <TableCell className={`text-center sticky right-[100px] sm:right-[120px] z-10 border-l border-b border-stone-200 transition-colors ${hasPaid ? 'bg-green-50/50' : 'bg-white'} ${member.id === members[members.length - 1]?.id ? 'border-b-0' : ''}`}>
                                                <div className="flex flex-col items-center">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <p className="text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200 cursor-help">
                                                                    <span className="font-mono tracking-tighter">{formatCurrency(stats.memberShares[member.id])}</span>
                                                                </p>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="p-3 border-stone-200 shadow-xl bg-white/95 backdrop-blur-md">
                                                                <div className="space-y-3 min-w-[200px]">
                                                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{translations[language].personalSlip.details}</p>

                                                                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                                                        {items.map(item => {
                                                                            if (!participation[member.id]?.[item.id]) return null;
                                                                            return (
                                                                                <div key={item.id} className="flex justify-between items-start gap-4 text-xs">
                                                                                    <span className="text-stone-600 font-medium line-clamp-1 flex-1">• {item.name}</span>
                                                                                    <span className="font-mono text-stone-900 shrink-0">{formatCurrency(stats.itemSplits[item.id])}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    <div className="pt-2 border-t border-stone-100 space-y-2">
                                                                        <div className="flex justify-between items-center gap-4 text-xs font-bold">
                                                                            <span className="text-stone-500">{translations[language].personalSlip.subtotal}:</span>
                                                                            <span className="font-mono">{formatCurrency(items.reduce((acc, item) =>
                                                                                participation[member.id]?.[item.id] ? acc + stats.itemSplits[item.id] : acc, 0
                                                                            ))}</span>
                                                                        </div>

                                                                        {stats.reductionRatio < 1 && (
                                                                            <>
                                                                                <div className="flex justify-between items-center gap-4 text-xs font-medium">
                                                                                    <span className="text-stone-500 italic">{translations[language].personalSlip.deduction} ({Math.round((1 - stats.reductionRatio) * 100)}%):</span>
                                                                                    <span className="text-indigo-500 font-mono">-{formatCurrency(items.reduce((acc, item) =>
                                                                                        participation[member.id]?.[item.id] ? acc + stats.itemSplits[item.id] : acc, 0
                                                                                    ) * (1 - stats.reductionRatio))}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center gap-4 text-sm font-black pt-1 border-t border-stone-100">
                                                                                    <span className="text-stone-900">{t.debt}:</span>
                                                                                    <span className="text-stone-900 font-mono">{formatCurrency(stats.memberShares[member.id])}</span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
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
                                {!isReadOnly && (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell
                                            colSpan={items.length + 4}
                                            className="p-0 border-t border-stone-100"
                                        >
                                            <button
                                                onClick={openAddMemberDialog}
                                                className="w-full flex items-center justify-center gap-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all text-xs font-black uppercase tracking-widest py-4"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                {t.addMember}
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                {/* 2. Adaptive Mobile View */}
                <div className="lg:hidden bg-stone-50/50">
                    <div className="flex border-b border-stone-200">
                        <button
                            onClick={() => setActiveTab('member')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'member' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            {t.viewByMember}
                        </button>
                        <button
                            onClick={() => setActiveTab('item')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'item' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            {t.viewByItem}
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {activeTab === 'member' ? (
                            members.map(member => {
                                const isExpanded = expandedIds[member.id];
                                const hasPaid = paymentStatus[member.id];
                                return (
                                    <div key={member.id} className={`bg-white rounded-2xl border transition-all ${hasPaid ? 'border-green-100 shadow-sm' : 'border-stone-100 shadow-sm shadow-stone-200/50'}`}>
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleExpand(member.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-stone-100">
                                                    <AvatarFallback className={`font-bold text-xs ${hasPaid ? 'bg-green-50 text-green-600' : 'bg-stone-50 text-stone-400'}`}>
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className={`font-bold text-sm ${hasPaid ? 'text-green-900' : 'text-stone-900'}`}>{member.name}</p>
                                                    <p className="text-[10px] font-black text-indigo-600/70 tracking-tighter uppercase">{formatCurrency(stats.memberShares[member.id])}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={paymentStatus[member.id] || false}
                                                        onCheckedChange={(checked) => !isReadOnly && setPaymentStatus(prev => ({
                                                            ...prev,
                                                            [member.id]: !!checked
                                                        }))}
                                                        className={`h-6 w-6 rounded-lg ${paymentStatus[member.id] ? 'border-green-500 bg-green-500 text-white' : 'border-stone-200'}`}
                                                    />
                                                </div>
                                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                                    <ChevronRight className="h-4 w-4 text-stone-300" />
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-2 border-t border-stone-50 space-y-3">
                                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t.category}</p>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {items.map(item => {
                                                        const isParticipating = participation[member.id]?.[item.id];
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isParticipating ? 'bg-indigo-50/30 border-indigo-50' : 'bg-white border-transparent'}`}
                                                                onClick={() => !isReadOnly && setParticipation(prev => ({
                                                                    ...prev,
                                                                    [member.id]: { ...prev[member.id], [item.id]: !prev[member.id]?.[item.id] }
                                                                }))}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Checkbox
                                                                        checked={isParticipating}
                                                                        className="h-4 w-4"
                                                                        onCheckedChange={() => { }} // Controlled by Div above
                                                                    />
                                                                    <span className={`text-xs font-bold ${isParticipating ? 'text-indigo-900' : 'text-stone-400'}`}>{item.name}</span>
                                                                </div>
                                                                <span className={`text-[10px] font-mono ${isParticipating ? 'text-indigo-600' : 'text-stone-300'}`}>
                                                                    {formatCurrency(stats.itemSplits[item.id])}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            items.map(item => {
                                const isExpanded = expandedIds[item.id];
                                const participantCount = members.filter(m => participation[m.id]?.[item.id]).length;
                                return (
                                    <div key={item.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm shadow-stone-200/50 transition-all">
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleExpand(item.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-stone-900">{item.name}</p>
                                                    <p className="text-[10px] font-black text-stone-400 tracking-tighter uppercase">{formatCurrency(item.amount)} • {participantCount} {t.members.toLowerCase()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-emerald-600 tracking-tighter uppercase">{formatCurrency(stats.itemSplits[item.id])}</p>
                                                    <p className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">mỗi người</p>
                                                </div>
                                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                                    <ChevronRight className="h-4 w-4 text-stone-300" />
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-2 border-t border-stone-50 space-y-3">
                                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t.members}</p>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {members.map(member => {
                                                        const isParticipating = participation[member.id]?.[item.id];
                                                        return (
                                                            <div
                                                                key={member.id}
                                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isParticipating ? 'bg-indigo-50/30 border-indigo-50' : 'bg-white border-transparent'}`}
                                                                onClick={() => !isReadOnly && setParticipation(prev => ({
                                                                    ...prev,
                                                                    [member.id]: { ...prev[member.id], [item.id]: !prev[member.id]?.[item.id] }
                                                                }))}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Checkbox
                                                                        checked={isParticipating}
                                                                        className="h-4 w-4"
                                                                        onCheckedChange={() => { }}
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6 border border-stone-100">
                                                                            <AvatarFallback className="font-bold text-[8px] bg-stone-50 text-stone-400">{getInitials(member.name)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <span className={`text-xs font-bold ${isParticipating ? 'text-indigo-900' : 'text-stone-400'}`}>{member.name}</span>
                                                                    </div>
                                                                </div>
                                                                {isParticipating && (
                                                                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Đang tham gia</div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Mobile Add Button — tab-aware */}
                    {!isReadOnly && (
                        <div className="px-4 pb-4">
                            {activeTab === 'member' ? (
                                <Button
                                    variant="outline"
                                    onClick={openAddMemberDialog}
                                    className="w-full border-stone-200 text-stone-700 hover:bg-stone-50 font-bold rounded-xl h-11 flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span className="text-xs">{t.addMember}</span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={openAddCategoryDialog}
                                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl h-11 flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="text-xs">{t.addItem}</span>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* DIALOGS - Simplified */}
            <Dialog open={isMemDialogOpen} onOpenChange={setIsMemDialogOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{t.addMember}</DialogTitle>
                        <DialogDescription className="text-stone-300 text-sm">
                            {t.addMember}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">{t.members}</Label>
                            <Input
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Ví dụ: Hoàng Anh"
                                className="rounded-lg border-stone-200 h-10 px-3 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">{t.category}</Label>
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
                        <Button onClick={handleAddMember} className="w-full bg-white text-stone-900 hover:bg-slate-200/90 text-stone-900 text-stone-900 font-bold rounded-lg h-10 transition-none">{t.addMember}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{t.addItem}</DialogTitle>
                        <DialogDescription className="text-stone-300 text-sm">
                            {t.addItem}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-stone-300 uppercase">{t.category}</Label>
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Ví dụ: Tiền phòng, Ăn tối..."
                                    className="rounded-lg border-stone-200 h-10 px-3 font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-stone-300 uppercase">{t.amount} (VNĐ)</Label>
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
                            <Label className="text-xs font-bold text-stone-300 uppercase">{t.members}</Label>
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
                        <Button onClick={handleAddCategory} className="w-full bg-white text-stone-900 hover:bg-slate-200/90 text-stone-900 text-stone-900 font-bold rounded-lg h-10 transition-none">{commonT.save}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-500" /> {t.addDonation}
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-sm">
                            {t.addDonation}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-stone-300 uppercase">{t.members}</Label>
                            <Select value={newDonationMemberId} onValueChange={(val) => setNewDonationMemberId(val || "")}>
                                <SelectTrigger className="w-full rounded-lg border-stone-200 h-10 px-3 font-semibold text-stone-700">
                                    <SelectValue placeholder={t.sponsorsSubtitle}>
                                        {members.find(m => m.id === newDonationMemberId)?.name}
                                    </SelectValue>
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
                        <Button onClick={handleAddDonation} className="w-full bg-white text-stone-900 hover:bg-slate-200/90 font-bold rounded-lg h-10 transition-none">{commonT.confirm}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Cropper Dialog */}
            <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{t.qrCode}</DialogTitle>
                        <DialogDescription className="text-stone-500 text-sm">
                            {t.qrAndPayment}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-2 bg-stone-50 rounded-xl border border-dashed border-stone-200 mt-4 overflow-auto max-h-[450px]">
                        {imgSrc ? (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                aspect={1}
                                circularCrop={false}
                                className="rounded-lg shadow-sm"
                            >
                                <img
                                    ref={imgRef}
                                    alt="Mã QR"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="block w-full h-auto min-h-[100px] bg-white"
                                    style={{ border: '1px solid #f1f1f1' }}
                                />
                            </ReactCrop>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-12">
                                <Loader2 className="h-8 w-8 text-stone-300 animate-spin" />
                                <p className="text-xs text-stone-400 font-bold">{commonT.loading}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex flex-row gap-3 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsCropperOpen(false)}
                            className="flex-1 font-bold border-stone-200 h-10 rounded-lg hover:bg-stone-50"
                        >
                            {commonT.cancel}
                        </Button>
                        <Button
                            onClick={handleCropComplete}
                            disabled={isUploadingQR}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 rounded-lg shadow-sm"
                        >
                            {isUploadingQR ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {commonT.saving}
                                </>
                            ) : (
                                commonT.confirm
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Zoom Dialog */}
            <Dialog open={isQRZoomOpen} onOpenChange={setIsQRZoomOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-white p-6 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t.qrCode}</h2>
                                        <p className="text-sm font-semibold text-stone-500 mt-1">{t.qrAndPayment}</p>
                                    </div>
                                    <div className="p-3 bg-indigo-50 rounded-2xl">
                                        <Sparkles className="h-6 w-6 text-indigo-600" />
                                    </div>
                                </div>

                                <div className="aspect-square bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-4 flex items-center justify-center">
                                    <img
                                        src={paymentQR}
                                        alt="QR Zoom"
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={handleDownloadQR}
                                        className="bg-stone-900 hover:bg-stone-800 text-white font-bold h-12 rounded-xl shadow-lg transition-all"
                                    >
                                        <Download className="h-4 w-4 mr-2" /> {commonT.download}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsQRZoomOpen(false)}
                                        className="border-stone-200 text-stone-600 hover:bg-stone-50 font-bold h-12 rounded-xl"
                                    >
                                        {commonT.close}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="rounded-2xl border-stone-200 shadow-xl sm:max-w-sm p-6">
                    <DialogHeader>
                        <div className="mx-auto mb-4 h-14 w-14 bg-red-50 rounded-full flex items-center justify-center">
                            <Trash2 className="h-7 w-7 text-red-500" />
                        </div>
                        <DialogTitle className="text-center text-xl font-black text-stone-900">Xóa bill này?</DialogTitle>
                        <DialogDescription className="text-center text-stone-400 text-sm mt-1">
                            Hành động này không thể hoàn tác. Toàn bộ dữ liệu bill sẽ bị xóa vĩnh viễn.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 mt-6 sm:flex-row flex-col">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="flex-1 border-stone-200 text-stone-600 hover:bg-stone-50 font-bold h-11 rounded-xl"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={() => { setIsDeleteDialogOpen(false); onDelete?.(); }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold h-11 rounded-xl shadow-sm shadow-red-200"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa vĩnh viễn
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
