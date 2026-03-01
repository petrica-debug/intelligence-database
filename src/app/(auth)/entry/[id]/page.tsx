"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { db, currentUser, updateDb } = useApp();
  const [accessReason, setAccessReason] = useState("");
  const [showAccessForm, setShowAccessForm] = useState(false);

  const id = Number(params.id);
  const entry = db.entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="recent-section">
        <h3>Entry Not Found</h3>
        <p style={{ color: "var(--text2)" }}>The requested entry does not exist.</p>
        <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: 12 }}>
          Go Back
        </button>
      </div>
    );
  }

  const isBasic = currentUser?.access === "basic" && currentUser?.role !== "admin";
  const isOwnEntry = entry.createdBy === currentUser?.username;
  const canViewFull = !isBasic || isOwnEntry;

  const linkedEntries = db.entries.filter((e) => entry.linkedTo.includes(e.id));
  const reverseLinked = db.entries.filter((e) => e.linkedTo.includes(entry.id) && !entry.linkedTo.includes(e.id));
  const allLinked = [...linkedEntries, ...reverseLinked];

  const signal = db.signals.find((s) => s.entityId === entry.id);

  // Log the view
  const logView = () => {
    updateDb((d) => {
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "VIEW",
        detail: `Viewed record: ${entry.name}`,
      });

      // Check signals
      d.signals.forEach((sig) => {
        if (sig.entityId === entry.id && sig.setBy !== currentUser!.username) {
          d.notifications.push({
            message: `SIGNAL: ${currentUser!.username} viewed record for ${entry.name}`,
            forUser: sig.setBy,
            ts: new Date().toISOString(),
            read: false,
          });
          d.notifications.push({
            message: `SIGNAL: ${currentUser!.username} viewed record for ${entry.name}`,
            forUser: "admin",
            ts: new Date().toISOString(),
            read: false,
          });
        }
      });
    });
  };

  const handleRequestAccess = () => {
    if (!accessReason.trim()) {
      alert("Please provide a reason for your access request.");
      return;
    }
    updateDb((d) => {
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "ACCESS_REQ",
        detail: `Requested full access to: ${entry.name} | Reason: ${accessReason}`,
      });
      d.notifications.push({
        message: `Access request from ${currentUser!.username} for "${entry.name}": ${accessReason}`,
        forUser: "admin",
        ts: new Date().toISOString(),
        read: false,
      });
    });
    setShowAccessForm(false);
    setAccessReason("");
    alert("Access request sent to admin.");
  };

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => router.back()} style={{ marginBottom: 16 }}>
        &larr; Back
      </button>

      <div className="detail-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ marginBottom: 8 }}>{entry.name}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className={`badge badge-${entry.category}`}>{entry.category}</span>
              <span className={`badge badge-${entry.context}`}>{entry.context}</span>
              {signal && <span className="badge signal-active" style={{ background: "rgba(253,203,110,0.15)" }}>Signal Active</span>}
            </div>
          </div>
          <div style={{ textAlign: "right", color: "var(--text2)", fontSize: 12 }}>
            <div>Created by: {entry.createdBy}</div>
            <div>{formatDate(entry.createdAt)}</div>
          </div>
        </div>
      </div>

      {canViewFull ? (
        <>
          <div className="detail-section">
            <h4>Intelligence / Narrative</h4>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>{entry.narrative}</p>
          </div>

          {allLinked.length > 0 && (
            <div className="detail-section">
              <h4>Linked Entities ({allLinked.length})</h4>
              <div>
                {allLinked.map((linked) => (
                  <span
                    key={linked.id}
                    className="linked-entity"
                    onClick={() => { logView(); router.push(`/entry/${linked.id}`); }}
                  >
                    <span className={`badge badge-${linked.category}`}>{linked.category}</span>
                    {linked.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentUser?.role === "admin" && (
            <div className="detail-section">
              <h4>Admin Actions</h4>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!signal ? (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => {
                      updateDb((d) => {
                        d.signals.push({
                          entityId: entry.id,
                          entityName: entry.name,
                          setBy: currentUser.username,
                          setAt: new Date().toISOString(),
                        });
                        d.logs.unshift({
                          ts: new Date().toISOString(),
                          user: currentUser.username,
                          action: "SIGNAL_SET",
                          detail: `Set signal on: ${entry.name}`,
                        });
                      });
                    }}
                  >
                    Set Signal
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      updateDb((d) => {
                        d.signals = d.signals.filter((s) => s.entityId !== entry.id);
                        d.logs.unshift({
                          ts: new Date().toISOString(),
                          user: currentUser.username,
                          action: "SIGNAL_REMOVE",
                          detail: `Removed signal from: ${entry.name}`,
                        });
                      });
                    }}
                  >
                    Remove Signal
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="detail-section">
          <h4>Restricted Access</h4>
          <p style={{ color: "var(--text2)", marginBottom: 12 }}>
            You have basic access. Only summary information is shown. Request full access to see complete details.
          </p>
          {!showAccessForm ? (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAccessForm(true)}>
              Request Full Access
            </button>
          ) : (
            <div>
              <div className="form-group">
                <label>Reason for access request</label>
                <textarea
                  value={accessReason}
                  onChange={(e) => setAccessReason(e.target.value)}
                  placeholder="Explain why you need full access to this record..."
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleRequestAccess}>Submit Request</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAccessForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
