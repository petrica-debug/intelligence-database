"use client";
import { CategoryList } from "@/components/CategoryList";
import { Phone } from "lucide-react";
export default function MobilePage() {
  return <CategoryList category="mobile" title="Mobile Numbers" icon={<Phone size={32} />} emptyMsg="No mobile number entries yet." />;
}
