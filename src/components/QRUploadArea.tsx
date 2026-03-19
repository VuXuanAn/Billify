"use client";

import React from "react";
import { Download, Trash2, Plus, Loader2 } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

interface QRUploadAreaProps {
    paymentQR: string;
    isUploadingQR: boolean;
    onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDownload: () => void;
    onClear: () => void;
}

export const QRUploadArea: React.FC<QRUploadAreaProps> = ({
    paymentQR,
    isUploadingQR,
    onSelectFile,
    onDownload,
    onClear,
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { language } = useLanguageStore();
    const t = translations[language].billTable;
    const commonT = translations[language].common;

    return (
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload();
                                }}
                                className="p-2 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform"
                                title={t.qrCode}
                            >
                                <Download className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                }}
                                className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                                title={commonT.delete}
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest font-sans">{translations[language].billTable.actions}</span>
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
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 text-center">{t.uploadQR}</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};
