"use client";

import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card, Badge, Button, useToast } from "@/components/ui";
import { CheckCircle2, XCircle, Shield } from "lucide-react";

export default function ValidationsPage() {
  const { db, currentUser, updateDb } = useApp();
  const { toast } = useToast();

  if (currentUser?.role !== "admin") return <Card><p className="text-red text-center py-8">Access denied. Admin only.</p></Card>;

  const pending = db.pendingValidations.filter((v) => !v.resolved);
  const resolved = db.pendingValidations.filter((v) => v.resolved);

  const handle = (id: number, approve: boolean) => {
    updateDb((d) => {
      const val = d.pendingValidations.find((v) => v.id === id);
      if (!val) return;
      val.resolved = true;
      val.approved = approve;
      if (approve && val.suggestedLinkId !== null) {
        const entry = d.entries.find((e) => e.id === val.entryId);
        const target = d.entries.find((e) => e.id === val.suggestedLinkId);
        if (entry && target) {
          if (!entry.linkedTo.includes(target.id)) entry.linkedTo.push(target.id);
          if (!target.linkedTo.includes(entry.id)) target.linkedTo.push(entry.id);
        }
      }
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: approve ? "VALIDATE_APPROVE" : "VALIDATE_REJECT", detail: `${approve ? "Approved" : "Rejected"}: ${val.targetName} → ${val.suggestedLink}` });
      d.notifications.push({ message: `Your link (${val.targetName} → ${val.suggestedLink}) was ${approve ? "approved" : "rejected"}.`, forUser: val.submittedBy, ts: new Date().toISOString(), read: false });
    });
    toast(approve ? "Link approved." : "Link rejected.", approve ? "success" : "info");
  };

  return (
    <>
      <PageHeader title="Pending Validations" description="Review and approve or reject link suggestions from users" />
      {pending.length === 0 ? (
        <Card><p className="text-text-3 text-center py-8">No pending validations.</p></Card>
      ) : (
        <div className="space-y-3">{pending.map((v) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-semibold mb-1">{v.targetName} <span className="text-text-3 font-normal">&rarr;</span> {v.suggestedLink}</h3>
                <p className="text-[13px] text-text-2">By <strong>{v.submittedBy}</strong> on {formatDate(v.submittedAt)}</p>
                <p className="text-[13px] mt-2"><strong>Reason:</strong> {v.reason}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => handle(v.id, true)}><CheckCircle2 size={12} /> Approve</Button>
                <Button size="sm" variant="danger" onClick={() => handle(v.id, false)}><XCircle size={12} /> Reject</Button>
              </div>
            </div>
          </Card>
        ))}</div>
      )}
      {resolved.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-text-3 mt-8 mb-3 uppercase tracking-wider">Resolved ({resolved.length})</h3>
          <div className="space-y-2">{resolved.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-surface border border-border text-[13px]">
              <span>{v.targetName} &rarr; {v.suggestedLink} <span className="text-text-3 ml-2">by {v.submittedBy}</span></span>
              <Badge variant={v.approved ? "approved" : "rejected"}>{v.approved ? "Approved" : "Rejected"}</Badge>
            </div>
          ))}</div>
        </>
      )}
    </>
  );
}
