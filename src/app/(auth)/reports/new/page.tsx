"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui";
import {
  FileText, ArrowLeft, ArrowRight, Check, Plus, X, Search, Users,
  Shield, Eye, AlertTriangle, Lock, MapPin, Calendar, Tag, Trash2,
  Phone, Car, Building2, User, FileArchive, DollarSign, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { SensitivityLevel, ReportSection, Report, ReportItem, ReportItemType } from "@/types";
import { SENSITIVITY_MIN_CLEARANCE, CLEARANCE_LABELS } from "@/types";
import Link from "next/link";

const STEPS = ["Details", "Attendees", "Items", "Sections", "Review"];

const SENS_OPTIONS: { value: SensitivityLevel; label: string; color: string; icon: typeof Shield }[] = [
  { value: "standard", label: "Standard", color: "text-emerald", icon: Eye },
  { value: "sensitive", label: "Sensitive", color: "text-amber", icon: AlertTriangle },
  { value: "confidential", label: "Confidential", color: "text-red", icon: Lock },
  { value: "top-secret", label: "Top Secret", color: "text-purple", icon: Shield },
];

const ITEM_TYPES: { value: ReportItemType; label: string; icon: typeof User; placeholder: string }[] = [
  { value: "person", label: "Person", icon: User, placeholder: "Full name or alias" },
  { value: "company", label: "Organization", icon: Building2, placeholder: "Company or org name" },
  { value: "phone", label: "Phone Number", icon: Phone, placeholder: "+40 7XX XXX XXX" },
  { value: "vehicle", label: "Vehicle", icon: Car, placeholder: "Plate number or description" },
  { value: "location", label: "Location", icon: MapPin, placeholder: "Address or coordinates" },
  { value: "document", label: "Document", icon: FileArchive, placeholder: "Document ID or reference" },
  { value: "financial", label: "Financial", icon: DollarSign, placeholder: "Account, transaction, or amount" },
  { value: "other", label: "Other", icon: MoreHorizontal, placeholder: "Any other intelligence item" },
];

function emptyItem(): ReportItem {
  return { type: "person", label: "", value: "", notes: "", sensitivity: "standard" };
}

export default function NewReportPage() {
  const { db, currentUser, canView, userClearance, updateDb } = useApp();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<Report["type"]>("meeting-debrief");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");

  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [externalAttendees, setExternalAttendees] = useState<string[]>([]);
  const [externalInput, setExternalInput] = useState("");

  const [items, setItems] = useState<ReportItem[]>([emptyItem()]);

  const [sections, setSections] = useState<ReportSection[]>([
    { title: "", content: "", sensitivity: "standard" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const persons = useMemo(() => db.entries.filter((e) => e.category === "person"), [db.entries]);

  const filteredPersons = useMemo(() => {
    if (!attendeeSearch) return [];
    const q = attendeeSearch.toLowerCase();
    return persons
      .filter((p) => p.name.toLowerCase().includes(q) && !selectedAttendees.includes(p.id))
      .slice(0, 8);
  }, [attendeeSearch, persons, selectedAttendees]);

  const addAttendee = (id: number) => { setSelectedAttendees((prev) => [...prev, id]); setAttendeeSearch(""); };
  const removeAttendee = (id: number) => setSelectedAttendees((prev) => prev.filter((a) => a !== id));

  const addExternal = () => {
    if (externalInput.trim()) { setExternalAttendees((prev) => [...prev, externalInput.trim()]); setExternalInput(""); }
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof ReportItem, value: string) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addSection = () => setSections((prev) => [...prev, { title: "", content: "", sensitivity: "standard" }]);
  const removeSection = (idx: number) => setSections((prev) => prev.filter((_, i) => i !== idx));
  const updateSection = (idx: number, field: keyof ReportSection, value: string) => {
    setSections((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim().toLowerCase()]); setTagInput("");
    }
  };

  const getEntryName = (id: number) => db.entries.find((e) => e.id === id)?.name ?? `#${id}`;

  const overallSensitivity = useMemo((): SensitivityLevel => {
    const levels: SensitivityLevel[] = ["standard", "sensitive", "confidential", "top-secret"];
    let max = 0;
    for (const s of sections) { const idx = levels.indexOf(s.sensitivity); if (idx > max) max = idx; }
    for (const item of items) { const idx = levels.indexOf(item.sensitivity); if (idx > max) max = idx; }
    return levels[max];
  }, [sections, items]);

  const validItems = items.filter((item) => item.value.trim());
  const validSections = sections.filter((s) => s.title.trim() && s.content.trim());
  const canSubmit = title.trim() && (validSections.length > 0 || validItems.length > 0);

  const handleSubmit = () => {
    if (!currentUser || !canSubmit) return;
    const linkedEntities = [...new Set([...selectedAttendees, ...validItems.filter(i => i.linkedEntityId).map(i => i.linkedEntityId!)])];

    updateDb((draft) => {
      const id = draft.nextId++;
      const report: Report = {
        id, title: title.trim(), type, date,
        location: location.trim() || undefined,
        attendees: selectedAttendees, externalAttendees,
        sections: validSections,
        items: validItems.length > 0 ? validItems : undefined,
        tags, linkedEntities,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        overallSensitivity, status: "submitted",
      };
      if (!draft.reports) draft.reports = [];
      draft.reports.push(report);
      draft.logs.push({
        ts: new Date().toISOString(), user: currentUser.username,
        action: "REPORT_CREATE",
        detail: `Created report: ${title.trim()} (${type}, ${overallSensitivity}, ${validItems.length} items)`,
      });
    });

    toast("Report submitted successfully", "success");
    router.push("/reports");
  };

  const sensColor = (s: SensitivityLevel) =>
    s === "standard" ? "bg-emerald/10 text-emerald" :
    s === "sensitive" ? "bg-amber/10 text-amber" :
    s === "confidential" ? "bg-red/10 text-red" : "bg-purple/10 text-purple";

  const sensDot = (s: SensitivityLevel) =>
    s === "standard" ? "bg-emerald" : s === "sensitive" ? "bg-amber" : s === "confidential" ? "bg-red" : "bg-purple";

  return (
    <div className="max-w-[920px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-[12px] text-text-3 hover:text-accent mb-2 transition-colors">
          <ArrowLeft size={13} /> Back to Reports
        </Link>
        <h1 className="text-[20px] font-bold tracking-tight flex items-center gap-2">
          <FileText size={20} className="text-accent" /> New Intelligence Report
        </h1>
        <p className="text-[12px] text-text-2 mt-0.5">
          Submit a report with multiple intelligence items, each with individual clearance levels.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
                i === step ? "bg-accent text-white" :
                i < step ? "bg-emerald/10 text-emerald" : "bg-surface-3 text-text-3"
              )}>
              {i < step ? <Check size={11} /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[8px]">{i + 1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="w-5 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 0: Details */}
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-5 space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider mb-1">Report Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Brussels Strategy Meeting — Q1 Planning"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider mb-1">Report Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as Report["type"])}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-[13px] outline-none focus:border-accent cursor-pointer">
                  <option value="meeting-debrief">Meeting Debrief</option>
                  <option value="field-report">Field Report</option>
                  <option value="analysis">Analysis</option>
                  <option value="intelligence-brief">Intelligence Brief</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-[13px] outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider mb-1">Location (optional)</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Avenue des Jardins 44, Brussels"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Attendees */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-5 space-y-3">
            <h3 className="text-[13px] font-semibold flex items-center gap-2">
              <Users size={15} className="text-accent" /> Meeting Attendees
            </h3>
            <div className="relative">
              <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider mb-1">Search Entities</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
                <input value={attendeeSearch} onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Search persons in database..."
                  className="w-full pl-8 pr-3 py-2 bg-surface-2 border border-border rounded-lg text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
              {filteredPersons.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-[180px] overflow-y-auto">
                  {filteredPersons.map((p) => (
                    <button key={p.id} onClick={() => addAttendee(p.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 text-left text-[12px] cursor-pointer transition-colors">
                      <Users size={13} className="text-accent" />
                      <span className="font-medium">{p.name}</span>
                      {p.country && <span className="text-text-3 text-[10px] ml-auto">{p.country}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedAttendees.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">Selected ({selectedAttendees.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedAttendees.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/8 text-accent text-[11px] font-medium rounded-md">
                      {getEntryName(id)}
                      <button onClick={() => removeAttendee(id)} className="hover:text-red transition-colors cursor-pointer"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider mb-1">External Attendees</label>
              <div className="flex gap-2">
                <input value={externalInput} onChange={(e) => setExternalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExternal())}
                  placeholder="e.g., Maria van der Berg (DG Justice)"
                  className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-[13px] outline-none focus:border-accent" />
                <button onClick={addExternal}
                  className="px-2.5 py-2 bg-surface-3 text-text-2 rounded-lg text-sm hover:bg-surface-2 transition-all cursor-pointer">
                  <Plus size={15} />
                </button>
              </div>
              {externalAttendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {externalAttendees.map((name, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-3 text-text-2 text-[11px] font-medium rounded-md">
                      {name}
                      <button onClick={() => setExternalAttendees((prev) => prev.filter((_, j) => j !== i))}
                        className="hover:text-red transition-colors cursor-pointer"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Intelligence Items */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold flex items-center gap-2">
                  <Shield size={15} className="text-accent" /> Intelligence Items
                </h3>
                <p className="text-[11px] text-text-3 mt-0.5">
                  Add persons, phone numbers, vehicles, locations, and other items. Each can have its own clearance level.
                </p>
              </div>
              <button onClick={addItem}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-accent bg-accent/8 rounded-lg hover:bg-accent/15 transition-all cursor-pointer shrink-0">
                <Plus size={13} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const typeConfig = ITEM_TYPES.find((t) => t.value === item.type)!;
                const TypeIcon = typeConfig.icon;
                return (
                  <div key={idx} className="rounded-lg border border-border/60 bg-white p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0",
                          item.type === "person" ? "gradient-blue" :
                          item.type === "company" ? "gradient-purple" :
                          item.type === "phone" ? "gradient-teal" :
                          item.type === "vehicle" ? "gradient-orange" :
                          item.type === "location" ? "gradient-green" :
                          "bg-text-3"
                        )}>
                          <TypeIcon size={13} />
                        </div>
                        <span className="text-[11px] font-bold text-text-3 uppercase">Item {idx + 1}</span>
                        <span className={cn("text-[9px] font-bold uppercase px-1.5 py-px rounded", sensColor(item.sensitivity))}>
                          {item.sensitivity}
                        </span>
                      </div>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)}
                          className="text-text-3 hover:text-red transition-colors cursor-pointer p-1"><Trash2 size={13} /></button>
                      )}
                    </div>

                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold text-text-3 uppercase tracking-wider mb-0.5">Type</label>
                        <select value={item.type} onChange={(e) => updateItem(idx, "type", e.target.value)}
                          className="w-full px-2 py-1.5 bg-surface-2 border border-border rounded-md text-[12px] outline-none focus:border-accent cursor-pointer">
                          {ITEM_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-text-3 uppercase tracking-wider mb-0.5">Value *</label>
                        <input value={item.value} onChange={(e) => updateItem(idx, "value", e.target.value)}
                          placeholder={typeConfig.placeholder}
                          className="w-full px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[12px] outline-none focus:border-accent" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold text-text-3 uppercase tracking-wider mb-0.5">Label / Alias</label>
                        <input value={item.label} onChange={(e) => updateItem(idx, "label", e.target.value)}
                          placeholder="Optional label or codename"
                          className="w-full px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[12px] outline-none focus:border-accent" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-text-3 uppercase tracking-wider mb-0.5">Notes</label>
                        <input value={item.notes} onChange={(e) => updateItem(idx, "notes", e.target.value)}
                          placeholder="Context or additional details"
                          className="w-full px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[12px] outline-none focus:border-accent" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-text-3 uppercase tracking-wider mb-1">Clearance Level</label>
                      <div className="flex gap-1.5">
                        {SENS_OPTIONS.filter((o) => canView(o.value)).map((opt) => {
                          const Icon = opt.icon;
                          const active = item.sensitivity === opt.value;
                          return (
                            <button key={opt.value} onClick={() => updateItem(idx, "sensitivity", opt.value)}
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer",
                                active
                                  ? `${opt.color} bg-current/8 border-current/20`
                                  : "text-text-3 bg-surface-2 border-border hover:border-border-2"
                              )}>
                              <Icon size={11} />
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={addItem}
              className="w-full py-2.5 border-2 border-dashed border-border/60 rounded-lg text-[12px] font-medium text-text-3 hover:border-accent/30 hover:text-accent transition-all cursor-pointer flex items-center justify-center gap-1.5">
              <Plus size={14} /> Add Another Item
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sections */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold flex items-center gap-2">
                <FileText size={15} className="text-accent" /> Report Sections
              </h3>
              <button onClick={addSection}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-accent bg-accent/8 rounded-lg hover:bg-accent/15 transition-all cursor-pointer">
                <Plus size={13} /> Add Section
              </button>
            </div>
            <p className="text-[11px] text-text-3 -mt-1">
              Each section can have a different sensitivity level. Only users with sufficient clearance will see restricted sections.
            </p>

            {sections.map((section, idx) => (
              <div key={idx} className="rounded-lg border border-border/60 p-3.5 space-y-2.5 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-3 uppercase">Section {idx + 1}</span>
                  {sections.length > 1 && (
                    <button onClick={() => removeSection(idx)}
                      className="text-text-3 hover:text-red transition-colors cursor-pointer"><Trash2 size={13} /></button>
                  )}
                </div>
                <input value={section.title} onChange={(e) => updateSection(idx, "title", e.target.value)}
                  placeholder="Section title"
                  className="w-full px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[12px] outline-none focus:border-accent" />
                <textarea value={section.content} onChange={(e) => updateSection(idx, "content", e.target.value)}
                  placeholder="Write section content..."
                  rows={3}
                  className="w-full px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[12px] outline-none focus:border-accent resize-y" />
                <div>
                  <label className="block text-[9px] font-semibold text-text-3 uppercase tracking-wider mb-1">Sensitivity Level</label>
                  <div className="flex gap-1.5">
                    {SENS_OPTIONS.filter((o) => canView(o.value)).map((opt) => {
                      const Icon = opt.icon;
                      const active = section.sensitivity === opt.value;
                      return (
                        <button key={opt.value} onClick={() => updateSection(idx, "sensitivity", opt.value)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer",
                            active
                              ? `${opt.color} bg-current/8 border-current/20`
                              : "text-text-3 bg-surface-2 border-border hover:border-border-2"
                          )}>
                          <Icon size={11} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Tags */}
            <div className="pt-1">
              <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider mb-1">
                <Tag size={11} className="inline mr-1" /> Tags
              </label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 px-2.5 py-1.5 bg-surface-2 border border-border rounded-md text-[12px] outline-none focus:border-accent" />
                <button onClick={addTag}
                  className="px-2.5 py-1.5 bg-surface-3 text-text-2 rounded-md text-sm hover:bg-surface-2 transition-all cursor-pointer">
                  <Plus size={13} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-3 text-text-2 text-[10px] font-medium rounded-md">
                      {t}
                      <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                        className="hover:text-red transition-colors cursor-pointer"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-5 space-y-4">
            <h3 className="text-[13px] font-semibold flex items-center gap-2">
              <Check size={15} className="text-emerald" /> Review & Submit
            </h3>

            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div><span className="text-text-3 text-[10px] uppercase font-semibold block mb-0.5">Title</span><span className="font-medium">{title || "—"}</span></div>
              <div><span className="text-text-3 text-[10px] uppercase font-semibold block mb-0.5">Type</span><span className="font-medium capitalize">{type.replace("-", " ")}</span></div>
              <div><span className="text-text-3 text-[10px] uppercase font-semibold block mb-0.5">Date</span><span className="font-medium">{date}</span></div>
              <div><span className="text-text-3 text-[10px] uppercase font-semibold block mb-0.5">Location</span><span className="font-medium">{location || "—"}</span></div>
            </div>

            <div>
              <span className="text-text-3 text-[10px] uppercase font-semibold block mb-1">Overall Sensitivity</span>
              <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase", sensColor(overallSensitivity))}>
                <Shield size={11} /> {overallSensitivity}
              </span>
            </div>

            {(selectedAttendees.length + externalAttendees.length > 0) && (
              <div>
                <span className="text-text-3 text-[10px] uppercase font-semibold block mb-1">Attendees ({selectedAttendees.length + externalAttendees.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAttendees.map((id) => (
                    <span key={id} className="px-2 py-0.5 bg-accent/8 text-accent text-[10px] font-medium rounded-md">{getEntryName(id)}</span>
                  ))}
                  {externalAttendees.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 bg-surface-3 text-text-2 text-[10px] font-medium rounded-md">{n}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Items Review */}
            {validItems.length > 0 && (
              <div>
                <span className="text-text-3 text-[10px] uppercase font-semibold block mb-1.5">Intelligence Items ({validItems.length})</span>
                <div className="space-y-1.5">
                  {validItems.map((item, i) => {
                    const typeConfig = ITEM_TYPES.find((t) => t.value === item.type)!;
                    const TypeIcon = typeConfig.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 text-[11px] bg-surface-2 rounded-md px-2.5 py-2">
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white shrink-0",
                          item.type === "person" ? "gradient-blue" :
                          item.type === "company" ? "gradient-purple" :
                          item.type === "phone" ? "gradient-teal" :
                          item.type === "vehicle" ? "gradient-orange" :
                          item.type === "location" ? "gradient-green" :
                          "bg-text-3"
                        )}>
                          <TypeIcon size={10} />
                        </div>
                        <span className="font-semibold text-text">{item.value}</span>
                        {item.label && <span className="text-text-3">({item.label})</span>}
                        <span className="ml-auto flex items-center gap-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full", sensDot(item.sensitivity))} />
                          <span className="text-[9px] font-bold text-text-3 uppercase">{item.sensitivity}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {validSections.length > 0 && (
              <div>
                <span className="text-text-3 text-[10px] uppercase font-semibold block mb-1">Sections ({validSections.length})</span>
                <div className="space-y-1">
                  {validSections.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className={cn("w-1.5 h-1.5 rounded-full", sensDot(s.sensitivity))} />
                      <span className="font-medium">{s.title}</span>
                      <span className="text-text-3 uppercase text-[9px] font-bold">{s.sensitivity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <span className="text-text-3 text-[10px] uppercase font-semibold block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-surface-3 text-text-2 text-[10px] font-medium rounded-md">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5 pb-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-text-2 bg-surface-2 border border-border rounded-lg hover:bg-surface-3 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} /> Previous
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-white bg-accent rounded-lg hover:bg-accent-hover transition-all shadow-sm cursor-pointer"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-emerald rounded-lg hover:bg-emerald/90 transition-all shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Check size={14} /> Submit Report
          </button>
        )}
      </div>
    </div>
  );
}
