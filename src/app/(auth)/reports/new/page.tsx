"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui";
import {
  FileText, ArrowLeft, ArrowRight, Check, Plus, X, Search, Users,
  Shield, Eye, AlertTriangle, Lock, MapPin, Calendar, Tag, Trash2
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { SensitivityLevel, ReportSection, Report } from "@/types";
import { SENSITIVITY_MIN_CLEARANCE, CLEARANCE_LABELS } from "@/types";
import Link from "next/link";

const STEPS = ["Details", "Attendees", "Sections", "Review"];

const SENS_OPTIONS: { value: SensitivityLevel; label: string; color: string; icon: typeof Shield }[] = [
  { value: "standard", label: "Standard", color: "text-emerald", icon: Eye },
  { value: "sensitive", label: "Sensitive", color: "text-amber", icon: AlertTriangle },
  { value: "confidential", label: "Confidential", color: "text-red", icon: Lock },
  { value: "top-secret", label: "Top Secret", color: "text-purple", icon: Shield },
];

export default function NewReportPage() {
  const { db, currentUser, canView, userClearance, updateDb } = useApp();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);

  // Step 1: Details
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Report["type"]>("meeting-debrief");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");

  // Step 2: Attendees
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [externalAttendees, setExternalAttendees] = useState<string[]>([]);
  const [externalInput, setExternalInput] = useState("");

  // Step 3: Sections
  const [sections, setSections] = useState<ReportSection[]>([
    { title: "", content: "", sensitivity: "standard" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const persons = useMemo(() => {
    return db.entries.filter((e) => e.category === "person");
  }, [db.entries]);

  const filteredPersons = useMemo(() => {
    if (!attendeeSearch) return [];
    const q = attendeeSearch.toLowerCase();
    return persons
      .filter((p) => p.name.toLowerCase().includes(q) && !selectedAttendees.includes(p.id))
      .slice(0, 8);
  }, [attendeeSearch, persons, selectedAttendees]);

  const addAttendee = (id: number) => {
    setSelectedAttendees((prev) => [...prev, id]);
    setAttendeeSearch("");
  };
  const removeAttendee = (id: number) => setSelectedAttendees((prev) => prev.filter((a) => a !== id));

  const addExternal = () => {
    if (externalInput.trim()) {
      setExternalAttendees((prev) => [...prev, externalInput.trim()]);
      setExternalInput("");
    }
  };

  const addSection = () => setSections((prev) => [...prev, { title: "", content: "", sensitivity: "standard" }]);
  const removeSection = (idx: number) => setSections((prev) => prev.filter((_, i) => i !== idx));
  const updateSection = (idx: number, field: keyof ReportSection, value: string) => {
    setSections((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const getEntryName = (id: number) => db.entries.find((e) => e.id === id)?.name ?? `#${id}`;

  const overallSensitivity = useMemo((): SensitivityLevel => {
    const levels: SensitivityLevel[] = ["standard", "sensitive", "confidential", "top-secret"];
    let max = 0;
    for (const s of sections) {
      const idx = levels.indexOf(s.sensitivity);
      if (idx > max) max = idx;
    }
    return levels[max];
  }, [sections]);

  const canSubmit = title.trim() && sections.some((s) => s.title.trim() && s.content.trim());

  const handleSubmit = () => {
    if (!currentUser || !canSubmit) return;
    const validSections = sections.filter((s) => s.title.trim() && s.content.trim());
    const linkedEntities = [...new Set([...selectedAttendees])];

    updateDb((draft) => {
      const id = draft.nextId++;
      const report: Report = {
        id,
        title: title.trim(),
        type,
        date,
        location: location.trim() || undefined,
        attendees: selectedAttendees,
        externalAttendees,
        sections: validSections,
        tags,
        linkedEntities,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        overallSensitivity,
        status: "submitted",
      };
      if (!draft.reports) draft.reports = [];
      draft.reports.push(report);
      draft.logs.push({
        ts: new Date().toISOString(),
        user: currentUser.username,
        action: "REPORT_CREATE",
        detail: `Created report: ${title.trim()} (${type}, ${overallSensitivity})`,
      });
    });

    toast("Report submitted successfully", "success");
    router.push("/reports");
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link href="/reports" className="inline-flex items-center gap-1.5 text-[13px] text-text-3 hover:text-accent mb-3 transition-colors">
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2">
          <FileText size={22} className="text-accent" />
          New Intelligence Report
        </h1>
        <p className="text-[13px] text-text-2 mt-0.5">
          Submit a report following a meeting, field visit, or analysis session.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer",
                i === step ? "bg-accent text-white" :
                  i < step ? "bg-emerald/10 text-emerald" : "bg-surface-3 text-text-3"
              )}
            >
              {i < step ? <Check size={12} /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[9px]">{i + 1}</span>}
              {s}
            </button>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-1.5">Report Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Brussels Strategy Meeting — Q1 Planning"
                className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-1.5">Report Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as Report["type"])}
                  className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer">
                  <option value="meeting-debrief">Meeting Debrief</option>
                  <option value="field-report">Field Report</option>
                  <option value="analysis">Analysis</option>
                  <option value="intelligence-brief">Intelligence Brief</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-1.5">Location (optional)</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Avenue des Jardins 44, Brussels"
                className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Attendees */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <Users size={16} className="text-accent" />
              Meeting Attendees
            </h3>

            {/* Entity Search */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-1.5">Search Entities</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
                <input value={attendeeSearch} onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Search persons in database..."
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
              </div>
              {filteredPersons.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-[200px] overflow-y-auto">
                  {filteredPersons.map((p) => (
                    <button key={p.id} onClick={() => addAttendee(p.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-2 text-left text-sm cursor-pointer transition-colors">
                      <Users size={14} className="text-accent" />
                      <span className="font-medium">{p.name}</span>
                      {p.country && <span className="text-text-3 text-[11px] ml-auto">{p.country}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Attendees */}
            {selectedAttendees.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-text-3 uppercase tracking-wider">Selected ({selectedAttendees.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedAttendees.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/8 text-accent text-[11px] font-medium rounded-lg">
                      {getEntryName(id)}
                      <button onClick={() => removeAttendee(id)} className="hover:text-red transition-colors cursor-pointer"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Attendees */}
            <div>
              <label className="block text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-1.5">External Attendees (not in database)</label>
              <div className="flex gap-2">
                <input value={externalInput} onChange={(e) => setExternalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExternal())}
                  placeholder="e.g., Maria van der Berg (DG Justice)"
                  className="flex-1 px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" />
                <button onClick={addExternal}
                  className="px-3 py-2 bg-surface-3 text-text-2 rounded-xl text-sm font-medium hover:bg-surface-2 transition-all cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>
              {externalAttendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {externalAttendees.map((name, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-3 text-text-2 text-[11px] font-medium rounded-lg">
                      {name}
                      <button onClick={() => setExternalAttendees((prev) => prev.filter((_, j) => j !== i))}
                        className="hover:text-red transition-colors cursor-pointer"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Sections */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold flex items-center gap-2">
                <FileText size={16} className="text-accent" />
                Report Sections
              </h3>
              <button onClick={addSection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-accent bg-accent/8 rounded-lg hover:bg-accent/15 transition-all cursor-pointer">
                <Plus size={14} /> Add Section
              </button>
            </div>

            <p className="text-[12px] text-text-3 -mt-2">
              Each section can have a different sensitivity level. Only users with sufficient clearance will see restricted sections.
            </p>

            {sections.map((section, idx) => {
              const sensOpt = SENS_OPTIONS.find((o) => o.value === section.sensitivity)!;
              const SIcon = sensOpt.icon;
              return (
                <div key={idx} className="rounded-xl border border-border/60 p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-3 uppercase">Section {idx + 1}</span>
                    {sections.length > 1 && (
                      <button onClick={() => removeSection(idx)}
                        className="text-text-3 hover:text-red transition-colors cursor-pointer"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <input value={section.title} onChange={(e) => updateSection(idx, "title", e.target.value)}
                    placeholder="Section title"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm outline-none focus:border-accent" />
                  <textarea value={section.content} onChange={(e) => updateSection(idx, "content", e.target.value)}
                    placeholder="Write section content..."
                    rows={4}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm outline-none focus:border-accent resize-y" />
                  <div>
                    <label className="block text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-1">Sensitivity Level</label>
                    <div className="flex gap-2">
                      {SENS_OPTIONS.filter((o) => canView(o.value)).map((opt) => {
                        const Icon = opt.icon;
                        const active = section.sensitivity === opt.value;
                        return (
                          <button key={opt.value} onClick={() => updateSection(idx, "sensitivity", opt.value)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer",
                              active
                                ? `${opt.color} bg-current/8 border-current/20`
                                : "text-text-3 bg-surface-2 border-border hover:border-border-2"
                            )}>
                            <Icon size={12} />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Tags */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-text-2 uppercase tracking-wider mb-1.5">
                <Tag size={12} className="inline mr-1" /> Tags
              </label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm outline-none focus:border-accent" />
                <button onClick={addTag}
                  className="px-3 py-2 bg-surface-3 text-text-2 rounded-lg text-sm hover:bg-surface-2 transition-all cursor-pointer">
                  <Plus size={14} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-3 text-text-2 text-[11px] font-medium rounded-md">
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
      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-border/80 bg-surface p-6 space-y-4">
            <h3 className="text-[14px] font-semibold flex items-center gap-2">
              <Check size={16} className="text-emerald" />
              Review & Submit
            </h3>

            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div><span className="text-text-3 text-[11px] uppercase font-semibold block mb-0.5">Title</span><span className="font-medium">{title || "—"}</span></div>
              <div><span className="text-text-3 text-[11px] uppercase font-semibold block mb-0.5">Type</span><span className="font-medium capitalize">{type.replace("-", " ")}</span></div>
              <div><span className="text-text-3 text-[11px] uppercase font-semibold block mb-0.5">Date</span><span className="font-medium">{date}</span></div>
              <div><span className="text-text-3 text-[11px] uppercase font-semibold block mb-0.5">Location</span><span className="font-medium">{location || "—"}</span></div>
            </div>

            <div>
              <span className="text-text-3 text-[11px] uppercase font-semibold block mb-1">Overall Sensitivity</span>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold uppercase",
                overallSensitivity === "standard" ? "bg-emerald/10 text-emerald" :
                  overallSensitivity === "sensitive" ? "bg-amber/10 text-amber" :
                    overallSensitivity === "confidential" ? "bg-red/10 text-red" : "bg-purple/10 text-purple"
              )}>
                <Shield size={12} />
                {overallSensitivity}
              </span>
            </div>

            {selectedAttendees.length + externalAttendees.length > 0 && (
              <div>
                <span className="text-text-3 text-[11px] uppercase font-semibold block mb-1">Attendees ({selectedAttendees.length + externalAttendees.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAttendees.map((id) => (
                    <span key={id} className="px-2 py-0.5 bg-accent/8 text-accent text-[11px] font-medium rounded-md">{getEntryName(id)}</span>
                  ))}
                  {externalAttendees.map((n, i) => (
                    <span key={i} className="px-2 py-0.5 bg-surface-3 text-text-2 text-[11px] font-medium rounded-md">{n}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-text-3 text-[11px] uppercase font-semibold block mb-1">
                Sections ({sections.filter((s) => s.title && s.content).length})
              </span>
              <div className="space-y-1">
                {sections.filter((s) => s.title && s.content).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      s.sensitivity === "standard" ? "bg-emerald" :
                        s.sensitivity === "sensitive" ? "bg-amber" :
                          s.sensitivity === "confidential" ? "bg-red" : "bg-purple"
                    )} />
                    <span className="font-medium">{s.title}</span>
                    <span className="text-text-3 uppercase text-[9px] font-bold">{s.sensitivity}</span>
                  </div>
                ))}
              </div>
            </div>

            {tags.length > 0 && (
              <div>
                <span className="text-text-3 text-[11px] uppercase font-semibold block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-surface-3 text-text-2 text-[11px] font-medium rounded-md">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-text-2 bg-surface-2 border border-border rounded-xl hover:bg-surface-3 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft size={15} />
          Previous
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-white bg-accent rounded-xl hover:bg-accent-hover transition-all shadow-sm cursor-pointer"
          >
            Next
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold text-white bg-emerald rounded-xl hover:bg-emerald/90 transition-all shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Check size={15} />
            Submit Report
          </button>
        )}
      </div>
    </div>
  );
}
