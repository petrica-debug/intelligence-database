"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Entry, SensitivityLevel } from "@/types";
import { CLEARANCE_LABELS } from "@/types";
import {
  Users, Building2, Link2, Globe, Zap,
  ChevronRight, Radio, FileWarning,
  FileText, Brain, Plus, Search, Share2, Bell,
  CheckCircle2
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Palette ─── */
const C = {
  blue: "#3b82f6", purple: "#7c3aed",
  emerald: "#059669", amber: "#d97706",
  red: "#dc2626", cyan: "#0891b2",
};

const tooltipStyle = {
  background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12,
  fontSize: 11, padding: "8px 14px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
};

const PIE_COLORS = [
  "hsl(217, 92%, 60%)",
  "hsl(265, 78%, 60%)",
  "hsl(152, 72%, 46%)",
  "hsl(174, 72%, 44%)",
  "hsl(24, 100%, 58%)",
];

/* ─── Animated Counter ─── */
function Num({ value, duration = 700 }: { value: number; duration?: number }) {
  const [d, setD] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const s = prev.current, diff = value - s, t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setD(Math.round(s + diff * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick); else prev.current = value;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{d}</>;
}

/* ─── Sparkline (Lovable-style) ─── */
function Spark({ data, color, label }: { data: number[]; color: string; label: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`)
    .join(" ");
  const id = `spark-${label.replace(/\s/g, "")}`;
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-16 opacity-50 group-hover:opacity-80 transition-opacity" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Section Header ─── */
function SH({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-widest">{children}</h3>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  MAIN                                              */
/* ═══════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { db, currentUser, canView, userClearance } = useApp();
  const router = useRouter();
  const go = (id: number) => router.push(`/entry/${id}`);

  const entries = db.entries;
  const persons = useMemo(() => entries.filter((e) => e.category === "person"), [entries]);
  const orgs = useMemo(() => entries.filter((e) => e.category === "company"), [entries]);

  /* ── Connectivity index ── */
  const connMap = useMemo(() => {
    const m = new Map<number, number>();
    entries.forEach((e) => {
      const bi = e.linkedTo.length + entries.filter((x) => x.linkedTo.includes(e.id)).length;
      m.set(e.id, bi);
    });
    return m;
  }, [entries]);

  const conn = (e: Entry) => connMap.get(e.id) || 0;
  const totalLinks = useMemo(() => entries.reduce((s, e) => s + e.linkedTo.length, 0), [entries]);

  /* ── Influence Score ── */
  const influence = (e: Entry) => {
    const c = conn(e);
    const t = (e.tags || []).length;
    const sig = db.signals.some((s) => s.entityId === e.id) ? 30 : 0;
    return c * 10 + t * 5 + sig;
  };

  /* ── Key Actors ── */
  const keyActors = useMemo(() =>
    [...persons].sort((a, b) => influence(b) - influence(a)).slice(0, 3),
    [persons, connMap] // eslint-disable-line
  );

  /* ── Coverage ── */
  const coverage = useMemo(() => {
    const m: Record<string, { total: number; persons: number; orgs: number; confirmed: number }> = {};
    entries.forEach((e) => {
      const c = e.country || "Unknown";
      if (!m[c]) m[c] = { total: 0, persons: 0, orgs: 0, confirmed: 0 };
      m[c].total++;
      if (e.category === "person") m[c].persons++;
      if (e.category === "company") m[c].orgs++;
      if (e.context === "confirmed") m[c].confirmed++;
    });
    return Object.entries(m).sort((a, b) => b[1].total - a[1].total);
  }, [entries]);

  /* ── Domain capabilities ── */
  const radarDims = useMemo(() => {
    const dims = ["policy", "education", "advocacy", "legal", "leadership", "culture", "funding", "research"];
    return dims.map((d) => ({
      dim: d.charAt(0).toUpperCase() + d.slice(1),
      value: entries.filter((e) => (e.tags || []).includes(d)).length,
    }));
  }, [entries]);

  /* ── Sparkline data ── */
  const sparkEntities = [18, 32, 48, 60, 72, 88, entries.length];
  const sparkLinks = [40, 65, 90, 120, 150, 180, totalLinks];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  /* ── Action items ── */
  const pendingValidations = db.pendingValidations.filter((v) => !v.resolved).length;
  const newInferences = db.inferredConnections.filter((ic) => ic.status === "new").length;
  const unreadNotifs = db.notifications.filter((n) => n.forUser === currentUser?.username && !n.read).length;
  const totalActionItems = pendingValidations + newInferences + unreadNotifs;

  /* ── Intelligence feed ── */
  const intelligenceFeed = useMemo(() => {
    const items: { type: "report" | "inference"; date: string; data: unknown }[] = [];
    db.reports.filter(r => canView(r.overallSensitivity)).forEach(r => {
      items.push({ type: "report", date: r.createdAt, data: r });
    });
    db.inferredConnections.filter(ic => ic.status === "new").sort((a, b) => b.confidence - a.confidence).slice(0, 3).forEach(ic => {
      items.push({ type: "inference", date: ic.createdAt, data: ic });
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  }, [db.reports, db.inferredConnections, canView]);

  const sensColors: Record<SensitivityLevel, string> = {
    standard: "text-emerald", sensitive: "text-amber", confidential: "text-red", "top-secret": "text-purple",
  };

  const domainGradients = ["gradient-blue", "gradient-purple", "gradient-teal", "gradient-orange", "gradient-green"];

  return (
    <div className="animate-fade-in">

      {/* ═══ INFO BAR ═══ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-text-3 font-medium mb-3">
          <span>{today}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{CLEARANCE_LABELS[userClearance]} (L{userClearance})</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{entries.length} entities</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{coverage.length} regions</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{totalLinks} links</span>
          {db.signals.length > 0 && (
            <span className="ml-2 flex items-center gap-1 text-amber font-bold bg-amber/10 px-2.5 py-1 rounded-full">
              <Zap size={12} /> {db.signals.length} signal{db.signals.length !== 1 && "s"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[
            { icon: Plus, label: "New Entry", href: "/new-entry" },
            { icon: Search, label: "Search", href: "/search" },
            { icon: FileText, label: "New Report", href: "/reports/new" },
            { icon: Share2, label: "Network", href: "/network" },
          ].map((a) => (
            <button key={a.label} onClick={() => router.push(a.href)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-text rounded-lg hover:bg-surface-3 transition-colors cursor-pointer">
              <a.icon size={15} /> {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, value: persons.length, label: "Key Actors", gradient: "gradient-blue", glow: "shadow-glow-blue", color: C.blue, sparkData: sparkEntities.slice(0, -2).concat([persons.length]) },
          { icon: Building2, value: orgs.length, label: "Organizations", gradient: "gradient-purple", glow: "shadow-glow-purple", color: C.purple, sparkData: sparkEntities.slice(0, -2).concat([orgs.length]) },
          { icon: Link2, value: totalLinks, label: "Network Links", gradient: "gradient-teal", glow: "shadow-glow-green", color: C.cyan, sparkData: sparkLinks },
          { icon: Globe, value: coverage.length, label: "Regions Covered", gradient: "gradient-green", glow: "shadow-glow-green", color: C.emerald, sparkData: [5, 7, 8, 9, 10, 12, coverage.length] },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border/60 p-5 flex items-start justify-between shadow-card hover:shadow-card-hover transition-all duration-300 group animate-fade-in">
            <div className="flex flex-col gap-2.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${stat.gradient} ${stat.glow} transition-shadow duration-300`}>
                <stat.icon size={20} />
              </div>
              <span className="text-3xl font-extrabold text-text font-mono tracking-tight"><Num value={stat.value} /></span>
              <span className="text-[11px] text-text-3 uppercase tracking-widest font-semibold">{stat.label}</span>
            </div>
            <Spark data={stat.sparkData} color={stat.color} label={stat.label} />
          </div>
        ))}
      </div>

      {/* ═══ MIDDLE ROW: Attention + Watch Targets ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Attention Panel */}
        <div className="bg-surface rounded-xl border border-border/60 shadow-card animate-fade-in">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-widest">Requires Your Attention</h3>
            {totalActionItems > 0 && (
              <span className="text-xs font-bold text-accent px-2.5 py-1 rounded-full bg-accent/10">{totalActionItems} pending</span>
            )}
          </div>
          {totalActionItems === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-5 pb-5">
              <CheckCircle2 size={28} className="text-emerald/50 mb-3" />
              <p className="text-xs text-text-3">All caught up. No pending actions.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {pendingValidations > 0 && (
                <button onClick={() => router.push("/admin/validations")}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-3/40 transition-all duration-200 group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white gradient-orange">
                    <FileWarning size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{pendingValidations} pending validation{pendingValidations !== 1 && "s"}</p>
                    <p className="text-xs text-text-3 mt-0.5">Awaiting admin review</p>
                  </div>
                  <ChevronRight size={16} className="text-text-3/40 group-hover:text-text-3 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}
              {newInferences > 0 && (
                <button onClick={() => router.push("/intelligence")}
                  className={cn("w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-3/40 transition-all duration-200 group cursor-pointer",
                    newInferences > 5 && "bg-emerald/[0.04]")}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white gradient-green">
                    <Brain size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", newInferences > 5 ? "text-emerald" : "text-text")}>{newInferences} AI inference{newInferences !== 1 && "s"} to review</p>
                    <p className="text-xs text-text-3 mt-0.5">New connections detected</p>
                  </div>
                  <ChevronRight size={16} className="text-text-3/40 group-hover:text-text-3 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}
              {unreadNotifs > 0 && (
                <button onClick={() => {}}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-3/40 transition-all duration-200 group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white gradient-purple">
                    <Bell size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{unreadNotifs} unread notification{unreadNotifs !== 1 && "s"}</p>
                    <p className="text-xs text-text-3 mt-0.5">Signal alerts and updates</p>
                  </div>
                  <ChevronRight size={16} className="text-text-3/40 group-hover:text-text-3 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Watch Targets */}
        <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full gradient-orange flex items-center justify-center animate-pulse-glow">
                <Radio size={10} className="text-white" />
              </div>
              <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-widest">Watch Targets</h3>
            </div>
            <span className="text-xs font-bold text-emerald px-2.5 py-1 rounded-full bg-emerald/10">
              {db.signals.length} Active
            </span>
          </div>
          {db.signals.length === 0 ? (
            <p className="text-xs text-text-3 py-10 text-center">No active watch targets</p>
          ) : (
            <div className="space-y-3">
              {db.signals.map((sig) => {
                const entity = entries.find((e) => e.id === sig.entityId);
                if (!entity) return null;
                const score = influence(entity);
                const maxScore = Math.max(...db.signals.map(s => {
                  const ent = entries.find(e => e.id === s.entityId);
                  return ent ? influence(ent) : 0;
                }), 1);
                return (
                  <div key={sig.entityId} onClick={() => go(sig.entityId)}
                    className="flex items-center gap-4 bg-surface-3/30 rounded-xl p-4 border border-border/40 cursor-pointer hover:border-border/60 transition-all group">
                    <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center shrink-0 shadow-glow-orange">
                      <Radio size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-text group-hover:text-accent transition-colors">{entity.name}</span>
                        <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase">{entity.category}</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                        <div className="gradient-green rounded-full h-2 transition-all duration-1000"
                          style={{ width: `${Math.min((score / maxScore) * 100, 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <span className="text-3xl font-extrabold text-text font-mono">{score}</span>
                      <p className="text-[10px] text-text-3 uppercase tracking-widest font-semibold">Influence</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ ANALYTICS ROW ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Key Actors */}
        <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-card animate-fade-in">
          <SH action={
            <button onClick={() => router.push("/persons")} className="text-xs text-accent hover:underline font-semibold cursor-pointer">View all ({persons.length})</button>
          }>Key Actors &mdash; Top 3</SH>
          <div className="space-y-4">
            {keyActors.map((e, i) => {
              const score = influence(e);
              const maxScore = influence(keyActors[0]);
              return (
                <div key={e.id} onClick={() => go(e.id)} className="flex items-center gap-3 group cursor-pointer">
                  <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                    i === 0 ? "gradient-blue shadow-glow-blue text-white" :
                    i === 1 ? "gradient-purple text-white" :
                    "bg-surface-3 text-text-3"
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate group-hover:text-accent transition-colors">{e.name}</p>
                    <p className="text-xs text-text-3">{e.country}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-border rounded-full h-2.5 overflow-hidden">
                      <div className={cn("rounded-full h-2.5 transition-all duration-500",
                        i === 0 ? "gradient-blue" : i === 1 ? "gradient-purple" : "gradient-teal"
                      )} style={{ width: `${(score / maxScore) * 100}%` }} />
                    </div>
                    <span className="text-sm font-extrabold text-accent font-mono w-8 text-right">{score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Regions */}
        <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-card animate-fade-in">
          <SH action={
            <button onClick={() => router.push("/geo")} className="text-xs text-accent hover:underline font-semibold cursor-pointer">All {coverage.length} regions</button>
          }>Top Regions</SH>
          <div className="space-y-4">
            {coverage.slice(0, 3).map(([country, data], i) => {
              const shortName = country === "International" ? "Int'l" : country === "Czech Republic" ? "Czech Rep." : country === "North Macedonia" ? "N. Macedonia" : country;
              const maxTotal = coverage[0][1].total;
              return (
                <div key={country} className="flex items-center gap-3">
                  <span className="text-sm text-text w-20 font-semibold truncate">{shortName}</span>
                  <div className="flex-1 bg-border/60 rounded-full h-3 overflow-hidden">
                    <div className={cn("rounded-full h-3 transition-all duration-700",
                      i === 0 ? "gradient-blue" : i === 1 ? "gradient-purple" : "gradient-teal"
                    )} style={{ width: `${(data.total / maxTotal) * 100}%` }} />
                  </div>
                  <span className="text-xs font-extrabold text-text font-mono w-8 text-right">{data.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Entity Composition */}
        <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-card animate-fade-in">
          <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-widest mb-4">Entity Composition</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Persons", value: persons.length },
                      { name: "Organizations", value: orgs.length },
                      { name: "Addresses", value: entries.filter((e) => e.category === "address").length },
                      { name: "Contacts", value: entries.filter((e) => e.category === "mobile").length },
                      { name: "Vehicles", value: entries.filter((e) => e.category === "vehicle").length },
                    ]}
                    cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                    paddingAngle={3} dataKey="value" stroke="none" cornerRadius={4}
                  >
                    {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-text font-mono"><Num value={entries.length} /></span>
                <span className="text-[10px] text-text-3 uppercase tracking-widest font-semibold">Total</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
            {[
              { label: "Persons", color: PIE_COLORS[0], val: persons.length },
              { label: "Orgs", color: PIE_COLORS[1], val: orgs.length },
              { label: "Addr", color: PIE_COLORS[2], val: entries.filter((e) => e.category === "address").length },
              { label: "Mobile", color: PIE_COLORS[3], val: entries.filter((e) => e.category === "mobile").length },
              { label: "Vehicle", color: PIE_COLORS[4], val: entries.filter((e) => e.category === "vehicle").length },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.color }} />
                <span className="text-[11px] text-text-3 font-medium">
                  {c.label} <span className="font-bold text-text">{c.val}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM ROW ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">

        {/* Latest Intelligence */}
        <div className="bg-surface rounded-xl border border-border/60 shadow-card animate-fade-in">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-widest">Latest Intelligence</h3>
            <div className="flex gap-1 bg-surface-3/60 rounded-lg p-0.5">
              <button onClick={() => router.push("/reports")} className="text-xs font-semibold text-white bg-accent px-3 py-1 rounded-md cursor-pointer">Reports</button>
              <button onClick={() => router.push("/intelligence")} className="text-xs font-medium text-text-3 px-3 py-1 rounded-md hover:text-text transition-colors cursor-pointer">Inferences</button>
            </div>
          </div>
          {intelligenceFeed.length === 0 ? (
            <p className="text-xs text-text-3 py-6 text-center px-5 pb-5">No recent intelligence</p>
          ) : (
            <div className="divide-y divide-border/50">
              {intelligenceFeed.map((item) => {
                if (item.type === "report") {
                  const report = item.data as typeof db.reports[0];
                  return (
                    <div key={`r-${report.id}`} onClick={() => router.push("/reports")}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-3/30 transition-colors group cursor-pointer">
                      <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center shrink-0 text-white">
                        <FileText size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">{report.title}</p>
                        <p className="text-xs text-text-3 mt-0.5">
                          {report.createdBy} · {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg", sensColors[report.overallSensitivity],
                        report.overallSensitivity === "standard" ? "bg-emerald/8" :
                        report.overallSensitivity === "sensitive" ? "bg-amber/8" :
                        report.overallSensitivity === "confidential" ? "bg-red/8" : "bg-purple/8"
                      )}>
                        {report.overallSensitivity === "top-secret" ? "TS" : report.overallSensitivity.slice(0, 4).toUpperCase()}
                      </span>
                    </div>
                  );
                } else {
                  const ic = item.data as typeof db.inferredConnections[0];
                  const entityA = entries.find(e => e.id === ic.entityA);
                  const entityB = entries.find(e => e.id === ic.entityB);
                  if (!entityA || !entityB) return null;
                  return (
                    <div key={`i-${ic.id}`} onClick={() => router.push("/intelligence")}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-3/30 transition-colors group cursor-pointer">
                      <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center shrink-0 text-white">
                        <Globe size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text group-hover:text-accent transition-colors">
                          {entityA.name} <span className="text-text-3 mx-1">&harr;</span> {entityB.name}
                        </p>
                        <p className="text-xs text-text-3 mt-0.5">
                          {ic.category.replace(/-/g, " ")} · {ic.evidence.length} Evidence
                        </p>
                      </div>
                      <span className="text-sm font-extrabold text-amber font-mono">{Math.round(ic.confidence)}%</span>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Domain Profile */}
        <div className="bg-surface rounded-xl border border-border/60 p-5 shadow-card animate-fade-in">
          <h3 className="text-[11px] font-bold text-text-3 uppercase tracking-widest mb-5">Domain Capability Profile</h3>
          {(() => {
            const maxDim = Math.max(...radarDims.map(d => d.value), 1);
            const sorted = [...radarDims].sort((a, b) => b.value - a.value).slice(0, 5);
            return (
              <div className="space-y-4">
                {sorted.map((d, i) => {
                  const pct = Math.round((d.value / maxDim) * 100);
                  return (
                    <div key={d.dim} className="flex items-center gap-3">
                      <span className="text-sm text-text w-20 font-semibold">{d.dim}</span>
                      <div className="flex-1 bg-border/60 rounded-full h-3 overflow-hidden">
                        <div className={`${domainGradients[i % domainGradients.length]} rounded-full h-3 transition-all duration-700`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-extrabold text-text font-mono w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
