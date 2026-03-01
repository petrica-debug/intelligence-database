"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard, Search, PenSquare, Users, Building2, Phone, MapPin, Car,
  Clock, Network, FileCheck, ScrollText, RotateCcw, Radio, UserCog
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItem { href: string; label: string; icon: ReactNode }

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/search", label: "Search", icon: <Search size={16} /> },
  { href: "/new-entry", label: "New Entry", icon: <PenSquare size={16} /> },
  { href: "/network", label: "Network Graph", icon: <Network size={16} /> },
  { href: "/timeline", label: "Timeline", icon: <Clock size={16} /> },
];

const CATS: NavItem[] = [
  { href: "/persons", label: "Persons", icon: <Users size={16} /> },
  { href: "/companies", label: "Companies", icon: <Building2 size={16} /> },
  { href: "/mobile", label: "Mobile Numbers", icon: <Phone size={16} /> },
  { href: "/addresses", label: "Addresses", icon: <MapPin size={16} /> },
  { href: "/vehicles", label: "Vehicles", icon: <Car size={16} /> },
];

const ADMIN: NavItem[] = [
  { href: "/admin/validations", label: "Validations", icon: <FileCheck size={16} /> },
  { href: "/admin/logs", label: "Audit Log", icon: <ScrollText size={16} /> },
  { href: "/admin/reverse-search", label: "Reverse Search", icon: <RotateCcw size={16} /> },
  { href: "/admin/signals", label: "Signals", icon: <Radio size={16} /> },
  { href: "/admin/users", label: "User Management", icon: <UserCog size={16} /> },
];

function active(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

function NLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const a = active(pathname, item.href);
  return (
    <Link href={item.href} className={cn(
      "flex items-center gap-3 px-4 py-2 text-[13px] rounded-lg mx-2 transition-all",
      a ? "text-accent bg-accent-muted font-medium" : "text-text-2 hover:text-text hover:bg-surface-2"
    )}>
      <span className={cn(a ? "text-accent" : "text-text-3")}>{item.icon}</span>
      {item.label}
    </Link>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div className="text-[10px] font-semibold text-text-3 uppercase tracking-[1.5px] px-4 mx-2 mt-5 mb-1.5">{children}</div>;
}

export function Sidebar({ pathname }: { pathname: string }) {
  const { currentUser, db } = useApp();
  const pending = db.pendingValidations.filter((v) => !v.resolved).length;

  return (
    <aside className="w-[240px] bg-surface border-r border-border flex flex-col shrink-0 max-md:hidden">
      <div className="flex-1 py-3 overflow-y-auto">
        <Label>Navigation</Label>
        {NAV.map((i) => <NLink key={i.href} item={i} pathname={pathname} />)}
        <Label>Categories</Label>
        {CATS.map((i) => <NLink key={i.href} item={i} pathname={pathname} />)}
        {currentUser?.role === "admin" && (
          <>
            <Label>Administration</Label>
            {ADMIN.map((i) => (
              <div key={i.href} className="relative">
                <NLink item={i} pathname={pathname} />
                {i.href === "/admin/validations" && pending > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pending}
                  </span>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
          <span className="text-[11px] text-text-3">System Online</span>
        </div>
      </div>
    </aside>
  );
}
