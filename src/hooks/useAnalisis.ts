import { useEffect, useState } from 'react'
import { obtenerMetricasDashboard, obtenerMetricasMonetizacion } from '../services/admin'
import { obtenerMensajeError } from '../services/errors'
import { diferenciaMeses } from '../lib/periodo'
import { normalizarAnalisis, rangoReferencia, type ConfiguracionAnalisis, type FilaAnalisis, type RangoAnalisis } from '../lib/analisis'

interface ResultadoAnalisis { clave: string; estudio: FilaAnalisis[]; referencia: FilaAnalisis[]; avisos: string[] }

export function useAnalisis(config: ConfiguracionAnalisis) {
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null)
  const [intento, setIntento] = useState(0)
  const inicio = config.rango.inicio
  const fin = config.rango.fin
  const referencia = rangoReferencia(config)
  const refInicio = referencia?.inicio
  const refFin = referencia?.fin
  const clave = `${inicio}|${fin}|${refInicio ?? ''}|${refFin ?? ''}|${intento}`

  useEffect(() => {
    let activo = true
    async function cargar(rango: RangoAnalisis, nombre: string) {
      // The API accepts 2–12 months; a single month is selected from a 2-month response.
      const params = { mes: rango.fin, meses: Math.max(2, diferenciaMeses(rango.inicio, rango.fin)) }
      const [actividad, ingresos] = await Promise.allSettled([obtenerMetricasDashboard(params), obtenerMetricasMonetizacion(params)])
      const avisos: string[] = []
      if (actividad.status === 'rejected') avisos.push(`${nombre} · actividad: ${obtenerMensajeError(actividad.reason)}`)
      else if (!Array.isArray(actividad.value.seriesMensuales?.serie)) avisos.push(`${nombre}: el servidor no entregó el historial mensual de actividad.`)
      if (ingresos.status === 'rejected') avisos.push(`${nombre} · ingresos: ${obtenerMensajeError(ingresos.reason)}`)
      else if (!Array.isArray(ingresos.value.ingresosMensuales?.serie)) avisos.push(`${nombre}: el servidor no entregó el historial mensual de ingresos.`)
      return { filas: normalizarAnalisis(rango, actividad.status === 'fulfilled' ? actividad.value : null, ingresos.status === 'fulfilled' ? ingresos.value : null), avisos }
    }
    const estudio = cargar({ inicio, fin }, 'Periodo de estudio')
    const referencia = refInicio && refFin ? (refInicio === inicio && refFin === fin ? estudio : cargar({ inicio: refInicio, fin: refFin }, 'Referencia')) : Promise.resolve({ filas: [], avisos: [] })
    void Promise.all([estudio, referencia]).then(([a, b]) => {
      if (activo) setResultado({ clave, estudio: a.filas, referencia: b.filas, avisos: [...new Set([...a.avisos, ...b.avisos])] })
    })
    return () => { activo = false }
  }, [clave, inicio, fin, refInicio, refFin])

  return {
    cargando: resultado?.clave !== clave,
    estudio: resultado?.clave === clave ? resultado.estudio : [],
    referencia: resultado?.clave === clave ? resultado.referencia : [],
    avisos: resultado?.clave === clave ? resultado.avisos : [],
    recargar: () => setIntento((valor) => valor + 1),
  }
}
