"use client";

import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";

export function NotificationPanel() {
  const { currentUser, db, updateDb } = useApp();

  if (!currentUser) return null;

  const target = currentUser.role === "admin" ? "admin" : currentUser.username;
  const notifs = [...db.notifications]
    .filter((n) => n.forUser === target || n.forUser === currentUser.username)
    .reverse();

  const handleToggle = () => {
    const panel = document.getElementById("notifPanel");
    panel?.classList.toggle("show");
  };

  return (
    <div className="notif-panel" id="notifPanel">
      {notifs.length === 0 ? (
        <div
          style={{
            padding: 20,
            color: "var(--text2)",
            textAlign: "center",
          }}
        >
          No notifications
        </div>
      ) : (
        notifs.map((n, i) => {
          n.read = true;
          return (
            <div key={i} className="notif-item">
              <div>{n.message}</div>
              <div className="notif-time">{formatDate(n.ts)}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
