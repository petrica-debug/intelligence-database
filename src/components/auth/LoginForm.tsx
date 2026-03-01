"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Shield, ArrowRight, Lock, User } from "lucide-react";
import { Button } from "@/components/ui";

const DEMO = [
  { user: "admin", pass: "admin", label: "Administrator", access: "Full + Admin" },
  { user: "analyst1", pass: "analyst1", label: "Senior Analyst", access: "Full Access" },
  { user: "analyst2", pass: "analyst2", label: "Analyst", access: "Full Access" },
  { user: "fieldops1", pass: "fieldops1", label: "Field Ops", access: "Basic Access" },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e4ebf5] via-[#eef2f7] to-[#dce4ef] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #1e3a5f 0.5px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-[20%] left-[15%] w-[600px] h-[600px] rounded-full bg-accent/[0.04] blur-[150px]" />
      <div className="absolute bottom-[15%] right-[15%] w-[500px] h-[500px] rounded-full bg-amber/[0.04] blur-[120px]" />

      <div className="relative z-10 w-[420px] max-w-[90vw] animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-hover text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent/20">
            <Shield size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-accent">Roma Foundations for Europe</h1>
          <p className="text-[13px] text-text-2 mt-1.5">Secure Intelligence Platform</p>
          <div className="flex items-center gap-3 justify-center mt-4">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-border" />
            <span className="text-[9px] text-text-3 uppercase tracking-[2px] font-semibold">Authorized Access Only</span>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-border" />
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-xl border border-border/60 rounded-2xl p-7 shadow-xl shadow-black/[0.04]">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
                <input
                  type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-text text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white placeholder:text-text-3"
                  onKeyDown={(e) => { if (e.key === "Enter") (document.getElementById("login-pass") as HTMLInputElement)?.focus(); }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-text-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
                <input
                  id="login-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-text text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-white placeholder:text-text-3"
                />
              </div>
            </div>
            {error && <p className="text-red text-[12px] font-medium">{error}</p>}
            <Button type="submit" className="w-full" size="lg">Sign In <ArrowRight size={14} /></Button>
          </form>
        </div>

        {/* Quick Access */}
        <div className="mt-5 bg-white/60 backdrop-blur-sm border border-border/40 rounded-2xl p-4 shadow-sm">
          <h4 className="text-[9px] font-semibold text-text-3 uppercase tracking-[1.5px] mb-3">Quick Access</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO.map((d) => (
              <button
                key={d.user}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white transition-all text-left cursor-pointer group border border-transparent hover:border-border/60 hover:shadow-sm"
                onClick={() => quickLogin(d.user, d.pass)}
              >
                <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                  {d.user[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold truncate text-text">{d.label}</div>
                  <div className="text-[9px] text-text-3 truncate">{d.access}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-text-3 font-medium tracking-wide">102 entities &middot; 12 regions &middot; {new Date().getFullYear()} RFE Database</p>
        </div>
      </div>
    </div>
  );
}
