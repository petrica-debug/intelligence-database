import type { Database, Entry, Report, InferredConnection } from "@/types";

export interface SynthesizedInsight {
  id: number;
  type: "entity-overlap" | "geographic-pattern" | "temporal-correlation" | "funding-trail" | "network-bridge" | "contradiction";
  title: string;
  description: string;
  confidence: number;
  reportA: number;
  reportB: number;
  relatedEntities: number[];
  evidence: string[];
  suggestedAction?: string;
}

function findSharedEntities(reportA: Report, reportB: Report, db: Database): SynthesizedInsight[] {
  const insights: SynthesizedInsight[] = [];
  const sharedIds = reportA.linkedEntities.filter(id => reportB.linkedEntities.includes(id));

  if (sharedIds.length > 0) {
    const names = sharedIds.map(id => db.entries.find(e => e.id === id)?.name).filter(Boolean);
    insights.push({
      id: 0,
      type: "entity-overlap",
      title: `${sharedIds.length} shared entities across reports`,
      description: `Both reports reference the same ${sharedIds.length} entity/entities, suggesting a direct operational connection between the events described.`,
      confidence: Math.min(95, 60 + sharedIds.length * 10),
      reportA: reportA.id,
      reportB: reportB.id,
      relatedEntities: sharedIds,
      evidence: [
        `Shared entities: ${names.join(", ")}`,
        `Report A: "${reportA.title}"`,
        `Report B: "${reportB.title}"`,
      ],
      suggestedAction: "Investigate shared entities for coordinated activity patterns",
    });
  }

  return insights;
}

function findNetworkBridges(reportA: Report, reportB: Report, db: Database): SynthesizedInsight[] {
  const insights: SynthesizedInsight[] = [];
  const entitiesA = new Set(reportA.linkedEntities);
  const entitiesB = new Set(reportB.linkedEntities);

  for (const idA of entitiesA) {
    const entryA = db.entries.find(e => e.id === idA);
    if (!entryA) continue;

    for (const linkedId of entryA.linkedTo) {
      if (entitiesB.has(linkedId) && !entitiesA.has(linkedId)) {
        const bridge = db.entries.find(e => e.id === linkedId);
        if (!bridge) continue;

        insights.push({
          id: 0,
          type: "network-bridge",
          title: `Network bridge: ${entryA.name} → ${bridge.name}`,
          description: `${entryA.name} (Report A) is directly linked to ${bridge.name} (Report B), creating a bridge between the two report contexts that may indicate information flow or coordination.`,
          confidence: 72,
          reportA: reportA.id,
          reportB: reportB.id,
          relatedEntities: [idA, linkedId],
          evidence: [
            `${entryA.name} appears in "${reportA.title}"`,
            `${bridge.name} appears in "${reportB.title}"`,
            `Direct link exists between these entities in the database`,
          ],
          suggestedAction: "Map the full connection path between report contexts",
        });
      }
    }
  }

  const seen = new Set<string>();
  return insights.filter(i => {
    const key = i.relatedEntities.sort().join("-");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findGeographicPatterns(reportA: Report, reportB: Report, db: Database): SynthesizedInsight[] {
  const insights: SynthesizedInsight[] = [];

  const countriesA = new Set<string>();
  const countriesB = new Set<string>();

  reportA.linkedEntities.forEach(id => {
    const e = db.entries.find(x => x.id === id);
    if (e?.country) countriesA.add(e.country);
  });
  reportB.linkedEntities.forEach(id => {
    const e = db.entries.find(x => x.id === id);
    if (e?.country) countriesB.add(e.country);
  });

  const sharedCountries = [...countriesA].filter(c => countriesB.has(c) && c !== "International");

  if (sharedCountries.length > 0) {
    insights.push({
      id: 0,
      type: "geographic-pattern",
      title: `Shared geographic focus: ${sharedCountries.join(", ")}`,
      description: `Both reports involve entities operating in the same region(s), suggesting geographic convergence of activities that may indicate coordinated operations or shared operational theater.`,
      confidence: Math.min(85, 45 + sharedCountries.length * 15),
      reportA: reportA.id,
      reportB: reportB.id,
      relatedEntities: [],
      evidence: [
        `Shared regions: ${sharedCountries.join(", ")}`,
        `Report A covers: ${[...countriesA].join(", ")}`,
        `Report B covers: ${[...countriesB].join(", ")}`,
      ],
      suggestedAction: "Cross-reference regional activities for temporal overlap",
    });
  }

  return insights;
}

function findTemporalCorrelations(reportA: Report, reportB: Report): SynthesizedInsight[] {
  const insights: SynthesizedInsight[] = [];

  const dateA = new Date(reportA.date);
  const dateB = new Date(reportB.date);
  const daysDiff = Math.abs(dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 14) {
    insights.push({
      id: 0,
      type: "temporal-correlation",
      title: `Temporal proximity: ${Math.round(daysDiff)} days apart`,
      description: `These reports were created within ${Math.round(daysDiff)} days of each other, suggesting the events may be part of the same operational cycle or campaign period.`,
      confidence: Math.min(80, 50 + Math.round((14 - daysDiff) * 3)),
      reportA: reportA.id,
      reportB: reportB.id,
      relatedEntities: [],
      evidence: [
        `Report A date: ${reportA.date}`,
        `Report B date: ${reportB.date}`,
        `Time gap: ${Math.round(daysDiff)} days`,
      ],
      suggestedAction: "Analyze whether events are sequentially related",
    });
  }

  return insights;
}

function findFundingTrails(reportA: Report, reportB: Report, db: Database): SynthesizedInsight[] {
  const insights: SynthesizedInsight[] = [];

  const fundingKeywords = ["funding", "grant", "budget", "€", "allocation", "financial", "investment"];
  const hasFundingA = reportA.sections.some(s => fundingKeywords.some(k => s.content.toLowerCase().includes(k)));
  const hasFundingB = reportB.sections.some(s => fundingKeywords.some(k => s.content.toLowerCase().includes(k)));

  if (hasFundingA && hasFundingB) {
    const orgsA = reportA.linkedEntities.map(id => db.entries.find(e => e.id === id)).filter(e => e?.category === "company");
    const orgsB = reportB.linkedEntities.map(id => db.entries.find(e => e.id === id)).filter(e => e?.category === "company");
    const sharedOrgs = orgsA.filter(a => orgsB.some(b => b?.id === a?.id));

    if (sharedOrgs.length > 0) {
      insights.push({
        id: 0,
        type: "funding-trail",
        title: "Potential funding trail detected",
        description: `Both reports discuss financial matters and reference the same organization(s). This may indicate a funding flow pattern worth investigating.`,
        confidence: 68,
        reportA: reportA.id,
        reportB: reportB.id,
        relatedEntities: sharedOrgs.map(o => o!.id),
        evidence: [
          "Both reports contain financial/funding references",
          `Shared organizations: ${sharedOrgs.map(o => o?.name).join(", ")}`,
        ],
        suggestedAction: "Trace funding flows between referenced organizations",
      });
    }
  }

  return insights;
}

function findContradictions(reportA: Report, reportB: Report): SynthesizedInsight[] {
  const insights: SynthesizedInsight[] = [];

  const sensA = reportA.overallSensitivity;
  const sensB = reportB.overallSensitivity;
  const sensOrder = ["standard", "sensitive", "confidential", "top-secret"];

  if (Math.abs(sensOrder.indexOf(sensA) - sensOrder.indexOf(sensB)) >= 2) {
    insights.push({
      id: 0,
      type: "contradiction",
      title: "Significant sensitivity disparity",
      description: `These reports have markedly different sensitivity classifications (${sensA} vs ${sensB}). If they cover related topics, this may indicate an information compartmentalization issue or classification inconsistency.`,
      confidence: 55,
      reportA: reportA.id,
      reportB: reportB.id,
      relatedEntities: [],
      evidence: [
        `Report A sensitivity: ${sensA}`,
        `Report B sensitivity: ${sensB}`,
        "Large gap in classification levels",
      ],
      suggestedAction: "Review classification consistency across related reports",
    });
  }

  return insights;
}

export function synthesizeKnowledge(
  reportAId: number,
  reportBId: number,
  db: Database
): SynthesizedInsight[] {
  const reportA = db.reports.find(r => r.id === reportAId);
  const reportB = db.reports.find(r => r.id === reportBId);
  if (!reportA || !reportB) return [];

  const allInsights: SynthesizedInsight[] = [
    ...findSharedEntities(reportA, reportB, db),
    ...findNetworkBridges(reportA, reportB, db),
    ...findGeographicPatterns(reportA, reportB, db),
    ...findTemporalCorrelations(reportA, reportB),
    ...findFundingTrails(reportA, reportB, db),
    ...findContradictions(reportA, reportB),
  ];

  let nextId = 1;
  return allInsights
    .map(i => ({ ...i, id: nextId++ }))
    .sort((a, b) => b.confidence - a.confidence);
}
