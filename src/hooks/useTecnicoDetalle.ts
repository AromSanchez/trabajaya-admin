import { useCallback, useEffect, useState } from 'react'
import { obtenerTecnico } from '../services/admin'
import type { TecnicoDetalle as TecnicoDetalleData } from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

interface EstadoTecnicoDetalle {
  tecnico: TecnicoDetalleData | null
  cargando: boolean
  error: string | null
  recargar: () => void
}

export function useTecnicoDetalle(id?: string): EstadoTecnicoDetalle {
  const [tecnico, setTecnico] = useState<TecnicoDetalleData | null>(null)
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

    obtenerTecnico(id)
      .then((datos) => {
        if (activo) {
          setTecnico(datos)
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

  return { tecnico, cargando, error, recargar }
}
