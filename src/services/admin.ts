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

export interface EstadoServicioConteo {
  estado: string
  total: number
  porcentaje: number
}

export interface CompletadasSemana {
  semanaInicio: string
  completadas: number
}

export interface MetricasMarketplace {
  servicios: {
    total: number
    porEstado: EstadoServicioConteo[]
    tasaConversionCompletado: number
    evolucionCompletadasSemanal: { semanas: number; serie: CompletadasSemana[] }
    tiempoPromedioSolicitudAAceptacionHoras: number | null
    tiempoPromedioAceptacionACompletadoHoras: number | null
  }
  clientes: {
    total: number
    nuevosEstaSemana: number
    activos30Dias: number
    retencionDosOMasCompletados: number
  }
  calidad: {
    calificacionPromedioGeneral: number | null
    tasaResenas: number
    distribucionCalificaciones: { estrellas: number; total: number }[]
  }
  tecnicosActivos: {
    porcentajeVerificadosConServicio30Dias: number
    top5: { id: number; nombre: string; total: number }[]
  }
}

export interface CancelacionSemana {
  semanaInicio: string
  total: number
}

export interface SemanaDelMes {
  semanaInicio: string
  registrosNuevos: number
  verificados: number
  servicios: number
  completados: number
  cancelados: number
  expirados: number
  rechazados: number
  tasaConversion: number
  cancelacionesTardias: number
  clientesNuevos: number
  resenas: number
  calificacionPromedio: number
}

export interface RegistroMes {
  mes: string
  registros: number
  verificados: number
  servicios: number
  completados: number
  cancelados: number
  expirados: number
  rechazados: number
  tasaConversion: number
  cancelacionesTardias: number
  clientesNuevos: number
  resenas: number
  calificacionPromedio: number
}

export interface IngresosMes {
  mes: string
  ingresosCreditosMes: number
  ingresosMensualidadMes: number
  ingresosComisionesMes: number
  ingresosTotalMes: number
}

export interface ModeloMes {
  mes: string
  creditos: number
  mensualidad: number
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
  /** Bloque de métricas de marketplace; solo en backends con la amplicación de T15. */
  marketplace?: MetricasMarketplace
  /** Series mensuales (solo si se pidió ?meses=N con N>=2). */
  seriesMensuales?: { meses: number; serie: RegistroMes[] }
  semanalDelMes?: { semanas: number; serie: SemanaDelMes[] }
  periodo?: { seleccionado: string; anterior: string | null }
}

export interface ParametrosMetricas {
  semanasRegistros?: number
  semanasCancelaciones?: number
  diasReportes?: number
  limitCola?: number
  meses?: number
  mes?: string
}

interface MetricasDashboardResponse {
  data: MetricasDashboard
}

export async function obtenerMetricasDashboard(
  parametros: ParametrosMetricas = {},
): Promise<MetricasDashboard> {
  const params: Record<string, number | string> = {}
  if (parametros.semanasRegistros) {
    params.semanas_registros = parametros.semanasRegistros
  }
  if (parametros.semanasCancelaciones) {
    params.semanas_cancelaciones = parametros.semanasCancelaciones
  }
  if (parametros.diasReportes) params.dias_reportes = parametros.diasReportes
  if (parametros.limitCola) params.limit_cola = parametros.limitCola
  if (parametros.meses) params.meses = parametros.meses
  if (parametros.mes) params.mes = parametros.mes

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

export type TipoMonetizacion = 'creditos' | 'mensualidad'
export type TipoTransaccion =
  | 'compra_creditos'
  | 'activacion_plan'
  | 'descuento_credito'
  | 'comision_servicio'
  | 'cambio_modelo'

export interface MonetizacionTecnico {
  id: number
  tipo: TipoMonetizacion | null
  creditosRestantes: number
  planVenceAt: string | null
  paqueteId: string | null
  planId: string | null
  createdAt: string
  updatedAt: string
}

export interface TecnicoMonetizacion {
  id: number
  nombre: string
  email: string
  oficio: string
  monetizacion: MonetizacionTecnico
}

interface TecnicosMonetizacionResponse {
  data: {
    tecnicos: TecnicoMonetizacion[]
    paginacion: Paginacion
  }
}

export interface FiltrosMonetizacionTecnicos {
  tipo?: TipoMonetizacion
  orden?: 'recientes' | 'creditos' | 'vencimiento'
  page?: number
  limit?: number
}

export async function listarTecnicosMonetizacion(
  filtros: FiltrosMonetizacionTecnicos = {},
): Promise<{ tecnicos: TecnicoMonetizacion[]; paginacion: Paginacion }> {
  const params: Record<string, string | number> = {}
  if (filtros.tipo) params.tipo = filtros.tipo
  if (filtros.orden) params.orden = filtros.orden
  if (filtros.page) params.page = filtros.page
  if (filtros.limit) params.limit = filtros.limit

  const { data } = await api.get<TecnicosMonetizacionResponse>(
    '/admin/monetizacion/tecnicos',
    { params },
  )
  return data.data
}

export interface TransaccionMonetizacion {
  id: number
  tipo: TipoTransaccion
  monto: number | null
  creditos: number | null
  descripcion: string | null
  referenciaId: string | null
  createdAt: string
  tecnico: {
    id: number
    nombre: string
    email: string
  }
}

interface TransaccionesMonetizacionResponse {
  data: {
    transacciones: TransaccionMonetizacion[]
    paginacion: Paginacion
  }
}

export interface FiltrosTransaccionesMonetizacion {
  tecnicoId?: number
  tipoTransaccion?: TipoTransaccion
  desde?: string
  hasta?: string
  page?: number
  limit?: number
}

export async function listarTransaccionesMonetizacion(
  filtros: FiltrosTransaccionesMonetizacion = {},
): Promise<{ transacciones: TransaccionMonetizacion[]; paginacion: Paginacion }> {
  const params: Record<string, string | number> = {}
  if (filtros.tecnicoId) params.tecnicoId = filtros.tecnicoId
  if (filtros.tipoTransaccion) params.tipoTransaccion = filtros.tipoTransaccion
  if (filtros.desde) params.desde = filtros.desde
  if (filtros.hasta) params.hasta = filtros.hasta
  if (filtros.page) params.page = filtros.page
  if (filtros.limit) params.limit = filtros.limit

  const { data } = await api.get<TransaccionesMonetizacionResponse>(
    '/admin/monetizacion/transacciones',
    { params },
  )
  return data.data
}

export interface ResumenMonetizacion {
  tecnicos: {
    total: number
    conModelo: number
    creditos: number
    mensualidad: number
  }
  planesActivos: number
  creditosEnCirculacion: number
  ingresos: { mes: number; total: number }
  transacciones: { total: number; mes: number }
  generadoAt: string
}

interface ResumenMonetizacionResponse {
  data: ResumenMonetizacion
}

export async function obtenerResumenMonetizacion(): Promise<ResumenMonetizacion> {
  const { data } = await api.get<ResumenMonetizacionResponse>(
    '/admin/monetizacion/resumen',
  )
  return data.data
}

/* ------------------------------------------------------------------ */
/* Métricas de monetización (series semanales)                         */
/* ------------------------------------------------------------------ */

export interface ModeloSemana {
  semanaInicio: string
  creditos: number
  mensualidad: number
}

export interface IngresosSemana {
  semanaInicio: string
  ingresosCreditosSemana: number
  ingresosMensualidadSemana: number
  ingresosComisionesSemana: number
  ingresosTotalSemana: number
}

export interface AdopcionSemana {
  semanaInicio: string
  verificadosSemana: number
  conModeloActivoSemana: number
}

export interface MetricasMonetizacion {
  generadoEn: string
  modelosActivos: {
    totales: { creditos: number; mensualidad: number; ninguno: number }
    serie: ModeloSemana[]
  }
  ingresos: { serie: IngresosSemana[] }
  adopcion: { serie: AdopcionSemana[] }
  ingresosMensuales?: { meses: number; serie: IngresosMes[] }
  modelosMensuales?: { meses: number; serie: ModeloMes[] }
  semanalDelMes?: {
    semanas: number
    ingresos: { serie: IngresosSemana[] }
    modelos: { serie: ModeloSemana[] }
  }
  periodo?: { seleccionado: string; anterior: string | null }
  resumen: {
    totalConCreditos: number
    totalConMensualidad: number
    totalSinModelo: number
    ingresosTotalesCreditos: number
    ingresosTotalesMensualidad: number
    ingresosTotalesComisiones: number
    ingresosTotales: number
    modeloMasElegido: 'creditos' | 'mensualidad' | null
    porcentajeMonetizados: number
  }
}

interface MetricasMonetizacionResponse {
  data: MetricasMonetizacion
}

export interface ParametrosMetricasMonetizacion {
  semanas?: number
  meses?: number
  mes?: string
}

export async function obtenerMetricasMonetizacion(
  parametros: ParametrosMetricasMonetizacion = {},
): Promise<MetricasMonetizacion> {
  const params: Record<string, number | string> = {}
  if (parametros.semanas) params.semanas = parametros.semanas
  if (parametros.meses) params.meses = parametros.meses
  if (parametros.mes) params.mes = parametros.mes

  const { data } = await api.get<MetricasMonetizacionResponse>(
    '/admin/metricas/monetizacion',
    { params },
  )
  return data.data
}
