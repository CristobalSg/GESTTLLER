import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ModalShell } from "../../components/shared/modal-shell";
import { AppointmentForm } from "../../modules/appointments/appointment-form";
import type { AppointmentFormValues } from "../../modules/appointments/appointment-form.types";
import { useAppointmentsStorage } from "../../modules/appointments/use-appointments-storage";
import { navigateTo } from "../routes/navigation";
import { appRoutes, relatedRoutesById } from "../routes/routes";
import { useCurrentRoute } from "../routes/use-current-route";

const mobileMenuGroups = [
  {
    id: "home",
    routes: ["home"],
  },
  {
    id: "operations",
    routes: ["clients", "vehicles", "appointments", "intake", "dashboard"],
  },
  {
    id: "documents",
    routes: ["quotes", "work-orders", "reports"],
  },
] as const;

export function AppHeader() {
  const currentRoute = useCurrentRoute();
  const relatedRoutes = appRoutes.filter((route) => relatedRoutesById[currentRoute.id].includes(route.id));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickAppointmentOpen, setIsQuickAppointmentOpen] = useState(false);
  const { clients, vehicles, createAppointment } = useAppointmentsStorage();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsQuickAppointmentOpen(false);
  }, [currentRoute.id]);

  useEffect(() => {
    if (typeof document === "undefined" || !isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  function handleQuickAppointmentSubmit(values: AppointmentFormValues) {
    createAppointment(values);
    setIsQuickAppointmentOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Taller mecánico
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
              {currentRoute.label}
            </h2>
          </div>

          <div className="hidden rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-right shadow-sm xl:block">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Estado del MVP</p>
            <p className="mt-1 text-sm font-medium text-stone-900">Flujo principal operativo</p>
            <p className="mt-1 text-sm text-stone-600">Base estable para demo interna y validación.</p>
          </div>

          <div className="relative z-40 ml-auto flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsQuickAppointmentOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ff6b2c] bg-[#ff6b2c] text-lg font-semibold text-white shadow-sm transition hover:border-[#f25b19] hover:bg-[#f25b19]"
              aria-label="Abrir acceso rápido para nueva cita"
            >
              +
            </button>

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

            {isMenuOpen && typeof document !== "undefined"
              ? createPortal(
                  <>
                    <button
                      type="button"
                      aria-label="Cerrar menu"
                      onClick={() => setIsMenuOpen(false)}
                      className="fixed inset-0 z-40 bg-stone-950/10 lg:hidden"
                    />
                    <div className="fixed right-4 top-24 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.18)] lg:hidden sm:right-6">
                      <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                        Modulos
                      </p>
                      <div className="space-y-3">
                        {mobileMenuGroups.map((group, groupIndex) => {
                          const routes = group.routes
                            .map((routeId) => appRoutes.find((route) => route.id === routeId))
                            .filter((route) => route !== undefined);

                          return (
                            <div
                              key={group.id}
                              className={groupIndex > 0 ? "border-t border-stone-200 pt-3" : ""}
                            >
                              <div className="space-y-1">
                                {routes.map((route) => {
                                  const isActive = route.id === currentRoute.id;

                                  return (
                                    <button
                                      key={route.id}
                                      type="button"
                                      onClick={() => navigateTo(route.path)}
                                      className={[
                                        "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition",
                                        isActive
                                          ? "bg-stone-900 text-white"
                                          : "bg-stone-50 text-stone-800 hover:bg-stone-100",
                                      ].join(" ")}
                                    >
                                      <span className="block text-sm font-semibold">{route.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>,
                  document.body
                )
              : null}
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

      {isQuickAppointmentOpen ? (
        <ModalShell onClose={() => setIsQuickAppointmentOpen(false)}>
          <AppointmentForm
            clients={clients}
            vehicles={vehicles}
            onCancel={() => setIsQuickAppointmentOpen(false)}
            onSubmit={handleQuickAppointmentSubmit}
          />
        </ModalShell>
      ) : null}
    </header>
  );
}
