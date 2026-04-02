import type { Vehicle } from "@/types";

export function matchesVehicleSearch(vehicle: Vehicle, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableFields = [vehicle.licensePlate, vehicle.brand, vehicle.model];

  return searchableFields.some((field) => field.toLowerCase().includes(normalizedQuery));
}
