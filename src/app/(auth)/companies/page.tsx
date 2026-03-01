"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

export default function CompaniesPage() {
  const { db } = useApp();
  const router = useRouter();
  const entries = db.entries.filter((e) => e.category === "company")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Companies ({entries.length})</h2>
      {entries.map((entry) => (
        <div key={entry.id} className="entity-card" onClick={() => router.push(`/entry/${entry.id}`)}>
          <div className="card-header">
            <span className="card-title">{entry.name}</span>
            <span className={`badge badge-${entry.context}`}>{entry.context}</span>
          </div>
          <div className="card-body">
            {entry.narrative.substring(0, 120)}{entry.narrative.length > 120 ? "..." : ""}
          </div>
          <div className="card-meta">
            <span className="badge" style={{ background: "var(--surface2)", color: "var(--text2)" }}>
              by {entry.createdBy}
            </span>
            <span className="badge" style={{ background: "var(--surface2)", color: "var(--text2)" }}>
              {formatDate(entry.createdAt)}
            </span>
            <span className="badge" style={{ background: "var(--surface2)", color: "var(--text2)" }}>
              {entry.linkedTo.length} links
            </span>
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="recent-section">
          <p style={{ color: "var(--text2)" }}>No company entries yet.</p>
        </div>
      )}
    </>
  );
}
