// Author: Kevin Pabón
// external imports
import { describe, expect, it } from 'vitest'
import type { z } from 'zod'

// internal imports
import { CreateLookupDtoSchema } from '@/dtos/CreateLookupDto'
import { ExtractPropertyCardDtoSchema } from '@/dtos/ExtractPropertyCardDto'
import { FindDealsQueryDtoSchema } from '@/dtos/FindDealsQueryDto'
import { PlateParamDtoSchema } from '@/dtos/PlateParamDto'
import { UpdateOfferCalcDtoSchema } from '@/dtos/UpdateOfferCalcDto'
import { ValidationUtil } from '@/utils/ValidationUtil'

const errorMessageOf = (schema: z.ZodType, input: unknown): string => {
  const result = schema.safeParse(input)
  if (result.success) {
    throw new Error('Expected the schema to reject the input')
  }
  return ValidationUtil.formatZodError(result.error)
}

describe('CreateLookupDto', () => {
  it('normalizes car and motorcycle plates', () => {
    expect(CreateLookupDtoSchema.parse({ plate: ' klm-482 ' })).toEqual({ plate: 'KLM482' })
    expect(CreateLookupDtoSchema.parse({ plate: 'abc 12d' })).toEqual({ plate: 'ABC12D' })
  })

  it('keeps only the digits of the owner document', () => {
    expect(CreateLookupDtoSchema.parse({ plate: 'JTR915', ownerDocument: '43.876.512' })).toEqual({
      plate: 'JTR915',
      ownerDocument: '43876512',
    })
  })

  it('treats an empty owner document as missing (plate_only)', () => {
    expect(CreateLookupDtoSchema.parse({ plate: 'JTR915', ownerDocument: '  ' })).toEqual({
      plate: 'JTR915',
    })
  })

  it('rejects malformed plates with a Spanish message', () => {
    for (const plate of ['KL482', '1234AB', 'ABCD12', '']) {
      expect(errorMessageOf(CreateLookupDtoSchema, { plate })).toBe(
        'Placa inválida: usa el formato ABC123 (carro) o ABC12D (moto).',
      )
    }
  })

  it('requires the plate', () => {
    expect(errorMessageOf(CreateLookupDtoSchema, {})).toBe('La placa es obligatoria.')
  })

  it('rejects owner documents with the wrong length', () => {
    expect(errorMessageOf(CreateLookupDtoSchema, { plate: 'KLM482', ownerDocument: '123' })).toBe(
      'La cédula debe tener entre 5 y 10 dígitos.',
    )
  })

  it('rejects unknown properties (.strict)', () => {
    expect(errorMessageOf(CreateLookupDtoSchema, { plate: 'KLM482', mode: 'full' })).toBe(
      'Campo no permitido: mode.',
    )
  })
})

describe('UpdateOfferCalcDto', () => {
  it('accepts partial updates of inputs and tag', () => {
    expect(UpdateOfferCalcDtoSchema.parse({ repairCosts: 1_500_000 })).toEqual({
      repairCosts: 1_500_000,
    })
    expect(UpdateOfferCalcDtoSchema.parse({ dealTag: 'negotiating' })).toEqual({
      dealTag: 'negotiating',
    })
  })

  it('requires at least one field', () => {
    expect(errorMessageOf(UpdateOfferCalcDtoSchema, {})).toBe(
      'Envía al menos un campo para actualizar.',
    )
  })

  it('rejects negative and non-integer peso amounts', () => {
    expect(errorMessageOf(UpdateOfferCalcDtoSchema, { transferCost: -1 })).toBe(
      'El traspaso no puede ser negativo.',
    )
    expect(errorMessageOf(UpdateOfferCalcDtoSchema, { marketValue: 1000.5 })).toBe(
      'El valor de mercado debe ser un valor entero en pesos.',
    )
    expect(errorMessageOf(UpdateOfferCalcDtoSchema, { repairCosts: '200000' })).toBe(
      'Los arreglos debe ser un número.',
    )
  })

  it('caps the target margin at 50 %', () => {
    expect(errorMessageOf(UpdateOfferCalcDtoSchema, { targetMarginPercent: 60 })).toBe(
      'El margen objetivo no puede superar el 50 %.',
    )
  })

  it('rejects unknown tags and unknown properties', () => {
    expect(errorMessageOf(UpdateOfferCalcDtoSchema, { dealTag: 'vendido' })).toBe(
      'Etiqueta comercial no válida.',
    )
    expect(errorMessageOf(UpdateOfferCalcDtoSchema, { maxOffer: 1 })).toBe(
      'Campo no permitido: maxOffer.',
    )
  })
})

describe('FindDealsQueryDto', () => {
  it('accepts an empty query and normalizes the plate fragment', () => {
    expect(FindDealsQueryDtoSchema.parse({})).toEqual({})
    expect(FindDealsQueryDtoSchema.parse({ plate: 'kl', dealTag: '' })).toEqual({ plate: 'KL' })
  })

  it('coerces the limit from the query string', () => {
    expect(FindDealsQueryDtoSchema.parse({ dealTag: 'bought', limit: '10' })).toEqual({
      dealTag: 'bought',
      limit: 10,
    })
  })

  it('rejects invalid tags, limits and unknown params', () => {
    expect(errorMessageOf(FindDealsQueryDtoSchema, { dealTag: 'vendido' })).toBe(
      'Etiqueta comercial no válida.',
    )
    expect(errorMessageOf(FindDealsQueryDtoSchema, { limit: '0' })).toBe('El límite mínimo es 1.')
    expect(errorMessageOf(FindDealsQueryDtoSchema, { page: '2' })).toBe('Campo no permitido: page.')
  })
})

describe('PlateParamDto', () => {
  it('normalizes the route param and rejects invalid plates', () => {
    expect(PlateParamDtoSchema.parse({ plate: 'bxz304' })).toEqual({ plate: 'BXZ304' })
    expect(PlateParamDtoSchema.safeParse({ plate: 'BXZ30' }).success).toBe(false)
  })
})

const buildImage = (type: string, size: number): File =>
  new File([new Uint8Array(size)], 'tarjeta.jpg', { type })

describe('ExtractPropertyCardDto', () => {
  it('accepts a photo', () => {
    const image = buildImage('image/jpeg', 2_048)
    expect(ExtractPropertyCardDtoSchema.parse({ image })).toEqual({ image })
  })

  it('rejects missing, empty, oversized and non-image files', () => {
    expect(errorMessageOf(ExtractPropertyCardDtoSchema, {})).toBe(
      'Adjunta la foto de la tarjeta de propiedad.',
    )
    expect(
      errorMessageOf(ExtractPropertyCardDtoSchema, { image: buildImage('image/png', 0) }),
    ).toBe('La imagen está vacía.')
    expect(
      errorMessageOf(ExtractPropertyCardDtoSchema, {
        image: buildImage('image/png', 10 * 1024 * 1024 + 1),
      }),
    ).toBe('La imagen supera el máximo de 10 MB.')
    expect(
      errorMessageOf(ExtractPropertyCardDtoSchema, { image: buildImage('text/plain', 10) }),
    ).toBe('Formato no soportado: usa una foto JPG, PNG, WEBP o HEIC.')
  })
})
