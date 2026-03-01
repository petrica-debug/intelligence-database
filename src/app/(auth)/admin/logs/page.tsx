"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card, Badge, Select } from "@/components/ui";
import { ScrollText } from "lucide-react";

export default function LogsPage() {
  const { db, currentUser } = useApp();
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");

  if (currentUser?.role !== "admin") return <Card><p className="text-red text-center py-8">Access denied. Admin only.</p></Card>;

  const actions = [...new Set(db.logs.map((l) => l.action))];
  const users = [...new Set(db.logs.map((l) => l.user))];
  const filtered = db.logs.filter((l) => (!filterUser || l.user === filterUser) && (!filterAction || l.action === filterAction));

  return (
    <>
      <PageHeader title="Audit Log" description="Complete record of all system activity" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select label="Filter by User" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} options={[{ value: "", label: "All Users" }, ...users.map((u) => ({ value: u, label: u }))]} />
        <Select label="Filter by Action" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} options={[{ value: "", label: "All Actions" }, ...actions.map((a) => ({ value: a, label: a }))]} />
      </div>
      <Card>
        <p className="text-[13px] text-text-3 mb-4">{filtered.length} log entries</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">{["Timestamp","User","Action","Detail"].map((h) => <th key={h} className="text-left text-[11px] font-medium text-text-3 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
            <tbody>{filtered.map((l, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                <td className="py-2.5 pr-4 text-[12px] text-text-3 whitespace-nowrap">{formatDate(l.ts)}</td>
                <td className="py-2.5 pr-4 text-[13px] font-medium">{l.user}</td>
                <td className="py-2.5 pr-4"><Badge variant="info">{l.action}</Badge></td>
                <td className="py-2.5 text-[13px] text-text-2">{l.detail}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
