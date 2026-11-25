// Author: Kevin Pabón
// external imports
import type { Metadata } from 'next'

// internal imports
import { HistoryView } from '@/views/HistoryView'

export const metadata: Metadata = {
  title: 'Historial',
}

export default function HistoryPage(): React.JSX.Element {
  return <HistoryView />
}
