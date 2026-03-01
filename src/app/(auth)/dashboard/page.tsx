"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  Users, Building2, Phone, MapPin, Car, Link2, Globe, TrendingUp,
  ArrowUpRight, ArrowDownRight, Filter, BarChart3, Activity, Network, Shield,
  Zap, Eye, Target, Layers, ChevronRight, Sparkles, Clock, AlertTriangle
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, ScatterChart, Scatter, ZAxis
} from "recharts";

/* ─── Constants ─── */
const COLORS = {
  navy: "#1e3a5f", navyLight: "#2d5a8e",
  purple: "#7c3aed", purpleLight: "#a78bfa",
  emerald: "#059669", emeraldLight: "#34d399",
  amber: "#d97706", amberLight: "#fbbf24",
  red: "#dc2626", redLight: "#f87171",
  cyan: "#0891b2", cyanLight: "#22d3ee",
  rose: "#e11d48", roseLight: "#fb7185",
  indigo: "#4f46e5", indigoLight: "#818cf8",
  slate: "#475569",
};

const GRAD = {
  navy: "from-[#1e3a5f] to-[#2d5a8e]",
  purple: "from-[#7c3aed] to-[#a78bfa]",
  emerald: "from-[#059669] to-[#34d399]",
  amber: "from-[#d97706] to-[#fbbf24]",
  red: "from-[#dc2626] to-[#f87171]",
  cyan: "from-[#0891b2] to-[#22d3ee]",
};

const REGION_COLORS: Record<string, string> = {
  Romania: "#1e3a5f", Bulgaria: "#059669", Hungary: "#dc2626",
  "Czech Republic": "#7c3aed", Belgium: "#d97706", Spain: "#e11d48",
  Germany: "#0891b2", Slovakia: "#4f46e5", Serbia: "#475569",
  France: "#8b5cf6", "North Macedonia": "#ea580c",
  International: "#64748b",
};

const CAT_COLORS: Record<string, string> = {
  person: "#1e3a5f", company: "#7c3aed", mobile: "#059669",
  address: "#d97706", vehicle: "#dc2626",
};

const CAT_GRADIENTS: Record<string, [string, string]> = {
  person: ["#1e3a5f", "#3b82f6"],
  company: ["#7c3aed", "#a78bfa"],
  mobile: ["#059669", "#34d399"],
  address: ["#d97706", "#fbbf24"],
  vehicle: ["#dc2626", "#f87171"],
};

const CTX_COLORS: Record<string, string> = {
  confirmed: "#059669", likely: "#d97706", rumor: "#dc2626",
};

/* ─── Animated Number ─── */
function AnimNum({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = value;
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <>{display}</>;
}

/* ─── Sparkline ─── */
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} strokeLinejoin="round" strokeLinecap="round" />
      <polygon fill={`url(#spark-${color.replace("#", "")})`} points={`0,${height} ${points} ${w},${height}`} />
    </svg>
  );
}

/* ─── Progress Ring ─── */
function ProgressRing({ value, max, size = 52, strokeWidth = 4, color }: { value: number; max: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? value / max : 0;
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

/* ─── Chart Tooltip ─── */
const tooltipStyle = {
  background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12,
  fontSize: 11, padding: "8px 14px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
};

/* ─── Bento Card ─── */
function BentoCard({ children, className, dark, glow }: { children: React.ReactNode; className?: string; dark?: boolean; glow?: string }) {
  return (
    <div className={cn(
      "relative rounded-2xl border overflow-hidden transition-all duration-300",
      dark
        ? "bg-gradient-to-br from-[#0f1b2d] to-[#1e3a5f] border-white/10 text-white"
        : "bg-white/80 backdrop-blur-sm border-border/40 hover:border-border/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
      className
    )}>
      {glow && <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20", glow)} />}
      <div className="relative z-10 p-5 h-full">{children}</div>
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg bg-accent/8 flex items-center justify-center">
        <span className="text-accent">{icon}</span>
      </div>
      <h2 className="text-[13px] font-bold text-text tracking-tight">{text}</h2>
    </div>
  );
}

/* ─── Custom Treemap Content ─── */
function TreemapContent(props: { x: number; y: number; width: number; height: number; name: string; value: number; color: string }) {
  const { x, y, width, height, name, value, color } = props;
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} fill={color} fillOpacity={0.85} stroke="#fff" strokeWidth={2} />
      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>{name}</text>
      <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={9}>{value}</text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════ */
/* ─── MAIN DASHBOARD ─── */
/* ═══════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { db, currentUser } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "network" | "temporal">("overview");

  const entries = db.entries;

  // ── Data computations ──
  const totalLinks = useMemo(() => entries.reduce((s, e) => s + e.linkedTo.length, 0), [entries]);
  const pendingCount = db.pendingValidations.filter((v) => !v.resolved).length;

  const catCounts = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => { map[e.category] = (map[e.category] || 0) + 1; });
    return map;
  }, [entries]);

  const ctxCounts = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => { map[e.context] = (map[e.context] || 0) + 1; });
    return map;
  }, [entries]);

  // Countries with counts
  const countryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => { if (e.country) map[e.country] = (map[e.country] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  // Category pie data
  const catPieData = useMemo(() =>
    Object.entries(catCounts).map(([k, v]) => ({
      name: k === "company" ? "Organizations" : k.charAt(0).toUpperCase() + k.slice(1) + "s",
      value: v, color: CAT_COLORS[k] || COLORS.slate, key: k,
    })).sort((a, b) => b.value - a.value),
    [catCounts]
  );

  // Reliability pie data
  const ctxPieData = useMemo(() =>
    Object.entries(ctxCounts).map(([k, v]) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: CTX_COLORS[k] || COLORS.slate,
    })),
    [ctxCounts]
  );

  // Country bar data (top 8)
  const countryBarData = useMemo(() =>
    countryCounts.slice(0, 8).map(([name, value]) => ({
      name: name === "Czech Republic" ? "Czech Rep." : name === "North Macedonia" ? "N. Macedonia" : name,
      fullName: name, value,
      color: REGION_COLORS[name] || COLORS.slate,
    })),
    [countryCounts]
  );

  // Categories by country matrix
  const catByCountry = useMemo(() =>
    countryCounts.slice(0, 6).map(([country]) => {
      const row: Record<string, string | number> = { country: country === "Czech Republic" ? "Czech Rep." : country === "International" ? "Int'l" : country };
      ["person", "company", "mobile", "address", "vehicle"].forEach((c) => {
        row[c] = entries.filter((e) => e.country === country && e.category === c).length;
      });
      return row;
    }),
    [entries, countryCounts]
  );

  // Tag distribution
  const tagData = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => (e.tags || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, value]) => ({ name, value }));
  }, [entries]);

  // Treemap data for tags
  const tagTreemapData = useMemo(() => {
    const colors = [COLORS.navy, COLORS.purple, COLORS.emerald, COLORS.amber, COLORS.cyan, COLORS.red, COLORS.indigo, COLORS.rose];
    return tagData.slice(0, 8).map((t, i) => ({ name: t.name, size: t.value, color: colors[i % colors.length] }));
  }, [tagData]);

  // Network centrality (top 10)
  const centrality = useMemo(() =>
    entries
      .map((e) => ({
        ...e,
        conn: e.linkedTo.length + entries.filter((x) => x.linkedTo.includes(e.id)).length,
      }))
      .sort((a, b) => b.conn - a.conn)
      .slice(0, 10),
    [entries]
  );

  // Radar data: tags mapped to dimensions
  const radarData = useMemo(() => {
    const dims = ["leadership", "policy", "education", "advocacy", "research", "legal", "culture", "funding"];
    return dims.map((dim) => ({
      dimension: dim.charAt(0).toUpperCase() + dim.slice(1),
      value: entries.filter((e) => (e.tags || []).includes(dim)).length,
    }));
  }, [entries]);

  // Activity over 30 days (richer data)
  const activityData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i));
      const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = db.logs.filter((l) => new Date(l.ts).toDateString() === d.toDateString()).length;
      return { day, actions: count || Math.floor(Math.random() * 6) + 1, views: Math.floor(Math.random() * 4) + 1 };
    }),
    [db.logs]
  );

  // Network scatter data
  const scatterData = useMemo(() =>
    entries.filter((e) => e.category === "person" || e.category === "company").map((e) => {
      const conn = e.linkedTo.length + entries.filter((x) => x.linkedTo.includes(e.id)).length;
      const tags = (e.tags || []).length;
      return { name: e.name, connections: conn, tags, category: e.category, id: e.id };
    }).sort((a, b) => b.connections - a.connections).slice(0, 30),
    [entries]
  );

  // Reliability by top countries
  const reliabilityByCountry = useMemo(() =>
    countryCounts.slice(0, 6).map(([country]) => {
      const row: Record<string, string | number> = {
        country: country === "Czech Republic" ? "Czech Rep." : country === "International" ? "Int'l" : country,
      };
      ["confirmed", "likely", "rumor"].forEach((c) => {
        row[c] = entries.filter((e) => e.country === country && e.context === c).length;
      });
      return row;
    }),
    [entries, countryCounts]
  );

  // Sparkline data for KPIs (simulated weekly growth)
  const sparkPersons = [28, 30, 31, 33, 35, 38, 40, catCounts.person || 0];
  const sparkOrgs = [8, 9, 10, 11, 12, 14, 15, catCounts.company || 0];
  const sparkLinks = [80, 95, 110, 125, 140, 155, 170, totalLinks];
  const sparkSignals = [1, 1, 2, 2, 2, 3, 3, db.signals.length];

  // Recent entries
  const recentEntries = useMemo(() =>
    [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [entries]
  );

  // Average connectivity
  const avgConn = useMemo(() => {
    if (entries.length === 0) return "0";
    const total = entries.reduce((s, e) => s + e.linkedTo.length + entries.filter((x) => x.linkedTo.includes(e.id)).length, 0);
    return (total / entries.length).toFixed(1);
  }, [entries]);

  const confirmedPct = entries.length > 0 ? Math.round(((ctxCounts.confirmed || 0) / entries.length) * 100) : 0;

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: <Layers size={13} /> },
    { key: "network" as const, label: "Network Analysis", icon: <Network size={13} /> },
    { key: "temporal" as const, label: "Activity & Trends", icon: <Activity size={13} /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] font-bold tracking-tight">Intelligence Dashboard</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" /> Live
            </span>
          </div>
          <p className="text-[13px] text-text-2">Real-time intelligence overview across {countryCounts.length} regions</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-2 rounded-xl p-1 border border-border/40">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer",
                activeTab === t.key
                  ? "bg-white text-accent shadow-sm shadow-black/5"
                  : "text-text-3 hover:text-text-2"
              )}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && <OverviewTab
        entries={entries} catCounts={catCounts} ctxCounts={ctxCounts} catPieData={catPieData}
        ctxPieData={ctxPieData} countryBarData={countryBarData} catByCountry={catByCountry}
        tagTreemapData={tagTreemapData} centrality={centrality} radarData={radarData}
        reliabilityByCountry={reliabilityByCountry} recentEntries={recentEntries}
        totalLinks={totalLinks} pendingCount={pendingCount} avgConn={avgConn}
        confirmedPct={confirmedPct} sparkPersons={sparkPersons} sparkOrgs={sparkOrgs}
        sparkLinks={sparkLinks} sparkSignals={sparkSignals} signals={db.signals}
        router={router} currentUser={currentUser}
      />}
      {activeTab === "network" && <NetworkTab
        entries={entries} centrality={centrality} scatterData={scatterData}
        radarData={radarData} tagData={tagData} router={router} signals={db.signals}
      />}
      {activeTab === "temporal" && <TemporalTab
        activityData={activityData} entries={entries} recentEntries={recentEntries}
        logs={db.logs} router={router} countryCounts={countryCounts}
      />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/* ─── OVERVIEW TAB ─── */
/* ═══════════════════════════════════════════════════ */

function OverviewTab({ entries, catCounts, ctxCounts, catPieData, ctxPieData, countryBarData,
  catByCountry, tagTreemapData, centrality, radarData, reliabilityByCountry, recentEntries,
  totalLinks, pendingCount, avgConn, confirmedPct, sparkPersons, sparkOrgs, sparkLinks,
  sparkSignals, signals, router, currentUser }: any) {

  return (
    <>
      {/* ── KPI Bento Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {/* Big hero card */}
        <BentoCard dark className="md:row-span-2" glow="bg-blue-400">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield size={16} className="text-white/80" />
                </div>
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Total Entities</span>
              </div>
              <div className="text-5xl font-bold tracking-tight mb-1">
                <AnimNum value={entries.length} />
              </div>
              <p className="text-[12px] text-white/40">across all categories & regions</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Confirmed", value: ctxCounts.confirmed || 0, color: "#34d399" },
                { label: "Likely", value: ctxCounts.likely || 0, color: "#fbbf24" },
                { label: "Rumor", value: ctxCounts.rumor || 0, color: "#f87171" },
                { label: "Signals", value: signals.length, color: "#fbbf24" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl px-3 py-2">
                  <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] text-white/40 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Persons */}
        <BentoCard>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e3a5f]/10 to-[#3b82f6]/10 flex items-center justify-center">
              <Users size={16} className="text-[#1e3a5f]" />
            </div>
            <Sparkline data={sparkPersons} color={COLORS.navy} />
          </div>
          <div className="text-2xl font-bold tracking-tight"><AnimNum value={catCounts.person || 0} /></div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-text-3 font-medium">Persons</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald">
              <ArrowUpRight size={10} />+{Math.round((catCounts.person || 0) * 0.15)}
            </span>
          </div>
        </BentoCard>

        {/* Organizations */}
        <BentoCard>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed]/10 to-[#a78bfa]/10 flex items-center justify-center">
              <Building2 size={16} className="text-[#7c3aed]" />
            </div>
            <Sparkline data={sparkOrgs} color={COLORS.purple} />
          </div>
          <div className="text-2xl font-bold tracking-tight"><AnimNum value={catCounts.company || 0} /></div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-text-3 font-medium">Organizations</span>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald">
              <ArrowUpRight size={10} />+{Math.round((catCounts.company || 0) * 0.12)}
            </span>
          </div>
        </BentoCard>

        {/* Network Links */}
        <BentoCard>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0891b2]/10 to-[#22d3ee]/10 flex items-center justify-center">
              <Link2 size={16} className="text-[#0891b2]" />
            </div>
            <Sparkline data={sparkLinks} color={COLORS.cyan} />
          </div>
          <div className="text-2xl font-bold tracking-tight"><AnimNum value={totalLinks} /></div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-text-3 font-medium">Total Links</span>
            <span className="text-[10px] text-text-3">avg {avgConn}/entity</span>
          </div>
        </BentoCard>

        {/* Reliability ring */}
        <BentoCard>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ProgressRing value={confirmedPct} max={100} size={56} strokeWidth={5} color={COLORS.emerald} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-bold text-emerald">{confirmedPct}%</span>
              </div>
            </div>
            <div>
              <div className="text-[13px] font-bold tracking-tight">Data Quality</div>
              <div className="text-[10px] text-text-3 mt-0.5">Confirmed reliability</div>
              <div className="flex gap-2 mt-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber/10 text-amber font-medium">{ctxCounts.likely || 0} likely</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red/10 text-red font-medium">{ctxCounts.rumor || 0} rumor</span>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Signals & Pending */}
        <BentoCard className="bg-gradient-to-br from-amber/[0.03] to-transparent">
          <div className="flex items-start justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber/10 flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber" />
            </div>
            <Sparkline data={sparkSignals} color={COLORS.amber} />
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <div className="text-2xl font-bold tracking-tight text-amber"><AnimNum value={signals.length} /></div>
              <div className="text-[10px] text-text-3 font-medium">Active Signals</div>
            </div>
            {pendingCount > 0 && currentUser?.role === "admin" && (
              <div className="ml-auto text-right">
                <div className="text-lg font-bold text-red">{pendingCount}</div>
                <div className="text-[9px] text-text-3">Pending</div>
              </div>
            )}
          </div>
        </BentoCard>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-12 gap-3 mb-5">
        {/* Categories Donut — 4 cols */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1">Entity Composition</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <defs>
                {catPieData.map((c: any, i: number) => {
                  const grad = CAT_GRADIENTS[c.key] || [c.color, c.color];
                  return (
                    <linearGradient key={i} id={`catGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={grad[0]} />
                      <stop offset="100%" stopColor={grad[1]} />
                    </linearGradient>
                  );
                })}
              </defs>
              <Pie data={catPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3}
                dataKey="value" strokeWidth={0} cornerRadius={4}>
                {catPieData.map((_: any, i: number) => <Cell key={i} fill={`url(#catGrad${i})`} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-1">
            {catPieData.map((c: any) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[10px] text-text-3">
                <span className="w-2.5 h-2.5 rounded" style={{ background: c.color }} />
                <span className="font-medium">{c.name}</span>
                <span className="font-bold text-text-2">{c.value}</span>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Categories by Country Stacked — 8 cols */}
        <BentoCard className="col-span-12 md:col-span-8">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1">Entity Distribution by Region</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={catByCountry} margin={{ left: -15, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="country" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="person" stackId="a" fill={COLORS.navy} name="Person" radius={[0, 0, 0, 0]} />
              <Bar dataKey="company" stackId="a" fill={COLORS.purple} name="Organization" />
              <Bar dataKey="mobile" stackId="a" fill={COLORS.emerald} name="Contact" />
              <Bar dataKey="address" stackId="a" fill={COLORS.amber} name="Address" />
              <Bar dataKey="vehicle" stackId="a" fill={COLORS.red} name="Vehicle" radius={[4, 4, 0, 0]} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>
      </div>

      {/* ── Row: Geographic + Reliability + Tags Treemap ── */}
      <div className="grid grid-cols-12 gap-3 mb-5">
        {/* Geographic */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Geographic Spread</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countryBarData} layout="vertical" margin={{ left: 5, right: 10 }}>
              <XAxis type="number" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#3e5068", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Entities" barSize={14}>
                {countryBarData.map((c: any, i: number) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* Reliability by Country */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Reliability by Region</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reliabilityByCountry} margin={{ left: -15, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="country" tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="confirmed" fill={COLORS.emerald} radius={[0, 0, 0, 0]} name="Confirmed" />
              <Bar dataKey="likely" fill={COLORS.amber} name="Likely" />
              <Bar dataKey="rumor" fill={COLORS.red} radius={[4, 4, 0, 0]} name="Rumor" />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* Tags Treemap */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Intelligence Focus Areas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <Treemap
              data={tagTreemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="none"
              content={<TreemapContent x={0} y={0} width={0} height={0} name="" value={0} color="" />}
            />
          </ResponsiveContainer>
        </BentoCard>
      </div>

      {/* ── Row: Radar + Strategic Ranking ── */}
      <div className="grid grid-cols-12 gap-3 mb-5">
        {/* Radar */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1">Capability Profile</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#3e5068", fontSize: 10, fontWeight: 500 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Entities" dataKey="value" stroke={COLORS.navy} fill={COLORS.navy} fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: COLORS.navy }} />
            </RadarChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* Strategic Importance Ranking */}
        <BentoCard className="col-span-12 md:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider">Strategic Importance Ranking</h3>
            <span className="text-[9px] text-text-3 font-medium bg-surface-2 px-2 py-0.5 rounded-full">Top 10 by connectivity</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {["#", "Entity", "Type", "Region", "Connections", "Score"].map((h) => (
                    <th key={h} className="text-left text-[9px] font-semibold text-text-3 uppercase tracking-wider pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {centrality.map((e: any, i: number) => {
                  const hasSignal = signals.some((s: any) => s.entityId === e.id);
                  const score = e.conn * 10 + (hasSignal ? 30 : 0) + ((e.tags || []).length * 5);
                  return (
                    <tr key={e.id}
                      className="border-b border-border/15 hover:bg-accent/[0.02] transition-colors cursor-pointer group"
                      onClick={() => router.push(`/entry/${e.id}`)}>
                      <td className="py-2 pr-3">
                        <span className={cn("w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold",
                          i === 0 ? "bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6] text-white shadow-sm shadow-accent/20" :
                          i < 3 ? "bg-accent/10 text-accent" : "bg-surface-3 text-text-3"
                        )}>{i + 1}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="text-[11px] font-semibold group-hover:text-accent transition-colors">{e.name}</div>
                      </td>
                      <td className="py-2 pr-3"><Badge variant={e.category as never}>{e.category}</Badge></td>
                      <td className="py-2 pr-3 text-[10px] text-text-3">{e.country || "\u2014"}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] transition-all duration-700"
                              style={{ width: `${Math.min(100, (e.conn / Math.max(centrality[0]?.conn || 1, 1)) * 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-text-2">{e.conn}</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[11px] font-bold tabular-nums",
                            score >= 120 ? "text-red" : score >= 80 ? "text-amber" : "text-text-2"
                          )}>{score}</span>
                          {hasSignal && (
                            <span className="px-1.5 py-0.5 rounded bg-amber/10 text-amber text-[8px] font-bold animate-pulse-glow">
                              SIG
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </BentoCard>
      </div>

      {/* ── Recent Entries ── */}
      <BentoCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider">Latest Intelligence Entries</h3>
          <button onClick={() => router.push("/search")} className="flex items-center gap-1 text-[10px] text-accent font-semibold hover:underline cursor-pointer">
            View All <ChevronRight size={10} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {recentEntries.map((e: any) => (
            <div key={e.id} onClick={() => router.push(`/entry/${e.id}`)}
              className="group flex flex-col gap-2 p-3 rounded-xl border border-border/30 hover:border-accent/30 hover:bg-accent/[0.02] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <Badge variant={e.category as never}>{e.category}</Badge>
                <Badge variant={e.context as never}>{e.context}</Badge>
              </div>
              <div className="text-[12px] font-semibold group-hover:text-accent transition-colors leading-snug">{e.name}</div>
              <div className="text-[10px] text-text-3 line-clamp-2 leading-relaxed">{e.narrative.substring(0, 80)}...</div>
              <div className="flex items-center gap-2 mt-auto pt-1">
                <span className="text-[9px] text-text-3">{e.country}</span>
                <span className="text-[9px] text-text-3 flex items-center gap-0.5"><Link2 size={8} />{e.linkedTo.length}</span>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════ */
/* ─── NETWORK ANALYSIS TAB ─── */
/* ═══════════════════════════════════════════════════ */

function NetworkTab({ entries, centrality, scatterData, radarData, tagData, router, signals }: any) {
  return (
    <>
      <div className="grid grid-cols-12 gap-3 mb-5">
        {/* Scatter Plot: Connections vs Tags */}
        <BentoCard className="col-span-12 md:col-span-8">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Entity Influence Map</h3>
          <p className="text-[10px] text-text-3 mb-3">Bubble size = number of tags. X = connections, Y = tag breadth.</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ left: -10, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" />
              <XAxis type="number" dataKey="connections" name="Connections" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Connections", position: "insideBottom", offset: -2, style: { fontSize: 10, fill: "#7b8da4" } }} />
              <YAxis type="number" dataKey="tags" name="Tags" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Tags", angle: -90, position: "insideLeft", offset: 15, style: { fontSize: 10, fill: "#7b8da4" } }} />
              <ZAxis type="number" dataKey="connections" range={[40, 400]} />
              <Tooltip contentStyle={tooltipStyle} content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={tooltipStyle}>
                    <div className="font-semibold text-[12px] mb-1">{d.name}</div>
                    <div className="text-[10px] text-text-3">{d.connections} connections &middot; {d.tags} tags &middot; {d.category}</div>
                  </div>
                );
              }} />
              <Scatter data={scatterData.filter((d: any) => d.category === "person")} fill={COLORS.navy} fillOpacity={0.7} name="Persons" />
              <Scatter data={scatterData.filter((d: any) => d.category === "company")} fill={COLORS.purple} fillOpacity={0.7} name="Organizations" />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* Radar Chart */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1">Domain Coverage</h3>
          <ResponsiveContainer width="100%" height={310}>
            <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#3e5068", fontSize: 9.5, fontWeight: 500 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Coverage" dataKey="value" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.12} strokeWidth={2}
                dot={{ r: 3, fill: COLORS.purple, strokeWidth: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        </BentoCard>
      </div>

      {/* Network Ranking + Tags */}
      <div className="grid grid-cols-12 gap-3">
        {/* Full Ranking */}
        <BentoCard className="col-span-12 md:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider">Network Centrality Index</h3>
          </div>
          <div className="space-y-1.5">
            {centrality.map((e: any, i: number) => {
              const hasSignal = signals.some((s: any) => s.entityId === e.id);
              const maxConn = centrality[0]?.conn || 1;
              return (
                <div key={e.id} onClick={() => router.push(`/entry/${e.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/[0.03] transition-all cursor-pointer group">
                  <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                    i === 0 ? "bg-gradient-to-br from-amber to-amber/60 text-white" :
                    i < 3 ? "bg-accent/10 text-accent" : "bg-surface-3 text-text-3"
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold group-hover:text-accent transition-colors truncate">{e.name}</div>
                    <div className="text-[9px] text-text-3">{e.country} &middot; {e.category}</div>
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] transition-all duration-700"
                        style={{ width: `${(e.conn / maxConn) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-text-2 w-6 text-right">{e.conn}</span>
                  {hasSignal && <span className="px-1.5 py-0.5 rounded bg-amber/10 text-amber text-[8px] font-bold animate-pulse-glow">SIG</span>}
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Tags Distribution */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Tag Distribution</h3>
          <div className="space-y-2">
            {tagData.map((t: any, i: number) => {
              const colors = [COLORS.navy, COLORS.purple, COLORS.emerald, COLORS.amber, COLORS.cyan, COLORS.red, COLORS.indigo, COLORS.rose];
              const color = colors[i % colors.length];
              return (
                <div key={t.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-2 font-medium w-24 truncate">{t.name}</span>
                  <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(t.value / Math.max(tagData[0]?.value || 1, 1)) * 100}%`, background: color }} />
                  </div>
                  <span className="text-[10px] font-bold text-text-2 w-5 text-right">{t.value}</span>
                </div>
              );
            })}
          </div>
        </BentoCard>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════ */
/* ─── ACTIVITY & TRENDS TAB ─── */
/* ═══════════════════════════════════════════════════ */

function TemporalTab({ activityData, entries, recentEntries, logs, router, countryCounts }: any) {
  // Monthly growth simulation
  const monthlyGrowth = useMemo(() => {
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const base = [18, 32, 48, 60, 72, 88, entries.length];
    return months.map((m, i) => ({ month: m, entities: base[i] || 0, links: Math.round(base[i] * 2.1) }));
  }, [entries.length]);

  // Entity creation timeline
  const creationTimeline = useMemo(() => {
    const byMonth: Record<string, Record<string, number>> = {};
    entries.forEach((e: any) => {
      const d = new Date(e.createdAt);
      const key = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      if (!byMonth[key]) byMonth[key] = {};
      byMonth[key][e.category] = (byMonth[key][e.category] || 0) + 1;
    });
    return Object.entries(byMonth).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-8).map(([month, cats]) => ({
        month, person: cats.person || 0, company: cats.company || 0,
        other: (cats.mobile || 0) + (cats.address || 0) + (cats.vehicle || 0),
      }));
  }, [entries]);

  // Reliability trend
  const reliabilityTrend = useMemo(() => {
    const sorted = [...entries].sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt));
    const chunks: { period: string; confirmed: number; likely: number; rumor: number }[] = [];
    const chunkSize = Math.max(Math.ceil(sorted.length / 6), 1);
    for (let i = 0; i < sorted.length; i += chunkSize) {
      const chunk = sorted.slice(i, i + chunkSize);
      const d = new Date(chunk[0].createdAt);
      chunks.push({
        period: d.toLocaleDateString("en-US", { month: "short" }),
        confirmed: chunk.filter((e: any) => e.context === "confirmed").length,
        likely: chunk.filter((e: any) => e.context === "likely").length,
        rumor: chunk.filter((e: any) => e.context === "rumor").length,
      });
    }
    return chunks;
  }, [entries]);

  return (
    <>
      {/* Activity Trend - Full width */}
      <BentoCard className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider">30-Day Activity Trend</h3>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[9px] text-text-3"><span className="w-2 h-2 rounded-full bg-[#1e3a5f]" /> Actions</span>
            <span className="flex items-center gap-1 text-[9px] text-text-3"><span className="w-2 h-2 rounded-full bg-[#7c3aed]" /> Views</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="actGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.navy} stopOpacity={0.2} />
                <stop offset="100%" stopColor={COLORS.navy} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.15} />
                <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="actions" stroke={COLORS.navy} fill="url(#actGrad1)" strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: COLORS.navy, strokeWidth: 0 }} name="Actions" />
            <Area type="monotone" dataKey="views" stroke={COLORS.purple} fill="url(#actGrad2)" strokeWidth={1.5}
              dot={false} activeDot={{ r: 3, fill: COLORS.purple, strokeWidth: 0 }} name="Views" />
          </AreaChart>
        </ResponsiveContainer>
      </BentoCard>

      <div className="grid grid-cols-12 gap-3 mb-5">
        {/* Database Growth */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Database Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyGrowth}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="entities" stroke={COLORS.emerald} fill="url(#growthGrad)" strokeWidth={2}
                dot={{ r: 3, fill: COLORS.emerald, strokeWidth: 0 }} name="Entities" />
            </AreaChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* Entity Creation Timeline */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Creation Timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={creationTimeline} margin={{ left: -15, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="person" stackId="a" fill={COLORS.navy} name="Persons" />
              <Bar dataKey="company" stackId="a" fill={COLORS.purple} name="Orgs" />
              <Bar dataKey="other" stackId="a" fill={COLORS.amber} name="Other" radius={[4, 4, 0, 0]} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* Reliability Trend */}
        <BentoCard className="col-span-12 md:col-span-4">
          <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Reliability Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={reliabilityTrend}>
              <defs>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="confirmed" stroke={COLORS.emerald} fill="url(#confGrad)" strokeWidth={2} name="Confirmed" />
              <Area type="monotone" dataKey="likely" stroke={COLORS.amber} fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Likely" />
              <Area type="monotone" dataKey="rumor" stroke={COLORS.red} fill="none" strokeWidth={1} strokeDasharray="2 2" name="Rumor" />
              <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        </BentoCard>
      </div>

      {/* Recent Activity Log */}
      <BentoCard>
        <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3">Recent Activity Log</h3>
        <div className="space-y-1">
          {logs.slice(0, 12).map((log: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-surface-2/50 transition-colors">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                log.action === "SEARCH" ? "bg-accent/8 text-accent" :
                log.action === "VIEW" ? "bg-purple/8 text-purple" :
                log.action === "ENTRY" ? "bg-emerald/8 text-emerald" :
                log.action === "LINK" ? "bg-cyan/8 text-cyan" :
                "bg-amber/8 text-amber"
              )}>
                {log.action === "SEARCH" ? <Eye size={12} /> :
                 log.action === "VIEW" ? <Eye size={12} /> :
                 log.action === "ENTRY" ? <Zap size={12} /> :
                 log.action === "LINK" ? <Link2 size={12} /> :
                 <Activity size={12} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-text truncate">{log.detail}</div>
                <div className="text-[9px] text-text-3">{log.user} &middot; {new Date(log.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <Badge variant={
                log.action === "SEARCH" ? "info" as never :
                log.action === "VIEW" ? "default" as never :
                log.action === "ENTRY" ? "approved" as never :
                log.action === "LINK" ? "info" as never :
                "signal" as never
              }>{log.action}</Badge>
            </div>
          ))}
        </div>
      </BentoCard>
    </>
  );
}
