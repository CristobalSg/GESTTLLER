import { useEffect, useState } from "react";
import { appRoutes, relatedRoutesById } from "../routes/routes";
import { navigateTo } from "../routes/navigation";
import { useCurrentRoute } from "../routes/use-current-route";

export function AppHeader() {
  const currentRoute = useCurrentRoute();
  const relatedRoutes = appRoutes.filter((route) => relatedRoutesById[currentRoute.id].includes(route.id));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const appointmentsRoute = appRoutes.find((route) => route.id === "appointments");

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentRoute.id]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Taller mecánico
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
              {currentRoute.label}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{currentRoute.description}</p>
          </div>

          <div className="hidden rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-right shadow-sm xl:block">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Estado del MVP</p>
            <p className="mt-1 text-sm font-medium text-stone-900">Flujo principal operativo</p>
            <p className="mt-1 text-sm text-stone-600">Base estable para demo interna y validación.</p>
          </div>

          <div className="relative ml-auto flex items-center gap-2 lg:hidden">
            {appointmentsRoute ? (
              <button
                type="button"
                onClick={() => navigateTo(appointmentsRoute.path)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-300 bg-white text-lg font-semibold text-stone-900 shadow-sm transition hover:border-stone-400"
                aria-label="Ir a agenda"
              >
                +
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-300 bg-white text-stone-900 shadow-sm transition hover:border-stone-400"
              aria-label={isMenuOpen ? "Cerrar menu de modulos" : "Abrir menu de modulos"}
              aria-expanded={isMenuOpen}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16" strokeLinecap="round" />
                <path d="M4 12h16" strokeLinecap="round" />
                <path d="M4 17h16" strokeLinecap="round" />
              </svg>
            </button>

            {isMenuOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Cerrar menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 z-10 bg-stone-950/10"
                />
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-72 rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                  <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                    Modulos
                  </p>
                  <div className="space-y-1">
                    {appRoutes.map((route) => {
                      const isActive = route.id === currentRoute.id;

                      return (
                        <button
                          key={route.id}
                          type="button"
                          onClick={() => navigateTo(route.path)}
                          className={[
                            "flex w-full items-start justify-between rounded-2xl px-3 py-3 text-left transition",
                            isActive ? "bg-stone-900 text-white" : "bg-stone-50 text-stone-800 hover:bg-stone-100",
                          ].join(" ")}
                        >
                          <span>
                            <span className="block text-sm font-semibold">{route.label}</span>
                            <span
                              className={[
                                "mt-1 block text-xs leading-5",
                                isActive ? "text-stone-300" : "text-stone-500",
                              ].join(" ")}
                            >
                              {route.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="hidden gap-2 overflow-x-auto pb-1 lg:hidden">
          {appRoutes.map((route) => {
            const isActive = route.id === currentRoute.id;

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => navigateTo(route.path)}
                className={[
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-400",
                ].join(" ")}
              >
                {route.label}
              </button>
            );
          })}
        </div>

        <div className="hidden flex-wrap gap-2 lg:flex">
          <span className="self-center text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
            Relacionado
          </span>
          {relatedRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => navigateTo(route.path)}
              className="rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-white"
            >
              {route.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
