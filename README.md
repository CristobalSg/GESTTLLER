# Base React + Vite + Tailwind

Plantilla limpia para iniciar otro proyecto con **React + TypeScript + Vite + Tailwind CSS**, manteniendo soporte para **PWA**, despliegue en **Vercel** y contenedor con **Nginx**.

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm lint
```

## Estructura

```text
src/
  App.tsx
  index.css
  main.tsx
public/
  manifest.json
  logo.svg
  icons/
```

## Que se limpio

- Se elimino el contenido especifico del negocio anterior.
- Se eliminaron componentes, data mock y assets que no servian como base.
- Se simplificaron dependencias para dejar solo el stack principal.
- Se dejaron configuraciones genericas para web app, PWA, Docker y Vercel.

## Antes de reutilizar

- Cambia el nombre del proyecto en `package.json`.
- Actualiza `index.html` y `public/manifest.json`.
- Reemplaza los iconos de `public/icons`.
- Agrega nuevas secciones o componentes segun el nuevo proyecto.
