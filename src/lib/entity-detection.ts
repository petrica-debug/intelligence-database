import type { Entry } from "@/types";
import type { DetectedEntity } from "@/types";

export function detectEntities(
  narrative: string,
  existingEntries: Entry[]
): DetectedEntity[] {
  const detected: DetectedEntity[] = [];

  // Phone patterns
  const phones = narrative.match(/\+?\d[\d\s-]{8,15}/g);
  if (phones) {
    phones.forEach((p) => {
      const clean = p.trim();
      const exists = existingEntries.find(
        (e) =>
          e.category === "mobile" &&
          e.name.replace(/\s/g, "") === clean.replace(/\s/g, "")
      );
      detected.push({ type: "mobile", value: clean, existing: exists ?? null });
    });
  }

  // Vehicle plates (Romanian pattern)
  const plates = narrative.match(/[A-Z]{1,2}-\d{2,3}-[A-Z]{2,3}/g);
  if (plates) {
    plates.forEach((p) => {
      const exists = existingEntries.find(
        (e) => e.category === "vehicle" && e.name === p
      );
      detected.push({ type: "vehicle", value: p, existing: exists ?? null });
    });
  }

  // Capitalized names (simple heuristic)
  const namePattern = /(?:^|[.!?]\s+)([A-Z][a-z]+ [A-Z][a-z]+)/g;
  let m;
  while ((m = namePattern.exec(narrative)) !== null) {
    const name = m[1];
    if (
      !["Black Sea", "Hotel Intercontinental"].some((x) => name.includes(x))
    ) {
      const exists = existingEntries.find(
        (e) =>
          e.category === "person" &&
          e.name.toLowerCase() === name.toLowerCase()
      );
      if (!detected.some((d) => d.value === name)) {
        detected.push({ type: "person", value: name, existing: exists ?? null });
      }
    }
  }

  // Also look for known entity names in narrative
  existingEntries.forEach((e) => {
    if (
      narrative.toLowerCase().includes(e.name.toLowerCase()) &&
      !detected.some((d) => d.value.toLowerCase() === e.name.toLowerCase())
    ) {
      detected.push({
        type: e.category,
        value: e.name,
        existing: e,
      });
    }
  });

  return detected;
}
