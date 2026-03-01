"use client";

import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PenSquare, Search, Eye, Link2, Shield, Radio, UserPlus, LogIn, LogOut, AlertTriangle, RotateCcw, KeyRound } from "lucide-react";
import type { ReactNode } from "react";

const ACTION_CONFIG: Record<string, { icon: ReactNode; color: string; bg: string }> = {
  ENTRY: { icon: <PenSquare size={14} />, color: "text-emerald", bg: "bg-emerald-muted" },
  SEARCH: { icon: <Search size={14} />, color: "text-accent", bg: "bg-accent-muted" },
  VIEW: { icon: <Eye size={14} />, color: "text-cyan", bg: "bg-cyan-muted" },
  LINK: { icon: <Link2 size={14} />, color: "text-purple", bg: "bg-purple-muted" },
  LOGIN: { icon: <LogIn size={14} />, color: "text-emerald", bg: "bg-emerald-muted" },
  LOGOUT: { icon: <LogOut size={14} />, color: "text-text-3", bg: "bg-surface-3" },
  SIGNAL_SET: { icon: <Radio size={14} />, color: "text-amber", bg: "bg-amber-muted" },
  SIGNAL_REMOVE: { icon: <Radio size={14} />, color: "text-text-3", bg: "bg-surface-3" },
  VALIDATE_APPROVE: { icon: <Shield size={14} />, color: "text-emerald", bg: "bg-emerald-muted" },
  VALIDATE_REJECT: { icon: <AlertTriangle size={14} />, color: "text-red", bg: "bg-red-muted" },
  ACCESS_REQ: { icon: <KeyRound size={14} />, color: "text-amber", bg: "bg-amber-muted" },
  ACCESS_CHANGE: { icon: <KeyRound size={14} />, color: "text-purple", bg: "bg-purple-muted" },
  USER_CREATE: { icon: <UserPlus size={14} />, color: "text-emerald", bg: "bg-emerald-muted" },
  REVERSE_SEARCH: { icon: <RotateCcw size={14} />, color: "text-red", bg: "bg-red-muted" },
};

const DEFAULT_CONFIG = { icon: <Eye size={14} />, color: "text-text-2", bg: "bg-surface-3" };

export default function TimelinePage() {
  const { db } = useApp();

  // Group logs by date
  const grouped = new Map<string, typeof db.logs>();
  db.logs.forEach((l) => {
    const date = new Date(l.ts).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const arr = grouped.get(date) || [];
    arr.push(l);
    grouped.set(date, arr);
  });

  return (
    <>
      <PageHeader title="Timeline" description="Chronological view of all system activity" />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border" />

        {Array.from(grouped.entries()).map(([date, logs]) => (
          <div key={date} className="mb-8">
            <div className="relative flex items-center gap-4 mb-4">
              <div className="w-[47px] flex justify-center">
                <div className="w-3 h-3 rounded-full bg-accent border-2 border-bg z-10" />
              </div>
              <h3 className="text-sm font-semibold text-text-2">{date}</h3>
            </div>

            <div className="space-y-1">
              {logs.map((l, i) => {
                const config = ACTION_CONFIG[l.action] || DEFAULT_CONFIG;
                return (
                  <div key={i} className="relative flex items-start gap-4 group">
                    <div className="w-[47px] flex justify-center pt-2.5">
                      <div className={cn("w-2 h-2 rounded-full bg-border group-hover:bg-accent transition-colors z-10")} />
                    </div>
                    <div className="flex-1 py-2 px-4 rounded-lg hover:bg-surface/80 transition-colors -ml-1">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                          <span className={config.color}>{config.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-medium">{l.user}</span>
                            <Badge variant="info">{l.action}</Badge>
                          </div>
                          <p className="text-[13px] text-text-2 truncate mt-0.5">{l.detail}</p>
                        </div>
                        <span className="text-[11px] text-text-3 shrink-0">
                          {new Date(l.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {db.logs.length === 0 && (
          <Card className="ml-14">
            <p className="text-text-2 text-center py-8">No activity recorded yet.</p>
          </Card>
        )}
      </div>
    </>
  );
}
