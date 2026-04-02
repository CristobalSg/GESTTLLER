import { useEffect, type ReactNode } from "react";

type ModalShellProps = {
  children: ReactNode;
  maxWidthClassName?: string;
  onClose: () => void;
};

export function ModalShell({
  children,
  maxWidthClassName = "max-w-2xl",
  onClose,
}: ModalShellProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/35"
      />

      <div className="absolute inset-0 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="pointer-events-none flex min-h-full items-start justify-center">
          <div className={`pointer-events-auto relative w-full max-h-[calc(100vh-3rem)] ${maxWidthClassName}`}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/90 text-stone-900 shadow-sm"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
