import type { Appointment, Client, Vehicle } from "@/types";

import { appointmentsMock } from "./appointments";
import { clientsMock } from "./clients";
import { vehiclesMock } from "./vehicles";

export type ClientWithVehicles = Client & {
  vehicles: Vehicle[];
};

export type AppointmentWithRelations = Appointment & {
  client: Client;
  vehicle: Vehicle;
};

export const clientsById = Object.fromEntries(clientsMock.map((client) => [client.id, client])) as Record<
  Client["id"],
  Client
>;

export const vehiclesById = Object.fromEntries(vehiclesMock.map((vehicle) => [vehicle.id, vehicle])) as Record<
  Vehicle["id"],
  Vehicle
>;

export function getClientById(clientId: Client["id"]) {
  return clientsById[clientId];
}

export function getVehicleById(vehicleId: Vehicle["id"]) {
  return vehiclesById[vehicleId];
}

export function getVehiclesByClientId(clientId: Client["id"]) {
  return vehiclesMock.filter((vehicle) => vehicle.clientId === clientId);
}

export function getAppointmentsByClientId(clientId: Client["id"]) {
  return appointmentsMock.filter((appointment) => appointment.clientId === clientId);
}

export const clientsWithVehiclesMock: ClientWithVehicles[] = clientsMock.map((client) => ({
  ...client,
  vehicles: getVehiclesByClientId(client.id),
}));

export const appointmentsWithRelationsMock: AppointmentWithRelations[] = appointmentsMock.flatMap(
  (appointment) => {
    const client = getClientById(appointment.clientId);
    const vehicle = getVehicleById(appointment.vehicleId);

    if (!client || !vehicle) {
      return [];
    }

    return [
      {
        ...appointment,
        client,
        vehicle,
      },
    ];
  }
);
