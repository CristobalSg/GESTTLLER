import type { Quote } from "@/types";

import { QuoteStatusSelect } from "./quote-status-select";
import type { QuoteWithRelations } from "./use-quotes-storage";

type QuoteDetailCardProps = {
  quote?: QuoteWithRelations;
  onEditQuote: (quote: Quote) => void;
  onCreateQuote: () => void;
  onStatusChange: (quoteId: string, status: Quote["status"]) => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function QuoteDetailCard({
  quote,
  onEditQuote,
  onCreateQuote,
  onStatusChange,
}: QuoteDetailCardProps) {
  if (!quote) {
    return (
      <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Selecciona un presupuesto</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
          Desde aquí podrás revisar totales, ítems y observaciones del presupuesto seleccionado.
        </p>
        <button
          type="button"
          onClick={onCreateQuote}
          className="mt-6 inline-flex rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Crear presupuesto
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            {quote.vehicle
              ? `${quote.vehicle.brand} ${quote.vehicle.model}`
              : "Presupuesto sin vehículo relacionado"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Vigente hasta {formatDate(quote.validUntil)}.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <QuoteStatusSelect value={quote.status} onChange={(status) => onStatusChange(quote.id, status)} />
          <button
            type="button"
            onClick={() => onEditQuote(quote)}
            className="inline-flex rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            Editar presupuesto
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Relación</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-stone-500">Cliente</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {quote.client ? `${quote.client.firstName} ${quote.client.lastName}` : "Sin relación"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Vehículo</dt>
              <dd className="mt-1 font-medium text-stone-900">
                {quote.vehicle
                  ? `${quote.vehicle.licensePlate} · ${quote.vehicle.brand} ${quote.vehicle.model}`
                  : "Sin relación"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Creado</dt>
              <dd className="mt-1 font-medium text-stone-900">{formatDate(quote.createdAt)}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Totales</h3>
          <p className="mt-4 text-sm text-stone-500">Subtotal</p>
          <p className="mt-1 text-xl font-semibold text-stone-950">{formatMoney(quote.subtotal)}</p>
          <p className="mt-4 text-sm text-stone-500">Total</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-stone-950">
            {formatMoney(quote.total)}
          </p>
        </article>
      </div>

      <section className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Ítems cotizados</h3>
        <div className="mt-4 space-y-3">
          {quote.items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-stone-950">{item.description}</p>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                  {item.type === "service" ? "Servicio" : item.type === "part" ? "Repuesto" : "Mano de obra"}
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                {item.quantity} x {formatMoney(item.unitPrice)}
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">{formatMoney(item.total)}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Observaciones generales
          </h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {quote.observations || "Sin observaciones generales registradas."}
          </p>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Trabajos no aceptados
          </h3>
          <p className="mt-4 text-sm leading-6 text-stone-700">
            {quote.declinedWorkNotes || "Sin observaciones sobre trabajos no aceptados."}
          </p>
        </article>
      </div>
    </section>
  );
}
