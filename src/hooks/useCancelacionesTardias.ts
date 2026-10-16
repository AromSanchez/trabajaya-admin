import { useCallback, useEffect, useState } from 'react'
import { listarCancelacionesTardias } from '../services/admin'
import type { CancelacionTardia } from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

interface EstadoCancelaciones {
  usuarios: CancelacionTardia[]
  cargando: boolean
  error: string | null
  recargar: () => void
}

export function useCancelacionesTardias(): EstadoCancelaciones {
  const [usuarios, setUsuarios] = useState<CancelacionTardia[]>([])
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

    listarCancelacionesTardias()
      .then((datos) => {
        if (activo) {
          setUsuarios(datos)
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

  return { usuarios, cargando, error, recargar }
}
