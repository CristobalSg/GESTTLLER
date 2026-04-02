import { useEffect, useMemo, useState } from "react";

import { clientsMock, quotesMock, vehiclesMock } from "@/data/mocks";
import type { Client, Quote, QuoteItem, QuoteStatus, Vehicle } from "@/types";

import type { QuoteFormValues } from "./quote-form.types";

const QUOTES_STORAGE_KEY = "gesttller:quotes:v1";
const CLIENTS_STORAGE_KEY = "gesttller:clients:v1";
const VEHICLES_STORAGE_KEY = "gesttller:vehicles:v1";

export type QuoteWithRelations = Quote & {
  client?: Client;
  vehicle?: Vehicle;
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

function calculateItemTotal(quantity: number, unitPrice: number) {
  return quantity * unitPrice;
}

function buildQuoteItems(values: QuoteFormValues): QuoteItem[] {
  return values.items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    return {
      id: item.id,
      description: item.description.trim(),
      type: item.type,
      quantity,
      unitPrice,
      total: calculateItemTotal(quantity, unitPrice),
    };
  });
}

function buildQuotePayload(values: QuoteFormValues, currentQuote?: Quote): Quote {
  const items = buildQuoteItems(values);
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const validUntil = values.validUntil ? new Date(`${values.validUntil}T12:00:00.000Z`).toISOString() : "";

  return {
    id: currentQuote?.id ?? `quote-${crypto.randomUUID().slice(0, 8)}`,
    clientId: values.clientId,
    vehicleId: values.vehicleId,
    intakeRecordId: currentQuote?.intakeRecordId,
    items,
    subtotal,
    tax: 0,
    total: subtotal,
    currency: "CLP",
    validUntil,
    status: values.status,
    observations: values.observations.trim(),
    declinedWorkNotes: values.declinedWorkNotes.trim(),
    createdAt: currentQuote?.createdAt ?? new Date().toISOString(),
  };
}

export function useQuotesStorage() {
  const [quotes, setQuotes] = useState<Quote[]>(() =>
    readStoredCollection<Quote>(QUOTES_STORAGE_KEY, quotesMock)
  );
  const [clients, setClients] = useState<Client[]>(() =>
    readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock)
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock)
  );

  useEffect(() => {
    window.localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    const syncRelations = (event: StorageEvent) => {
      if (event.key === CLIENTS_STORAGE_KEY) {
        setClients(readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock));
      }

      if (event.key === VEHICLES_STORAGE_KEY) {
        setVehicles(readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock));
      }
    };

    window.addEventListener("storage", syncRelations);
    setClients(readStoredCollection<Client>(CLIENTS_STORAGE_KEY, clientsMock));
    setVehicles(readStoredCollection<Vehicle>(VEHICLES_STORAGE_KEY, vehiclesMock));

    return () => window.removeEventListener("storage", syncRelations);
  }, []);

  const quotesWithRelations = useMemo<QuoteWithRelations[]>(
    () =>
      [...quotes]
        .map((quote) => ({
          ...quote,
          client: clients.find((client) => client.id === quote.clientId),
          vehicle: vehicles.find((vehicle) => vehicle.id === quote.vehicleId),
        }))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [clients, quotes, vehicles]
  );

  function createQuote(values: QuoteFormValues) {
    const nextQuote = buildQuotePayload(values);
    setQuotes((currentQuotes) => [nextQuote, ...currentQuotes]);
    return nextQuote;
  }

  function updateQuote(quoteId: string, values: QuoteFormValues) {
    let updatedQuote: Quote | undefined;

    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) => {
        if (quote.id !== quoteId) {
          return quote;
        }

        updatedQuote = buildQuotePayload(values, quote);
        return updatedQuote;
      })
    );

    return updatedQuote;
  }

  function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) => (quote.id === quoteId ? { ...quote, status } : quote))
    );
  }

  return {
    clients,
    vehicles,
    quotesWithRelations,
    createQuote,
    updateQuote,
    updateQuoteStatus,
  };
}
