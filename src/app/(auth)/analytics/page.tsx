"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { PageHeader, Card, GlassCard, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Shield, Brain, Users, FileText, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Activity, Lock, Eye, BarChart3, Clock, Database } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, RadialBarChart, RadialBar, Legend } from "recharts";
import type { SensitivityLevel } from "@/types";
import { SENSITIVITY_MIN_CLEARANCE, CLEARANCE_LABELS } from "@/types";

const tooltipStyle = {
  background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12,
  fontSize: 11, padding: "8px 14px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
};

const C = {
  navy: "#1e3a5f", blue: "#3b82f6", purple: "#7c3aed",
  emerald: "#059669", amber: "#d97706", red: "#dc2626",
  cyan: "#0891b2", slate: "#64748b",
};

export default function AnalyticsPage() {
  const { db, currentUser, canView, userClearance } = useApp();
  const router = useRouter();
  const entries = db.entries;

  // ── Data Quality Metrics ──
  const withCountry = entries.filter(e => e.country).length;
  const withTags = entries.filter(e => (e.tags || []).length > 0).length;
  const withLinks = entries.filter(e => e.linkedTo.length > 0).length;
  const confirmed = entries.filter(e => e.context === "confirmed").length;
  const qualityScore = Math.round(
    ((withCountry / entries.length) * 25 +
    (withTags / entries.length) * 25 +
    (withLinks / entries.length) * 25 +
    (confirmed / entries.length) * 25)
  );

  const qualityMetrics = [
    { name: "Geo-tagged", value: Math.round((withCountry / entries.length) * 100), fill: C.blue },
    { name: "Tagged", value: Math.round((withTags / entries.length) * 100), fill: C.purple },
    { name: "Linked", value: Math.round((withLinks / entries.length) * 100), fill: C.cyan },
    { name: "Confirmed", value: Math.round((confirmed / entries.length) * 100), fill: C.emerald },
  ];

  // ── Inference Performance ──
  const totalInferences = db.inferredConnections.length;
  const confirmedInferences = db.inferredConnections.filter(ic => ic.status === "confirmed").length;
  const dismissedInferences = db.inferredConnections.filter(ic => ic.status === "dismissed").length;
  const pendingInferences = db.inferredConnections.filter(ic => ic.status === "new").length;
  const accuracyRate = totalInferences > 0 && (confirmedInferences + dismissedInferences) > 0
    ? Math.round((confirmedInferences / (confirmedInferences + dismissedInferences)) * 100)
    : 0;
  const avgConfidence = totalInferences > 0
    ? Math.round(db.inferredConnections.reduce((s, ic) => s + ic.confidence, 0) / totalInferences * 100)
    : 0;

  const inferenceByCategory = (() => {
    const m = new Map<string, { total: number; confirmed: number; dismissed: number }>();
    db.inferredConnections.forEach(ic => {
      const cat = ic.category;
      const cur = m.get(cat) || { total: 0, confirmed: 0, dismissed: 0 };
      cur.total++;
      if (ic.status === "confirmed") cur.confirmed++;
      if (ic.status === "dismissed") cur.dismissed++;
      m.set(cat, cur);
    });
    return Array.from(m.entries()).map(([name, data]) => ({
      name: name.replace(/-/g, " "),
      total: data.total,
      confirmed: data.confirmed,
      dismissed: data.dismissed,
      accuracy: (data.confirmed + data.dismissed) > 0 ? Math.round((data.confirmed / (data.confirmed + data.dismissed)) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  })();

  // ── Sensitivity Distribution ──
  const sensitivityDist = (() => {
    const counts: Record<SensitivityLevel, number> = { standard: 0, sensitive: 0, confidential: 0, "top-secret": 0 };
    entries.forEach(e => { counts[e.sensitivity ?? "standard"]++; });
    return [
      { name: "Standard", value: counts.standard, fill: C.emerald },
      { name: "Sensitive", value: counts.sensitive, fill: C.amber },
      { name: "Confidential", value: counts.confidential, fill: C.red },
      { name: "Top Secret", value: counts["top-secret"], fill: C.purple },
    ].filter(d => d.value > 0);
  })();

  // ── User Activity Audit ──
  const userActivity = (() => {
    const m = new Map<string, { searches: number; views: number; entries: number; logins: number; total: number }>();
    db.logs.forEach(log => {
      const cur = m.get(log.user) || { searches: 0, views: 0, entries: 0, logins: 0, total: 0 };
      cur.total++;
      if (log.action === "SEARCH") cur.searches++;
      else if (log.action === "VIEW") cur.views++;
      else if (log.action === "ENTRY") cur.entries++;
      else if (log.action === "LOGIN") cur.logins++;
      m.set(log.user, cur);
    });
    return Array.from(m.entries())
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.total - a.total);
  })();

  // ── Reports Analytics ──
  const totalReports = db.reports.length;
  const avgSections = totalReports > 0 ? (db.reports.reduce((s, r) => s + r.sections.length, 0) / totalReports).toFixed(1) : "0";
  const reportsBySensitivity = (() => {
    const counts: Record<SensitivityLevel, number> = { standard: 0, sensitive: 0, confidential: 0, "top-secret": 0 };
    db.reports.forEach(r => counts[r.overallSensitivity]++);
    return counts;
  })();

  // ── Validation Queue ──
  const pendingValidations = db.pendingValidations.filter(v => !v.resolved).length;
  const resolvedValidations = db.pendingValidations.filter(v => v.resolved).length;
  const approvedValidations = db.pendingValidations.filter(v => v.approved === true).length;

  // ── Activity Timeline (30 days, broken by action type) ──
  const activityTimeline = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const dayStr = d.toDateString();
    const dayLogs = db.logs.filter(l => new Date(l.ts).toDateString() === dayStr);
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      searches: dayLogs.filter(l => l.action === "SEARCH").length,
      entries: dayLogs.filter(l => l.action === "ENTRY").length,
      views: dayLogs.filter(l => l.action === "VIEW").length,
      other: dayLogs.filter(l => !["SEARCH", "ENTRY", "VIEW"].includes(l.action)).length,
    };
  });

  // ── Orphaned entities (no links) ──
  const orphaned = entries.filter(e => {
    const hasOutbound = e.linkedTo.length > 0;
    const hasInbound = entries.some(x => x.linkedTo.includes(e.id));
    return !hasOutbound && !hasInbound;
  });

  return (
    <>
      <PageHeader title="Operational Analytics" description="Data quality, inference performance, user activity audit, and security metrics" />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><Database size={14} className="text-accent" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Quality Score</span></div>
          <div className={cn("text-2xl font-bold", qualityScore >= 80 ? "text-emerald" : qualityScore >= 60 ? "text-amber" : "text-red")}>{qualityScore}%</div>
          <div className="text-[11px] text-text-3">data completeness</div>
        </GlassCard>
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><Brain size={14} className="text-purple" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">AI Accuracy</span></div>
          <div className={cn("text-2xl font-bold", accuracyRate >= 70 ? "text-emerald" : accuracyRate >= 50 ? "text-amber" : "text-text-2")}>{accuracyRate > 0 ? `${accuracyRate}%` : "N/A"}</div>
          <div className="text-[11px] text-text-3">{confirmedInferences + dismissedInferences} reviewed</div>
        </GlassCard>
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><FileText size={14} className="text-cyan" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Reports</span></div>
          <div className="text-2xl font-bold">{totalReports}</div>
          <div className="text-[11px] text-text-3">avg {avgSections} sections</div>
        </GlassCard>
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className="text-amber" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Pending</span></div>
          <div className="text-2xl font-bold text-amber">{pendingValidations + pendingInferences}</div>
          <div className="text-[11px] text-text-3">{pendingValidations} validations, {pendingInferences} inferences</div>
        </GlassCard>
        <GlassCard className="py-3 px-4">
          <div className="flex items-center gap-2 mb-1"><Activity size={14} className="text-emerald" /><span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Total Actions</span></div>
          <div className="text-2xl font-bold">{db.logs.length}</div>
          <div className="text-[11px] text-text-3">by {userActivity.length} users</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Data Quality Breakdown */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider flex items-center gap-2">
            <Database size={14} /> Data Quality Assessment
          </h3>
          <div className="space-y-3">
            {[
              { label: "Geo-tagged", count: withCountry, total: entries.length, color: "bg-blue", desc: "Entries with country assigned" },
              { label: "Tagged", count: withTags, total: entries.length, color: "bg-purple", desc: "Entries with topic tags" },
              { label: "Connected", count: withLinks, total: entries.length, color: "bg-cyan", desc: "Entries with at least one link" },
              { label: "Confirmed", count: confirmed, total: entries.length, color: "bg-emerald", desc: "Verified intelligence" },
            ].map(m => {
              const pct = Math.round((m.count / m.total) * 100);
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-[12px] font-semibold text-text">{m.label}</span>
                      <span className="text-[10px] text-text-3 ml-2">{m.desc}</span>
                    </div>
                    <span className="text-[12px] font-bold tabular-nums">{m.count}/{m.total} <span className={cn("ml-1", pct >= 80 ? "text-emerald" : pct >= 60 ? "text-amber" : "text-red")}>{pct}%</span></span>
                  </div>
                  <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", m.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {orphaned.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={12} className="text-amber" />
                <span className="text-[10px] font-semibold text-amber uppercase tracking-wider">Orphaned Entities ({orphaned.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {orphaned.slice(0, 8).map(e => (
                  <span key={e.id} onClick={() => router.push(`/entry/${e.id}`)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-amber/8 text-amber border border-amber/15 cursor-pointer hover:bg-amber/15 transition-colors">
                    {e.name}
                  </span>
                ))}
                {orphaned.length > 8 && <span className="text-[10px] text-text-3 px-2 py-0.5">+{orphaned.length - 8} more</span>}
              </div>
            </div>
          )}
        </Card>

        {/* Inference Performance */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider flex items-center gap-2">
            <Brain size={14} /> AI Inference Performance
          </h3>
          {totalInferences === 0 ? (
            <p className="text-[12px] text-text-3 py-8 text-center">No inferences to analyze yet</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2.5 rounded-xl bg-emerald/[0.04] border border-emerald/10">
                  <CheckCircle2 size={14} className="text-emerald mx-auto mb-1" />
                  <div className="text-lg font-bold text-emerald">{confirmedInferences}</div>
                  <div className="text-[9px] text-text-3 uppercase">Confirmed</div>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-amber/[0.04] border border-amber/10">
                  <Clock size={14} className="text-amber mx-auto mb-1" />
                  <div className="text-lg font-bold text-amber">{pendingInferences}</div>
                  <div className="text-[9px] text-text-3 uppercase">Pending</div>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-red/[0.04] border border-red/10">
                  <XCircle size={14} className="text-red mx-auto mb-1" />
                  <div className="text-lg font-bold text-red">{dismissedInferences}</div>
                  <div className="text-[9px] text-text-3 uppercase">Dismissed</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-1">By Category</div>
                {inferenceByCategory.map(cat => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-text-2 w-28 truncate capitalize">{cat.name}</span>
                    <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald" style={{ width: `${cat.total > 0 ? (cat.confirmed / cat.total) * 100 : 0}%` }} />
                      <div className="h-full bg-red" style={{ width: `${cat.total > 0 ? (cat.dismissed / cat.total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-text-2 w-6 text-right">{cat.total}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-border/30 flex items-center gap-4">
                <span className="text-[9px] text-text-3 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald" />Confirmed</span>
                <span className="text-[9px] text-text-3 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red" />Dismissed</span>
                <span className="text-[9px] text-text-3 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-surface-3" />Pending</span>
                <span className="ml-auto text-[10px] text-text-3">Avg confidence: <span className="font-bold text-text">{avgConfidence}%</span></span>
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Security Classification Distribution */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider flex items-center gap-2">
            <Shield size={14} /> Security Classification Distribution
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={sensitivityDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  paddingAngle={3} dataKey="value" strokeWidth={0} cornerRadius={4}>
                  {sensitivityDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {sensitivityDist.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.fill }} />
                  <span className="text-[11px] font-medium text-text-2 flex-1">{d.name}</span>
                  <span className="text-[12px] font-bold text-text">{d.value}</span>
                  <span className="text-[10px] text-text-3">({Math.round((d.value / entries.length) * 100)}%)</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border/30">
                <div className="flex items-center gap-1.5">
                  <Lock size={10} className="text-text-3" />
                  <span className="text-[10px] text-text-3">
                    Your clearance: <span className="font-semibold text-accent">{CLEARANCE_LABELS[userClearance]} (L{userClearance})</span>
                  </span>
                </div>
                <div className="text-[10px] text-text-3 mt-0.5">
                  You can access {entries.filter(e => canView(e.sensitivity ?? "standard")).length} of {entries.length} entries
                </div>
              </div>
            </div>
          </div>
          {/* Reports by sensitivity */}
          {totalReports > 0 && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2">Reports by Classification</div>
              <div className="flex gap-3">
                {(["standard", "sensitive", "confidential", "top-secret"] as SensitivityLevel[]).map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    {s === "standard" && <Eye size={10} className="text-emerald" />}
                    {s === "sensitive" && <AlertTriangle size={10} className="text-amber" />}
                    {s === "confidential" && <Lock size={10} className="text-red" />}
                    {s === "top-secret" && <Shield size={10} className="text-purple" />}
                    <span className="text-[10px] text-text-2 capitalize">{s === "top-secret" ? "Top Secret" : s}</span>
                    <span className="text-[11px] font-bold">{reportsBySensitivity[s]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* User Activity Audit */}
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider flex items-center gap-2">
            <Users size={14} /> User Activity Audit
          </h3>
          {userActivity.length === 0 ? (
            <p className="text-[12px] text-text-3 py-8 text-center">No activity recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {["User", "Searches", "Views", "Entries", "Logins", "Total"].map(h => (
                    <th key={h} className="text-left text-[10px] font-medium text-text-3 uppercase tracking-wider pb-2 pr-3">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{userActivity.map((u) => (
                  <tr key={u.user} className="border-b border-border/30 hover:bg-surface-2/30 transition-colors">
                    <td className="py-2 pr-3">
                      <span className="text-[12px] font-semibold text-text">{u.user}</span>
                    </td>
                    <td className="py-2 pr-3 text-[12px] text-text-2 tabular-nums">{u.searches}</td>
                    <td className="py-2 pr-3 text-[12px] text-text-2 tabular-nums">{u.views}</td>
                    <td className="py-2 pr-3 text-[12px] text-text-2 tabular-nums">{u.entries}</td>
                    <td className="py-2 pr-3 text-[12px] text-text-2 tabular-nums">{u.logins}</td>
                    <td className="py-2 text-[12px] font-bold text-text tabular-nums">{u.total}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="mb-6">
        <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider flex items-center gap-2">
          <Activity size={14} /> 30-Day Activity Timeline
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#7b8da4", fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fill: "#7b8da4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="searches" stackId="a" fill={C.blue} name="Searches" radius={[0, 0, 0, 0]} />
            <Bar dataKey="entries" stackId="a" fill={C.emerald} name="Entries" radius={[0, 0, 0, 0]} />
            <Bar dataKey="views" stackId="a" fill={C.purple} name="Views" radius={[0, 0, 0, 0]} />
            <Bar dataKey="other" stackId="a" fill={C.slate} name="Other" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 justify-center">
          <span className="flex items-center gap-1 text-[9px] text-text-3"><span className="w-2 h-2 rounded-sm" style={{ background: C.blue }} />Searches</span>
          <span className="flex items-center gap-1 text-[9px] text-text-3"><span className="w-2 h-2 rounded-sm" style={{ background: C.emerald }} />Entries</span>
          <span className="flex items-center gap-1 text-[9px] text-text-3"><span className="w-2 h-2 rounded-sm" style={{ background: C.purple }} />Views</span>
          <span className="flex items-center gap-1 text-[9px] text-text-3"><span className="w-2 h-2 rounded-sm" style={{ background: C.slate }} />Other</span>
        </div>
      </Card>

      {/* Validation Queue Summary */}
      {db.pendingValidations.length > 0 && (
        <Card>
          <h3 className="text-[12px] font-semibold mb-4 text-text-2 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={14} /> Validation Pipeline
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-amber/[0.04] border border-amber/10">
              <div className="text-2xl font-bold text-amber">{pendingValidations}</div>
              <div className="text-[10px] text-text-3 uppercase">Pending Review</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald/[0.04] border border-emerald/10">
              <div className="text-2xl font-bold text-emerald">{approvedValidations}</div>
              <div className="text-[10px] text-text-3 uppercase">Approved</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-surface-2 border border-border/40">
              <div className="text-2xl font-bold text-text">{resolvedValidations}</div>
              <div className="text-[10px] text-text-3 uppercase">Total Resolved</div>
            </div>
          </div>
          {pendingValidations > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2">Awaiting Review</div>
              {db.pendingValidations.filter(v => !v.resolved).slice(0, 5).map(v => (
                <div key={v.id} className="flex items-center gap-3 py-2 px-2 rounded-xl bg-amber/[0.02] border border-amber/8">
                  <AlertTriangle size={12} className="text-amber shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate">{v.targetName} &rarr; {v.suggestedLink}</div>
                    <div className="text-[9px] text-text-3">by {v.submittedBy} &middot; {new Date(v.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  );
}
