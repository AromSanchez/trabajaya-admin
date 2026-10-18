import { useCallback, useEffect, useRef, useState } from 'react'
import { listarTecnicos } from '../services/admin'
import type {
  EstadoVerificacion,
  Oficio,
  OrdenTecnicos,
  Tecnico,
} from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

export type FiltroEstado = EstadoVerificacion | 'todos'

const RETRASO_BUSQUEDA = 350

interface EstadoTecnicos {
  estado: FiltroEstado
  oficio: Oficio | 'todos'
  nombre: string
  orden: OrdenTecnicos
  tecnicos: Tecnico[]
  cargando: boolean
  error: string | null
  hayFiltros: boolean
  cambiarEstado: (estado: FiltroEstado) => void
  cambiarOficio: (oficio: Oficio | 'todos') => void
  cambiarNombre: (nombre: string) => void
  cambiarOrden: (orden: OrdenTecnicos) => void
  limpiarFiltros: () => void
  recargar: () => void
}

export function useTecnicos(): EstadoTecnicos {
  const [estado, setEstado] = useState<FiltroEstado>('todos')
  const [oficio, setOficio] = useState<Oficio | 'todos'>('todos')
  const [nombre, setNombre] = useState('')
  const [orden, setOrden] = useState<OrdenTecnicos>('recientes')
  const [nombreBuscado, setNombreBuscado] = useState('')
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const buscadoRef = useRef(nombreBuscado)

  useEffect(() => {
    buscadoRef.current = nombreBuscado
  }, [nombreBuscado])

  // Búsqueda con retardo: no dispara una petición por cada tecla.
  useEffect(() => {
    const limpio = nombre.trim()
    const id = window.setTimeout(() => {
      if (buscadoRef.current === limpio) return
      setCargando(true)
      setError(null)
      setNombreBuscado(limpio)
    }, RETRASO_BUSQUEDA)
    return () => window.clearTimeout(id)
  }, [nombre])

  const cambiarEstado = useCallback((nuevo: FiltroEstado) => {
    setCargando(true)
    setError(null)
    setEstado(nuevo)
  }, [])

  const cambiarOficio = useCallback((nuevo: Oficio | 'todos') => {
    setCargando(true)
    setError(null)
    setOficio(nuevo)
  }, [])

  const cambiarNombre = useCallback((nuevo: string) => setNombre(nuevo), [])

  const cambiarOrden = useCallback((nuevo: OrdenTecnicos) => {
    setCargando(true)
    setError(null)
    setOrden(nuevo)
  }, [])

  const limpiarFiltros = useCallback(() => {
    setCargando(true)
    setError(null)
    setEstado('todos')
    setOficio('todos')
    setNombre('')
    setNombreBuscado('')
    setOrden('recientes')
    setIntento((valor) => valor + 1)
  }, [])

  const recargar = useCallback(() => {
    setCargando(true)
    setError(null)
    setIntento((valor) => valor + 1)
  }, [])

  useEffect(() => {
    let activo = true

    listarTecnicos({
      estado: estado === 'todos' ? undefined : estado,
      oficio: oficio === 'todos' ? undefined : oficio,
      nombre: nombreBuscado || undefined,
      orden: orden === 'recientes' ? undefined : orden,
    })
      .then((datos) => {
        if (activo) setTecnicos(datos)
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
  }, [estado, oficio, nombreBuscado, orden, intento])

  const hayFiltros =
    estado !== 'todos' ||
    oficio !== 'todos' ||
    nombreBuscado !== '' ||
    orden !== 'recientes'

  return {
    estado,
    oficio,
    nombre,
    orden,
    tecnicos,
    cargando,
    error,
    hayFiltros,
    cambiarEstado,
    cambiarOficio,
    cambiarNombre,
    cambiarOrden,
    limpiarFiltros,
    recargar,
  }
}
