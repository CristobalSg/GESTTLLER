import type { Client } from "@/types";

function stripChilePrefix(phone: string) {
  return phone.replace(/^\+56\s*/, "").trim();
}

export type ClientFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  documentId: string;
  preferredContact: Client["preferredContact"];
  notes: string;
  street: string;
  commune: string;
  city: string;
};

export function getEmptyClientFormValues(): ClientFormValues {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    documentId: "",
    preferredContact: "phone",
    notes: "",
    street: "",
    commune: "",
    city: "",
  };
}

export function getClientFormValues(client: Client): ClientFormValues {
  return {
    firstName: client.firstName,
    lastName: client.lastName,
    phone: stripChilePrefix(client.phone),
    email: client.email,
    documentId: client.documentId ?? "",
    preferredContact: client.preferredContact,
    notes: client.notes,
    street: client.address?.street ?? "",
    commune: client.address?.commune ?? "",
    city: client.address?.city ?? "",
  };
}
