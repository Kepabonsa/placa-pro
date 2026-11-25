// Author: Kevin Pabón
'use client'

// external imports
import { useEffect } from 'react'

// internal imports
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}): React.JSX.Element {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-lg font-semibold">Algo salió mal</p>
      <p className="text-sm text-muted-foreground">
        No pudimos mostrar esta pantalla. Intenta de nuevo.
      </p>
      <Button type="button" onClick={retry} className="h-12 w-full rounded-xl text-base">
        Reintentar
      </Button>
    </div>
  )
}
