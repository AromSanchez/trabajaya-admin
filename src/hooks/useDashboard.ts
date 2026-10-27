import { useCallback, useEffect, useState } from 'react'
import { diferenciaMeses } from '../lib/periodo'
import { obtenerMetricasDashboard } from '../services/admin'
import type { MetricasDashboard } from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

interface EstadoDashboard {
  metricas: MetricasDashboard | null
  cargando: boolean
  error: string | null
  recargar: () => void
}

export function useDashboard(mesInicio: string, mesFin: string): EstadoDashboard {
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

    // Meses del rango + 1 mes previo para el bloque "Comparación vs mes anterior";
    // tope de 12 meses cubiertos por el endpoint.
    const meses = Math.min(diferenciaMeses(mesInicio, mesFin) + 1, 12)

    obtenerMetricasDashboard({
      mes: mesFin,
      meses,
      semanasRegistros: 8,
      semanasCancelaciones: 8,
    })
      .then((resultado) => {
        if (!activo) return
        setMetricas(resultado)
        setError(null)
      })
      .catch((reason) => {
        if (!activo) return
        setError(obtenerMensajeError(reason))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [intento, mesInicio, mesFin])

  return {
    metricas,
    cargando,
    error,
    recargar,
  }
}