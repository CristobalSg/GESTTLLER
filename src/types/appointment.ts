import type { EntityId, ISODateString } from "./common";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "finalized"
  | "cancelled";

export interface Appointment {
  id: EntityId;
  clientId: EntityId;
  vehicleId: EntityId;
  date: ISODateString;
  startTime: string;
  endTime: string;
  estimatedDurationMinutes: number;
  reason: string;
  notes: string;
  status: AppointmentStatus;
  createdAt: ISODateString;
}
