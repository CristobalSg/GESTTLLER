import { useEffect, useMemo, useState } from "react";

import { clientsMock, vehiclesMock } from "@/data/mocks";
import type { Client, Vehicle } from "@/types";

import type { ClientFormValues } from "./client-form.types";

const CLIENTS_STORAGE_KEY = "gesttller:clients:v1";
const VEHICLES_STORAGE_KEY = "gesttller:vehicles:v1";

export type ClientWithVehicles = Client & {
  vehicles: Vehicle[];
};

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

function buildClientAddress(values: ClientFormValues) {
  const street = values.street.trim();
  const commune = values.commune.trim();
  const city = values.city.trim();

  if (!street && !commune && !city) {
    return undefined;
  }

  return {
    street,
    commune,
    city,
  };
}

function buildClientPayload(values: ClientFormValues, currentClient?: Client): Client {
  const now = new Date().toISOString();

  return {
    id: currentClient?.id ?? `cli-${crypto.randomUUID().slice(0, 8)}`,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim().toLowerCase(),
    documentId: values.documentId.trim() || undefined,
    address: buildClientAddress(values),
    notes: values.notes.trim(),
    preferredContact: values.preferredContact,
    createdAt: currentClient?.createdAt ?? now,
  };
}

export function useClientsStorage() {
  const [clients, setClients] = useState<Client[]>(() => readStoredClients());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => readStoredVehicles());

  useEffect(() => {
    window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === VEHICLES_STORAGE_KEY) {
        setVehicles(readStoredVehicles());
      }
    };

    window.addEventListener("storage", handleStorage);
    setVehicles(readStoredVehicles());

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const clientsWithVehicles = useMemo<ClientWithVehicles[]>(
    () =>
      clients.map((client) => ({
        ...client,
        vehicles: vehicles.filter((vehicle) => vehicle.clientId === client.id),
      })),
    [clients, vehicles]
  );

  function createClient(values: ClientFormValues) {
    const nextClient = buildClientPayload(values);

    setClients((currentClients) => [nextClient, ...currentClients]);

    return nextClient;
  }

  function updateClient(clientId: string, values: ClientFormValues) {
    let updatedClient: Client | undefined;

    setClients((currentClients) =>
      currentClients.map((client) => {
        if (client.id !== clientId) {
          return client;
        }

        updatedClient = buildClientPayload(values, client);
        return updatedClient;
      })
    );

    return updatedClient;
  }

  return {
    clients,
    clientsWithVehicles,
    createClient,
    updateClient,
  };
}
