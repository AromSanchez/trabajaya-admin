import { useCallback, useEffect, useState } from 'react'
import { obtenerMetricasDashboard } from '../services/admin'
import type { MetricasDashboard } from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

interface EstadoDashboard {
  metricas: MetricasDashboard | null
  cargando: boolean
  error: string | null
  recargar: () => void
}

export function useDashboard(): EstadoDashboard {
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const recargar = useCallback(() => {
    setCargando(true)
    setError(null)
    setIntento((valor) => valor + 1)
  }, [])

  useEffect(() => {
    let activo = true

    obtenerMetricasDashboard()
      .then((datos) => {
        if (activo) {
          setMetricas(datos)
          setError(null)
        }
      })
      .catch((err) => {
        if (activo) setError(obtenerMensajeError(err))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento])

  return { metricas, cargando, error, recargar }
}
