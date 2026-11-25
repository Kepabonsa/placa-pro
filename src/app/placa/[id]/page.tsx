// Author: Kevin Pabón
// external imports
import type { Metadata } from 'next'

// internal imports
import { VehicleReportView } from '@/views/VehicleReportView'

export const metadata: Metadata = {
  title: 'Reporte',
}

export default function VehicleReportPage(): React.JSX.Element {
  return <VehicleReportView />
}
