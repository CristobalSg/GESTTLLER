# AGENTS.md

## Propósito del proyecto
Este proyecto es un prototipo inicial de un sistema de gestión para taller mecánico.
El objetivo es construir una aplicación web ordenada, modular y escalable, enfocada en:

- agenda de horas
- registro de clientes
- registro de vehículos
- ingreso del vehículo con evidencia
- presupuestos
- órdenes de trabajo
- historial
- estadísticas básicas

El enfoque actual es prototipo funcional, no producto final.

---

## Stack obligatorio
Trabajar únicamente con el stack base ya definido:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- PWA ya configurada para futuros ajustes

No cambiar el stack sin que se solicite explícitamente.

---

## Principios de trabajo
1. Avanzar por tareas pequeñas, cerradas y verificables.
2. No construir todo de una vez.
3. No mezclar múltiples módulos en una sola tarea.
4. Priorizar claridad, orden y mantenibilidad.
5. Mantener el proyecto estable en cada iteración.
6. Cada cambio debe dejar la aplicación funcionando.

---

## Forma de construir
El desarrollo debe seguir este orden general:

1. estructura base de la aplicación
2. layout y navegación
3. tipos de datos y mocks
4. módulo de clientes
5. módulo de vehículos
6. módulo de agenda
7. módulo de ingreso del vehículo
8. módulo de presupuestos
9. módulo de órdenes de trabajo
10. dashboard y estadísticas
11. pulido visual, responsive y mejoras PWA

No adelantarse a módulos futuros salvo que la tarea lo pida.

---

## Restricciones técnicas
- No agregar librerías nuevas a menos que se solicite explícitamente.
- No conectar backend real por ahora.
- Usar datos mock, localStorage o una persistencia simple local si es necesario.
- No implementar autenticación todavía.
- No implementar roles de usuario todavía.
- No rehacer arquitectura existente sin motivo claro.
- No modificar módulos no relacionados con la tarea actual.
- No eliminar funcionalidades existentes que ya estén aprobadas.

---

## Criterios de código
- Usar TypeScript correctamente, con tipos claros.
- Crear componentes pequeños y reutilizables.
- Mantener separación por módulos.
- Evitar archivos gigantes.
- Usar nombres claros y consistentes.
- Evitar lógica duplicada.
- Mantener estilos con Tailwind de forma ordenada.
- Priorizar legibilidad por sobre complejidad innecesaria.

---

## Estructura sugerida
Mantener una organización modular similar a esta:

src/
  app/
    layout/
    routes/
    providers/
  modules/
    dashboard/
    clients/
    vehicles/
    appointments/
    intake/
    quotes/
    work-orders/
    reports/
  components/
    ui/
    shared/
  hooks/
  utils/
  types/
  data/

Si ya existe una estructura previa, respetarla y extenderla con criterio.

---

## Datos del prototipo
Mientras no exista backend, trabajar con:

- datos mock realistas
- localStorage para persistencia simple cuando sea necesario
- ids locales
- estados controlados desde frontend

Toda estructura de datos debe prepararse pensando en una futura integración con backend.

---

## UX/UI
La interfaz debe ser:

- simple
- clara
- profesional
- rápida de usar
- pensada para operación diaria de taller

Evitar sobrecargar la interfaz.
Priorizar formularios claros, tablas legibles, navegación simple y acciones evidentes.

---

## Regla principal por tarea
Cada tarea debe cumplir esto:

- resolver un objetivo concreto
- tocar solo lo necesario
- dejar el sistema funcionando
- no romper lo anterior
- no improvisar funcionalidades fuera del alcance

---

## Qué debe entregar en cada tarea
Cada avance debe incluir:

1. resumen breve de lo implementado
2. archivos creados o modificados
3. decisiones técnicas relevantes
4. qué quedó pendiente si aplica

---

## Qué no hacer
- no inventar requisitos no pedidos
- no agregar complejidad prematura
- no refactorizar por gusto
- no cambiar diseño global sin necesidad
- no mezclar lógica de varios módulos sin justificación
- no asumir backend o servicios externos
- no convertir el prototipo en una arquitectura enterprise

---

## Prioridad actual
La prioridad es lograr un MVP funcional y ordenado del sistema de taller mecánico, validando flujo y experiencia antes de escalar.