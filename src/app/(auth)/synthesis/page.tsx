"use client";

import { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui";
import { synthesizeKnowledge, type SynthesizedInsight } from "@/lib/cross-report-inference";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import {
  Sparkles, FileText, ArrowRight, Zap, Globe, Clock, DollarSign,
  Network, AlertTriangle, ChevronDown, Lightbulb, Brain, Link2,
  CheckCircle2, ArrowUpRight, Layers
} from "lucide-react";

const INSIGHT_META: Record<SynthesizedInsight["type"], { label: string; icon: typeof Globe; gradient: string; color: string }> = {
  "entity-overlap": { label: "Entity Overlap", icon: Link2, gradient: "gradient-blue", color: "text-stat-blue" },
  "geographic-pattern": { label: "Geographic Pattern", icon: Globe, gradient: "gradient-green", color: "text-emerald" },
  "temporal-correlation": { label: "Temporal Correlation", icon: Clock, gradient: "gradient-purple", color: "text-purple" },
  "funding-trail": { label: "Funding Trail", icon: DollarSign, gradient: "gradient-orange", color: "text-amber" },
  "network-bridge": { label: "Network Bridge", icon: Network, gradient: "gradient-teal", color: "text-cyan" },
  "contradiction": { label: "Contradiction", icon: AlertTriangle, gradient: "gradient-orange", color: "text-red" },
};

export default function SynthesisPage() {
  const { db, canView, updateDb, currentUser } = useApp();
  const { toast } = useToast();
  const [reportAId, setReportAId] = useState<number | null>(null);
  const [reportBId, setReportBId] = useState<number | null>(null);
  const [insights, setInsights] = useState<SynthesizedInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  const availableReports = useMemo(() =>
    db.reports.filter(r => canView(r.overallSensitivity)),
    [db.reports, canView]
  );

  const reportA = useMemo(() => db.reports.find(r => r.id === reportAId), [db.reports, reportAId]);
  const reportB = useMemo(() => db.reports.find(r => r.id === reportBId), [db.reports, reportBId]);

  const runSynthesis = useCallback(() => {
    if (!reportAId || !reportBId) return;
    setIsAnalyzing(true);
    setInsights([]);
    setExpandedInsight(null);

    setTimeout(() => {
      const results = synthesizeKnowledge(reportAId, reportBId, db);
      setInsights(results);
      setIsAnalyzing(false);
      setHasRun(true);

      updateDb((draft) => {
        draft.logs.push({
          ts: new Date().toISOString(),
          user: currentUser?.username ?? "system",
          action: "SYNTHESIS_RUN",
          detail: `Knowledge synthesis: "${reportA?.title}" × "${reportB?.title}" — ${results.length} insights`,
        });
      });

      if (results.length > 0) {
        toast(`Discovered ${results.length} cross-report insight${results.length !== 1 ? "s" : ""}`, "success");
      } else {
        toast("No cross-report connections found", "info");
      }
    }, 2000);
  }, [reportAId, reportBId, db, updateDb, currentUser, reportA, reportB, toast]);

  const promoteToInference = useCallback((insight: SynthesizedInsight) => {
    if (insight.relatedEntities.length < 2) {
      toast("Need at least 2 related entities to create an inference", "info");
      return;
    }

    updateDb((draft) => {
      const nextId = Math.max(0, ...(draft.inferredConnections ?? []).map(c => c.id)) + 1;
      draft.inferredConnections.push({
        id: nextId,
        entityA: insight.relatedEntities[0],
        entityB: insight.relatedEntities[1],
        confidence: insight.confidence,
        reason: insight.title,
        category: insight.type === "entity-overlap" ? "co-attendance"
          : insight.type === "network-bridge" ? "organizational"
          : insight.type === "geographic-pattern" ? "social-proximity"
          : insight.type === "funding-trail" ? "organizational"
          : "pattern-match",
        evidence: insight.evidence,
        createdAt: new Date().toISOString(),
        status: "new",
      });
      draft.logs.push({
        ts: new Date().toISOString(),
        user: currentUser?.username ?? "system",
        action: "SYNTHESIS_PROMOTE",
        detail: `Promoted synthesis insight to inference: ${insight.title}`,
      });
    });
    toast("Insight promoted to inference for review", "success");
  }, [updateDb, currentUser, toast]);

  const getEntry = useCallback((id: number) => db.entries.find(e => e.id === id), [db.entries]);

  const confidenceColor = (c: number) =>
    c >= 80 ? "text-emerald" : c >= 60 ? "text-amber" : "text-red";

  const confidenceBg = (c: number) =>
    c >= 80 ? "bg-emerald/10 border-emerald/20" : c >= 60 ? "bg-amber/10 border-amber/20" : "bg-red/10 border-red/20";

  return (
    <div className="animate-fade-in max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center text-white shadow-glow-purple">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-text">Knowledge Synthesis</h1>
            <p className="text-[13px] text-text-2">Cross-reference two reports to discover hidden connections and infer new intelligence</p>
          </div>
        </div>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-8">

        {/* Report A */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md gradient-blue flex items-center justify-center text-white text-[10px] font-bold">A</div>
            <h3 className="text-[11px] font-bold text-text uppercase tracking-[0.1em]">First Report</h3>
          </div>
          <select
            value={reportAId ?? ""}
            onChange={(e) => { setReportAId(e.target.value ? Number(e.target.value) : null); setHasRun(false); setInsights([]); }}
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer"
          >
            <option value="">Select a report...</option>
            {availableReports.filter(r => r.id !== reportBId).map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          {reportA && (
            <div className="mt-3 p-3 rounded-lg bg-surface-3/30 border border-border/30">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText size={12} className="text-stat-blue" />
                <span className="text-[11px] font-semibold text-text">{reportA.type.replace(/-/g, " ")}</span>
                <span className="text-[9px] text-text-3 ml-auto">{reportA.date}</span>
              </div>
              <p className="text-[10px] text-text-3">{reportA.linkedEntities.length} linked entities &middot; {reportA.sections.length} sections</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {reportA.tags.slice(0, 4).map(t => (
                  <span key={t} className="text-[8px] font-semibold text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Arrow + Button */}
        <div className="flex flex-col items-center justify-center gap-3 py-4 lg:py-8">
          <div className="w-10 h-10 rounded-full bg-surface-3/50 border border-border/40 flex items-center justify-center">
            <Layers size={16} className="text-text-3" />
          </div>
          <button
            onClick={runSynthesis}
            disabled={!reportAId || !reportBId || isAnalyzing}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap",
              (!reportAId || !reportBId || isAnalyzing)
                ? "bg-surface-3 text-text-3 cursor-not-allowed"
                : "bg-purple text-white hover:bg-purple/90 shadow-glow-purple"
            )}
          >
            {isAnalyzing ? (
              <>
                <Brain size={15} className="animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Synthesize
              </>
            )}
          </button>
        </div>

        {/* Report B */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md gradient-purple flex items-center justify-center text-white text-[10px] font-bold">B</div>
            <h3 className="text-[11px] font-bold text-text uppercase tracking-[0.1em]">Second Report</h3>
          </div>
          <select
            value={reportBId ?? ""}
            onChange={(e) => { setReportBId(e.target.value ? Number(e.target.value) : null); setHasRun(false); setInsights([]); }}
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-xl text-sm outline-none focus:border-accent cursor-pointer"
          >
            <option value="">Select a report...</option>
            {availableReports.filter(r => r.id !== reportAId).map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          {reportB && (
            <div className="mt-3 p-3 rounded-lg bg-surface-3/30 border border-border/30">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText size={12} className="text-purple" />
                <span className="text-[11px] font-semibold text-text">{reportB.type.replace(/-/g, " ")}</span>
                <span className="text-[9px] text-text-3 ml-auto">{reportB.date}</span>
              </div>
              <p className="text-[10px] text-text-3">{reportB.linkedEntities.length} linked entities &middot; {reportB.sections.length} sections</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {reportB.tags.slice(0, 4).map(t => (
                  <span key={t} className="text-[8px] font-semibold text-text-3 bg-surface-3 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center text-white">
              <Brain size={22} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-text mb-1">AI Engine Processing</h3>
              <p className="text-[12px] text-text-3">Cross-referencing entities, geographic patterns, temporal correlations, funding trails, and network bridges...</p>
              <div className="w-full bg-border/30 rounded-full h-1.5 mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="gradient-purple rounded-full h-1.5"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {hasRun && !isAnalyzing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full gradient-purple" />
              <h2 className="text-[11px] font-bold text-text uppercase tracking-[0.12em]">
                Synthesis Results
              </h2>
              <span className="text-[10px] font-bold text-purple px-2 py-0.5 rounded-md bg-purple/8 border border-purple/12">
                {insights.length} insight{insights.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {insights.length === 0 ? (
            <div className="card-premium p-10 text-center">
              <Lightbulb size={32} className="text-text-3/30 mx-auto mb-3" />
              <h3 className="text-[15px] font-semibold text-text mb-1">No Cross-Report Connections Found</h3>
              <p className="text-[12px] text-text-3 max-w-md mx-auto">
                These reports don&apos;t appear to share entities, geographic focus, or temporal patterns. Try selecting reports that cover related topics or regions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, i) => {
                const meta = INSIGHT_META[insight.type];
                const isExpanded = expandedInsight === insight.id;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="card-premium overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                      className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-surface-3/10 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl ${meta.gradient} flex items-center justify-center text-white shrink-0`}>
                        <meta.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                        </div>
                        <h3 className="text-[14px] font-semibold text-text leading-tight">{insight.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`px-2.5 py-1 rounded-lg border text-center ${confidenceBg(insight.confidence)}`}>
                          <span className={`text-[16px] font-extrabold font-mono tabular-nums ${confidenceColor(insight.confidence)}`}>
                            {insight.confidence}%
                          </span>
                        </div>
                        <ChevronDown size={16} className={cn("text-text-3 transition-transform", isExpanded && "rotate-180")} />
                      </div>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border/30"
                      >
                        <div className="p-5 space-y-4">
                          <p className="text-[13px] text-text-2 leading-relaxed">{insight.description}</p>

                          <div>
                            <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-2">Evidence</h4>
                            <div className="space-y-1.5">
                              {insight.evidence.map((ev, j) => (
                                <div key={j} className="flex items-start gap-2 text-[12px] text-text-2">
                                  <CheckCircle2 size={12} className="text-emerald shrink-0 mt-0.5" />
                                  <span>{ev}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {insight.relatedEntities.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-2">Related Entities</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {insight.relatedEntities.map(id => {
                                  const entry = getEntry(id);
                                  if (!entry) return null;
                                  return (
                                    <span key={id} className="text-[11px] font-medium text-text bg-surface-3/50 border border-border/40 px-2.5 py-1 rounded-lg">
                                      {entry.name}
                                      <span className="text-text-3 ml-1 text-[9px]">{entry.category}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {insight.suggestedAction && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-purple/5 border border-purple/10">
                              <Lightbulb size={14} className="text-purple shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-bold text-purple uppercase tracking-wider">Suggested Action</span>
                                <p className="text-[12px] text-text-2 mt-0.5">{insight.suggestedAction}</p>
                              </div>
                            </div>
                          )}

                          {insight.relatedEntities.length >= 2 && (
                            <button
                              onClick={() => promoteToInference(insight)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-semibold text-purple bg-purple/8 border border-purple/15 rounded-xl hover:bg-purple/15 transition-colors cursor-pointer"
                            >
                              <ArrowUpRight size={14} />
                              Promote to Inference
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasRun && !isAnalyzing && (
        <div className="card-premium p-12 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-purple/10 border border-purple/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-purple/40" />
          </div>
          <h3 className="text-[16px] font-semibold text-text mb-2">Select Two Reports to Begin</h3>
          <p className="text-[13px] text-text-3 max-w-lg mx-auto leading-relaxed">
            The AI synthesis engine will cross-reference entities, geographic patterns, temporal correlations,
            funding trails, and network bridges between the two reports to discover hidden connections and generate new intelligence.
          </p>
        </div>
      )}
    </div>
  );
}
