// Author: Kevin Pabón
'use client'

// external imports
import { cn } from 'cn'
import { OctagonXIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

// internal imports
import { CurrencyUtil } from '@/utils/CurrencyUtil'
import type { DealInterface } from '@/interfaces/DealInterface'
import { ErrorUtil } from '@/utils/ErrorUtil'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoneyInputComponent } from '@/components/MoneyInputComponent'
import { OFFER_ROUNDING_STEP } from '@/constants/domain'
import { OfferUtil } from '@/utils/OfferUtil'
import type { TrafficLightStatus } from '@/constants/domain'
import type { UpdateOfferCalcDto } from '@/dtos/UpdateOfferCalcDto'

interface OfferInputsInterface {
  marketValue: number
  transferCost: number
  repairCosts: number
  targetMarginPercent: number
}

interface OfferCalculatorComponentPropsInterface {
  deal: DealInterface
  fasecoldaValue: number
  trafficLight: TrafficLightStatus
  onSave: (changes: UpdateOfferCalcDto) => Promise<DealInterface>
}

const OFFER_INPUT_KEYS = [
  'marketValue',
  'transferCost',
  'repairCosts',
  'targetMarginPercent',
] as const
const MARGIN_PRESETS = [5, 10, 15, 20] as const
const SAVE_DELAY_MS = 700

const pickInputs = (deal: DealInterface): OfferInputsInterface => ({
  marketValue: deal.marketValue,
  transferCost: deal.transferCost,
  repairCosts: deal.repairCosts,
  targetMarginPercent: deal.targetMarginPercent,
})

const diffInputs = (
  current: OfferInputsInterface,
  saved: OfferInputsInterface,
): UpdateOfferCalcDto => {
  const changes: UpdateOfferCalcDto = {}
  for (const key of OFFER_INPUT_KEYS) {
    if (current[key] !== saved[key]) {
      changes[key] = current[key]
    }
  }
  return changes
}

/**
 * Live max offer calculator. The preview is computed locally with OfferUtil and the changes are
 * saved (debounced) through `onSave`; the server recalculates and persists the max offer.
 */
export function OfferCalculatorComponent({
  deal,
  fasecoldaValue,
  trafficLight,
  onSave,
}: OfferCalculatorComponentPropsInterface): React.JSX.Element {
  const [inputs, setInputs] = useState<OfferInputsInterface>(() => pickInputs(deal))
  const [savedInputs, setSavedInputs] = useState<OfferInputsInterface>(() => pickInputs(deal))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle')

  const calculation = OfferUtil.calculate({ ...inputs, detectedDebts: deal.detectedDebts })
  const hasPendingChanges = Object.keys(diffInputs(inputs, savedInputs)).length > 0
  const statusText =
    saveState === 'saving'
      ? 'Guardando…'
      : saveState === 'error'
        ? 'Sin guardar'
        : hasPendingChanges
          ? 'Editando…'
          : 'Guardado'

  useEffect(() => {
    const changes = diffInputs(inputs, savedInputs)
    if (Object.keys(changes).length === 0) {
      return
    }
    const timer = setTimeout(() => {
      setSaveState('saving')
      onSave(changes)
        .then((savedDeal) => {
          setSavedInputs(pickInputs(savedDeal))
          setSaveState('idle')
        })
        .catch((error: unknown) => {
          setSaveState('error')
          toast.error(ErrorUtil.getMessage(error))
        })
    }, SAVE_DELAY_MS)
    return (): void => clearTimeout(timer)
  }, [inputs, savedInputs, onSave])

  const updateInput = (key: keyof OfferInputsInterface, value: number): void => {
    setInputs((current) => ({ ...current, [key]: value }))
  }

  const breakdown = [
    { label: 'Valor de mercado', amount: inputs.marketValue, sign: '' },
    { label: 'Deudas detectadas (SIMIT + impuestos)', amount: deal.detectedDebts, sign: '−' },
    { label: 'Traspaso', amount: inputs.transferCost, sign: '−' },
    { label: 'Arreglos', amount: inputs.repairCosts, sign: '−' },
    {
      label: `Margen objetivo (${inputs.targetMarginPercent} %)`,
      amount: calculation.marginAmount,
      sign: '−',
    },
  ]

  return (
    <section
      aria-labelledby="offer-title"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <h2 id="offer-title" className="text-base font-semibold">
          Calculadora de oferta máxima
        </h2>
        <span
          className={cn(
            'text-xs',
            saveState === 'error' ? 'font-medium text-red-600' : 'text-muted-foreground',
          )}
          aria-live="polite"
        >
          {statusText}
        </span>
      </div>

      {trafficLight === 'red' ? (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900">
          <OctagonXIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          Semáforo rojo: no ofertes hasta resolver los puntos críticos.
        </p>
      ) : null}

      <div className="rounded-xl bg-slate-900 px-4 py-3 text-white">
        <p className="text-xs tracking-wide text-slate-300 uppercase">Ofrece como máximo</p>
        <p className="text-4xl font-extrabold tabular-nums" aria-live="polite">
          {CurrencyUtil.format(calculation.maxOffer)}
        </p>
        <p className={cn('text-xs', calculation.isViable ? 'text-slate-300' : 'text-amber-300')}>
          {calculation.isViable
            ? `Ganancia objetivo ${CurrencyUtil.format(calculation.marginAmount)}`
            : 'Con estos valores el negocio no deja margen.'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <MoneyInputComponent
          id="market-value"
          label="Valor de mercado"
          value={inputs.marketValue}
          onChange={(value) => updateInput('marketValue', value)}
        />
        {inputs.marketValue === fasecoldaValue ? (
          <p className="text-[11px] text-muted-foreground">Valor de referencia Fasecolda.</p>
        ) : (
          <button
            type="button"
            onClick={() => updateInput('marketValue', fasecoldaValue)}
            className="self-start text-[11px] font-medium text-slate-700 underline"
          >
            Usar valor Fasecolda ({CurrencyUtil.format(fasecoldaValue)})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MoneyInputComponent
          id="transfer-cost"
          label="Traspaso"
          value={inputs.transferCost}
          onChange={(value) => updateInput('transferCost', value)}
        />
        <MoneyInputComponent
          id="repair-costs"
          label="Arreglos"
          value={inputs.repairCosts}
          onChange={(value) => updateInput('repairCosts', value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="target-margin" className="text-xs text-muted-foreground">
          Margen objetivo (%)
        </Label>
        <div className="flex items-center gap-2">
          {MARGIN_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={inputs.targetMarginPercent === preset}
              onClick={() => updateInput('targetMarginPercent', preset)}
              className={cn(
                'h-11 flex-1 rounded-xl border text-sm font-semibold transition-colors',
                inputs.targetMarginPercent === preset
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'bg-card hover:bg-muted',
              )}
            >
              {preset}%
            </button>
          ))}
          <Input
            id="target-margin"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={inputs.targetMarginPercent}
            onChange={(event) => updateInput('targetMarginPercent', Number(event.target.value))}
            className="h-11 w-20 rounded-xl text-center text-base font-semibold"
          />
        </div>
      </div>

      <dl className="flex flex-col gap-1 border-t pt-3 text-sm">
        {breakdown.map((line) => (
          <div key={line.label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{line.label}</dt>
            <dd className="tabular-nums">
              {line.sign} {CurrencyUtil.format(line.amount)}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-3 border-t pt-2 font-semibold">
          <dt>Oferta máxima</dt>
          <dd className="tabular-nums">{CurrencyUtil.format(calculation.maxOffer)}</dd>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Redondeada hacia abajo a múltiplos de {CurrencyUtil.format(OFFER_ROUNDING_STEP)}.
        </p>
      </dl>
    </section>
  )
}
