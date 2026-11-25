// Author: Kevin Pabón
// external imports
import { z } from 'zod'

// internal imports
import { PROPERTY_CARD_MAX_BYTES, PROPERTY_CARD_MIME_TYPES } from '@/constants/domain'

/** Multipart body of POST /api/property-cards/extract. */
export const ExtractPropertyCardDtoSchema = z
  .object({
    image: z
      .file({ error: 'Adjunta la foto de la tarjeta de propiedad.' })
      .min(1, { error: 'La imagen está vacía.' })
      .max(PROPERTY_CARD_MAX_BYTES, { error: 'La imagen supera el máximo de 10 MB.' })
      .mime([...PROPERTY_CARD_MIME_TYPES], {
        error: 'Formato no soportado: usa una foto JPG, PNG, WEBP o HEIC.',
      }),
  })
  .strict()

export type ExtractPropertyCardDto = z.infer<typeof ExtractPropertyCardDtoSchema>
