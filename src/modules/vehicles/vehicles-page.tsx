import { useEffect, useMemo, useState } from "react";

import { PageShell } from "../../components/shared/page-shell";
import type { Vehicle } from "../../types";
import { VehicleDetailCard } from "./vehicle-detail-card";
import { VehicleForm } from "./vehicle-form";
import type { VehicleFormValues } from "./vehicle-form.types";
import { VehiclesList } from "./vehicles-list";
import { matchesVehicleSearch } from "./vehicles-search";
import { useVehiclesStorage } from "./use-vehicles-storage";

type PanelMode = "detail" | "create" | "edit";

export function VehiclesPage() {
  const { clients, vehiclesWithRelations, createVehicle, updateVehicle } = useVehiclesStorage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(vehiclesWithRelations[0]?.id);
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();

  const filteredVehicles = useMemo(
    () => vehiclesWithRelations.filter((vehicle) => matchesVehicleSearch(vehicle, searchTerm)),
    [vehiclesWithRelations, searchTerm]
  );

  const selectedVehicle =
    vehiclesWithRelations.find((vehicle) => vehicle.id === selectedVehicleId) ?? filteredVehicles[0];

  useEffect(() => {
    if (!filteredVehicles.length) {
      setSelectedVehicleId(undefined);
      if (panelMode === "detail") {
        setEditingVehicle(undefined);
      }
      return;
    }

    const stillExists = filteredVehicles.some((vehicle) => vehicle.id === selectedVehicleId);

    if (!stillExists) {
      setSelectedVehicleId(filteredVehicles[0].id);
    }
  }, [filteredVehicles, panelMode, selectedVehicleId]);

  function handleSelectVehicle(vehicleId: string) {
    setSelectedVehicleId(vehicleId);
    setEditingVehicle(undefined);
    setPanelMode("detail");
  }

  function handleCreateVehicle() {
    setEditingVehicle(undefined);
    setPanelMode("create");
  }

  function handleEditVehicle(vehicle: Vehicle) {
    setSelectedVehicleId(vehicle.id);
    setEditingVehicle(vehicle);
    setPanelMode("edit");
  }

  function handleCreateSubmit(values: VehicleFormValues) {
    const nextVehicle = createVehicle(values);
    setSelectedVehicleId(nextVehicle.id);
    setEditingVehicle(undefined);
    setPanelMode("detail");
    setSearchTerm("");
  }

  function handleEditSubmit(values: VehicleFormValues) {
    if (!editingVehicle) {
      return;
    }

    const updatedVehicle = updateVehicle(editingVehicle.id, values);

    if (updatedVehicle) {
      setSelectedVehicleId(updatedVehicle.id);
    }

    setEditingVehicle(undefined);
    setPanelMode("detail");
  }

  function handleCancelForm() {
    setEditingVehicle(undefined);
    setPanelMode("detail");
  }

  return (
    <PageShell
      eyebrow="Vehículos"
      title="Gestión base de vehículos"
      description="Administra la ficha técnica inicial de cada vehículo, su asociación a clientes y un historial básico para el seguimiento del taller."
      stats={[
        { label: "Vehículos visibles", value: String(filteredVehicles.length) },
        { label: "Vehículos totales", value: String(vehiclesWithRelations.length) },
        { label: "Con historial básico", value: String(vehiclesWithRelations.filter((vehicle) => vehicle.appointments.length > 0).length) },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <VehiclesList
          vehicles={filteredVehicles}
          searchTerm={searchTerm}
          selectedVehicleId={selectedVehicle?.id}
          onSearchTermChange={setSearchTerm}
          onSelectVehicle={handleSelectVehicle}
          onCreateVehicle={handleCreateVehicle}
        />

        {panelMode === "create" ? (
          <VehicleForm mode="create" clients={clients} onCancel={handleCancelForm} onSubmit={handleCreateSubmit} />
        ) : null}

        {panelMode === "edit" ? (
          <VehicleForm
            mode="edit"
            clients={clients}
            vehicle={editingVehicle}
            onCancel={handleCancelForm}
            onSubmit={handleEditSubmit}
          />
        ) : null}

        {panelMode === "detail" ? (
          <VehicleDetailCard
            vehicle={selectedVehicle}
            onEditVehicle={handleEditVehicle}
            onCreateVehicle={handleCreateVehicle}
          />
        ) : null}
      </div>
    </PageShell>
  );
}
