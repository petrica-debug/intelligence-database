"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Entry, SensitivityLevel } from "@/types";
import { CLEARANCE_LABELS } from "@/types";
import {
  Users, Building2, Link2, Globe, Shield, Zap, Eye, Target,
  ChevronRight, AlertTriangle, Crosshair, Radio, FileWarning,
  FileText, Brain, Plus, Search, Share2, Bell, Clock,
  ArrowRight, CheckCircle2, XCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Palette ─── */
const C = {
  navy: "#1e3a5f", blue: "#3b82f6",
  purple: "#7c3aed", emerald: "#059669",
  amber: "#d97706", red: "#dc2626",
  cyan: "#0891b2", slate: "#64748b",
};

const tooltipStyle = {
  background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12,
  fontSize: 11, padding: "8px 14px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
};

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

/* ─── Sparkline ─── */
function Spark({ data, color, h = 32 }: { data: number[]; color: string; h?: number }) {
  const max = Math.max(...data, 1), min = Math.min(...data), range = max - min || 1, w = 80;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const id = `sp-${color.replace("#", "")}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.25} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <polygon fill={`url(#${id})`} points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Card Shell ─── */
function B({ children, className, dark, glow }: { children: React.ReactNode; className?: string; dark?: boolean; glow?: string }) {
  return (
    <div className={cn(
      "relative rounded-2xl border overflow-hidden transition-all duration-300",
      dark ? "bg-gradient-to-br from-[#0f1b2d] to-[#1e3a5f] border-white/10 text-white"
        : "bg-white/80 backdrop-blur-sm border-border/40 hover:border-border/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
      className
    )}>
      {glow && <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none", glow)} />}
      <div className="relative z-10 p-7 h-full">{children}</div>
    </div>
  );
}

function SH({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-[11px] font-semibold text-text-3 uppercase tracking-[0.1em]">{children}</h3>
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

  /* ── Unified intelligence feed (reports + inferences, sorted by date) ── */
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

  return (
    <div className="animate-fade-in space-y-10">

      {/* ═══ SECTION 1: Info Bar + Quick Actions ═══ */}
      <div>
        <div className="flex items-center gap-3 text-[13px] text-text-3 mb-4">
          <span>{today}</span>
          <span className="text-border">&middot;</span>
          <span className="flex items-center gap-1.5"><Shield size={12} />{CLEARANCE_LABELS[userClearance]} (L{userClearance})</span>
          <span className="text-border">&middot;</span>
          <span>{entries.length} entities</span>
          <span className="text-border">&middot;</span>
          <span>{coverage.length} regions</span>
          <span className="text-border">&middot;</span>
          <span>{totalLinks} links</span>
          {db.signals.length > 0 && (
            <>
              <span className="text-border">&middot;</span>
              <span className="text-amber flex items-center gap-1.5 font-semibold"><Radio size={11} className="animate-pulse" />{db.signals.length} signal{db.signals.length !== 1 && "s"}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/new-entry")}
            className="flex items-center gap-2 text-[14px] font-semibold text-text hover:text-accent transition-colors cursor-pointer">
            <Plus size={15} /> New Entry
          </button>
          <button onClick={() => router.push("/search")}
            className="flex items-center gap-2 text-[14px] font-semibold text-text hover:text-accent transition-colors cursor-pointer">
            <Search size={15} /> Search
          </button>
          <button onClick={() => router.push("/reports/new")}
            className="flex items-center gap-2 text-[14px] font-semibold text-text hover:text-accent transition-colors cursor-pointer">
            <FileText size={15} /> New Report
          </button>
          <button onClick={() => router.push("/network")}
            className="flex items-center gap-2 text-[14px] font-semibold text-text hover:text-accent transition-colors cursor-pointer">
            <Share2 size={15} /> Network
          </button>
        </div>
      </div>

      {/* ═══ SECTION 2: Command Strip — 4 KPIs ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <B className="bg-gradient-to-br from-accent/[0.04] to-transparent">
          <div className="flex items-start justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Users size={24} className="text-accent" />
            </div>
            <Spark data={sparkEntities.slice(0, -2).concat([persons.length])} color={C.navy} h={36} />
          </div>
          <div className="text-3xl font-bold tracking-tight"><Num value={persons.length} /></div>
          <div className="text-[13px] text-text-3 font-medium mt-1">Key Actors</div>
        </B>
        <B className="bg-gradient-to-br from-purple/[0.04] to-transparent">
          <div className="flex items-start justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl bg-purple/10 flex items-center justify-center">
              <Building2 size={24} className="text-purple" />
            </div>
            <Spark data={sparkEntities.slice(0, -2).concat([orgs.length])} color={C.purple} h={36} />
          </div>
          <div className="text-3xl font-bold tracking-tight"><Num value={orgs.length} /></div>
          <div className="text-[13px] text-text-3 font-medium mt-1">Organizations</div>
        </B>
        <B className="bg-gradient-to-br from-cyan/[0.04] to-transparent">
          <div className="flex items-start justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center">
              <Link2 size={24} className="text-cyan" />
            </div>
            <Spark data={sparkLinks} color={C.cyan} h={36} />
          </div>
          <div className="text-3xl font-bold tracking-tight"><Num value={totalLinks} /></div>
          <div className="text-[13px] text-text-3 font-medium mt-1">Network Links</div>
        </B>
        <B className="bg-gradient-to-br from-emerald/[0.04] to-transparent">
          <div className="flex items-start justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald/10 flex items-center justify-center">
              <Globe size={24} className="text-emerald" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight"><Num value={coverage.length} /></div>
          <div className="text-[13px] text-text-3 font-medium mt-1">Regions Covered</div>
        </B>
      </div>

      {/* ═══ SECTION 3: Priority Zone — Action Center + Watch Targets ═══ */}
      <div className="grid grid-cols-12 gap-6">

        {/* Action Center */}
        <B className="col-span-12 md:col-span-5">
          <SH action={
            totalActionItems > 0 ? <span className="text-[10px] font-bold text-amber bg-amber/8 px-2 py-0.5 rounded-full">{totalActionItems} pending</span> : undefined
          }>Requires Your Attention</SH>
          {totalActionItems === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 size={28} className="text-emerald/50 mb-3" />
              <p className="text-[13px] text-text-3">All caught up. No pending actions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingValidations > 0 && (
                <button onClick={() => router.push("/admin/validations")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-red/10 bg-red/[0.02] hover:bg-red/[0.05] hover:border-red/20 transition-all cursor-pointer text-left group">
                  <div className="w-11 h-11 rounded-xl bg-red/8 flex items-center justify-center shrink-0">
                    <FileWarning size={18} className="text-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-text group-hover:text-red transition-colors">{pendingValidations} pending validation{pendingValidations !== 1 && "s"}</div>
                    <div className="text-[11px] text-text-3 mt-0.5">Awaiting admin review</div>
                  </div>
                  <ChevronRight size={16} className="text-text-3 group-hover:text-red shrink-0 transition-colors" />
                </button>
              )}
              {newInferences > 0 && (
                <button onClick={() => router.push("/intelligence")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-purple/10 bg-purple/[0.02] hover:bg-purple/[0.05] hover:border-purple/20 transition-all cursor-pointer text-left group">
                  <div className="w-11 h-11 rounded-xl bg-purple/8 flex items-center justify-center shrink-0">
                    <Brain size={18} className="text-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-text group-hover:text-purple transition-colors">{newInferences} AI inference{newInferences !== 1 && "s"} to review</div>
                    <div className="text-[11px] text-text-3 mt-0.5">New connections detected</div>
                  </div>
                  <ChevronRight size={16} className="text-text-3 group-hover:text-purple shrink-0 transition-colors" />
                </button>
              )}
              {unreadNotifs > 0 && (
                <button onClick={() => {}}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-amber/10 bg-amber/[0.02] hover:bg-amber/[0.05] hover:border-amber/20 transition-all cursor-pointer text-left group">
                  <div className="w-11 h-11 rounded-xl bg-amber/8 flex items-center justify-center shrink-0">
                    <Bell size={18} className="text-amber" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-text group-hover:text-amber transition-colors">{unreadNotifs} unread notification{unreadNotifs !== 1 && "s"}</div>
                    <div className="text-[11px] text-text-3 mt-0.5">Signal alerts and updates</div>
                  </div>
                  <ChevronRight size={16} className="text-text-3 group-hover:text-amber shrink-0 transition-colors" />
                </button>
              )}
            </div>
          )}
        </B>

        {/* Watch Targets */}
        <B className="col-span-12 md:col-span-7 border-amber/15 bg-gradient-to-br from-amber/[0.02] to-transparent">
          <SH action={
            <span className="flex items-center gap-1 text-[10px] text-amber font-semibold">
              <Radio size={10} className="animate-pulse-glow" /> {db.signals.length} Active
            </span>
          }>
            <span className="flex items-center gap-2"><Crosshair size={12} className="text-amber" /> Watch Targets</span>
          </SH>
          {db.signals.length === 0 ? (
            <p className="text-[13px] text-text-3 py-10 text-center">No active watch targets</p>
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
                    className="flex items-center gap-4 p-4 rounded-xl bg-amber/[0.03] border border-amber/10 hover:border-amber/25 transition-all cursor-pointer group">
                    <div className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
                      <Radio size={18} className="text-amber animate-pulse-glow" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[13px] font-semibold group-hover:text-amber transition-colors truncate">{entity.name}</span>
                        <Badge variant={entity.category as never} className="text-[9px]">{entity.category}</Badge>
                      </div>
                      <div className="w-full h-2 bg-amber/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber/60 to-amber transition-all duration-700"
                          style={{ width: `${(score / maxScore) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-[18px] font-bold text-amber tabular-nums">{score}</div>
                      <div className="text-[9px] text-text-3 font-medium uppercase">Influence</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </B>
      </div>

      {/* ═══ SECTION 4: Intelligence Overview — Key Actors + Coverage + Composition ═══ */}
      <div className="grid grid-cols-12 gap-6">

        {/* Key Actors */}
        <B className="col-span-12 md:col-span-5">
          <SH action={
            <button onClick={() => router.push("/persons")} className="text-[10px] text-accent font-medium hover:underline cursor-pointer">View all ({persons.length})</button>
          }>Key Actors &mdash; Top 3</SH>
          <div className="space-y-2.5">
            {keyActors.map((e, i) => {
              const score = influence(e);
              const hasSig = db.signals.some((s) => s.entityId === e.id);
              const maxScore = influence(keyActors[0]);
              return (
                <div key={e.id} onClick={() => go(e.id)}
                  className="flex items-center gap-4 py-3.5 px-3.5 rounded-xl hover:bg-accent/[0.03] transition-all cursor-pointer group">
                  <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0",
                    i === 0 ? "bg-gradient-to-br from-amber to-amber/60 text-white shadow-sm shadow-amber/20" :
                    i === 1 ? "bg-gradient-to-br from-slate to-slate/60 text-white" :
                    i === 2 ? "bg-gradient-to-br from-amber/70 to-amber/40 text-white" :
                    "bg-surface-3 text-text-3"
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold group-hover:text-accent transition-colors truncate">{e.name}</span>
                      {hasSig && <span className="px-1.5 py-0.5 rounded bg-amber/10 text-amber text-[9px] font-bold leading-none animate-pulse-glow">SIGNAL</span>}
                    </div>
                    <div className="text-[11px] text-text-3 mt-1">{e.country}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20">
                      <div className="w-full h-2.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] transition-all duration-700"
                          style={{ width: `${(score / maxScore) * 100}%` }} />
                      </div>
                    </div>
                    <span className={cn("text-[15px] font-bold w-9 text-right tabular-nums",
                      score >= 120 ? "text-red" : score >= 80 ? "text-amber" : "text-text-2"
                    )}>{score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </B>

        {/* Regional Coverage */}
        <B className="col-span-12 md:col-span-4">
          <SH action={
            <button onClick={() => router.push("/geo")} className="text-[10px] text-accent font-medium hover:underline cursor-pointer">All {coverage.length} regions</button>
          }>Top Regions</SH>
          <div className="space-y-4">
            {coverage.slice(0, 3).map(([country, data]) => {
              const confRate = data.total > 0 ? Math.round((data.confirmed / data.total) * 100) : 0;
              const shortName = country === "International" ? "Int'l" : country === "Czech Republic" ? "Czech Rep." : country === "North Macedonia" ? "N. Macedonia" : country;
              return (
                <div key={country} className="flex items-center gap-3">
                  <div className="w-24 truncate text-[13px] font-medium text-text-2">{shortName}</div>
                  <div className="flex-1">
                    <div className="h-3.5 bg-surface-3 rounded-full overflow-hidden flex">
                      <div className="h-full bg-accent rounded-l-full" style={{ width: `${(data.persons / data.total) * 100}%` }} />
                      <div className="h-full bg-purple" style={{ width: `${(data.orgs / data.total) * 100}%` }} />
                      <div className="h-full bg-amber/50" style={{ width: `${((data.total - data.persons - data.orgs) / data.total) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-text w-7 text-right tabular-nums">{data.total}</span>
                  <span className={cn("text-[12px] font-semibold w-10 text-right tabular-nums",
                    confRate >= 80 ? "text-emerald" : confRate >= 50 ? "text-amber" : "text-red"
                  )}>{confRate}%</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-5 pt-3.5 border-t border-border/30">
            <span className="flex items-center gap-1.5 text-[10px] text-text-3"><span className="w-2.5 h-2.5 rounded-sm bg-accent" />Persons</span>
            <span className="flex items-center gap-1.5 text-[10px] text-text-3"><span className="w-2.5 h-2.5 rounded-sm bg-purple" />Orgs</span>
            <span className="flex items-center gap-1.5 text-[10px] text-text-3"><span className="w-2.5 h-2.5 rounded-sm bg-amber/50" />Other</span>
            <span className="ml-auto text-[10px] text-text-3">% = verified</span>
          </div>
        </B>

        {/* Entity Composition */}
        <B className="col-span-12 md:col-span-3">
          <SH>Entity Composition</SH>
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <defs>
                  {Object.entries(CAT_GRADIENTS).map(([k, [c1, c2]], i) => (
                    <linearGradient key={k} id={`cg${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={[
                    { name: "Persons", value: persons.length },
                    { name: "Organizations", value: orgs.length },
                    { name: "Addresses", value: entries.filter((e) => e.category === "address").length },
                    { name: "Contacts", value: entries.filter((e) => e.category === "mobile").length },
                    { name: "Vehicles", value: entries.filter((e) => e.category === "vehicle").length },
                  ]}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value" strokeWidth={0} cornerRadius={4}
                >
                  {Object.keys(CAT_GRADIENTS).map((_, i) => <Cell key={i} fill={`url(#cg${i})`} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[24px] font-bold text-text">{entries.length}</div>
                <div className="text-[9px] text-text-3 uppercase font-semibold tracking-wider">Total</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
            {[
              { label: "Persons", color: C.navy, val: persons.length },
              { label: "Orgs", color: C.purple, val: orgs.length },
              { label: "Addr", color: C.amber, val: entries.filter((e) => e.category === "address").length },
              { label: "Mobile", color: C.emerald, val: entries.filter((e) => e.category === "mobile").length },
              { label: "Vehicle", color: C.red, val: entries.filter((e) => e.category === "vehicle").length },
            ].map((c) => (
              <span key={c.label} className="flex items-center gap-1.5 text-[11px] text-text-3">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />{c.label} <b className="text-text-2">{c.val}</b>
              </span>
            ))}
          </div>
        </B>
      </div>

      {/* ═══ SECTION 5: Intelligence Feed + Domain Profile ═══ */}
      <div className="grid grid-cols-12 gap-6">

        {/* Unified Intelligence Feed */}
        <B className="col-span-12 md:col-span-7">
          <SH action={
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/reports")} className="text-[10px] text-accent font-medium hover:underline cursor-pointer">Reports</button>
              <span className="text-text-3 text-[10px]">/</span>
              <button onClick={() => router.push("/intelligence")} className="text-[10px] text-purple font-medium hover:underline cursor-pointer">Inferences</button>
            </div>
          }>Latest Intelligence</SH>
          {intelligenceFeed.length === 0 ? (
            <p className="text-[12px] text-text-3 py-6 text-center">No recent intelligence</p>
          ) : (
            <div className="space-y-2.5">
              {intelligenceFeed.map((item, idx) => {
                if (item.type === "report") {
                  const report = item.data as typeof db.reports[0];
                  return (
                    <div key={`r-${report.id}`} onClick={() => router.push("/reports")}
                      className="flex items-center gap-4 py-3.5 px-3.5 rounded-xl hover:bg-accent/[0.03] transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center shrink-0">
                        <FileText size={17} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold group-hover:text-accent transition-colors truncate">{report.title}</div>
                        <div className="text-[11px] text-text-3 mt-1">{report.createdBy} &middot; {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &middot; {report.sections.length} sections</div>
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
                  const confPctVal = Math.round(ic.confidence);
                  return (
                    <div key={`i-${ic.id}`} onClick={() => router.push("/intelligence")}
                      className="flex items-center gap-4 py-3.5 px-3.5 rounded-xl hover:bg-purple/[0.03] transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl bg-purple/8 flex items-center justify-center shrink-0">
                        <Brain size={17} className="text-purple" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate">
                          <span className="group-hover:text-accent transition-colors">{entityA.name}</span>
                          <span className="text-text-3 mx-1.5">&harr;</span>
                          <span className="group-hover:text-purple transition-colors">{entityB.name}</span>
                        </div>
                        <div className="text-[11px] text-text-3 mt-1 capitalize">{ic.category.replace(/-/g, " ")} &middot; {ic.evidence.length} evidence</div>
                      </div>
                      <div className={cn("text-[14px] font-bold tabular-nums shrink-0",
                        confPctVal >= 80 ? "text-emerald" : confPctVal >= 60 ? "text-amber" : "text-red"
                      )}>{confPctVal}%</div>
                    </div>
                  );
                }
              })}
            </div>
          )}
          {/* Feed stats */}
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border/30">
            <span className="flex items-center gap-1.5 text-[11px] text-text-3">
              <FileText size={12} className="text-accent" /> {db.reports.filter(r => canView(r.overallSensitivity)).length} Reports
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-text-3">
              <Brain size={12} className="text-purple" /> {newInferences} New Inferences
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-text-3">
              <CheckCircle2 size={12} className="text-emerald" /> {db.inferredConnections.filter(ic => ic.status === "confirmed").length} Confirmed
            </span>
          </div>
        </B>

        {/* Domain Profile */}
        <B className="col-span-12 md:col-span-5">
          <SH>Domain Capability Profile</SH>
          {(() => {
            const maxDim = Math.max(...radarDims.map(d => d.value), 1);
            const sorted = [...radarDims].sort((a, b) => b.value - a.value).slice(0, 5);
            return (
              <div className="space-y-5">
                {sorted.map((d) => {
                  const pct = Math.round((d.value / maxDim) * 100);
                  return (
                    <div key={d.dim} className="flex items-center gap-4">
                      <div className="w-24 text-[13px] font-medium text-text-2 shrink-0">{d.dim}</div>
                      <div className="flex-1 h-3.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[13px] font-bold text-text tabular-nums w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </B>
      </div>

    </div>
  );
}

const CAT_GRADIENTS: Record<string, [string, string]> = {
  person: ["#1e3a5f", "#3b82f6"],
  company: ["#7c3aed", "#a78bfa"],
  address: ["#d97706", "#fbbf24"],
  mobile: ["#059669", "#34d399"],
  vehicle: ["#dc2626", "#f87171"],
};
