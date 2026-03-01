"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { PageHeader, Card, GlassCard, Badge, Button, Textarea, useToast } from "@/components/ui";
import { ArrowLeft, Link2, Radio, Shield, Lock, KeyRound, User, Calendar, FileText, MapPin, Tag, Globe, Network } from "lucide-react";
import { cn } from "@/lib/cn";

const COLORS: Record<string, string> = { person: "text-accent", company: "text-purple", mobile: "text-emerald", address: "text-amber", vehicle: "text-red" };
const BG_COLORS: Record<string, string> = { person: "bg-accent", company: "bg-purple", mobile: "bg-emerald", address: "bg-amber", vehicle: "bg-red" };

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

  // Connection depth: second-degree connections
  const secondDegree = db.entries.filter((e) =>
    !allLinked.some((l) => l.id === e.id) && e.id !== entry.id &&
    allLinked.some((l) => l.linkedTo.includes(e.id) || db.entries.find((x) => x.id === e.id)?.linkedTo.includes(l.id))
  );

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

      {/* Dossier Header */}
      <div className={cn("rounded-t-2xl p-6 text-white relative overflow-hidden", BG_COLORS[entry.category] || "bg-accent")}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-md backdrop-blur-sm">{entry.category}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-md backdrop-blur-sm">{entry.context}</span>
              {signal && <span className="text-[9px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md animate-pulse-glow backdrop-blur-sm">Signal Active</span>}
            </div>
            <h1 className="text-[22px] font-bold tracking-tight">{entry.name}</h1>
            {entry.country && (
              <div className="flex items-center gap-1.5 mt-1.5 text-white/60 text-[12px] font-medium">
                <Globe size={12} /> {entry.country}
              </div>
            )}
          </div>
          <div className="text-right text-[11px] text-white/50 space-y-1 font-medium">
            <div className="flex items-center gap-1.5 justify-end"><User size={10} /> {entry.createdBy}</div>
            <div className="flex items-center gap-1.5 justify-end"><Calendar size={10} /> {formatDate(entry.createdAt)}</div>
            <div className="flex items-center gap-1.5 justify-end"><Link2 size={10} /> {allLinked.length} connections</div>
            <div className="text-[9px] mt-1.5 bg-white/10 px-2 py-0.5 rounded-md text-white/40 font-mono">ID: {entry.id}</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="bg-surface-2/50 border-x border-border px-6 py-3 flex items-center gap-2">
          <Tag size={11} className="text-text-3" />
          {entry.tags.map((t) => (
            <span key={t} className="text-[10px] text-accent bg-accent/6 px-2 py-0.5 rounded-md font-semibold border border-accent/8">{t}</span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="rounded-b-2xl border border-t-0 border-border bg-surface mb-4">
        {canViewFull ? (
          <>
            <div className="p-6 border-b border-border">
              <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={12} /> Intelligence / Narrative</h4>
              <p className="text-[14px] leading-[1.9] text-text">{entry.narrative}</p>
            </div>

            {allLinked.length > 0 && (
              <div className="p-6 border-b border-border">
                <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2"><Link2 size={12} /> Direct Connections ({allLinked.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allLinked.map((l) => (
                    <button key={l.id} onClick={() => router.push(`/entry/${l.id}`)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 border border-border text-left hover:border-accent/40 transition-all cursor-pointer group">
                      <Badge variant={l.category as never} className="text-[9px] shrink-0">{l.category}</Badge>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium truncate group-hover:text-accent transition-colors">{l.name}</div>
                        {l.country && <div className="text-[10px] text-text-3">{l.country}</div>}
                      </div>
                      <ArrowLeft size={12} className="text-text-3 rotate-180 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {secondDegree.length > 0 && (
              <div className="p-6 border-b border-border bg-surface-2/30">
                <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2"><Network size={12} /> 2nd Degree Network ({secondDegree.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {secondDegree.slice(0, 10).map((l) => (
                    <button key={l.id} onClick={() => router.push(`/entry/${l.id}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border/60 text-[11px] hover:border-accent/40 cursor-pointer text-text-2 hover:text-accent transition-all">
                      <span className={cn("w-1.5 h-1.5 rounded-full", BG_COLORS[l.category] || "bg-accent")} />
                      {l.name}
                    </button>
                  ))}
                  {secondDegree.length > 10 && <span className="text-[11px] text-text-3 px-2 py-1">+{secondDegree.length - 10} more</span>}
                </div>
              </div>
            )}

            {currentUser?.role === "admin" && (
              <div className="p-6">
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
              </div>
            )}
          </>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4"><Lock size={18} className="text-amber" /><div><h4 className="font-semibold">Restricted Access</h4><p className="text-[13px] text-text-2">You have basic access. Request full access to see complete details.</p></div></div>
            {!showAccess ? (
              <Button size="sm" onClick={() => setShowAccess(true)}><KeyRound size={12} /> Request Full Access</Button>
            ) : (
              <div><Textarea value={accessReason} onChange={(e) => setAccessReason(e.target.value)} placeholder="Explain why you need access..." label="Reason" />
                <div className="flex gap-2 mt-3"><Button size="sm" onClick={requestAccess}>Submit Request</Button><Button size="sm" variant="secondary" onClick={() => setShowAccess(false)}>Cancel</Button></div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
