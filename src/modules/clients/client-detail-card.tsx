import type { Client } from "@/types";
import {
  getClientDisplayName,
  getVehicleDisplayName,
  getVehicleTechnicalSummary,
} from "@/utils/entity-display";

import type { ClientWithVehicles } from "./use-clients-storage";

type ClientDetailCardProps = {
  client?: ClientWithVehicles;
  onEditClient: (client: Client) => void;
  onAddVehicle: (client: Client) => void;
  onCreateClient: () => void;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function getPreferredContactLabel(preferredContact: Client["preferredContact"]) {
  switch (preferredContact) {
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "Correo";
    default:
      return "Teléfono";
  }
}

export function ClientDetailCard({ client, onEditClient, onAddVehicle, onCreateClient }: ClientDetailCardProps) {
  if (!client) {
    return (
      <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Selecciona un cliente</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
          Desde aquí podrás revisar la información del cliente, sus vehículos asociados y abrir la edición del registro.
        </p>

        <div className="mt-8 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-6">
          <p className="text-sm font-medium text-stone-900">Todavía no hay un cliente seleccionado.</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Elige un cliente desde el listado o crea uno nuevo para comenzar a trabajar.
          </p>
          <button
            type="button"
            onClick={onCreateClient}
            className="mt-5 inline-flex rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Crear cliente
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">{getClientDisplayName(client)}</h2>
            {client.isProvisional ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                Provisional
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Registrado el {formatDate(client.createdAt)}. Canal preferido: {getPreferredContactLabel(client.preferredContact)}.
          </p>
          {client.isProvisional ? (
            <p className="mt-2 text-sm leading-6 text-amber-700">
              Este cliente fue creado provisionalmente desde agenda y aún necesita completar su ficha.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onEditClient(client)}
          className="inline-flex rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
        >
          Editar cliente
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Contacto</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-stone-500">Teléfono</dt>
              <dd className="mt-1 font-medium text-stone-900">{client.phone || "Pendiente"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Correo</dt>
              <dd className="mt-1 font-medium text-stone-900">{client.email || "Pendiente"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Documento</dt>
              <dd className="mt-1 font-medium text-stone-900">{client.documentId ?? "Sin registrar"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Dirección</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {client.address
                  ? `${client.address.street}, ${client.address.commune}, ${client.address.city}`
                  : "Sin dirección registrada"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Notas</h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {client.notes || "Sin observaciones registradas para este cliente."}
          </p>
        </article>
      </div>

      <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Vehículos asociados</h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
            {client.vehicles.length} registrado{client.vehicles.length === 1 ? "" : "s"}
          </span>
        </div>

        {client.vehicles.length > 0 ? (
          <div className="mt-4">
            <div className="grid gap-3">
              {client.vehicles.map((vehicle) => (
                <article key={vehicle.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-sm font-semibold text-stone-950">
                    {getVehicleDisplayName(vehicle)}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {vehicle.licensePlate ? `Patente ${vehicle.licensePlate}` : "Patente pendiente"}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {getVehicleTechnicalSummary(vehicle)}
                  </p>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onAddVehicle(client)}
              className="mt-4 inline-flex rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
            >
              Agregar vehículo
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm leading-6 text-stone-600">
              Este cliente aún no tiene vehículos asociados en el prototipo.
            </p>
            <button
              type="button"
              onClick={() => onAddVehicle(client)}
              className="mt-4 inline-flex rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
            >
              Registrar primer vehículo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
