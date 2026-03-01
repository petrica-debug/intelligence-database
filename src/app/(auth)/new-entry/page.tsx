"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { detectEntities } from "@/lib/entity-detection";
import type { EntityCategory, ContextAssessment, DetectedEntity } from "@/types";

export default function NewEntryPage() {
  const { db, currentUser, updateDb } = useApp();
  const router = useRouter();
  const [category, setCategory] = useState<EntityCategory>("person");
  const [name, setName] = useState("");
  const [context, setContext] = useState<ContextAssessment>("confirmed");
  const [narrative, setNarrative] = useState("");
  const [detected, setDetected] = useState<DetectedEntity[]>([]);
  const [step, setStep] = useState<"form" | "review">("form");
  const [validationReason, setValidationReason] = useState("");
  const [validationIdx, setValidationIdx] = useState<number | null>(null);

  const handleDetect = () => {
    if (!name.trim() || !narrative.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    const entities = detectEntities(narrative, db.entries);
    setDetected(entities.map((e) => ({ ...e, action: e.existing ? undefined : "skip" })));
    setStep("review");
  };

  const handleSubmit = () => {
    const newId = db.nextId;
    const linkedIds: number[] = [];
    const pendingValidations: { targetName: string; suggestedLink: string; suggestedLinkId: number | null; reason: string }[] = [];

    detected.forEach((d) => {
      if (d.action === "link" && d.existing) {
        linkedIds.push(d.existing.id);
      } else if (d.action === "validate") {
        pendingValidations.push({
          targetName: name,
          suggestedLink: d.value,
          suggestedLinkId: d.existing?.id ?? null,
          reason: d.value + " - " + (validationReason || "Needs admin review"),
        });
      }
    });

    updateDb((d) => {
      d.entries.push({
        id: newId,
        category,
        name: name.trim(),
        context,
        narrative: narrative.trim(),
        createdBy: currentUser!.username,
        createdAt: new Date().toISOString(),
        linkedTo: linkedIds,
      });

      // Add reverse links
      linkedIds.forEach((lid) => {
        const target = d.entries.find((e) => e.id === lid);
        if (target && !target.linkedTo.includes(newId)) {
          target.linkedTo.push(newId);
        }
      });

      // Add pending validations
      pendingValidations.forEach((pv) => {
        const pvId = d.pendingValidations.length > 0
          ? Math.max(...d.pendingValidations.map((p) => p.id)) + 1
          : 1;
        d.pendingValidations.push({
          id: pvId,
          entryId: newId,
          ...pv,
          submittedBy: currentUser!.username,
          submittedAt: new Date().toISOString(),
        });
        d.notifications.push({
          message: `New validation request from ${currentUser!.username}: ${pv.targetName} → ${pv.suggestedLink}`,
          forUser: "admin",
          ts: new Date().toISOString(),
          read: false,
        });
      });

      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "ENTRY",
        detail: `Created new entry: ${name.trim()} (${category})`,
      });

      d.nextId = newId + 1;
    });

    router.push(`/entry/${newId}`);
  };

  const setEntityAction = (idx: number, action: DetectedEntity["action"]) => {
    setDetected((prev) => prev.map((d, i) => (i === idx ? { ...d, action } : d)));
  };

  const categories: EntityCategory[] = ["person", "company", "mobile", "address", "vehicle"];
  const contexts: ContextAssessment[] = ["confirmed", "likely", "rumor"];

  if (step === "review") {
    const hasExistingMatches = detected.some((d) => d.existing);
    const hasUnlinkedDetections = detected.filter((d) => d.existing).length > 0;
    const allDecided = detected.filter((d) => d.existing).every((d) => d.action);

    return (
      <>
        <h2 style={{ marginBottom: 20 }}>Review & Link</h2>
        <div className="recent-section">
          <h3>New Entry: {name}</h3>
          <p style={{ color: "var(--text2)", margin: "8px 0" }}>
            <span className={`badge badge-${category}`}>{category}</span>{" "}
            <span className={`badge badge-${context}`}>{context}</span>
          </p>
          <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 8 }}>{narrative}</p>
        </div>

        {hasExistingMatches ? (
          <div className="recent-section">
            <h3>Detected Entities</h3>
            <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 12 }}>
              Choose how to handle each detected entity match:
            </p>
            {detected.filter((d) => d.existing).map((d, idx) => (
              <div key={idx} className="link-suggestion" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className={`badge badge-${d.type}`}>{d.type}</span>{" "}
                    <strong>{d.value}</strong>
                    {d.existing && (
                      <span style={{ color: "var(--text2)", fontSize: 12, marginLeft: 8 }}>
                        (matches existing: {d.existing.name})
                      </span>
                    )}
                  </div>
                  <div className="link-actions">
                    <button
                      className={`btn btn-sm ${d.action === "link" ? "btn-success" : "btn-secondary"}`}
                      onClick={() => setEntityAction(detected.indexOf(d), "link")}
                    >
                      Link
                    </button>
                    <button
                      className={`btn btn-sm ${d.action === "validate" ? "btn-warning" : "btn-secondary"}`}
                      onClick={() => { setEntityAction(detected.indexOf(d), "validate"); setValidationIdx(detected.indexOf(d)); }}
                    >
                      Send for Validation
                    </button>
                    <button
                      className={`btn btn-sm ${d.action === "skip" ? "btn-danger" : "btn-secondary"}`}
                      onClick={() => setEntityAction(detected.indexOf(d), "skip")}
                    >
                      Skip
                    </button>
                  </div>
                </div>
                {d.action === "validate" && validationIdx === detected.indexOf(d) && (
                  <div className="form-group" style={{ marginBottom: 0, marginTop: 4 }}>
                    <label>Assumptions / Basis for link</label>
                    <textarea
                      value={validationReason}
                      onChange={(e) => setValidationReason(e.target.value)}
                      placeholder="Explain why you think these may be connected..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="recent-section">
            <p style={{ color: "var(--text2)" }}>No existing entity matches detected. This will be entered as a new standalone record.</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={() => setStep("form")}>Back</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {hasUnlinkedDetections && !allDecided ? "Enter (decide on all matches first)" : "Confirm & Enter"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>New Entry</h2>
      <div className="recent-section">
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as EntityCategory)}>
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Name / Identifier</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Smith, +40 712 345 678, B-123-ABC"
          />
        </div>

        <div className="form-group">
          <label>Context Assessment</label>
          <select value={context} onChange={(e) => setContext(e.target.value as ContextAssessment)}>
            {contexts.map((c) => (
              <option key={c} value={c}>
                {c === "confirmed" ? "Confirmed" : c === "likely" ? "Very Likely True" : "Rumors / Personal Opinion"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Narrative / Intelligence</label>
          <textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Enter the intelligence data here. Include names, phone numbers, addresses, etc. The system will try to detect and link entities automatically."
            style={{ minHeight: 150 }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleDetect}>
          Analyze & Review Links
        </button>
      </div>
    </>
  );
}
