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
    Image as ImageIcon,
    Download
} from "lucide-react";
import CurrencyInput from 'react-currency-input-field';
import { IMaskInput } from "react-imask";
import { VIETNAMESE_BANKS } from "@/lib/constants/banks";
import { billService } from "@/lib/services/billService";

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
}

export function BillTable({ groupId, initialData, isReadOnly, onDataChange }: BillTableProps) {
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
    const [paymentMethod, setPaymentMethod] = useState<'manual' | 'qr'>(initialData?.paymentQR ? 'qr' : 'manual');
    const [isQRZoomOpen, setIsQRZoomOpen] = useState(false);

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

    // QR Cropper States
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState("");
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        const targetSize = 250;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.drawImage(
            imgRef.current,
            (crop.x || 0) * scaleX,
            (crop.y || 0) * scaleY,
            (crop.width || 0) * scaleX,
            (crop.height || 0) * scaleY,
            0,
            0,
            targetSize,
            targetSize
        );

        // QR Code Detection
        const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (!code) {
            toast.warning("Không tìm thấy mã QR", {
                description: "Vùng đã cắt có vẻ không chứa mã QR hợp lệ. Bạn có muốn tiếp tục tải lên không?",
                action: {
                    label: "Tiếp tục",
                    onClick: () => proceedWithUpload(canvas)
                },
                cancel: {
                    label: "Hủy"
                }
            });
            return;
        } else {
            console.log("QR Code detected:", code.data);
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

                    {/* Payment Information Section */}
                    <div className="flex flex-col gap-6 pt-2">
                        {/* Method Toggle */}
                        {!isReadOnly && (
                            <div className="flex bg-stone-100 p-1 rounded-xl w-fit border border-stone-200/50">
                                <button
                                    onClick={() => {
                                        setPaymentMethod('manual');
                                        setPaymentQR("");
                                    }}
                                    className={cn(
                                        "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                        paymentMethod === 'manual' 
                                            ? "bg-white text-indigo-600 shadow-sm" 
                                            : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    Chuyển khoản
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentMethod('qr');
                                        setPaymentBank("");
                                        setPaymentAccount("");
                                    }}
                                    className={cn(
                                        "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                        paymentMethod === 'qr' 
                                            ? "bg-white text-indigo-600 shadow-sm" 
                                            : "text-stone-500 hover:text-stone-700"
                                    )}
                                >
                                    Mã QR
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Manual Entry Mode */}
                            {!isReadOnly && paymentMethod === 'manual' && (
                                <>
                                    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 h-12 shadow-sm focus-within:border-indigo-500/50 transition-all">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest whitespace-nowrap">Ngân hàng:</span>
                                        <Popover open={openBankDropdown} onOpenChange={setOpenBankDropdown}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    role="combobox"
                                                    aria-expanded={openBankDropdown}
                                                    className="h-8 justify-between px-0 font-bold text-sm text-stone-700 hover:bg-transparent min-w-[150px] shadow-none"
                                                >
                                                    <span className="truncate">
                                                        {paymentBank
                                                            ? VIETNAMESE_BANKS.find((bank) => bank.name === paymentBank)?.name || paymentBank
                                                            : "Chọn ngân hàng..."}
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Tìm ngân hàng..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
                                                        <CommandGroup>
                                                            <ScrollArea className="h-64">
                                                                {VIETNAMESE_BANKS.map((bank) => (
                                                                    <CommandItem
                                                                        key={bank.id}
                                                                        value={`${bank.name} ${bank.fullName}`}
                                                                        onSelect={() => {
                                                                            setPaymentBank(bank.name);
                                                                            setOpenBankDropdown(false);
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                paymentBank === bank.name ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold">{bank.name}</span>
                                                                            <span className="text-[10px] text-stone-500 truncate max-w-[220px]">{bank.fullName}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </ScrollArea>
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 h-12 shadow-sm focus-within:border-indigo-500/50 transition-all group">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest whitespace-nowrap">Số tài khoản:</span>
                                        <Input
                                            value={paymentAccount}
                                            onChange={(e) => setPaymentAccount(e.target.value)}
                                            className="border-none bg-transparent text-stone-900 placeholder:text-stone-400 h-8 p-0 text-sm font-bold focus-visible:ring-0 min-w-[150px] placeholder:text-stone-300 flex-1"
                                            placeholder="Số tài khoản..."
                                        />
                                        {paymentAccount && (
                                            <button
                                                onClick={handleCopyAccount}
                                                className="p-1.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-indigo-600 transition-all"
                                            >
                                                {copiedAccount ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* QR Mode Entry */}
                            {!isReadOnly && paymentMethod === 'qr' && (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                        ref={fileInputRef}
                                        onChange={onSelectFile}
                                        className="hidden"
                                    />
                                    {paymentQR ? (
                                        <div className="group relative w-32 h-32 rounded-2xl overflow-hidden border border-stone-200 shadow-sm animate-in zoom-in duration-300">
                                            <img src={paymentQR} alt="QR Preview" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleDownloadQR}
                                                        className="p-2 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform"
                                                        title="Tải mã QR"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setPaymentQR("")}
                                                        className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest font-sans">Thay đổi</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingQR}
                                            className="w-32 h-32 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all group text-stone-400"
                                        >
                                            {isUploadingQR ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-stone-50 rounded-xl group-hover:bg-white transition-colors">
                                                        <Plus className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 text-center">Tải lên mã QR</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* View Mode Display */}
                            {isReadOnly && (
                                <>
                                    {/* Manual Display if no QR or user preferred manual */}
                                    {!paymentQR && (paymentBank || paymentAccount) && (
                                        <div className="flex flex-wrap items-center gap-4">
                                            {paymentBank && (
                                                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 h-12 shadow-sm">
                                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest whitespace-nowrap">Ngân hàng:</span>
                                                    <span className="text-sm font-bold text-stone-700">{paymentBank}</span>
                                                </div>
                                            )}
                                            {paymentAccount && (
                                                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 h-12 shadow-sm group">
                                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest whitespace-nowrap">Số tài khoản:</span>
                                                    <span className="text-sm font-bold text-stone-700">{paymentAccount}</span>
                                                    <button
                                                        onClick={handleCopyAccount}
                                                        className="p-1.5 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        {copiedAccount ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* QR Display */}
                                    {paymentQR && (
                                        <div className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                                            <div 
                                                className="bg-white p-2 rounded-xl shadow-sm border border-stone-200 shrink-0 cursor-pointer group relative overflow-hidden"
                                                onClick={() => setIsQRZoomOpen(true)}
                                            >
                                                <img src={paymentQR} alt="QR Code Thanh Toán" className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg transition-all duration-300 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Sparkles className="text-white h-8 w-8 animate-pulse" />
                                                </div>
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
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleDownloadQR}
                                                        className="bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold h-8 rounded-lg shadow-sm"
                                                    >
                                                        <Download className="h-3.5 w-3.5 mr-1.5" /> Tải mã QR
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
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
                            <p className="text-3xl font-black text-indigo-600 tracking-tighter truncate">+<span className="font-mono tracking-tighter">{formatCurrency(stats.totalDonationsAmount)}</span></p>
                            <p className="text-[10px] font-bold text-stone-400 mt-2 flex items-center gap-1.5 italic">
                                <span>Cả nhóm được giảm:</span>
                                <span className="text-indigo-500 not-italic">{Math.round((1 - stats.reductionRatio) * 100)}%</span>
                            </p>
                        </div>
                    )}
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
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={openAddDonationDialog}
                        className="border-stone-200 text-stone-700 hover:bg-stone-50 hover:bg-stone-100 font-bold rounded-lg h-10 px-4 transition-none"
                    >
                        <Crown className="h-4 w-4 mr-2" /> Ủng hộ
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
                                        <div className="text-primary p-4 flex flex-row items-center justify-between gap-3 h-full ">
                                            <div className="relative flex-1">
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => !isReadOnly && setItems(items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i))}
                                                    readOnly={isReadOnly}
                                                    className={`h-8 border border-transparent bg-transparent  placeholder:text-primary font-black text-primary px-2 -ml-2 text-sm focus-visible:ring-indigo-100 placeholder:text-stone-500 transition-all ${isReadOnly ? 'cursor-default' : 'hover:bg-white hover:border-stone-200 hover:shadow-sm cursor-text'}`}
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
                                                    className={`h-6 w-24 text-right font-mono text-primary placeholder:text-stone-400 font-bold text-sm tracking-tighter p-0 bg-transparent border-none focus:outline-none focus:ring-0 ${isReadOnly ? 'cursor-default opacity-100 bg-transparent disabled:text-stone-900' : 'cursor-text '}`}
                                                    title={!isReadOnly ? 'Nhấn để sửa số tiền' : undefined}
                                                />
                                                <span className="text-[10px] font-black text-primary">VND</span>
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
                                                <div className="relative">
                                                    <Avatar className={`h-8 w-8 border transition-all ${stats.memberDonated[member.id] > 0 ? 'border-amber-300 ring-2 ring-amber-50/50' : 'border-stone-200'}`}>
                                                        <AvatarFallback className={`text-[10px] font-bold transition-colors ${stats.memberDonated[member.id] > 0 ? 'bg-amber-50 text-amber-600' : 'bg-stone-50 hover:bg-stone-100 text-stone-400'}`}>
                                                            {getInitials(member.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {stats.memberDonated[member.id] > 0 && (
                                                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm ring-2 ring-white">
                                                            <Crown className="h-2 w-2 fill-current" />
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
                                                    {stats.memberDonated[member.id] > 0 && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger render={<div className="cursor-help shrink-0" />}>
                                                                    <Crown className="h-3 w-3 text-amber-500 fill-amber-500 animate-pulse" />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right">
                                                                    <p className="text-[10px] font-bold">Người ủng hộ quỹ</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
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
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger render={<div className="cursor-help" />}>
                                                            <p className="text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-md border border-stone-200">
                                                                <span className="font-mono tracking-tighter">{formatCurrency(stats.memberShares[member.id])}</span>
                                                            </p>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="p-3 border-stone-200 shadow-xl bg-white/95 backdrop-blur-md">
                                                            <div className="space-y-3 min-w-[200px]">
                                                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Chi tiết tham gia</p>
                                                                
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
                                                                        <span className="text-stone-500">Tổng món ăn:</span>
                                                                        <span className="font-mono">{formatCurrency(items.reduce((acc, item) => 
                                                                            participation[member.id]?.[item.id] ? acc + stats.itemSplits[item.id] : acc, 0
                                                                        ))}</span>
                                                                    </div>
                                                                    
                                                                    {stats.reductionRatio < 1 && (
                                                                        <>
                                                                            <div className="flex justify-between items-center gap-4 text-xs font-medium">
                                                                                <span className="text-stone-500 italic">Chiết khấu ({Math.round((1 - stats.reductionRatio) * 100)}%):</span>
                                                                                <span className="text-indigo-500 font-mono">-{formatCurrency(items.reduce((acc, item) => 
                                                                                    participation[member.id]?.[item.id] ? acc + stats.itemSplits[item.id] : acc, 0
                                                                                ) * (1 - stats.reductionRatio))}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center gap-4 text-sm font-black pt-1 border-t border-stone-100">
                                                                                <span className="text-stone-900">Cần đóng:</span>
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
                            <Crown className="h-5 w-5 text-amber-500" /> Ủng hộ
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
                                    <SelectValue placeholder="Chọn người ủng hộ...">
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
                        <Button onClick={handleAddDonation} className="w-full bg-white text-stone-900 hover:bg-slate-200/90 font-bold rounded-lg h-10 transition-none">Xác nhận</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Cropper Dialog */}
            <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
                <DialogContent className="rounded-xl border-stone-200 shadow-lg sm:max-w-md p-6 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Cắt mã QR</DialogTitle>
                        <DialogDescription className="text-stone-500 text-sm">
                            Điều chỉnh vùng chứa mã QR để ứng dụng nhận diện tốt hơn.
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
                                <p className="text-xs text-stone-400 font-bold">Đang tải hình ảnh...</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex flex-row gap-3 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsCropperOpen(false)}
                            className="flex-1 font-bold border-stone-200 h-10 rounded-lg hover:bg-stone-50"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCropComplete}
                            disabled={isUploadingQR}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 rounded-lg shadow-sm"
                        >
                            {isUploadingQR ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tải...
                                </>
                            ) : (
                                "Hoàn tất & Tải lên"
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
                                        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Mã QR Thanh toán</h2>
                                        <p className="text-sm font-semibold text-stone-500 mt-1">Quét mã để hoàn tất thanh toán.</p>
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
                                        <Download className="h-4 w-4 mr-2" /> Tải xuống
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsQRZoomOpen(false)}
                                        className="border-stone-200 text-stone-600 hover:bg-stone-50 font-bold h-12 rounded-xl"
                                    >
                                        Đóng
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
