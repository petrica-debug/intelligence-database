"use client";

import { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui";
import { runInferenceEngine } from "@/lib/inference";
import Link from "next/link";
import {
  Brain, Sparkles, Link2, Check, X, Eye, ArrowRight, RefreshCw,
  MapPin, Building2, Users, Calendar, Zap, Target, Filter,
  TrendingUp, AlertCircle, CheckCircle2, XCircle, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { InferredConnection } from "@/types";

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

export default function IntelligencePage() {
  const { db, currentUser, updateDb } = useApp();
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const connections = useMemo(() => {
    let list = db.inferredConnections ?? [];
    if (filterCategory !== "all") list = list.filter((c) => c.category === filterCategory);
    if (filterStatus !== "all") list = list.filter((c) => c.status === filterStatus);
    if (minConfidence > 0) list = list.filter((c) => c.confidence >= minConfidence);
    return list.sort((a, b) => b.confidence - a.confidence);
  }, [db.inferredConnections, filterCategory, filterStatus, minConfidence]);

  const stats = useMemo(() => {
    const all = db.inferredConnections ?? [];
    return {
      total: all.length,
      new: all.filter((c) => c.status === "new").length,
      confirmed: all.filter((c) => c.status === "confirmed").length,
      dismissed: all.filter((c) => c.status === "dismissed").length,
      avgConfidence: all.length > 0 ? Math.round(all.reduce((s, c) => s + c.confidence, 0) / all.length) : 0,
    };
  }, [db.inferredConnections]);

  const getEntry = (id: number) => db.entries.find((e) => e.id === id);

  const handleConfirm = useCallback((conn: InferredConnection) => {
    updateDb((draft) => {
      const c = (draft.inferredConnections ?? []).find((x) => x.id === conn.id);
      if (c) c.status = "confirmed";
      // Create actual bidirectional link
      const entryA = draft.entries.find((e) => e.id === conn.entityA);
      const entryB = draft.entries.find((e) => e.id === conn.entityB);
      if (entryA && !entryA.linkedTo.includes(conn.entityB)) entryA.linkedTo.push(conn.entityB);
      if (entryB && !entryB.linkedTo.includes(conn.entityA)) entryB.linkedTo.push(conn.entityA);
      draft.logs.push({
        ts: new Date().toISOString(),
        user: currentUser?.username ?? "system",
        action: "INFERENCE_CONFIRM",
        detail: `Confirmed inferred connection: ${getEntry(conn.entityA)?.name} ↔ ${getEntry(conn.entityB)?.name}`,
      });
    });
    toast("Connection confirmed and linked", "success");
  }, [updateDb, currentUser, toast, getEntry]);

  const handleDismiss = useCallback((conn: InferredConnection) => {
    updateDb((draft) => {
      const c = (draft.inferredConnections ?? []).find((x) => x.id === conn.id);
      if (c) c.status = "dismissed";
      draft.logs.push({
        ts: new Date().toISOString(),
        user: currentUser?.username ?? "system",
        action: "INFERENCE_DISMISS",
        detail: `Dismissed inferred connection: ${getEntry(conn.entityA)?.name} ↔ ${getEntry(conn.entityB)?.name}`,
      });
    });
    toast("Connection dismissed", "info");
  }, [updateDb, currentUser, toast, getEntry]);

  const runEngine = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const newConnections = runInferenceEngine(db);
      if (newConnections.length > 0) {
        updateDb((draft) => {
          if (!draft.inferredConnections) draft.inferredConnections = [];
          draft.inferredConnections.push(...newConnections);
          draft.logs.push({
            ts: new Date().toISOString(),
            user: currentUser?.username ?? "system",
            action: "INFERENCE_RUN",
            detail: `AI inference engine discovered ${newConnections.length} new potential connection${newConnections.length !== 1 ? "s" : ""}`,
          });
        });
        toast(`Discovered ${newConnections.length} new connection${newConnections.length !== 1 ? "s" : ""}`, "success");
      } else {
        toast("No new connections discovered", "info");
      }
      setIsRunning(false);
    }, 1500);
  }, [db, updateDb, currentUser, toast]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2">
            <Brain size={22} className="text-purple" />
            AI Intelligence Engine
          </h1>
          <p className="text-[13px] text-text-2 mt-0.5">
            AI-inferred connections between entities based on behavioral patterns, co-attendance, shared locations, and organizational analysis.
          </p>
        </div>
        <button onClick={runEngine} disabled={isRunning}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-xl transition-all shadow-sm cursor-pointer",
            isRunning ? "bg-surface-3 text-text-3" : "bg-purple text-white hover:bg-purple/90"
          )}>
          <RefreshCw size={15} className={isRunning ? "animate-spin" : ""} />
          {isRunning ? "Analyzing..." : "Run Inference Engine"}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Inferences", value: stats.total, icon: <Sparkles size={16} />, color: "text-purple" },
          { label: "New", value: stats.new, icon: <Zap size={16} />, color: "text-amber" },
          { label: "Confirmed", value: stats.confirmed, icon: <CheckCircle2 size={16} />, color: "text-emerald" },
          { label: "Dismissed", value: stats.dismissed, icon: <XCircle size={16} />, color: "text-text-3" },
          { label: "Avg Confidence", value: `${stats.avgConfidence}%`, icon: <TrendingUp size={16} />, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-surface p-3 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-current/8", s.color)}>{s.icon}</div>
            <div>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-[10px] text-text-3 uppercase font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer">
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_META).map(([key, m]) => (
            <option key={key} value={key}>{m.label}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="confirmed">Confirmed</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <div className="flex items-center gap-2 text-[12px] text-text-2">
          <span>Min confidence:</span>
          <input type="range" min={0} max={90} step={10} value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="w-24 accent-purple" />
          <span className="font-bold text-purple tabular-nums w-8">{minConfidence}%</span>
        </div>
        <span className="text-[12px] text-text-3 ml-auto">{connections.length} results</span>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {connections.length === 0 && (
          <div className="col-span-2 flex flex-col items-center py-16 text-center">
            <Brain size={40} className="text-text-3/40 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Connections Found</h3>
            <p className="text-sm text-text-2 max-w-sm">
              Run the inference engine to discover new connections, or adjust your filters.
            </p>
          </div>
        )}

        {connections.map((conn) => {
          const entryA = getEntry(conn.entityA);
          const entryB = getEntry(conn.entityB);
          if (!entryA || !entryB) return null;

          const meta = CATEGORY_META[conn.category];
          const CatIcon = meta.icon;

          return (
            <div key={conn.id} className={cn(
              "rounded-2xl border bg-surface p-5 transition-all duration-200 hover:shadow-md",
              conn.status === "confirmed" ? "border-emerald/30 bg-emerald/[0.02]" :
                conn.status === "dismissed" ? "border-border/40 opacity-60" :
                  "border-border/80 hover:border-accent/30"
            )}>
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
                  {conn.status === "new" && <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />}
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
                <Link href={`/entry/${conn.entityA}`}
                  className="flex-1 text-center p-2.5 bg-surface-2 rounded-xl hover:bg-accent/8 transition-colors group">
                  <div className="text-[13px] font-semibold group-hover:text-accent transition-colors">{entryA.name}</div>
                  <div className="text-[10px] text-text-3 mt-0.5">{entryA.country ?? entryA.category}</div>
                </Link>
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <Link2 size={16} className="text-accent" />
                  <span className="text-[9px] text-text-3">linked</span>
                </div>
                <Link href={`/entry/${conn.entityB}`}
                  className="flex-1 text-center p-2.5 bg-surface-2 rounded-xl hover:bg-accent/8 transition-colors group">
                  <div className="text-[13px] font-semibold group-hover:text-accent transition-colors">{entryB.name}</div>
                  <div className="text-[10px] text-text-3 mt-0.5">{entryB.country ?? entryB.category}</div>
                </Link>
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
                  <button onClick={() => handleConfirm(conn)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald/10 text-emerald text-[12px] font-semibold rounded-lg hover:bg-emerald/20 transition-all cursor-pointer">
                    <Check size={14} /> Confirm & Link
                  </button>
                  <button onClick={() => handleDismiss(conn)}
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
        })}
      </div>
    </div>
  );
}
