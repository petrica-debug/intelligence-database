"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/lib/utils";
import { PageHeader, GlassCard, Badge, EmptyState } from "@/components/ui";
import { Link2 } from "lucide-react";
import type { EntityCategory } from "@/types";
import type { ReactNode } from "react";

interface Props { category: EntityCategory; title: string; icon: ReactNode; emptyMsg: string }

export function CategoryList({ category, title, icon, emptyMsg }: Props) {
  const { db } = useApp();
  const router = useRouter();
  const entries = db.entries.filter((e) => e.category === category).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader title={`${title} (${entries.length})`} description={`All ${title.toLowerCase()} entries in the database`} />
      {entries.length === 0 ? (
        <EmptyState icon={icon} title={`No ${title}`} description={emptyMsg} />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <GlassCard key={entry.id} className="cursor-pointer hover:border-accent/40" onClick={() => router.push(`/entry/${entry.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[15px] font-semibold">{entry.name}</h3>
                <Badge variant={entry.context as never}>{entry.context}</Badge>
              </div>
              <p className="text-[13px] text-text-2 leading-relaxed">{entry.narrative.substring(0, 150)}{entry.narrative.length > 150 ? "..." : ""}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-text-3">
                <span>by {entry.createdBy}</span>
                <span>{formatDate(entry.createdAt)}</span>
                <span className="flex items-center gap-1"><Link2 size={10} /> {entry.linkedTo.length} links</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
