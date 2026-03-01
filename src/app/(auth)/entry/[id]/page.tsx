"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { PageHeader, Card, GlassCard, Badge, Button, Textarea, useToast } from "@/components/ui";
import { ArrowLeft, Link2, Radio, Shield, Lock, KeyRound, User, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/cn";

const COLORS: Record<string, string> = { person: "text-accent", company: "text-purple", mobile: "text-emerald", address: "text-amber", vehicle: "text-red" };

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { db, currentUser, updateDb } = useApp();
  const { toast } = useToast();
  const [accessReason, setAccessReason] = useState("");
  const [showAccess, setShowAccess] = useState(false);

  const id = Number(params.id);
  const entry = db.entries.find((e) => e.id === id);

  if (!entry) return (
    <Card><h3 className="text-lg font-semibold mb-2">Entry Not Found</h3><p className="text-text-2">The requested entry does not exist.</p>
      <Button variant="secondary" onClick={() => router.back()} className="mt-4"><ArrowLeft size={14} /> Go Back</Button></Card>
  );

  const isBasic = currentUser?.access === "basic" && currentUser?.role !== "admin";
  const canViewFull = !isBasic || entry.createdBy === currentUser?.username;
  const linkedEntries = db.entries.filter((e) => entry.linkedTo.includes(e.id));
  const reverseLinked = db.entries.filter((e) => e.linkedTo.includes(entry.id) && !entry.linkedTo.includes(e.id));
  const allLinked = [...linkedEntries, ...reverseLinked];
  const signal = db.signals.find((s) => s.entityId === entry.id);

  // Log view
  updateDb((d) => {
    if (d.logs[0]?.detail !== `Viewed record: ${entry.name}` || d.logs[0]?.user !== currentUser?.username) {
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "VIEW", detail: `Viewed record: ${entry.name}` });
      d.signals.forEach((sig) => {
        if (sig.entityId === entry.id && sig.setBy !== currentUser!.username) {
          d.notifications.push({ message: `SIGNAL: ${currentUser!.username} viewed ${entry.name}`, forUser: sig.setBy, ts: new Date().toISOString(), read: false });
          if (sig.setBy !== "admin") d.notifications.push({ message: `SIGNAL: ${currentUser!.username} viewed ${entry.name}`, forUser: "admin", ts: new Date().toISOString(), read: false });
        }
      });
    }
  });

  const requestAccess = () => {
    if (!accessReason.trim()) { toast("Please provide a reason.", "warning"); return; }
    updateDb((d) => {
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "ACCESS_REQ", detail: `Requested access to: ${entry.name} | ${accessReason}` });
      d.notifications.push({ message: `Access request from ${currentUser!.username} for "${entry.name}": ${accessReason}`, forUser: "admin", ts: new Date().toISOString(), read: false });
    });
    setShowAccess(false);
    setAccessReason("");
    toast("Access request sent to admin.", "success");
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4"><ArrowLeft size={14} /> Back</Button>

      <GlassCard className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{entry.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={entry.category as never}>{entry.category}</Badge>
              <Badge variant={entry.context as never}>{entry.context}</Badge>
              {signal && <Badge variant="signal" className="animate-pulse-glow">Signal Active</Badge>}
            </div>
          </div>
          <div className="text-right text-[12px] text-text-3 space-y-1">
            <div className="flex items-center gap-1.5 justify-end"><User size={11} /> {entry.createdBy}</div>
            <div className="flex items-center gap-1.5 justify-end"><Calendar size={11} /> {formatDate(entry.createdAt)}</div>
            <div className="flex items-center gap-1.5 justify-end"><Link2 size={11} /> {allLinked.length} connections</div>
          </div>
        </div>
      </GlassCard>

      {canViewFull ? (
        <>
          <Card className="mb-4">
            <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={12} /> Intelligence / Narrative</h4>
            <p className="text-[14px] leading-[1.8] text-text">{entry.narrative}</p>
          </Card>

          {allLinked.length > 0 && (
            <Card className="mb-4">
              <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2"><Link2 size={12} /> Linked Entities ({allLinked.length})</h4>
              <div className="flex flex-wrap gap-2">
                {allLinked.map((l) => (
                  <button key={l.id} onClick={() => router.push(`/entry/${l.id}`)}
                    className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-[13px] hover:border-accent/40 transition-all cursor-pointer", COLORS[l.category])}>
                    <Badge variant={l.category as never} className="text-[9px]">{l.category}</Badge>
                    <span className="text-text">{l.name}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {currentUser?.role === "admin" && (
            <Card className="mb-4">
              <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2"><Shield size={12} /> Admin Actions</h4>
              <div className="flex gap-2">
                {!signal ? (
                  <Button size="sm" variant="warning" onClick={() => {
                    updateDb((d) => {
                      d.signals.push({ entityId: entry.id, entityName: entry.name, setBy: currentUser.username, setAt: new Date().toISOString() });
                      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser.username, action: "SIGNAL_SET", detail: `Set signal: ${entry.name}` });
                    });
                    toast("Signal activated.", "success");
                  }}><Radio size={12} /> Set Signal</Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => {
                    updateDb((d) => {
                      d.signals = d.signals.filter((s) => s.entityId !== entry.id);
                      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser.username, action: "SIGNAL_REMOVE", detail: `Removed signal: ${entry.name}` });
                    });
                    toast("Signal removed.", "info");
                  }}><Radio size={12} /> Remove Signal</Button>
                )}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className="flex items-center gap-3 mb-4"><Lock size={18} className="text-amber" /><div><h4 className="font-semibold">Restricted Access</h4><p className="text-[13px] text-text-2">You have basic access. Request full access to see complete details.</p></div></div>
          {!showAccess ? (
            <Button size="sm" onClick={() => setShowAccess(true)}><KeyRound size={12} /> Request Full Access</Button>
          ) : (
            <div><Textarea value={accessReason} onChange={(e) => setAccessReason(e.target.value)} placeholder="Explain why you need access..." label="Reason" />
              <div className="flex gap-2 mt-3"><Button size="sm" onClick={requestAccess}>Submit Request</Button><Button size="sm" variant="secondary" onClick={() => setShowAccess(false)}>Cancel</Button></div>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
