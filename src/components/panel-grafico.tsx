import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ */
/* Panel de gráfico con banda de título (diseño de Monetización)       */
/* ------------------------------------------------------------------ */

export interface FilaTooltipGrafico {
  color: string
  nombre: string
  texto: string
}

export function TooltipGrafico({
  activo,
  etiqueta,
  filas,
}: {
  activo: boolean
  etiqueta: string
  filas: FilaTooltipGrafico[]
}) {
  if (!activo || filas.length === 0) return null
  return (
    <div className="min-w-40 rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink">{etiqueta}</p>
      <ul className="mt-1.5 space-y-1">
        {filas.map((fila) => (
          <li key={fila.nombre} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: fila.color }}
                aria-hidden="true"
              />
              {fila.nombre}
            </span>
            <span className="font-semibold tabular-nums text-ink">{fila.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ALTO_PANELES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-64',
  md: 'h-72',
  lg: 'h-96',
}

export function PanelGrafico({
  titulo,
  descripcion,
  children,
  alto = 'md',
  extra,
  className = '',
}: {
  titulo: string
  descripcion: string
  children: ReactNode
  /** Altura del cuerpo del panel: sm=h-64, md=h-72 (por defecto), lg=h-96. */
  alto?: 'sm' | 'md' | 'lg'
  /** Nodo opcional a la derecha de la banda del título (ej. toggle de vista). */
  extra?: ReactNode
  /** Clases extra para el panel (ej. para colspan en una grilla). */
  className?: string
}) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-2xl bg-surface ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 pb-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink">{titulo}</h3>
          <p className="mt-0.5 text-xs text-ink-3">{descripcion}</p>
        </div>
        {extra}
      </div>
      <div className={`${ALTO_PANELES[alto]} px-4 pt-2 pb-5`}>{children}</div>
    </div>
  )
}
