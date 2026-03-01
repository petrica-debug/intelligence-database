"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { EntityCategory } from "@/types";

export default function SearchPage() {
  const { db, currentUser, updateDb } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState<EntityCategory | "all">("all");
  const [searched, setSearched] = useState(false);

  const results = searched
    ? db.entries.filter((e) => {
        const matchesFilter = filter === "all" || e.category === filter;
        const q = query.toLowerCase();
        const matchesQuery =
          e.name.toLowerCase().includes(q) ||
          e.narrative.toLowerCase().includes(q);
        return matchesFilter && matchesQuery;
      })
    : [];

  const handleSearch = () => {
    if (!query.trim()) return;
    if (!reason.trim()) {
      alert("You must provide a reason for your search.");
      return;
    }

    updateDb((d) => {
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "SEARCH",
        detail: `Searched for "${query}" | Reason: ${reason}`,
      });

      d.signals.forEach((sig) => {
        if (sig.entityName.toLowerCase().includes(query.toLowerCase())) {
          d.notifications.push({
            message: `SIGNAL ALERT: ${currentUser!.username} searched for "${query}" (matches signal on ${sig.entityName})`,
            forUser: sig.setBy,
            ts: new Date().toISOString(),
            read: false,
          });
          if (sig.setBy !== "admin") {
            d.notifications.push({
              message: `SIGNAL ALERT: ${currentUser!.username} searched for "${query}" (matches signal on ${sig.entityName})`,
              forUser: "admin",
              ts: new Date().toISOString(),
              read: false,
            });
          }
        }
      });
    });

    setSearched(true);
  };

  const categories: (EntityCategory | "all")[] = [
    "all", "person", "company", "mobile", "address", "vehicle",
  ];

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Search Database</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, number, address, or keyword..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      <div className="form-group" style={{ marginBottom: 16, maxWidth: 500 }}>
        <label>Search Reason (required)</label>
        <input
          type="text"
          placeholder="State your reason for this search..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="search-filters">
        {categories.map((c) => (
          <button
            key={c}
            className={`filter-chip ${filter === c ? "active" : ""}`}
            onClick={() => { setFilter(c); setSearched(false); }}
          >
            {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {searched && (
        <div style={{ marginTop: 12 }}>
          {results.length === 0 ? (
            <div className="recent-section">
              <p style={{ color: "var(--text2)" }}>No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--text2)", marginBottom: 12 }}>
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              {results.map((entry) => {
                const isBasic = currentUser?.access === "basic" && currentUser?.role !== "admin";
                return (
                  <div key={entry.id} className="entity-card" onClick={() => router.push(`/entry/${entry.id}`)}>
                    <div className="card-header">
                      <span className="card-title">{entry.name}</span>
                      <span className={`badge badge-${entry.category}`}>{entry.category}</span>
                    </div>
                    <div className="card-body">
                      {isBasic ? (
                        <span style={{ fontStyle: "italic", color: "var(--text2)" }}>
                          Record exists. Request full access to view details.
                        </span>
                      ) : (
                        entry.narrative.substring(0, 150) + (entry.narrative.length > 150 ? "..." : "")
                      )}
                    </div>
                    <div className="card-meta">
                      <span className={`badge badge-${entry.context}`}>{entry.context}</span>
                      <span className="badge" style={{ background: "var(--surface2)", color: "var(--text2)" }}>
                        {entry.linkedTo.length} links
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </>
  );
}
