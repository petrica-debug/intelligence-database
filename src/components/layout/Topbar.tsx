"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Bell, LogOut, Plus, Search, FileText, Share2, Zap, Menu } from "lucide-react";
import { CLEARANCE_LABELS } from "@/types";
import type { ClearanceLevel } from "@/types";
import Link from "next/link";
import { useMemo } from "react";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { currentUser, logout, db, updateDb } = useApp();
  const router = useRouter();
  if (!currentUser) return null;

  const target = currentUser.role === "admin" ? "admin" : currentUser.username;
  const unread = db.notifications.filter(
    (n) => (n.forUser === target || n.forUser === currentUser.username) && !n.read
  ).length;

  const clearance = (currentUser.clearance ?? 1) as ClearanceLevel;
  const totalLinks = db.entries.reduce((s, e) => s + e.linkedTo.length, 0);
  const regions = useMemo(() => new Set(db.entries.map((e) => e.country).filter(Boolean)).size, [db.entries]);
  const signals = db.signals.length;

  const handleLogout = () => {
    updateDb((d) => {
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser.username, action: "LOGOUT", detail: "User logged out" });
    });
    logout();
    router.replace("/");
  };

  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const actions = [
    { href: "/new-entry", icon: Plus, label: "New Entry" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/reports", icon: FileText, label: "New Report" },
    { href: "/network", icon: Share2, label: "Network" },
  ];

  return (
    <header className="bg-surface border-b border-border/60">
      {/* ── Mobile header: hamburger + brand + controls ── */}
      <div className="flex md:hidden items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-1 rounded-lg text-text-2 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer active:scale-95"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-[14px] font-bold text-text leading-tight">RFE Database</h1>
            <p className="text-[10px] text-text-3 font-medium">
              {db.entries.length} entities · {signals > 0 ? `${signals} signal${signals !== 1 ? "s" : ""}` : "System active"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="relative p-2.5 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer active:scale-95"
            onClick={() => document.getElementById("notifPanel")?.classList.toggle("hidden")}
          >
            <Bell size={18} className="text-text-3" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] gradient-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-[12px] font-bold text-white ring-2 ring-accent/20">
            {currentUser.username[0].toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-text-3 hover:text-red hover:bg-red-muted transition-all cursor-pointer active:scale-95"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── Desktop header: full info bar + controls ── */}
      <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-4 text-[12px] text-text-2 font-medium flex-1 min-w-0">
          <span>{dayName}, {monthDay}</span>
          <span className="w-1 h-1 rounded-full bg-border-2" />
          <span className="hidden lg:inline">{CLEARANCE_LABELS[clearance]} (L{clearance})</span>
          <span className="hidden lg:inline w-1 h-1 rounded-full bg-border-2" />
          <span className="font-mono">{db.entries.length} entities</span>
          <span className="w-1 h-1 rounded-full bg-border-2" />
          <span className="font-mono">{regions} regions</span>
          <span className="hidden xl:inline w-1 h-1 rounded-full bg-border-2" />
          <span className="hidden xl:inline font-mono">{totalLinks} links</span>
          {signals > 0 && (
            <span className="inline-flex items-center gap-1 text-accent font-bold bg-accent-muted px-2.5 py-0.5 rounded-full text-[11px]">
              <Zap size={10} /> {signals} signal{signals !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <button
            className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
            onClick={() => document.getElementById("notifPanel")?.classList.toggle("hidden")}
          >
            <Bell size={17} className="text-text-3" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] gradient-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-border/60">
            <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-accent/20">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text leading-tight">{currentUser.fullName ?? currentUser.username}</p>
              <p className="text-[10px] text-text-3 font-medium">L{clearance} · {CLEARANCE_LABELS[clearance]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-text-3 hover:text-red hover:bg-red-muted transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Action buttons - desktop only */}
      <div className="hidden md:flex items-center justify-center gap-1 px-6 pb-2.5">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-text/70 rounded-md hover:bg-surface-2 hover:text-text transition-colors"
          >
            <a.icon size={14} />
            {a.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
