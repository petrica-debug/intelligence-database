"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Bell, LogOut, Plus, Search, FileText, Share2, Zap } from "lucide-react";
import { CLEARANCE_LABELS } from "@/types";
import type { ClearanceLevel } from "@/types";
import Link from "next/link";

export function Topbar() {
  const { currentUser, logout, db, updateDb } = useApp();
  const router = useRouter();
  if (!currentUser) return null;

  const target = currentUser.role === "admin" ? "admin" : currentUser.username;
  const unread = db.notifications.filter(
    (n) => (n.forUser === target || n.forUser === currentUser.username) && !n.read
  ).length;

  const clearance = (currentUser.clearance ?? 1) as ClearanceLevel;
  const totalLinks = db.entries.reduce((s, e) => s + e.linkedTo.length, 0);
  const regions = new Set(db.entries.flatMap((e) => e.tags ?? [])).size;
  const pending = db.pendingValidations.filter((v) => !v.resolved).length;

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
    <header className="bg-surface border-b border-border/60 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Info bar */}
        <div className="flex items-center gap-3 text-[12px] text-text-2 font-medium">
          <span>{dayName}, {monthDay}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{CLEARANCE_LABELS[clearance]} (L{clearance})</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="font-mono">{db.entries.length} entities</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="font-mono">{regions} regions</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="font-mono">{totalLinks} links</span>
          {pending > 0 && (
            <span className="ml-1 inline-flex items-center gap-1 text-accent font-bold bg-accent-muted px-2 py-0.5 rounded-full text-[11px]">
              <Zap size={10} /> {pending} signal{pending !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
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

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 mt-2.5 -ml-2">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-text/80 rounded-md hover:bg-surface-2 hover:text-text transition-colors"
          >
            <a.icon size={14} />
            {a.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
