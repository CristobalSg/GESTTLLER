import { useEffect, useMemo, useState } from "react";

import { appointmentsMock, clientsMock, vehiclesMock } from "@/data/mocks";
import type { Appointment, Client, Vehicle } from "@/types";
import {
  APPOINTMENTS_STORAGE_KEY,
  CLIENTS_STORAGE_KEY,
  VEHICLES_STORAGE_KEY,
  notifyStorageSync,
  subscribeToStorageKey,
} from "@/utils/storage-sync";

import type { VehicleFormValues } from "./vehicle-form.types";

export type VehicleWithRelations = Vehicle & {
  client?: Client;
  appointments: Appointment[];
};

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

function buildLastServiceAt(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return new Date(`${trimmedValue}T12:00:00.000Z`).toISOString();
}

function buildVehiclePayload(values: VehicleFormValues, currentVehicle?: Vehicle): Vehicle {
  return {
    id: currentVehicle?.id ?? `veh-${crypto.randomUUID().slice(0, 8)}`,
    clientId: values.clientId,
    licensePlate: values.licensePlate.trim().toUpperCase(),
    vin: values.vin.trim() || undefined,
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: Number(values.year),
    color: values.color.trim(),
    fuelType: values.fuelType,
    transmission: values.transmission,
    mileageKm: Number(values.mileageKm),
    notes: values.notes.trim(),
    lastServiceAt: buildLastServiceAt(values.lastServiceAt),
    createdAt: currentVehicle?.createdAt ?? new Date().toISOString(),
  };
}

export function useVehiclesStorage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => readStoredVehicles());
  const [clients, setClients] = useState<Client[]>(() => readStoredClients());
  const [appointments, setAppointments] = useState<Appointment[]>(() => readStoredAppointments());

  useEffect(() => {
    window.localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    notifyStorageSync(VEHICLES_STORAGE_KEY);
  }, [vehicles]);

  useEffect(() => {
    const unsubscribeVehicles = subscribeToStorageKey(VEHICLES_STORAGE_KEY, () => {
      setVehicles(readStoredVehicles());
    });
    const unsubscribeClients = subscribeToStorageKey(CLIENTS_STORAGE_KEY, () => {
      setClients(readStoredClients());
    });
    const unsubscribeAppointments = subscribeToStorageKey(APPOINTMENTS_STORAGE_KEY, () => {
      setAppointments(readStoredAppointments());
    });

    setVehicles(readStoredVehicles());
    setClients(readStoredClients());
    setAppointments(readStoredAppointments());

    return () => {
      unsubscribeVehicles();
      unsubscribeClients();
      unsubscribeAppointments();
    };
  }, []);

  const vehiclesWithRelations = useMemo<VehicleWithRelations[]>(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        client: clients.find((client) => client.id === vehicle.clientId),
        appointments: appointments
          .filter((appointment) => appointment.vehicleId === vehicle.id)
          .sort((left, right) => `${right.date}${right.startTime}`.localeCompare(`${left.date}${left.startTime}`)),
      })),
    [appointments, clients, vehicles]
  );

  function createVehicle(values: VehicleFormValues) {
    const nextVehicle = buildVehiclePayload(values);
    setVehicles((currentVehicles) => [nextVehicle, ...currentVehicles]);
    return nextVehicle;
  }

  function updateVehicle(vehicleId: string, values: VehicleFormValues) {
    let updatedVehicle: Vehicle | undefined;

    setVehicles((currentVehicles) =>
      currentVehicles.map((vehicle) => {
        if (vehicle.id !== vehicleId) {
          return vehicle;
        }

        updatedVehicle = buildVehiclePayload(values, vehicle);
        return updatedVehicle;
      })
    );

    return updatedVehicle;
  }

  return {
    clients,
    vehiclesWithRelations,
    createVehicle,
    updateVehicle,
  };
}
