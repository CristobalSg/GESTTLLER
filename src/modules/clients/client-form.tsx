import { useEffect, useState } from "react";

import type { Client } from "@/types";

import {
  getClientFormValues,
  getEmptyClientFormValues,
  type ClientFormValues,
} from "./client-form.types";

const PHONE_PREFIX = "+56";

type ClientFormProps = {
  mode: "create" | "edit";
  client?: Client;
  onCancel: () => void;
  onSubmit: (values: ClientFormValues) => void;
};

type FormErrors = Partial<Record<keyof ClientFormValues, string>>;

function validateClientForm(values: ClientFormValues): FormErrors {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedPhone = values.phone.replace(/\D/g, "");

  if (!values.firstName.trim()) {
    errors.firstName = "Ingresa el nombre.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Ingresa el apellido.";
  }

  if (!normalizedPhone) {
    errors.phone = "Ingresa un teléfono de contacto.";
  }

  if (values.email.trim() && !emailPattern.test(values.email.trim())) {
    errors.email = "Ingresa un correo válido.";
  }

  if (normalizedPhone && normalizedPhone.length < 8) {
    errors.phone = "Ingresa un teléfono válido.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

function hasAdvancedValues(values: ClientFormValues) {
  return Boolean(
    values.email.trim() ||
      values.documentId.trim() ||
      values.street.trim() ||
      values.commune.trim() ||
      values.city.trim()
  );
}

export function ClientForm({ mode, client, onCancel, onSubmit }: ClientFormProps) {
  const [values, setValues] = useState<ClientFormValues>(
    client ? getClientFormValues(client) : getEmptyClientFormValues()
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() =>
    hasAdvancedValues(client ? getClientFormValues(client) : getEmptyClientFormValues())
  );

  useEffect(() => {
    const nextValues = client ? getClientFormValues(client) : getEmptyClientFormValues();
    setValues(nextValues);
    setErrors({});
    setIsAdvancedOpen(hasAdvancedValues(nextValues));
  }, [client, mode]);

  function updateField<K extends keyof ClientFormValues>(field: K, value: ClientFormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateClientForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      ...values,
      phone: `${PHONE_PREFIX} ${values.phone.replace(/\D/g, "")}`.trim(),
    });
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
          {mode === "create" ? "Nuevo cliente" : "Editar cliente"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          {mode === "create" ? "Registrar cliente" : "Actualizar información"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Completa los datos principales para guardar el registro en el almacenamiento local del prototipo.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Nombre</span>
            <input
              value={values.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.firstName} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Apellido</span>
            <input
              value={values.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.lastName} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Teléfono</span>
            <div className="flex overflow-hidden rounded-2xl border border-stone-300 bg-stone-50 transition focus-within:border-amber-500 focus-within:bg-white">
              <span className="inline-flex items-center border-r border-stone-300 px-4 text-sm font-medium text-stone-500">
                {PHONE_PREFIX}
              </span>
              <input
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="9 1234 5678"
                className="w-full bg-transparent px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
            </div>
            <FieldError message={errors.phone} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Canal preferido</span>
            <select
              value={values.preferredContact}
              onChange={(event) =>
                updateField("preferredContact", event.target.value as Client["preferredContact"])
              }
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="phone">Teléfono</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Correo</option>
            </select>
          </label>
        </div>

        <section className="rounded-3xl border border-stone-200 bg-stone-50/80">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen((currentValue) => !currentValue)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            aria-expanded={isAdvancedOpen}
          >
            <span>
              <span className="block text-sm font-semibold text-stone-900">Avanzados</span>
              <span className="mt-1 block text-xs text-stone-500">
                Correo, documento y dirección completa.
              </span>
            </span>
            <span className="text-lg font-semibold text-stone-500">{isAdvancedOpen ? "−" : "+"}</span>
          </button>

          {isAdvancedOpen ? (
            <div className="space-y-4 border-t border-stone-200 px-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Correo</span>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                  <FieldError message={errors.email} />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Documento</span>
                  <input
                    value={values.documentId}
                    onChange={(event) => updateField("documentId", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Calle</span>
                  <input
                    value={values.street}
                    onChange={(event) => updateField("street", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Comuna</span>
                  <input
                    value={values.commune}
                    onChange={(event) => updateField("commune", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Ciudad</span>
                <input
                  value={values.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                />
              </label>
            </div>
          ) : null}
        </section>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Notas</span>
          <textarea
            rows={4}
            value={values.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

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
            {mode === "create" ? "Guardar cliente" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
