import { useEffect, useMemo, useState } from "react";

import type { Client, Vehicle } from "@/types";

import {
  getEmptyAppointmentFormValues,
  type AppointmentFormValues,
} from "./appointment-form.types";

type AppointmentFormProps = {
  clients: Client[];
  vehicles: Vehicle[];
  onCancel: () => void;
  onSubmit: (values: AppointmentFormValues) => void;
};

type FormErrors = Partial<Record<keyof AppointmentFormValues, string>>;

function validateAppointmentForm(values: AppointmentFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.clientId) {
    errors.clientId = "Selecciona un cliente.";
  }

  if (!values.vehicleId) {
    errors.vehicleId = "Selecciona un vehículo.";
  }

  if (!values.date) {
    errors.date = "Selecciona una fecha.";
  }

  if (!values.startTime) {
    errors.startTime = "Ingresa una hora.";
  }

  const duration = Number(values.estimatedDurationMinutes);
  if (!values.estimatedDurationMinutes || Number.isNaN(duration) || duration <= 0) {
    errors.estimatedDurationMinutes = "Ingresa una duración válida.";
  }

  if (!values.reason.trim()) {
    errors.reason = "Ingresa el motivo de la cita.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function AppointmentForm({ clients, vehicles, onCancel, onSubmit }: AppointmentFormProps) {
  const [values, setValues] = useState<AppointmentFormValues>(getEmptyAppointmentFormValues());
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setValues(getEmptyAppointmentFormValues());
    setErrors({});
  }, []);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.clientId === values.clientId),
    [vehicles, values.clientId]
  );

  function updateField<K extends keyof AppointmentFormValues>(field: K, value: AppointmentFormValues[K]) {
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateAppointmentForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values);
    setValues(getEmptyAppointmentFormValues());
    setErrors({});
  }

  function handleResetForm() {
    setValues(getEmptyAppointmentFormValues());
    setErrors({});
    onCancel();
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Nueva cita</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Registrar atención</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Crea una cita simple del taller asociando cliente, vehículo, fecha, hora y duración estimada.
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
              <option value="">{values.clientId ? "Selecciona un vehículo" : "Selecciona primero un cliente"}</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} · {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
            <FieldError message={errors.vehicleId} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Fecha</span>
            <input
              type="date"
              value={values.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.date} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Hora</span>
            <input
              type="time"
              value={values.startTime}
              onChange={(event) => updateField("startTime", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.startTime} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Duración estimada</span>
            <input
              type="number"
              min="15"
              step="15"
              value={values.estimatedDurationMinutes}
              onChange={(event) => updateField("estimatedDurationMinutes", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.estimatedDurationMinutes} />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Motivo</span>
          <input
            value={values.reason}
            onChange={(event) => updateField("reason", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
          <FieldError message={errors.reason} />
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
            onClick={handleResetForm}
            className="inline-flex justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Guardar cita
          </button>
        </div>
      </form>
    </section>
  );
}
