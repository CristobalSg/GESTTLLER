import { useEffect, useState } from "react";

import { PageShell } from "../../components/shared/page-shell";
import type { WorkOrder } from "../../types";
import { WorkOrderDetailCard } from "./work-order-detail-card";
import { WorkOrderForm } from "./work-order-form";
import type { WorkOrderFormValues } from "./work-order-form.types";
import { WorkOrdersList } from "./work-orders-list";
import { useWorkOrdersStorage } from "./use-work-orders-storage";

type PanelMode = "detail" | "create" | "edit";

export function WorkOrdersPage() {
  const {
    clients,
    vehicles,
    quotes,
    intakeRecords,
    workOrdersWithRelations,
    createWorkOrder,
    updateWorkOrder,
    updateWorkOrderStatus,
  } = useWorkOrdersStorage();
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | undefined>(
    workOrdersWithRelations[0]?.id
  );
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | undefined>();

  const selectedWorkOrder =
    workOrdersWithRelations.find((workOrder) => workOrder.id === selectedWorkOrderId) ??
    workOrdersWithRelations[0];

  useEffect(() => {
    if (!workOrdersWithRelations.length) {
      setSelectedWorkOrderId(undefined);
      return;
    }

    const stillExists = workOrdersWithRelations.some(
      (workOrder) => workOrder.id === selectedWorkOrderId
    );

    if (!stillExists) {
      setSelectedWorkOrderId(workOrdersWithRelations[0].id);
    }
  }, [selectedWorkOrderId, workOrdersWithRelations]);

  function handleSelectWorkOrder(workOrderId: string) {
    setSelectedWorkOrderId(workOrderId);
    setEditingWorkOrder(undefined);
    setPanelMode("detail");
  }

  function handleCreateWorkOrder() {
    setEditingWorkOrder(undefined);
    setPanelMode("create");
  }

  function handleEditWorkOrder(workOrder: WorkOrder) {
    setSelectedWorkOrderId(workOrder.id);
    setEditingWorkOrder(workOrder);
    setPanelMode("edit");
  }

  function handleCreateSubmit(values: WorkOrderFormValues) {
    const nextOrder = createWorkOrder(values);
    setSelectedWorkOrderId(nextOrder.id);
    setEditingWorkOrder(undefined);
    setPanelMode("detail");
  }

  function handleEditSubmit(values: WorkOrderFormValues) {
    if (!editingWorkOrder) {
      return;
    }

    const updatedOrder = updateWorkOrder(editingWorkOrder.id, values);

    if (updatedOrder) {
      setSelectedWorkOrderId(updatedOrder.id);
    }

    setEditingWorkOrder(undefined);
    setPanelMode("detail");
  }

  function handleCancelForm() {
    setEditingWorkOrder(undefined);
    setPanelMode("detail");
  }

  return (
    <PageShell
      eyebrow="Órdenes de trabajo"
      title="Ejecución real del taller"
      description="Registra lo realizado en taller, el responsable técnico, el avance de la orden y las recomendaciones que quedarán en historial."
      stats={[
        { label: "Órdenes totales", value: String(workOrdersWithRelations.length) },
        {
          label: "Órdenes activas",
          value: String(
            workOrdersWithRelations.filter((order) =>
              ["received", "diagnosis", "awaiting-approval", "repair"].includes(order.status)
            ).length
          ),
        },
        {
          label: "Entregadas",
          value: String(workOrdersWithRelations.filter((order) => order.status === "delivered").length),
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <WorkOrdersList
          workOrders={workOrdersWithRelations}
          selectedWorkOrderId={selectedWorkOrder?.id}
          onSelectWorkOrder={handleSelectWorkOrder}
          onCreateWorkOrder={handleCreateWorkOrder}
        />

        {panelMode === "create" ? (
          <WorkOrderForm
            mode="create"
            clients={clients}
            vehicles={vehicles}
            quotes={quotes}
            intakeRecords={intakeRecords}
            onCancel={handleCancelForm}
            onSubmit={handleCreateSubmit}
          />
        ) : null}

        {panelMode === "edit" ? (
          <WorkOrderForm
            mode="edit"
            clients={clients}
            vehicles={vehicles}
            quotes={quotes}
            intakeRecords={intakeRecords}
            workOrder={editingWorkOrder}
            onCancel={handleCancelForm}
            onSubmit={handleEditSubmit}
          />
        ) : null}

        {panelMode === "detail" ? (
          <WorkOrderDetailCard
            workOrder={selectedWorkOrder}
            onEditWorkOrder={handleEditWorkOrder}
            onCreateWorkOrder={handleCreateWorkOrder}
            onStatusChange={updateWorkOrderStatus}
          />
        ) : null}
      </div>
    </PageShell>
  );
}
