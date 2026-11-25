# Reglas de código — PlacaPro

Reglas obligatorias para cualquier persona o agente que escriba código en este repositorio.
Si una regla entra en conflicto con una convención externa, gana este documento.

## 1. Idioma

| Elemento                                            | Idioma  |
| --------------------------------------------------- | ------- |
| Código, identificadores, comentarios y JSDoc        | Inglés  |
| Textos de la interfaz y mensajes de error de la API | Español |
| Documentación, commits y pull requests              | Español |

## 2. Reglas generales

1. **Autor:** la primera línea de cada archivo `.ts` / `.tsx` propio es exactamente
   `// Author: Kevin Pabón`. Una sola línea de autor por archivo; modificar un archivo no agrega otra.
2. **Bloques de imports:** separados con los comentarios `// external imports` y
   `// internal imports` (en ese orden). Cada bloque se ordena alfabéticamente por el nombre
   importado, sin distinguir mayúsculas, y los nombres dentro de `{ ... }` siguen el mismo orden.
   - Externo = paquetes de `node_modules` (`react`, `next/...`, `zod`).
   - Interno = alias `@/...` y rutas relativas.
   - Los imports de efecto (`import './globals.css'`) van al final de su bloque.
3. **`import type`** cuando solo se importen tipos.
4. **Prohibido `any`.** Tipar explícitamente parámetros y retornos de todas las funciones. No tipar
   variables locales que TypeScript infiere bien.
5. **Nombres sin ambigüedad:** prohibidas las variables de una sola letra (`vehicle`, no `v`;
   `lookup`, no `l`).
6. **Valores válidos con `as const`** exportados desde `src/constants/domain.ts`
   (`TRAFFIC_LIGHT_STATUSES`, `DEAL_TAGS`, `QUERY_MODES`, `DOCUMENT_VALIDITIES`, etc.). Los tipos
   unión se derivan de esas listas en el mismo archivo.
7. **Prohibido `export default`** en archivos propios. Única excepción obligatoria de Next.js:
   `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` y `not-found.tsx`.
8. **Variables de entorno** siempre en `.env.local`; `.env.example` versionado con todas las claves.

## 3. Separación de capas

### Route Handlers — `src/app/api/**/route.ts`

Controladores delgados: mapean la petición HTTP, validan la entrada con esquemas Zod (DTOs que
rechazan propiedades desconocidas con `.strict()`), verifican la sesión y delegan en el servicio.
**Cero lógica de negocio en rutas.**

### Servicios de servidor — `src/lib/services/`

- Toda la lógica de negocio y orquestación: caché, consumo de créditos, semáforo, PDF.
- Métodos públicos con nombres claros (`findAll`, `findOne`, `create`, `update`, `remove` o
  equivalentes de dominio) y JSDoc corto con `@param`, `@returns` y `@throws`.
- No revalidan formato de entrada si el DTO ya lo validó.
- No declaran ni exportan tipos (viven en `src/interfaces/`).

### Proveedores vehiculares — `src/lib/providers/`

Toda consulta externa de vehículos pasa por `VehicleProviderInterface`. Hoy corre con
`MockVehicleProvider` y mañana con `PlacApiProvider`, seleccionados por `VEHICLE_PROVIDER=mock|placapi`
en `provider.factory.ts`, sin tocar UI ni servicios.

### Servicios de cliente — `src/services/`

Clases con métodos `static` (sin la palabra clave `public`) que actúan como puente hacia `/api/...`.
No contienen filtros ni agregaciones ni declaran tipos.

### Utilidades — `src/utils/`

Clases con métodos `static`, archivo en PascalCase con sufijo `Util` (`CurrencyUtil.ts`,
`DateUtil.ts`, `TrafficLightUtil.ts`). Constantes como `static readonly`, helpers internos como
`private static`, nada fuera de la clase. No llaman APIs ni tocan estado global.

### Interfaces y DTOs — `src/interfaces/` y `src/dtos/`

- Interfaces de dominio con sufijo `Interface` (`VehicleReportInterface`, `LookupJobInterface`,
  `OfferCalculationInterface`).
- Esquemas Zod de entrada en `src/dtos/` con sufijo `Dto` (`CreateLookupDto`, `UpdateOfferCalcDto`):
  el archivo exporta el esquema (`CreateLookupDtoSchema`) y el tipo inferido (`CreateLookupDto`).

### Componentes y vistas — `src/components/` y `src/views/`

- Componentes propios en PascalCase con sufijo `Component` (`PlateSearchComponent.tsx`).
- Vistas principales en `src/views/` con sufijo `View` (`HomeSearchView.tsx`). Cada `page.tsx` se
  limita a renderizar su vista.
- Los primitivos de shadcn/ui viven en `src/components/ui/` y se excluyen de las reglas de sufijo y
  autor (igual que `src/lib/utils.ts`, generado por shadcn).
- No mutar props ni duplicar validaciones del backend en la UI; mostrar los mensajes de error de la
  API en un toast o alerta clara.

## 4. Estilo y calidad

- Prettier: comillas simples, sin punto y coma, ancho 100, trailing commas.
- Scripts obligatorios: `format`, `format:check`, `lint` (oxlint + ESLint), `typecheck`
  (`tsc --noEmit`) y `test` (Vitest).
- Antes de cerrar cualquier tarea o commit: correr `format`, `lint`, `typecheck` y `test`, citar la
  salida real y reportar explícitamente lo que no se pudo verificar.

## 5. Aclaraciones de implementación

- Las reglas 1, 2, 4, 5 y 7 se verifican automáticamente con ESLint (plugin local en
  `eslint-rules/`) y oxlint. Un error de lint es un bloqueo, no una sugerencia.
- Los archivos de configuración que la herramienta exige con `export default`
  (`next.config.ts`, `vitest.config.ts`, `eslint.config.mjs`) quedan fuera de la regla 7.
- Contratos de infraestructura (proveedores y repositorios) viven junto a su implementación en
  `src/lib/providers/` y `src/lib/repositories/` con nombre `*.interface.ts`.
- Errores de aplicación en `src/lib/errors/`; adaptador HTTP de rutas en `src/lib/http/`.
- Pruebas junto al código con sufijo `.test.ts`.
