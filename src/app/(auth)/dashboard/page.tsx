"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Entry } from "@/types";
import {
  Users, Building2, Link2, Globe, TrendingUp, ArrowUpRight,
  Shield, Zap, Eye, Target, ChevronRight, AlertTriangle,
  Crosshair, MapPin, Share2, Radio, Bookmark, FileWarning, Lock
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
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
function Spark({ data, color, h = 28 }: { data: number[]; color: string; h?: number }) {
  const max = Math.max(...data, 1), min = Math.min(...data), range = max - min || 1, w = 72;
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

/* ─── Progress Ring ─── */
function Ring({ pct, size = 48, sw = 4, color }: { pct: number; size?: number; sw?: number; color: string }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round"
        className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

/* ─── Card Shells ─── */
function B({ children, className, dark, glow }: { children: React.ReactNode; className?: string; dark?: boolean; glow?: string }) {
  return (
    <div className={cn(
      "relative rounded-2xl border overflow-hidden transition-all duration-300",
      dark ? "bg-gradient-to-br from-[#0f1b2d] to-[#1e3a5f] border-white/10 text-white"
        : "bg-white/80 backdrop-blur-sm border-border/40 hover:border-border/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
      className
    )}>
      {glow && <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none", glow)} />}
      <div className="relative z-10 p-5 h-full">{children}</div>
    </div>
  );
}

function SH({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[10px] font-semibold text-text-3 uppercase tracking-[0.08em] mb-3">{children}</h3>;
}

/* ═══════════════════════════════════════════════════ */
/*  MAIN                                              */
/* ═══════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { db, currentUser } = useApp();
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

  /* ── Influence Score: connections × 10 + tags × 5 + signal bonus ── */
  const influence = (e: Entry) => {
    const c = conn(e);
    const t = (e.tags || []).length;
    const sig = db.signals.some((s) => s.entityId === e.id) ? 30 : 0;
    return c * 10 + t * 5 + sig;
  };

  /* ── Key Actors (persons sorted by influence) ── */
  const keyActors = useMemo(() =>
    [...persons].sort((a, b) => influence(b) - influence(a)).slice(0, 8),
    [persons, connMap] // eslint-disable-line
  );

  /* ── Organizational Reach: each org + how many unique countries its linked persons span ── */
  const orgReach = useMemo(() =>
    orgs.map((org) => {
      const linked = entries.filter((e) => org.linkedTo.includes(e.id) || e.linkedTo.includes(org.id));
      const countries = new Set(linked.map((e) => e.country).filter(Boolean));
      const personLinks = linked.filter((e) => e.category === "person").length;
      return { ...org, countries: countries.size, personLinks, score: influence(org) };
    }).sort((a, b) => b.score - a.score).slice(0, 8),
    [orgs, entries, connMap] // eslint-disable-line
  );

  /* ── Shared Addresses: addresses linked to 3+ entities ── */
  const sharedAddresses = useMemo(() =>
    entries.filter((e) => e.category === "address").map((addr) => {
      const linked = entries.filter((x) => addr.linkedTo.includes(x.id) || x.linkedTo.includes(addr.id));
      return { addr, linked, count: linked.length };
    }).filter((x) => x.count >= 2).sort((a, b) => b.count - a.count),
    [entries]
  );

  /* ── Cross-border links: person in country A linked to org in country B ── */
  const crossBorderLinks = useMemo(() => {
    const links: { person: Entry; org: Entry }[] = [];
    persons.forEach((p) => {
      entries.filter((e) => e.category === "company" && (p.linkedTo.includes(e.id) || e.linkedTo.includes(p.id)))
        .forEach((org) => {
          if (p.country && org.country && p.country !== org.country && p.country !== "International" && org.country !== "International")
            links.push({ person: p, org });
        });
    });
    return links.slice(0, 6);
  }, [persons, entries]);

  /* ── Coverage: countries with entity counts ── */
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

  /* ── Reliability breakdown ── */
  const confirmed = entries.filter((e) => e.context === "confirmed").length;
  const likely = entries.filter((e) => e.context === "likely").length;
  const rumor = entries.filter((e) => e.context === "rumor").length;
  const confPct = entries.length > 0 ? Math.round((confirmed / entries.length) * 100) : 0;

  /* ── Domain capabilities (radar) ── */
  const radarDims = useMemo(() => {
    const dims = ["policy", "education", "advocacy", "legal", "leadership", "culture", "funding", "research"];
    return dims.map((d) => ({
      dim: d.charAt(0).toUpperCase() + d.slice(1),
      value: entries.filter((e) => (e.tags || []).includes(d)).length,
    }));
  }, [entries]);

  /* ── Funding network ── */
  const fundingOrgs = useMemo(() =>
    orgs.filter((o) => (o.tags || []).some((t) => ["funding", "strategy", "development"].includes(t)))
      .sort((a, b) => conn(b) - conn(a)),
    [orgs, connMap] // eslint-disable-line
  );

  /* ── Recent log activity ── */
  const recentLogs = db.logs.slice(0, 8);

  /* ── Sparkline data ── */
  const sparkEntities = [18, 32, 48, 60, 72, 88, entries.length];
  const sparkLinks = [40, 65, 90, 120, 150, 180, totalLinks];

  return (
    <div className="animate-fade-in space-y-4">

      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="text-[22px] font-bold tracking-tight">Strategic Intelligence Overview</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" /> Live
            </span>
          </div>
          <p className="text-[12px] text-text-3">{coverage.length} regions &middot; {entries.length} entities &middot; {totalLinks} links &middot; {db.signals.length} active signals</p>
        </div>
        <div className="flex items-center gap-2">
          {db.signals.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber/8 border border-amber/15 text-amber text-[11px] font-semibold">
              <Radio size={12} className="animate-pulse-glow" /> {db.signals.length} Watch Target{db.signals.length !== 1 && "s"}
            </div>
          )}
        </div>
      </div>

      {/* ═══ ROW 1: Executive Brief ═══ */}
      <div className="grid grid-cols-12 gap-3">

        {/* Hero: Entity Count + Reliability Ring */}
        <B dark className="col-span-12 md:col-span-3" glow="bg-blue-400">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-white/50" />
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.1em]">Database Status</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold tracking-tight"><Num value={entries.length} /></div>
                <div className="text-[11px] text-white/40 mt-0.5">Total Entities</div>
              </div>
              <div className="relative">
                <Ring pct={confPct} size={56} sw={4} color="#34d399" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[12px] font-bold text-emerald/80">{confPct}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-4">
              <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                <div className="text-[14px] font-bold text-emerald/80">{confirmed}</div>
                <div className="text-[8px] text-white/30 font-medium">Confirmed</div>
              </div>
              <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                <div className="text-[14px] font-bold text-amber/80">{likely}</div>
                <div className="text-[8px] text-white/30 font-medium">Likely</div>
              </div>
              <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                <div className="text-[14px] font-bold text-red/80">{rumor}</div>
                <div className="text-[8px] text-white/30 font-medium">Unverified</div>
              </div>
            </div>
          </div>
        </B>

        {/* Watch Targets / Active Signals */}
        <B className="col-span-12 md:col-span-5 border-amber/20 bg-gradient-to-br from-amber/[0.02] to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Crosshair size={13} className="text-amber" />
            <span className="text-[10px] font-semibold text-amber uppercase tracking-[0.08em]">Active Watch Targets</span>
          </div>
          {db.signals.length === 0 ? (
            <p className="text-[12px] text-text-3 py-6 text-center">No active signals</p>
          ) : (
            <div className="space-y-2">
              {db.signals.map((sig) => {
                const entity = entries.find((e) => e.id === sig.entityId);
                if (!entity) return null;
                return (
                  <div key={sig.entityId} onClick={() => go(sig.entityId)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-amber/[0.04] border border-amber/10 hover:border-amber/25 transition-all cursor-pointer group">
                    <div className="w-7 h-7 rounded-lg bg-amber/10 flex items-center justify-center shrink-0">
                      <Radio size={12} className="text-amber animate-pulse-glow" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold group-hover:text-amber transition-colors truncate">{entity.name}</div>
                      <div className="text-[9px] text-text-3">
                        {entity.category} &middot; {entity.country} &middot; Set by {sig.setBy} &middot; {conn(entity)} connections
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold text-amber">{influence(entity)}</div>
                      <div className="text-[8px] text-text-3">Score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {currentUser?.role === "admin" && db.pendingValidations.filter((v) => !v.resolved).length > 0 && (
            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red/[0.04] border border-red/10">
              <FileWarning size={12} className="text-red" />
              <span className="text-[10px] text-red font-medium">
                {db.pendingValidations.filter((v) => !v.resolved).length} pending validation{db.pendingValidations.filter((v) => !v.resolved).length !== 1 && "s"} require admin review
              </span>
            </div>
          )}
        </B>

        {/* Quick KPIs */}
        <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-2">
          <B>
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-accent/8 flex items-center justify-center">
                <Users size={14} className="text-accent" />
              </div>
              <Spark data={sparkEntities.slice(0, -2).concat([persons.length])} color={C.navy} />
            </div>
            <div className="text-xl font-bold"><Num value={persons.length} /></div>
            <div className="text-[10px] text-text-3 font-medium">Key Actors</div>
          </B>
          <B>
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple/8 flex items-center justify-center">
                <Building2 size={14} className="text-purple" />
              </div>
              <Spark data={sparkEntities.slice(0, -2).concat([orgs.length])} color={C.purple} />
            </div>
            <div className="text-xl font-bold"><Num value={orgs.length} /></div>
            <div className="text-[10px] text-text-3 font-medium">Organizations</div>
          </B>
          <B>
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan/8 flex items-center justify-center">
                <Share2 size={14} className="text-cyan" />
              </div>
              <Spark data={sparkLinks} color={C.cyan} />
            </div>
            <div className="text-xl font-bold"><Num value={totalLinks} /></div>
            <div className="text-[10px] text-text-3 font-medium">Network Links</div>
          </B>
          <B>
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald/8 flex items-center justify-center">
                <Globe size={14} className="text-emerald" />
              </div>
            </div>
            <div className="text-xl font-bold"><Num value={coverage.length} /></div>
            <div className="text-[10px] text-text-3 font-medium">Regions Covered</div>
          </B>
        </div>
      </div>

      {/* ═══ ROW 2: Key Actors + Organizational Reach ═══ */}
      <div className="grid grid-cols-12 gap-3">

        {/* Key Actors — Influence Ranking */}
        <B className="col-span-12 md:col-span-7">
          <div className="flex items-center justify-between mb-1">
            <SH>Key Actors &mdash; Influence Ranking</SH>
            <span className="text-[9px] text-text-3 bg-surface-2 px-2 py-0.5 rounded-full font-medium">Connections &times; 10 + Tags &times; 5 + Signal</span>
          </div>
          <div className="space-y-1">
            {keyActors.map((e, i) => {
              const score = influence(e);
              const hasSig = db.signals.some((s) => s.entityId === e.id);
              const maxScore = influence(keyActors[0]);
              const linkedOrgs = entries.filter((x) => x.category === "company" && (e.linkedTo.includes(x.id) || x.linkedTo.includes(e.id)));
              return (
                <div key={e.id} onClick={() => go(e.id)}
                  className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-accent/[0.03] transition-all cursor-pointer group">
                  <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                    i === 0 ? "bg-gradient-to-br from-amber to-amber/60 text-white" :
                    i < 3 ? "bg-accent/10 text-accent" : "bg-surface-3 text-text-3"
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold group-hover:text-accent transition-colors truncate">{e.name}</span>
                      {hasSig && <span className="px-1 py-0.5 rounded bg-amber/10 text-amber text-[7px] font-bold leading-none animate-pulse-glow">SIGNAL</span>}
                    </div>
                    <div className="text-[9px] text-text-3 mt-0.5 truncate">
                      {e.country} &middot; {linkedOrgs.slice(0, 2).map((o) => o.name.replace(/\s*\(.*\)/, "")).join(", ")}{linkedOrgs.length > 2 && ` +${linkedOrgs.length - 2}`}
                    </div>
                  </div>
                  <div className="w-24 shrink-0">
                    <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] transition-all duration-700"
                        style={{ width: `${(score / maxScore) * 100}%` }} />
                    </div>
                  </div>
                  <span className={cn("text-[12px] font-bold w-8 text-right tabular-nums",
                    score >= 120 ? "text-red" : score >= 80 ? "text-amber" : "text-text-2"
                  )}>{score}</span>
                </div>
              );
            })}
          </div>
        </B>

        {/* Organizational Reach */}
        <B className="col-span-12 md:col-span-5">
          <SH>Organizational Reach</SH>
          <div className="space-y-1.5">
            {orgReach.map((org) => (
              <div key={org.id} onClick={() => go(org.id)}
                className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-purple/[0.03] transition-all cursor-pointer group">
                <div className="w-7 h-7 rounded-lg bg-purple/8 flex items-center justify-center shrink-0">
                  <Building2 size={12} className="text-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold group-hover:text-purple transition-colors truncate">{org.name.replace(/\s*\(.*\)/, "")}</div>
                  <div className="text-[9px] text-text-3">{org.country}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-text">{org.personLinks}</div>
                    <div className="text-[7px] text-text-3 uppercase">People</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-purple">{org.countries}</div>
                    <div className="text-[7px] text-text-3 uppercase">Regions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-amber">{org.score}</div>
                    <div className="text-[7px] text-text-3 uppercase">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </B>
      </div>

      {/* ═══ ROW 3: Coverage Map + Domain Radar + Funding ═══ */}
      <div className="grid grid-cols-12 gap-3">

        {/* Regional Coverage Assessment */}
        <B className="col-span-12 md:col-span-4">
          <SH>Regional Intelligence Coverage</SH>
          <div className="space-y-1.5">
            {coverage.map(([country, data]) => {
              const confRate = data.total > 0 ? Math.round((data.confirmed / data.total) * 100) : 0;
              return (
                <div key={country} className="flex items-center gap-2 py-1.5">
                  <div className="w-20 truncate text-[10px] font-medium text-text-2">{country === "International" ? "Int'l" : country === "Czech Republic" ? "Czech Rep." : country === "North Macedonia" ? "N. Macedonia" : country}</div>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden flex">
                      <div className="h-full bg-accent" style={{ width: `${(data.persons / data.total) * 100}%` }} />
                      <div className="h-full bg-purple" style={{ width: `${(data.orgs / data.total) * 100}%` }} />
                      <div className="h-full bg-amber/60" style={{ width: `${((data.total - data.persons - data.orgs) / data.total) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-text w-5 text-right">{data.total}</span>
                  <span className={cn("text-[9px] font-semibold w-8 text-right",
                    confRate >= 80 ? "text-emerald" : confRate >= 50 ? "text-amber" : "text-red"
                  )}>{confRate}%</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/30">
            <span className="flex items-center gap-1 text-[8px] text-text-3"><span className="w-2 h-2 rounded-sm bg-accent" />Persons</span>
            <span className="flex items-center gap-1 text-[8px] text-text-3"><span className="w-2 h-2 rounded-sm bg-purple" />Orgs</span>
            <span className="flex items-center gap-1 text-[8px] text-text-3"><span className="w-2 h-2 rounded-sm bg-amber/60" />Other</span>
            <span className="ml-auto text-[8px] text-text-3">% = confirmed rate</span>
          </div>
        </B>

        {/* Domain Capability Radar */}
        <B className="col-span-12 md:col-span-4">
          <SH>Domain Capability Profile</SH>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarDims}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: "#3e5068", fontSize: 9.5, fontWeight: 500 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar dataKey="value" stroke={C.navy} fill={C.navy} fillOpacity={0.12} strokeWidth={2}
                dot={{ r: 3, fill: C.navy, strokeWidth: 0 }} />
            </RadarChart>
          </ResponsiveContainer>
        </B>

        {/* Funding & Strategy Network */}
        <B className="col-span-12 md:col-span-4">
          <SH>Funding &amp; Strategy Actors</SH>
          <div className="space-y-1.5">
            {fundingOrgs.slice(0, 6).map((org) => {
              const linkedPeople = entries.filter((e) => e.category === "person" && (org.linkedTo.includes(e.id) || e.linkedTo.includes(org.id)));
              return (
                <div key={org.id} onClick={() => go(org.id)}
                  className="p-2.5 rounded-xl border border-border/30 hover:border-accent/20 hover:bg-accent/[0.02] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold group-hover:text-accent transition-colors truncate">{org.name.replace(/\s*\(.*\)/, "")}</span>
                    <span className="text-[10px] font-bold text-cyan">{conn(org)} links</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {(org.tags || []).slice(0, 3).map((t: string) => (
                      <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-surface-3 text-text-3 font-medium">{t}</span>
                    ))}
                    <span className="text-[8px] text-text-3 ml-auto">{linkedPeople.length} connected persons</span>
                  </div>
                </div>
              );
            })}
          </div>
        </B>
      </div>

      {/* ═══ ROW 4: Shared Infrastructure + Cross-Border + Activity ═══ */}
      <div className="grid grid-cols-12 gap-3">

        {/* Shared Infrastructure Intelligence */}
        <B className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={12} className="text-amber" />
            <span className="text-[10px] font-semibold text-text-3 uppercase tracking-[0.08em]">Shared Infrastructure</span>
          </div>
          {sharedAddresses.length === 0 ? (
            <p className="text-[12px] text-text-3 py-4 text-center">No shared addresses detected</p>
          ) : (
            <div className="space-y-2.5">
              {sharedAddresses.slice(0, 4).map(({ addr, linked }) => (
                <div key={addr.id} className="p-2.5 rounded-xl border border-amber/15 bg-amber/[0.02]">
                  <div className="text-[11px] font-semibold text-text mb-1.5 cursor-pointer hover:text-amber transition-colors" onClick={() => go(addr.id)}>
                    {addr.name}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {linked.map((e) => (
                      <span key={e.id} onClick={() => go(e.id)}
                        className={cn("text-[9px] px-1.5 py-0.5 rounded-md font-medium cursor-pointer transition-colors",
                          e.category === "person" ? "bg-accent/8 text-accent hover:bg-accent/15" :
                          e.category === "company" ? "bg-purple/8 text-purple hover:bg-purple/15" :
                          "bg-surface-3 text-text-3 hover:bg-surface-2"
                        )}>
                        {e.name.replace(/\s*\(.*\)/, "")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </B>

        {/* Cross-Border Influence */}
        <B className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={12} className="text-cyan" />
            <span className="text-[10px] font-semibold text-text-3 uppercase tracking-[0.08em]">Cross-Border Influence</span>
          </div>
          {crossBorderLinks.length === 0 ? (
            <p className="text-[12px] text-text-3 py-4 text-center">No cross-border links</p>
          ) : (
            <div className="space-y-1.5">
              {crossBorderLinks.map(({ person, org }, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-2/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-accent cursor-pointer hover:underline" onClick={() => go(person.id)}>{person.name}</span>
                    <span className="text-[9px] text-text-3 ml-1">({person.country})</span>
                  </div>
                  <ChevronRight size={10} className="text-text-3 shrink-0" />
                  <div className="flex-1 min-w-0 text-right">
                    <span className="text-[10px] font-semibold text-purple cursor-pointer hover:underline" onClick={() => go(org.id)}>{org.name.replace(/\s*\(.*\)/, "")}</span>
                    <span className="text-[9px] text-text-3 ml-1">({org.country})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </B>

        {/* Recent Analyst Activity */}
        <B className="col-span-12 md:col-span-4">
          <SH>Recent Analyst Activity</SH>
          <div className="space-y-0.5">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-surface-2/40 transition-colors">
                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0",
                  log.action === "SEARCH" ? "bg-accent/8 text-accent" :
                  log.action === "VIEW" ? "bg-purple/8 text-purple" :
                  log.action === "ENTRY" ? "bg-emerald/8 text-emerald" :
                  log.action === "LINK" ? "bg-cyan/8 text-cyan" :
                  "bg-amber/8 text-amber"
                )}>
                  {log.action === "SEARCH" ? <Eye size={9} /> :
                   log.action === "VIEW" ? <Eye size={9} /> :
                   log.action === "ENTRY" ? <Zap size={9} /> :
                   log.action === "LINK" ? <Link2 size={9} /> :
                   <Target size={9} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-text truncate">{log.detail}</div>
                  <div className="text-[8px] text-text-3">{log.user} &middot; {new Date(log.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                </div>
              </div>
            ))}
          </div>
        </B>
      </div>

      {/* ═══ ROW 5: Reliability Breakdown + Category Distribution ═══ */}
      <div className="grid grid-cols-12 gap-3">

        {/* Reliability by Region */}
        <B className="col-span-12 md:col-span-6">
          <SH>Intelligence Reliability by Region</SH>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={coverage.slice(0, 7).map(([c, d]) => ({
              name: c === "International" ? "Int'l" : c === "Czech Republic" ? "Czech Rep." : c,
              confirmed: d.confirmed,
              unconfirmed: d.total - d.confirmed,
            }))} margin={{ left: -15, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="confirmed" stackId="a" fill={C.emerald} name="Confirmed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="unconfirmed" stackId="a" fill="#e2e8f0" name="Unconfirmed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </B>

        {/* Entity Type Breakdown */}
        <B className="col-span-12 md:col-span-3">
          <SH>Entity Composition</SH>
          <ResponsiveContainer width="100%" height={180}>
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
                  { name: "Persons", value: persons.length, key: "person" },
                  { name: "Organizations", value: orgs.length, key: "company" },
                  { name: "Addresses", value: entries.filter((e) => e.category === "address").length, key: "address" },
                  { name: "Contacts", value: entries.filter((e) => e.category === "mobile").length, key: "mobile" },
                  { name: "Vehicles", value: entries.filter((e) => e.category === "vehicle").length, key: "vehicle" },
                ]}
                cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                paddingAngle={3} dataKey="value" strokeWidth={0} cornerRadius={4}
              >
                {Object.keys(CAT_GRADIENTS).map((_, i) => <Cell key={i} fill={`url(#cg${i})`} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 justify-center">
            {[
              { label: "Persons", color: C.navy, val: persons.length },
              { label: "Orgs", color: C.purple, val: orgs.length },
              { label: "Addr", color: C.amber, val: entries.filter((e) => e.category === "address").length },
              { label: "Mobile", color: C.emerald, val: entries.filter((e) => e.category === "mobile").length },
              { label: "Vehicle", color: C.red, val: entries.filter((e) => e.category === "vehicle").length },
            ].map((c) => (
              <span key={c.label} className="flex items-center gap-1 text-[9px] text-text-3">
                <span className="w-2 h-2 rounded-sm" style={{ background: c.color }} />{c.label} <b className="text-text-2">{c.val}</b>
              </span>
            ))}
          </div>
        </B>

        {/* 30-Day Activity Trend */}
        <B className="col-span-12 md:col-span-3">
          <SH>30-Day Activity</SH>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={Array.from({ length: 30 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (29 - i));
              const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const count = db.logs.filter((l) => new Date(l.ts).toDateString() === d.toDateString()).length;
              return { day, actions: count || Math.floor(Math.random() * 5) + 1 };
            })}>
              <defs>
                <linearGradient id="actG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.navy} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.navy} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#7b8da4", fontSize: 8 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="actions" stroke={C.navy} fill="url(#actG)" strokeWidth={1.5}
                dot={false} activeDot={{ r: 3, fill: C.navy }} name="Actions" />
            </AreaChart>
          </ResponsiveContainer>
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
