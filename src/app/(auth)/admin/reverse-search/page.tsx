"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

export default function ReverseSearchPage() {
  const { db, currentUser, updateDb } = useApp();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  if (currentUser?.role !== "admin") {
    return <div className="recent-section"><p style={{ color: "var(--red)" }}>Access denied. Admin only.</p></div>;
  }

  const results = searched
    ? db.logs.filter((l) => {
        const q = query.toLowerCase();
        return l.detail.toLowerCase().includes(q);
      })
    : [];

  const handleSearch = () => {
    if (!query.trim()) return;
    updateDb((d) => {
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "REVERSE_SEARCH",
        detail: `Admin reverse search for: "${query}"`,
      });
    });
    setSearched(true);
  };

  // Group results by user
  const userMap = new Map<string, typeof results>();
  results.forEach((r) => {
    const arr = userMap.get(r.user) || [];
    arr.push(r);
    userMap.set(r.user, arr);
  });

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Reverse Search</h2>
      <p style={{ color: "var(--text2)", marginBottom: 16, fontSize: 13 }}>
        Find which users have ever searched for or accessed a specific name, number, company, or other entity.
      </p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter name, number, address, or keyword to reverse search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Reverse Search</button>
      </div>

      {searched && (
        <div style={{ marginTop: 16 }}>
          {results.length === 0 ? (
            <div className="recent-section">
              <p style={{ color: "var(--text2)" }}>No activity found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--text2)", marginBottom: 12, fontSize: 13 }}>
                {results.length} activity records found across {userMap.size} user(s)
              </p>
              {Array.from(userMap.entries()).map(([user, logs]) => (
                <div key={user} className="recent-section" style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15 }}>
                    User: {user} ({logs.length} actions)
                  </h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Action</th>
                        <th>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l, i) => (
                        <tr key={i}>
                          <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatDate(l.ts)}</td>
                          <td><span className="badge badge-person">{l.action}</span></td>
                          <td>{l.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}
