import type { RecommendationPriority, WorkOrder, WorkOrderStatus } from "@/types";

export type WorkOrderTaskFormValues = {
  id: string;
  description: string;
  notes: string;
  completed: boolean;
};

export type WorkOrderRecommendationFormValues = {
  id: string;
  title: string;
  detail: string;
  priority: RecommendationPriority;
};

export type WorkOrderFormValues = {
  clientId: string;
  vehicleId: string;
  quoteId: string;
  intakeRecordId: string;
  technician: string;
  status: WorkOrderStatus;
  observations: string;
  suggestedWorkNotPerformed: string;
  rejectedWorkReason: string;
  tasks: WorkOrderTaskFormValues[];
  recommendations: WorkOrderRecommendationFormValues[];
};

export function createEmptyWorkOrderTask(): WorkOrderTaskFormValues {
  return {
    id: `work-task-${crypto.randomUUID().slice(0, 8)}`,
    description: "",
    notes: "",
    completed: false,
  };
}

export function createEmptyRecommendation(): WorkOrderRecommendationFormValues {
  return {
    id: `work-rec-${crypto.randomUUID().slice(0, 8)}`,
    title: "",
    detail: "",
    priority: "medium",
  };
}

export function getEmptyWorkOrderFormValues(): WorkOrderFormValues {
  return {
    clientId: "",
    vehicleId: "",
    quoteId: "",
    intakeRecordId: "",
    technician: "",
    status: "received",
    observations: "",
    suggestedWorkNotPerformed: "",
    rejectedWorkReason: "",
    tasks: [createEmptyWorkOrderTask()],
    recommendations: [createEmptyRecommendation()],
  };
}

export function getWorkOrderFormValues(order: WorkOrder): WorkOrderFormValues {
  return {
    clientId: order.clientId,
    vehicleId: order.vehicleId,
    quoteId: order.quoteId ?? "",
    intakeRecordId: order.intakeRecordId ?? "",
    technician: order.technician,
    status: order.status,
    observations: order.observations,
    suggestedWorkNotPerformed: order.suggestedWorkNotPerformed,
    rejectedWorkReason: order.rejectedWorkReason,
    tasks: order.tasks.map((task) => ({
      id: task.id,
      description: task.description,
      notes: task.notes,
      completed: task.completed,
    })),
    recommendations:
      order.recommendations.length > 0
        ? order.recommendations.map((recommendation) => ({
            id: recommendation.id,
            title: recommendation.title,
            detail: recommendation.detail,
            priority: recommendation.priority,
          }))
        : [createEmptyRecommendation()],
  };
}
