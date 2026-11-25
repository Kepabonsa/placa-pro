// Author: Kevin Pabón
// external imports
import { z } from 'zod'

// internal imports
import { DEAL_TAGS, OFFER_MAX_MARGIN_PERCENT } from '@/constants/domain'

const MAX_AMOUNT = 10_000_000_000

const buildMoneySchema = (label: string): z.ZodNumber =>
  z
    .number({ error: `${label} debe ser un número.` })
    .int({ error: `${label} debe ser un valor entero en pesos.` })
    .min(0, { error: `${label} no puede ser negativo.` })
    .max(MAX_AMOUNT, { error: `${label} es demasiado alto.` })

/** Body of PATCH /api/deals/[plate]: calculator inputs and/or the commercial tag. */
export const UpdateOfferCalcDtoSchema = z
  .object({
    marketValue: buildMoneySchema('El valor de mercado').optional(),
    transferCost: buildMoneySchema('El traspaso').optional(),
    repairCosts: buildMoneySchema('Los arreglos').optional(),
    targetMarginPercent: z
      .number({ error: 'El margen objetivo debe ser un número.' })
      .min(0, { error: 'El margen objetivo no puede ser negativo.' })
      .max(OFFER_MAX_MARGIN_PERCENT, {
        error: `El margen objetivo no puede superar el ${OFFER_MAX_MARGIN_PERCENT} %.`,
      })
      .optional(),
    dealTag: z.enum(DEAL_TAGS, { error: 'Etiqueta comercial no válida.' }).optional(),
  })
  .strict()
  .refine((dto) => Object.values(dto).some((value) => value !== undefined), {
    error: 'Envía al menos un campo para actualizar.',
  })

export type UpdateOfferCalcDto = z.infer<typeof UpdateOfferCalcDtoSchema>
