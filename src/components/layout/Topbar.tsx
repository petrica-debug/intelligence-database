"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Shield, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui";

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
    <header className="h-14 bg-accent border-b border-accent-hover px-5 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight leading-none text-white">RFE Database</h1>
          <span className="text-[10px] text-white/60 tracking-wider uppercase">Roma Foundations for Europe</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="relative w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          onClick={() => document.getElementById("notifPanel")?.classList.toggle("hidden")}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unread}</span>
          )}
        </button>
        <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold text-white">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-white">{currentUser.username}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">
              {currentUser.role === "admin" ? "Admin" : currentUser.access}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/60 hover:text-amber hover:bg-white/10">
          <LogOut size={14} />
        </Button>
      </div>
    </header>
  );
}
