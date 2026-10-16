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
