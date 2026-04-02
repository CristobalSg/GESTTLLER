import { useEffect, useMemo, useState } from "react";

import { appointmentsMock, clientsMock, vehiclesMock } from "@/data/mocks";
import type { Appointment, Client, IntakePhoto, IntakeRecord, Vehicle } from "@/types";

import type { IntakeFormValues, IntakePhotoDraft } from "./intake-form.types";

const INTAKE_STORAGE_KEY = "gesttller:intake:v1";
const CLIENTS_STORAGE_KEY = "gesttller:clients:v1";
const VEHICLES_STORAGE_KEY = "gesttller:vehicles:v1";
const APPOINTMENTS_STORAGE_KEY = "gesttller:appointments:v1";

export type IntakeRecordWithRelations = IntakeRecord & {
  client?: Client;
  vehicle?: Vehicle;
  appointment?: Appointment;
};

function readStoredCollection<T>(storageKey: string, fallback: T[]) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(storedValue) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function buildPhotosPayload(photoDrafts: IntakePhotoDraft[]): IntakePhoto[] {
  return photoDrafts.map((photoDraft) => ({
    id: `intake-photo-${crypto.randomUUID().slice(0, 8)}`,
    category: photoDraft.category,
    url: photoDraft.url,
    caption: photoDraft.caption,
  }));
}

function buildIntakePayload(values: IntakeFormValues, photoDrafts: IntakePhotoDraft[]): IntakeRecord {
  return {
    id: `intake-${crypto.randomUUID().slice(0, 8)}`,
    clientId: values.clientId,
    vehicleId: values.vehicleId,
    receivedAt: new Date().toISOString(),
    mileageKm: Number(values.mileageKm),
    reportedIssue: values.reportedIssue.trim(),
    observations: values.observations.trim(),
    arrivalCondition: values.arrivalCondition.trim(),
    photos: buildPhotosPayload(photoDrafts),
    checklist: {
      fuelLevel: values.fuelLevel,
      spareTireIncluded: values.spareTireIncluded,
      toolsIncluded: values.toolsIncluded,
      radioIncluded: values.radioIncluded,
      documentsReceived: values.documentsReceived,
    },
  };
}

export function useIntakeStorage() {
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>(() =>
    readStoredCollection<IntakeRecord>(INTAKE_STORAGE_KEY, [])
  );
  const [clients, setClients] = useState<Client[]>(() =>
    readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock)
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    readStoredCollection<Appointment>(APPOINTMENTS_STORAGE_KEY, appointmentsMock)
  );

  useEffect(() => {
    window.localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(intakeRecords));
  }, [intakeRecords]);

  useEffect(() => {
    const syncRelations = (event: StorageEvent) => {
      if (event.key === CLIENTS_STORAGE_KEY) {
        setClients(readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock));
      }

      if (event.key === VEHICLES_STORAGE_KEY) {
        setVehicles(readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock));
      }

      if (event.key === APPOINTMENTS_STORAGE_KEY) {
        setAppointments(readStoredCollection<Appointment>(APPOINTMENTS_STORAGE_KEY, appointmentsMock));
      }
    };

    window.addEventListener("storage", syncRelations);
    setClients(readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock));
    setVehicles(readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock));
    setAppointments(readStoredCollection<Appointment>(APPOINTMENTS_STORAGE_KEY, appointmentsMock));

    return () => window.removeEventListener("storage", syncRelations);
  }, []);

  const intakeRecordsWithRelations = useMemo<IntakeRecordWithRelations[]>(
    () =>
      [...intakeRecords]
        .map((record) => ({
          ...record,
          client: clients.find((client) => client.id === record.clientId),
          vehicle: vehicles.find((vehicle) => vehicle.id === record.vehicleId),
          appointment: appointments.find((appointment) => appointment.id === record.appointmentId),
        }))
        .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt)),
    [appointments, clients, intakeRecords, vehicles]
  );

  function createIntakeRecord(values: IntakeFormValues, photoDrafts: IntakePhotoDraft[]) {
    const nextRecord = buildIntakePayload(values, photoDrafts);
    setIntakeRecords((currentRecords) => [nextRecord, ...currentRecords]);
    return nextRecord;
  }

  return {
    clients,
    vehicles,
    intakeRecordsWithRelations,
    createIntakeRecord,
  };
}
