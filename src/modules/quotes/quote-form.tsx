import { useEffect, useMemo, useState } from "react";

import type { Client, Quote, QuoteItemType, Vehicle } from "@/types";

import {
  createEmptyQuoteItem,
  getEmptyQuoteFormValues,
  getQuoteFormValues,
  type QuoteFormValues,
} from "./quote-form.types";

type QuoteFormProps = {
  mode: "create" | "edit";
  clients: Client[];
  vehicles: Vehicle[];
  quote?: Quote;
  onCancel: () => void;
  onSubmit: (values: QuoteFormValues) => void;
};

type FormErrors = Partial<Record<keyof QuoteFormValues, string>> & {
  items?: string;
};

function validateQuoteForm(values: QuoteFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.clientId) {
    errors.clientId = "Selecciona un cliente.";
  }

  if (!values.vehicleId) {
    errors.vehicleId = "Selecciona un vehículo.";
  }

  const hasInvalidItem = values.items.some(
    (item) =>
      !item.description.trim() ||
      !item.quantity.trim() ||
      Number.isNaN(Number(item.quantity)) ||
      Number(item.quantity) <= 0 ||
      !item.unitPrice.trim() ||
      Number.isNaN(Number(item.unitPrice)) ||
      Number(item.unitPrice) < 0
  );

  if (hasInvalidItem) {
    errors.items = "Completa correctamente todos los ítems del presupuesto.";
  }

  return errors;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function QuoteForm({ mode, clients, vehicles, quote, onCancel, onSubmit }: QuoteFormProps) {
  const [values, setValues] = useState<QuoteFormValues>(
    quote ? getQuoteFormValues(quote) : getEmptyQuoteFormValues()
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setValues(quote ? getQuoteFormValues(quote) : getEmptyQuoteFormValues());
    setErrors({});
  }, [mode, quote]);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.clientId === values.clientId),
    [values.clientId, vehicles]
  );

  const quoteSubtotal = useMemo(
    () =>
      values.items.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        if (Number.isNaN(quantity) || Number.isNaN(unitPrice)) {
          return sum;
        }

        return sum + quantity * unitPrice;
      }, 0),
    [values.items]
  );

  function updateField<K extends keyof QuoteFormValues>(field: K, value: QuoteFormValues[K]) {
    setValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [field]: value,
      };

      if (field === "clientId") {
        return {
          ...nextValues,
          vehicleId: "",
        };
      }

      return nextValues;
    });
  }

  function updateItemField(
    itemId: string,
    field: "description" | "type" | "quantity" | "unitPrice",
    value: string
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      items: currentValues.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    }));
  }

  function handleAddItem() {
    setValues((currentValues) => ({
      ...currentValues,
      items: [...currentValues.items, createEmptyQuoteItem()],
    }));
  }

  function handleRemoveItem(itemId: string) {
    setValues((currentValues) => ({
      ...currentValues,
      items:
        currentValues.items.length > 1
          ? currentValues.items.filter((item) => item.id !== itemId)
          : currentValues.items,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateQuoteForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values);
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
          {mode === "create" ? "Nuevo presupuesto" : "Editar presupuesto"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          {mode === "create" ? "Cotizar trabajo" : "Actualizar presupuesto"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Completa los ítems y observaciones para dejar una propuesta clara y lista para futura conversión.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Cliente</span>
            <select
              value={values.clientId}
              onChange={(event) => updateField("clientId", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
            <FieldError message={errors.clientId} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Vehículo</span>
            <select
              value={values.vehicleId}
              onChange={(event) => updateField("vehicleId", event.target.value)}
              disabled={!values.clientId}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-amber-500 focus:bg-white"
            >
              <option value="">
                {values.clientId ? "Selecciona un vehículo" : "Selecciona primero un cliente"}
              </option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} · {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
            <FieldError message={errors.vehicleId} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Válido hasta (opcional)</span>
            <input
              type="date"
              value={values.validUntil}
              onChange={(event) => updateField("validUntil", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Estado</span>
            <select
              value={values.status}
              onChange={(event) => updateField("status", event.target.value as Quote["status"])}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="draft">Borrador</option>
              <option value="sent">Enviado</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
              <option value="partial">Parcial</option>
            </select>
          </label>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Ítems</h3>
          </div>

          <div className="mt-4 space-y-4">
            {values.items.map((item, index) => {
              const subtotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);

              return (
                <article key={item.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-900">Ítem {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={values.items.length === 1}
                      className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-stone-400"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Nombre</span>
                      <input
                        value={item.description}
                        onChange={(event) => updateItemField(item.id, "description", event.target.value)}
                        className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Tipo</span>
                      <select
                        value={item.type}
                        onChange={(event) =>
                          updateItemField(item.id, "type", event.target.value as QuoteItemType)
                        }
                        className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                      >
                        <option value="service">Servicio</option>
                        <option value="part">Repuesto</option>
                        <option value="labor">Mano de obra</option>
                      </select>
                    </label>

                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-stone-700">Cantidad</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) => updateItemField(item.id, "quantity", event.target.value)}
                          className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-stone-700">Precio unitario</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.unitPrice}
                          onChange={(event) => updateItemField(item.id, "unitPrice", event.target.value)}
                          className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                        />
                      </label>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <p className="text-sm text-stone-500">Subtotal</p>
                      <p className="mt-1 text-base font-semibold text-stone-900">{formatMoney(subtotal)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddItem}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
            >
              Agregar ítem
            </button>
          </div>

          <FieldError message={errors.items} />
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Observaciones generales</span>
          <textarea
            rows={4}
            value={values.observations}
            onChange={(event) => updateField("observations", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Observaciones sobre trabajos no aceptados
          </span>
          <textarea
            rows={4}
            value={values.declinedWorkNotes}
            onChange={(event) => updateField("declinedWorkNotes", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <p className="text-sm font-medium text-stone-500">Total estimado</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{formatMoney(quoteSubtotal)}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            {mode === "create" ? "Guardar presupuesto" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
