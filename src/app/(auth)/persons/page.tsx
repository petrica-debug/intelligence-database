"use client";
import { CategoryList } from "@/components/CategoryList";
import { Users } from "lucide-react";
export default function PersonsPage() {
  return <CategoryList category="person" title="Persons" icon={<Users size={32} />} emptyMsg="No person entries yet." />;
}
