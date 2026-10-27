/* ------------------------------------------------------------------ */
/* Utilidades de meses en formato 'YYYY-MM'                            */
/* ------------------------------------------------------------------ */

/** Mes en formato 'YYYY-MM' (ej. '2026-10'). */
export type MesISO = string

const FORMATO_DIA = /^\d{4}-\d{2}$/

export function esMesValido(valor: unknown): valor is MesISO {
  return typeof valor === 'string' && FORMATO_DIA.test(valor)
}

function descomponer(mes: MesISO): { anio: number; mesIndex: number } {
  const [anioStr, mesStr] = mes.split('-')
  return { anio: parseInt(anioStr, 10), mesIndex: parseInt(mesStr, 10) - 1 }
}

function formatear(anio: number, mesIndex: number): MesISO {
  return `${anio}-${String(mesIndex + 1).padStart(2, '0')}`
}

/** El mes actual del sistema en 'YYYY-MM'. */
export function mesActualISO(): MesISO {
  const ahora = new Date()
  return formatear(ahora.getFullYear(), ahora.getMonth())
}

/** N meses antes (o después con negativo) de un mes dado. */
export function restarMeses(mes: MesISO, cantidad: number): MesISO {
  const { anio, mesIndex } = descomponer(mes)
  const total = anio * 12 + mesIndex - cantidad
  return formatear(Math.floor(total / 12), ((total % 12) + 12) % 12)
}

/** Cantidad de meses en el rango inclusivo: oct–oct = 1, ago–oct = 3.
 *  Si fin < inicio, devuelve 1 (un solo mes). */
export function diferenciaMeses(mesInicio: MesISO, mesFin: MesISO): number {
  const a = descomponer(mesInicio)
  const b = descomponer(mesFin)
  return Math.max(1, b.anio * 12 + b.mesIndex - (a.anio * 12 + a.mesIndex) + 1)
}

/** '2026-10' → 'octubre 2026'. */
export function nombreMes(mes: MesISO): string {
  if (!esMesValido(mes)) return mes
  const { anio, mesIndex } = descomponer(mes)
  const nombre = new Date(anio, mesIndex, 1).toLocaleDateString('es-PE', {
    month: 'long',
  })
  const capital = nombre.charAt(0).toUpperCase() + nombre.slice(1)
  return `${capital} ${anio}`
}

/** '2026-10' → 'oct. 2026' (para etiquetas de eje). */
export function nombreMesCorto(mes: MesISO): string {
  if (!esMesValido(mes)) return mes
  const { anio, mesIndex } = descomponer(mes)
  const nombre = new Date(anio, mesIndex, 1).toLocaleDateString('es-PE', {
    month: 'short',
  })
  return `${nombre.replace('.', '')} ${anio}`
}

/** Texto legible del rango: "octubre 2026" si es un mes,
 *  "agosto – octubre 2026" o "noviembre 2025 – febrero 2026" si abarca varios. */
export function rangoTexto(mesInicio: MesISO, mesFin: MesISO): string {
  if (!esMesValido(mesInicio) || !esMesValido(mesFin)) return '—'
  if (mesInicio === mesFin) return nombreMes(mesInicio).toLowerCase()
  const anioInicio = parseInt(mesInicio.slice(0, 4), 10)
  const anioFin = parseInt(mesFin.slice(0, 4), 10)
  if (anioInicio === anioFin) {
    const nombreInicio = nombreMes(mesInicio).split(' ')[0].toLowerCase()
    return `${nombreInicio} – ${nombreMes(mesFin).toLowerCase()}`
  }
  return `${nombreMes(mesInicio).toLowerCase()} – ${nombreMes(mesFin).toLowerCase()}`
}
