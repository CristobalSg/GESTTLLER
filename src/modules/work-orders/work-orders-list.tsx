import type { WorkOrder } from "@/types";

import type { WorkOrderWithRelations } from "./use-work-orders-storage";

type WorkOrdersListProps = {
  workOrders: WorkOrderWithRelations[];
  selectedWorkOrderId?: string;
  onSelectWorkOrder: (workOrderId: string) => void;
  onCreateWorkOrder: () => void;
};

function getStatusLabel(status: WorkOrder["status"]) {
  switch (status) {
    case "received":
      return "Ingresada";
    case "diagnosis":
      return "En diagnóstico";
    case "awaiting-approval":
      return "Esperando aprobación";
    case "repair":
      return "En reparación";
    case "completed":
      return "Terminada";
    case "delivered":
      return "Entregada";
  }
}

export function WorkOrdersList({
  workOrders,
  selectedWorkOrderId,
  onSelectWorkOrder,
  onCreateWorkOrder,
}: WorkOrdersListProps) {
  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Listado</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Órdenes</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Revisa órdenes activas, abre el detalle y actualiza el avance del trabajo en taller.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateWorkOrder}
          className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Nueva orden
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {workOrders.length > 0 ? (
          workOrders.map((order) => {
            const isActive = order.id === selectedWorkOrderId;

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectWorkOrder(order.id)}
                className={[
                  "flex w-full items-start gap-4 rounded-3xl border p-4 text-left transition",
                  isActive
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_18px_40px_rgba(28,25,23,0.2)]"
                    : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
                    isActive ? "bg-white/12 text-white" : "bg-amber-100 text-amber-700",
                  ].join(" ")}
                >
                  OT
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">
                    {order.vehicle
                      ? `${order.vehicle.licensePlate} · ${order.vehicle.brand} ${order.vehicle.model}`
                      : "Vehículo sin relación"}
                  </span>
                  <span className={["mt-1 block text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {order.client
                      ? `${order.client.firstName} ${order.client.lastName}`
                      : "Cliente sin relación"}
                  </span>
                  <span className={["mt-1 block text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    Técnico: {order.technician || "Sin asignar"}
                  </span>
                  <span className={["mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium", isActive ? "bg-white/10 text-stone-200" : "bg-stone-200 text-stone-700"].join(" ")}>
                    {getStatusLabel(order.status)}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
            <p className="text-base font-medium text-stone-900">Todavía no hay órdenes registradas</p>
            <p className="mt-2 text-sm text-stone-600">
              Crea la primera orden para registrar lo ejecutado realmente en el taller.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
