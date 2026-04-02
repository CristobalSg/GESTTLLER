import type { AppointmentWithRelations } from "./use-appointments-storage";
import { AppointmentStatusSelect } from "./appointment-status-select";

type AppointmentsListProps = {
  appointments: AppointmentWithRelations[];
  onStatusChange: (appointmentId: string, status: AppointmentWithRelations["status"]) => void;
};

function formatSectionDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

function groupAppointmentsByDate(appointments: AppointmentWithRelations[]) {
  return appointments.reduce<Record<string, AppointmentWithRelations[]>>((groups, appointment) => {
    const currentGroup = groups[appointment.date] ?? [];
    currentGroup.push(appointment);
    groups[appointment.date] = currentGroup;
    return groups;
  }, {});
}

export function AppointmentsList({ appointments, onStatusChange }: AppointmentsListProps) {
  const groupedAppointments = groupAppointmentsByDate(appointments);
  const sortedDates = Object.keys(groupedAppointments).sort((left, right) => left.localeCompare(right));

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Agenda diaria</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Citas programadas</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Vista simple por fecha para revisar la carga del taller y mover el estado de cada atención.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <section key={date}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {formatSectionDate(date)}
                </h3>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                  {groupedAppointments[date].length} cita{groupedAppointments[date].length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {groupedAppointments[date].map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-3xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                            {appointment.estimatedDurationMinutes} min
                          </span>
                        </div>

                        <h4 className="mt-3 text-base font-semibold text-stone-950">{appointment.reason}</h4>
                        <p className="mt-2 text-sm text-stone-700">
                          {appointment.client
                            ? `${appointment.client.firstName} ${appointment.client.lastName}`
                            : "Cliente sin relación"}
                          {" · "}
                          {appointment.vehicle
                            ? `${appointment.vehicle.licensePlate} · ${appointment.vehicle.brand} ${appointment.vehicle.model}`
                            : "Vehículo sin relación"}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {appointment.notes || "Sin notas adicionales para esta cita."}
                        </p>
                      </div>

                      <AppointmentStatusSelect
                        value={appointment.status}
                        onChange={(status) => onStatusChange(appointment.id, status)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
            <p className="text-base font-medium text-stone-900">Todavía no hay citas registradas</p>
            <p className="mt-2 text-sm text-stone-600">
              Crea la primera cita desde el formulario para comenzar a usar la agenda del taller.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
