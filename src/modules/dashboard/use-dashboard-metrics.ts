import { useEffect, useMemo, useState } from "react";

import { appointmentsMock, clientsMock, vehiclesMock } from "@/data/mocks";
import type { Appointment, Client, Quote, Vehicle, WorkOrder } from "@/types";

const CLIENTS_STORAGE_KEY = "gesttller:clients:v1";
const VEHICLES_STORAGE_KEY = "gesttller:vehicles:v1";
const APPOINTMENTS_STORAGE_KEY = "gesttller:appointments:v1";
const QUOTES_STORAGE_KEY = "gesttller:quotes:v1";
const WORK_ORDERS_STORAGE_KEY = "gesttller:work-orders:v1";

type DashboardCollections = {
  appointments: Appointment[];
  clients: Client[];
  quotes: Quote[];
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
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

function loadDashboardCollections(): DashboardCollections {
  return {
    clients: readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock),
    vehicles: readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock),
    appointments: readStoredCollection<Appointment>(APPOINTMENTS_STORAGE_KEY, appointmentsMock),
    quotes: readStoredCollection<Quote>(QUOTES_STORAGE_KEY, []),
    workOrders: readStoredCollection<WorkOrder>(WORK_ORDERS_STORAGE_KEY, []),
  };
}

function getMonthKey(dateValue: string) {
  const date = new Date(dateValue);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function normalizeTaskDescription(description: string) {
  return description.trim().toLowerCase();
}

export function useDashboardMetrics() {
  const [collections, setCollections] = useState<DashboardCollections>(() => loadDashboardCollections());

  useEffect(() => {
    const syncDashboard = (event: StorageEvent) => {
      if (
        [
          CLIENTS_STORAGE_KEY,
          VEHICLES_STORAGE_KEY,
          APPOINTMENTS_STORAGE_KEY,
          QUOTES_STORAGE_KEY,
          WORK_ORDERS_STORAGE_KEY,
        ].includes(event.key ?? "")
      ) {
        setCollections(loadDashboardCollections());
      }
    };

    window.addEventListener("storage", syncDashboard);
    setCollections(loadDashboardCollections());

    return () => window.removeEventListener("storage", syncDashboard);
  }, []);

  return useMemo(() => {
    const approvedQuotes = collections.quotes.filter((quote) => quote.status === "approved");
    const rejectedQuotes = collections.quotes.filter((quote) => quote.status === "rejected");
    const deliveredOrCompletedOrders = collections.workOrders.filter((order) =>
      ["completed", "delivered"].includes(order.status)
    );

    const chargedQuoteIds = new Set(
      deliveredOrCompletedOrders.map((order) => order.quoteId).filter(Boolean) as string[]
    );

    const totalCharged = collections.quotes
      .filter((quote) => chargedQuoteIds.has(quote.id))
      .reduce((sum, quote) => sum + quote.total, 0);

    const taskFrequencyMap = collections.workOrders.reduce<Map<string, number>>((accumulator, order) => {
      order.tasks.forEach((task) => {
        const normalizedTask = normalizeTaskDescription(task.description);

        if (!normalizedTask) {
          return;
        }

        accumulator.set(normalizedTask, (accumulator.get(normalizedTask) ?? 0) + 1);
      });

      return accumulator;
    }, new Map());

    const mostFrequentJobs = [...taskFrequencyMap.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([task, count]) => ({
        label: task.charAt(0).toUpperCase() + task.slice(1),
        count,
      }));

    const incomeByPeriodMap = collections.quotes
      .filter((quote) => chargedQuoteIds.has(quote.id))
      .reduce<Map<string, number>>((accumulator, quote) => {
        const monthKey = getMonthKey(quote.createdAt);
        accumulator.set(monthKey, (accumulator.get(monthKey) ?? 0) + quote.total);
        return accumulator;
      }, new Map());

    const incomeByPeriod = [...incomeByPeriodMap.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .slice(-6)
      .map(([monthKey, total]) => ({
        label: getMonthLabel(monthKey),
        total,
      }));

    const today = new Date().toISOString().slice(0, 10);

    const upcomingAppointments = [...collections.appointments]
      .filter((appointment) => appointment.status !== "cancelled")
      .filter((appointment) => appointment.date >= today)
      .sort((left, right) => `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`))
      .slice(0, 5);

    const pendingAppointmentsCount = collections.appointments.filter(
      (appointment) => appointment.status !== "cancelled" && appointment.date >= today
    ).length;

    const todayAppointmentsCount = collections.appointments.filter(
      (appointment) => appointment.status !== "cancelled" && appointment.date === today
    ).length;

    const activeWorkOrdersCount = collections.workOrders.filter((order) =>
      ["open", "in-progress", "waiting-parts"].includes(order.status)
    ).length;

    return {
      totalAppointments: collections.appointments.length,
      totalCharged,
      totalClients: collections.clients.length,
      totalQuotes: collections.quotes.length,
      totalVehicles: collections.vehicles.length,
      totalWorkOrders: collections.workOrders.length,
      approvedQuotesCount: approvedQuotes.length,
      activeWorkOrdersCount,
      rejectedQuotesCount: rejectedQuotes.length,
      incomeByPeriod,
      mostFrequentJobs,
      pendingAppointmentsCount,
      todayAppointmentsCount,
      upcomingAppointments,
    };
  }, [collections]);
}
