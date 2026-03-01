"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Search, PenSquare, Users, Building2, Phone, MapPin, Car,
  Clock, Network, FileCheck, ScrollText, RotateCcw, Radio, UserCog, Globe, BarChart3,
  ChevronLeft, ChevronRight, Database, FileText, Brain, Shield
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
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/search", label: "Search", icon: <Search size={20} /> },
    { href: "/new-entry", label: "New Entry", icon: <PenSquare size={20} /> },
    { href: "/network", label: "Network", icon: <Network size={20} /> },
    { href: "/geo", label: "Geographic", icon: <Globe size={20} /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    { href: "/reports", label: "Reports", icon: <FileText size={20} />, badge: (db.reports ?? []).length || undefined },
    { href: "/intelligence", label: "Intelligence", icon: <Brain size={20} />, badge: (db.inferredConnections ?? []).filter(c => c.status === "new").length || undefined },
    { href: "/timeline", label: "Timeline", icon: <Clock size={20} /> },
  ];

  const CATS: NavItem[] = [
    { href: "/persons", label: "Persons", icon: <Users size={20} />, badge: db.entries.filter(e => e.category === "person").length },
    { href: "/companies", label: "Organizations", icon: <Building2 size={20} />, badge: db.entries.filter(e => e.category === "company").length },
    { href: "/mobile", label: "Contacts", icon: <Phone size={20} />, badge: db.entries.filter(e => e.category === "mobile").length },
    { href: "/addresses", label: "Addresses", icon: <MapPin size={20} />, badge: db.entries.filter(e => e.category === "address").length },
    { href: "/vehicles", label: "Vehicles", icon: <Car size={20} />, badge: db.entries.filter(e => e.category === "vehicle").length },
  ];

  const ADMIN: NavItem[] = [
    { href: "/admin/validations", label: "Validations", icon: <FileCheck size={20} />, badge: pending || undefined },
    { href: "/admin/logs", label: "Audit Log", icon: <ScrollText size={20} /> },
    { href: "/admin/reverse-search", label: "Reverse Search", icon: <RotateCcw size={20} /> },
    { href: "/admin/signals", label: "Signals", icon: <Radio size={20} /> },
    { href: "/admin/users", label: "Users", icon: <UserCog size={20} /> },
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    const a = isActive(item.href);
    return (
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
          collapsed ? "justify-center w-11 h-11 mx-auto" : "px-3 py-2.5 mx-2",
          a
            ? "bg-accent text-white shadow-md shadow-accent/15"
            : "text-text-2 hover:bg-accent/[0.06] hover:text-accent"
        )}
      >
        <span className={cn(
          "shrink-0 transition-colors duration-200",
          a ? "text-white" : "text-text-3 group-hover:text-accent"
        )}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className={cn("text-[13px] truncate", a ? "font-semibold" : "font-medium")}>
              {item.label}
            </span>
            {item.badge != null && item.badge > 0 && (
              <span className={cn(
                "ml-auto text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center",
                a ? "bg-white/25 text-white" : "bg-surface-3 text-text-3"
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
    if (collapsed) return <div className="my-2 mx-4 border-t border-border/60" />;
    return (
      <div className="flex items-center gap-2 mx-4 mt-5 mb-2">
        <span className="text-[10px] font-semibold text-text-3/70 uppercase tracking-[1.5px]">{children}</span>
        <div className="flex-1 h-px bg-border/40" />
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "relative bg-surface border-r border-border flex flex-col shrink-0 max-md:hidden transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* Toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center text-text-3 hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin">
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
      </div>

      {/* Footer */}
      <div className={cn(
        "border-t border-border/60 transition-all duration-300",
        collapsed ? "p-2" : "p-3 mx-2 mb-2"
      )}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
            <Database size={14} className="text-text-3" />
          </div>
        ) : (
          <div className="bg-surface-2/80 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
              <span className="text-[11px] font-medium text-text-2">System Active</span>
            </div>
            {currentUser && (
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Shield size={11} className="text-accent" />
                <span className="text-[10px] font-semibold text-accent">
                  {CLEARANCE_LABELS[(currentUser.clearance ?? 1) as ClearanceLevel]} (L{currentUser.clearance ?? 1})
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1">
              <div className="text-center bg-surface rounded-lg py-1.5">
                <div className="text-sm font-bold text-accent">{db.entries.length}</div>
                <div className="text-[9px] text-text-3 uppercase">Entities</div>
              </div>
              <div className="text-center bg-surface rounded-lg py-1.5">
                <div className="text-sm font-bold text-accent">{db.entries.reduce((s, e) => s + e.linkedTo.length, 0)}</div>
                <div className="text-[9px] text-text-3 uppercase">Links</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
