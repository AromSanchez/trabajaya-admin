import { useCallback, useEffect, useState } from 'react'
import {
  obtenerMetricasDashboard,
  obtenerMetricasMonetizacion,
} from '../services/admin'
import type {
  MetricasDashboard,
  MetricasMonetizacion,
} from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

interface EstadoDashboard {
  metricas: MetricasDashboard | null
  monetizacion: MetricasMonetizacion | null
  cargando: boolean
  error: string | null
  errorMonetizacion: string | null
  recargar: () => void
}

export function useDashboard(): EstadoDashboard {
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null)
  const [monetizacion, setMonetizacion] = useState<MetricasMonetizacion | null>(
    null,
  )
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorMonetizacion, setErrorMonetizacion] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const recargar = useCallback(() => {
    setCargando(true)
    setError(null)
    setErrorMonetizacion(null)
    setIntento((valor) => valor + 1)
  }, [])

  useEffect(() => {
    let activo = true

    Promise.allSettled([
      obtenerMetricasDashboard(),
      obtenerMetricasMonetizacion(),
    ]).then(([resultadoDashboard, resultadoMonetizacion]) => {
      if (!activo) return

      if (resultadoDashboard.status === 'fulfilled') {
        setMetricas(resultadoDashboard.value)
        setError(null)
      } else {
        setError(obtenerMensajeError(resultadoDashboard.reason))
      }

      if (resultadoMonetizacion.status === 'fulfilled') {
        setMonetizacion(resultadoMonetizacion.value)
        setErrorMonetizacion(null)
      } else {
        setErrorMonetizacion(
          obtenerMensajeError(resultadoMonetizacion.reason),
        )
      }

      setCargando(false)
    })

    return () => {
      activo = false
    }
  }, [intento])

  return {
    metricas,
    monetizacion,
    cargando,
    error,
    errorMonetizacion,
    recargar,
  }
}
