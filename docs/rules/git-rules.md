# Reglas de Git — PlacaPro

## Ramas

- Prefijos: `feat/...`, `fix/...`, `chore/...`, `docs/...` (en minúsculas y con guiones).
- `main` solo recibe cambios por pull request. **Nunca** commits ni push directo a `main`.
- Rama de trabajo actual: `feat/mvp-iteracion-1`.

## Commits

- Commits convencionales, en español, claros y concisos.
  - `feat: agrega pantalla de semáforo vehicular`
  - `fix: corrige el cálculo del margen objetivo`
  - `chore: actualiza dependencias de desarrollo`
  - `docs: documenta el contrato de PlacApi`
  - `test: agrega pruebas del semáforo`
  - `ci: ejecuta el build en cada PR`
- Todos los commits quedan **exclusivamente bajo la autoría de Kevin Pabón**. No agregar líneas
  `Co-Authored-By` ni firmas de herramientas.
- Antes de cada commit: `npm run format`, `npm run lint`, `npm run typecheck` y `npm test`.
  Citar la salida real y reportar lo no verificado.
- Nunca commitear secretos (`.env.local`, llaves de Supabase o PlacApi).

## Pull requests

- Título con el mismo formato de commit convencional, en español.
- Cuerpo según `.github/pull_request_template.md`: "Qué cambia", "Cambios principales",
  checklist de verificación, checklist de Obsidian y "Qué no se pudo verificar".
- El CI (`.github/workflows/ci.yml`) debe pasar: `npm ci`, `format:check`, `lint`, `typecheck`,
  `test` y `build`.
- Si el trabajo se hizo sin acceso a la bóveda de Obsidian (por ejemplo en CI o en la nube),
  listar en el PR las notas pendientes de actualizar.
