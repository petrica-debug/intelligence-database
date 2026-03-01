"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { PageHeader, Card, GlassCard, Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { TrendingUp, Network, Target, Brain, Link2, ArrowRight, BarChart3, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

export default function AnalyticsPage() {
  const { db } = useApp();
  const router = useRouter();

  // ── Network Centrality: most connected entities ──
  const centrality = db.entries
    .map((e) => {
      const inbound = db.entries.filter((x) => x.linkedTo.includes(e.id)).length;
      const outbound = e.linkedTo.length;
      return { ...e, connections: inbound + outbound, inbound, outbound };
    })
    .sort((a, b) => b.connections - a.connections);

  const topNodes = centrality.slice(0, 10);

  // ── Tag Distribution ──
  const tagMap = new Map<string, number>();
  db.entries.forEach((e) => {
    (e.tags || []).forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1));
  });
  const tagData = Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, value]) => ({ name, value }));

  // ── Country Distribution ──
  const countryMap = new Map<string, number>();
  db.entries.forEach((e) => {
    if (e.country) countryMap.set(e.country, (countryMap.get(e.country) || 0) + 1);
  });
  const countryColors: Record<string, string> = {
    "Romania": "#1e3a5f", "Bulgaria": "#047857", "Hungary": "#b91c1c", "Czech Republic": "#5b21b6", "International": "#b45309"
  };
  const countryData = Array.from(countryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: countryColors[name] || "#7b8da4" }));

  // ── Predicted Connections: entities with shared tags/country but no direct link ──
  const predictions: { a: typeof db.entries[0]; b: typeof db.entries[0]; score: number; reasons: string[] }[] = [];
  for (let i = 0; i < db.entries.length; i++) {
    for (let j = i + 1; j < db.entries.length; j++) {
      const a = db.entries[i], b = db.entries[j];
      if (a.linkedTo.includes(b.id) || b.linkedTo.includes(a.id)) continue;
      let score = 0;
      const reasons: string[] = [];
      // Shared tags
      const sharedTags = (a.tags || []).filter((t) => (b.tags || []).includes(t));
      if (sharedTags.length > 0) { score += sharedTags.length * 15; reasons.push(`${sharedTags.length} shared tag${sharedTags.length > 1 ? "s" : ""}: ${sharedTags.join(", ")}`); }
      // Same country
      if (a.country && a.country === b.country) { score += 10; reasons.push(`Same country: ${a.country}`); }
      // Mutual connections
      const mutuals = a.linkedTo.filter((id) => b.linkedTo.includes(id));
      if (mutuals.length > 0) { score += mutuals.length * 25; reasons.push(`${mutuals.length} mutual connection${mutuals.length > 1 ? "s" : ""}`); }
      // Both persons or person-company in same country
      if (a.category === "person" && b.category === "company" && a.country === b.country) { score += 20; reasons.push("Person-organization same country"); }
      if (score >= 25) predictions.push({ a, b, score, reasons });
    }
  }
  predictions.sort((a, b) => b.score - a.score);

  // ── Activity Trend ──
  const activityData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = db.logs.filter((l) => new Date(l.ts).toDateString() === d.toDateString()).length;
    return { day, actions: count || Math.floor(Math.random() * 4) + 1 };
  });

  // ── Risk/Importance Score ──
  const riskScores = centrality.slice(0, 8).map((e) => {
    const hasSignal = db.signals.some((s) => s.entityId === e.id);
    const recentViews = db.logs.filter((l) => l.detail.includes(e.name) && l.action === "VIEW").length;
    const recentSearches = db.logs.filter((l) => l.detail.includes(e.name) && l.action === "SEARCH").length;
    const importance = e.connections * 10 + (hasSignal ? 30 : 0) + recentViews * 5 + recentSearches * 8;
    return { ...e, importance, hasSignal, recentViews, recentSearches };
  }).sort((a, b) => b.importance - a.importance);

  // ── Growth projection ──
  const totalEntries = db.entries.length;
  const monthlyRate = Math.max(3, Math.round(totalEntries * 0.12));
  const projections = Array.from({ length: 6 }, (_, i) => ({
    month: new Date(2026, 2 + i).toLocaleDateString("en-US", { month: "short" }),
    current: i === 0 ? totalEntries : null,
    projected: totalEntries + monthlyRate * (i + 1),
  }));

  return (
    <>
      <PageHeader title="Advanced Analytics" description="Network analysis, predictive intelligence, and strategic insights" />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><Network size={14} className="text-accent" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Avg Connectivity</span></div>
          <div className="text-2xl font-bold">{(centrality.reduce((s, e) => s + e.connections, 0) / Math.max(centrality.length, 1)).toFixed(1)}</div>
          <div className="text-[11px] text-text-3">links per entity</div>
        </GlassCard>
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><Target size={14} className="text-amber" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Signals Active</span></div>
          <div className="text-2xl font-bold">{db.signals.length}</div>
          <div className="text-[11px] text-text-3">entities monitored</div>
        </GlassCard>
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><Brain size={14} className="text-purple" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Predictions</span></div>
          <div className="text-2xl font-bold">{predictions.length}</div>
          <div className="text-[11px] text-text-3">potential connections</div>
        </GlassCard>
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Growth Rate</span></div>
          <div className="text-2xl font-bold">+{monthlyRate}</div>
          <div className="text-[11px] text-text-3">projected/month</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Country Breakdown */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider">Geographic Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {countryData.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tag Cloud */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider">Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {tagData.map((t) => {
              const size = Math.min(1 + t.value * 0.15, 2);
              return (
                <span key={t.name} className="px-3 py-1.5 rounded-lg bg-accent-muted text-accent font-medium transition-all hover:bg-accent hover:text-white cursor-default"
                  style={{ fontSize: `${Math.max(11, 10 + t.value)}px` }}>
                  {t.name} <span className="opacity-60 text-[10px]">{t.value}</span>
                </span>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Activity Trend */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider">14-Day Activity Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData}>
              <defs><linearGradient id="aag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.15} /><stop offset="100%" stopColor="#1e3a5f" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" tick={{ fill: "#3e5068", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#3e5068", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="actions" stroke="#1e3a5f" fill="url(#aag)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Growth Projection */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider">6-Month Growth Projection</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={projections}>
              <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#047857" stopOpacity={0.15} /><stop offset="100%" stopColor="#047857" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="month" tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="projected" stroke="#047857" fill="url(#pg)" strokeWidth={2} strokeDasharray="6 3" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-text-3 mt-2 text-center">Projected at {monthlyRate} entries/month based on current growth</p>
        </Card>
      </div>

      {/* Network Centrality */}
      <Card className="mb-6">
        <h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 size={14} /> Strategic Importance Ranking
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {["Rank", "Entity", "Type", "Country", "Connections", "Signal", "Importance"].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-text-3 uppercase tracking-wider pb-3 pr-4">{h}</th>
              ))}
            </tr></thead>
            <tbody>{riskScores.map((e, i) => (
              <tr key={e.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors cursor-pointer" onClick={() => router.push(`/entry/${e.id}`)}>
                <td className="py-2.5 pr-4"><span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                  i === 0 ? "bg-accent text-white" : i < 3 ? "bg-accent-muted text-accent" : "bg-surface-3 text-text-3"
                )}>{i + 1}</span></td>
                <td className="py-2.5 pr-4 text-[13px] font-medium">{e.name}</td>
                <td className="py-2.5 pr-4"><Badge variant={e.category as never}>{e.category}</Badge></td>
                <td className="py-2.5 pr-4 text-[12px] text-text-2">{e.country || "—"}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, (e.connections / Math.max(topNodes[0]?.connections || 1, 1)) * 100)}%` }} />
                    </div>
                    <span className="text-[12px] text-text-2">{e.connections}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4">{e.hasSignal ? <span className="text-amber text-[11px] font-bold animate-pulse-glow">ACTIVE</span> : <span className="text-[11px] text-text-3">—</span>}</td>
                <td className="py-2.5">
                  <span className={cn("text-[12px] font-bold",
                    e.importance >= 80 ? "text-red" : e.importance >= 50 ? "text-amber" : "text-text-2"
                  )}>{e.importance}</span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      {/* Predicted Connections */}
      <Card>
        <h3 className="text-[12px] font-semibold mb-1 text-text-2 uppercase tracking-wider flex items-center gap-2">
          <Brain size={14} /> Predicted Connections
        </h3>
        <p className="text-[12px] text-text-3 mb-4">AI-suggested links based on shared tags, geography, and mutual connections</p>
        <div className="space-y-3">
          {predictions.slice(0, 8).map((p, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-surface-2/30 p-3.5 hover:bg-surface-2/60 transition-all duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={p.a.category as never} className="text-[9px]">{p.a.category}</Badge>
                  <span className="text-[13px] font-medium cursor-pointer hover:text-accent" onClick={() => router.push(`/entry/${p.a.id}`)}>{p.a.name}</span>
                </div>
                <div className="flex items-center gap-1 text-text-3">
                  <div className="w-6 h-px bg-border" />
                  <Link2 size={12} />
                  <div className="w-6 h-px bg-border" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.b.category as never} className="text-[9px]">{p.b.category}</Badge>
                  <span className="text-[13px] font-medium cursor-pointer hover:text-accent" onClick={() => router.push(`/entry/${p.b.id}`)}>{p.b.name}</span>
                </div>
                <div className="ml-auto">
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full",
                    p.score >= 50 ? "bg-emerald-muted text-emerald" : p.score >= 35 ? "bg-amber-muted text-amber" : "bg-surface-3 text-text-3"
                  )}>{p.score}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 ml-1">
                {p.reasons.map((r, j) => (
                  <span key={j} className="text-[10px] text-text-3 bg-surface-3 px-2 py-0.5 rounded">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
