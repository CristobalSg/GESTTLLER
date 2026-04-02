import type { WorkOrderStatus } from "@/types";

type WorkOrderStatusSelectProps = {
  value: WorkOrderStatus;
  onChange: (status: WorkOrderStatus) => void;
};

const workOrderStatuses: { value: WorkOrderStatus; label: string }[] = [
  { value: "received", label: "Ingresada" },
  { value: "diagnosis", label: "En diagnóstico" },
  { value: "awaiting-approval", label: "Esperando aprobación" },
  { value: "repair", label: "En reparación" },
  { value: "completed", label: "Terminada" },
  { value: "delivered", label: "Entregada" },
];

export function WorkOrderStatusSelect({ value, onChange }: WorkOrderStatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as WorkOrderStatus)}
      className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 outline-none transition focus:border-amber-500"
    >
      {workOrderStatuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
