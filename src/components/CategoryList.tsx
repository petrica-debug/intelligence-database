"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { PageHeader, GlassCard, Badge, EmptyState, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Link2, LayoutGrid, List, ArrowRight } from "lucide-react";
import type { EntityCategory } from "@/types";
import type { ReactNode } from "react";

interface Props { category: EntityCategory; title: string; icon: ReactNode; emptyMsg: string }

export function CategoryList({ category, title, icon, emptyMsg }: Props) {
  const { db } = useApp();
  const router = useRouter();
  const [view, setView] = useState<"card" | "table">("card");
  const [sortBy, setSortBy] = useState<"date" | "name" | "links">("date");
  const [filterCountry, setFilterCountry] = useState<string>("all");

  const allEntries = db.entries.filter((e) => e.category === category);
  const countries = [...new Set(allEntries.map((e) => e.country).filter(Boolean))];

  const entries = allEntries
    .filter((e) => filterCountry === "all" || e.country === filterCountry)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "links") return b.linkedTo.length - a.linkedTo.length;
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <>
      <PageHeader
        title={`${title} (${entries.length})`}
        description={`All ${title.toLowerCase()} entries in the database`}
        action={
          <div className="flex items-center gap-2">
            {/* Country filter */}
            {countries.length > 1 && (
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="bg-surface-2 border border-border rounded-xl text-text text-[11px] px-2.5 py-1.5 outline-none cursor-pointer font-medium"
              >
                <option value="all">All Regions</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-surface-2 border border-border rounded-xl text-text text-[11px] px-2.5 py-1.5 outline-none cursor-pointer font-medium"
            >
              <option value="date">Newest</option>
              <option value="name">A-Z</option>
              <option value="links">Most Links</option>
            </select>
            {/* View toggle */}
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button onClick={() => setView("card")} className={cn("p-1.5 transition-all duration-200 cursor-pointer", view === "card" ? "bg-accent text-white" : "text-text-3 hover:text-text bg-surface-2")}><LayoutGrid size={14} /></button>
              <button onClick={() => setView("table")} className={cn("p-1.5 transition-all duration-200 cursor-pointer", view === "table" ? "bg-accent text-white" : "text-text-3 hover:text-text bg-surface-2")}><List size={14} /></button>
            </div>
          </div>
        }
      />

      {entries.length === 0 ? (
        <EmptyState icon={icon} title={`No ${title}`} description={emptyMsg} />
      ) : view === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map((entry) => (
            <GlassCard key={entry.id} className="cursor-pointer hover:border-accent/40 group" onClick={() => router.push(`/entry/${entry.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[15px] font-semibold group-hover:text-accent transition-colors">{entry.name}</h3>
                <Badge variant={entry.context as never}>{entry.context}</Badge>
              </div>
              <p className="text-[13px] text-text-2 leading-relaxed">{entry.narrative.substring(0, 120)}{entry.narrative.length > 120 ? "..." : ""}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-text-3">
                {entry.country && <span className="bg-surface-3 px-1.5 py-0.5 rounded text-[10px]">{entry.country}</span>}
                <span>by {entry.createdBy}</span>
                <span>{formatDate(entry.createdAt)}</span>
                <span className="flex items-center gap-1"><Link2 size={10} /> {entry.linkedTo.length}</span>
              </div>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.tags.slice(0, 4).map((t) => <span key={t} className="text-[10px] text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">{t}</span>)}
                  {entry.tags.length > 4 && <span className="text-[10px] text-text-3">+{entry.tags.length - 4}</span>}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-surface-2/50">
                {["Name", "Reliability", "Country", "Links", "Created", ""].map((h) => (
                  <th key={h} className="text-left text-[11px] font-medium text-text-3 uppercase tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr></thead>
              <tbody>{entries.map((e) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors cursor-pointer" onClick={() => router.push(`/entry/${e.id}`)}>
                  <td className="py-3 px-4">
                    <div className="text-[13px] font-medium">{e.name}</div>
                    {e.tags && <div className="flex gap-1 mt-0.5">{e.tags.slice(0, 3).map((t) => <span key={t} className="text-[9px] text-text-3 bg-surface-3 px-1 py-0.5 rounded">{t}</span>)}</div>}
                  </td>
                  <td className="py-3 px-4"><Badge variant={e.context as never}>{e.context}</Badge></td>
                  <td className="py-3 px-4 text-[12px] text-text-2">{e.country || "—"}</td>
                  <td className="py-3 px-4 text-[12px] text-text-2">{e.linkedTo.length}</td>
                  <td className="py-3 px-4 text-[12px] text-text-3">{formatDate(e.createdAt)}</td>
                  <td className="py-3 px-4"><ArrowRight size={14} className="text-text-3" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
