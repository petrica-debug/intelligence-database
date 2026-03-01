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
    <header className="h-14 bg-surface border-b border-border px-5 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center">
          <Shield size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight leading-none">IntelDB</h1>
          <span className="text-[10px] text-text-3 tracking-wider uppercase">Intelligence Platform</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="relative w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-2 hover:text-text hover:bg-surface-3 transition-colors cursor-pointer"
          onClick={() => document.getElementById("notifPanel")?.classList.toggle("hidden")}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unread}</span>
          )}
        </button>
        <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-accent-muted flex items-center justify-center text-[11px] font-bold text-accent">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-medium">{currentUser.username}</div>
            <div className="text-[10px] text-text-3 uppercase tracking-wider">
              {currentUser.role === "admin" ? "Admin" : currentUser.access}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-text-3 hover:text-red">
          <LogOut size={14} />
        </Button>
      </div>
    </header>
  );
}
