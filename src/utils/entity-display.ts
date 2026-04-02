import type { Client, Vehicle } from "@/types";

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getClientDisplayName(client?: Pick<Client, "firstName" | "lastName">) {
  if (!client) {
    return "Cliente sin relación";
  }

  const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
  return fullName || "Cliente pendiente";
}

export function splitClientName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function getVehicleDisplayName(vehicle?: Partial<Vehicle>) {
  if (!vehicle) {
    return "Vehículo sin relación";
  }

  if (vehicle.displayName?.trim()) {
    return vehicle.displayName.trim();
  }

  const descriptor = [vehicle.brand, vehicle.model].filter(Boolean).join(" ").trim();
  const licensePlate = vehicle.licensePlate?.trim();

  if (licensePlate && descriptor) {
    return `${licensePlate} · ${descriptor}`;
  }

  return licensePlate || descriptor || "Vehículo pendiente";
}

export function getVehicleTechnicalSummary(vehicle: Pick<Vehicle, "year" | "mileageKm" | "color">) {
  const parts = [
    vehicle.year > 0 ? String(vehicle.year) : "",
    vehicle.color.trim(),
    vehicle.mileageKm > 0 ? `${vehicle.mileageKm.toLocaleString("es-CL")} km` : "",
  ].filter(Boolean);

  return parts.join(" · ") || "Pendiente de completar";
}

export function getClientInitials(client: Pick<Client, "firstName" | "lastName">) {
  const firstInitial = client.firstName.trim().charAt(0);
  const lastInitial = client.lastName.trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || "CL";
}

export function getVehicleBadge(vehicle: Pick<Vehicle, "licensePlate" | "displayName">) {
  const baseValue = vehicle.licensePlate.trim() || vehicle.displayName?.trim() || "VH";
  return baseValue.slice(0, 3).toUpperCase();
}
