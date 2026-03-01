"use client";
import { CategoryList } from "@/components/CategoryList";
import { MapPin } from "lucide-react";
export default function AddressesPage() {
  return <CategoryList category="address" title="Addresses" icon={<MapPin size={32} />} emptyMsg="No address entries yet." />;
}
