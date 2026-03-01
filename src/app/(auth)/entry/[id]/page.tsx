"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { useState, useMemo } from "react";
import { PageHeader, Card, GlassCard, Badge, Button, Textarea, useToast } from "@/components/ui";
import {
  ArrowLeft, Link2, Radio, Shield, Lock, KeyRound, User, Calendar, FileText, MapPin, Tag, Globe, Network,
  Brain, Eye, AlertTriangle, Check, X, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/cn";
import { SENSITIVITY_MIN_CLEARANCE, CLEARANCE_LABELS } from "@/types";
import type { SensitivityLevel, ClearanceLevel } from "@/types";
import Link from "next/link";

const COLORS: Record<string, string> = { person: "text-accent", company: "text-purple", mobile: "text-emerald", address: "text-amber", vehicle: "text-red" };
const BG_COLORS: Record<string, string> = { person: "bg-accent", company: "bg-purple", mobile: "bg-emerald", address: "bg-amber", vehicle: "bg-red" };

const SENS_BADGE: Record<SensitivityLevel, { bg: string; text: string; border: string }> = {
  standard: { bg: "bg-emerald/15", text: "text-emerald", border: "border-emerald/20" },
  sensitive: { bg: "bg-amber/15", text: "text-amber", border: "border-amber/20" },
  confidential: { bg: "bg-red/15", text: "text-red", border: "border-red/20" },
  "top-secret": { bg: "bg-purple/15", text: "text-purple", border: "border-purple/20" },
};

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { db, currentUser, updateDb, canView, userClearance } = useApp();
  const { toast } = useToast();
  const [accessReason, setAccessReason] = useState("");
  const [showAccess, setShowAccess] = useState(false);

  const id = Number(params.id);
  const entry = db.entries.find((e) => e.id === id);

  if (!entry) return (
    <Card><h3 className="text-lg font-semibold mb-2">Entry Not Found</h3><p className="text-text-2">The requested entry does not exist.</p>
      <Button variant="secondary" onClick={() => router.back()} className="mt-4"><ArrowLeft size={14} /> Go Back</Button></Card>
  );

  const sensitivity: SensitivityLevel = entry.sensitivity ?? "standard";
  const canViewSensitivity = canView(sensitivity);
  const isBasic = currentUser?.access === "basic" && currentUser?.role !== "admin";
  const canViewFull = canViewSensitivity && (!isBasic || entry.createdBy === currentUser?.username);
  const linkedEntries = db.entries.filter((e) => entry.linkedTo.includes(e.id));
  const reverseLinked = db.entries.filter((e) => e.linkedTo.includes(entry.id) && !entry.linkedTo.includes(e.id));
  const allLinked = [...linkedEntries, ...reverseLinked];
  const signal = db.signals.find((s) => s.entityId === entry.id);

  const secondDegree = db.entries.filter((e) =>
    !allLinked.some((l) => l.id === e.id) && e.id !== entry.id &&
    allLinked.some((l) => l.linkedTo.includes(e.id) || db.entries.find((x) => x.id === e.id)?.linkedTo.includes(l.id))
  );

  // Reports mentioning this entity
  const relatedReports = useMemo(() =>
    (db.reports ?? []).filter((r) =>
      canView(r.overallSensitivity) &&
      (r.linkedEntities.includes(entry.id) || r.attendees.includes(entry.id))
    ),
    [db.reports, entry.id, canView] // eslint-disable-line
  );

  // Inferred connections involving this entity
  const relatedInferences = useMemo(() =>
    (db.inferredConnections ?? []).filter((c) =>
      (c.entityA === entry.id || c.entityB === entry.id) && c.status !== "dismissed"
    ),
    [db.inferredConnections, entry.id]
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

  const handleConfirmInference = (connId: number) => {
    const conn = (db.inferredConnections ?? []).find((c) => c.id === connId);
    if (!conn) return;
    updateDb((d) => {
      const c = (d.inferredConnections ?? []).find((x) => x.id === connId);
      if (c) c.status = "confirmed";
      const entryA = d.entries.find((e) => e.id === conn.entityA);
      const entryB = d.entries.find((e) => e.id === conn.entityB);
      if (entryA && !entryA.linkedTo.includes(conn.entityB)) entryA.linkedTo.push(conn.entityB);
      if (entryB && !entryB.linkedTo.includes(conn.entityA)) entryB.linkedTo.push(conn.entityA);
      d.logs.push({ ts: new Date().toISOString(), user: currentUser?.username ?? "system", action: "INFERENCE_CONFIRM",
        detail: `Confirmed: ${db.entries.find((e) => e.id === conn.entityA)?.name} ↔ ${db.entries.find((e) => e.id === conn.entityB)?.name}` });
    });
    toast("Connection confirmed and linked", "success");
  };

  const sensStyle = SENS_BADGE[sensitivity];

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4"><ArrowLeft size={14} /> Back</Button>

      {/* Dossier Header */}
      <div className={cn("rounded-t-2xl p-6 text-white relative overflow-hidden", BG_COLORS[entry.category] || "bg-accent")}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-md backdrop-blur-sm">{entry.category}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-md backdrop-blur-sm">{entry.context}</span>
              <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm border",
                sensitivity === "standard" ? "bg-emerald/20 border-emerald/30" :
                sensitivity === "sensitive" ? "bg-amber/20 border-amber/30" :
                sensitivity === "confidential" ? "bg-red/20 border-red/30" :
                "bg-purple/20 border-purple/30"
              )}>{sensitivity}</span>
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
            <div className="flex items-center gap-1.5 justify-end"><Shield size={10} /> L{SENSITIVITY_MIN_CLEARANCE[sensitivity]}+ required</div>
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
        {!canViewSensitivity ? (
          /* Clearance blocked */
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock size={18} className="text-red" />
              <div>
                <h4 className="font-semibold">Clearance Restricted</h4>
                <p className="text-[13px] text-text-2">
                  This entry is classified as <span className={cn("font-bold uppercase", sensStyle.text)}>{sensitivity}</span>.
                  You need <span className="font-semibold">{CLEARANCE_LABELS[SENSITIVITY_MIN_CLEARANCE[sensitivity]]} (L{SENSITIVITY_MIN_CLEARANCE[sensitivity]})</span> clearance.
                  Your current clearance: <span className="font-semibold">{CLEARANCE_LABELS[userClearance]} (L{userClearance})</span>.
                </p>
              </div>
            </div>
          </div>
        ) : canViewFull ? (
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

            {/* AI Inferred Connections */}
            {relatedInferences.length > 0 && (
              <div className="p-6 border-b border-border bg-purple/[0.02]">
                <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Brain size={12} className="text-purple" /> AI-Inferred Connections ({relatedInferences.length})
                </h4>
                <div className="space-y-2">
                  {relatedInferences.map((conn) => {
                    const otherId = conn.entityA === entry.id ? conn.entityB : conn.entityA;
                    const other = db.entries.find((e) => e.id === otherId);
                    if (!other) return null;
                    const confColor = conn.confidence >= 80 ? "text-emerald" : conn.confidence >= 60 ? "text-amber" : "text-red";
                    return (
                      <div key={conn.id} className="flex items-center gap-3 p-3 rounded-xl border border-purple/15 bg-white hover:border-purple/30 transition-all">
                        <button onClick={() => router.push(`/entry/${otherId}`)}
                          className="flex-1 flex items-center gap-2 text-left group cursor-pointer min-w-0">
                          <Badge variant={other.category as never} className="text-[9px] shrink-0">{other.category}</Badge>
                          <span className="text-[13px] font-medium group-hover:text-purple transition-colors truncate">{other.name}</span>
                        </button>
                        <span className={cn("text-[11px] font-bold tabular-nums", confColor)}>{conn.confidence}%</span>
                        <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                          conn.status === "confirmed" ? "bg-emerald/10 text-emerald" : "bg-amber/10 text-amber"
                        )}>{conn.status}</span>
                        {conn.status === "new" && (
                          <button onClick={() => handleConfirmInference(conn.id)}
                            className="p-1 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-colors cursor-pointer" title="Confirm & Link">
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Link href="/intelligence"
                  className="inline-flex items-center gap-1 mt-2 text-[11px] text-purple font-medium hover:underline">
                  View all inferences <ChevronRight size={12} />
                </Link>
              </div>
            )}

            {/* Related Reports */}
            {relatedReports.length > 0 && (
              <div className="p-6 border-b border-border bg-accent/[0.02]">
                <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={12} className="text-accent" /> Referenced in Reports ({relatedReports.length})
                </h4>
                <div className="space-y-2">
                  {relatedReports.map((report) => {
                    const sensStyle2 = SENS_BADGE[report.overallSensitivity];
                    return (
                      <Link key={report.id} href="/reports"
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-white hover:border-accent/30 transition-all group">
                        <FileText size={14} className="text-accent shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold group-hover:text-accent transition-colors truncate">{report.title}</div>
                          <div className="text-[10px] text-text-3 mt-0.5">
                            {new Date(report.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {" · "}{report.type.replace("-", " ")}
                            {" · by "}{report.createdBy}
                          </div>
                        </div>
                        <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border", sensStyle2.bg, sensStyle2.text, sensStyle2.border)}>
                          {report.overallSensitivity}
                        </span>
                      </Link>
                    );
                  })}
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
