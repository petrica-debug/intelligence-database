"use client";

import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { Bell, X } from "lucide-react";

export function NotificationPanel() {
  const { currentUser, db } = useApp();
  if (!currentUser) return null;

  const target = currentUser.role === "admin" ? "admin" : currentUser.username;
  const notifs = [...db.notifications]
    .filter((n) => n.forUser === target || n.forUser === currentUser.username)
    .reverse()
    .slice(0, 20);

  return (
    <div
      id="notifPanel"
      className="hidden fixed top-14 right-0 w-[380px] bg-surface border-l border-b border-border rounded-bl-xl z-[150] shadow-2xl shadow-black/30 max-h-[70vh] overflow-y-auto animate-scale-in"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-surface z-10">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Bell size={14} className="text-text-2" /> Notifications
        </h3>
        <button className="text-text-3 hover:text-text p-1 cursor-pointer" onClick={() => document.getElementById("notifPanel")?.classList.add("hidden")}>
          <X size={14} />
        </button>
      </div>
      {notifs.length === 0 ? (
        <div className="px-4 py-10 text-center text-text-3 text-sm">No notifications</div>
      ) : (
        notifs.map((n, i) => { n.read = true; return (
          <div key={i} className="px-4 py-3 border-b border-border/50 hover:bg-surface-2 transition-colors">
            <p className="text-[13px] text-text leading-relaxed">{n.message}</p>
            <p className="text-[11px] text-text-3 mt-1">{formatDate(n.ts)}</p>
          </div>
        ); })
      )}
    </div>
  );
}
