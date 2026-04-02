import { useEffect, useMemo, useState } from "react";

import { PageShell } from "../../components/shared/page-shell";
import type { Client } from "../../types";
import { ClientDetailCard } from "./client-detail-card";
import { ClientForm } from "./client-form";
import type { ClientFormValues } from "./client-form.types";
import { ClientsList } from "./clients-list";
import { matchesClientSearch } from "./clients-search";
import { useClientsStorage } from "./use-clients-storage";

type PanelMode = "detail" | "create" | "edit";

export function ClientsPage() {
  const { clientsWithVehicles, createClient, updateClient } = useClientsStorage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(clientsWithVehicles[0]?.id);
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  const filteredClients = useMemo(
    () => clientsWithVehicles.filter((client) => matchesClientSearch(client, searchTerm)),
    [clientsWithVehicles, searchTerm]
  );

  const selectedClient =
    clientsWithVehicles.find((client) => client.id === selectedClientId) ?? filteredClients[0];

  useEffect(() => {
    if (!filteredClients.length) {
      setSelectedClientId(undefined);
      if (panelMode === "detail") {
        setEditingClient(undefined);
      }
      return;
    }

    const stillExists = filteredClients.some((client) => client.id === selectedClientId);

    if (!stillExists) {
      setSelectedClientId(filteredClients[0].id);
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
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <ClientsList
          clients={filteredClients}
          searchTerm={searchTerm}
          selectedClientId={selectedClient?.id}
          onSearchTermChange={setSearchTerm}
          onSelectClient={handleSelectClient}
          onCreateClient={handleCreateClient}
        />

        {panelMode === "create" ? (
          <ClientForm mode="create" onCancel={handleCancelForm} onSubmit={handleCreateSubmit} />
        ) : null}

        {panelMode === "edit" ? (
          <ClientForm
            mode="edit"
            client={editingClient}
            onCancel={handleCancelForm}
            onSubmit={handleEditSubmit}
          />
        ) : null}

        {panelMode === "detail" ? (
          <ClientDetailCard
            client={selectedClient}
            onEditClient={handleEditClient}
            onCreateClient={handleCreateClient}
          />
        ) : null}
      </div>
    </PageShell>
  );
}
