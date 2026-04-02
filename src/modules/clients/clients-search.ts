import type { Client } from "@/types";

export function matchesClientSearch(client: Client, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableFields = [
    client.firstName,
    client.lastName,
    `${client.firstName} ${client.lastName}`,
    client.phone,
    client.email,
  ];

  return searchableFields.some((field) => field.toLowerCase().includes(normalizedQuery));
}
