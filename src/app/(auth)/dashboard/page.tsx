"use client";

import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { db, currentUser } = useApp();

  const stats = [
    { icon: "👤", count: db.entries.filter((e) => e.category === "person").length, label: "Persons" },
    { icon: "🏢", count: db.entries.filter((e) => e.category === "company").length, label: "Companies" },
    { icon: "📱", count: db.entries.filter((e) => e.category === "mobile").length, label: "Mobile Numbers" },
    { icon: "📍", count: db.entries.filter((e) => e.category === "address").length, label: "Addresses" },
    { icon: "🚗", count: db.entries.filter((e) => e.category === "vehicle").length, label: "Vehicles" },
    { icon: "🔗", count: db.entries.reduce((s, e) => s + e.linkedTo.length, 0), label: "Links" },
  ];

  const recentEntries = [...db.entries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const recentLogs = db.logs.slice(0, 8);

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Dashboard</h2>
      <div className="stat-cards">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="icon">{s.icon}</div>
            <div className="number">{s.count}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <h3>Recent Entries</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Context</th>
              <th>Created By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.name}</td>
                <td><span className={`badge badge-${e.category}`}>{e.category}</span></td>
                <td><span className={`badge badge-${e.context}`}>{e.context}</span></td>
                <td>{e.createdBy}</td>
                <td style={{ color: "var(--text2)" }}>{formatDate(e.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentUser?.role === "admin" && (
        <div className="recent-section">
          <h3>Recent Activity</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((l, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--text2)" }}>{formatDate(l.ts)}</td>
                  <td>{l.user}</td>
                  <td><span className="badge badge-person">{l.action}</span></td>
                  <td>{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {db.pendingValidations.filter((v) => !v.resolved).length > 0 && currentUser?.role === "admin" && (
        <div className="recent-section">
          <h3>Pending Validations ({db.pendingValidations.filter((v) => !v.resolved).length})</h3>
          {db.pendingValidations.filter((v) => !v.resolved).map((v) => (
            <div key={v.id} className="link-suggestion">
              <div>
                <strong>{v.targetName}</strong> &rarr; {v.suggestedLink}
                <br />
                <span style={{ color: "var(--text2)", fontSize: 12 }}>
                  By {v.submittedBy} | {v.reason}
                </span>
              </div>
              <span className="badge badge-pending">Pending</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
