# CLAUDE.md — PlacaPro

@AGENTS.md

## Instrucciones específicas para Claude Code

### Calidad antes de cerrar

Al terminar cualquier tarea o antes de cualquier commit, ejecutar y citar la salida real de:

```bash
npm run format
npm run lint
npm run typecheck
npm test
```

Reportar explícitamente todo lo que no se pudo verificar (por ejemplo, flujos sin credenciales de
Supabase o PlacApi, o revisiones visuales que no se hicieron).

### Git

- Trabajar en ramas `feat/...`, `fix/...`, `chore/...` o `docs/...`; nunca commit ni push a `main`.
- Los commits quedan solo bajo la autoría de Kevin Pabón: **no agregar `Co-Authored-By`** ni
  firmas de herramientas en commits ni en PRs.
- El cuerpo del PR sigue `.github/pull_request_template.md`.

### Bóveda de Obsidian

- Ruta: `C:\Vault Obsidian\Gringotts\Personal\PlacaPro\` (con espacios: siempre entre comillas).
- Al terminar cada tarea, actualizar las notas **directamente con Write/Edit**; no hay
  sincronización automática.
- Sin acceso a la bóveda (CI o nube): listar en el PR qué notas quedan pendientes.
- Máximo 150 líneas por nota; marcar tareas como hechas solo con evidencia real.
- Detalle completo en [docs/rules/documentation-rules.md](docs/rules/documentation-rules.md).

### Next.js 16

Antes de usar una API de Next.js, leer la guía correspondiente en `node_modules/next/dist/docs/`.
Con `cacheComponents` activo:

- Un `GET` que no lee datos de la petición se prerenderiza en el build; los handlers verifican la
  sesión con `SessionService`, que llama a `connection()`.
- Los componentes cliente que leen `useParams`/`useSearchParams` necesitan un `<Suspense>` arriba
  (en este repo, el `loading.tsx` del segmento).
