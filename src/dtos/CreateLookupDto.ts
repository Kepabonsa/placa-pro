// Author: Kevin Pabón
// external imports
import { z } from 'zod'

// internal imports
import { OwnerDocumentUtil } from '@/utils/OwnerDocumentUtil'
import { PlateSchema } from '@/dtos/PlateParamDto'
import { ValidationUtil } from '@/utils/ValidationUtil'

/** Body of POST /api/lookups. With ownerDocument the query uses the cheap "full" mode. */
export const CreateLookupDtoSchema = z
  .object({
    plate: PlateSchema,
    ownerDocument: z.preprocess(
      (value) => ValidationUtil.emptyToUndefined(value),
      z
        .string({ error: 'La cédula debe ser texto.' })
        .transform((value) => OwnerDocumentUtil.normalize(value))
        .pipe(
          z.string().regex(OwnerDocumentUtil.PATTERN, {
            error: 'La cédula debe tener entre 5 y 10 dígitos.',
          }),
        )
        .optional(),
    ),
  })
  .strict()

export type CreateLookupDto = z.infer<typeof CreateLookupDtoSchema>
