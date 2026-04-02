import { useMemo, useState } from "react";

import { getClientDisplayName, getVehicleDisplayName } from "@/utils/entity-display";

import { ModalShell } from "../../components/shared/modal-shell";
import { useAppointmentsStorage } from "../appointments/use-appointments-storage";

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    month: "long",
  }).format(date);
}

function formatSelectedDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function formatAppointmentDateTime(dateKey: string, startTime: string, endTime: string) {
  return `${new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateKey}T12:00:00`))} · ${startTime} - ${endTime}`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
}

function buildDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const currentDate = new Date(year, monthIndex, index - startOffset + 1);

    return {
      dayNumber: currentDate.getDate(),
      dateKey: buildDateKey(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
      isOutsideVisibleMonth: currentDate.getMonth() !== monthIndex,
    };
  });
}

function getWeekDays(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const startOffset = (selectedDate.getDay() + 6) % 7;
  const monday = new Date(year, month - 1, day - startOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);

    return {
      dayNumber: currentDate.getDate(),
      dateKey: buildDateKey(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
      isOutsideVisibleMonth: currentDate.getMonth() !== selectedDate.getMonth(),
    };
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada";
    case "pending":
      return "Pendiente";
    case "in-progress":
      return "En curso";
    case "finalized":
      return "Finalizada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

export function HomePage() {
  const { appointmentsWithRelations } = useAppointmentsStorage();
  const todayKey = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | undefined>();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const [year, month] = todayKey.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });

  const appointmentsCountByDate = useMemo(
    () =>
      appointmentsWithRelations.reduce<Record<string, number>>((accumulator, appointment) => {
        if (appointment.status === "cancelled") {
          return accumulator;
        }

        accumulator[appointment.date] = (accumulator[appointment.date] ?? 0) + 1;
        return accumulator;
      }, {}),
    [appointmentsWithRelations]
  );

  const selectedAppointments = useMemo(
    () => appointmentsWithRelations.filter((appointment) => appointment.date === selectedDate),
    [appointmentsWithRelations, selectedDate]
  );

  const activeAppointment = useMemo(
    () => appointmentsWithRelations.find((appointment) => appointment.id === activeAppointmentId),
    [activeAppointmentId, appointmentsWithRelations]
  );

  const activeAppointments = useMemo(
    () => appointmentsWithRelations.filter((appointment) => appointment.status !== "cancelled"),
    [appointmentsWithRelations]
  );

  const monthlyAppointments = useMemo(
    () =>
      activeAppointments.filter((appointment) => appointment.date.startsWith(getMonthKey(visibleMonth))),
    [activeAppointments, visibleMonth]
  );

  const upcomingAppointmentsCount = useMemo(
    () =>
      activeAppointments.filter((appointment) => {
        if (appointment.date > todayKey) {
          return true;
        }

        if (appointment.date < todayKey) {
          return false;
        }

        return appointment.endTime >= new Date().toTimeString().slice(0, 5);
      }).length,
    [activeAppointments, todayKey]
  );

  const calendarDays = useMemo(
    () => (viewMode === "month" ? getCalendarDays(visibleMonth) : getWeekDays(selectedDate)),
    [selectedDate, viewMode, visibleMonth]
  );

  const availableYears = useMemo(() => {
    const yearsFromAppointments = appointmentsWithRelations.map((appointment) => Number(appointment.date.slice(0, 4)));
    const currentYear = visibleMonth.getFullYear();
    const minYear = Math.min(currentYear - 1, ...yearsFromAppointments);
    const maxYear = Math.max(currentYear + 1, ...yearsFromAppointments);

    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);
  }, [appointmentsWithRelations, visibleMonth]);

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index,
        label: new Intl.DateTimeFormat("es-CL", { month: "long" }).format(new Date(2026, index, 1)),
      })),
    []
  );

  function handleChangeYear(nextYear: number) {
    setVisibleMonth((currentMonth) => new Date(nextYear, currentMonth.getMonth(), 1));
    setSelectedDate((currentDateKey) => {
      const [, month, day] = currentDateKey.split("-").map(Number);
      const daysInMonth = new Date(nextYear, month, 0).getDate();
      return buildDateKey(nextYear, month - 1, Math.min(day, daysInMonth));
    });
  }

  function handleChangeMonthBySelect(monthIndex: number) {
    const nextMonth = new Date(visibleMonth.getFullYear(), monthIndex, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(buildDateKey(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
    setIsMonthMenuOpen(false);
  }

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);

    const [year, month] = dateKey.split("-").map(Number);
    const nextVisibleMonth = new Date(year, month - 1, 1);

    if (getMonthKey(nextVisibleMonth) !== getMonthKey(visibleMonth)) {
      setVisibleMonth(nextVisibleMonth);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-stone-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen((current) => !current);
                      setIsMonthMenuOpen(false);
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm transition hover:bg-stone-100"
                    aria-label="Opciones del calendario"
                    aria-expanded={isOptionsOpen}
                  >
                    <span className="flex flex-col gap-1">
                      <span className="h-0.5 w-5 rounded-full bg-current" />
                      <span className="h-0.5 w-5 rounded-full bg-current" />
                      <span className="h-0.5 w-3 rounded-full bg-current" />
                    </span>
                  </button>

                  {isOptionsOpen ? (
                    <div className="absolute left-0 top-14 z-10 w-60 rounded-3xl border border-stone-200 bg-white p-4 shadow-[0_18px_45px_rgba(120,113,108,0.18)]">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                          Vista
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setViewMode("week")}
                            className={[
                              "rounded-2xl px-3 py-2 text-sm font-medium transition",
                              viewMode === "week"
                                ? "bg-stone-900 text-white"
                                : "bg-stone-100 text-stone-700 hover:bg-stone-200",
                            ].join(" ")}
                          >
                            Semanal
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode("month")}
                            className={[
                              "rounded-2xl px-3 py-2 text-sm font-medium transition",
                              viewMode === "month"
                                ? "bg-stone-900 text-white"
                                : "bg-stone-100 text-stone-700 hover:bg-stone-200",
                            ].join(" ")}
                          >
                            Mensual
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor="calendar-year"
                          className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500"
                        >
                          Año
                        </label>
                        <select
                          id="calendar-year"
                          value={visibleMonth.getFullYear()}
                          onChange={(event) => handleChangeYear(Number(event.target.value))}
                          className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-900 outline-none transition focus:border-teal-400"
                        >
                          {availableYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMonthMenuOpen((current) => !current);
                      setIsOptionsOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-stone-900 shadow-sm transition hover:bg-stone-100"
                    aria-label="Seleccionar mes"
                    aria-expanded={isMonthMenuOpen}
                  >
                    <span className="relative block h-4 w-4 rounded border border-stone-400">
                      <span className="absolute inset-x-0 top-0 h-1 rounded-t bg-stone-400" />
                      <span className="absolute left-1 top-[6px] h-1 w-1 rounded-full bg-stone-400" />
                      <span className="absolute right-1 top-[6px] h-1 w-1 rounded-full bg-stone-400" />
                    </span>
                    <span className="text-sm font-semibold capitalize tracking-tight">
                      {formatMonthLabel(visibleMonth)}
                    </span>
                    <span className="text-xs text-stone-500">▾</span>
                  </button>

                  {isMonthMenuOpen ? (
                    <div className="absolute right-0 top-14 z-10 w-52 rounded-3xl border border-stone-200 bg-white p-2 shadow-[0_18px_45px_rgba(120,113,108,0.18)]">
                      {monthOptions.map((month) => (
                        <button
                          key={month.value}
                          type="button"
                          onClick={() => handleChangeMonthBySelect(month.value)}
                          className={[
                            "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-medium capitalize transition",
                            visibleMonth.getMonth() === month.value
                              ? "bg-[#ff6b2c] text-white"
                              : "text-stone-700 hover:bg-stone-100",
                          ].join(" ")}
                        >
                          <span>{month.label}</span>
                          {visibleMonth.getMonth() === month.value ? <span>✓</span> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                <span key={`${label}-${index}`} className="py-2">
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((day) => (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => handleSelectDate(day.dateKey)}
                  className={[
                    "relative flex aspect-square min-h-11 items-center justify-center rounded-full text-sm font-semibold transition",
                    day.dateKey === selectedDate
                      ? "bg-[#ff6b2c] text-white shadow-[0_10px_30px_rgba(255,107,44,0.35)]"
                      : day.dateKey === todayKey
                        ? "bg-stone-900 text-white"
                        : appointmentsCountByDate[day.dateKey]
                          ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                          : day.isOutsideVisibleMonth
                            ? "border border-stone-200 bg-stone-100 text-stone-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_6px_16px_rgba(120,113,108,0.10)] hover:bg-stone-200"
                            : "bg-white text-stone-700 hover:bg-stone-100",
                    viewMode === "week" && "min-h-12",
                  ].join(" ")}
                  aria-pressed={day.dateKey === selectedDate}
                >
                  {day.dayNumber}
                </button>
              ))}
            </div>
      </div>

      <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
        <div className="rounded-[32px] border border-stone-200 bg-stone-50/70 p-5">
            <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                  Seguimiento inmediato
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950 capitalize">
                  {formatSelectedDateLabel(selectedDate)}
                </h2>
              </div>
              <p className="text-sm text-stone-600">
                {selectedAppointments.length} cita{selectedAppointments.length === 1 ? "" : "s"} para este día
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {selectedAppointments.length > 0 ? (
                selectedAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => setActiveAppointmentId(appointment.id)}
                    className="block w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-stone-300 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600">
                      <span className="rounded-full bg-stone-100 px-3 py-1">
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                      <span className="rounded-full bg-stone-100 px-3 py-1">
                        {appointment.estimatedDurationMinutes} min
                      </span>
                      <span className="rounded-full bg-stone-100 px-3 py-1">
                        {getStatusBadge(appointment.status)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold text-stone-950">{appointment.reason}</h3>
                    <p className="mt-2 text-sm text-stone-700">
                      {getClientDisplayName(appointment.client)}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {getVehicleDisplayName(appointment.vehicle)}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-stone-600">
                      {appointment.notes || "Sin notas adicionales para esta cita."}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-600">
                  No hay citas registradas para este día. Selecciona otra fecha del calendario para revisar la agenda.
                </p>
              )}
            </div>

        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(120,113,108,0.12)]">
        <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Estadísticas</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
              Resumen rápido del taller
            </h2>
          </div>
          <p className="text-sm text-stone-600">Lectura simple para la operación diaria.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-5 shadow-[0_10px_30px_rgba(120,113,108,0.10)]">
            <p className="text-sm text-stone-500">Citas del día</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {selectedAppointments.length}
            </p>
          </article>

          <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-5 shadow-[0_10px_30px_rgba(120,113,108,0.10)]">
            <p className="text-sm text-stone-500">Próximas activas</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {upcomingAppointmentsCount}
            </p>
          </article>

          <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-5 shadow-[0_10px_30px_rgba(120,113,108,0.10)]">
            <p className="text-sm text-stone-500">Mes visible</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {monthlyAppointments.length}
            </p>
          </article>

          <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-5 shadow-[0_10px_30px_rgba(120,113,108,0.10)]">
            <p className="text-sm text-stone-500">Días con carga</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              {Object.keys(appointmentsCountByDate).length}
            </p>
          </article>
        </div>
      </section>

      <footer className="rounded-[28px] border border-stone-200/80 bg-white/70 px-6 py-5 shadow-[0_12px_35px_rgba(120,113,108,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-stone-700">GESTTLLER · Prototipo operativo del taller</p>
          <p className="text-sm text-stone-500">
            Agenda, seguimiento y registro diario en una sola vista.
          </p>
        </div>
      </footer>

      {activeAppointment ? (
        <ModalShell onClose={() => setActiveAppointmentId(undefined)}>
          <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_24px_70px_rgba(17,24,39,0.18)] sm:p-7">
            <div className="border-b border-stone-200 pb-5">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">Detalle de cita</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                {activeAppointment.reason}
              </h2>
              <p className="mt-3 text-sm capitalize text-stone-600">
                {formatAppointmentDateTime(
                  activeAppointment.date,
                  activeAppointment.startTime,
                  activeAppointment.endTime
                )}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Cliente</p>
                <p className="mt-2 text-base font-semibold text-stone-950">
                  {getClientDisplayName(activeAppointment.client)}
                </p>
                <p className="mt-2 text-sm text-stone-600">{activeAppointment.client?.phone || "Sin teléfono"}</p>
                <p className="mt-1 text-sm text-stone-600">{activeAppointment.client?.email || "Sin correo"}</p>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Vehículo</p>
                <p className="mt-2 text-base font-semibold text-stone-950">
                  {getVehicleDisplayName(activeAppointment.vehicle)}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  {activeAppointment.vehicle?.licensePlate || "Patente pendiente"}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {[activeAppointment.vehicle?.brand, activeAppointment.vehicle?.model]
                    .filter(Boolean)
                    .join(" ") || "Modelo pendiente"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
              <span className="rounded-full bg-stone-100 px-3 py-2">
                Duración: {activeAppointment.estimatedDurationMinutes} min
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-2">
                Estado: {getStatusBadge(activeAppointment.status)}
              </span>
            </div>

            <div className="mt-5 rounded-3xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Notas</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {activeAppointment.notes || "Sin notas adicionales para esta cita."}
              </p>
            </div>
          </article>
        </ModalShell>
      ) : null}

    </section>
  );
}
