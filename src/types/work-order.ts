import type { EntityId, ISODateString } from "./common";
import type { Recommendation } from "./recommendation";

export type WorkOrderStatus =
  | "received"
  | "diagnosis"
  | "awaiting-approval"
  | "repair"
  | "completed"
  | "delivered";

export interface WorkOrderTask {
  id: EntityId;
  description: string;
  completed: boolean;
  notes: string;
}

export interface WorkOrder {
  id: EntityId;
  clientId: EntityId;
  vehicleId: EntityId;
  quoteId?: EntityId;
  intakeRecordId?: EntityId;
  technician: string;
  status: WorkOrderStatus;
  tasks: WorkOrderTask[];
  observations: string;
  recommendations: Recommendation[];
  suggestedWorkNotPerformed: string;
  rejectedWorkReason: string;
  openedAt: ISODateString;
  closedAt?: ISODateString;
}
