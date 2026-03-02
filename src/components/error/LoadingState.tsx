"use client";

import { cn } from "@/lib/cn";

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", className, fullScreen }: LoadingStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      fullScreen ? "min-h-screen" : "min-h-[300px] py-12",
      className
    )}>
      <div className="relative mb-5">
        <div className="w-10 h-10 rounded-full border-2 border-border animate-spin" style={{ borderTopColor: "var(--color-accent)" }} />
      </div>
      <p className="text-sm text-text-2 font-medium">{message}</p>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-7 w-48 bg-surface-3 rounded-lg" />
          <div className="h-4 w-72 bg-surface-3 rounded-lg mt-2" />
        </div>
        <div className="h-10 w-32 bg-surface-3 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface-3 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-surface-3 rounded-2xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-surface-3 rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-surface-3/60 rounded-xl" />
      ))}
    </div>
  );
}
