
"use client";

import { Modal } from "@/components/ui";
import type { Entry } from "@/types";
import { Badge } from "@/components/ui";
import Link from "next/link";

interface EntityPreviewModalProps {
  entity: Entry | null;
  onClose: () => void;
  getEntry: (id: number) => Entry | undefined;
}

export function EntityPreviewModal({ entity, onClose, getEntry }: EntityPreviewModalProps) {
  if (!entity) return null;

  return (
    <Modal open={!!entity} onClose={onClose} title={entity.name}>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-text-2">Category</h3>
          <Badge variant={entity.category.toLowerCase() as any} className="mt-1">{entity.category}</Badge>
        </div>
        {entity.country && (
          <div>
            <h3 className="text-sm font-medium text-text-2">Country</h3>
            <p>{entity.country}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-text-2">Linked Entities</h3>
          {entity.linkedTo.length > 0 ? (
            <ul className="mt-1 space-y-2">
              {entity.linkedTo.map(linkedId => {
                const linkedEntry = getEntry(linkedId);
                return (
                  <li key={linkedId}>
                    {linkedEntry ? (
                       <Link href={`/entry/${linkedEntry.id}`} className="text-accent hover:underline">
                        {linkedEntry.name}
                      </Link>
                    ) : (
                      `Unknown Entry (${linkedId})`
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-text-3 text-sm mt-1">No linked entities.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
