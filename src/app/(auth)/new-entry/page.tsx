"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { detectEntities } from "@/lib/entity-detection";
import { PageHeader, Card, Badge, Button, Input, Select, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ArrowRight, ArrowLeft, Link2, Send, SkipForward, CheckCircle2, Shield, Eye, AlertTriangle, Lock } from "lucide-react";
import type { EntityCategory, ContextAssessment, DetectedEntity, SensitivityLevel } from "@/types";
import { SENSITIVITY_MIN_CLEARANCE, CLEARANCE_LABELS } from "@/types";

const CATS = [{ value: "person", label: "Person" }, { value: "company", label: "Organization" }, { value: "mobile", label: "Contact Number" }, { value: "address", label: "Address / Place" }, { value: "vehicle", label: "Vehicle" }];
const CTX = [{ value: "confirmed", label: "Confirmed" }, { value: "likely", label: "Very Likely True" }, { value: "rumor", label: "Rumors / Personal Opinion" }];
const COUNTRIES = [{ value: "", label: "Select Country" }, { value: "Romania", label: "Romania" }, { value: "Bulgaria", label: "Bulgaria" }, { value: "Hungary", label: "Hungary" }, { value: "Czech Republic", label: "Czech Republic" }, { value: "Slovakia", label: "Slovakia" }, { value: "Serbia", label: "Serbia" }, { value: "North Macedonia", label: "North Macedonia" }, { value: "Spain", label: "Spain" }, { value: "Germany", label: "Germany" }, { value: "France", label: "France" }, { value: "Belgium", label: "Belgium" }, { value: "International", label: "International" }];
const SENS_OPTIONS: { value: SensitivityLevel; label: string; icon: typeof Eye; color: string }[] = [
  { value: "standard", label: "Standard", icon: Eye, color: "text-emerald" },
  { value: "sensitive", label: "Sensitive", icon: AlertTriangle, color: "text-amber" },
  { value: "confidential", label: "Confidential", icon: Lock, color: "text-red" },
  { value: "top-secret", label: "Top Secret", icon: Shield, color: "text-purple" },
];

export default function NewEntryPage() {
  const { db, currentUser, updateDb, canView, userClearance } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [category, setCategory] = useState<EntityCategory>("person");
  const [name, setName] = useState("");
  const [context, setContext] = useState<ContextAssessment>("confirmed");
  const [country, setCountry] = useState("");
  const [tags, setTags] = useState("");
  const [narrative, setNarrative] = useState("");
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("standard");
  const [detected, setDetected] = useState<DetectedEntity[]>([]);
  const [step, setStep] = useState<"form" | "review">("form");
  const [valReason, setValReason] = useState("");
  const [valIdx, setValIdx] = useState<number | null>(null);

  const handleDetect = () => {
    if (!name.trim() || !narrative.trim()) { toast("Please fill in all fields.", "warning"); return; }
    const ents = detectEntities(narrative, db.entries);
    setDetected(ents.map((e) => ({ ...e, action: e.existing ? undefined : "skip" })));
    setStep("review");
  };

  const setAction = (idx: number, action: DetectedEntity["action"]) => setDetected((p) => p.map((d, i) => i === idx ? { ...d, action } : d));

  const handleSubmit = () => {
    const newId = db.nextId;
    const linkIds: number[] = [];
    const pvs: { targetName: string; suggestedLink: string; suggestedLinkId: number | null; reason: string }[] = [];
    detected.forEach((d) => {
      if (d.action === "link" && d.existing) linkIds.push(d.existing.id);
      else if (d.action === "validate") pvs.push({ targetName: name, suggestedLink: d.value, suggestedLinkId: d.existing?.id ?? null, reason: d.value + " - " + (valReason || "Needs admin review") });
    });
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    updateDb((d) => {
      d.entries.push({ id: newId, category, name: name.trim(), context, narrative: narrative.trim(), createdBy: currentUser!.username, createdAt: new Date().toISOString(), linkedTo: linkIds, country: country || undefined, tags: tagList.length > 0 ? tagList : undefined, sensitivity });
      linkIds.forEach((lid) => { const t = d.entries.find((e) => e.id === lid); if (t && !t.linkedTo.includes(newId)) t.linkedTo.push(newId); });
      pvs.forEach((p) => {
        const pvId = d.pendingValidations.length > 0 ? Math.max(...d.pendingValidations.map((x) => x.id)) + 1 : 1;
        d.pendingValidations.push({ id: pvId, entryId: newId, ...p, submittedBy: currentUser!.username, submittedAt: new Date().toISOString() });
        d.notifications.push({ message: `Validation request: ${p.targetName} → ${p.suggestedLink}`, forUser: "admin", ts: new Date().toISOString(), read: false });
      });
      d.logs.unshift({ ts: new Date().toISOString(), user: currentUser!.username, action: "ENTRY", detail: `Created: ${name.trim()} (${category})` });
      d.nextId = newId + 1;
    });
    toast("Entry created successfully!", "success");
    router.push(`/entry/${newId}`);
  };

  if (step === "review") {
    const withExisting = detected.filter((d) => d.existing);
    return (
      <>
        <PageHeader title="Review & Link" description="Review detected entities and decide how to handle matches" />
        <Card className="mb-4">
          <div className="flex items-center gap-3 mb-2"><h3 className="text-lg font-semibold">{name}</h3><Badge variant={category as never}>{category}</Badge><Badge variant={context as never}>{context}</Badge><Badge variant={sensitivity as never}>{sensitivity}</Badge>{country && <span className="text-[11px] text-text-3 bg-surface-3 px-2 py-0.5 rounded">{country}</span>}</div>
          <p className="text-[13px] text-text-2 leading-relaxed">{narrative}</p>
        </Card>
        {withExisting.length > 0 ? (
          <Card className="mb-4">
            <h3 className="text-sm font-semibold mb-3 text-text-2 uppercase tracking-wider">Detected Entity Matches</h3>
            <div className="space-y-3">{withExisting.map((d, idx) => {
              const ri = detected.indexOf(d);
              return (
                <div key={idx} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex items-center gap-2 mb-3"><Badge variant={d.type as never}>{d.type}</Badge><strong className="text-sm">{d.value}</strong>{d.existing && <span className="text-[11px] text-text-3">(matches: {d.existing.name})</span>}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant={d.action === "link" ? "success" : "secondary"} onClick={() => setAction(ri, "link")}><Link2 size={12} /> Link</Button>
                    <Button size="sm" variant={d.action === "validate" ? "warning" : "secondary"} onClick={() => { setAction(ri, "validate"); setValIdx(ri); }}><Send size={12} /> Validate</Button>
                    <Button size="sm" variant={d.action === "skip" ? "danger" : "secondary"} onClick={() => setAction(ri, "skip")}><SkipForward size={12} /> Skip</Button>
                  </div>
                  {d.action === "validate" && valIdx === ri && <div className="mt-3"><Textarea label="Assumptions / Basis" value={valReason} onChange={(e) => setValReason(e.target.value)} placeholder="Explain the connection..." /></div>}
                </div>);
            })}</div>
          </Card>
        ) : <Card className="mb-4"><p className="text-text-3 text-center py-4">No existing matches. This will be a standalone record.</p></Card>}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep("form")}><ArrowLeft size={14} /> Back</Button>
          <Button onClick={handleSubmit}><CheckCircle2 size={14} /> Confirm & Enter</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="New Entry" description="Add new data to the database" />
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select id="cat" label="Category" value={category} onChange={(e) => setCategory(e.target.value as EntityCategory)} options={CATS} />
          <Select id="ctx" label="Context Assessment" value={context} onChange={(e) => setContext(e.target.value as ContextAssessment)} options={CTX} />
          <Select id="country" label="Country" value={country} onChange={(e) => setCountry(e.target.value)} options={COUNTRIES} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input id="name" label="Name / Identifier" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John Smith, +40 712 345 678" />
          <Input id="tags" label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., advocacy, education, policy" />
        </div>
        {/* Sensitivity selector */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-text-2 uppercase tracking-wider mb-2">Sensitivity Level</label>
          <div className="flex gap-2">
            {SENS_OPTIONS.filter(s => userClearance >= SENSITIVITY_MIN_CLEARANCE[s.value]).map((s) => {
              const Icon = s.icon;
              const active = sensitivity === s.value;
              return (
                <button key={s.value} type="button" onClick={() => setSensitivity(s.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-200 cursor-pointer",
                    active ? `${s.color} border-current bg-current/8` : "text-text-3 border-border bg-surface-2 hover:border-border-2"
                  )}>
                  <Icon size={12} /> {s.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-text-3 mt-1.5">
            {sensitivity === "standard" && "Visible to all clearance levels"}
            {sensitivity === "sensitive" && "Requires L2+ (Field Officer) clearance"}
            {sensitivity === "confidential" && "Requires L3+ (Analyst) clearance"}
            {sensitivity === "top-secret" && "Requires L5 (Director) clearance only"}
          </p>
        </div>
        <div className="mb-6"><Textarea id="narr" label="Narrative / Intelligence" value={narrative} onChange={(e) => setNarrative(e.target.value)} placeholder="Enter data. Include names, numbers, addresses - the system will detect and suggest links." className="min-h-[180px]" /></div>
        <Button onClick={handleDetect} size="lg"><ArrowRight size={14} /> Analyze & Review Links</Button>
      </Card>
    </>
  );
}
