// Author: Kevin Pabón
// external imports
import { z } from 'zod'

// internal imports
import { DEAL_TAGS } from '@/constants/domain'
import { PlateUtil } from '@/utils/PlateUtil'
import { ValidationUtil } from '@/utils/ValidationUtil'

/** Query string of GET /api/deals (history filters). */
export const FindDealsQueryDtoSchema = z
  .object({
    plate: z.preprocess(
      (value) => ValidationUtil.emptyToUndefined(value),
      z
        .string()
        .transform((value) => PlateUtil.normalize(value))
        .pipe(
          z.string().max(PlateUtil.LENGTH, {
            error: `Busca con máximo ${PlateUtil.LENGTH} caracteres de la placa.`,
          }),
        )
        .optional(),
    ),
    dealTag: z.preprocess(
      (value) => ValidationUtil.emptyToUndefined(value),
      z.enum(DEAL_TAGS, { error: 'Etiqueta comercial no válida.' }).optional(),
    ),
    limit: z.preprocess(
      (value) => ValidationUtil.emptyToUndefined(value),
      z.coerce
        .number({ error: 'El límite debe ser un número.' })
        .int({ error: 'El límite debe ser un número entero.' })
        .min(1, { error: 'El límite mínimo es 1.' })
        .max(100, { error: 'El límite máximo es 100.' })
        .optional(),
    ),
  })
  .strict()

export type FindDealsQueryDto = z.infer<typeof FindDealsQueryDtoSchema>
