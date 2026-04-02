import { PageShell } from "../../components/shared/page-shell";
import { AppointmentForm } from "./appointment-form";
import type { AppointmentFormValues } from "./appointment-form.types";
import { AppointmentsList } from "./appointments-list";
import { UpcomingAppointments } from "./upcoming-appointments";
import { useAppointmentsStorage } from "./use-appointments-storage";

export function AppointmentsPage() {
  const {
    clients,
    vehicles,
    appointmentsWithRelations,
    createAppointment,
    updateAppointmentStatus,
  } = useAppointmentsStorage();

  function handleCreateAppointment(values: AppointmentFormValues) {
    createAppointment(values);
  }

  return (
    <PageShell
      eyebrow="Agenda"
      title="Agenda operativa del taller"
      description="Organiza citas por fecha, registra nuevas atenciones y actualiza el estado de cada ingreso de forma simple y persistente."
      stats={[
        { label: "Citas totales", value: String(appointmentsWithRelations.length) },
        {
          label: "Próximas activas",
          value: String(
            appointmentsWithRelations.filter(
              (appointment) => appointment.date >= "2026-04-01" && appointment.status !== "cancelled"
            ).length
          ),
        },
        {
          label: "Finalizadas",
          value: String(
            appointmentsWithRelations.filter((appointment) => appointment.status === "finalized").length
          ),
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,420px)]">
        <AppointmentsList
          appointments={appointmentsWithRelations}
          onStatusChange={updateAppointmentStatus}
        />

        <div className="space-y-6">
          <AppointmentForm
            clients={clients}
            vehicles={vehicles}
            onCancel={() => undefined}
            onSubmit={handleCreateAppointment}
          />
          <UpcomingAppointments appointments={appointmentsWithRelations} />
        </div>
      </div>
    </PageShell>
  );
}
