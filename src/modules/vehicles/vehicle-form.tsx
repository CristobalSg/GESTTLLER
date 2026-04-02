import { useEffect, useState } from "react";

import type { Client, Vehicle } from "@/types";
import { getClientDisplayName } from "@/utils/entity-display";

import {
  getEmptyVehicleFormValues,
  getVehicleFormValues,
  type VehicleFormValues,
} from "./vehicle-form.types";

type VehicleFormProps = {
  mode: "create" | "edit";
  clients: Client[];
  forcedClient?: Client;
  vehicle?: Vehicle;
  onCancel: () => void;
  onSubmit: (values: VehicleFormValues) => void;
};

type FormErrors = Partial<Record<keyof VehicleFormValues, string>>;

function normalizeLicensePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function hasAdvancedValues(values: VehicleFormValues) {
  return Boolean(
    values.vin.trim() ||
      values.brand.trim() ||
      values.year.trim() ||
      values.color.trim() ||
      values.mileageKm.trim() ||
      values.lastServiceAt.trim()
  );
}

function validateVehicleForm(values: VehicleFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.clientId) {
    errors.clientId = "Selecciona un cliente.";
  }

  if (!values.model.trim()) {
    errors.model = "Ingresa el modelo.";
  }

  if (!/^[A-Z]{4}\d{2}$/.test(values.licensePlate.trim())) {
    errors.licensePlate = "Usa formato BBBB##.";
  }

  if (values.year.trim() && (Number.isNaN(Number(values.year)) || Number(values.year) < 1900)) {
    errors.year = "Ingresa un año válido.";
  }

  if (
    values.mileageKm.trim() &&
    (Number.isNaN(Number(values.mileageKm)) || Number(values.mileageKm) < 0)
  ) {
    errors.mileageKm = "Ingresa un kilometraje válido.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function VehicleForm({ mode, clients, forcedClient, vehicle, onCancel, onSubmit }: VehicleFormProps) {
  const [values, setValues] = useState<VehicleFormValues>(
    vehicle
      ? getVehicleFormValues(vehicle)
      : {
          ...getEmptyVehicleFormValues(),
          clientId: forcedClient?.id ?? "",
        }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() =>
    hasAdvancedValues(
      vehicle
        ? getVehicleFormValues(vehicle)
        : {
            ...getEmptyVehicleFormValues(),
            clientId: forcedClient?.id ?? "",
          }
    )
  );

  useEffect(() => {
    const nextValues =
      vehicle
        ? getVehicleFormValues(vehicle)
        : {
            ...getEmptyVehicleFormValues(),
            clientId: forcedClient?.id ?? "",
          };

    setValues(nextValues);
    setErrors({});
    setIsAdvancedOpen(hasAdvancedValues(nextValues));
  }, [vehicle?.id, mode, forcedClient?.id]);

  function updateField<K extends keyof VehicleFormValues>(field: K, value: VehicleFormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateVehicleForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      ...values,
      licensePlate: normalizeLicensePlate(values.licensePlate),
    });
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
          {mode === "create" ? "Nuevo vehículo" : "Editar vehículo"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          {mode === "create" ? "Registrar vehículo" : "Actualizar vehículo"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Completa la ficha básica y asocia el vehículo a un cliente existente del prototipo.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {forcedClient ? (
          <div className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Cliente asociado</span>
            <div className="rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-900">
              {getClientDisplayName(forcedClient)}
            </div>
          </div>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Cliente asociado</span>
            <select
              value={values.clientId}
              onChange={(event) => updateField("clientId", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {getClientDisplayName(client)}
                </option>
              ))}
            </select>
            <FieldError message={errors.clientId} />
          </label>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Patente</span>
            <input
              value={values.licensePlate}
              onChange={(event) => updateField("licensePlate", normalizeLicensePlate(event.target.value))}
              placeholder="BBBB12"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm uppercase text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.licensePlate} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Modelo</span>
            <input
              value={values.model}
              onChange={(event) => updateField("model", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.model} />
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
              <span className="block text-sm font-semibold text-stone-900">Avanzado</span>
              <span className="mt-1 block text-xs text-stone-500">
                VIN, marca, año, color y ficha técnica.
              </span>
            </span>
            <span className="text-lg font-semibold text-stone-500">{isAdvancedOpen ? "−" : "+"}</span>
          </button>

          {isAdvancedOpen ? (
            <div className="space-y-4 border-t border-stone-200 px-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">VIN</span>
                  <input
                    value={values.vin}
                    onChange={(event) => updateField("vin", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Marca</span>
                  <input
                    value={values.brand}
                    onChange={(event) => updateField("brand", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Año</span>
                  <input
                    type="number"
                    value={values.year}
                    onChange={(event) => updateField("year", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                  <FieldError message={errors.year} />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Color</span>
                  <input
                    value={values.color}
                    onChange={(event) => updateField("color", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Combustible</span>
                  <select
                    value={values.fuelType}
                    onChange={(event) => updateField("fuelType", event.target.value as Vehicle["fuelType"])}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  >
                    <option value="gasoline">Gasolina</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Híbrido</option>
                    <option value="electric">Eléctrico</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Transmisión</span>
                  <select
                    value={values.transmission}
                    onChange={(event) =>
                      updateField("transmission", event.target.value as Vehicle["transmission"])
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automática</option>
                    <option value="cvt">CVT</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Kilometraje</span>
                  <input
                    type="number"
                    value={values.mileageKm}
                    onChange={(event) => updateField("mileageKm", event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                  />
                  <FieldError message={errors.mileageKm} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Último servicio</span>
                <input
                  type="date"
                  value={values.lastServiceAt}
                  onChange={(event) => updateField("lastServiceAt", event.target.value)}
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
            {mode === "create" ? "Guardar vehículo" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
