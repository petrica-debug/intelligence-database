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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "var(--text2)",
        }}
      >
        Loading...
      </div>
    );
  }

  return <LoginForm />;
}
