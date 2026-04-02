import { PageShell } from "../../components/shared/page-shell";
import { useDashboardMetrics } from "../dashboard/use-dashboard-metrics";

function formatAppointmentDate(date: string, time: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(`${date}T12:00:00`)).concat(` · ${time}`);
}

export function HomePage() {
  const metrics = useDashboardMetrics();

  return (
    <PageShell
      eyebrow="Inicio"
      title="Operación del día"
      description="Entrada rápida al taller para revisar las próximas citas y el estado general del flujo sin entrar al dashboard completo."
      stats={[
        { label: "Citas pendientes", value: String(metrics.pendingAppointmentsCount) },
        { label: "Citas para hoy", value: String(metrics.todayAppointmentsCount) },
        { label: "Órdenes activas", value: String(metrics.activeWorkOrdersCount) },
      ]}
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[24px] border border-stone-200/80 bg-stone-50 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Clientes registrados</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.totalClients}
            </p>
            <p className="mt-2 text-sm text-stone-600">Base actual disponible para agendar y generar documentos.</p>
          </article>

          <article className="rounded-[24px] border border-stone-200/80 bg-stone-50 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Vehículos registrados</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.totalVehicles}
            </p>
            <p className="mt-2 text-sm text-stone-600">Inventario operativo asociado a clientes del prototipo.</p>
          </article>

          <article className="rounded-[24px] border border-stone-200/80 bg-stone-50 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Presupuestos aprobados</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.approvedQuotesCount}
            </p>
            <p className="mt-2 text-sm text-stone-600">Referencias rápidas para medir avance comercial del taller.</p>
          </article>
        </section>

        <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
          <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                Seguimiento inmediato
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                Citas pendientes
              </h2>
            </div>
            <p className="text-sm text-stone-600">Máximo 5 próximas citas no canceladas.</p>
          </div>

          <div className="mt-5 space-y-3">
            {metrics.upcomingAppointments.length > 0 ? (
              metrics.upcomingAppointments.map((appointment) => (
                <article key={appointment.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-stone-950">
                    {formatAppointmentDate(appointment.date, appointment.startTime)}
                  </p>
                  <p className="mt-2 text-sm text-stone-700">{appointment.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
                    <span className="rounded-full bg-white px-3 py-1">
                      Duración estimada: {appointment.estimatedDurationMinutes} min
                    </span>
                    <span className="rounded-full bg-white px-3 py-1">
                      Estado: {appointment.status}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-stone-600">
                No hay citas pendientes registradas en este momento.
              </p>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
