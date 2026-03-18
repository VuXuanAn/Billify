"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useBillStore } from "@/store/useBillStore";
import { useAuthStore } from "@/store/useAuthStore";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, LayoutDashboard, LogIn } from "lucide-react";

export function Header() {
  const { setStep } = useBillStore();
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenBill = () => {
    let id;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      id = uuidv4();
    }
    setStep("setup");
    router.push(`/${id}`);
  };

  const handleLogoClick = () => {
    if (pathname !== "/") {
      router.push("/");
    }
    setStep("landing");
  };

  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-stone-900 leading-none">
              Billify
            </h1>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 uppercase tracking-tighter">
              Beta
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">


          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center h-9 w-9 rounded-full border border-stone-200 overflow-hidden hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {user.user_metadata?.full_name || "Người dùng"}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')} className="flex items-center px-3 py-2 text-sm text-stone-700 cursor-pointer hover:bg-stone-50 rounded-md mx-1">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-stone-400" />
                  <span>Tổng quan</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center px-3 py-2 text-sm text-red-600 font-bold cursor-pointer hover:bg-red-50 rounded-md mx-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => signInWithGoogle()}
              variant="outline"
              disabled={loading}
              className="border-stone-200 text-stone-700 font-bold h-9 sm:h-10 px-4 sm:px-6 text-sm shadow-sm hover:bg-stone-50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Đăng nhập
            </Button>
          )}


        </div>
      </div>
    </header>
  );
}
