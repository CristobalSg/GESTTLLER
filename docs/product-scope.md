# Product Scope - Sistema de Gestión de Taller Mecánico

## Descripción general
Este proyecto es un sistema web para talleres mecánicos que permite gestionar todo el flujo de trabajo desde la llegada del vehículo hasta su entrega, incluyendo registro, cotización, ejecución y análisis.

El objetivo principal es:
- ordenar la operación diaria
- registrar información de forma clara
- generar respaldo del trabajo realizado
- mejorar la toma de decisiones

Este sistema es inicialmente un prototipo (MVP).

---

## Problema que resuelve
Los talleres mecánicos suelen trabajar con:
- información desordenada
- falta de registro histórico
- cotizaciones poco estructuradas
- poca visibilidad de ganancias y tiempos

Este sistema busca centralizar todo en un solo lugar.

---

## Objetivos del MVP
El MVP debe permitir:

1. Registrar clientes
2. Registrar vehículos
3. Agendar citas
4. Registrar ingreso del vehículo con evidencia
5. Crear presupuestos
6. Generar órdenes de trabajo
7. Registrar trabajos realizados
8. Ver estadísticas básicas

---

## Flujo principal del usuario

1. Se agenda una cita
2. El vehículo llega al taller
3. Se registra el ingreso (con fotos y observaciones)
4. Se realiza diagnóstico
5. Se genera presupuesto
6. El cliente aprueba o rechaza
7. Se crea orden de trabajo
8. Se ejecuta el trabajo
9. Se entrega el vehículo
10. Se registran resultados y recomendaciones
11. El sistema genera estadísticas

---

## Módulos del sistema

### 1. Dashboard
Resumen general del negocio.

### 2. Clientes
Gestión de clientes.

### 3. Vehículos
Gestión de vehículos y su historial.

### 4. Agenda
Gestión de citas del taller.

### 5. Ingreso
Registro del estado del vehículo al llegar.

### 6. Presupuestos
Cotización de trabajos.

### 7. Órdenes de trabajo
Registro de trabajos realizados.

### 8. Reportes
Estadísticas básicas del negocio.

---

## Entidades principales

### Cliente
- nombre
- teléfono
- correo
- notas

### Vehículo
- patente
- marca
- modelo
- año
- kilometraje
- cliente asociado

### Cita
- fecha
- hora
- cliente
- vehículo
- motivo
- estado

### Registro de ingreso
- vehículo
- kilometraje
- observaciones
- fotos (vehículo, tablero, escáner)

### Presupuesto
- cliente
- vehículo
- ítems
- total
- estado
- observaciones

### Orden de trabajo
- cliente
- vehículo
- trabajos realizados
- técnico
- observaciones
- recomendaciones
- estado

---

## Qué NO incluye el MVP

- autenticación de usuarios
- roles o permisos
- backend real
- integración con pagos
- envío de correos o WhatsApp
- inventario de repuestos
- facturación electrónica

---

## Enfoque de diseño

El sistema debe ser:
- simple
- rápido
- claro
- usable en el día a día del taller

Se prioriza:
- velocidad de uso
- claridad de información
- flujo lógico

---

## Visión a futuro (no implementar ahora)

- conexión a backend real
- sistema multiusuario
- inventario de repuestos
- integración con proveedores
- firma digital
- envío automático de presupuestos
- recordatorios de mantenimiento

---

## Definición de éxito del MVP

El sistema será exitoso si:
- permite registrar trabajos reales
- ordena la información del taller
- permite visualizar qué se hizo en cada vehículo
- permite ver ingresos y actividad básica