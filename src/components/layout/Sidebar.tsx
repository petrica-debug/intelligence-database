"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "📊 Dashboard", page: "dashboard" },
  { href: "/search", label: "🔍 Search", page: "search" },
  { href: "/new-entry", label: "✏️ New Entry", page: "new-entry" },
];

const CATEGORY_ITEMS = [
  { href: "/persons", label: "👤 Persons", page: "persons" },
  { href: "/companies", label: "🏢 Companies", page: "companies" },
  { href: "/mobile", label: "📱 Mobile Numbers", page: "mobile" },
  { href: "/addresses", label: "📍 Addresses / Places", page: "addresses" },
  { href: "/vehicles", label: "🚗 Vehicles", page: "vehicles" },
];

const ADMIN_ITEMS = [
  { href: "/admin/validations", label: "⏳ Pending Validations", page: "validations" },
  { href: "/admin/logs", label: "📋 Audit Log", page: "logs" },
  { href: "/admin/reverse-search", label: "🔄 Reverse Search", page: "reverse-search" },
  { href: "/admin/signals", label: "📡 Signals", page: "signals" },
  { href: "/admin/users", label: "👥 User Management", page: "users" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function Sidebar({ pathname }: { pathname: string }) {
  const { currentUser } = useApp();

  return (
    <div className="sidebar">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(pathname, item.href) ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
      <div className="section-label">Categories</div>
      {CATEGORY_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(pathname, item.href) ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
      {currentUser?.role === "admin" && (
        <>
          <div className="section-label">Administration</div>
          {ADMIN_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
