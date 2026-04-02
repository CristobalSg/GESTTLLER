import { useEffect, useMemo, useState } from "react";

import { ModalShell } from "../../components/shared/modal-shell";
import { PageShell } from "../../components/shared/page-shell";
import type { Client } from "../../types";
import { ClientDetailCard } from "./client-detail-card";
import { ClientForm } from "./client-form";
import type { ClientFormValues } from "./client-form.types";
import { ClientsList } from "./clients-list";
import { matchesClientSearch } from "./clients-search";
import { useClientsStorage } from "./use-clients-storage";
import { VehicleForm } from "../vehicles/vehicle-form";
import type { VehicleFormValues } from "../vehicles/vehicle-form.types";
import { useVehiclesStorage } from "../vehicles/use-vehicles-storage";

type PanelMode = "detail" | "create" | "edit";

export function ClientsPage() {
  const { clientsWithVehicles, createClient, updateClient } = useClientsStorage();
  const { createVehicle } = useVehiclesStorage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [vehicleOwnerClientId, setVehicleOwnerClientId] = useState<string | undefined>();

  const filteredClients = useMemo(
    () => clientsWithVehicles.filter((client) => matchesClientSearch(client, searchTerm)),
    [clientsWithVehicles, searchTerm]
  );

  const selectedClient = clientsWithVehicles.find((client) => client.id === selectedClientId);

  useEffect(() => {
    if (!filteredClients.length) {
      setSelectedClientId(undefined);
      if (panelMode === "detail") {
        setEditingClient(undefined);
      }
      return;
    }

    const stillExists = filteredClients.some((client) => client.id === selectedClientId);

    if (!stillExists && selectedClientId) {
      setSelectedClientId(undefined);
      if (panelMode === "detail") {
        setEditingClient(undefined);
      }
    }
  }, [filteredClients, panelMode, selectedClientId]);

  function handleSelectClient(clientId: string) {
    setSelectedClientId(clientId);
    setEditingClient(undefined);
    setPanelMode("detail");
  }

  function handleCreateClient() {
    setEditingClient(undefined);
    setPanelMode("create");
  }

  function handleEditClient(client: Client) {
    setSelectedClientId(client.id);
    setEditingClient(client);
    setPanelMode("edit");
  }

  function handleAddVehicle(client: Client) {
    setVehicleOwnerClientId(client.id);
    setSelectedClientId(undefined);
    setEditingClient(undefined);
    setPanelMode("detail");
  }

  function handleCreateSubmit(values: ClientFormValues) {
    const nextClient = createClient(values);
    setSelectedClientId(nextClient.id);
    setEditingClient(undefined);
    setPanelMode("detail");
    setSearchTerm("");
  }

  function handleEditSubmit(values: ClientFormValues) {
    if (!editingClient) {
      return;
    }

    const updatedClient = updateClient(editingClient.id, values);

    if (updatedClient) {
      setSelectedClientId(updatedClient.id);
    }

    setEditingClient(undefined);
    setPanelMode("detail");
  }

  function handleCancelForm() {
    setEditingClient(undefined);
    setPanelMode("detail");
  }

  function handleCreateVehicleSubmit(values: VehicleFormValues) {
    const nextVehicle = createVehicle(values);
    setVehicleOwnerClientId(undefined);
    setSelectedClientId(nextVehicle.clientId);
    setPanelMode("detail");
  }

  function handleCancelVehicleForm() {
    setSelectedClientId(vehicleOwnerClientId);
    setVehicleOwnerClientId(undefined);
    setPanelMode("detail");
  }

  function handleCloseDetail() {
    setSelectedClientId(undefined);
    setEditingClient(undefined);
    setPanelMode("detail");
  }

  const vehicleOwnerClient = clientsWithVehicles.find((client) => client.id === vehicleOwnerClientId);

  return (
    <PageShell
      eyebrow="Clientes"
      title="Gestión base de clientes"
      description="Administra el registro principal de clientes del taller con búsqueda rápida, detalle del historial base y edición persistente en este prototipo."
      stats={[
        { label: "Clientes visibles", value: String(filteredClients.length) },
        { label: "Clientes totales", value: String(clientsWithVehicles.length) },
        {
          label: "Con vehículos asociados",
          value: String(clientsWithVehicles.filter((client) => client.vehicles.length > 0).length),
        },
      ]}
    >
      <div className="max-w-[420px]">
        <ClientsList
          clients={filteredClients}
          searchTerm={searchTerm}
          selectedClientId={selectedClient?.id}
          onSearchTermChange={setSearchTerm}
          onSelectClient={handleSelectClient}
          onCreateClient={handleCreateClient}
        />
      </div>

      {panelMode === "detail" && selectedClient ? (
        <ModalShell onClose={handleCloseDetail} maxWidthClassName="max-w-4xl">
          <ClientDetailCard
            client={selectedClient}
            onEditClient={handleEditClient}
            onAddVehicle={handleAddVehicle}
            onCreateClient={handleCreateClient}
          />
        </ModalShell>
      ) : null}

      {panelMode === "create" ? (
        <ModalShell onClose={handleCancelForm}>
          <ClientForm mode="create" onCancel={handleCancelForm} onSubmit={handleCreateSubmit} />
        </ModalShell>
      ) : null}

      {panelMode === "edit" ? (
        <ModalShell onClose={handleCancelForm}>
          <ClientForm
            mode="edit"
            client={editingClient}
            onCancel={handleCancelForm}
            onSubmit={handleEditSubmit}
          />
        </ModalShell>
      ) : null}

      {vehicleOwnerClient ? (
        <ModalShell onClose={handleCancelVehicleForm}>
          <VehicleForm
            mode="create"
            clients={[vehicleOwnerClient]}
            forcedClient={vehicleOwnerClient}
            onCancel={handleCancelVehicleForm}
            onSubmit={handleCreateVehicleSubmit}
          />
        </ModalShell>
      ) : null}
    </PageShell>
  );
}
