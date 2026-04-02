import type { IntakePhotoCategory, IntakeRecord } from "@/types";

export type IntakeFormValues = {
  clientId: string;
  vehicleId: string;
  mileageKm: string;
  reportedIssue: string;
  observations: string;
  arrivalCondition: string;
  fuelLevel: IntakeRecord["checklist"]["fuelLevel"];
  spareTireIncluded: boolean;
  toolsIncluded: boolean;
  radioIncluded: boolean;
  documentsReceived: boolean;
};

export type IntakePhotoDraft = {
  category: IntakePhotoCategory;
  url: string;
  caption: string;
  fileName: string;
};

export function getEmptyIntakeFormValues(): IntakeFormValues {
  return {
    clientId: "",
    vehicleId: "",
    mileageKm: "",
    reportedIssue: "",
    observations: "",
    arrivalCondition: "",
    fuelLevel: "half",
    spareTireIncluded: false,
    toolsIncluded: false,
    radioIncluded: true,
    documentsReceived: true,
  };
}
