import type { Quote, QuoteItemType, QuoteStatus } from "@/types";

export type QuoteItemFormValues = {
  id: string;
  description: string;
  type: QuoteItemType;
  quantity: string;
  unitPrice: string;
};

export type QuoteFormValues = {
  clientId: string;
  vehicleId: string;
  validUntil: string;
  status: QuoteStatus;
  observations: string;
  declinedWorkNotes: string;
  items: QuoteItemFormValues[];
};

export function createEmptyQuoteItem(): QuoteItemFormValues {
  return {
    id: `quote-item-${crypto.randomUUID().slice(0, 8)}`,
    description: "",
    type: "service",
    quantity: "1",
    unitPrice: "",
  };
}

export function getEmptyQuoteFormValues(): QuoteFormValues {
  return {
    clientId: "",
    vehicleId: "",
    validUntil: "",
    status: "draft",
    observations: "",
    declinedWorkNotes: "",
    items: [createEmptyQuoteItem()],
  };
}

export function getQuoteFormValues(quote: Quote): QuoteFormValues {
  return {
    clientId: quote.clientId,
    vehicleId: quote.vehicleId,
    validUntil: quote.validUntil.slice(0, 10),
    status: quote.status,
    observations: quote.observations,
    declinedWorkNotes: quote.declinedWorkNotes,
    items: quote.items.map((item) => ({
      id: item.id,
      description: item.description,
      type: item.type,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })),
  };
}
