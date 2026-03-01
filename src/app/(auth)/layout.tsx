"use client";

import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationPanel } from "@/components/layout/NotificationPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser) router.replace("/");
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text2)" }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Topbar />
      <NotificationPanel />
      <div className="layout">
        <Sidebar pathname={pathname} />
        <main className="main">{children}</main>
      </div>
    </>
  );
}
