import type { Vehicle } from "@/types";
import { getVehicleDisplayName } from "@/utils/entity-display";

export function matchesVehicleSearch(vehicle: Vehicle, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableFields = [vehicle.displayName ?? "", vehicle.licensePlate, vehicle.brand, vehicle.model, getVehicleDisplayName(vehicle)];

  return searchableFields.some((field) => field.toLowerCase().includes(normalizedQuery));
}
