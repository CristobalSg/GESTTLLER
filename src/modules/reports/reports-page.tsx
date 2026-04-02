import { PlaceholderCard } from "../../components/shared/placeholder-card";
import { PageShell } from "../../components/shared/page-shell";

export function ReportsPage() {
  return (
    <PageShell
      eyebrow="Reportes"
      title="Indicadores y seguimiento del negocio"
      description="El área de reportes reunirá métricas simples del taller para revisar volumen de trabajo, tiempos y comportamiento general del prototipo."
      stats={[
        { label: "Servicios cerrados", value: "26" },
        { label: "Tiempo medio", value: "2.8 días" },
        { label: "Conversión de presupuestos", value: "68%" },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard
          title="Resumen de desempeño"
          text="Se integrarán gráficos simples o tarjetas comparativas con la actividad del taller por período."
        />
        <PlaceholderCard
          title="Exportes futuros"
          text="Este módulo podrá incorporar descargas o vistas imprimibles cuando la base operativa esté validada."
        />
      </div>
    </PageShell>
  );
}
