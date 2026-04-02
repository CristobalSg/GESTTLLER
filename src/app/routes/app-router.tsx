import { DashboardPage } from "../../modules/dashboard/dashboard-page";
import { ClientsPage } from "../../modules/clients/clients-page";
import { VehiclesPage } from "../../modules/vehicles/vehicles-page";
import { AppointmentsPage } from "../../modules/appointments/appointments-page";
import { IntakePage } from "../../modules/intake/intake-page";
import { QuotesPage } from "../../modules/quotes/quotes-page";
import { WorkOrdersPage } from "../../modules/work-orders/work-orders-page";
import { ReportsPage } from "../../modules/reports/reports-page";
import { useCurrentRoute } from "./use-current-route";

const routeComponents = {
  dashboard: DashboardPage,
  clients: ClientsPage,
  vehicles: VehiclesPage,
  appointments: AppointmentsPage,
  intake: IntakePage,
  quotes: QuotesPage,
  "work-orders": WorkOrdersPage,
  reports: ReportsPage,
};

export function AppRouter() {
  const currentRoute = useCurrentRoute();
  const ActivePage = routeComponents[currentRoute.id];

  return <ActivePage />;
}
