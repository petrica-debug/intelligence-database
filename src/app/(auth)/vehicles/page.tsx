"use client";
import { CategoryList } from "@/components/CategoryList";
import { Car } from "lucide-react";
export default function VehiclesPage() {
  return <CategoryList category="vehicle" title="Vehicles" icon={<Car size={32} />} emptyMsg="No vehicle entries yet." />;
}
