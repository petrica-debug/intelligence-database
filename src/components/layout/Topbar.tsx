"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Bell, LogOut, Plus, Search, FileText, Share2, Zap, Menu, Command } from "lucide-react";
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
    { href: "/new-entry", icon: Plus, label: "New Entry", primary: true },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/reports", icon: FileText, label: "New Report" },
    { href: "/network", icon: Share2, label: "Network Map" },
  ];

  return (
    <header className="glass-card border-b border-border/40">
      {/* ── Mobile header ── */}
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
              <span className="absolute top-1 right-1 w-[18px] h-[18px] gradient-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-glow-orange">
                {unread}
              </span>
            )}
          </button>
          <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-[12px] font-bold text-white ring-2 ring-stat-blue/20 ring-offset-2 ring-offset-surface">
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

      {/* ── Desktop header ── */}
      <div className="hidden md:flex items-center justify-between px-5 py-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {actions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 shrink-0
                ${a.primary
                  ? "gradient-blue text-white shadow-glow-blue hover:shadow-lg"
                  : "text-text-3 hover:bg-surface-3 hover:text-text"
                }`}
            >
              <a.icon size={13} />
              {a.label}
            </Link>
          ))}
          <div className="w-px h-5 bg-border/40 mx-1" />
          <span className="text-[10px] text-text-3 font-medium shrink-0">{dayName}, {monthDay}</span>
          <span className="text-[10px] font-semibold text-text font-mono tabular-nums shrink-0">{db.entries.length} entities</span>
          <span className="text-[10px] font-semibold text-text font-mono tabular-nums shrink-0">{totalLinks} links</span>
          {signals > 0 && (
            <span className="inline-flex items-center gap-1 text-accent font-bold bg-accent-muted px-2 py-0.5 rounded text-[10px] shrink-0">
              <Zap size={9} className="fill-current" /> {signals}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-3/60 border border-border/50 hover:bg-surface-3 transition-all text-text-3 text-[11px]"
          >
            <Search size={12} />
            <span>Search</span>
            <kbd className="ml-2 flex items-center gap-0.5 text-[9px] font-mono text-text-3/50 bg-surface/80 px-1 py-px rounded border border-border/40">
              <Command size={8} />K
            </kbd>
          </button>

          <button
            className="relative p-2 rounded-lg hover:bg-surface-3 transition-all group"
            onClick={() => document.getElementById("notifPanel")?.classList.toggle("hidden")}
          >
            <Bell size={16} className="text-text-3 group-hover:text-text transition-colors" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 gradient-orange text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <div className="w-px h-6 bg-border/40" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full gradient-blue flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-stat-blue/15">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-text leading-tight">{currentUser.fullName ?? currentUser.username}</p>
              <p className="text-[9px] text-text-3 font-medium">L{clearance} · {CLEARANCE_LABELS[clearance]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-text-3 hover:text-red hover:bg-red-muted transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
