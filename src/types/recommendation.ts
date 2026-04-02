import type { EntityId, ISODateString } from "./common";

export type RecommendationPriority = "low" | "medium" | "high";

export interface Recommendation {
  id: EntityId;
  orderId: EntityId;
  title: string;
  detail: string;
  priority: RecommendationPriority;
  dueMileageKm?: number;
  dueDate?: ISODateString;
}
