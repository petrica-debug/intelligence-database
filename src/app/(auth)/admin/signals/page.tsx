"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card, Badge, Button, Select, useToast } from "@/components/ui";
import { Radio, Trash2, Plus } from "lucide-react";

export default function SignalsPage() {
  const { db, currentUser, updateDb } = useApp();
  const { toast } = useToast();
  const [entityId, setEntityId] = useState("");

  if (currentUser?.role !== "admin") return <Card><p className="text-red text-center py-8">Access denied. Admin only.</p></Card>;

  const available = db.entries.filter((e) => !db.signals.some((s) => s.entityId === e.id));

  const addSignal = () => {
    const id = Number(entityId);
    const entry = db.entries.find((e) => e.id === id);
    if (!entry) { toast("Entry not found.", "error"); return; }
    updateDb((d) => {
      d.signals.push({ entityId: id, entityName: entry.name, setBy: currentUser!.username, setAt: new Date().toISOString() });
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "SIGNAL_SET", detail: `Set signal: ${entry.name}` });
    });
    setEntityId("");
    toast("Signal activated.", "success");
  };

  const removeSignal = (eid: number) => {
    const sig = db.signals.find((s) => s.entityId === eid);
    if (!sig) return;
    updateDb((d) => {
      d.signals = d.signals.filter((s) => s.entityId !== eid);
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "SIGNAL_REMOVE", detail: `Removed signal: ${sig.entityName}` });
    });
    toast("Signal removed.", "info");
  };

  return (
    <>
      <PageHeader title="Signal Management" description="Monitor entities - get notified when anyone searches for or views them" />
      <Card className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-text-2 uppercase tracking-wider">Add Signal</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select label="Select Entity" value={entityId} onChange={(e) => setEntityId(e.target.value)}
              options={[{ value: "", label: "-- Select --" }, ...available.map((e) => ({ value: String(e.id), label: `[${e.category}] ${e.name}` }))]} />
          </div>
          <Button variant="warning" onClick={addSignal} disabled={!entityId}><Plus size={14} /> Set Signal</Button>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold mb-4 text-text-2 uppercase tracking-wider">Active Signals ({db.signals.length})</h3>
        {db.signals.length === 0 ? <p className="text-text-3 text-center py-8">No active signals.</p> : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border">{["Entity","Set By","Set At","Action"].map((h) => <th key={h} className="text-left text-[11px] font-medium text-text-3 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
          <tbody>{db.signals.map((s) => (
            <tr key={s.entityId} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
              <td className="py-3 pr-4"><span className="text-amber font-semibold text-[14px]">{s.entityName}</span><span className="text-[11px] text-text-3 ml-2">ID: {s.entityId}</span></td>
              <td className="py-3 pr-4 text-[13px]">{s.setBy}</td>
              <td className="py-3 pr-4 text-[12px] text-text-3">{formatDate(s.setAt)}</td>
              <td className="py-3"><Button size="sm" variant="danger" onClick={() => removeSignal(s.entityId)}><Trash2 size={12} /> Remove</Button></td>
            </tr>
          ))}</tbody></table></div>
        )}
      </Card>
    </>
  );
}
