"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { LoginForm } from "@/components/auth/LoginForm";

export default function HomePage() {
  const { currentUser, isReady } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (currentUser) {
      router.replace("/dashboard");
    }
  }, [currentUser, isReady, router]);

  if (!isReady || currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text-2 text-sm">
        Loading...
      </div>
    );
  }

  return <LoginForm />;
}
