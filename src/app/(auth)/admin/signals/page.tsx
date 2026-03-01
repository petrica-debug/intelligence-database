"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

export default function SignalsPage() {
  const { db, currentUser, updateDb } = useApp();
  const [entityId, setEntityId] = useState("");

  if (currentUser?.role !== "admin") {
    return <div className="recent-section"><p style={{ color: "var(--red)" }}>Access denied. Admin only.</p></div>;
  }

  const handleAddSignal = () => {
    const id = Number(entityId);
    const entry = db.entries.find((e) => e.id === id);
    if (!entry) {
      alert("Entry not found.");
      return;
    }
    if (db.signals.some((s) => s.entityId === id)) {
      alert("Signal already exists for this entity.");
      return;
    }
    updateDb((d) => {
      d.signals.push({
        entityId: id,
        entityName: entry.name,
        setBy: currentUser!.username,
        setAt: new Date().toISOString(),
      });
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "SIGNAL_SET",
        detail: `Set signal on: ${entry.name}`,
      });
    });
    setEntityId("");
  };

  const handleRemoveSignal = (sigEntityId: number) => {
    const sig = db.signals.find((s) => s.entityId === sigEntityId);
    if (!sig) return;
    updateDb((d) => {
      d.signals = d.signals.filter((s) => s.entityId !== sigEntityId);
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "SIGNAL_REMOVE",
        detail: `Removed signal from: ${sig.entityName}`,
      });
    });
  };

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Signal Management</h2>
      <p style={{ color: "var(--text2)", marginBottom: 16, fontSize: 13 }}>
        Signals alert you when any user searches for or views a marked entity. Only the user who set the signal and the admin are notified.
      </p>

      <div className="recent-section" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Add Signal</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Select Entity</label>
            <select value={entityId} onChange={(e) => setEntityId(e.target.value)}>
              <option value="">-- Select an entity --</option>
              {db.entries
                .filter((e) => !db.signals.some((s) => s.entityId === e.id))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.category}] {e.name}
                  </option>
                ))}
            </select>
          </div>
          <button className="btn btn-warning" onClick={handleAddSignal} disabled={!entityId}>
            Set Signal
          </button>
        </div>
      </div>

      <div className="recent-section">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Active Signals ({db.signals.length})</h3>
        {db.signals.length === 0 ? (
          <p style={{ color: "var(--text2)" }}>No active signals.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Entity</th>
                <th>Set By</th>
                <th>Set At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {db.signals.map((s) => (
                <tr key={s.entityId}>
                  <td>
                    <strong className="signal-active">{s.entityName}</strong>
                    <span style={{ color: "var(--text2)", fontSize: 12, marginLeft: 8 }}>
                      (ID: {s.entityId})
                    </span>
                  </td>
                  <td>{s.setBy}</td>
                  <td style={{ color: "var(--text2)" }}>{formatDate(s.setAt)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveSignal(s.entityId)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
