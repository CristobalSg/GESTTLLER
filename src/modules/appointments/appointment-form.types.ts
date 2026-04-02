import type { Appointment } from "@/types";

export type AppointmentFormValues = {
  clientQuery: string;
  vehicleQuery: string;
  date: string;
  startTime: string;
  estimatedDurationMinutes: string;
  reason: string;
  notes: string;
};

export function getEmptyAppointmentFormValues(): AppointmentFormValues {
  return {
    clientQuery: "",
    vehicleQuery: "",
    date: "",
    startTime: "",
    estimatedDurationMinutes: "45",
    reason: "",
    notes: "",
  };
}

export function getAppointmentFormValues(appointment: Appointment): AppointmentFormValues {
  return {
    clientQuery: appointment.clientId,
    vehicleQuery: appointment.vehicleId,
    date: appointment.date,
    startTime: appointment.startTime,
    estimatedDurationMinutes: String(appointment.estimatedDurationMinutes),
    reason: appointment.reason,
    notes: appointment.notes,
  };
}
