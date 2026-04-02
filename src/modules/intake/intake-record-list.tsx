import type { IntakeRecordWithRelations } from "./use-intake-storage";

type IntakeRecordListProps = {
  records: IntakeRecordWithRelations[];
  selectedRecordId?: string;
  onSelectRecord: (recordId: string) => void;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function IntakeRecordList({
  records,
  selectedRecordId,
  onSelectRecord,
}: IntakeRecordListProps) {
  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Registros</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Ingresos recientes</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Selecciona un ingreso para revisar su detalle completo y la evidencia registrada.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {records.length > 0 ? (
          records.map((record) => {
            const isActive = record.id === selectedRecordId;

            return (
              <button
                key={record.id}
                type="button"
                onClick={() => onSelectRecord(record.id)}
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
                  IN
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">
                    {record.vehicle
                      ? `${record.vehicle.licensePlate} · ${record.vehicle.brand} ${record.vehicle.model}`
                      : "Vehículo sin relación"}
                  </span>
                  <span className={["mt-1 block text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {record.client
                      ? `${record.client.firstName} ${record.client.lastName}`
                      : "Cliente sin relación"}
                  </span>
                  <span className={["mt-1 block text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {formatDateTime(record.receivedAt)}
                  </span>
                  <span className={["mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium", isActive ? "bg-white/10 text-stone-200" : "bg-stone-200 text-stone-700"].join(" ")}>
                    {record.photos.length} evidencia{record.photos.length === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
            <p className="text-base font-medium text-stone-900">Todavía no hay ingresos registrados</p>
            <p className="mt-2 text-sm text-stone-600">
              Usa el formulario para dejar constancia del primer ingreso al taller.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
