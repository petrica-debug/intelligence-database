"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import type { Entry, SensitivityLevel } from "@/types";
import {
  Users, Building2, Link2, Globe,
  Radio, FileText, Bell, AlertCircle,
  CheckCircle2, TrendingUp, Sparkles, ArrowUpRight,
  Shield, Calendar
} from "lucide-react";
import { CLEARANCE_LABELS } from "@/types";
import type { ClearanceLevel } from "@/types";

const C = {
  blue: "#3b82f6", purple: "#7c3aed",
  emerald: "#059669", amber: "#d97706",
  cyan: "#0891b2",
};

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

function Spark({ data, color, label }: { data: number[]; color: string; label: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`)
    .join(" ");
  const fillPoints = `0,100 ${points} 100,100`;
  const id = `spark-${label.replace(/\s/g, "")}`;
  const fillId = `fill-${label.replace(/\s/g, "")}`;
  return (
    <svg viewBox="0 0 100 100" className="absolute bottom-0 left-0 right-0 w-full h-14 z-0" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={0} />
          <stop offset="30%" stopColor={color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.1} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill={`url(#${fillId})`}
        className="opacity-20 group-hover:opacity-40 transition-opacity"
      />
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const { db, currentUser, canView } = useApp();
  const router = useRouter();
  const go = (id: number) => router.push(`/entry/${id}`);

  const entries = db.entries;
  const persons = useMemo(() => entries.filter((e) => e.category === "person"), [entries]);
  const orgs = useMemo(() => entries.filter((e) => e.category === "company"), [entries]);

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

  const influence = (e: Entry) => {
    const c = conn(e);
    const t = (e.tags || []).length;
    const sig = db.signals.some((s) => s.entityId === e.id) ? 30 : 0;
    return c * 10 + t * 5 + sig;
  };

  const keyActors = useMemo(() =>
    [...persons].sort((a, b) => influence(b) - influence(a)).slice(0, 5),
    [persons, connMap] // eslint-disable-line
  );

  const coverage = useMemo(() => {
    const m: Record<string, number> = {};
    entries.forEach((e) => {
      const c = e.country || "Unknown";
      m[c] = (m[c] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const sparkEntities = [18, 32, 48, 60, 72, 88, entries.length];
  const sparkLinks = [40, 65, 90, 120, 150, 180, totalLinks];

  const pendingValidations = db.pendingValidations.filter((v) => !v.resolved).length;
  const newInferences = db.inferredConnections.filter((ic) => ic.status === "new").length;
  const unreadNotifs = db.notifications.filter((n) => n.forUser === currentUser?.username && !n.read).length;
  const totalActionItems = pendingValidations + newInferences + unreadNotifs;

  const intelligenceFeed = useMemo(() => {
    const items: { type: "report" | "inference"; date: string; data: unknown }[] = [];
    db.reports.filter(r => canView(r.overallSensitivity)).forEach(r => {
      items.push({ type: "report", date: r.createdAt, data: r });
    });
    db.inferredConnections.filter(ic => ic.status === "new").sort((a, b) => b.confidence - a.confidence).slice(0, 3).forEach(ic => {
      items.push({ type: "inference", date: ic.createdAt, data: ic });
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [db.reports, db.inferredConnections, canView]);

  const sensColors: Record<SensitivityLevel, string> = {
    standard: "text-emerald", sensitive: "text-amber", confidential: "text-red", "top-secret": "text-purple",
  };

  const rankStyles = [
    { bg: "gradient-blue", shadow: "shadow-glow-blue", bar: "gradient-blue" },
    { bg: "gradient-purple", shadow: "", bar: "gradient-purple" },
    { bg: "gradient-teal", shadow: "", bar: "gradient-teal" },
    { bg: "gradient-orange", shadow: "", bar: "gradient-orange" },
    { bg: "bg-surface-3", shadow: "", bar: "gradient-green", textColor: "text-text-3" },
  ];

  const clearance = (currentUser?.clearance ?? 1) as ClearanceLevel;
  const clearanceLabel = CLEARANCE_LABELS[clearance];
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="animate-fade-in space-y-6">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a2e4a] via-[#1e3a5f] to-[#243b5e] px-7 py-6"
      >
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 0.5px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-white/[0.03] blur-[80px] -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-[22px] font-bold text-white tracking-tight">
                {greeting}, {currentUser?.fullName || currentUser?.username}
              </h1>
            </div>
            <p className="text-[13px] text-white/50 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {dateStr}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{entries.length} entities in database</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{db.reports.length} reports filed</span>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield size={16} className="text-white/70" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white leading-tight">{clearanceLabel}</p>
                <p className="text-[10px] text-white/40 font-medium">Clearance Level {clearance} · {currentUser?.access === "full" ? "Full Access" : "Basic Access"}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, value: persons.length, label: "Key Actors", gradient: "gradient-blue", glow: "shadow-glow-blue", color: C.blue, sparkData: sparkEntities.slice(0, -2).concat([persons.length]), trend: `+${Math.round(persons.length * 0.12)}%` },
          { icon: Building2, value: orgs.length, label: "Organizations", gradient: "gradient-purple", glow: "shadow-glow-purple", color: C.purple, sparkData: sparkEntities.slice(0, -2).concat([orgs.length]), trend: `+${Math.round(orgs.length * 0.04)}%` },
          { icon: Link2, value: totalLinks, label: "Network Links", gradient: "gradient-teal", glow: "shadow-glow-green", color: C.cyan, sparkData: sparkLinks, trend: `+${Math.round(totalLinks * 0.18)}%` },
          { icon: Globe, value: coverage.length, label: "Regions Covered", gradient: "gradient-green", glow: "shadow-glow-green", color: C.emerald, sparkData: [5, 7, 8, 9, 10, 12, coverage.length], trend: `+${coverage.length > 10 ? 2 : 1}` },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="card-premium px-5 py-4 flex items-center gap-3.5 relative overflow-hidden group cursor-pointer"
          >
            <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 ${stat.gradient}`} />
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${stat.gradient} ${stat.glow} transition-all duration-300 group-hover:scale-105 relative`}>
              <stat.icon size={18} strokeWidth={1.8} />
              <div className={`absolute inset-0 rounded-xl ${stat.gradient} opacity-40 blur-lg -z-10`} />
            </div>
            <div className="relative z-10 flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[26px] font-extrabold text-text font-mono tracking-tight leading-none tabular-nums">
                  <Num value={stat.value} />
                </span>
                {stat.trend && (
                  <span className="text-[10px] font-bold text-stat-green">{stat.trend}</span>
                )}
              </div>
              <span className="text-[9px] text-text-3 uppercase tracking-[0.2em] font-bold mt-1 block">{stat.label}</span>
            </div>
            <Spark data={stat.sparkData} color={stat.color} label={stat.label} />
          </motion.div>
        ))}
      </div>

      {/* Middle Row: Attention + Watch Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Attention Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card-premium overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full gradient-orange" />
              <h3 className="text-[11px] font-bold text-text uppercase tracking-[0.12em] font-display">
                Requires Attention
              </h3>
            </div>
            {totalActionItems > 0 && (
              <span className="text-[9px] font-bold text-accent px-2.5 py-0.5 rounded-md bg-accent-muted border border-accent/12">
                {totalActionItems} pending
              </span>
            )}
          </div>
          {totalActionItems === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-5 pb-6">
              <CheckCircle2 size={28} className="text-emerald/50 mb-3" />
              <p className="text-[12px] text-text-3">All caught up. No pending actions.</p>
            </div>
          ) : (
            <div className="pb-1">
              {pendingValidations > 0 && (
                <button onClick={() => router.push("/admin/validations")}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-3/30 transition-all duration-200 group border-t border-border/30 cursor-pointer">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white gradient-orange relative">
                    <AlertCircle size={15} strokeWidth={1.8} />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red border-2 border-surface" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text leading-tight">{pendingValidations} pending validation{pendingValidations !== 1 && "s"}</p>
                    <p className="text-[10px] text-text-3 mt-1">Awaiting admin review</p>
                  </div>
                  <ArrowUpRight size={13} className="text-text-3/0 group-hover:text-text-3 transition-all duration-200" />
                </button>
              )}
              {newInferences > 0 && (
                <button onClick={() => router.push("/intelligence")}
                  className={cn("w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-3/30 transition-all duration-200 group border-t border-border/30 cursor-pointer",
                    newInferences > 5 && "bg-stat-green/[0.02]")}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white gradient-green">
                    <Globe size={15} strokeWidth={1.8} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className={cn("text-[13px] font-semibold leading-tight", newInferences > 5 ? "text-stat-green" : "text-text")}>{newInferences} AI inference{newInferences !== 1 && "s"} to review</p>
                    <p className="text-[10px] text-text-3 mt-1">New connections detected</p>
                  </div>
                  <ArrowUpRight size={13} className="text-text-3/0 group-hover:text-text-3 transition-all duration-200" />
                </button>
              )}
              {unreadNotifs > 0 && (
                <button onClick={() => {}}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-3/30 transition-all duration-200 group border-t border-border/30 cursor-pointer">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white gradient-purple">
                    <Bell size={15} strokeWidth={1.8} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text leading-tight">{unreadNotifs} unread notification{unreadNotifs !== 1 && "s"}</p>
                    <p className="text-[10px] text-text-3 mt-1">Signal alerts and updates</p>
                  </div>
                  <ArrowUpRight size={13} className="text-text-3/0 group-hover:text-text-3 transition-all duration-200" />
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Watch Targets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card-premium p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full gradient-teal" />
              <h3 className="text-[11px] font-bold text-text uppercase tracking-[0.12em] font-display">
                Watch Targets
              </h3>
            </div>
            <span className="text-[9px] font-bold text-stat-green px-2.5 py-0.5 rounded-md bg-stat-green/8 border border-stat-green/12">
              {db.signals.length} Active
            </span>
          </div>
          {db.signals.length === 0 ? (
            <p className="text-[12px] text-text-3 py-10 text-center">No active watch targets</p>
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
                    className="rounded-xl bg-surface-3/20 border border-border/30 px-4 py-3.5 group hover:border-stat-blue/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 gradient-teal opacity-[0.02] group-hover:opacity-[0.04] transition-opacity" />
                    <div className="flex items-center gap-3 relative">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg gradient-teal flex items-center justify-center shrink-0 shadow-glow-green relative">
                          <Radio size={16} className="text-white" strokeWidth={1.8} />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stat-green opacity-40" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stat-green border border-surface" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[13px] font-bold text-text font-display group-hover:text-accent transition-colors truncate">{entity.name}</span>
                          <span className="text-[7px] font-bold text-stat-blue bg-stat-blue/8 border border-stat-blue/12 px-1.5 py-px rounded uppercase tracking-widest shrink-0">{entity.category}</span>
                        </div>
                        <div className="w-full bg-border/40 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((score / maxScore) * 100, 100)}%` }}
                            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="gradient-green rounded-full h-1.5"
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="text-[22px] font-extrabold text-text font-mono leading-none tabular-nums">{score}</span>
                        <p className="text-[7px] text-text-3 uppercase tracking-[0.2em] font-bold mt-0.5">Influence</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Key Actors + Latest Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Key Actors */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="card-premium p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full gradient-blue" />
              <h3 className="text-[11px] font-bold text-text uppercase tracking-[0.12em] font-display">
                Top Actors by Influence
              </h3>
            </div>
            <button onClick={() => router.push("/persons")} className="text-[11px] text-stat-blue hover:text-stat-blue/80 font-semibold transition-colors flex items-center gap-1 cursor-pointer">
              View all ({persons.length}) <TrendingUp size={11} />
            </button>
          </div>
          <div className="space-y-3.5">
            {keyActors.map((e, i) => {
              const score = influence(e);
              const maxScore = influence(keyActors[0]);
              const style = rankStyles[i] || rankStyles[rankStyles.length - 1];
              return (
                <div key={e.id} onClick={() => go(e.id)} className="flex items-center gap-3.5 group cursor-pointer">
                  <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0",
                    style.bg, style.shadow, style.textColor || "text-white"
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text truncate group-hover:text-stat-blue transition-colors leading-tight">{e.name}</p>
                    <p className="text-[10px] text-text-3 mt-0.5">{e.country}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-20 bg-border/30 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / maxScore) * 100}%` }}
                        transition={{ delay: 0.6 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`rounded-full h-1.5 ${style.bar}`}
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[14px] font-extrabold text-text font-mono tabular-nums">{score}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Latest Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="card-premium overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full gradient-blue" />
              <h3 className="text-[11px] font-bold text-text uppercase tracking-[0.12em] font-display">
                Latest Intelligence
              </h3>
            </div>
            <div className="flex gap-0.5 bg-surface-3/40 rounded-lg p-0.5 border border-border/30">
              <button onClick={() => router.push("/reports")} className="text-[9px] font-semibold text-white bg-accent px-2.5 py-1 rounded cursor-pointer">Reports</button>
              <button onClick={() => router.push("/intelligence")} className="text-[9px] font-medium text-text-3 px-2.5 py-1 rounded hover:text-text transition-colors cursor-pointer">Inferences</button>
            </div>
          </div>
          {intelligenceFeed.length === 0 ? (
            <p className="text-[12px] text-text-3 py-10 text-center px-5 pb-6">No recent intelligence</p>
          ) : (
            <div className="pb-1">
              {intelligenceFeed.map((item) => {
                if (item.type === "report") {
                  const report = item.data as typeof db.reports[0];
                  return (
                    <div key={`r-${report.id}`} onClick={() => router.push("/reports")}
                      className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-3/20 transition-all duration-200 group cursor-pointer border-t border-border/20">
                      <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center shrink-0 text-white">
                        <FileText size={14} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-text group-hover:text-stat-blue transition-colors truncate leading-tight">{report.title}</p>
                        <p className="text-[10px] text-text-3 mt-1 flex items-center gap-2">
                          <span>{report.createdBy}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </p>
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded", sensColors[report.overallSensitivity],
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
                      className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-3/20 transition-all duration-200 group cursor-pointer border-t border-border/20">
                      <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center shrink-0 text-white relative">
                        <Globe size={14} strokeWidth={1.8} />
                        <Sparkles size={7} className="absolute -top-0.5 -right-0.5 text-stat-amber fill-stat-amber" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-text group-hover:text-stat-blue transition-colors leading-tight">
                          {entityA.name} <span className="text-text-3/50 mx-1 font-normal text-[10px]">&harr;</span> {entityB.name}
                        </p>
                        <p className="text-[10px] text-text-3 mt-1 flex items-center gap-2">
                          <span className="capitalize">{ic.category.replace(/-/g, " ")}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{ic.evidence.length} Evidence</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-extrabold text-accent font-mono tabular-nums">{Math.round(ic.confidence)}%</span>
                        <ArrowUpRight size={12} className="text-text-3/0 group-hover:text-text-3 transition-all" />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
