import type { Quote } from "@/types";

import type { QuoteWithRelations } from "./use-quotes-storage";

type QuotesListProps = {
  quotes: QuoteWithRelations[];
  selectedQuoteId?: string;
  onSelectQuote: (quoteId: string) => void;
  onCreateQuote: () => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getQuoteStatusLabel(status: Quote["status"]) {
  switch (status) {
    case "draft":
      return "Borrador";
    case "sent":
      return "Enviado";
    case "approved":
      return "Aprobado";
    case "rejected":
      return "Rechazado";
    case "partial":
      return "Parcial";
  }
}

export function QuotesList({
  quotes,
  selectedQuoteId,
  onSelectQuote,
  onCreateQuote,
}: QuotesListProps) {
  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Listado</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Presupuestos</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Revisa presupuestos creados, abre el detalle y actualiza su estado cuando corresponda.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateQuote}
          className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Nuevo presupuesto
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {quotes.length > 0 ? (
          quotes.map((quote) => {
            const isActive = quote.id === selectedQuoteId;

            return (
              <button
                key={quote.id}
                type="button"
                onClick={() => onSelectQuote(quote.id)}
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
                  PR
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold">
                    {quote.vehicle
                      ? `${quote.vehicle.licensePlate} · ${quote.vehicle.brand} ${quote.vehicle.model}`
                      : "Vehículo sin relación"}
                  </span>
                  <span className={["mt-1 block text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {quote.client
                      ? `${quote.client.firstName} ${quote.client.lastName}`
                      : "Cliente sin relación"}
                  </span>
                  <span className={["mt-1 block text-sm", isActive ? "text-stone-300" : "text-stone-600"].join(" ")}>
                    {formatMoney(quote.total)} · {quote.items.length} ítem{quote.items.length === 1 ? "" : "s"}
                  </span>
                  <span className={["mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium", isActive ? "bg-white/10 text-stone-200" : "bg-stone-200 text-stone-700"].join(" ")}>
                    {getQuoteStatusLabel(quote.status)}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-5 py-10 text-center">
            <p className="text-base font-medium text-stone-900">Todavía no hay presupuestos</p>
            <p className="mt-2 text-sm text-stone-600">
              Crea el primer presupuesto para comenzar a cotizar trabajos del taller.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
