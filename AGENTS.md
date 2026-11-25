# AGENTS.md — PlacaPro

Guía de entrada para agentes de código. Las reglas completas viven en `docs/rules/`:

- [Reglas de código](docs/rules/code-rules.md)
- [Reglas de Git](docs/rules/git-rules.md)
- [Reglas de documentación](docs/rules/documentation-rules.md)

## Producto

PWA móvil-first para compraventeros de vehículos usados en Colombia. El usuario ingresa una placa
(o sube la foto de la tarjeta de propiedad para extraer placa + cédula del propietario), obtiene un
semáforo inmediato (Verde / Amarillo / Rojo), calcula su oferta máxima descontando deudas, arreglos
y traspaso, y en una iteración futura genera el contrato de compraventa en PDF.

**Métrica principal:** validar un vehículo y calcular la oferta máxima en menos de 30 segundos desde
el celular.

**Principios (en orden):** rapidez sobre complejidad · simplicidad sobre funcionalidades extra · uso
real en la calle sobre perfección teórica · menos fricción (menos clics, menos campos, valores por
defecto sensatos).

**Fuera de alcance en la Iteración 1:** pasarela de pagos (Wompi), bot de WhatsApp real, conexión en
vivo a PlacApi (se usa `MockVehicleProvider`) y CRM complejo.

## Stack

Next.js (App Router) + TypeScript estricto + Tailwind CSS + shadcn/ui · Route Handlers en
`src/app/api/` · Supabase (PostgreSQL + Auth + RLS, esquema en `supabase/schema.sql`) · Zod ·
pdf-lib (Iteración 4) · Prettier, oxlint, ESLint, `tsc --noEmit` y Vitest.

## Reglas que no se negocian

1. Código, identificadores, comentarios y JSDoc en inglés; UI, errores de API, docs, commits y PRs
   en español.
2. Primera línea de cada `.ts`/`.tsx` propio: `// Author: Kevin Pabón`.
3. Bloques `// external imports` y `// internal imports`, ordenados alfabéticamente por nombre
   importado (sin distinguir mayúsculas); `import type` cuando solo hay tipos.
4. Sin `any`, sin variables de una letra, sin `export default` (salvo `page`, `layout`, `loading`,
   `error`, `not-found`). Parámetros y retornos tipados.
5. Rutas delgadas → servicios en `src/lib/services/` → proveedores detrás de
   `VehicleProviderInterface`. Cliente en `src/services/` (clases `static`), utilidades en
   `src/utils/` (clases `*Util`), interfaces en `src/interfaces/`, DTOs Zod `.strict()` en
   `src/dtos/`, componentes `*Component`, vistas `*View`.
6. Ramas `feat/`, `fix/`, `chore/`, `docs/`; a `main` solo por PR. Commits convencionales en
   español, solo con la autoría de Kevin Pabón (sin `Co-Authored-By`).
7. Antes de cerrar una tarea o commit: `npm run format`, `npm run lint`, `npm run typecheck`,
   `npm test`; citar la salida real y reportar lo no verificado.

## Entorno local

Windows (PowerShell / Git Bash). Si una ruta tiene espacios, va siempre entre comillas
(`"C:\Project Car"`, `"C:\Vault Obsidian\Gringotts\Personal\PlacaPro\"`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
