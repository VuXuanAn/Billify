"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useBillStore } from "@/store/useBillStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { translations } from "@/lib/translations";

export default function NewBillPage() {
  const router = useRouter();
  const { setGroupName, setSetupMembers } = useBillStore();
  const { language } = useLanguageStore();
  const t = translations[language].newBill;
  const commonT = translations[language].common;

  const [groupName, setGroupNameLocal] = useState("");
  const [setupMembers, setSetupMembersLocal] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!groupName || setupMembers.length === 0) return;

    setIsCreating(true);

    // 1. Generate local UUID
    const id = crypto.randomUUID();

    // 2. Set the global store state to pass to the editor
    setGroupName(groupName);
    setSetupMembers(setupMembers);

    // 3. Navigate to the editor
    router.push(`/${id}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-blue-500/20">
      <Header />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-50 py-24">
          <div className="w-full max-w-md bg-white border border-stone-200 shadow-sm p-10 rounded-2xl space-y-8">
            <div className="space-y-3 text-center sm:text-left">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t.title}</h2>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">{t.description}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">{t.groupNameLabel}</label>
                <Input
                  autoFocus
                  disabled={isCreating}
                  maxLength={50}
                  value={groupName}
                  onChange={(e) => setGroupNameLocal(e.target.value)}
                  placeholder={t.groupNamePlaceholder}
                  className="h-12 text-base font-medium rounded-lg border-stone-300 bg-white focus-visible:ring-blue-500 placeholder:text-stone-400"
                />
                <div className="text-right text-[10px] font-bold text-stone-400 mt-1">
                  {groupName.length}/50
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">{translations[language].billTable.members}</label>

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      disabled={isCreating}
                      maxLength={20}
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder={t.membersPlaceholder}
                      className="h-12 pl-4 pr-14 text-base font-medium rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:bg-white placeholder:text-stone-400 transition-all shadow-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMemberName.trim()) {
                          e.preventDefault();
                          if (!setupMembers.includes(newMemberName.trim())) {
                            setSetupMembersLocal([...setupMembers, newMemberName.trim()]);
                          }
                          setNewMemberName("");
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      disabled={isCreating || !newMemberName.trim()}
                      onClick={() => {
                        if (newMemberName.trim() && !setupMembers.includes(newMemberName.trim())) {
                          setSetupMembersLocal([...setupMembers, newMemberName.trim()]);
                          setNewMemberName("");
                        }
                      }}
                      className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-stone-100 disabled:text-stone-300 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="text-right text-[10px] font-bold text-stone-400">
                    {newMemberName.length}/20
                  </div>
                </div>

                {setupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {setupMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-white border border-stone-200 shadow-sm rounded-full text-sm font-semibold text-stone-700 animate-in fade-in zoom-in-95 duration-200"
                      >
                        <span className="max-w-[140px] truncate">{member}</span>
                        {!isCreating && (
                          <button
                            type="button"
                            onClick={() => setSetupMembersLocal(setupMembers.filter((_, i) => i !== idx))}
                            className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                            title={translations[language].billTable.deleteMember}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  disabled={isCreating || !groupName || setupMembers.length === 0}
                  onClick={handleCreate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-12 text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {commonT.loading}
                    </>
                  ) : (
                    commonT.confirm
                  )}
                </Button>
                <div className="text-center">
                  <button
                    disabled={isCreating}
                    onClick={() => router.push("/")}
                    className="text-stone-400 text-sm font-medium hover:text-stone-900 transition-colors disabled:opacity-30"
                  >
                    {commonT.cancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
