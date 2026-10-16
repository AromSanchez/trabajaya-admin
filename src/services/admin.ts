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

interface ReportesResponse {
  data: {
    reportes: unknown[]
    paginacion: {
      page: number
      limit: number
      total: number
      total_paginas: number
    }
  }
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
  const { data } = await api.get<ReportesResponse>('/admin/reportes', {
    params: { estado, limit: 1 },
  })
  return data.data.paginacion.total
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
