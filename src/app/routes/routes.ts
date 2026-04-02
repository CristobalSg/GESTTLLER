export type AppRouteId =
  | "home"
  | "dashboard"
  | "clients"
  | "vehicles"
  | "appointments"
  | "intake"
  | "quotes"
  | "work-orders"
  | "reports";

export type AppRoute = {
  id: AppRouteId;
  label: string;
  path: string;
  description: string;
};

export const appRoutes: AppRoute[] = [
  {
    id: "home",
    label: "Inicio",
    path: "/",
    description: "Vista rápida con citas pendientes y métricas clave del taller.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    description: "Resumen general de la operación del taller.",
  },
  {
    id: "clients",
    label: "Clientes",
    path: "/clientes",
    description: "Gestión y seguimiento de clientes registrados.",
  },
  {
    id: "vehicles",
    label: "Vehículos",
    path: "/vehiculos",
    description: "Catálogo y estado base de los vehículos ingresados.",
  },
  {
    id: "appointments",
    label: "Agenda",
    path: "/agenda",
    description: "Organización de citas, recepción y tiempos de atención.",
  },
  {
    id: "intake",
    label: "Ingreso",
    path: "/ingreso",
    description: "Recepción del vehículo con evidencia y observaciones.",
  },
  {
    id: "quotes",
    label: "Presupuestos",
    path: "/presupuestos",
    description: "Preparación y seguimiento de presupuestos del taller.",
  },
  {
    id: "work-orders",
    label: "Órdenes",
    path: "/ordenes-de-trabajo",
    description: "Control de órdenes activas y flujo de trabajo.",
  },
  {
    id: "reports",
    label: "Reportes",
    path: "/reportes",
    description: "Métricas y reportes operativos del prototipo.",
  },
];

export const routeMap = new Map(appRoutes.map((route) => [route.path, route]));

export function getRouteByPath(pathname: string): AppRoute {
  return routeMap.get(pathname) ?? appRoutes[0];
}

export const relatedRoutesById: Record<AppRouteId, AppRouteId[]> = {
  home: ["appointments", "work-orders", "dashboard"],
  dashboard: ["appointments", "quotes", "work-orders"],
  clients: ["vehicles", "appointments", "quotes"],
  vehicles: ["clients", "intake", "work-orders"],
  appointments: ["clients", "vehicles", "intake"],
  intake: ["appointments", "quotes", "work-orders"],
  quotes: ["intake", "work-orders", "clients"],
  "work-orders": ["quotes", "vehicles", "reports"],
  reports: ["dashboard", "quotes", "work-orders"],
};
