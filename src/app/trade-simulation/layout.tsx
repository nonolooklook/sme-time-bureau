import { ReactNode } from 'react'
import { SimulationFetcherContextProvider } from '@/contexts/SimulationFetcherContext'

export default function RootLayout({ children }: { children: ReactNode }) {
  return <SimulationFetcherContextProvider>{children}</SimulationFetcherContextProvider>
}
