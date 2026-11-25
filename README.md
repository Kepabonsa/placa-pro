# PlacaPro

> Nombre temporal.

PWA móvil para compraventeros de vehículos usados en Colombia: ingresa una placa (o la foto de la
tarjeta de propiedad), obtén un semáforo **Verde / Amarillo / Rojo** y calcula tu **oferta máxima**
en menos de 30 segundos desde el celular.

**Estado:** Iteración 1 (MVP con datos mock realistas, sin Supabase ni PlacApi en vivo).

## Inicio rápido

Requisitos: Node.js 24 y npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`. Para probar en el celular, conéctalo a la misma red y abre
`http://<IP-de-tu-PC>:3000`.

En modo demo (`DATA_SOURCE=memory`) todo corre en memoria con un usuario demo que arranca con
**50 créditos**. Los datos se borran al reiniciar el servidor.

## Placas de prueba

| Placa    | Vehículo                  | Semáforo    | Motivo                                                                                     |
| -------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `KLM482` | Mazda CX-30 2022          | 🟢 Verde    | Sin prenda, papeles al día, avalúo Fasecolda $98.000.000                                   |
| `JTR915` | Chevrolet Onix Turbo 2021 | 🟡 Amarillo | 2 comparendos ($1.160.000), impuesto Antioquia 2026 ($840.000) y SOAT que vence en 18 días |
| `BXZ304` | Toyota Fortuner 2020      | 🔴 Rojo     | Prenda activa con financiera y pérdida total en Fasecolda                                  |
| `ERR503` | —                         | —           | Simula una caída del proveedor para probar el reembolso                                    |

Cualquier otra placa responde "sin registros" y devuelve los créditos.

## Reglas de créditos

| Consulta                        | Costo        |
| ------------------------------- | ------------ |
| Placa + cédula (`full`)         | 3 créditos   |
| Solo placa (`plate_only`)       | 11 créditos  |
| Placa con caché vigente (24 h)  | Sin costo    |
| Falla del proveedor o sin datos | Se reembolsa |

## Scripts

| Script                 | Qué hace                                          |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                            |
| `npm run build`        | Build de producción                               |
| `npm run format`       | Formatea con Prettier                             |
| `npm run format:check` | Verifica el formato                               |
| `npm run lint`         | oxlint + ESLint (incluye reglas propias del repo) |
| `npm run typecheck`    | `tsc --noEmit`                                    |
| `npm test`             | Pruebas con Vitest                                |

## Arquitectura

```text
src/
  app/            páginas (solo renderizan su vista) y Route Handlers en app/api
  views/          HomeSearchView, VehicleReportView, HistoryView
  components/     *Component.tsx (ui/ = primitivos de shadcn)
  services/       puente cliente → /api (clases static)
  lib/services/   lógica de negocio (semáforo, consultas, ofertas)
  lib/providers/  VehicleProviderInterface → MockVehicleProvider | PlacApiProvider
  lib/repositories/ persistencia (memoria hoy, Supabase en la Iteración 2)
  dtos/           esquemas Zod .strict()
  interfaces/     *Interface del dominio
  utils/          *Util (clases static puras)
  constants/      listas as const del dominio
supabase/schema.sql  tablas, RLS y RPCs atómicas de créditos
```

El proveedor se elige con `VEHICLE_PROVIDER=mock|placapi` y la persistencia con
`DATA_SOURCE=memory|supabase` (Supabase se conecta en la Iteración 2).

## API

| Método  | Ruta                          | Descripción                                   |
| ------- | ----------------------------- | --------------------------------------------- |
| `POST`  | `/api/lookups`                | Valida una placa (cobra créditos o usa caché) |
| `GET`   | `/api/lookups/[plate]`        | Reabre el último reporte sin costo            |
| `GET`   | `/api/deals`                  | Historial (`plate`, `dealTag`, `limit`)       |
| `PATCH` | `/api/deals/[plate]`          | Actualiza la calculadora y/o la etiqueta      |
| `GET`   | `/api/profile`                | Perfil y saldo de créditos                    |
| `POST`  | `/api/property-cards/extract` | Lee placa + cédula de la foto (OCR simulado)  |

## Reglas del repositorio

- [Reglas de código](docs/rules/code-rules.md)
- [Reglas de Git](docs/rules/git-rules.md)
- [Reglas de documentación](docs/rules/documentation-rules.md)
