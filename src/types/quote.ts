import type { CurrencyCode, EntityId, ISODateString } from "./common";

export type QuoteItemType = "labor" | "part" | "service";

export interface QuoteItem {
  id: EntityId;
  description: string;
  type: QuoteItemType;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "partial";

export interface Quote {
  id: EntityId;
  clientId: EntityId;
  vehicleId: EntityId;
  intakeRecordId?: EntityId;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: CurrencyCode;
  validUntil: ISODateString;
  status: QuoteStatus;
  observations: string;
  declinedWorkNotes: string;
  createdAt: ISODateString;
}
