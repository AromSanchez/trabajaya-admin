import { api } from './api'

export const ESTADOS_VERIFICACION = [
  'pendiente',
  'en_revision',
  'verificado',
  'observado',
  'rechazado',
  'suspendido',
] as const

export type EstadoVerificacion = (typeof ESTADOS_VERIFICACION)[number]

export interface Disponibilidad {
  dia: string
  desde: string
  hasta: string
}

export interface Tecnico {
  id: number
  estadoVerificacion: EstadoVerificacion
  oficio: string
  descripcion: string | null
  aniosExperiencia: number
  distritos: string[]
  disponibilidad: Disponibilidad[]
  documentosEnviadosAt: string | null
  createdAt: string
  usuario: {
    id: number
    email: string
    nombre: string
  }
}

interface TecnicosResponse {
  data: {
    tecnicos: Tecnico[]
  }
}

export interface Paginacion {
  page: number
  limit: number
  total: number
  total_paginas: number
}

export type EstadoReporte = 'pendiente' | 'resuelto' | 'descartado'
export type TipoObjetivo = 'tecnico' | 'cliente' | 'resena'
export type CategoriaReporte =
  | 'no_se_presento'
  | 'no_estaba'
  | 'trabajo_deficiente'
  | 'cobro_diferente'
  | 'comportamiento_inapropiado'
  | 'fraude'
  | 'contenido_inapropiado'
  | 'otro'

export interface ReporteObjetivo {
  tipo: TipoObjetivo
  id: number
  nombre?: string
  rol?: string
  calificacion?: number
  comentario?: string
}

export interface Reporte {
  id: number
  tipoObjetivo: TipoObjetivo
  categoria: CategoriaReporte
  comentario: string
  estado: EstadoReporte
  reportante: { id: number; nombre: string; rol: string }
  objetivo: ReporteObjetivo
  servicio: { id: number; estado: string }
  notaResolucion: string | null
  resueltoPor: { id: number; nombre: string } | null
  resueltoAt: string | null
  createdAt: string
  updatedAt: string
}

interface ReportesListadoResponse {
  data: {
    reportes: Reporte[]
    paginacion: Paginacion
  }
}

interface ReporteResponse {
  data: {
    reporte: Reporte
  }
}

export interface FiltrosReportes {
  estado?: EstadoReporte
  tipoObjetivo?: TipoObjetivo
  categoria?: CategoriaReporte
  page?: number
  limit?: number
}

export async function listarTecnicos(
  estado?: EstadoVerificacion,
): Promise<Tecnico[]> {
  const { data } = await api.get<TecnicosResponse>('/admin/tecnicos', {
    params: estado ? { estado } : undefined,
  })
  return data.data.tecnicos
}

export async function contarReportesPorEstado(estado: string): Promise<number> {
  const { data } = await api.get<ReportesListadoResponse>('/admin/reportes', {
    params: { estado, limit: 1 },
  })
  return data.data.paginacion.total
}

export async function listarReportes(
  filtros: FiltrosReportes = {},
): Promise<{ reportes: Reporte[]; paginacion: Paginacion }> {
  const params: Record<string, string | number> = {}
  if (filtros.estado) params.estado = filtros.estado
  if (filtros.tipoObjetivo) params.tipo_objetivo = filtros.tipoObjetivo
  if (filtros.categoria) params.categoria = filtros.categoria
  if (filtros.page) params.page = filtros.page
  if (filtros.limit) params.limit = filtros.limit

  const { data } = await api.get<ReportesListadoResponse>('/admin/reportes', {
    params,
  })
  return data.data
}

export async function obtenerReporte(id: number | string): Promise<Reporte> {
  const { data } = await api.get<ReporteResponse>(`/admin/reportes/${id}`)
  return data.data.reporte
}

export async function resolverReporte(
  id: number | string,
  payload: { estado: 'resuelto' | 'descartado'; nota: string },
): Promise<Reporte> {
  const { data } = await api.patch<ReporteResponse>(
    `/admin/reportes/${id}`,
    payload,
  )
  return data.data.reporte
}

export interface Resena {
  id: number
  servicioId: number
  calificacion: number
  comentario: string
  oculta: boolean
  motivoOcultamiento: string | null
  ocultadaAt: string | null
}

interface ResenaResponse {
  data: {
    resena: Resena
  }
}

export async function ocultarResena(
  id: number | string,
  motivo: string,
): Promise<Resena> {
  const { data } = await api.post<ResenaResponse>(
    `/admin/resenas/${id}/ocultar`,
    { motivo },
  )
  return data.data.resena
}

export interface MetricasDashboard {
  tecnicosPorEstado: Record<EstadoVerificacion, number>
  totalTecnicos: number
  reportesAbiertos: number
}

export async function obtenerMetricasDashboard(): Promise<MetricasDashboard> {
  const [tecnicos, reportesAbiertos] = await Promise.all([
    listarTecnicos(),
    contarReportesPorEstado('pendiente'),
  ])

  const tecnicosPorEstado = Object.fromEntries(
    ESTADOS_VERIFICACION.map((estado) => [estado, 0]),
  ) as Record<EstadoVerificacion, number>

  for (const tecnico of tecnicos) {
    if (tecnico.estadoVerificacion in tecnicosPorEstado) {
      tecnicosPorEstado[tecnico.estadoVerificacion] += 1
    }
  }

  return {
    tecnicosPorEstado,
    totalTecnicos: tecnicos.length,
    reportesAbiertos,
  }
}

export type EstadoDocumento = 'pendiente' | 'aprobado' | 'observado'

export interface Documento {
  id: number
  tipo: string
  formato: string
  nombreOriginal: string
  bytes: number
  estado: EstadoDocumento
  comentarioAdmin: string | null
  url: string
  createdAt: string
  updatedAt: string
}

export interface HistorialEntry {
  id: number
  estadoAnterior: EstadoVerificacion
  estadoNuevo: EstadoVerificacion
  comentario: string | null
  createdAt: string
  admin: {
    id: number
    nombre: string
    email: string
  }
}

export interface TecnicoDetalle extends Tecnico {
  documentos: Documento[]
  historial: HistorialEntry[]
}

interface TecnicoDetalleResponse {
  data: {
    tecnico: TecnicoDetalle
  }
}

interface DocumentoResponse {
  data: {
    documento: Documento
  }
}

interface TecnicoAccionResponse {
  data: {
    tecnico: {
      id: number
      estadoVerificacion: EstadoVerificacion
      usuario: Tecnico['usuario']
    }
  }
}

export async function obtenerTecnico(
  id: number | string,
): Promise<TecnicoDetalle> {
  const { data } = await api.get<TecnicoDetalleResponse>(`/admin/tecnicos/${id}`)
  return data.data.tecnico
}

export async function actualizarDocumento(
  tecnicoId: number | string,
  documentoId: number,
  payload: { estado: 'aprobado' | 'observado'; comentario?: string },
): Promise<Documento> {
  const { data } = await api.patch<DocumentoResponse>(
    `/admin/tecnicos/${tecnicoId}/documentos/${documentoId}`,
    payload,
  )
  return data.data.documento
}

async function accionTecnico(
  id: number | string,
  accion: 'aprobar' | 'observar' | 'rechazar',
  comentario?: string,
): Promise<TecnicoAccionResponse['data']['tecnico']> {
  const { data } = await api.post<TecnicoAccionResponse>(
    `/admin/tecnicos/${id}/${accion}`,
    comentario ? { comentario } : {},
  )
  return data.data.tecnico
}

export function aprobarTecnico(
  id: number | string,
  comentario?: string,
): Promise<TecnicoAccionResponse['data']['tecnico']> {
  return accionTecnico(id, 'aprobar', comentario)
}

export function observarTecnico(
  id: number | string,
  comentario?: string,
): Promise<TecnicoAccionResponse['data']['tecnico']> {
  return accionTecnico(id, 'observar', comentario)
}

export function rechazarTecnico(
  id: number | string,
  comentario?: string,
): Promise<TecnicoAccionResponse['data']['tecnico']> {
  return accionTecnico(id, 'rechazar', comentario)
}

export async function suspenderTecnico(
  id: number | string,
  motivo: string,
): Promise<TecnicoAccionResponse['data']['tecnico']> {
  const { data } = await api.post<TecnicoAccionResponse>(
    `/admin/tecnicos/${id}/suspender`,
    { motivo },
  )
  return data.data.tecnico
}

export async function reactivarTecnico(
  id: number | string,
  motivo: string,
): Promise<TecnicoAccionResponse['data']['tecnico']> {
  const { data } = await api.post<TecnicoAccionResponse>(
    `/admin/tecnicos/${id}/reactivar`,
    { motivo },
  )
  return data.data.tecnico
}
