import { useCallback, useEffect, useState } from 'react'
import { obtenerReporte } from '../services/admin'
import type { Reporte } from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

interface EstadoReporteDetalle {
  reporte: Reporte | null
  cargando: boolean
  error: string | null
  recargar: () => void
}

export function useReporteDetalle(id?: string): EstadoReporteDetalle {
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const recargar = useCallback(() => {
    setCargando(true)
    setError(null)
    setIntento((valor) => valor + 1)
  }, [])

  useEffect(() => {
    if (!id) return
    let activo = true

    obtenerReporte(id)
      .then((datos) => {
        if (activo) {
          setReporte(datos)
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
  }, [id, intento])

  return { reporte, cargando, error, recargar }
}
