"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { AccessLevel } from "@/types";

export default function UsersPage() {
  const { db, currentUser, updateDb } = useApp();
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAccess, setNewAccess] = useState<AccessLevel>("basic");

  if (currentUser?.role !== "admin") {
    return <div className="recent-section"><p style={{ color: "var(--red)" }}>Access denied. Admin only.</p></div>;
  }

  const handleAddUser = () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      alert("Please fill in username and password.");
      return;
    }
    if (db.users.some((u) => u.username === newUsername.trim())) {
      alert("Username already exists.");
      return;
    }
    updateDb((d) => {
      d.users.push({
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: "user",
        access: newAccess,
        active: true,
      });
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "USER_CREATE",
        detail: `Created user: ${newUsername.trim()} (${newAccess} access)`,
      });
    });
    setNewUsername("");
    setNewPassword("");
    setNewAccess("basic");
  };

  const toggleActive = (username: string) => {
    if (username === "admin") return;
    updateDb((d) => {
      const user = d.users.find((u) => u.username === username);
      if (!user) return;
      user.active = !user.active;
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: user.active ? "USER_ENABLE" : "USER_DISABLE",
        detail: `${user.active ? "Enabled" : "Disabled"} user: ${username}`,
      });
    });
  };

  const changeAccess = (username: string, access: AccessLevel) => {
    updateDb((d) => {
      const user = d.users.find((u) => u.username === username);
      if (!user) return;
      user.access = access;
      d.logs.unshift({
        ts: new Date().toISOString(),
        user: currentUser!.username,
        action: "ACCESS_CHANGE",
        detail: `Changed ${username} access to: ${access}`,
      });
    });
  };

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>User Management</h2>

      <div className="recent-section" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Add New User</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
            <label>Username</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="username" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
            <label>Password</label>
            <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="password" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
            <label>Access Level</label>
            <select value={newAccess} onChange={(e) => setNewAccess(e.target.value as AccessLevel)}>
              <option value="basic">Basic</option>
              <option value="full">Full</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAddUser}>Add User</button>
        </div>
      </div>

      <div className="recent-section">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Users ({db.users.length})</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Access</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.users.map((u) => (
              <tr key={u.username}>
                <td><strong>{u.username}</strong></td>
                <td><span className="badge badge-person">{u.role}</span></td>
                <td>
                  {u.role === "admin" ? (
                    <span className="badge badge-approved">full</span>
                  ) : (
                    <select
                      value={u.access}
                      onChange={(e) => changeAccess(u.username, e.target.value as AccessLevel)}
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        color: "var(--text)",
                        padding: "4px 8px",
                        fontSize: 12,
                      }}
                    >
                      <option value="basic">Basic</option>
                      <option value="full">Full</option>
                    </select>
                  )}
                </td>
                <td>
                  <span className={`badge ${u.active ? "badge-approved" : "badge-rejected"}`}>
                    {u.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>
                  {u.username !== "admin" && (
                    <button
                      className={`btn btn-sm ${u.active ? "btn-danger" : "btn-success"}`}
                      onClick={() => toggleActive(u.username)}
                    >
                      {u.active ? "Disable" : "Enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
