import { useEffect, useMemo, useState } from "react";

import { appointmentsMock, clientsMock, vehiclesMock } from "@/data/mocks";
import type { Appointment, AppointmentStatus, Client, Vehicle } from "@/types";

import type { AppointmentFormValues } from "./appointment-form.types";

const APPOINTMENTS_STORAGE_KEY = "gesttller:appointments:v1";
const CLIENTS_STORAGE_KEY = "gesttller:clients:v1";
const VEHICLES_STORAGE_KEY = "gesttller:vehicles:v1";

export type AppointmentWithRelations = Appointment & {
  client?: Client;
  vehicle?: Vehicle;
};

function readStoredAppointments() {
  if (typeof window === "undefined") {
    return appointmentsMock;
  }

  const storedValue = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);

  if (!storedValue) {
    return appointmentsMock;
  }

  try {
    const parsed = JSON.parse(storedValue) as Appointment[];
    return Array.isArray(parsed) ? parsed : appointmentsMock;
  } catch {
    return appointmentsMock;
  }
}

function readStoredClients() {
  if (typeof window === "undefined") {
    return clientsMock;
  }

  const storedValue = window.localStorage.getItem(CLIENTS_STORAGE_KEY);

  if (!storedValue) {
    return clientsMock;
  }

  try {
    const parsed = JSON.parse(storedValue) as Client[];
    return Array.isArray(parsed) ? parsed : clientsMock;
  } catch {
    return clientsMock;
  }
}

function readStoredVehicles() {
  if (typeof window === "undefined") {
    return vehiclesMock;
  }

  const storedValue = window.localStorage.getItem(VEHICLES_STORAGE_KEY);

  if (!storedValue) {
    return vehiclesMock;
  }

  try {
    const parsed = JSON.parse(storedValue) as Vehicle[];
    return Array.isArray(parsed) ? parsed : vehiclesMock;
  } catch {
    return vehiclesMock;
  }
}

function padTimeUnit(value: number) {
  return String(value).padStart(2, "0");
}

function calculateEndTime(startTime: string, durationMinutes: number) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const normalizedHours = Math.floor(totalMinutes / 60) % 24;
  const normalizedMinutes = totalMinutes % 60;

  return `${padTimeUnit(normalizedHours)}:${padTimeUnit(normalizedMinutes)}`;
}

function buildAppointmentPayload(values: AppointmentFormValues): Appointment {
  const estimatedDurationMinutes = Number(values.estimatedDurationMinutes);

  return {
    id: `app-${crypto.randomUUID().slice(0, 8)}`,
    clientId: values.clientId,
    vehicleId: values.vehicleId,
    date: values.date,
    startTime: values.startTime,
    endTime: calculateEndTime(values.startTime, estimatedDurationMinutes),
    estimatedDurationMinutes,
    reason: values.reason.trim(),
    notes: values.notes.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export function useAppointmentsStorage() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => readStoredAppointments());
  const [clients, setClients] = useState<Client[]>(() => readStoredClients());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => readStoredVehicles());

  useEffect(() => {
    window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    const syncRelations = (event: StorageEvent) => {
      if (event.key === CLIENTS_STORAGE_KEY) {
        setClients(readStoredClients());
      }

      if (event.key === VEHICLES_STORAGE_KEY) {
        setVehicles(readStoredVehicles());
      }
    };

    window.addEventListener("storage", syncRelations);
    setClients(readStoredClients());
    setVehicles(readStoredVehicles());

    return () => window.removeEventListener("storage", syncRelations);
  }, []);

  const appointmentsWithRelations = useMemo<AppointmentWithRelations[]>(
    () =>
      appointments
        .map((appointment) => ({
          ...appointment,
          client: clients.find((client) => client.id === appointment.clientId),
          vehicle: vehicles.find((vehicle) => vehicle.id === appointment.vehicleId),
        }))
        .sort((left, right) =>
          `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`)
        ),
    [appointments, clients, vehicles]
  );

  function createAppointment(values: AppointmentFormValues) {
    const nextAppointment = buildAppointmentPayload(values);
    setAppointments((currentAppointments) =>
      [...currentAppointments, nextAppointment].sort((left, right) =>
        `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`)
      )
    );
    return nextAppointment;
  }

  function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId ? { ...appointment, status } : appointment
      )
    );
  }

  return {
    clients,
    vehicles,
    appointmentsWithRelations,
    createAppointment,
    updateAppointmentStatus,
  };
}
