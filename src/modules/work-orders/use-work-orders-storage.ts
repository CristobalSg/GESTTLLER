import { useEffect, useMemo, useState } from "react";

import { clientsMock, vehiclesMock } from "@/data/mocks";
import type {
  Client,
  IntakeRecord,
  Quote,
  Recommendation,
  WorkOrder,
  WorkOrderStatus,
  Vehicle,
} from "@/types";

import type { WorkOrderFormValues } from "./work-order-form.types";

const WORK_ORDERS_STORAGE_KEY = "gesttller:work-orders:v1";
const CLIENTS_STORAGE_KEY = "gesttller:clients:v1";
const VEHICLES_STORAGE_KEY = "gesttller:vehicles:v1";
const QUOTES_STORAGE_KEY = "gesttller:quotes:v1";
const INTAKE_STORAGE_KEY = "gesttller:intake:v1";

export type WorkOrderWithRelations = WorkOrder & {
  client?: Client;
  vehicle?: Vehicle;
  quote?: Quote;
  intakeRecord?: IntakeRecord;
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

function buildRecommendations(orderId: string, values: WorkOrderFormValues): Recommendation[] {
  return values.recommendations
    .filter((recommendation) => recommendation.title.trim() || recommendation.detail.trim())
    .map((recommendation) => ({
      id: recommendation.id,
      orderId,
      title: recommendation.title.trim(),
      detail: recommendation.detail.trim(),
      priority: recommendation.priority,
    }));
}

function buildWorkOrderPayload(values: WorkOrderFormValues, currentOrder?: WorkOrder): WorkOrder {
  const orderId = currentOrder?.id ?? `work-${crypto.randomUUID().slice(0, 8)}`;
  const isClosedStatus = values.status === "completed" || values.status === "delivered";

  return {
    id: orderId,
    clientId: values.clientId,
    vehicleId: values.vehicleId,
    quoteId: values.quoteId || undefined,
    intakeRecordId: values.intakeRecordId || undefined,
    technician: values.technician.trim(),
    status: values.status,
    tasks: values.tasks
      .filter((task) => task.description.trim())
      .map((task) => ({
        id: task.id,
        description: task.description.trim(),
        completed: task.completed,
        notes: task.notes.trim(),
      })),
    observations: values.observations.trim(),
    recommendations: buildRecommendations(orderId, values),
    suggestedWorkNotPerformed: values.suggestedWorkNotPerformed.trim(),
    rejectedWorkReason: values.rejectedWorkReason.trim(),
    openedAt: currentOrder?.openedAt ?? new Date().toISOString(),
    closedAt: isClosedStatus ? currentOrder?.closedAt ?? new Date().toISOString() : undefined,
  };
}

export function useWorkOrdersStorage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() =>
    readStoredCollection<WorkOrder>(WORK_ORDERS_STORAGE_KEY, [])
  );
  const [clients, setClients] = useState<Client[]>(() =>
    readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock)
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock)
  );
  const [quotes, setQuotes] = useState<Quote[]>(() => readStoredCollection<Quote>(QUOTES_STORAGE_KEY, []));
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>(() =>
    readStoredCollection<IntakeRecord>(INTAKE_STORAGE_KEY, [])
  );

  useEffect(() => {
    window.localStorage.setItem(WORK_ORDERS_STORAGE_KEY, JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    const syncRelations = (event: StorageEvent) => {
      if (event.key === CLIENTS_STORAGE_KEY) {
        setClients(readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock));
      }

      if (event.key === VEHICLES_STORAGE_KEY) {
        setVehicles(readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock));
      }

      if (event.key === QUOTES_STORAGE_KEY) {
        setQuotes(readStoredCollection<Quote>(QUOTES_STORAGE_KEY, []));
      }

      if (event.key === INTAKE_STORAGE_KEY) {
        setIntakeRecords(readStoredCollection<IntakeRecord>(INTAKE_STORAGE_KEY, []));
      }
    };

    window.addEventListener("storage", syncRelations);
    setClients(readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock));
    setVehicles(readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock));
    setQuotes(readStoredCollection<Quote>(QUOTES_STORAGE_KEY, []));
    setIntakeRecords(readStoredCollection<IntakeRecord>(INTAKE_STORAGE_KEY, []));

    return () => window.removeEventListener("storage", syncRelations);
  }, []);

  const workOrdersWithRelations = useMemo<WorkOrderWithRelations[]>(
    () =>
      [...workOrders]
        .map((order) => ({
          ...order,
          client: clients.find((client) => client.id === order.clientId),
          vehicle: vehicles.find((vehicle) => vehicle.id === order.vehicleId),
          quote: quotes.find((quote) => quote.id === order.quoteId),
          intakeRecord: intakeRecords.find((record) => record.id === order.intakeRecordId),
        }))
        .sort((left, right) => right.openedAt.localeCompare(left.openedAt)),
    [clients, intakeRecords, quotes, vehicles, workOrders]
  );

  function createWorkOrder(values: WorkOrderFormValues) {
    const nextOrder = buildWorkOrderPayload(values);
    setWorkOrders((currentOrders) => [nextOrder, ...currentOrders]);
    return nextOrder;
  }

  function updateWorkOrder(orderId: string, values: WorkOrderFormValues) {
    let updatedOrder: WorkOrder | undefined;

    setWorkOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        updatedOrder = buildWorkOrderPayload(values, order);
        return updatedOrder;
      })
    );

    return updatedOrder;
  }

  function updateWorkOrderStatus(orderId: string, status: WorkOrderStatus) {
    setWorkOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        return {
          ...order,
          status,
          closedAt:
            status === "completed" || status === "delivered"
              ? order.closedAt ?? new Date().toISOString()
              : undefined,
        };
      })
    );
  }

  return {
    clients,
    vehicles,
    quotes,
    intakeRecords,
    workOrdersWithRelations,
    createWorkOrder,
    updateWorkOrder,
    updateWorkOrderStatus,
  };
}
