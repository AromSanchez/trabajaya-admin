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

export const OFICIOS = [
  'gasfiteria',
  'electricidad',
  'carpinteria',
  'albanileria',
  'pintura',
] as const

export type Oficio = (typeof OFICIOS)[number]

export const ORDENES_TECNICOS = [
  'recientes',
  'antiguos',
  'experiencia',
  'servicios',
  'calificacion',
  'nombre',
] as const

export type OrdenTecnicos = (typeof ORDENES_TECNICOS)[number]

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

export interface FiltrosTecnicos {
  estado?: EstadoVerificacion
  oficio?: Oficio
  nombre?: string
  orden?: OrdenTecnicos
}

export async function listarTecnicos(
  filtros: FiltrosTecnicos = {},
): Promise<Tecnico[]> {
  const params: Record<string, string> = {}
  if (filtros.estado) params.estado = filtros.estado
  if (filtros.oficio) params.oficio = filtros.oficio
  if (filtros.nombre) params.nombre = filtros.nombre
  if (filtros.orden) params.orden = filtros.orden

  const { data } = await api.get<TecnicosResponse>('/admin/tecnicos', { params })
  return data.data.tecnicos
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

export interface CancelacionTardia {
  usuarioId: number
  rol: 'cliente' | 'tecnico'
  nombre: string
  email: string
  cancelacionesTardias: number
}

interface CancelacionesTardiasResponse {
  data: {
    usuarios: CancelacionTardia[]
  }
}

export async function listarCancelacionesTardias(): Promise<
  CancelacionTardia[]
> {
  const { data } = await api.get<CancelacionesTardiasResponse>(
    '/admin/cancelaciones-tardias',
  )
  return data.data.usuarios
}

export type EstadoDocumentosCola = 'completos' | 'faltan'

export interface ColaRevisionItem {
  id: number
  nombre: string
  oficio: string
  distrito: string
  diasEsperando: number
  estadoDocumentos: EstadoDocumentosCola
  faltantes: string[]
  documentosEnviadosAt: string
}

export interface EstadoConteo {
  estado: EstadoVerificacion
  total: number
  porcentaje: number
}

export interface MotivoConteo {
  categoria: CategoriaReporte
  total: number
  porcentaje: number
}

export interface OficioConteo {
  oficio: string
  total: number
  porcentaje: number
}

export interface RegistroSemana {
  semanaInicio: string
  registrosNuevos: number
  verificados: number
}

export interface CancelacionSemana {
  semanaInicio: string
  total: number
}

export interface MetricasDashboard {
  generadoEn: string
  prioridadHoy: {
    tecnicosEnEspera: number
    masAntiguoDias: number
  }
  tarjetas: {
    reportesAbiertos: { total: number; vsSemanaPasada: number; masDe48h: number }
    tecnicosTotales: { total: number; nuevosSemana: number }
    verificados: {
      total: number
      nuevosSemana: number
      porcentajeDelTotal: number
    }
    enRevision: { total: number; vsSemanaPasada: number }
  }
  registrosVerificaciones: { semanas: number; serie: RegistroSemana[] }
  tecnicosPorEstado: { total: number; estados: EstadoConteo[] }
  reportesPorMotivo: { dias: number; total: number; motivos: MotivoConteo[] }
  cancelacionesTardiasSemanales: {
    semanas: number
    serie: CancelacionSemana[]
    pico: number
  }
  tecnicosPorOficio: { total: number; oficios: OficioConteo[] }
  tiempoVerificacion: {
    promedioHoras: number | null
    vsMesPasadoPorcentaje: number | null
  }
  colaRevision: { tecnicos: ColaRevisionItem[] }
}

export interface ParametrosMetricas {
  semanasRegistros?: number
  semanasCancelaciones?: number
  diasReportes?: number
  limitCola?: number
}

interface MetricasDashboardResponse {
  data: MetricasDashboard
}

export async function obtenerMetricasDashboard(
  parametros: ParametrosMetricas = {},
): Promise<MetricasDashboard> {
  const params: Record<string, number> = {}
  if (parametros.semanasRegistros) {
    params.semanas_registros = parametros.semanasRegistros
  }
  if (parametros.semanasCancelaciones) {
    params.semanas_cancelaciones = parametros.semanasCancelaciones
  }
  if (parametros.diasReportes) params.dias_reportes = parametros.diasReportes
  if (parametros.limitCola) params.limit_cola = parametros.limitCola

  const { data } = await api.get<MetricasDashboardResponse>(
    '/admin/metricas/dashboard',
    { params },
  )
  return data.data
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
