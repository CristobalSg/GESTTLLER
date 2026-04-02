import type { Appointment } from "@/types";

export type AppointmentFormValues = {
  clientId: string;
  vehicleId: string;
  date: string;
  startTime: string;
  estimatedDurationMinutes: string;
  reason: string;
  notes: string;
};

export function getEmptyAppointmentFormValues(): AppointmentFormValues {
  return {
    clientId: "",
    vehicleId: "",
    date: "",
    startTime: "",
    estimatedDurationMinutes: "45",
    reason: "",
    notes: "",
  };
}

export function getAppointmentFormValues(appointment: Appointment): AppointmentFormValues {
  return {
    clientId: appointment.clientId,
    vehicleId: appointment.vehicleId,
    date: appointment.date,
    startTime: appointment.startTime,
    estimatedDurationMinutes: String(appointment.estimatedDurationMinutes),
    reason: appointment.reason,
    notes: appointment.notes,
  };
}
