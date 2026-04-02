import type { AppointmentStatus } from "@/types";

type AppointmentStatusSelectProps = {
  value: AppointmentStatus;
  onChange: (status: AppointmentStatus) => void;
};

const appointmentStatuses: { value: AppointmentStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "in-progress", label: "En proceso" },
  { value: "finalized", label: "Finalizada" },
  { value: "cancelled", label: "Cancelada" },
];

export function AppointmentStatusSelect({ value, onChange }: AppointmentStatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as AppointmentStatus)}
      className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 outline-none transition focus:border-amber-500"
    >
      {appointmentStatuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
