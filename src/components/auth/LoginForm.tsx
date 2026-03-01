"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Shield, ArrowRight } from "lucide-react";
import { Button, Input } from "@/components/ui";

const DEMO = [
  { user: "admin", pass: "admin", label: "Administrator", access: "Full + Admin" },
  { user: "analyst1", pass: "analyst1", label: "Senior Analyst", access: "Full Access" },
  { user: "analyst2", pass: "analyst2", label: "Analyst", access: "Full Access" },
  { user: "fieldops1", pass: "fieldops1", label: "Field Operations", access: "Basic Access" },
];

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, updateDb } = useApp();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const u = username.trim(), p = password.trim();
    if (!u || !p) { setError("Please enter credentials."); return; }
    if (!login(u, p)) { setError("Invalid credentials or account disabled."); return; }
    updateDb((db) => { db.logs.unshift({ ts: new Date().toISOString(), user: u, action: "LOGIN", detail: "User logged in" }); });
    router.replace("/dashboard");
  };

  const quickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    if (!login(u, p)) return;
    updateDb((db) => { db.logs.unshift({ ts: new Date().toISOString(), user: u, action: "LOGIN", detail: "User logged in" }); });
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8edf5] via-[#f0f4f8] to-[#dce4ef] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #1e3a5f 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#1e3a5f]/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-amber/5 blur-[100px]" />

      <div className="relative z-10 w-[440px] max-w-[90vw] animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-accent">Roma Foundations for Europe</h1>
          <p className="text-sm text-text-2 mt-1">Secure Data Management System</p>
          <div className="flex items-center gap-2 justify-center mt-3">
            <div className="w-12 h-px bg-border" />
            <span className="text-[10px] text-text-3 uppercase tracking-widest">Authorized Access Only</span>
            <div className="w-12 h-px bg-border" />
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-surface/90 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={submit} className="space-y-4">
            <Input id="user" label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username"
              onKeyDown={(e) => { if (e.key === "Enter") (document.getElementById("pass") as HTMLInputElement)?.focus(); }} />
            <Input id="pass" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            {error && <p className="text-red text-[13px]">{error}</p>}
            <Button type="submit" className="w-full" size="lg">Sign In <ArrowRight size={14} /></Button>
          </form>
        </div>

        {/* Quick Access */}
        <div className="mt-6 bg-surface/70 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm">
          <h4 className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-3">Quick Access — Demo Accounts</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO.map((d) => (
              <button key={d.user} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors text-left cursor-pointer group"
                onClick={() => quickLogin(d.user, d.pass)}>
                <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {d.user[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium truncate">{d.user}</div>
                  <div className="text-[10px] text-text-3 truncate">{d.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-text-3">44 entities · 5 countries · {new Date().getFullYear()} RFE Database</p>
        </div>
      </div>
    </div>
  );
}
