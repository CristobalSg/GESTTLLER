import { useEffect, useState } from "react";

import { ModalShell } from "../../components/shared/modal-shell";
import { PageShell } from "../../components/shared/page-shell";
import { IntakeDetailCard } from "./intake-detail-card";
import { IntakeForm } from "./intake-form";
import type { IntakeFormValues, IntakePhotoDraft } from "./intake-form.types";
import { IntakeRecordList } from "./intake-record-list";
import { useIntakeStorage } from "./use-intake-storage";

export function IntakePage() {
  const { clients, vehicles, intakeRecordsWithRelations, createIntakeRecord } = useIntakeStorage();
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(
    intakeRecordsWithRelations[0]?.id
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedRecord =
    intakeRecordsWithRelations.find((record) => record.id === selectedRecordId) ??
    intakeRecordsWithRelations[0];

  useEffect(() => {
    if (!intakeRecordsWithRelations.length) {
      setSelectedRecordId(undefined);
      return;
    }

    const stillExists = intakeRecordsWithRelations.some((record) => record.id === selectedRecordId);

    if (!stillExists) {
      setSelectedRecordId(intakeRecordsWithRelations[0].id);
    }
  }, [intakeRecordsWithRelations, selectedRecordId]);

  function handleCreateRecord(values: IntakeFormValues, photoDrafts: IntakePhotoDraft[]) {
    const nextRecord = createIntakeRecord(values, photoDrafts);
    setSelectedRecordId(nextRecord.id);
    setIsCreateModalOpen(false);
  }

  return (
    <PageShell
      eyebrow="Ingreso"
      title="Recepción del vehículo"
      description="Registra el ingreso real del vehículo al taller con kilometraje, observaciones de llegada y evidencia visual básica para el prototipo."
      stats={[
        { label: "Ingresos totales", value: String(intakeRecordsWithRelations.length) },
        {
          label: "Con evidencia adjunta",
          value: String(intakeRecordsWithRelations.filter((record) => record.photos.length > 0).length),
        },
        {
          label: "Clientes con ingreso",
          value: String(new Set(intakeRecordsWithRelations.map((record) => record.clientId)).size),
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex justify-center rounded-2xl border border-stone-900 bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Nuevo ingreso
            </button>
          </div>
          <IntakeRecordList
            records={intakeRecordsWithRelations}
            selectedRecordId={selectedRecord?.id}
            onSelectRecord={setSelectedRecordId}
          />
        </div>

        <IntakeDetailCard record={selectedRecord} />
      </div>

      {isCreateModalOpen ? (
        <ModalShell onClose={() => setIsCreateModalOpen(false)} maxWidthClassName="max-w-5xl">
          <IntakeForm
            clients={clients}
            vehicles={vehicles}
            onCancel={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateRecord}
          />
        </ModalShell>
      ) : null}
    </PageShell>
  );
}
