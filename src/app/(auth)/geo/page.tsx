"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader, Card, GlassCard, Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { MapPin, Users, Building2, Globe, ArrowRight, Link2 } from "lucide-react";

const COUNTRIES = ["Romania", "Bulgaria", "Hungary", "Czech Republic", "International"];
const COUNTRY_META: Record<string, { flag: string; code: string; color: string }> = {
  "Romania": { flag: "🇷🇴", code: "RO", color: "text-accent" },
  "Bulgaria": { flag: "🇧🇬", code: "BG", color: "text-emerald" },
  "Hungary": { flag: "🇭🇺", code: "HU", color: "text-red" },
  "Czech Republic": { flag: "🇨🇿", code: "CZ", color: "text-purple" },
  "International": { flag: "🌐", code: "INT", color: "text-amber" },
};

export default function GeoPage() {
  const { db } = useApp();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const countryStats = COUNTRIES.map((c) => {
    const entries = db.entries.filter((e) => e.country === c);
    const persons = entries.filter((e) => e.category === "person").length;
    const orgs = entries.filter((e) => e.category === "company").length;
    const links = entries.reduce((s, e) => s + e.linkedTo.length, 0);
    const signals = db.signals.filter((s) => entries.some((e) => e.id === s.entityId)).length;
    return { country: c, total: entries.length, persons, orgs, links, signals, entries };
  });

  // Cross-border connections
  const crossBorder = db.entries.flatMap((e) =>
    e.linkedTo.map((lid) => {
      const linked = db.entries.find((x) => x.id === lid);
      if (!linked || !e.country || !linked.country || e.country === linked.country) return null;
      return { from: e.country, to: linked.country, fromName: e.name, toName: linked.name };
    }).filter(Boolean)
  );

  const uniqueCross = new Map<string, { from: string; to: string; count: number; pairs: string[] }>();
  crossBorder.forEach((c) => {
    if (!c) return;
    const key = [c.from, c.to].sort().join("-");
    const existing = uniqueCross.get(key) || { from: c.from, to: c.to, count: 0, pairs: [] };
    existing.count++;
    const pair = `${c.fromName} ↔ ${c.toName}`;
    if (!existing.pairs.includes(pair)) existing.pairs.push(pair);
    uniqueCross.set(key, existing);
  });

  const selectedData = selected ? countryStats.find((c) => c.country === selected) : null;

  return (
    <>
      <PageHeader title="Geographic Intelligence" description="Country-level breakdown and cross-border network analysis" />

      {/* Country Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {countryStats.map((cs) => {
          const meta = COUNTRY_META[cs.country];
          const isSelected = selected === cs.country;
          return (
            <div
              key={cs.country}
              onClick={() => setSelected(isSelected ? null : cs.country)}
              className={cn(
                "rounded-2xl border p-4 cursor-pointer transition-all duration-200",
                isSelected
                  ? "bg-accent text-white border-accent shadow-lg shadow-accent/15"
                  : "bg-white/80 border-border/60 hover:border-border hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{meta.flag}</span>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  isSelected ? "bg-white/20 text-white" : "bg-surface-2 text-text-3"
                )}>{meta.code}</span>
              </div>
              <div className={cn("text-2xl font-bold", !isSelected && "text-text")}>{cs.total}</div>
              <div className={cn("text-[11px] mt-0.5", isSelected ? "text-white/70" : "text-text-3")}>
                {cs.persons}P · {cs.orgs}O · {cs.links}L
              </div>
              <div className={cn("text-[12px] font-medium mt-2", isSelected ? "text-white/90" : "text-text-2")}>
                {cs.country}
              </div>
              {cs.signals > 0 && (
                <div className={cn("text-[10px] mt-1 font-semibold",
                  isSelected ? "text-white" : "text-amber"
                )}>
                  {cs.signals} active signal{cs.signals > 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cross-Border Connections */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-accent" />
          <h3 className="text-[12px] font-semibold text-text-2 uppercase tracking-wider flex items-center gap-2">
            <Globe size={14} /> Cross-Border Connections ({uniqueCross.size})
          </h3>
        </div>
        {uniqueCross.size === 0 ? (
          <p className="text-text-3 text-sm text-center py-4">No cross-border connections detected.</p>
        ) : (
          <div className="space-y-3">
            {Array.from(uniqueCross.values()).map((conn, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-surface-2/40 p-3 hover:bg-surface-2/70 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{COUNTRY_META[conn.from]?.flag}</span>
                  <div className="flex-1 h-px bg-border relative">
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
                      <span className="bg-surface-2 px-2 text-[10px] text-text-3 font-medium">{conn.count} link{conn.count > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <span className="text-lg">{COUNTRY_META[conn.to]?.flag}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {conn.pairs.slice(0, 4).map((p, j) => (
                    <span key={j} className="text-[11px] text-text-2 bg-surface-3 px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                  {conn.pairs.length > 4 && (
                    <span className="text-[11px] text-text-3">+{conn.pairs.length - 4} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Selected Country Detail */}
      {selectedData && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">{COUNTRY_META[selectedData.country]?.flag}</span>
            {selectedData.country} — {selectedData.total} Entities
          </h3>
          <div className="space-y-2">
            {selectedData.entries.map((entry) => (
              <GlassCard
                key={entry.id}
                className="cursor-pointer hover:border-accent/40 py-3"
                onClick={() => router.push(`/entry/${entry.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={entry.category as never}>{entry.category}</Badge>
                    <span className="text-[14px] font-medium">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.context as never}>{entry.context}</Badge>
                    <span className="text-[11px] text-text-3 flex items-center gap-1">
                      <Link2 size={10} /> {entry.linkedTo.length}
                    </span>
                    <ArrowRight size={14} className="text-text-3" />
                  </div>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 ml-[76px]">
                    {entry.tags.map((t) => (
                      <span key={t} className="text-[10px] text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
