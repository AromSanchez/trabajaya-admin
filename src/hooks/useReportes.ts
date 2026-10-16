import { useCallback, useEffect, useState } from 'react'
import { listarReportes } from '../services/admin'
import type {
  CategoriaReporte,
  EstadoReporte,
  FiltrosReportes,
  Paginacion,
  Reporte,
  TipoObjetivo,
} from '../services/admin'
import { obtenerMensajeError } from '../services/errors'

const LIMITE = 10

export interface FiltrosUI {
  estado: EstadoReporte | 'todos'
  tipoObjetivo: TipoObjetivo | 'todos'
  categoria: CategoriaReporte | 'todas'
}

const FILTROS_INICIALES: FiltrosUI = {
  estado: 'todos',
  tipoObjetivo: 'todos',
  categoria: 'todas',
}

interface EstadoReportes {
  reportes: Reporte[]
  paginacion: Paginacion | null
  cargando: boolean
  error: string | null
  filtros: FiltrosUI
  cambiarFiltros: (parcial: Partial<FiltrosUI>) => void
  irAPagina: (pagina: number) => void
  recargar: () => void
}

export function useReportes(): EstadoReportes {
  const [filtros, setFiltros] = useState<FiltrosUI>(FILTROS_INICIALES)
  const [page, setPage] = useState(1)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const cambiarFiltros = useCallback((parcial: Partial<FiltrosUI>) => {
    setFiltros((previo) => ({ ...previo, ...parcial }))
    setPage(1)
    setCargando(true)
    setError(null)
  }, [])

  const irAPagina = useCallback((nueva: number) => {
    setPage(nueva)
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
    const params: FiltrosReportes = { page, limit: LIMITE }
    if (filtros.estado !== 'todos') params.estado = filtros.estado
    if (filtros.tipoObjetivo !== 'todos')
      params.tipoObjetivo = filtros.tipoObjetivo
    if (filtros.categoria !== 'todas') params.categoria = filtros.categoria

    listarReportes(params)
      .then((data) => {
        if (activo) {
          setReportes(data.reportes)
          setPaginacion(data.paginacion)
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
  }, [filtros, page, intento])

  return {
    reportes,
    paginacion,
    cargando,
    error,
    filtros,
    cambiarFiltros,
    irAPagina,
    recargar,
  }
}
