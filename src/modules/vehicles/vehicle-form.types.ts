import type { Vehicle, VehicleFuelType, VehicleTransmission } from "@/types";

export type VehicleFormValues = {
  clientId: string;
  licensePlate: string;
  vin: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  fuelType: VehicleFuelType;
  transmission: VehicleTransmission;
  mileageKm: string;
  lastServiceAt: string;
  notes: string;
};

export function getEmptyVehicleFormValues(): VehicleFormValues {
  return {
    clientId: "",
    licensePlate: "",
    vin: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    fuelType: "gasoline",
    transmission: "manual",
    mileageKm: "",
    lastServiceAt: "",
    notes: "",
  };
}

export function getVehicleFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    clientId: vehicle.clientId,
    licensePlate: vehicle.licensePlate,
    vin: vehicle.vin ?? "",
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    color: vehicle.color,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    mileageKm: String(vehicle.mileageKm),
    lastServiceAt: vehicle.lastServiceAt ? vehicle.lastServiceAt.slice(0, 10) : "",
    notes: vehicle.notes,
  };
}
