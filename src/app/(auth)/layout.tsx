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
      <div className="flex items-center justify-center min-h-screen text-text-2 text-sm">Loading...</div>
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar pathname={pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <NotificationPanel />
        <main className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
