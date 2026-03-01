import type { Database, Entry, InferredConnection, Report } from "@/types";

interface RawInference {
  entityA: number;
  entityB: number;
  confidence: number;
  reason: string;
  category: InferredConnection["category"];
  evidence: string[];
}

function getEntry(db: Database, id: number): Entry | undefined {
  return db.entries.find((e) => e.id === id);
}

function sharedLocationInferences(db: Database): RawInference[] {
  const results: RawInference[] = [];
  const addresses = db.entries.filter((e) => e.category === "address");

  for (const addr of addresses) {
    const linked = addr.linkedTo
      .map((id) => getEntry(db, id))
      .filter((e): e is Entry => e != null && e.category === "person");
    for (let i = 0; i < linked.length; i++) {
      for (let j = i + 1; j < linked.length; j++) {
        const a = linked[i], b = linked[j];
        if (a.linkedTo.includes(b.id)) continue;
        results.push({
          entityA: a.id, entityB: b.id,
          confidence: 75 + Math.min(20, addr.linkedTo.length * 3),
          reason: `Both connected to address: ${addr.name}`,
          category: "shared-location",
          evidence: [
            `Shared address: ${addr.name}`,
            `${a.name} linked to this location`,
            `${b.name} linked to this location`,
          ],
        });
      }
    }
  }
  return results;
}

function organizationalInferences(db: Database): RawInference[] {
  const results: RawInference[] = [];
  const orgs = db.entries.filter((e) => e.category === "company");

  for (const org of orgs) {
    const members = org.linkedTo
      .map((id) => getEntry(db, id))
      .filter((e): e is Entry => e != null && e.category === "person");
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = members[i], b = members[j];
        if (a.linkedTo.includes(b.id)) continue;
        const sharedTags = (a.tags ?? []).filter((t) => (b.tags ?? []).includes(t));
        results.push({
          entityA: a.id, entityB: b.id,
          confidence: 55 + Math.min(30, sharedTags.length * 8 + members.length * 2),
          reason: `Both connected through ${org.name}`,
          category: "organizational",
          evidence: [
            `Both linked to organization: ${org.name}`,
            ...(sharedTags.length > 0 ? [`Shared focus areas: ${sharedTags.join(", ")}`] : []),
            ...(a.country === b.country ? [`Both based in ${a.country}`] : []),
          ],
        });
      }
    }
  }
  return results;
}

function tagSimilarityInferences(db: Database): RawInference[] {
  const results: RawInference[] = [];
  const persons = db.entries.filter((e) => e.category === "person" && (e.tags?.length ?? 0) > 0);

  for (let i = 0; i < persons.length; i++) {
    for (let j = i + 1; j < persons.length; j++) {
      const a = persons[i], b = persons[j];
      if (a.linkedTo.includes(b.id)) continue;
      const tagsA = a.tags ?? [], tagsB = b.tags ?? [];
      const shared = tagsA.filter((t) => tagsB.includes(t));
      if (shared.length < 3) continue;
      const similarity = shared.length / Math.max(tagsA.length, tagsB.length);
      if (similarity < 0.5) continue;
      results.push({
        entityA: a.id, entityB: b.id,
        confidence: Math.round(40 + similarity * 50),
        reason: `High domain overlap — ${shared.length} shared focus areas`,
        category: "pattern-match",
        evidence: [
          `Shared tags: ${shared.join(", ")}`,
          `${a.name}: ${tagsA.join(", ")}`,
          `${b.name}: ${tagsB.join(", ")}`,
          ...(a.country === b.country ? [`Same country: ${a.country}`] : []),
        ],
      });
    }
  }
  return results;
}

function meetingCoAttendanceInferences(db: Database): RawInference[] {
  const results: RawInference[] = [];
  const reports = db.reports ?? [];
  const coOccurrences = new Map<string, { count: number; meetings: string[] }>();

  for (const report of reports) {
    const attendees = report.attendees;
    for (let i = 0; i < attendees.length; i++) {
      for (let j = i + 1; j < attendees.length; j++) {
        const key = [Math.min(attendees[i], attendees[j]), Math.max(attendees[i], attendees[j])].join("-");
        const existing = coOccurrences.get(key) ?? { count: 0, meetings: [] };
        existing.count++;
        existing.meetings.push(report.title);
        coOccurrences.set(key, existing);
      }
    }
  }

  for (const [key, data] of coOccurrences) {
    const [aId, bId] = key.split("-").map(Number);
    const a = getEntry(db, aId), b = getEntry(db, bId);
    if (!a || !b) continue;
    if (a.linkedTo.includes(b.id)) continue;
    results.push({
      entityA: aId, entityB: bId,
      confidence: Math.min(95, 50 + data.count * 20),
      reason: `Co-attended ${data.count} meeting${data.count > 1 ? "s" : ""} together`,
      category: "co-attendance",
      evidence: [
        `Met at: ${data.meetings.join("; ")}`,
        `${data.count} co-attendance${data.count > 1 ? "s" : ""} detected`,
      ],
    });
  }
  return results;
}

function geographicProximityInferences(db: Database): RawInference[] {
  const results: RawInference[] = [];
  const persons = db.entries.filter((e) => e.category === "person" && e.country);
  const byCountry = new Map<string, Entry[]>();
  for (const p of persons) {
    const arr = byCountry.get(p.country!) ?? [];
    arr.push(p);
    byCountry.set(p.country!, arr);
  }

  for (const [country, group] of byCountry) {
    if (group.length < 2 || country === "International") continue;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i], b = group[j];
        if (a.linkedTo.includes(b.id)) continue;
        const sharedTags = (a.tags ?? []).filter((t) => (b.tags ?? []).includes(t));
        if (sharedTags.length < 2) continue;
        results.push({
          entityA: a.id, entityB: b.id,
          confidence: Math.round(35 + sharedTags.length * 12),
          reason: `Same country (${country}) with overlapping activities`,
          category: "social-proximity",
          evidence: [
            `Both based in ${country}`,
            `Shared interests: ${sharedTags.join(", ")}`,
            `May share local professional or social circles`,
          ],
        });
      }
    }
  }
  return results;
}

export function runInferenceEngine(db: Database): InferredConnection[] {
  const existing = new Set(
    (db.inferredConnections ?? []).map((c) => `${Math.min(c.entityA, c.entityB)}-${Math.max(c.entityA, c.entityB)}`)
  );

  const allRaw: RawInference[] = [
    ...sharedLocationInferences(db),
    ...organizationalInferences(db),
    ...tagSimilarityInferences(db),
    ...meetingCoAttendanceInferences(db),
    ...geographicProximityInferences(db),
  ];

  const deduped = new Map<string, RawInference>();
  for (const r of allRaw) {
    const key = `${Math.min(r.entityA, r.entityB)}-${Math.max(r.entityA, r.entityB)}`;
    if (existing.has(key)) continue;
    const prev = deduped.get(key);
    if (!prev || r.confidence > prev.confidence) {
      if (prev) {
        r.evidence = [...new Set([...r.evidence, ...prev.evidence])];
        r.confidence = Math.max(r.confidence, prev.confidence);
      }
      deduped.set(key, r);
    }
  }

  let nextId = Math.max(0, ...(db.inferredConnections ?? []).map((c) => c.id)) + 1;
  const newConnections: InferredConnection[] = [];
  for (const r of deduped.values()) {
    if (r.confidence < 40) continue;
    newConnections.push({
      id: nextId++,
      entityA: r.entityA,
      entityB: r.entityB,
      confidence: Math.min(99, r.confidence),
      reason: r.reason,
      category: r.category,
      evidence: r.evidence,
      createdAt: new Date().toISOString(),
      status: "new",
    });
  }

  return newConnections.sort((a, b) => b.confidence - a.confidence);
}
