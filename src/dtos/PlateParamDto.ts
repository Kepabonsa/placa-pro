// Author: Kevin Pabón
// external imports
import { z } from 'zod'

// internal imports
import { PlateUtil } from '@/utils/PlateUtil'

/** Normalized Colombian plate (ABC123 or ABC12D). */
export const PlateSchema = z
  .string({ error: 'La placa es obligatoria.' })
  .transform((value) => PlateUtil.normalize(value))
  .pipe(
    z.string().regex(PlateUtil.PATTERN, {
      error: 'Placa inválida: usa el formato ABC123 (carro) o ABC12D (moto).',
    }),
  )

/** Route param of /api/lookups/[plate] and /api/deals/[plate]. */
export const PlateParamDtoSchema = z.object({ plate: PlateSchema }).strict()

export type PlateParamDto = z.infer<typeof PlateParamDtoSchema>
