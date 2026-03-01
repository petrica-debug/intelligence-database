"use client";
import { CategoryList } from "@/components/CategoryList";
import { Building2 } from "lucide-react";
export default function CompaniesPage() {
  return <CategoryList category="company" title="Companies" icon={<Building2 size={32} />} emptyMsg="No company entries yet." />;
}
