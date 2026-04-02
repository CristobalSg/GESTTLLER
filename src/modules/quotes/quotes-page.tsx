import { useEffect, useState } from "react";

import { ModalShell } from "../../components/shared/modal-shell";
import { PageShell } from "../../components/shared/page-shell";
import type { Quote } from "../../types";
import { QuoteDetailCard } from "./quote-detail-card";
import { QuoteForm } from "./quote-form";
import type { QuoteFormValues } from "./quote-form.types";
import { useQuotePdfActions } from "./pdf/use-quote-pdf-actions";
import { QuotesList } from "./quotes-list";
import { useQuotesStorage } from "./use-quotes-storage";

type ModalMode = "closed" | "detail" | "create" | "edit";

export function QuotesPage() {
  const { clients, vehicles, quotesWithRelations, createQuote, updateQuote, updateQuoteStatus } =
    useQuotesStorage();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | undefined>(quotesWithRelations[0]?.id);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();

  const selectedQuote =
    quotesWithRelations.find((quote) => quote.id === selectedQuoteId) ?? quotesWithRelations[0];
  const { canSharePdf, isPreparingPdf, handleDownloadPdf, handleSharePdf } = useQuotePdfActions(selectedQuote);

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
    setModalMode("detail");
  }

  function handleCreateQuote() {
    setEditingQuote(undefined);
    setModalMode("create");
  }

  function handleEditQuote(quote: Quote) {
    setSelectedQuoteId(quote.id);
    setEditingQuote(quote);
    setModalMode("edit");
  }

  function handleCreateSubmit(values: QuoteFormValues) {
    const nextQuote = createQuote(values);
    setSelectedQuoteId(nextQuote.id);
    setEditingQuote(undefined);
    setModalMode("detail");
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
    setModalMode("detail");
  }

  function handleCloseModal() {
    setEditingQuote(undefined);
    setModalMode("closed");
  }

  function handleCancelForm() {
    if (editingQuote) {
      setModalMode("detail");
      return;
    }

    handleCloseModal();
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
      <div>
        <QuotesList
          quotes={quotesWithRelations}
          selectedQuoteId={selectedQuote?.id}
          onSelectQuote={handleSelectQuote}
          onCreateQuote={handleCreateQuote}
        />
      </div>

      {modalMode === "create" ? (
        <ModalShell onClose={handleCloseModal} maxWidthClassName="max-w-5xl">
          <QuoteForm
            mode="create"
            clients={clients}
            vehicles={vehicles}
            onCancel={handleCancelForm}
            onSubmit={handleCreateSubmit}
          />
        </ModalShell>
      ) : null}

      {modalMode === "edit" ? (
        <ModalShell onClose={handleCloseModal} maxWidthClassName="max-w-5xl">
          <QuoteForm
            mode="edit"
            clients={clients}
            vehicles={vehicles}
            quote={editingQuote}
            onCancel={handleCancelForm}
            onSubmit={handleEditSubmit}
          />
        </ModalShell>
      ) : null}

      {modalMode === "detail" ? (
        <ModalShell onClose={handleCloseModal} maxWidthClassName="max-w-5xl">
          <QuoteDetailCard
            quote={selectedQuote}
            onEditQuote={handleEditQuote}
            onCreateQuote={handleCreateQuote}
            onDownloadPdf={handleDownloadPdf}
            onSharePdf={handleSharePdf}
            onStatusChange={updateQuoteStatus}
            canSharePdf={canSharePdf}
            isPreparingPdf={isPreparingPdf}
          />
        </ModalShell>
      ) : null}
    </PageShell>
  );
}
