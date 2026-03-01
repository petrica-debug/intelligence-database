"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

export default function LogsPage() {
  const { db, currentUser } = useApp();
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");

  if (currentUser?.role !== "admin") {
    return <div className="recent-section"><p style={{ color: "var(--red)" }}>Access denied. Admin only.</p></div>;
  }

  const actions = [...new Set(db.logs.map((l) => l.action))];
  const users = [...new Set(db.logs.map((l) => l.user))];

  const filteredLogs = db.logs.filter((l) => {
    if (filterUser && l.user !== filterUser) return false;
    if (filterAction && l.action !== filterAction) return false;
    return true;
  });

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Audit Log</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Filter by User</label>
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Filter by Action</label>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="recent-section">
        <p style={{ color: "var(--text2)", marginBottom: 12, fontSize: 13 }}>
          {filteredLogs.length} log entries
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((l, i) => (
              <tr key={i}>
                <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatDate(l.ts)}</td>
                <td><strong>{l.user}</strong></td>
                <td><span className="badge badge-person">{l.action}</span></td>
                <td>{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
