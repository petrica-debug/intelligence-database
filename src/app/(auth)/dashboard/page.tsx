"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Card, GlassCard, Badge, StatCard, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Users, Building2, Phone, MapPin, Car, Link2, AlertTriangle, Radio, Globe, TrendingUp, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function DashboardPage() {
  const { db, currentUser } = useApp();
  const router = useRouter();

  const catCounts = [
    { name: "Persons", value: db.entries.filter((e) => e.category === "person").length, color: "#1e3a5f" },
    { name: "Organizations", value: db.entries.filter((e) => e.category === "company").length, color: "#5b21b6" },
    { name: "Contacts", value: db.entries.filter((e) => e.category === "mobile").length, color: "#047857" },
    { name: "Addresses", value: db.entries.filter((e) => e.category === "address").length, color: "#b45309" },
    { name: "Vehicles", value: db.entries.filter((e) => e.category === "vehicle").length, color: "#b91c1c" },
  ];

  const contextData = [
    { name: "Confirmed", value: db.entries.filter((e) => e.context === "confirmed").length, color: "#047857" },
    { name: "Likely", value: db.entries.filter((e) => e.context === "likely").length, color: "#1e3a5f" },
    { name: "Rumor", value: db.entries.filter((e) => e.context === "rumor").length, color: "#b45309" },
  ];

  // Country data
  const countryMap = new Map<string, number>();
  db.entries.forEach((e) => { if (e.country) countryMap.set(e.country, (countryMap.get(e.country) || 0) + 1); });
  const countryColors: Record<string, string> = { "Romania": "#1e3a5f", "Bulgaria": "#047857", "Hungary": "#b91c1c", "Czech Republic": "#5b21b6", "International": "#b45309" };
  const countryData = Array.from(countryMap.entries()).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, color: countryColors[name] || "#7b8da4" }));

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = db.logs.filter((l) => new Date(l.ts).toDateString() === d.toDateString()).length;
    return { day, actions: count || Math.floor(Math.random() * 5) + 1 };
  });

  const totalLinks = db.entries.reduce((s, e) => s + e.linkedTo.length, 0);
  const pendingCount = db.pendingValidations.filter((v) => !v.resolved).length;
  const recentEntries = [...db.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const recentLogs = db.logs.slice(0, 10);

  // Top connected entities
  const topConnected = db.entries
    .map((e) => ({ ...e, totalConn: e.linkedTo.length + db.entries.filter((x) => x.linkedTo.includes(e.id)).length }))
    .sort((a, b) => b.totalConn - a.totalConn)
    .slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" description="Overview and analytics" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard icon={<Users size={22} />} value={catCounts[0].value} label="Persons" color="text-accent" />
        <StatCard icon={<Building2 size={22} />} value={catCounts[1].value} label="Organizations" color="text-purple" />
        <StatCard icon={<Phone size={22} />} value={catCounts[2].value} label="Contacts" color="text-emerald" />
        <StatCard icon={<MapPin size={22} />} value={catCounts[3].value} label="Addresses" color="text-amber" />
        <StatCard icon={<Car size={22} />} value={catCounts[4].value} label="Vehicles" color="text-red" />
        <StatCard icon={<Link2 size={22} />} value={totalLinks} label="Links" color="text-cyan" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider">Categories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={catCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
              {catCounts.map((c, i) => <Cell key={i} fill={c.color} />)}
            </Pie><Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #d0d9e6", borderRadius: 8, fontSize: 12 }} /></PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {catCounts.map((c) => (<div key={c.name} className="flex items-center gap-1.5 text-[10px] text-text-2"><div className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.name}</div>))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider">By Country</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#3e5068", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#3e5068", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #d0d9e6", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>{countryData.map((c, i) => <Cell key={i} fill={c.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider">Reliability</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={contextData}><XAxis dataKey="name" tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #d0d9e6", borderRadius: 8, fontSize: 12 }} /><Bar dataKey="value" radius={[6, 6, 0, 0]}>{contextData.map((c, i) => <Cell key={i} fill={c.color} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider">Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData}><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.2} /><stop offset="100%" stopColor="#1e3a5f" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#3e5068", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #d0d9e6", borderRadius: 8, fontSize: 12 }} /><Area type="monotone" dataKey="actions" stroke="#1e3a5f" fill="url(#ag)" strokeWidth={2} /></AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Admin Alerts + Top Connected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {currentUser?.role === "admin" && pendingCount > 0 && (
          <GlassCard className="border-amber/30">
            <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-amber-muted flex items-center justify-center"><AlertTriangle size={16} className="text-amber" /></div><div><h3 className="text-sm font-semibold">Pending Validations</h3><p className="text-[11px] text-text-3">{pendingCount} awaiting review</p></div></div>
            {db.pendingValidations.filter((v) => !v.resolved).slice(0, 3).map((v) => (<div key={v.id} className="flex items-center justify-between py-2 border-t border-border/50 text-[13px]"><span className="truncate"><strong>{v.targetName}</strong> &rarr; {v.suggestedLink}</span><Badge variant="pending">Pending</Badge></div>))}
          </GlassCard>
        )}
        {currentUser?.role === "admin" && db.signals.length > 0 && (
          <GlassCard className="border-amber/30">
            <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-amber-muted flex items-center justify-center"><Radio size={16} className="text-amber" /></div><div><h3 className="text-sm font-semibold">Active Signals</h3><p className="text-[11px] text-text-3">{db.signals.length} under watch</p></div></div>
            {db.signals.map((s) => (<div key={s.entityId} className="flex items-center justify-between py-2 border-t border-border/50 text-[13px]"><span className="text-amber font-medium">{s.entityName}</span><span className="text-[11px] text-text-3">by {s.setBy}</span></div>))}
          </GlassCard>
        )}
        <GlassCard>
          <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center"><TrendingUp size={16} className="text-accent" /></div><div><h3 className="text-sm font-semibold">Most Connected</h3><p className="text-[11px] text-text-3">Key network nodes</p></div></div>
          {topConnected.map((e, i) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-t border-border/50 text-[13px] cursor-pointer hover:text-accent transition-colors" onClick={() => router.push(`/entry/${e.id}`)}>
              <div className="flex items-center gap-2">
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i === 0 ? "bg-accent text-white" : "bg-surface-3 text-text-3"
                )}>{i + 1}</span>
                <span className="font-medium truncate">{e.name}</span>
              </div>
              <span className="text-[11px] text-text-3">{e.totalConn} links</span>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Recent Entries Table */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider">Recent Entries</h3>
          <button onClick={() => router.push("/search")} className="text-[12px] text-accent hover:underline cursor-pointer flex items-center gap-1">View All <ArrowRight size={12} /></button>
        </div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border">{["Name","Category","Country","Reliability","By","Date"].map((h) => (<th key={h} className="text-left text-[11px] font-medium text-text-3 uppercase tracking-wider pb-3 pr-4">{h}</th>))}</tr></thead><tbody>{recentEntries.map((e) => (
          <tr key={e.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors cursor-pointer" onClick={() => router.push(`/entry/${e.id}`)}>
            <td className="py-3 pr-4 text-[13px] font-medium">{e.name}</td>
            <td className="py-3 pr-4"><Badge variant={e.category as never}>{e.category}</Badge></td>
            <td className="py-3 pr-4 text-[12px] text-text-2">{e.country || "—"}</td>
            <td className="py-3 pr-4"><Badge variant={e.context as never}>{e.context}</Badge></td>
            <td className="py-3 pr-4 text-[13px] text-text-2">{e.createdBy}</td>
            <td className="py-3 text-[12px] text-text-3">{formatDate(e.createdAt)}</td>
          </tr>))}</tbody></table></div>
      </Card>

      {/* Recent Activity */}
      {currentUser?.role === "admin" && (<Card><h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider">Recent Activity</h3><div className="space-y-0">{recentLogs.map((l, i) => (<div key={i} className="flex items-center gap-4 py-2.5 border-b border-border/30 last:border-0"><span className="text-[11px] text-text-3 w-36 shrink-0">{formatDate(l.ts)}</span><span className="text-[13px] font-medium w-20 shrink-0">{l.user}</span><Badge variant="info">{l.action}</Badge><span className="text-[13px] text-text-2 truncate">{l.detail}</span></div>))}</div></Card>)}
    </>
  );
}
