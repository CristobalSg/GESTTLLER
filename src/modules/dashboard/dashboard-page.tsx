import { PageShell } from "../../components/shared/page-shell";
import { useDashboardMetrics } from "./use-dashboard-metrics";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAppointmentDate(date: string, time: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(`${date}T12:00:00`)).concat(` · ${time}`);
}

export function DashboardPage() {
  const metrics = useDashboardMetrics();

  return (
    <PageShell
      eyebrow="Dashboard"
      title="Resumen operativo del taller"
      description="Vista rápida para revisar volumen de trabajo, avance comercial y comportamiento general del prototipo con los datos actualmente registrados."
      stats={[
        { label: "Clientes", value: String(metrics.totalClients) },
        { label: "Vehículos", value: String(metrics.totalVehicles) },
        { label: "Citas registradas", value: String(metrics.totalAppointments) },
      ]}
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-[24px] border border-stone-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Total de clientes</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.totalClients}
            </p>
          </article>
          <article className="rounded-[24px] border border-stone-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Total de vehículos</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.totalVehicles}
            </p>
          </article>
          <article className="rounded-[24px] border border-stone-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Total de citas</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.totalAppointments}
            </p>
          </article>
          <article className="rounded-[24px] border border-stone-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Total de presupuestos</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.totalQuotes}
            </p>
          </article>
          <article className="rounded-[24px] border border-stone-200/80 bg-white/85 p-5 shadow-sm">
            <p className="text-sm text-stone-500">Total de órdenes</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {metrics.totalWorkOrders}
            </p>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <article className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Indicadores
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm text-stone-500">Monto total cobrado</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                  {formatMoney(metrics.totalCharged)}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Suma estimada de presupuestos vinculados a órdenes terminadas o entregadas.
                </p>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm text-stone-500">Presupuestos aprobados</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                  {metrics.approvedQuotesCount}
                </p>
                <p className="mt-2 text-sm text-stone-600">Cantidad de presupuestos en estado aprobado.</p>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm text-stone-500">Presupuestos rechazados</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                  {metrics.rejectedQuotesCount}
                </p>
                <p className="mt-2 text-sm text-stone-600">Presupuestos no aceptados por clientes.</p>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-sm text-stone-500">Actividad próxima</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                  {metrics.upcomingAppointments.length}
                </p>
                <p className="mt-2 text-sm text-stone-600">Citas próximas no canceladas visibles en agenda.</p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Citas próximas
            </p>
            <div className="mt-5 space-y-3">
              {metrics.upcomingAppointments.length > 0 ? (
                metrics.upcomingAppointments.map((appointment) => (
                  <article key={appointment.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-stone-950">
                      {formatAppointmentDate(appointment.date, appointment.startTime)}
                    </p>
                    <p className="mt-2 text-sm text-stone-700">{appointment.reason}</p>
                    <p className="mt-2 text-sm text-stone-600">
                      Duración estimada: {appointment.estimatedDurationMinutes} min
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-600">
                  No hay citas próximas registradas en este momento.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Trabajos más frecuentes
            </p>
            <div className="mt-5 space-y-3">
              {metrics.mostFrequentJobs.length > 0 ? (
                metrics.mostFrequentJobs.map((job) => (
                  <div
                    key={job.label}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-4 py-4"
                  >
                    <p className="text-sm font-medium text-stone-900">{job.label}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                      {job.count} vez{job.count === 1 ? "" : "es"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-600">
                  Aún no hay suficientes órdenes para identificar trabajos frecuentes.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Ingresos por período
            </p>
            <div className="mt-5 space-y-3">
              {metrics.incomeByPeriod.length > 0 ? (
                metrics.incomeByPeriod.map((period) => (
                  <div
                    key={period.label}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-4 py-4"
                  >
                    <p className="text-sm font-medium text-stone-900">{period.label}</p>
                    <span className="text-sm font-semibold text-stone-950">
                      {formatMoney(period.total)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-600">
                  Aún no hay órdenes cerradas con presupuesto vinculado para estimar ingresos por período.
                </p>
              )}
            </div>
          </article>
        </section>
      </div>
    </PageShell>
  );
}
