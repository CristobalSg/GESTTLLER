import type { IntakePhotoCategory } from "@/types";

import type { IntakePhotoDraft } from "./intake-form.types";

type IntakeImageInputProps = {
  category: IntakePhotoCategory;
  label: string;
  draft?: IntakePhotoDraft;
  onSelect: (category: IntakePhotoCategory, file: File) => void;
  onRemove: (category: IntakePhotoCategory) => void;
};

export function IntakeImageInput({
  category,
  label,
  draft,
  onSelect,
  onRemove,
}: IntakeImageInputProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">{label}</p>
          <p className="mt-1 text-sm text-stone-600">
            {draft ? "Imagen lista para guardar en el prototipo." : "Adjunta una foto para dejar evidencia."}
          </p>
        </div>

        {draft ? (
          <button
            type="button"
            onClick={() => onRemove(category)}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400"
          >
            Quitar
          </button>
        ) : null}
      </div>

      <label className="mt-4 block cursor-pointer">
        <span className="inline-flex rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400">
          Seleccionar imagen
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onSelect(category, file);
            }

            event.target.value = "";
          }}
        />
      </label>

      {draft ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <img src={draft.url} alt={draft.caption} className="h-44 w-full object-cover" />
          <div className="border-t border-stone-200 px-4 py-3">
            <p className="text-sm font-medium text-stone-800">{draft.fileName}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
