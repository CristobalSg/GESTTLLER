import { appRoutes } from "../routes/routes";
import { navigateTo } from "../routes/navigation";
import { useCurrentRoute } from "../routes/use-current-route";

const sectionLabel: Record<string, string> = {
  home: "Panel",
  dashboard: "Panel",
  clients: "Gestión",
  vehicles: "Gestión",
  appointments: "Operación",
  intake: "Operación",
  quotes: "Documentos",
  "work-orders": "Documentos",
  reports: "Análisis",
};

const routeIcon: Record<string, string> = {
  home: "01",
  dashboard: "02",
  clients: "03",
  vehicles: "04",
  appointments: "05",
  intake: "06",
  quotes: "07",
  "work-orders": "08",
  reports: "09",
};

export function SidebarNav() {
  const currentRoute = useCurrentRoute();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-stone-200/80 bg-[#111827] text-stone-100 lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-amber-200">
          Gesttller
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">Sistema de taller</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Base visual inicial para operar módulos clave del prototipo.
        </p>
      </div>

      <nav className="flex-1 px-4 py-5">
        <ul className="space-y-2">
          {appRoutes.map((route) => {
            const isActive = route.id === currentRoute.id;

            return (
              <li key={route.id}>
                <button
                  type="button"
                  onClick={() => navigateTo(route.path)}
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                    isActive
                      ? "bg-white text-stone-900 shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
                      : "text-slate-200 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
                      isActive ? "bg-amber-100 text-amber-700" : "bg-white/8 text-slate-300",
                    ].join(" ")}
                  >
                    {routeIcon[route.id]}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{route.label}</span>
                    <span
                      className={[
                        "block text-xs",
                        isActive ? "text-stone-500" : "text-slate-400",
                      ].join(" ")}
                    >
                      {sectionLabel[route.id]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado</p>
          <p className="mt-2 text-sm font-medium text-white">MVP en construcción</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Navegación y layout base listos para seguir con módulos funcionales.
          </p>
        </div>
      </div>
    </aside>
  );
}
