"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import {
  FileText, Plus, Shield, Eye, EyeOff, Calendar, MapPin, Users,
  Filter, Lock, ChevronDown, ChevronRight, Tag, AlertTriangle, CheckCircle2,
  Clock, Archive, Search, Phone, Car, Building2, User, FileArchive, DollarSign, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Report, SensitivityLevel, ReportItemType } from "@/types";
import { SENSITIVITY_MIN_CLEARANCE, CLEARANCE_LABELS } from "@/types";

const ITEM_TYPE_CONFIG: Record<ReportItemType, { label: string; icon: typeof User; gradient: string }> = {
  person: { label: "Person", icon: User, gradient: "gradient-blue" },
  company: { label: "Organization", icon: Building2, gradient: "gradient-purple" },
  phone: { label: "Phone", icon: Phone, gradient: "gradient-teal" },
  vehicle: { label: "Vehicle", icon: Car, gradient: "gradient-orange" },
  location: { label: "Location", icon: MapPin, gradient: "gradient-green" },
  document: { label: "Document", icon: FileArchive, gradient: "bg-text-3" },
  financial: { label: "Financial", icon: DollarSign, gradient: "bg-text-3" },
  other: { label: "Other", icon: MoreHorizontal, gradient: "bg-text-3" },
};

const SENS_STYLE: Record<SensitivityLevel, { bg: string; text: string; border: string; icon: typeof Shield }> = {
  standard: { bg: "bg-emerald/8", text: "text-emerald", border: "border-emerald/15", icon: Eye },
  sensitive: { bg: "bg-amber/8", text: "text-amber", border: "border-amber/15", icon: AlertTriangle },
  confidential: { bg: "bg-red/8", text: "text-red", border: "border-red/15", icon: Lock },
  "top-secret": { bg: "bg-purple/8", text: "text-purple", border: "border-purple/15", icon: Shield },
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-surface-3", text: "text-text-3" },
  submitted: { bg: "bg-amber/8", text: "text-amber" },
  reviewed: { bg: "bg-emerald/8", text: "text-emerald" },
  archived: { bg: "bg-surface-3", text: "text-text-3" },
};

const TYPE_LABELS: Record<string, string> = {
  "meeting-debrief": "Meeting Debrief",
  "field-report": "Field Report",
  "analysis": "Analysis",
  "intelligence-brief": "Intelligence Brief",
};

export default function ReportsPage() {
  const { db, currentUser, canView, userClearance, updateDb } = useApp();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSensitivity, setFilterSensitivity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const reports = useMemo(() => {
    let list = (db.reports ?? []).filter((r) => canView(r.overallSensitivity));
    if (filterType !== "all") list = list.filter((r) => r.type === filterType);
    if (filterSensitivity !== "all") list = list.filter((r) => r.overallSensitivity === filterSensitivity);
    if (filterStatus !== "all") list = list.filter((r) => r.status === filterStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.sections.some((s) => s.title.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [db.reports, filterType, filterSensitivity, filterStatus, searchQuery, canView]);

  const getEntryName = (id: number) => db.entries.find((e) => e.id === id)?.name ?? `#${id}`;

  const visibleSections = (r: Report) => r.sections.filter((s) => canView(s.sensitivity));
  const hiddenSections = (r: Report) => r.sections.filter((s) => !canView(s.sensitivity));

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2">
            <FileText size={22} className="text-accent" />
            Intelligence Reports
          </h1>
          <p className="text-[13px] text-text-2 mt-0.5">
            {reports.length} report{reports.length !== 1 ? "s" : ""} accessible at your clearance level
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent/8 px-2 py-0.5 rounded-full">
              <Shield size={10} />
              {CLEARANCE_LABELS[userClearance]} (L{userClearance})
            </span>
          </p>
        </div>
        <Link
          href="/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-[13px] font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-sm"
        >
          <Plus size={16} />
          New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer">
          <option value="all">All Types</option>
          <option value="meeting-debrief">Meeting Debrief</option>
          <option value="field-report">Field Report</option>
          <option value="analysis">Analysis</option>
          <option value="intelligence-brief">Intelligence Brief</option>
        </select>
        <select value={filterSensitivity} onChange={(e) => setFilterSensitivity(e.target.value)}
          className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer">
          <option value="all">All Levels</option>
          <option value="standard">Standard</option>
          {canView("sensitive") && <option value="sensitive">Sensitive</option>}
          {canView("confidential") && <option value="confidential">Confidential</option>}
          {canView("top-secret") && <option value="top-secret">Top Secret</option>}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText size={40} className="text-text-3/40 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Reports Found</h3>
            <p className="text-sm text-text-2 max-w-sm">
              {searchQuery || filterType !== "all" || filterSensitivity !== "all"
                ? "Try adjusting your filters or search query."
                : "Create your first report to get started."}
            </p>
          </div>
        )}

        {reports.map((report) => {
          const expanded = expandedId === report.id;
          const sens = SENS_STYLE[report.overallSensitivity];
          const SensIcon = sens.icon;
          const visible = visibleSections(report);
          const hidden = hiddenSections(report);
          const statusS = STATUS_STYLE[report.status] ?? STATUS_STYLE.draft;

          return (
            <div key={report.id} className={cn(
              "rounded-2xl border bg-surface transition-all duration-200",
              expanded ? "border-accent/30 shadow-md" : "border-border/80 hover:border-border hover:shadow-sm"
            )}>
              {/* Report Header */}
              <button
                onClick={() => setExpandedId(expanded ? null : report.id)}
                className="w-full flex items-start gap-4 p-5 text-left cursor-pointer"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", sens.bg)}>
                  <SensIcon size={18} className={sens.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-[15px] font-semibold truncate">{report.title}</h3>
                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border", sens.bg, sens.text, sens.border)}>
                      {report.overallSensitivity}
                    </span>
                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md", statusS.bg, statusS.text)}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-text-3">
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(report.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="inline-flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded text-[10px] font-medium text-text-2">
                      {TYPE_LABELS[report.type]}
                    </span>
                    {report.location && <span className="flex items-center gap-1"><MapPin size={12} />{report.location.split(",")[0]}</span>}
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {visible.length}/{report.sections.length} sections
                    </span>
                    {report.items && report.items.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Shield size={12} />
                        {report.items.filter(i => canView(i.sensitivity)).length}/{report.items.length} items
                      </span>
                    )}
                    {hidden.length > 0 && (
                      <span className="flex items-center gap-1 text-red">
                        <EyeOff size={12} />
                        {hidden.length} restricted
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-text-3 mt-2">
                  {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </button>

              {/* Expanded Content */}
              {expanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4 animate-fade-in">
                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-[12px]">
                    <div>
                      <span className="text-text-3 uppercase tracking-wider text-[10px] font-semibold">Created by</span>
                      <p className="font-medium text-text mt-0.5">{report.createdBy}</p>
                    </div>
                    <div>
                      <span className="text-text-3 uppercase tracking-wider text-[10px] font-semibold">Date</span>
                      <p className="font-medium text-text mt-0.5">{new Date(report.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    {report.location && (
                      <div>
                        <span className="text-text-3 uppercase tracking-wider text-[10px] font-semibold">Location</span>
                        <p className="font-medium text-text mt-0.5">{report.location}</p>
                      </div>
                    )}
                  </div>

                  {/* Attendees */}
                  {(report.attendees.length > 0 || report.externalAttendees.length > 0) && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users size={12} /> Attendees
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {report.attendees.map((id) => (
                          <Link key={id} href={`/entry/${id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/8 text-accent text-[11px] font-medium rounded-lg hover:bg-accent/15 transition-colors">
                            {getEntryName(id)}
                          </Link>
                        ))}
                        {report.externalAttendees.map((name, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-3 text-text-2 text-[11px] font-medium rounded-lg">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {report.tags.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} className="text-text-3" />
                      {report.tags.map((t) => (
                        <span key={t} className="text-[10px] font-medium bg-surface-3 text-text-2 px-2 py-0.5 rounded-md">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Intelligence Items */}
                  {report.items && report.items.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Shield size={12} /> Intelligence Items ({report.items.filter(i => canView(i.sensitivity)).length}/{report.items.length})
                      </h4>
                      <div className="space-y-1.5">
                        {report.items.map((item, idx) => {
                          const canSee = canView(item.sensitivity);
                          const cfg = ITEM_TYPE_CONFIG[item.type] ?? ITEM_TYPE_CONFIG.other;
                          const ItemIcon = cfg.icon;
                          const iSens = SENS_STYLE[item.sensitivity];
                          return (
                            <div key={idx} className={cn(
                              "flex items-center gap-3 rounded-lg border px-3 py-2 text-[12px]",
                              canSee ? "bg-white border-border/60" : "bg-surface-2/50 border-border/30"
                            )}>
                              <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white shrink-0", cfg.gradient)}>
                                <ItemIcon size={12} />
                              </div>
                              {canSee ? (
                                <>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-text">{item.value}</span>
                                    {item.label && <span className="text-text-3 ml-1.5">({item.label})</span>}
                                    {item.notes && <span className="text-text-3 ml-1.5 text-[11px]">— {item.notes}</span>}
                                  </div>
                                  <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0", iSens.bg, iSens.text, iSens.border)}>
                                    {item.sensitivity}
                                  </span>
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 text-text-3 flex-1">
                                  <Lock size={12} />
                                  <span className="text-[11px] italic">
                                    {cfg.label} — restricted (requires L{SENSITIVITY_MIN_CLEARANCE[item.sensitivity]})
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sections */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider">Report Sections</h4>
                    {report.sections.map((section, idx) => {
                      const sStyle = SENS_STYLE[section.sensitivity];
                      const SIcon = sStyle.icon;
                      const canSee = canView(section.sensitivity);

                      return (
                        <div key={idx} className={cn(
                          "rounded-xl border p-4 transition-all",
                          canSee ? "bg-white border-border/60" : "bg-surface-2/50 border-border/30"
                        )}>
                          <div className="flex items-center gap-2 mb-2">
                            <SIcon size={14} className={sStyle.text} />
                            <h5 className="text-[13px] font-semibold">{section.title}</h5>
                            <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border", sStyle.bg, sStyle.text, sStyle.border)}>
                              {section.sensitivity}
                            </span>
                          </div>
                          {canSee ? (
                            <p className="text-[13px] text-text-2 leading-relaxed">{section.content}</p>
                          ) : (
                            <div className="flex items-center gap-2 py-3 text-text-3">
                              <Lock size={14} />
                              <span className="text-[12px] italic">
                                Content restricted — requires {CLEARANCE_LABELS[SENSITIVITY_MIN_CLEARANCE[section.sensitivity]]} clearance (Level {SENSITIVITY_MIN_CLEARANCE[section.sensitivity]})
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Linked Entities */}
                  {report.linkedEntities.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-2">Linked Entities</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {report.linkedEntities.map((id) => {
                          const entry = db.entries.find((e) => e.id === id);
                          if (!entry) return null;
                          return (
                            <Link key={id} href={`/entry/${id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple/8 text-purple text-[11px] font-medium rounded-lg hover:bg-purple/15 transition-colors">
                              {entry.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
