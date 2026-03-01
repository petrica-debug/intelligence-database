"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export function Topbar() {
  const { currentUser, logout, db, updateDb } = useApp();
  const router = useRouter();

  if (!currentUser) return null;

  const target = currentUser.role === "admin" ? "admin" : currentUser.username;
  const unreadCount = db.notifications.filter(
    (n) => (n.forUser === target || n.forUser === currentUser.username) && !n.read
  ).length;

  const handleLogout = () => {
    updateDb((d) => {
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser.username,
        action: "LOGOUT",
        detail: "User logged out",
      });
    });
    logout();
    router.replace("/");
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="db-icon">🛡️</span>
        <h2>IntelDB</h2>
      </div>
      <div className="topbar-right">
        <div
          className="notif-badge"
          id="notifBtn"
          onClick={() => {
            const panel = document.getElementById("notifPanel");
            panel?.classList.toggle("show");
          }}
        >
          🔔
          {unreadCount > 0 && (
            <span className="count" id="notifCount">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="user-badge">
          <span id="currentUserName">{currentUser.username}</span>
          <span className="role" id="currentUserRole">
            {currentUser.role === "admin"
              ? "Admin"
              : currentUser.access.toUpperCase()}
          </span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
