import type { WorkOrder } from "@/types";

import { WorkOrderStatusSelect } from "./work-order-status-select";
import type { WorkOrderWithRelations } from "./use-work-orders-storage";

type WorkOrderDetailCardProps = {
  workOrder?: WorkOrderWithRelations;
  onEditWorkOrder: (workOrder: WorkOrder) => void;
  onCreateWorkOrder: () => void;
  onStatusChange: (workOrderId: string, status: WorkOrder["status"]) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    default:
      return "Baja";
  }
}

export function WorkOrderDetailCard({
  workOrder,
  onEditWorkOrder,
  onCreateWorkOrder,
  onStatusChange,
}: WorkOrderDetailCardProps) {
  if (!workOrder) {
    return (
      <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Selecciona una orden</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
          Desde aquí podrás revisar el avance, los trabajos ejecutados y las recomendaciones registradas.
        </p>
        <button
          type="button"
          onClick={onCreateWorkOrder}
          className="mt-6 inline-flex rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Crear orden
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            {workOrder.vehicle
              ? `${workOrder.vehicle.brand} ${workOrder.vehicle.model}`
              : "Orden sin vehículo relacionado"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Abierta el {formatDate(workOrder.openedAt)}. Técnico responsable: {workOrder.technician}.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <WorkOrderStatusSelect
            value={workOrder.status}
            onChange={(status) => onStatusChange(workOrder.id, status)}
          />
          <button
            type="button"
            onClick={() => onEditWorkOrder(workOrder)}
            className="inline-flex rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            Editar orden
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Relación</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-stone-500">Cliente</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {workOrder.client
                  ? `${workOrder.client.firstName} ${workOrder.client.lastName}`
                  : "Sin relación"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Vehículo</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {workOrder.vehicle
                  ? `${workOrder.vehicle.licensePlate} · ${workOrder.vehicle.brand} ${workOrder.vehicle.model}`
                  : "Sin relación"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Presupuesto vinculado</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {workOrder.quote ? `Sí (${workOrder.quote.items.length} ítems)` : "No vinculado"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Ingreso vinculado</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {workOrder.intakeRecord ? formatDate(workOrder.intakeRecord.receivedAt) : "No vinculado"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Observaciones generales
          </h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {workOrder.observations || "Sin observaciones registradas."}
          </p>
        </article>
      </div>

      <section className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
          Trabajos realizados
        </h3>
        <div className="mt-4 space-y-3">
          {workOrder.tasks.length > 0 ? (
            workOrder.tasks.map((task) => (
              <article key={task.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-950">{task.description}</p>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                    {task.completed ? "Realizado" : "Pendiente"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {task.notes || "Sin notas adicionales."}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm leading-6 text-stone-600">Sin trabajos registrados en esta orden.</p>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Trabajos sugeridos no realizados
          </h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {workOrder.suggestedWorkNotPerformed || "Sin trabajos sugeridos pendientes."}
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Motivo de rechazo
          </h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {workOrder.rejectedWorkReason || "Sin rechazos registrados."}
          </p>
        </article>
      </div>

      <section className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
          Recomendaciones post entrega
        </h3>
        <div className="mt-4 space-y-3">
          {workOrder.recommendations.length > 0 ? (
            workOrder.recommendations.map((recommendation) => (
              <article key={recommendation.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-950">{recommendation.title}</p>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                    {getPriorityLabel(recommendation.priority)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{recommendation.detail}</p>
              </article>
            ))
          ) : (
            <p className="text-sm leading-6 text-stone-600">Sin recomendaciones registradas.</p>
          )}
        </div>
      </section>
    </section>
  );
}
