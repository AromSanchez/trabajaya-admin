import type { ReactNode } from 'react'

interface MetricGroupProps {
  children: ReactNode
  columnas?: 3 | 4
  etiqueta: string
  className?: string
}

export default function MetricGroup({ children, columnas = 3, etiqueta, className = '' }: MetricGroupProps) {
  return (
    <section aria-label={etiqueta} className={`metric-group metric-group-${columnas} ${className}`}>
      {children}
    </section>
  )
}
