import type { Address, EntityId, ISODateString } from "./common";

export interface Client {
  id: EntityId;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  documentId?: string;
  address?: Address;
  notes: string;
  preferredContact: "phone" | "whatsapp" | "email";
  createdAt: ISODateString;
}
