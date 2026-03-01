"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Shield, Bell, LogOut, ChevronDown } from "lucide-react";
import { CLEARANCE_LABELS } from "@/types";
import type { ClearanceLevel } from "@/types";

export function Topbar() {
  const { currentUser, logout, db, updateDb } = useApp();
  const router = useRouter();
  if (!currentUser) return null;

  const target = currentUser.role === "admin" ? "admin" : currentUser.username;
  const unread = db.notifications.filter(
    (n) => (n.forUser === target || n.forUser === currentUser.username) && !n.read
  ).length;

  const handleLogout = () => {
    updateDb((d) => {
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser.username, action: "LOGOUT", detail: "User logged out" });
    });
    logout();
    router.replace("/");
  };

  return (
    <header className="h-[56px] bg-gradient-to-r from-accent via-accent to-[#253f63] border-b border-white/10 px-5 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-accent/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <Shield size={15} className="text-white" />
        </div>
        <div>
          <h1 className="text-[13px] font-bold tracking-tight leading-none text-white">RFE Database</h1>
          <span className="text-[9px] text-white/50 tracking-[1px] uppercase font-medium">Roma Foundations for Europe</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          className="relative w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all duration-200 cursor-pointer"
          onClick={() => document.getElementById("notifPanel")?.classList.toggle("hidden")}
        >
          <Bell size={15} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{unread}</span>
          )}
        </button>
        <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-1.5 ml-1">
          <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-[10px] font-bold text-white">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-medium text-white">{currentUser.fullName ?? currentUser.username}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider font-medium">
              L{currentUser.clearance ?? 1} · {CLEARANCE_LABELS[(currentUser.clearance ?? 1) as ClearanceLevel]}
            </div>
          </div>
          <ChevronDown size={12} className="text-white/30 ml-1" />
        </div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-amber hover:bg-white/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
