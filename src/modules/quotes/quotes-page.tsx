import { useEffect, useState } from "react";

import { PageShell } from "../../components/shared/page-shell";
import type { Quote } from "../../types";
import { QuoteDetailCard } from "./quote-detail-card";
import { QuoteForm } from "./quote-form";
import type { QuoteFormValues } from "./quote-form.types";
import { QuotesList } from "./quotes-list";
import { useQuotesStorage } from "./use-quotes-storage";

type PanelMode = "detail" | "create" | "edit";

export function QuotesPage() {
  const { clients, vehicles, quotesWithRelations, createQuote, updateQuote, updateQuoteStatus } =
    useQuotesStorage();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | undefined>(quotesWithRelations[0]?.id);
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();

  const selectedQuote =
    quotesWithRelations.find((quote) => quote.id === selectedQuoteId) ?? quotesWithRelations[0];

  useEffect(() => {
    if (!quotesWithRelations.length) {
      setSelectedQuoteId(undefined);
      return;
    }

    const stillExists = quotesWithRelations.some((quote) => quote.id === selectedQuoteId);

    if (!stillExists) {
      setSelectedQuoteId(quotesWithRelations[0].id);
    }
  }, [quotesWithRelations, selectedQuoteId]);

  function handleSelectQuote(quoteId: string) {
    setSelectedQuoteId(quoteId);
    setEditingQuote(undefined);
    setPanelMode("detail");
  }

  function handleCreateQuote() {
    setEditingQuote(undefined);
    setPanelMode("create");
  }

  function handleEditQuote(quote: Quote) {
    setSelectedQuoteId(quote.id);
    setEditingQuote(quote);
    setPanelMode("edit");
  }

  function handleCreateSubmit(values: QuoteFormValues) {
    const nextQuote = createQuote(values);
    setSelectedQuoteId(nextQuote.id);
    setEditingQuote(undefined);
    setPanelMode("detail");
  }

  function handleEditSubmit(values: QuoteFormValues) {
    if (!editingQuote) {
      return;
    }

    const updatedQuote = updateQuote(editingQuote.id, values);

    if (updatedQuote) {
      setSelectedQuoteId(updatedQuote.id);
    }

    setEditingQuote(undefined);
    setPanelMode("detail");
  }

  function handleCancelForm() {
    setEditingQuote(undefined);
    setPanelMode("detail");
  }

  return (
    <PageShell
      eyebrow="Presupuestos"
      title="Cotización de trabajos"
      description="Crea y actualiza presupuestos con ítems detallados, cálculos automáticos y estados claros para el flujo comercial del taller."
      stats={[
        { label: "Presupuestos totales", value: String(quotesWithRelations.length) },
        {
          label: "Aprobados o parciales",
          value: String(
            quotesWithRelations.filter((quote) => ["approved", "partial"].includes(quote.status)).length
          ),
        },
        {
          label: "Monto cotizado",
          value: new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
          }).format(quotesWithRelations.reduce((sum, quote) => sum + quote.total, 0)),
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <QuotesList
          quotes={quotesWithRelations}
          selectedQuoteId={selectedQuote?.id}
          onSelectQuote={handleSelectQuote}
          onCreateQuote={handleCreateQuote}
        />

        {panelMode === "create" ? (
          <QuoteForm
            mode="create"
            clients={clients}
            vehicles={vehicles}
            onCancel={handleCancelForm}
            onSubmit={handleCreateSubmit}
          />
        ) : null}

        {panelMode === "edit" ? (
          <QuoteForm
            mode="edit"
            clients={clients}
            vehicles={vehicles}
            quote={editingQuote}
            onCancel={handleCancelForm}
            onSubmit={handleEditSubmit}
          />
        ) : null}

        {panelMode === "detail" ? (
          <QuoteDetailCard
            quote={selectedQuote}
            onEditQuote={handleEditQuote}
            onCreateQuote={handleCreateQuote}
            onStatusChange={updateQuoteStatus}
          />
        ) : null}
      </div>
    </PageShell>
  );
}
