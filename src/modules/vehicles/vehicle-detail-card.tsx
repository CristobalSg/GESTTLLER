import type { Vehicle } from "@/types";

import type { VehicleWithRelations } from "./use-vehicles-storage";

type VehicleDetailCardProps = {
  vehicle?: VehicleWithRelations;
  onEditVehicle: (vehicle: Vehicle) => void;
  onCreateVehicle: () => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function getAppointmentStatusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada";
    case "pending":
      return "Pendiente";
    case "finalized":
      return "Finalizada";
    case "cancelled":
      return "Cancelada";
    case "in-progress":
      return "En proceso";
    default:
      return status;
  }
}

export function VehicleDetailCard({
  vehicle,
  onEditVehicle,
  onCreateVehicle,
}: VehicleDetailCardProps) {
  if (!vehicle) {
    return (
      <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Selecciona un vehículo</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
          Desde esta ficha podrás revisar la información principal, el cliente asociado y el historial básico disponible.
        </p>

        <div className="mt-8 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-6">
          <p className="text-sm font-medium text-stone-900">Todavía no hay un vehículo seleccionado.</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Elige un registro del listado o crea uno nuevo para comenzar a asociarlo a un cliente.
          </p>
          <button
            type="button"
            onClick={onCreateVehicle}
            className="mt-5 inline-flex rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Crear vehículo
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            {vehicle.brand} {vehicle.model}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Patente {vehicle.licensePlate} · registrado el {formatDate(vehicle.createdAt)}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEditVehicle(vehicle)}
          className="inline-flex rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
        >
          Editar vehículo
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Ficha técnica</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-stone-500">Año</dt>
              <dd className="mt-1 font-medium text-stone-900">{vehicle.year}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Color</dt>
              <dd className="mt-1 font-medium text-stone-900">{vehicle.color}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Combustible</dt>
              <dd className="mt-1 font-medium capitalize text-stone-900">{vehicle.fuelType}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Transmisión</dt>
              <dd className="mt-1 font-medium capitalize text-stone-900">{vehicle.transmission}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Kilometraje</dt>
              <dd className="mt-1 font-medium text-stone-900">{vehicle.mileageKm.toLocaleString("es-CL")} km</dd>
            </div>
            <div>
              <dt className="text-stone-500">VIN</dt>
              <dd className="mt-1 font-medium text-stone-900">{vehicle.vin ?? "Sin registrar"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Cliente asociado</h3>
          {vehicle.client ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="font-medium text-stone-900">
                {vehicle.client.firstName} {vehicle.client.lastName}
              </p>
              <p className="text-stone-600">{vehicle.client.phone}</p>
              <p className="text-stone-600">{vehicle.client.email}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-stone-600">
              Este vehículo no tiene un cliente asociado en los datos actuales.
            </p>
          )}

          <div className="mt-6 border-t border-stone-200 pt-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Último servicio registrado
            </h4>
            <p className="mt-3 text-sm text-stone-700">
              {vehicle.lastServiceAt ? formatDate(vehicle.lastServiceAt) : "Sin fecha de servicio registrada"}
            </p>
          </div>
        </article>
      </div>

      <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Observaciones</h3>
        <p className="mt-4 text-sm leading-6 text-stone-700">
          {vehicle.notes || "Sin observaciones registradas para este vehículo."}
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Historial básico</h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
            {vehicle.appointments.length} cita{vehicle.appointments.length === 1 ? "" : "s"}
          </span>
        </div>

        {vehicle.appointments.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {vehicle.appointments.map((appointment) => (
              <article key={appointment.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-stone-950">{appointment.reason}</p>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                    {getAppointmentStatusLabel(appointment.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {appointment.date} · {appointment.startTime} a {appointment.endTime}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{appointment.notes}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-stone-600">
            No hay historial básico relacionado para este vehículo en los mocks actuales.
          </p>
        )}
      </div>
    </section>
  );
}
