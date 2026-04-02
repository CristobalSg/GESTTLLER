import type { Quote } from "@/types";

import type { QuoteWithRelations } from "../use-quotes-storage";

type QuotePdfLineItem = {
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
};

export type QuotePdfTemplate = {
  fileName: string;
  workshopName: string;
  workshopDetails: string[];
  title: string;
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
  clientLines: string[];
  vehicleLines: string[];
  observations: string;
  conditions: string[];
  items: QuotePdfLineItem[];
  subtotal: string;
  total: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "Sin fecha definida";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getQuoteNumber(quote: Quote) {
  return quote.id.replace("quote-", "P-").toUpperCase();
}

function getQuoteFileName(quote: Quote) {
  return `Presupuesto_${getQuoteNumber(quote)}.pdf`;
}

export function buildQuotePdfTemplate(quote: QuoteWithRelations): QuotePdfTemplate {
  return {
    fileName: getQuoteFileName(quote),
    workshopName: "ElectroAuto",
    workshopDetails: ["ElectroAuto, ., 4780000 Temuco, Chile"],
    title: "PRESUPUESTO",
    quoteNumber: getQuoteNumber(quote),
    issueDate: formatDate(quote.createdAt),
    validUntil: quote.validUntil ? formatDate(quote.validUntil) : "Sin fecha definida",
    clientLines: [
      quote.client ? `${quote.client.firstName} ${quote.client.lastName}` : "Cliente sin relacion",
      quote.client?.phone || "Telefono no registrado",
      quote.client?.email || "Correo no registrado",
    ],
    vehicleLines: [
      quote.vehicle
        ? `${quote.vehicle.licensePlate || "Sin patente"} · ${quote.vehicle.brand} ${quote.vehicle.model}`.trim()
        : "Vehiculo sin relacion",
      quote.vehicle?.year ? `Ano ${quote.vehicle.year}` : "Ano no registrado",
      quote.vehicle?.color || "Color no registrado",
    ],
    observations: quote.observations || "Sin observaciones generales registradas.",
    conditions: [
      "Valores expresados en pesos chilenos e incluyen solo lo detallado en este documento.",
      "La aprobacion del presupuesto autoriza la ejecucion de los trabajos descritos.",
      "Los plazos y disponibilidad pueden variar segun inspeccion final y stock de repuestos.",
    ],
    items: quote.items.map((item) => ({
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: formatMoney(item.unitPrice),
      total: formatMoney(item.total),
    })),
    subtotal: formatMoney(quote.subtotal),
    total: formatMoney(quote.total),
  };
}
