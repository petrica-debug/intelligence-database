"use client";

import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationPanel } from "@/components/layout/NotificationPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) router.replace("/");
  }, [currentUser, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text-2 text-sm">Loading...</div>
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar pathname={pathname} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <NotificationPanel />
        <main className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 scrollbar-thin">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
