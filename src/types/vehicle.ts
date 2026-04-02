import type { EntityId, ISODateString } from "./common";

export type VehicleFuelType = "gasoline" | "diesel" | "hybrid" | "electric";

export type VehicleTransmission = "manual" | "automatic" | "cvt";

export interface Vehicle {
  id: EntityId;
  clientId: EntityId;
  licensePlate: string;
  vin?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: VehicleFuelType;
  transmission: VehicleTransmission;
  mileageKm: number;
  notes: string;
  lastServiceAt?: ISODateString;
  createdAt: ISODateString;
}
