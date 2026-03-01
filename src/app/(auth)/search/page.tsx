"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, GlassCard, Badge, Button, Input, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Search as SearchIcon, Filter, Lock, Link2, Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";
import type { EntityCategory, SensitivityLevel } from "@/types";
import { SENSITIVITY_MIN_CLEARANCE, CLEARANCE_LABELS } from "@/types";

export default function SearchPage() {
  const { db, currentUser, updateDb, canView, userClearance } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState<EntityCategory | "all">("all");
  const [searched, setSearched] = useState(false);

  const results = searched ? db.entries.filter((e) => {
    const matchFilter = filter === "all" || e.category === filter;
    const q = query.toLowerCase();
    return matchFilter && (e.name.toLowerCase().includes(q) || e.narrative.toLowerCase().includes(q));
  }) : [];

  const handleSearch = () => {
    if (!query.trim()) return;
    if (!reason.trim()) { toast("You must provide a reason for your search.", "warning"); return; }
    updateDb((d) => {
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "SEARCH", detail: `Searched for "${query}" | Reason: ${reason}` });
      d.signals.forEach((sig) => {
        if (sig.entityName.toLowerCase().includes(query.toLowerCase())) {
          d.notifications.push({ message: `SIGNAL: ${currentUser!.username} searched for "${query}" (matches signal on ${sig.entityName})`, forUser: sig.setBy, ts: new Date().toISOString(), read: false });
          if (sig.setBy !== "admin") d.notifications.push({ message: `SIGNAL: ${currentUser!.username} searched for "${query}" (matches signal on ${sig.entityName})`, forUser: "admin", ts: new Date().toISOString(), read: false });
        }
      });
    });
    setSearched(true);
    toast(`Search completed: ${query}`, "success");
  };

  const cats: (EntityCategory | "all")[] = ["all", "person", "company", "mobile", "address", "vehicle"];

  const getSensitivityBadge = (sensitivity?: SensitivityLevel) => {
    const s = sensitivity ?? "standard";
    const accessible = canView(s);
    const colors: Record<SensitivityLevel, string> = {
      standard: "bg-emerald/8 text-emerald border-emerald/15",
      sensitive: "bg-amber/8 text-amber border-amber/15",
      confidential: "bg-red/8 text-red border-red/15",
      "top-secret": "bg-purple/8 text-purple border-purple/15",
    };
    return (
      <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase border", colors[s])}>
        {accessible ? <Eye size={8} /> : <Lock size={8} />}
        {s}
      </span>
    );
  };

  return (
    <>
      <PageHeader title="Search Database" description="Search across all entities. A reason is required for every search." />
      <Card className="mb-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
            <input type="text" placeholder="Search by name, number, address, or keyword..." value={query}
              onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-text text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white placeholder:text-text-3 transition-all duration-200" />
          </div>
          <Button onClick={handleSearch}><SearchIcon size={14} /> Search</Button>
        </div>
        <Input label="Search Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="State your reason..." />
        <div className="flex items-center gap-2 flex-wrap mt-4">
          <Filter size={14} className="text-text-3" />
          {cats.map((c) => (
            <button key={c} onClick={() => { setFilter(c); setSearched(false); }}
              className={cn("px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all duration-200 cursor-pointer",
                filter === c ? "bg-accent text-white border-accent shadow-sm shadow-accent/10" : "bg-surface-2 text-text-2 border-border hover:border-accent/30 hover:text-accent")}>
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        {/* Clearance indicator */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
          <Shield size={12} className="text-accent" />
          <span className="text-[10px] text-text-3">
            Viewing as <span className="font-semibold text-accent">{CLEARANCE_LABELS[userClearance]} (L{userClearance})</span> — results filtered by your clearance level
          </span>
        </div>
      </Card>
      {searched && (
        <div className="animate-fade-in">
          <p className="text-sm text-text-2 mb-4">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          {results.length === 0 ? (
            <Card><p className="text-text-3 text-center py-8">No results found for &quot;{query}&quot;</p></Card>
          ) : (
            <div className="space-y-3">{results.map((entry) => {
              const isBasic = currentUser?.access === "basic" && currentUser?.role !== "admin";
              const entrySensitivity = entry.sensitivity ?? "standard";
              const canViewEntry = canView(entrySensitivity);
              const hasSignal = db.signals.some((s) => s.entityId === entry.id);

              return (
                <GlassCard key={entry.id}
                  className={cn("cursor-pointer hover:border-accent/40", !canViewEntry && "opacity-70")}
                  onClick={() => canViewEntry ? router.push(`/entry/${entry.id}`) : toast("Insufficient clearance to view this entry", "warning")}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold truncate">{entry.name}</h3>
                      {hasSignal && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-amber/10 text-amber text-[8px] font-bold animate-pulse-glow">SIGNAL</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getSensitivityBadge(entry.sensitivity)}
                      <Badge variant={entry.category as never}>{entry.category}</Badge>
                    </div>
                  </div>
                  <p className="text-[13px] text-text-2 leading-relaxed">
                    {!canViewEntry ? (
                      <span className="flex items-center gap-2 italic text-text-3">
                        <Lock size={12} />
                        Restricted — requires {CLEARANCE_LABELS[SENSITIVITY_MIN_CLEARANCE[entrySensitivity]]} clearance (L{SENSITIVITY_MIN_CLEARANCE[entrySensitivity]})
                      </span>
                    ) : isBasic ? (
                      <span className="flex items-center gap-2 italic text-text-3"><Lock size={12} /> Record exists. Request full access.</span>
                    ) : (
                      entry.narrative.substring(0, 180) + (entry.narrative.length > 180 ? "..." : "")
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={entry.context as never}>{entry.context}</Badge>
                    {entry.country && <span className="text-[11px] text-text-3">{entry.country}</span>}
                    <span className="text-[11px] text-text-3 flex items-center gap-1"><Link2 size={10} /> {entry.linkedTo.length} links</span>
                  </div>
                </GlassCard>
              );
            })}</div>
          )}
        </div>
      )}
    </>
  );
}
