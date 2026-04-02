import { useEffect, useMemo, useState } from "react";

import type { Client, IntakeRecord, Quote, WorkOrder, WorkOrderStatus, Vehicle } from "@/types";

import {
  createEmptyRecommendation,
  createEmptyWorkOrderTask,
  getEmptyWorkOrderFormValues,
  getWorkOrderFormValues,
  type WorkOrderFormValues,
} from "./work-order-form.types";

type WorkOrderFormProps = {
  mode: "create" | "edit";
  clients: Client[];
  vehicles: Vehicle[];
  quotes: Quote[];
  intakeRecords: IntakeRecord[];
  workOrder?: WorkOrder;
  onCancel: () => void;
  onSubmit: (values: WorkOrderFormValues) => void;
};

type FormErrors = Partial<Record<keyof WorkOrderFormValues, string>> & {
  tasks?: string;
};

function validateWorkOrderForm(values: WorkOrderFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.clientId) {
    errors.clientId = "Selecciona un cliente.";
  }

  if (!values.vehicleId) {
    errors.vehicleId = "Selecciona un vehículo.";
  }

  if (!values.technician.trim()) {
    errors.technician = "Ingresa el técnico responsable.";
  }

  if (!values.tasks.some((task) => task.description.trim())) {
    errors.tasks = "Registra al menos un trabajo realizado o planificado.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function WorkOrderForm({
  mode,
  clients,
  vehicles,
  quotes,
  intakeRecords,
  workOrder,
  onCancel,
  onSubmit,
}: WorkOrderFormProps) {
  const [values, setValues] = useState<WorkOrderFormValues>(
    workOrder ? getWorkOrderFormValues(workOrder) : getEmptyWorkOrderFormValues()
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setValues(workOrder ? getWorkOrderFormValues(workOrder) : getEmptyWorkOrderFormValues());
    setErrors({});
  }, [mode, workOrder]);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.clientId === values.clientId),
    [values.clientId, vehicles]
  );

  const availableQuotes = useMemo(
    () => quotes.filter((quote) => (!values.clientId || quote.clientId === values.clientId) && (!values.vehicleId || quote.vehicleId === values.vehicleId)),
    [quotes, values.clientId, values.vehicleId]
  );

  const availableIntakeRecords = useMemo(
    () =>
      intakeRecords.filter(
        (record) =>
          (!values.clientId || record.clientId === values.clientId) &&
          (!values.vehicleId || record.vehicleId === values.vehicleId)
      ),
    [intakeRecords, values.clientId, values.vehicleId]
  );

  function getClientLabel(clientId: string) {
    const client = clients.find((currentClient) => currentClient.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : clientId;
  }

  function getVehicleLabel(vehicleId: string) {
    const vehicle = vehicles.find((currentVehicle) => currentVehicle.id === vehicleId);
    return vehicle ? `${vehicle.licensePlate} · ${vehicle.brand} ${vehicle.model}` : vehicleId;
  }

  function updateField<K extends keyof WorkOrderFormValues>(field: K, value: WorkOrderFormValues[K]) {
    setValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [field]: value,
      };

      if (field === "clientId") {
        return {
          ...nextValues,
          vehicleId: "",
          quoteId: "",
          intakeRecordId: "",
        };
      }

      if (field === "vehicleId") {
        return {
          ...nextValues,
          quoteId: "",
          intakeRecordId: "",
        };
      }

      if (field === "quoteId") {
        const selectedQuote = quotes.find((quote) => quote.id === value);

        if (!selectedQuote) {
          return nextValues;
        }

        return {
          ...nextValues,
          clientId: selectedQuote.clientId,
          vehicleId: selectedQuote.vehicleId,
          tasks:
            selectedQuote.items.length > 0
              ? selectedQuote.items.map((item) => ({
                  id: `work-task-${crypto.randomUUID().slice(0, 8)}`,
                  description: item.description,
                  notes: "",
                  completed: false,
                }))
              : currentValues.tasks,
        };
      }

      return nextValues;
    });
  }

  function updateTaskField(
    taskId: string,
    field: "description" | "notes" | "completed",
    value: string | boolean
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      tasks: currentValues.tasks.map((task) => (task.id === taskId ? { ...task, [field]: value } : task)),
    }));
  }

  function updateRecommendationField(
    recommendationId: string,
    field: "title" | "detail" | "priority",
    value: string
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      recommendations: currentValues.recommendations.map((recommendation) =>
        recommendation.id === recommendationId ? { ...recommendation, [field]: value } : recommendation
      ),
    }));
  }

  function addTask() {
    setValues((currentValues) => ({
      ...currentValues,
      tasks: [...currentValues.tasks, createEmptyWorkOrderTask()],
    }));
  }

  function removeTask(taskId: string) {
    setValues((currentValues) => ({
      ...currentValues,
      tasks:
        currentValues.tasks.length > 1
          ? currentValues.tasks.filter((task) => task.id !== taskId)
          : currentValues.tasks,
    }));
  }

  function addRecommendation() {
    setValues((currentValues) => ({
      ...currentValues,
      recommendations: [...currentValues.recommendations, createEmptyRecommendation()],
    }));
  }

  function removeRecommendation(recommendationId: string) {
    setValues((currentValues) => ({
      ...currentValues,
      recommendations:
        currentValues.recommendations.length > 1
          ? currentValues.recommendations.filter((recommendation) => recommendation.id !== recommendationId)
          : currentValues.recommendations,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateWorkOrderForm(values);
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
          {mode === "create" ? "Nueva orden" : "Editar orden"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          {mode === "create" ? "Registrar orden de trabajo" : "Actualizar orden"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Crea una orden desde cero o apóyate en un presupuesto ya existente para preparar los trabajos.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Presupuesto de origen</span>
            <select
              value={values.quoteId}
              onChange={(event) => updateField("quoteId", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="">Crear desde cero</option>
              {availableQuotes.map((quote) => (
                <option key={quote.id} value={quote.id}>
                  {`${getClientLabel(quote.clientId)} · ${getVehicleLabel(quote.vehicleId)} · ${quote.items.length} ítems`}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Registro de ingreso</span>
            <select
              value={values.intakeRecordId}
              onChange={(event) => updateField("intakeRecordId", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="">Sin vincular</option>
              {availableIntakeRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {`${getVehicleLabel(record.vehicleId)} · ${new Date(record.receivedAt).toLocaleDateString("es-CL")}`}
                </option>
              ))}
            </select>
          </label>
        </div>

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
            <span className="mb-2 block text-sm font-medium text-stone-700">Técnico responsable</span>
            <input
              value={values.technician}
              onChange={(event) => updateField("technician", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
            <FieldError message={errors.technician} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">Estado</span>
            <select
              value={values.status}
              onChange={(event) => updateField("status", event.target.value as WorkOrderStatus)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option value="received">Ingresada</option>
              <option value="diagnosis">En diagnóstico</option>
              <option value="awaiting-approval">Esperando aprobación</option>
              <option value="repair">En reparación</option>
              <option value="completed">Terminada</option>
              <option value="delivered">Entregada</option>
            </select>
          </label>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Trabajos realizados
            </h3>
            <button
              type="button"
              onClick={addTask}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
            >
              Agregar trabajo
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {values.tasks.map((task, index) => (
              <article key={task.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900">Trabajo {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    disabled={values.tasks.length === 1}
                    className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-stone-400"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">Descripción</span>
                    <input
                      value={task.description}
                      onChange={(event) => updateTaskField(task.id, "description", event.target.value)}
                      className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">Notas del trabajo</span>
                    <textarea
                      rows={3}
                      value={task.notes}
                      onChange={(event) => updateTaskField(task.id, "notes", event.target.value)}
                      className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(event) => updateTaskField(task.id, "completed", event.target.checked)}
                    />
                    Marcar como realizado
                  </label>
                </div>
              </article>
            ))}
          </div>
          <FieldError message={errors.tasks} />
        </div>

        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Recomendaciones post entrega
            </h3>
            <button
              type="button"
              onClick={addRecommendation}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
            >
              Agregar recomendación
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {values.recommendations.map((recommendation, index) => (
              <article key={recommendation.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900">Recomendación {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeRecommendation(recommendation.id)}
                    disabled={values.recommendations.length === 1}
                    className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-stone-400"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">Título</span>
                    <input
                      value={recommendation.title}
                      onChange={(event) =>
                        updateRecommendationField(recommendation.id, "title", event.target.value)
                      }
                      className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-700">Prioridad</span>
                    <select
                      value={recommendation.priority}
                      onChange={(event) =>
                        updateRecommendationField(recommendation.id, "priority", event.target.value)
                      }
                      className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Detalle</span>
                  <textarea
                    rows={3}
                    value={recommendation.detail}
                    onChange={(event) =>
                      updateRecommendationField(recommendation.id, "detail", event.target.value)
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
                  />
                </label>
              </article>
            ))}
          </div>
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">
              Trabajos sugeridos no realizados
            </span>
            <textarea
              rows={4}
              value={values.suggestedWorkNotPerformed}
              onChange={(event) => updateField("suggestedWorkNotPerformed", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">
              Motivo de rechazo de algún arreglo
            </span>
            <textarea
              rows={4}
              value={values.rejectedWorkReason}
              onChange={(event) => updateField("rejectedWorkReason", event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>
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
            {mode === "create" ? "Guardar orden" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
