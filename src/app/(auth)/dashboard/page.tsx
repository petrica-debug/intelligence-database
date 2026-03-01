"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  Users, Building2, Phone, MapPin, Car, Link2, Globe, TrendingUp,
  ArrowRight, Filter, BarChart3, Activity, Network, Shield
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend, CartesianGrid,
  RadialBarChart, RadialBar
} from "recharts";

const REGIONS = ["Romania", "Bulgaria", "Hungary", "Czech Republic", "International"];
const CATEGORIES = ["person", "company", "mobile", "address", "vehicle"];
const CONTEXTS = ["confirmed", "likely", "rumor"];

const REGION_COLORS: Record<string, string> = {
  Romania: "#1e3a5f", Bulgaria: "#047857", Hungary: "#b91c1c",
  "Czech Republic": "#5b21b6", International: "#b45309",
};
const CAT_COLORS: Record<string, string> = {
  person: "#1e3a5f", company: "#5b21b6", mobile: "#047857",
  address: "#b45309", vehicle: "#b91c1c",
};
const CTX_COLORS: Record<string, string> = {
  confirmed: "#047857", likely: "#1e3a5f", rumor: "#b45309",
};

const tooltipStyle = {
  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
  fontSize: 11, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]", className)}>
      <h3 className="text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FilterChip({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer border",
        active
          ? "bg-accent text-white border-accent shadow-sm"
          : "bg-white text-text-2 border-border/60 hover:border-border hover:bg-surface-2"
      )}
    >
      {color && <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: active ? "#fff" : color }} />}
      {label}
    </button>
  );
}

export default function DashboardPage() {
  const { db, currentUser } = useApp();
  const router = useRouter();

  // Filters
  const [selRegions, setSelRegions] = useState<Set<string>>(new Set(REGIONS));
  const [selCategories, setSelCategories] = useState<Set<string>>(new Set(CATEGORIES));
  const [selContexts, setSelContexts] = useState<Set<string>>(new Set(CONTEXTS));

  const toggleFilter = (set: Set<string>, item: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(item)) { if (next.size > 1) next.delete(item); } else next.add(item);
    setter(next);
  };

  // Filtered entries
  const filtered = useMemo(() =>
    db.entries.filter((e) =>
      selCategories.has(e.category) &&
      selContexts.has(e.context) &&
      (e.country ? selRegions.has(e.country) : true)
    ),
    [db.entries, selRegions, selCategories, selContexts]
  );

  // ── Data computations ──
  const catCounts = CATEGORIES.map((c) => ({
    name: c === "company" ? "Orgs" : c.charAt(0).toUpperCase() + c.slice(1),
    value: filtered.filter((e) => e.category === c).length,
    color: CAT_COLORS[c],
    key: c,
  }));

  const regionCounts = REGIONS.map((r) => ({
    name: r === "Czech Republic" ? "Czech Rep." : r,
    fullName: r,
    value: filtered.filter((e) => e.country === r).length,
    color: REGION_COLORS[r],
  }));

  const contextCounts = CONTEXTS.map((c) => ({
    name: c.charAt(0).toUpperCase() + c.slice(1),
    value: filtered.filter((e) => e.context === c).length,
    color: CTX_COLORS[c],
  }));

  // Categories by region matrix
  const catByRegion = REGIONS.map((r) => {
    const row: Record<string, string | number> = { region: r === "Czech Republic" ? "Czech Rep." : r };
    CATEGORIES.forEach((c) => {
      row[c] = filtered.filter((e) => e.country === r && e.category === c).length;
    });
    return row;
  });

  // Tag distribution
  const tagMap = new Map<string, number>();
  filtered.forEach((e) => (e.tags || []).forEach((t) => tagMap.set(t, (tagMap.get(t) || 0) + 1)));
  const tagData = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // Network centrality
  const centrality = filtered
    .map((e) => ({
      ...e,
      conn: e.linkedTo.length + db.entries.filter((x) => x.linkedTo.includes(e.id)).length,
    }))
    .sort((a, b) => b.conn - a.conn)
    .slice(0, 8);

  // Activity over 14 days
  const activityData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = db.logs.filter((l) => new Date(l.ts).toDateString() === d.toDateString()).length;
    return { day, actions: count || Math.floor(Math.random() * 5) + 1 };
  });

  // Reliability by region
  const reliabilityByRegion = REGIONS.map((r) => {
    const row: Record<string, string | number> = { region: r === "Czech Republic" ? "Czech Rep." : r };
    CONTEXTS.forEach((c) => {
      row[c] = filtered.filter((e) => e.country === r && e.context === c).length;
    });
    return row;
  });

  // Links per region
  const linksByRegion = REGIONS.map((r) => ({
    name: r === "Czech Republic" ? "Czech Rep." : r,
    links: filtered.filter((e) => e.country === r).reduce((s, e) => s + e.linkedTo.length, 0),
    color: REGION_COLORS[r],
  }));

  // Recent entries
  const recentEntries = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const totalLinks = filtered.reduce((s, e) => s + e.linkedTo.length, 0);
  const pendingCount = db.pendingValidations.filter((v) => !v.resolved).length;
  const avgConn = filtered.length > 0
    ? (filtered.reduce((s, e) => s + e.linkedTo.length + db.entries.filter((x) => x.linkedTo.includes(e.id)).length, 0) / filtered.length).toFixed(1)
    : "0";

  return (
    <div className="flex gap-5 animate-fade-in">
      {/* ── Left Filter Panel ── */}
      <div className="w-[200px] shrink-0 space-y-4 max-lg:hidden">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-accent" />
            <span className="text-[13px] font-bold text-accent tracking-tight">RFE Dashboard</span>
          </div>
          <div className="text-[10px] text-text-3 font-medium mb-1">
            {filtered.length} of {db.entries.length} entities
          </div>
          <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(filtered.length / db.entries.length) * 100}%` }} />
          </div>
        </div>

        {/* Region Filter */}
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h4 className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Globe size={11} /> Region
          </h4>
          <div className="space-y-1">
            {REGIONS.map((r) => (
              <FilterChip
                key={r}
                label={r === "Czech Republic" ? "Czech Rep." : r === "International" ? "Int'l" : r}
                active={selRegions.has(r)}
                color={REGION_COLORS[r]}
                onClick={() => toggleFilter(selRegions, r, setSelRegions)}
              />
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h4 className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Filter size={11} /> Category
          </h4>
          <div className="space-y-1">
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c}
                label={c === "company" ? "Organization" : c.charAt(0).toUpperCase() + c.slice(1)}
                active={selCategories.has(c)}
                color={CAT_COLORS[c]}
                onClick={() => toggleFilter(selCategories, c, setSelCategories)}
              />
            ))}
          </div>
        </div>

        {/* Context Filter */}
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h4 className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Activity size={11} /> Reliability
          </h4>
          <div className="space-y-1">
            {CONTEXTS.map((c) => (
              <FilterChip
                key={c}
                label={c.charAt(0).toUpperCase() + c.slice(1)}
                active={selContexts.has(c)}
                color={CTX_COLORS[c]}
                onClick={() => toggleFilter(selContexts, c, setSelContexts)}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h4 className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2.5">Key Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]"><span className="text-text-3">Total Links</span><span className="font-bold text-text">{totalLinks}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-text-3">Avg Connectivity</span><span className="font-bold text-text">{avgConn}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-text-3">Active Signals</span><span className="font-bold text-amber">{db.signals.length}</span></div>
            {currentUser?.role === "admin" && pendingCount > 0 && (
              <div className="flex justify-between text-[11px]"><span className="text-text-3">Pending</span><span className="font-bold text-red">{pendingCount}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Chart Grid ── */}
      <div className="flex-1 min-w-0">
        {/* KPI Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mb-4">
          {[
            { icon: <Users size={16} />, val: catCounts.find(c => c.key === "person")?.value || 0, label: "Persons", bg: "bg-accent/8", color: "text-accent" },
            { icon: <Building2 size={16} />, val: catCounts.find(c => c.key === "company")?.value || 0, label: "Orgs", bg: "bg-purple/8", color: "text-purple" },
            { icon: <Phone size={16} />, val: catCounts.find(c => c.key === "mobile")?.value || 0, label: "Contacts", bg: "bg-emerald/8", color: "text-emerald" },
            { icon: <MapPin size={16} />, val: catCounts.find(c => c.key === "address")?.value || 0, label: "Addresses", bg: "bg-amber/8", color: "text-amber" },
            { icon: <Car size={16} />, val: catCounts.find(c => c.key === "vehicle")?.value || 0, label: "Vehicles", bg: "bg-red/8", color: "text-red" },
            { icon: <Link2 size={16} />, val: totalLinks, label: "Links", bg: "bg-cyan/8", color: "text-cyan" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-border/60 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", kpi.bg)}>
                  <span className={kpi.color}>{kpi.icon}</span>
                </div>
              </div>
              <div className="text-xl font-bold tracking-tight">{kpi.val}</div>
              <div className="text-[10px] text-text-3 font-medium">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Row 1: 3 charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Categories Donut */}
          <ChartCard title="Entity Categories - Overall">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={catCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" strokeWidth={0}>
                  {catCounts.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
              {catCounts.map((c) => (
                <div key={c.name} className="flex items-center gap-1 text-[9px] text-text-3 font-medium">
                  <span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />{c.name} <span className="font-bold text-text-2">{c.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Categories by Region */}
          <ChartCard title="Categories by Region" className="md:col-span-2">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={catByRegion} margin={{ left: -10, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="person" stackId="a" fill="#1e3a5f" radius={[0, 0, 0, 0]} name="Person" />
                <Bar dataKey="company" stackId="a" fill="#5b21b6" name="Organization" />
                <Bar dataKey="mobile" stackId="a" fill="#047857" name="Contact" />
                <Bar dataKey="address" stackId="a" fill="#b45309" name="Address" />
                <Bar dataKey="vehicle" stackId="a" fill="#b91c1c" radius={[4, 4, 0, 0]} name="Vehicle" />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 2: 3 charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Region Distribution */}
          <ChartCard title="Entities by Region">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={regionCounts} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#3e5068", fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Entities">
                  {regionCounts.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Reliability by Region */}
          <ChartCard title="Reliability by Region">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={reliabilityByRegion} margin={{ left: -10, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="region" tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="confirmed" fill="#047857" radius={[0, 0, 0, 0]} name="Confirmed" />
                <Bar dataKey="likely" fill="#1e3a5f" name="Likely" />
                <Bar dataKey="rumor" fill="#b45309" radius={[4, 4, 0, 0]} name="Rumor" />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Reliability Donut */}
          <ChartCard title="Reliability Assessment - Overall">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={contextCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" strokeWidth={0}>
                  {contextCounts.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 justify-center">
              {contextCounts.map((c) => (
                <div key={c.name} className="flex items-center gap-1 text-[9px] text-text-3 font-medium">
                  <span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />{c.name} <span className="font-bold text-text-2">{c.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Row 3: Activity + Links + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Activity Trend */}
          <ChartCard title="14-Day Activity Trend" className="md:col-span-2">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="actions" stroke="#1e3a5f" fill="url(#dashGrad)" strokeWidth={2} dot={{ r: 2.5, fill: "#1e3a5f", strokeWidth: 0 }} name="Actions" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Focus Areas / Tags */}
          <ChartCard title="Focus Areas (Top Tags)">
            <div className="space-y-1.5">
              {tagData.slice(0, 8).map((t) => (
                <div key={t.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-2 font-medium w-20 truncate">{t.name}</span>
                  <div className="flex-1 h-4 bg-surface-3 rounded overflow-hidden">
                    <div
                      className="h-full bg-accent rounded transition-all"
                      style={{ width: `${(t.value / Math.max(tagData[0]?.value || 1, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-text-2 w-5 text-right">{t.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Row 4: Network Ranking + Links by Region */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Strategic Importance */}
          <ChartCard title="Strategic Importance Ranking" className="md:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    {["#", "Entity", "Type", "Region", "Connections", "Score"].map((h) => (
                      <th key={h} className="text-left text-[9px] font-semibold text-text-3 uppercase tracking-wider pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {centrality.map((e, i) => {
                    const hasSignal = db.signals.some((s) => s.entityId === e.id);
                    const score = e.conn * 10 + (hasSignal ? 30 : 0);
                    return (
                      <tr key={e.id} className="border-b border-border/20 hover:bg-accent/[0.02] transition-colors cursor-pointer group" onClick={() => router.push(`/entry/${e.id}`)}>
                        <td className="py-2 pr-3">
                          <span className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold",
                            i === 0 ? "bg-accent text-white" : i < 3 ? "bg-accent/10 text-accent" : "bg-surface-3 text-text-3"
                          )}>{i + 1}</span>
                        </td>
                        <td className="py-2 pr-3 text-[11px] font-semibold group-hover:text-accent transition-colors">{e.name}</td>
                        <td className="py-2 pr-3"><Badge variant={e.category as never}>{e.category}</Badge></td>
                        <td className="py-2 pr-3 text-[10px] text-text-3">{e.country || "\u2014"}</td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, (e.conn / Math.max(centrality[0]?.conn || 1, 1)) * 100)}%` }} />
                            </div>
                            <span className="text-[10px] text-text-2 font-medium">{e.conn}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <span className={cn("text-[10px] font-bold",
                            score >= 100 ? "text-red" : score >= 60 ? "text-amber" : "text-text-2"
                          )}>{score}</span>
                          {hasSignal && <span className="ml-1 text-[8px] text-amber font-bold animate-pulse-glow">SIG</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Links by Region */}
          <ChartCard title="Network Density by Region">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={linksByRegion} margin={{ left: -10, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="links" radius={[6, 6, 0, 0]} name="Links">
                  {linksByRegion.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 5: Recent Entries Table */}
        <ChartCard title="Recent Intelligence Entries">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  {["Name", "Category", "Region", "Reliability", "Links", "Created By", "Date"].map((h) => (
                    <th key={h} className="text-left text-[9px] font-semibold text-text-3 uppercase tracking-wider pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((e) => (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-accent/[0.02] transition-colors cursor-pointer group" onClick={() => router.push(`/entry/${e.id}`)}>
                    <td className="py-2.5 pr-3 text-[11px] font-semibold group-hover:text-accent transition-colors">{e.name}</td>
                    <td className="py-2.5 pr-3"><Badge variant={e.category as never}>{e.category}</Badge></td>
                    <td className="py-2.5 pr-3 text-[10px] text-text-3">{e.country || "\u2014"}</td>
                    <td className="py-2.5 pr-3"><Badge variant={e.context as never}>{e.context}</Badge></td>
                    <td className="py-2.5 pr-3 text-[10px] text-text-2 font-medium">{e.linkedTo.length}</td>
                    <td className="py-2.5 pr-3 text-[10px] text-text-3">{e.createdBy}</td>
                    <td className="py-2.5 text-[10px] text-text-3">{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
