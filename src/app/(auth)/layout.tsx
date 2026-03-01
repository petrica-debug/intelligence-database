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
    <>
      <Topbar />
      <NotificationPanel />
      <div className="flex min-h-[calc(100vh-56px)]">
        <Sidebar pathname={pathname} />
        <main className="flex-1 p-7 overflow-y-auto max-h-[calc(100vh-56px)]">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </>
  );
}
