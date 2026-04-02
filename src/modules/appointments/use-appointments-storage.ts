import { useEffect, useMemo, useState } from "react";

import { appointmentsMock, clientsMock, vehiclesMock } from "@/data/mocks";
import type { Appointment, AppointmentStatus, Client, Vehicle } from "@/types";
import {
  APPOINTMENTS_STORAGE_KEY,
  CLIENTS_STORAGE_KEY,
  VEHICLES_STORAGE_KEY,
  notifyStorageSync,
  subscribeToStorageKey,
} from "@/utils/storage-sync";
import {
  getClientDisplayName,
  getVehicleDisplayName,
  normalizeText,
  splitClientName,
} from "@/utils/entity-display";

import type { AppointmentFormValues } from "./appointment-form.types";

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

function buildProvisionalClient(name: string): Client {
  const now = new Date().toISOString();
  const parsedName = splitClientName(name);

  return {
    id: `cli-${crypto.randomUUID().slice(0, 8)}`,
    firstName: parsedName.firstName,
    lastName: parsedName.lastName,
    phone: "",
    email: "",
    notes: "Registro provisional creado desde agenda.",
    preferredContact: "phone",
    isProvisional: true,
    createdAt: now,
  };
}

function buildProvisionalVehicle(label: string, clientId: string): Vehicle {
  return {
    id: `veh-${crypto.randomUUID().slice(0, 8)}`,
    clientId,
    displayName: label.trim(),
    licensePlate: "",
    brand: "",
    model: "",
    year: 0,
    color: "",
    fuelType: "gasoline",
    transmission: "manual",
    mileageKm: 0,
    notes: "Registro provisional creado desde agenda.",
    isProvisional: true,
    createdAt: new Date().toISOString(),
  };
}

function findClientByQuery(clients: Client[], query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return undefined;
  }

  return clients.find((client) => normalizeText(getClientDisplayName(client)) === normalizedQuery);
}

function findVehicleByQuery(vehicles: Vehicle[], query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return undefined;
  }

  return vehicles.find((vehicle) =>
    [
      getVehicleDisplayName(vehicle),
      vehicle.licensePlate,
      [vehicle.brand, vehicle.model].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .some((field) => normalizeText(field) === normalizedQuery)
  );
}

function buildAppointmentPayload(
  values: AppointmentFormValues,
  relations: { clientId?: string; vehicleId?: string }
): Appointment {
  const estimatedDurationMinutes = Number(values.estimatedDurationMinutes) > 0 ? Number(values.estimatedDurationMinutes) : 45;

  return {
    id: `app-${crypto.randomUUID().slice(0, 8)}`,
    clientId: relations.clientId ?? "",
    vehicleId: relations.vehicleId ?? "",
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
    notifyStorageSync(APPOINTMENTS_STORAGE_KEY);
  }, [appointments]);

  useEffect(() => {
    window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    notifyStorageSync(CLIENTS_STORAGE_KEY);
  }, [clients]);

  useEffect(() => {
    window.localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    notifyStorageSync(VEHICLES_STORAGE_KEY);
  }, [vehicles]);

  useEffect(() => {
    const unsubscribeAppointments = subscribeToStorageKey(APPOINTMENTS_STORAGE_KEY, () => {
      setAppointments(readStoredAppointments());
    });
    const unsubscribeClients = subscribeToStorageKey(CLIENTS_STORAGE_KEY, () => {
      setClients(readStoredClients());
    });
    const unsubscribeVehicles = subscribeToStorageKey(VEHICLES_STORAGE_KEY, () => {
      setVehicles(readStoredVehicles());
    });

    setAppointments(readStoredAppointments());
    setClients(readStoredClients());
    setVehicles(readStoredVehicles());

    return () => {
      unsubscribeAppointments();
      unsubscribeClients();
      unsubscribeVehicles();
    };
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
    let nextClients = clients;
    let nextVehicles = vehicles;

    let nextClient = findClientByQuery(nextClients, values.clientQuery);
    if (!nextClient && values.clientQuery.trim()) {
      nextClient = buildProvisionalClient(values.clientQuery);
      nextClients = [nextClient, ...nextClients];
      setClients(nextClients);
    }

    let nextVehicle = findVehicleByQuery(nextVehicles, values.vehicleQuery);
    if (!nextVehicle && values.vehicleQuery.trim()) {
      nextVehicle = buildProvisionalVehicle(values.vehicleQuery, nextClient?.id ?? "");
      nextVehicles = [nextVehicle, ...nextVehicles];
      setVehicles(nextVehicles);
    }

    const nextAppointment = buildAppointmentPayload(values, {
      clientId: nextClient?.id,
      vehicleId: nextVehicle?.id,
    });

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
