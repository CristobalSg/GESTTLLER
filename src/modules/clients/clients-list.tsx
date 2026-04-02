import type { Client } from "@/types";

import type { ClientWithVehicles } from "./use-clients-storage";

type ClientsListProps = {
  clients: ClientWithVehicles[];
  searchTerm: string;
  selectedClientId?: string;
  onSearchTermChange: (value: string) => void;
  onSelectClient: (clientId: string) => void;
  onCreateClient: () => void;
};

function getClientInitials(client: Client) {
  return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
}

export function ClientsList({
  clients,
  searchTerm,
  selectedClientId,
  onSearchTermChange,
  onSelectClient,
  onCreateClient,
}: ClientsListProps) {
  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Listado</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Clientes</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Busca por nombre, teléfono o correo para abrir el detalle o editar un registro.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateClient}
          className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Nuevo cliente
        </button>
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Buscar cliente</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Ej: Marcela, +56 9..., correo@..."
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {clients.length > 0 ? (
          clients.map((client) => {
            const isActive = client.id === selectedClientId;

            return (
              <button
                key={client.id}
                type="button"
                onClick={() => onSelectClient(client.id)}
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
                  {getClientInitials(client)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">
                    {client.firstName} {client.lastName}
                  </span>
                  <span className={["mt-1 block text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {client.phone}
                  </span>
                  <span className={["mt-1 block truncate text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {client.email}
                  </span>
                  <span className={["mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium", isActive ? "bg-white/10 text-stone-200" : "bg-stone-200 text-stone-700"].join(" ")}>
                    {client.vehicles.length} vehículo{client.vehicles.length === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
            <p className="text-base font-medium text-stone-900">No se encontraron clientes</p>
            <p className="mt-2 text-sm text-stone-600">
              Ajusta el criterio de búsqueda o crea un nuevo registro desde este módulo.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
