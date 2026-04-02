import type { AppointmentWithRelations } from "./use-appointments-storage";

type UpcomingAppointmentsProps = {
  appointments: AppointmentWithRelations[];
};

function getUpcomingAppointments(appointments: AppointmentWithRelations[]) {
  const today = new Date().toISOString().slice(0, 10);

  return appointments
    .filter((appointment) => appointment.date >= today && appointment.status !== "cancelled")
    .slice(0, 5);
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const upcomingAppointments = getUpcomingAppointments(appointments);

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Próximas</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Citas próximas</h2>
      </div>

      <div className="mt-5 space-y-3">
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <article key={appointment.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-semibold text-stone-950">
                {new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(
                  new Date(`${appointment.date}T12:00:00`)
                )}{" "}
                · {appointment.startTime}
              </p>
              <p className="mt-2 text-sm text-stone-700">
                {appointment.client
                  ? `${appointment.client.firstName} ${appointment.client.lastName}`
                  : "Cliente sin relación"}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {appointment.vehicle
                  ? `${appointment.vehicle.licensePlate} · ${appointment.vehicle.brand} ${appointment.vehicle.model}`
                  : "Vehículo sin relación"}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">{appointment.reason}</p>
            </article>
          ))
        ) : (
          <p className="text-sm leading-6 text-stone-600">
            No hay citas próximas en los datos actuales.
          </p>
        )}
      </div>
    </section>
  );
}
