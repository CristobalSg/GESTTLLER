import { getClientDisplayName, getVehicleBadge, getVehicleDisplayName, getVehicleTechnicalSummary } from "@/utils/entity-display";

import type { VehicleWithRelations } from "./use-vehicles-storage";

type VehiclesListProps = {
  vehicles: VehicleWithRelations[];
  searchTerm: string;
  selectedVehicleId?: string;
  onSearchTermChange: (value: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  onCreateVehicle: () => void;
};

export function VehiclesList({
  vehicles,
  searchTerm,
  selectedVehicleId,
  onSearchTermChange,
  onSelectVehicle,
  onCreateVehicle,
}: VehiclesListProps) {
  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Listado</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Vehículos</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Busca por patente, marca o modelo para abrir la ficha o editar el registro.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateVehicle}
          className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Nuevo vehículo
        </button>
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Buscar vehículo</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Ej: KJTX-42, Toyota, Hilux..."
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => {
            const isActive = vehicle.id === selectedVehicleId;

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => onSelectVehicle(vehicle.id)}
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
                    {getVehicleBadge(vehicle)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="block text-base font-semibold">{getVehicleDisplayName(vehicle)}</span>
                    {vehicle.isProvisional ? (
                      <span className={["rounded-full px-3 py-1 text-[11px] font-medium", isActive ? "bg-white/10 text-stone-200" : "bg-amber-100 text-amber-800"].join(" ")}>
                        Provisional
                      </span>
                    ) : null}
                  </span>
                  <span className={["mt-1 block text-sm font-medium", isActive ? "text-stone-200" : "text-stone-700"].join(" ")}>
                    {vehicle.licensePlate || "Patente pendiente"}
                  </span>
                  <span className={["mt-1 block truncate text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {vehicle.client ? getClientDisplayName(vehicle.client) : "Cliente sin asociación"}
                  </span>
                  <span className={["mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium", isActive ? "bg-white/10 text-stone-200" : "bg-stone-200 text-stone-700"].join(" ")}>
                    {getVehicleTechnicalSummary(vehicle)}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
            <p className="text-base font-medium text-stone-900">No se encontraron vehículos</p>
            <p className="mt-2 text-sm text-stone-600">
              Ajusta la búsqueda o registra un nuevo vehículo asociado a un cliente.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
