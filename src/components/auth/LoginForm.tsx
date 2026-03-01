"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login, updateDb } = useApp();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();
    if (!trimmedUser || !trimmedPass) {
      setError("Please enter username and password.");
      return;
    }
    const success = login(trimmedUser, trimmedPass);
    if (!success) {
      setError("Invalid credentials or account disabled.");
      return;
    }
    updateDb((db) => {
      db.logs.unshift({
        ts: new Date().toISOString(),
        user: trimmedUser,
        action: "LOGIN",
        detail: "User logged in",
      });
    });
    router.replace("/dashboard");
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="logo">🛡️</div>
        <h1>Intelligence Database</h1>
        <p className="subtitle">Secure Information Management System</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loginUser">Username</label>
            <input
              id="loginUser"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              onKeyDown={(e) => {
                if (e.key === "Enter") passwordRef.current?.focus();
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="loginPass">Password</label>
            <input
              id="loginPass"
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
              }}
            />
          </div>
          {error && (
            <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-full">
            Sign In
          </button>
        </form>
        <div className="demo-users">
          <h4>Demo Accounts</h4>
          <div className="user-row">
            <strong>admin</strong>
            <span>pass: admin (Administrator)</span>
          </div>
          <div className="user-row">
            <strong>analyst1</strong>
            <span>pass: analyst1 (Full access)</span>
          </div>
          <div className="user-row">
            <strong>agent1</strong>
            <span>pass: agent1 (Basic access)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
