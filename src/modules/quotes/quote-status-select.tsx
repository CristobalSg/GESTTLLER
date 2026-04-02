import type { QuoteStatus } from "@/types";

type QuoteStatusSelectProps = {
  value: QuoteStatus;
  onChange: (status: QuoteStatus) => void;
};

const quoteStatuses: { value: QuoteStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviado" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
  { value: "partial", label: "Parcial" },
];

export function QuoteStatusSelect({ value, onChange }: QuoteStatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as QuoteStatus)}
      className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 outline-none transition focus:border-amber-500"
    >
      {quoteStatuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
