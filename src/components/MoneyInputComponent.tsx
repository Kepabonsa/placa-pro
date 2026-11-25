// Author: Kevin Pabón
'use client'

// internal imports
import { CurrencyUtil } from '@/utils/CurrencyUtil'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MoneyInputComponentPropsInterface {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
}

/** COP amount input with thousands separators and a numeric keyboard. */
export function MoneyInputComponent({
  id,
  label,
  value,
  onChange,
  hint,
}: MoneyInputComponentPropsInterface): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          $
        </span>
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={value === 0 ? '' : CurrencyUtil.formatDigits(value)}
          placeholder="0"
          onChange={(event) => onChange(CurrencyUtil.parse(event.target.value))}
          className="h-12 rounded-xl pl-7 text-right text-lg font-semibold tabular-nums"
        />
      </div>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
