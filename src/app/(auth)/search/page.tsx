"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, GlassCard, Badge, Button, Input, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Search as SearchIcon, Filter, Lock, Link2 } from "lucide-react";
import type { EntityCategory } from "@/types";

export default function SearchPage() {
  const { db, currentUser, updateDb } = useApp();
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
              className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-lg text-text text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder:text-text-3" />
          </div>
          <Button onClick={handleSearch}><SearchIcon size={14} /> Search</Button>
        </div>
        <Input label="Search Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="State your reason..." />
        <div className="flex items-center gap-2 flex-wrap mt-4">
          <Filter size={14} className="text-text-3" />
          {cats.map((c) => (
            <button key={c} onClick={() => { setFilter(c); setSearched(false); }}
              className={cn("px-3 py-1 rounded-full text-[12px] font-medium border transition-all cursor-pointer",
                filter === c ? "bg-accent text-white border-accent" : "bg-surface-2 text-text-2 border-border hover:border-border-2")}>
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
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
              return (
                <GlassCard key={entry.id} className="cursor-pointer hover:border-accent/40" onClick={() => router.push(`/entry/${entry.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[15px] font-semibold">{entry.name}</h3>
                    <Badge variant={entry.category as never}>{entry.category}</Badge>
                  </div>
                  <p className="text-[13px] text-text-2 leading-relaxed">
                    {isBasic ? <span className="flex items-center gap-2 italic text-text-3"><Lock size={12} /> Record exists. Request full access.</span>
                      : entry.narrative.substring(0, 180) + (entry.narrative.length > 180 ? "..." : "")}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={entry.context as never}>{entry.context}</Badge>
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
