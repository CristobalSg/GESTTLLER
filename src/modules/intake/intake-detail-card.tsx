import type { IntakeRecordWithRelations } from "./use-intake-storage";

type IntakeDetailCardProps = {
  record?: IntakeRecordWithRelations;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFuelLevelLabel(fuelLevel: IntakeRecordWithRelations["checklist"]["fuelLevel"]) {
  switch (fuelLevel) {
    case "empty":
      return "Vacío";
    case "quarter":
      return "1/4";
    case "half":
      return "1/2";
    case "three-quarters":
      return "3/4";
    case "full":
      return "Lleno";
  }
}

export function IntakeDetailCard({ record }: IntakeDetailCardProps) {
  if (!record) {
    return (
      <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Selecciona un ingreso</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
          Desde aquí podrás revisar el registro completo de recepción, kilometraje, observaciones y evidencia visual.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          {record.vehicle
            ? `${record.vehicle.brand} ${record.vehicle.model}`
            : "Ingreso sin vehículo relacionado"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Recepcionado el {formatDateTime(record.receivedAt)}.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Datos base</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-stone-500">Cliente</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {record.client
                  ? `${record.client.firstName} ${record.client.lastName}`
                  : "Sin relación"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Vehículo</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {record.vehicle
                  ? `${record.vehicle.licensePlate} · ${record.vehicle.brand} ${record.vehicle.model}`
                  : "Sin relación"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Kilometraje</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {record.mileageKm.toLocaleString("es-CL")} km
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Combustible</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {getFuelLevelLabel(record.checklist.fuelLevel)}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Elementos recibidos
          </h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              Rueda de repuesto: {record.checklist.spareTireIncluded ? "Sí" : "No"}
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              Herramientas: {record.checklist.toolsIncluded ? "Sí" : "No"}
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              Radio / multimedia: {record.checklist.radioIncluded ? "Sí" : "No"}
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              Documentos recibidos: {record.checklist.documentsReceived ? "Sí" : "No"}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Motivo de ingreso
          </h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">{record.reportedIssue}</p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Daños previos / estado de llegada
          </h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {record.arrivalCondition || "Sin observaciones de llegada."}
          </p>
        </article>
      </div>

      <article className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
          Observaciones iniciales
        </h3>
        <p className="mt-4 text-sm leading-6 text-stone-700">
          {record.observations || "Sin observaciones adicionales."}
        </p>
      </article>

      <section className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Evidencia visual
          </h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
            {record.photos.length} archivo{record.photos.length === 1 ? "" : "s"}
          </span>
        </div>

        {record.photos.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {record.photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <img src={photo.url} alt={photo.caption} className="h-44 w-full object-cover" />
                <div className="border-t border-stone-200 px-4 py-3">
                  <p className="text-sm font-medium text-stone-800">{photo.caption}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-stone-600">
            No se adjuntaron imágenes en este registro.
          </p>
        )}
      </section>
    </section>
  );
}
