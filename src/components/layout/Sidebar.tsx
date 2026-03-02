"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Search, PenSquare, Users, Building2, Phone, MapPin, Car,
  Clock, Network, FileCheck, ScrollText, RotateCcw, Radio, UserCog, Globe, BarChart3,
  ChevronLeft, ChevronRight, FileText, Brain, Shield
} from "lucide-react";
import { CLEARANCE_LABELS } from "@/types";
import type { ClearanceLevel } from "@/types";
import type { ReactNode } from "react";

interface NavItem { href: string; label: string; icon: ReactNode; badge?: number }

export function Sidebar({ pathname }: { pathname: string }) {
  const { currentUser, db } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const pending = db.pendingValidations.filter((v) => !v.resolved).length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rfe_sidebar");
      if (saved === "collapsed") setCollapsed(true);
    } catch {}
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("rfe_sidebar", next ? "collapsed" : "expanded"); } catch {}
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const NAV: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { href: "/search", label: "Search", icon: <Search size={15} /> },
    { href: "/new-entry", label: "New Entry", icon: <PenSquare size={15} /> },
    { href: "/network", label: "Network", icon: <Network size={15} /> },
    { href: "/geo", label: "Geographic", icon: <Globe size={15} /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 size={15} /> },
    { href: "/reports", label: "Reports", icon: <FileText size={15} />, badge: (db.reports ?? []).length || undefined },
    { href: "/intelligence", label: "Intelligence", icon: <Brain size={15} />, badge: (db.inferredConnections ?? []).filter(c => c.status === "new").length || undefined },
    { href: "/timeline", label: "Timeline", icon: <Clock size={15} /> },
  ];

  const CATS: NavItem[] = [
    { href: "/persons", label: "Persons", icon: <Users size={15} />, badge: db.entries.filter(e => e.category === "person").length },
    { href: "/companies", label: "Organizations", icon: <Building2 size={15} />, badge: db.entries.filter(e => e.category === "company").length },
    { href: "/mobile", label: "Contacts", icon: <Phone size={15} />, badge: db.entries.filter(e => e.category === "mobile").length },
    { href: "/addresses", label: "Addresses", icon: <MapPin size={15} />, badge: db.entries.filter(e => e.category === "address").length },
    { href: "/vehicles", label: "Vehicles", icon: <Car size={15} />, badge: db.entries.filter(e => e.category === "vehicle").length },
  ];

  const ADMIN: NavItem[] = [
    { href: "/admin/validations", label: "Validations", icon: <FileCheck size={15} />, badge: pending || undefined },
    { href: "/admin/logs", label: "Audit Log", icon: <ScrollText size={15} /> },
    { href: "/admin/reverse-search", label: "Reverse Search", icon: <RotateCcw size={15} /> },
    { href: "/admin/signals", label: "Signals", icon: <Radio size={15} /> },
    { href: "/admin/users", label: "Users", icon: <UserCog size={15} /> },
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    const a = isActive(item.href);
    return (
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "w-full flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
          collapsed ? "justify-center w-10 h-10 mx-auto" : "px-2.5 py-[7px]",
          a
            ? "bg-sb-2 text-sb-bright font-semibold"
            : "text-sb-fg hover:bg-sb-2/50 hover:text-sb-bright"
        )}
      >
        <span className={cn("shrink-0", a ? "text-sb-active" : "")}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className={cn(
                "text-[10px] font-bold min-w-[20px] text-center rounded-md px-1.5 py-0.5",
                a ? "text-sb-bright" : "bg-sb-active/20 text-sb-active"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge != null && item.badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber" />
        )}
      </Link>
    );
  };

  const SectionLabel = ({ children }: { children: ReactNode }) => {
    if (collapsed) return <div className="my-2 mx-3 border-t border-sb-border" />;
    return (
      <p className="text-[10px] font-semibold text-sb-fg/60 uppercase tracking-widest px-2 mb-1.5 mt-4">
        {children}
      </p>
    );
  };

  const totalLinks = db.entries.reduce((s, e) => s + e.linkedTo.length, 0);

  return (
    <aside
      className={cn(
        "relative bg-sb flex flex-col shrink-0 border-r border-sb-border transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-56"
      )}
    >
      {/* Brand */}
      <div className={cn("border-b border-sb-border", collapsed ? "px-2 py-4" : "px-4 py-5")}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-glow-blue mx-auto">
            <Globe size={14} className="text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-glow-blue shrink-0">
              <Globe size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sb-bright leading-tight">RFE Database</h1>
              <p className="text-[10px] text-sb-fg uppercase tracking-wider">Roma Foundations for Europe</p>
            </div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center text-text-3 hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin space-y-1">
        <SectionLabel>Navigation</SectionLabel>
        <div className="space-y-0.5">
          {NAV.map((i) => <NavLink key={i.href} item={i} />)}
        </div>

        <SectionLabel>Entities</SectionLabel>
        <div className="space-y-0.5">
          {CATS.map((i) => <NavLink key={i.href} item={i} />)}
        </div>

        {currentUser?.role === "admin" && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <div className="space-y-0.5">
              {ADMIN.map((i) => <NavLink key={i.href} item={i} />)}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-sb-border", collapsed ? "p-2" : "px-4 py-3")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
              <span className="text-[11px] font-medium text-sb-fg">System Active</span>
            </div>
            {currentUser && (
              <p className="text-[10px] text-sb-fg/60 font-medium mb-2">
                {CLEARANCE_LABELS[(currentUser.clearance ?? 1) as ClearanceLevel]} (L{currentUser.clearance ?? 1})
              </p>
            )}
            <div className="flex items-center gap-4">
              <div>
                <span className="text-lg font-extrabold text-sb-bright font-mono">{db.entries.length}</span>
                <p className="text-[9px] text-sb-fg/60 uppercase tracking-widest">Entities</p>
              </div>
              <div>
                <span className="text-lg font-extrabold text-sb-bright font-mono">{totalLinks}</span>
                <p className="text-[9px] text-sb-fg/60 uppercase tracking-widest">Links</p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
