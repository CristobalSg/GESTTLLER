import { useMemo, useState } from "react";

import type { Client, IntakePhotoCategory, Vehicle } from "@/types";

import { IntakeImageInput } from "./intake-image-input";
import {
  getEmptyIntakeFormValues,
  type IntakeFormValues,
  type IntakePhotoDraft,
} from "./intake-form.types";

type IntakeFormProps = {
  clients: Client[];
  vehicles: Vehicle[];
  onSubmit: (values: IntakeFormValues, photoDrafts: IntakePhotoDraft[]) => void;
};

type FormErrors = Partial<Record<keyof IntakeFormValues | "photos", string>>;

const photoFieldConfig: { category: IntakePhotoCategory; label: string; caption: string }[] = [
  { category: "vehicle", label: "Foto del vehículo", caption: "Estado general del vehículo al ingreso" },
  { category: "dashboard", label: "Foto del tablero", caption: "Lectura visible del tablero al recibir" },
  { category: "scanner", label: "Foto del escáner", caption: "Resultado o evidencia del escáner si existe" },
];

function validateIntakeForm(values: IntakeFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.clientId) {
    errors.clientId = "Selecciona un cliente.";
  }

  if (!values.vehicleId) {
    errors.vehicleId = "Selecciona un vehículo.";
  }

  if (!values.mileageKm.trim() || Number.isNaN(Number(values.mileageKm)) || Number(values.mileageKm) < 0) {
    errors.mileageKm = "Ingresa un kilometraje válido.";
  }

  if (!values.reportedIssue.trim()) {
    errors.reportedIssue = "Ingresa el motivo de ingreso.";
  }

  if (!values.arrivalCondition.trim()) {
    errors.arrivalCondition = "Describe el estado de llegada o daños previos.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No se pudo leer la imagen."));
    };

    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

export function IntakeForm({ clients, vehicles, onSubmit }: IntakeFormProps) {
  const [values, setValues] = useState<IntakeFormValues>(getEmptyIntakeFormValues());
  const [photoDrafts, setPhotoDrafts] = useState<IntakePhotoDraft[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.clientId === values.clientId),
    [values.clientId, vehicles]
  );

  function updateField<K extends keyof IntakeFormValues>(field: K, value: IntakeFormValues[K]) {
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

  async function handleSelectPhoto(category: IntakePhotoCategory, file: File) {
    const imageUrl = await readFileAsDataUrl(file);
    const config = photoFieldConfig.find((item) => item.category === category);

    if (!config) {
      return;
    }

    setPhotoDrafts((currentDrafts) => {
      const nextDraft = {
        category,
        url: imageUrl,
        caption: config.caption,
        fileName: file.name,
      };

      return [...currentDrafts.filter((draft) => draft.category !== category), nextDraft];
    });
  }

  function handleRemovePhoto(category: IntakePhotoCategory) {
    setPhotoDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.category !== category));
  }

  function resetForm() {
    setValues(getEmptyIntakeFormValues());
    setPhotoDrafts([]);
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateIntakeForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values, photoDrafts);
    resetForm();
  }

  return (
    <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Nuevo ingreso</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Recepcionar vehículo</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Registra el estado inicial del vehículo, el motivo de ingreso y evidencia visual básica para el prototipo.
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
            <span className="mb-2 block text-sm font-medium text-stone-700">Kilometraje</span>
            <input
              type="number"
              min="0"
              value={values.mileageKm}
              onChange={(event) => updateField("mileageKm", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.mileageKm} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Nivel de combustible</span>
            <select
              value={values.fuelLevel}
              onChange={(event) =>
                updateField("fuelLevel", event.target.value as IntakeFormValues["fuelLevel"])
              }
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="empty">Vacío</option>
              <option value="quarter">1/4</option>
              <option value="half">1/2</option>
              <option value="three-quarters">3/4</option>
              <option value="full">Lleno</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Motivo de ingreso</span>
          <input
            value={values.reportedIssue}
            onChange={(event) => updateField("reportedIssue", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
          <FieldError message={errors.reportedIssue} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Daños previos o estado de llegada
          </span>
          <textarea
            rows={3}
            value={values.arrivalCondition}
            onChange={(event) => updateField("arrivalCondition", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
          <FieldError message={errors.arrivalCondition} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Observaciones iniciales</span>
          <textarea
            rows={4}
            value={values.observations}
            onChange={(event) => updateField("observations", event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <div className="grid gap-4 xl:grid-cols-3">
          {photoFieldConfig.map((field) => (
            <IntakeImageInput
              key={field.category}
              category={field.category}
              label={field.label}
              draft={photoDrafts.find((draft) => draft.category === field.category)}
              onSelect={handleSelectPhoto}
              onRemove={handleRemovePhoto}
            />
          ))}
        </div>

        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Elementos recibidos
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={values.spareTireIncluded}
                onChange={(event) => updateField("spareTireIncluded", event.target.checked)}
              />
              Rueda de repuesto
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={values.toolsIncluded}
                onChange={(event) => updateField("toolsIncluded", event.target.checked)}
              />
              Herramientas
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={values.radioIncluded}
                onChange={(event) => updateField("radioIncluded", event.target.checked)}
              />
              Radio / multimedia
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={values.documentsReceived}
                onChange={(event) => updateField("documentsReceived", event.target.checked)}
              />
              Documentos recibidos
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Guardar ingreso
          </button>
        </div>
      </form>
    </section>
  );
}
