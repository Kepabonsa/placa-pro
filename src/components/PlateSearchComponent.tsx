// Author: Kevin Pabón
'use client'

// external imports
import type { FormEvent } from 'react'
import { Loader2Icon, SearchIcon } from 'lucide-react'

// internal imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QUERY_MODE_CREDIT_COSTS } from '@/constants/domain'

interface PlateSearchComponentPropsInterface {
  plate: string
  ownerDocument: string
  isSubmitting: boolean
  onPlateChange: (plate: string) => void
  onOwnerDocumentChange: (ownerDocument: string) => void
  onSubmit: () => void
}

/** Big plate input + optional owner document, built for one-handed use. */
export function PlateSearchComponent({
  plate,
  ownerDocument,
  isSubmitting,
  onPlateChange,
  onOwnerDocumentChange,
  onSubmit,
}: PlateSearchComponentPropsInterface): React.JSX.Element {
  const hasOwnerDocument = ownerDocument.trim() !== ''
  const costHint = hasOwnerDocument
    ? `Con cédula: consulta económica de ${QUERY_MODE_CREDIT_COSTS.full} créditos.`
    : `Solo placa: ${QUERY_MODE_CREDIT_COSTS.plate_only} créditos. Agrega la cédula y paga ${QUERY_MODE_CREDIT_COSTS.full}.`

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="plate" className="text-sm">
          Placa del vehículo
        </Label>
        <Input
          id="plate"
          name="plate"
          value={plate}
          onChange={(event) => onPlateChange(event.target.value.toUpperCase())}
          placeholder="ABC123"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          maxLength={8}
          aria-describedby="cost-hint"
          className="h-16 rounded-xl border-2 border-slate-900 bg-yellow-300 text-center font-mono text-3xl font-bold tracking-[0.3em] uppercase placeholder:text-slate-900/30 md:text-3xl"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="owner-document" className="text-sm">
          Cédula del propietario{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="owner-document"
          name="ownerDocument"
          value={ownerDocument}
          onChange={(event) => onOwnerDocumentChange(event.target.value)}
          placeholder="Ej. 1020456789"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={13}
          className="h-12 rounded-xl text-lg"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || plate.trim() === ''}
        className="h-14 rounded-xl text-base font-semibold"
      >
        {isSubmitting ? (
          <Loader2Icon className="size-5 animate-spin" aria-hidden />
        ) : (
          <SearchIcon className="size-5" aria-hidden />
        )}
        {isSubmitting ? 'Consultando…' : 'Validar vehículo'}
      </Button>
      <p id="cost-hint" className="-mt-1 text-center text-xs text-muted-foreground">
        {costHint} Si ya está en caché (24 h), no cobra.
      </p>
    </form>
  )
}
