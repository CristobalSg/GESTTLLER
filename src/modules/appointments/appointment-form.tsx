import { useEffect, useMemo, useState } from "react";

import type { Client, Vehicle } from "@/types";
import { getClientDisplayName, getVehicleDisplayName, normalizeText } from "@/utils/entity-display";

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

  if (!values.date) {
    errors.date = "Selecciona una fecha.";
  }

  if (!values.startTime) {
    errors.startTime = "Ingresa una hora.";
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

  const selectedClient = useMemo(
    () =>
      clients.find((client) => normalizeText(getClientDisplayName(client)) === normalizeText(values.clientQuery)),
    [clients, values.clientQuery]
  );

  const availableVehicles = useMemo(() => {
    if (!selectedClient) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => vehicle.clientId === selectedClient.id);
  }, [selectedClient, vehicles]);

  function updateField<K extends keyof AppointmentFormValues>(field: K, value: AppointmentFormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
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
          Agenda rápido una atención. Si el cliente o vehículo no existen, quedarán como provisionales para completarlos después.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Cliente</span>
            <input
              list="appointment-client-suggestions"
              value={values.clientQuery}
              onChange={(event) => updateField("clientQuery", event.target.value)}
              placeholder="Escribe el nombre del cliente"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white"
            />
            <datalist id="appointment-client-suggestions">
              {clients.map((client) => (
                <option key={client.id} value={getClientDisplayName(client)} />
              ))}
            </datalist>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Si no existe, se crea un cliente provisional visible luego en el módulo de clientes.
            </p>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Vehículo</span>
            <input
              list="appointment-vehicle-suggestions"
              value={values.vehicleQuery}
              onChange={(event) => updateField("vehicleQuery", event.target.value)}
              placeholder="Patente, modelo o referencia"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white"
            />
            <datalist id="appointment-vehicle-suggestions">
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={getVehicleDisplayName(vehicle)} />
              ))}
            </datalist>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Es opcional. Si no existe, se guarda como vehículo provisional para completarlo después.
            </p>
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
            <p className="mt-2 text-xs leading-5 text-stone-500">Opcional. Si lo dejas vacío, se usarán 45 min.</p>
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
