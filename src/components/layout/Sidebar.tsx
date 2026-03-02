"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Search, PenSquare, Users, Building2, Phone, MapPin, Car,
  Clock, Network, FileCheck, ScrollText, RotateCcw, Radio, UserCog, Globe, BarChart3,
  ChevronLeft, ChevronRight, FileText, Brain, X, Shield
} from "lucide-react";
import { CLEARANCE_LABELS } from "@/types";
import type { ClearanceLevel } from "@/types";
import type { ReactNode } from "react";

interface NavItem { href: string; label: string; icon: ReactNode; badge?: number; count?: number }

interface SidebarProps {
  pathname: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ pathname, mobileOpen = false, onMobileClose }: SidebarProps) {
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
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/search", label: "Search", icon: <Search size={16} /> },
    { href: "/new-entry", label: "New Entry", icon: <PenSquare size={16} /> },
    { href: "/network", label: "Network", icon: <Network size={16} /> },
    { href: "/geo", label: "Geographic", icon: <Globe size={16} /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
    { href: "/reports", label: "Reports", icon: <FileText size={16} />, badge: (db.reports ?? []).length || undefined },
    { href: "/intelligence", label: "Intelligence", icon: <Brain size={16} />, badge: (db.inferredConnections ?? []).filter(c => c.status === "new").length || undefined },
    { href: "/timeline", label: "Timeline", icon: <Clock size={16} /> },
  ];

  const CATS: NavItem[] = [
    { href: "/persons", label: "Persons", icon: <Users size={16} />, count: db.entries.filter(e => e.category === "person").length },
    { href: "/companies", label: "Organizations", icon: <Building2 size={16} />, count: db.entries.filter(e => e.category === "company").length },
    { href: "/mobile", label: "Contacts", icon: <Phone size={16} />, count: db.entries.filter(e => e.category === "mobile").length },
    { href: "/addresses", label: "Addresses", icon: <MapPin size={16} />, count: db.entries.filter(e => e.category === "address").length },
    { href: "/vehicles", label: "Vehicles", icon: <Car size={16} />, count: db.entries.filter(e => e.category === "vehicle").length },
  ];

  const ADMIN: NavItem[] = [
    { href: "/admin/validations", label: "Validations", icon: <FileCheck size={16} />, badge: pending || undefined },
    { href: "/admin/logs", label: "Audit Log", icon: <ScrollText size={16} /> },
    { href: "/admin/reverse-search", label: "Reverse Search", icon: <RotateCcw size={16} /> },
    { href: "/admin/signals", label: "Signals", icon: <Radio size={16} /> },
    { href: "/admin/users", label: "Users", icon: <UserCog size={16} /> },
  ];

  const sections = [
    { label: "NAVIGATION", items: NAV },
    { label: "ENTITIES", items: CATS },
    ...(currentUser?.role === "admin" ? [{ label: "SYSTEM", items: ADMIN }] : []),
  ];

  const totalLinks = db.entries.reduce((s, e) => s + e.linkedTo.length, 0);
  const regions = new Set(db.entries.map((e) => e.country).filter(Boolean)).size;

  const NavLink = ({ item, mobile }: { item: NavItem; mobile?: boolean }) => {
    const a = isActive(item.href);
    return (
      <Link
        href={item.href}
        title={collapsed && !mobile ? item.label : undefined}
        onClick={onMobileClose}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl font-medium transition-all duration-200 relative group",
          mobile
            ? "px-3 py-3 text-[15px]"
            : collapsed
              ? "justify-center w-10 h-10 mx-auto text-[13px]"
              : "px-3 py-2.5 text-[13px]",
          a
            ? "bg-sb-active/[0.12] text-sb-bright font-semibold"
            : "text-sb-fg hover:bg-sb-2/40 hover:text-sb-bright"
        )}
      >
        {a && !collapsed && !mobile && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-sb-active" />
        )}
        <span className={cn("shrink-0", a ? "text-sb-active" : "group-hover:text-sb-bright")}>
          {item.icon}
        </span>
        {(mobile || !collapsed) && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className={cn(
                "font-bold min-w-[24px] text-center rounded-md px-2 py-0.5",
                mobile ? "text-[12px]" : "text-[9px]",
                a ? "text-sb-bright" : "bg-sb-active/15 text-sb-active"
              )}>
                {item.badge}
              </span>
            )}
            {item.count != null && item.count > 0 && !item.badge && (
              <span className="text-[11px] font-mono font-semibold text-sb-fg/45 tabular-nums">
                {item.count}
              </span>
            )}
          </>
        )}
        {!mobile && collapsed && item.badge != null && item.badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber" />
        )}
      </Link>
    );
  };

  /* ── Mobile Drawer ── */
  const mobileDrawer = (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[320px] gradient-sidebar flex flex-col border-r border-sb-border transition-transform duration-300 ease-in-out md:hidden noise-texture",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-sb-active/5 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between px-5 py-5 border-b border-sb-border/60 relative">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shadow-glow-blue relative">
              <Shield size={18} className="text-white" />
              <div className="absolute inset-0 rounded-xl gradient-blue opacity-50 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-sb-bright leading-tight tracking-tight font-display">RFE Database</h1>
              <p className="text-[9px] text-sb-fg/60 uppercase tracking-[0.2em] mt-1 font-medium">Roma Foundations for Europe</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg text-sb-fg hover:text-sb-bright hover:bg-sb-2/50 transition-colors cursor-pointer active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin space-y-7">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-bold text-sb-fg/35 uppercase tracking-[0.25em] px-3 mb-2.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((i) => <NavLink key={i.href} item={i} mobile />)}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-sb-border/60 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stat-green opacity-50" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stat-green" />
            </span>
            <span className="text-[11px] font-medium text-sb-fg">System Online</span>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xl font-extrabold text-sb-bright font-mono tabular-nums">{db.entries.length}</span>
              <p className="text-[8px] text-sb-fg/40 uppercase tracking-[0.2em] font-bold mt-0.5">Entities</p>
            </div>
            <div className="w-px h-8 bg-sb-border/60" />
            <div>
              <span className="text-xl font-extrabold text-sb-bright font-mono tabular-nums">{totalLinks}</span>
              <p className="text-[8px] text-sb-fg/40 uppercase tracking-[0.2em] font-bold mt-0.5">Links</p>
            </div>
            <div className="w-px h-8 bg-sb-border/60" />
            <div>
              <span className="text-xl font-extrabold text-sb-bright font-mono tabular-nums">{regions}</span>
              <p className="text-[8px] text-sb-fg/40 uppercase tracking-[0.2em] font-bold mt-0.5">Regions</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );

  /* ── Desktop Sidebar ── */
  const desktopSidebar = (
    <aside
      className={cn(
        "relative gradient-sidebar flex-col shrink-0 border-r border-sb-border transition-all duration-300 ease-in-out hidden md:flex overflow-hidden noise-texture",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-sb-active/5 blur-3xl pointer-events-none" />

      {/* Brand */}
      <div className={cn("border-b border-sb-border/60 relative", collapsed ? "px-2 py-4" : "px-5 py-6")}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shadow-glow-blue mx-auto relative">
            <Shield size={18} className="text-white" />
            <div className="absolute inset-0 rounded-xl gradient-blue opacity-50 blur-md -z-10" />
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shadow-glow-blue shrink-0 relative">
              <Shield size={18} className="text-white" />
              <div className="absolute inset-0 rounded-xl gradient-blue opacity-50 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-sb-bright leading-tight tracking-tight font-display">RFE Database</h1>
              <p className="text-[9px] text-sb-fg/60 uppercase tracking-[0.2em] mt-1 font-medium">Roma Foundations for Europe</p>
            </div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-[76px] z-10 w-6 h-6 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center text-text-3 hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin space-y-7 relative">
        {sections.map((section, si) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: si * 0.08, duration: 0.4 }}
          >
            {collapsed ? (
              <div className="my-2 mx-3 border-t border-sb-border" />
            ) : (
              <p className="text-[9px] font-bold text-sb-fg/35 uppercase tracking-[0.25em] px-3 mb-2.5">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((i) => <NavLink key={i.href} item={i} />)}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-sb-border/60 relative", collapsed ? "p-2" : "px-5 py-5")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stat-green opacity-50" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stat-green" />
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stat-green opacity-50" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stat-green" />
              </span>
              <span className="text-[11px] font-medium text-sb-fg">System Online</span>
            </div>
            {currentUser && (
              <p className="text-[9px] text-sb-fg/50 font-medium mb-2.5 uppercase tracking-[0.15em]">
                {CLEARANCE_LABELS[(currentUser.clearance ?? 1) as ClearanceLevel]} (L{currentUser.clearance ?? 1})
              </p>
            )}
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xl font-extrabold text-sb-bright font-mono tabular-nums">{db.entries.length}</span>
                <p className="text-[8px] text-sb-fg/40 uppercase tracking-[0.2em] font-bold mt-0.5">Entities</p>
              </div>
              <div className="w-px h-8 bg-sb-border/60" />
              <div>
                <span className="text-xl font-extrabold text-sb-bright font-mono tabular-nums">{totalLinks}</span>
                <p className="text-[8px] text-sb-fg/40 uppercase tracking-[0.2em] font-bold mt-0.5">Links</p>
              </div>
              <div className="w-px h-8 bg-sb-border/60" />
              <div>
                <span className="text-xl font-extrabold text-sb-bright font-mono tabular-nums">{regions}</span>
                <p className="text-[8px] text-sb-fg/40 uppercase tracking-[0.2em] font-bold mt-0.5">Regions</p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {mobileDrawer}
      {desktopSidebar}
    </>
  );
}
