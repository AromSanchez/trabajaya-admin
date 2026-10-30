import type { ReactNode } from 'react'

interface ConClase {
  className?: string
}

/** Mini línea para tendencias dentro de una tarjeta. */
export function Sparkline({
  datos,
  ancho = 96,
  alto = 34,
  className = 'text-primary',
  relleno = true,
}: {
  datos: number[]
  ancho?: number
  alto?: number
  className?: string
  relleno?: boolean
}) {
  if (datos.length < 2) {
    return <div style={{ width: ancho, height: alto }} aria-hidden="true" />
  }

  const max = Math.max(...datos)
  const min = Math.min(...datos)
  const rango = max - min || 1
  const pad = 3

  const puntos = datos.map((valor, indice) => {
    const x = (indice / (datos.length - 1)) * ancho
    const y = alto - pad - ((valor - min) / rango) * (alto - pad * 2)
    return [x, y] as const
  })

  const linea = puntos
    .map(([x, y], indice) => `${indice === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const area = `${linea} L${ancho} ${alto} L0 ${alto} Z`
  const idGradiente = `spark-${datos.length}-${Math.round(max)}-${Math.round(min)}`

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      width={ancho}
      height={alto}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {relleno && (
        <>
          <defs>
            <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${idGradiente})`} />
        </>
      )}
      <path
        d={linea}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export interface SerieLinea {
  nombre: string
  colorVar: string
  datos: number[]
  punteada?: boolean
  mostrarPuntos?: boolean
  relleno?: boolean
}

/** Gráfico de líneas multi-serie con ejes y etiquetas. */
export function LineChart({
  series,
  etiquetas,
  alto = 220,
  className,
}: {
  series: SerieLinea[]
  etiquetas: string[]
  alto?: number
  className?: string
}) {
  const ancho = 720
  const margen = { arriba: 12, derecha: 12, abajo: 26, izquierda: 30 }
  const anchoUtil = ancho - margen.izquierda - margen.derecha
  const altoUtil = alto - margen.arriba - margen.abajo
  const total = etiquetas.length

  const maxCrudo = Math.max(1, ...series.flatMap((serie) => serie.datos))
  const paso = maxCrudo > 20 ? 10 : maxCrudo > 10 ? 5 : 2
  const max = Math.ceil(maxCrudo / paso) * paso
  const ticksY = Array.from(
    { length: max / paso + 1 },
    (_, indice) => indice * paso,
  )

  const x = (indice: number) =>
    margen.izquierda +
    (total <= 1 ? anchoUtil / 2 : (indice / (total - 1)) * anchoUtil)
  const y = (valor: number) =>
    margen.arriba + altoUtil - (valor / max) * altoUtil

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      className={`w-full ${className ?? ''}`}
      role="img"
      aria-label="Registros y verificaciones por semana"
    >
      {ticksY.map((tick) => (
        <g key={tick}>
          <line
            x1={margen.izquierda}
            x2={ancho - margen.derecha}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--color-line)"
            strokeWidth={1}
          />
          <text
            x={margen.izquierda - 8}
            y={y(tick) + 4}
            textAnchor="end"
            fontSize={11}
            fill="var(--color-ink-3)"
          >
            {tick}
          </text>
        </g>
      ))}

      {etiquetas.map((etiqueta, indice) => (
        <text
          key={`${etiqueta}-${indice}`}
          x={x(indice)}
          y={alto - 8}
          textAnchor="middle"
          fontSize={11}
          fill="var(--color-ink-3)"
        >
          {etiqueta}
        </text>
      ))}

      {series.map((serie, indiceSerie) => {
        const d = serie.datos
          .map(
            (valor, indice) =>
              `${indice === 0 ? 'M' : 'L'}${x(indice).toFixed(1)} ${y(valor).toFixed(1)}`,
          )
          .join(' ')
        const ultimo = serie.datos.length - 1
        const idRelleno = `linea-relleno-${indiceSerie}-${total}`
        return (
          <g key={serie.nombre}>
            {serie.relleno && ultimo >= 0 && (
              <>
                <defs>
                  <linearGradient id={idRelleno} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={serie.colorVar} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={serie.colorVar} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${d} L${x(ultimo).toFixed(1)} ${(margen.arriba + altoUtil).toFixed(1)} L${x(0).toFixed(1)} ${(margen.arriba + altoUtil).toFixed(1)} Z`}
                  fill={`url(#${idRelleno})`}
                />
              </>
            )}
            <path
              d={d}
              fill="none"
              stroke={serie.colorVar}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={serie.punteada ? '5 5' : undefined}
            />
            {serie.mostrarPuntos &&
              serie.datos.map((valor, indice) =>
                indice === ultimo ? null : (
                  <circle
                    key={indice}
                    cx={x(indice)}
                    cy={y(valor)}
                    r={3}
                    fill="var(--color-surface)"
                    stroke={serie.colorVar}
                    strokeWidth={2}
                  />
                ),
              )}
            {ultimo >= 0 && (
              <circle
                cx={x(ultimo)}
                cy={y(serie.datos[ultimo])}
                r={4.5}
                fill={serie.colorVar}
                stroke="var(--color-surface)"
                strokeWidth={2.5}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Gráfico de barras vertical para series semanales. */
export function BarChart({
  datos,
  etiquetas,
  alto = 200,
  colorVar = 'var(--color-chart-2)',
  colorPicoVar = 'var(--color-chart-1)',
  resaltarPico = false,
}: {
  datos: number[]
  etiquetas: string[]
  alto?: number
  colorVar?: string
  colorPicoVar?: string
  resaltarPico?: boolean
}) {
  const ancho = 480
  const margen = { arriba: 20, derecha: 8, abajo: 24, izquierda: 22 }
  const anchoUtil = ancho - margen.izquierda - margen.derecha
  const altoUtil = alto - margen.arriba - margen.abajo
  const max = Math.max(1, ...datos)
  const total = datos.length
  const espacio = anchoUtil / Math.max(total, 1)
  const anchoBarra = Math.min(26, espacio * 0.55)
  const indicePico = datos.indexOf(max)

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      className="w-full"
      role="img"
      aria-label="Serie semanal"
    >
      <line
        x1={margen.izquierda}
        x2={ancho - margen.derecha}
        y1={alto - margen.abajo}
        y2={alto - margen.abajo}
        stroke="var(--color-line)"
        strokeWidth={1}
      />
      {datos.map((valor, indice) => {
        const altura = (valor / max) * altoUtil
        const centro = margen.izquierda + espacio * indice + espacio / 2
        const x = centro - anchoBarra / 2
        const y = alto - margen.abajo - altura
        const esPico = resaltarPico && indice === indicePico
        return (
          <g key={indice}>
            <rect
              x={x}
              y={y}
              width={anchoBarra}
              height={Math.max(altura, valor > 0 ? 3 : 0)}
              rx={4}
              fill={esPico ? colorPicoVar : colorVar}
              fillOpacity={resaltarPico && !esPico ? 0.45 : 1}
            />
            <text
              x={centro}
              y={alto - 8}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-ink-3)"
            >
              {etiquetas[indice]}
            </text>
            {valor > 0 && (
              <text
                x={centro}
                y={y - 5}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="var(--color-ink-2)"
              >
                {valor}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export interface ItemBarra {
  etiqueta: string
  total: number
  porcentaje: number
}

/** Lista de barras horizontales con conteo y porcentaje. */
export function BarList({
  items,
  colorClass = 'bg-chart-1',
  mostrarPorcentaje = true,
}: {
  items: ItemBarra[]
  colorClass?: string
  mostrarPorcentaje?: boolean
} & ConClase) {
  const max = Math.max(1, ...items.map((item) => item.total))

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.etiqueta}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-ink">
              {item.etiqueta}
            </span>
            <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
              <span className="font-semibold text-ink">{item.total}</span>
              {mostrarPorcentaje && (
                <span className="w-11 text-right text-ink-3">
                  {item.porcentaje}%
                </span>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full ${colorClass} transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]`}
              style={{ width: `${Math.max((item.total / max) * 100, 3)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Contenedor de sección/tarjeta con cabecera opcional. */
export function Panel({
  titulo,
  descripcion,
  accion,
  children,
  className,
  plano = false,
}: {
  titulo?: string
  descripcion?: string
  accion?: ReactNode
  children: ReactNode
  className?: string
  plano?: boolean
}) {
  return (
    <section
      className={`${plano ? '' : 'rounded-2xl bg-surface'} ${className ?? ''}`}
    >
      {(titulo || accion) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6 pb-2">
          <div className="min-w-0">
            {titulo && (
              <h3 className="font-display text-base font-semibold text-ink">
                {titulo}
              </h3>
            )}
            {descripcion && (
              <p className="mt-0.5 text-sm text-ink-2">{descripcion}</p>
            )}
          </div>
          {accion}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  )
}
