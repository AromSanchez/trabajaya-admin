import { useCallback, useEffect, useState } from 'react'
import { listarTecnicos } from '../services/admin'
import type { EstadoVerificacion, Tecnico } from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

export type FiltroEstado = EstadoVerificacion | 'todos'

interface EstadoTecnicos {
  estado: FiltroEstado
  tecnicos: Tecnico[]
  cargando: boolean
  error: string | null
  cambiarEstado: (estado: FiltroEstado) => void
  recargar: () => void
}

export function useTecnicos(): EstadoTecnicos {
  const [estado, setEstado] = useState<FiltroEstado>('todos')
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const cambiarEstado = useCallback((nuevo: FiltroEstado) => {
    setEstado(nuevo)
    setCargando(true)
    setError(null)
  }, [])

  const recargar = useCallback(() => {
    setCargando(true)
    setError(null)
    setIntento((valor) => valor + 1)
  }, [])

  useEffect(() => {
    let activo = true

    listarTecnicos(estado === 'todos' ? undefined : estado)
      .then((datos) => {
        if (activo) {
          setTecnicos(datos)
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
  }, [estado, intento])

  return { estado, tecnicos, cargando, error, cambiarEstado, recargar }
}
