"use client";

import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

export default function ValidationsPage() {
  const { db, currentUser, updateDb } = useApp();

  if (currentUser?.role !== "admin") {
    return <div className="recent-section"><p style={{ color: "var(--red)" }}>Access denied. Admin only.</p></div>;
  }

  const pending = db.pendingValidations.filter((v) => !v.resolved);
  const resolved = db.pendingValidations.filter((v) => v.resolved);

  const handleApprove = (id: number) => {
    updateDb((d) => {
      const val = d.pendingValidations.find((v) => v.id === id);
      if (!val) return;
      val.resolved = true;
      val.approved = true;

      // Create the link
      if (val.suggestedLinkId !== null) {
        const entry = d.entries.find((e) => e.id === val.entryId);
        const target = d.entries.find((e) => e.id === val.suggestedLinkId);
        if (entry && target) {
          if (!entry.linkedTo.includes(target.id)) entry.linkedTo.push(target.id);
          if (!target.linkedTo.includes(entry.id)) target.linkedTo.push(entry.id);
        }
      }

      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "VALIDATE_APPROVE",
        detail: `Approved link: ${val.targetName} → ${val.suggestedLink}`,
      });

      d.notifications.push({
        message: `Your link suggestion (${val.targetName} → ${val.suggestedLink}) was approved.`,
        forUser: val.submittedBy,
        ts: new Date().toISOString(),
        read: false,
      });
    });
  };

  const handleReject = (id: number) => {
    updateDb((d) => {
      const val = d.pendingValidations.find((v) => v.id === id);
      if (!val) return;
      val.resolved = true;
      val.approved = false;

      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "VALIDATE_REJECT",
        detail: `Rejected link: ${val.targetName} → ${val.suggestedLink}`,
      });

      d.notifications.push({
        message: `Your link suggestion (${val.targetName} → ${val.suggestedLink}) was rejected.`,
        forUser: val.submittedBy,
        ts: new Date().toISOString(),
        read: false,
      });
    });
  };

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>Pending Validations</h2>

      {pending.length === 0 ? (
        <div className="recent-section">
          <p style={{ color: "var(--text2)" }}>No pending validations.</p>
        </div>
      ) : (
        pending.map((v) => (
          <div key={v.id} className="recent-section" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: 15 }}>
                  {v.targetName} &rarr; {v.suggestedLink}
                </h3>
                <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
                  Submitted by <strong>{v.submittedBy}</strong> on {formatDate(v.submittedAt)}
                </p>
                <p style={{ fontSize: 13, marginTop: 8 }}>
                  <strong>Reason:</strong> {v.reason}
                </p>
              </div>
              <div className="link-actions">
                <button className="btn btn-success btn-sm" onClick={() => handleApprove(v.id)}>
                  Approve & Link
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleReject(v.id)}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {resolved.length > 0 && (
        <>
          <h3 style={{ marginTop: 28, marginBottom: 12, color: "var(--text2)" }}>Resolved</h3>
          {resolved.map((v) => (
            <div key={v.id} className="link-suggestion">
              <div>
                {v.targetName} &rarr; {v.suggestedLink}
                <span style={{ color: "var(--text2)", fontSize: 12, marginLeft: 8 }}>by {v.submittedBy}</span>
              </div>
              <span className={`badge ${v.approved ? "badge-approved" : "badge-rejected"}`}>
                {v.approved ? "Approved" : "Rejected"}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );
}
