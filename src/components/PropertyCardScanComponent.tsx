// Author: Kevin Pabón
'use client'

// external imports
import { CameraIcon, Loader2Icon } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useRef } from 'react'

// internal imports
import { Button } from '@/components/ui/button'

interface PropertyCardScanComponentPropsInterface {
  isExtracting: boolean
  onFileSelected: (file: File) => void
}

/** Opens the camera or gallery to read the tarjeta de propiedad (plate + owner document). */
export function PropertyCardScanComponent({
  isExtracting,
  onFileSelected,
}: PropertyCardScanComponentPropsInterface): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    // Reset so the same photo can be selected again.
    event.target.value = ''
    if (file) {
      onFileSelected(file)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isExtracting}
        onClick={() => fileInputRef.current?.click()}
        className="h-14 w-full rounded-xl border-2 border-dashed text-base font-semibold"
      >
        {isExtracting ? (
          <Loader2Icon className="size-5 animate-spin" aria-hidden />
        ) : (
          <CameraIcon className="size-5" aria-hidden />
        )}
        {isExtracting ? 'Leyendo tarjeta…' : 'Subir/Escanear Tarjeta de Propiedad'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={handleChange}
      />
    </>
  )
}
