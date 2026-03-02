
import { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui";
import { runInferenceEngine } from "@/lib/inference";
import Link from "next/link";
import {
  Brain, Sparkles, RefreshCw,
  MapPin, Building2, Users, Calendar, Zap, Target,
  CheckCircle2, XCircle, TrendingUp, Check, X, Eye
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { InferredConnection, Entry } from "@/types";
import { ConnectionCard } from "@/components/intelligence/ConnectionCard";
import { EntityPreviewModal } from "@/components/intelligence/EntityPreviewModal";

const CATEGORY_META: Record<InferredConnection["category"], { label: string; color: string; icon: typeof MapPin }> = {
  "shared-location": { label: "Shared Location", color: "amber", icon: MapPin },
  "co-attendance": { label: "Co-Attendance", color: "accent", icon: Calendar },
  "organizational": { label: "Organizational", color: "purple", icon: Building2 },
  "social-proximity": { label: "Social Proximity", color: "cyan", icon: Users },
  "pattern-match": { label: "Pattern Match", color: "emerald", icon: Target },
  "behavioral": { label: "Behavioral", color: "red", icon: Eye },
};

export default function IntelligencePage() {
  const { db, currentUser, updateDb } = useApp();
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState<number[]>([]);
  const [previewedEntity, setPreviewedEntity] = useState<Entry | null>(null);

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

  const getEntry = useCallback((id: number) => db.entries.find((e) => e.id === id), [db.entries]);

  const handleConfirm = useCallback((conn: InferredConnection) => {
    updateDb((draft) => {
      const c = (draft.inferredConnections ?? []).find((x) => x.id === conn.id);
      if (c) c.status = "confirmed";
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

  const handleSelect = (id: number) => {
    setSelectedConnections(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedConnections.length === connections.filter(c => c.status === 'new').length) {
      setSelectedConnections([]);
    } else {
      setSelectedConnections(connections.filter(c => c.status === 'new').map(c => c.id));
    }
  };

  const handleBatchConfirm = () => {
    const toConfirm = connections.filter(c => selectedConnections.includes(c.id));
    toConfirm.forEach(handleConfirm);
    setSelectedConnections([]);
  };

  const handleBatchDismiss = () => {
    const toDismiss = connections.filter(c => selectedConnections.includes(c.id));
    toDismiss.forEach(handleDismiss);
    setSelectedConnections([]);
  };
  
  const handlePreview = (entity: Entry) => {
    setPreviewedEntity(entity);
  };

  const handleClosePreview = () => {
    setPreviewedEntity(null);
  };

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

  const isBatchMode = filterStatus === 'new' || selectedConnections.length > 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      <EntityPreviewModal entity={previewedEntity} onClose={handleClosePreview} getEntry={getEntry} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
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

      {/* Filters & Batch Actions */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer">
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_META).map(([key, m]) => (
            <option key={key} value={key}>{m.label}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setSelectedConnections([]); }}
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

        {filterStatus === 'new' && (
          <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" id="selectAll"
                   onChange={handleSelectAll}
                   checked={selectedConnections.length === connections.filter(c => c.status === 'new').length && connections.length > 0}
                   className="h-4 w-4 rounded text-accent focus:ring-accent" />
            <label htmlFor="selectAll" className="cursor-pointer">Select All</label>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {selectedConnections.length > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-sm font-semibold">{selectedConnections.length} selected</span>
              <button onClick={handleBatchConfirm} className="px-3 py-2 text-sm font-semibold bg-emerald/10 text-emerald rounded-lg hover:bg-emerald/20"><Check size={16} /></button>
              <button onClick={handleBatchDismiss} className="px-3 py-2 text-sm font-semibold bg-surface-3 text-text-3 rounded-lg hover:bg-surface-2"><X size={16} /></button>
            </div>
          )}
          <span className="text-[12px] text-text-3">{connections.length} results</span>
        </div>
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

          return (
            <ConnectionCard
              key={conn.id}
              conn={conn}
              entityA={entryA}
              entityB={entryB}
              onConfirm={handleConfirm}
              onDismiss={handleDismiss}
              isSelected={selectedConnections.includes(conn.id)}
              onSelect={handleSelect}
              isSelectable={conn.status === 'new'}
              onPreview={handlePreview}
            />
          );
        })}
      </div>
    </div>
  );
}
