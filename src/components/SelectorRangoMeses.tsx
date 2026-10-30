import { diferenciaMeses, mesActualISO, restarMeses } from '../lib/periodo'

/* ------------------------------------------------------------------ */
/* Selector de rango de meses (mes inicial / mes final)                */
/* ------------------------------------------------------------------ */

const LIMITE_MESES = 12

const claseInput =
  'rounded-lg border border-transparent bg-surface px-3 py-2 text-sm text-ink ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

const claseEtiqueta = 'text-xs font-semibold uppercase tracking-wider text-ink-3'

export function SelectorRangoMeses({
  mesInicio,
  mesFin,
  onChange,
}: {
  mesInicio: string
  mesFin: string
  onChange: (mesInicio: string, mesFin: string) => void
}) {
  const maximoMes = mesActualISO()

  const cambiarInicio = (valor: string) => {
    if (!valor) return
    if (valor > mesFin) {
      onChange(valor, valor)
    } else if (diferenciaMeses(valor, mesFin) > LIMITE_MESES) {
      // Recorta el fin hacia adelante: inicio + 11 meses
      onChange(valor, restarMeses(valor, -(LIMITE_MESES - 1)))
    } else {
      onChange(valor, mesFin)
    }
  }

  const cambiarFin = (valor: string) => {
    if (!valor) return
    if (valor < mesInicio) {
      onChange(valor, valor)
    } else if (diferenciaMeses(mesInicio, valor) > LIMITE_MESES) {
      // Recorta el inicio hacia atrás: fin - 11 meses
      onChange(restarMeses(valor, LIMITE_MESES - 1), valor)
    } else {
      onChange(mesInicio, valor)
    }
  }

  return (
    <div className="inline-flex flex-wrap items-center gap-2 text-sm text-ink-2">
      <span className={claseEtiqueta}>Periodo</span>
      <input
        type="month"
        value={mesInicio}
        max={maximoMes}
        onChange={(evento) => cambiarInicio(evento.target.value)}
        aria-label="Mes inicial del periodo"
        className={claseInput}
      />
      <span className="text-ink-3">–</span>
      <input
        type="month"
        value={mesFin}
        min={mesInicio < restarMeses(maximoMes, LIMITE_MESES - 1) ? undefined : restarMeses(maximoMes, LIMITE_MESES - 1)}
        max={maximoMes}
        onChange={(evento) => cambiarFin(evento.target.value)}
        aria-label="Mes final del periodo"
        className={claseInput}
      />
    </div>
  )
}
