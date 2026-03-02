
"use client";

import Link from "next/link";
import {
  Link2, Check, X, Eye, MapPin, Building2, Users, Calendar, Target
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { InferredConnection, Entry } from "@/types";

const CATEGORY_META: Record<InferredConnection["category"], { label: string; color: string; icon: typeof MapPin }> = {
  "shared-location": { label: "Shared Location", color: "amber", icon: MapPin },
  "co-attendance": { label: "Co-Attendance", color: "accent", icon: Calendar },
  "organizational": { label: "Organizational", color: "purple", icon: Building2 },
  "social-proximity": { label: "Social Proximity", color: "cyan", icon: Users },
  "pattern-match": { label: "Pattern Match", color: "emerald", icon: Target },
  "behavioral": { label: "Behavioral", color: "red", icon: Eye },
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-emerald" : value >= 60 ? "bg-amber" : "bg-red";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className={cn(
        "text-[11px] font-bold tabular-nums",
        value >= 80 ? "text-emerald" : value >= 60 ? "text-amber" : "text-red"
      )}>{value}%</span>
    </div>
  );
}

interface ConnectionCardProps {
  conn: InferredConnection;
  entityA: Entry;
  entityB: Entry;
  onConfirm: (conn: InferredConnection) => void;
  onDismiss: (conn: InferredConnection) => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
  isSelectable: boolean;
  onPreview: (entity: Entry) => void;
}

export function ConnectionCard({ conn, entityA, entityB, onConfirm, onDismiss, isSelected, onSelect, isSelectable, onPreview }: ConnectionCardProps) {
  if (!entityA || !entityB) return null;

  const meta = CATEGORY_META[conn.category];
  const CatIcon = meta.icon;

  return (
    <div key={conn.id} className={cn(
      "rounded-2xl border bg-surface p-5 transition-all duration-200 hover:shadow-md relative",
      isSelected ? "border-accent" :
        conn.status === "confirmed" ? "border-emerald/30 bg-emerald/[0.02]" :
          conn.status === "dismissed" ? "border-border/40 opacity-60" :
            "border-border/80 hover:border-accent/30"
    )}>
      {isSelectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(conn.id)}
          className="absolute top-3 right-3 h-4 w-4 rounded text-accent focus:ring-accent"
        />
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border",
          `bg-${meta.color}/8 text-${meta.color} border-${meta.color}/15`
        )}>
          <CatIcon size={11} />
          {meta.label}
        </div>
        <div className="flex items-center gap-1">
          {conn.status === "new" && !isSelectable && <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />}
          <span className={cn(
            "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
            conn.status === "new" ? "bg-amber/10 text-amber" :
              conn.status === "confirmed" ? "bg-emerald/10 text-emerald" :
                "bg-surface-3 text-text-3"
          )}>
            {conn.status}
          </span>
        </div>
      </div>

      {/* Entity Pair */}
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => onPreview(entityA)}
          className="flex-1 text-center p-2.5 bg-surface-2 rounded-xl hover:bg-accent/8 transition-colors group w-full">
          <div className="text-[13px] font-semibold group-hover:text-accent transition-colors">{entityA.name}</div>
          <div className="text-[10px] text-text-3 mt-0.5">{entityA.country ?? entityA.category}</div>
        </button>
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <Link2 size={16} className="text-accent" />
          <span className="text-[9px] text-text-3">linked</span>
        </div>
        <button onClick={() => onPreview(entityB)}
          className="flex-1 text-center p-2.5 bg-surface-2 rounded-xl hover:bg-accent/8 transition-colors group w-full">
          <div className="text-[13px] font-semibold group-hover:text-accent transition-colors">{entityB.name}</div>
          <div className="text-[10px] text-text-3 mt-0.5">{entityB.country ?? entityB.category}</div>
        </button>
      </div>

      {/* Confidence */}
      <div className="mb-3">
        <span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Confidence</span>
        <ConfidenceBar value={conn.confidence} />
      </div>

      {/* Reason */}
      <p className="text-[12px] text-text-2 font-medium mb-2">{conn.reason}</p>

      {/* Evidence */}
      <div className="space-y-1 mb-3">
        {conn.evidence.map((e, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[11px] text-text-3">
            <span className="text-accent mt-0.5">&#8226;</span>
            <span>{e}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {conn.status === "new" && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <button onClick={() => onConfirm(conn)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald/10 text-emerald text-[12px] font-semibold rounded-lg hover:bg-emerald/20 transition-all cursor-pointer">
            <Check size={14} /> Confirm & Link
          </button>
          <button onClick={() => onDismiss(conn)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-3 text-text-3 text-[12px] font-semibold rounded-lg hover:bg-surface-2 transition-all cursor-pointer">
            <X size={14} /> Dismiss
          </button>
          <Link href={`/entry/${conn.entityA}`}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-accent/8 text-accent text-[12px] font-semibold rounded-lg hover:bg-accent/15 transition-all">
            <Eye size={14} />
          </Link>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-[10px] text-text-3 mt-2">
        Inferred {new Date(conn.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}
