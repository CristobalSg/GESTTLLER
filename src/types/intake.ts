import type { EntityId, ISODateString } from "./common";

export type IntakePhotoCategory = "vehicle" | "dashboard" | "scanner";

export interface IntakePhoto {
  id: EntityId;
  category: IntakePhotoCategory;
  url: string;
  caption: string;
}

export interface IntakeChecklist {
  fuelLevel: "empty" | "quarter" | "half" | "three-quarters" | "full";
  spareTireIncluded: boolean;
  toolsIncluded: boolean;
  radioIncluded: boolean;
  documentsReceived: boolean;
}

export interface IntakeRecord {
  id: EntityId;
  clientId: EntityId;
  vehicleId: EntityId;
  appointmentId?: EntityId;
  receivedAt: ISODateString;
  mileageKm: number;
  reportedIssue: string;
  observations: string;
  arrivalCondition: string;
  photos: IntakePhoto[];
  checklist: IntakeChecklist;
}
