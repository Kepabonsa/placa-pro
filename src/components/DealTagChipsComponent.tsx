// Author: Kevin Pabón
'use client'

// external imports
import { cn } from 'cn'

// internal imports
import { DEAL_TAG_LABELS, DEAL_TAGS } from '@/constants/domain'
import type { DealTag } from '@/constants/domain'

interface DealTagChipsComponentPropsInterface {
  value: DealTag | null
  onChange: (value: DealTag | null) => void
  label: string
  allowAll?: boolean
  disabled?: boolean
}

/** Commercial tag chips, used as selector (report) and as filter (history). */
export function DealTagChipsComponent({
  value,
  onChange,
  label,
  allowAll = false,
  disabled = false,
}: DealTagChipsComponentPropsInterface): React.JSX.Element {
  const options: Array<{ value: DealTag | null; label: string }> = [
    ...(allowAll ? [{ value: null, label: 'Todos' }] : []),
    ...DEAL_TAGS.map((tag) => ({ value: tag, label: DEAL_TAG_LABELS[tag] })),
  ]

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = option.value === value
        return (
          <button
            key={option.value ?? 'all'}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-10 rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-50',
              isSelected
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'bg-card text-foreground hover:bg-muted',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
