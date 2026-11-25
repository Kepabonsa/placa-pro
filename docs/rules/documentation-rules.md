# Reglas de documentación — PlacaPro

## Bóveda de Obsidian

- Ruta: `C:\Vault Obsidian\Gringotts\Personal\PlacaPro\`
- Las notas se escriben **directamente con Write/Edit al terminar cada tarea**. No hay
  sincronización automática ni scripts intermedios.
- Si la sesión no tiene acceso a la bóveda (CI, entornos en la nube), no se inventan notas: se
  listan en el PR, en la sección de Obsidian, las notas que quedan pendientes y qué deben decir.

## Formato de notas

- Máximo **150 líneas por nota**. Si una nota crece más, se divide y se enlaza con `[[...]]`.
- Nombre de archivo: `PlacaPro - <Tema>.md` (por ejemplo `PlacaPro - Roadmap.md`).
- Idioma: español.
- Una tarea se marca como hecha (`- [x]`) **solo con evidencia real**: salida de un comando, commit,
  PR o verificación manual descrita. Sin evidencia queda `- [ ]` con una nota de qué falta.

## Notas base

| Nota                                 | Contenido                                        |
| ------------------------------------ | ------------------------------------------------ |
| `PlacaPro - Roadmap.md`              | Las 4 iteraciones y su estado.                   |
| `PlacaPro - Iteración N - <Tema>.md` | Qué se hizo, decisiones, evidencia y pendientes. |

## Documentación en el repositorio

- `README.md`: cómo correr el proyecto y qué incluye.
- `docs/rules/`: reglas de código, git y documentación (este archivo).
- `AGENTS.md` y `CLAUDE.md`: punto de entrada para agentes; enlazan a `docs/rules/`.
