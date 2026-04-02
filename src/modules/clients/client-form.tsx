import { useEffect, useState } from "react";

import type { Client } from "@/types";

import {
  getClientFormValues,
  getEmptyClientFormValues,
  type ClientFormValues,
} from "./client-form.types";

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

  if (!values.firstName.trim()) {
    errors.firstName = "Ingresa el nombre.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Ingresa el apellido.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Ingresa un teléfono de contacto.";
  }

  if (!values.email.trim()) {
    errors.email = "Ingresa un correo.";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Ingresa un correo válido.";
  }

  if (values.phone.trim().length < 8) {
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

export function ClientForm({ mode, client, onCancel, onSubmit }: ClientFormProps) {
  const [values, setValues] = useState<ClientFormValues>(
    client ? getClientFormValues(client) : getEmptyClientFormValues()
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setValues(client ? getClientFormValues(client) : getEmptyClientFormValues());
    setErrors({});
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

    onSubmit(values);
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
            <input
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.phone} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Correo</span>
            <input
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.email} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Documento</span>
            <input
              value={values.documentId}
              onChange={(event) => updateField("documentId", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
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

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-stone-700">Calle</span>
            <input
              value={values.street}
              onChange={(event) => updateField("street", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Comuna</span>
            <input
              value={values.commune}
              onChange={(event) => updateField("commune", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Ciudad</span>
          <input
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

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
