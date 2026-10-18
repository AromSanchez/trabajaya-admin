import type {
  CategoriaReporte,
  EstadoReporte,
  TipoObjetivo,
} from '../services/admin'
import type { EstadoInfo } from './estados'

export const ESTADOS_REPORTE_INFO: Record<EstadoReporte, EstadoInfo> = {
  pendiente: {
    label: 'Pendiente',
    badge: 'bg-warning-soft text-warning-text',
    dot: 'bg-warning',
  },
  resuelto: {
    label: 'Resuelto',
    badge: 'bg-success-soft text-success-text',
    dot: 'bg-success',
  },
  descartado: {
    label: 'Descartado',
    badge: 'bg-pending/15 text-ink-3',
    dot: 'bg-pending',
  },
}

export const TIPOS_OBJETIVO: { valor: TipoObjetivo; label: string }[] = [
  { valor: 'tecnico', label: 'Técnico' },
  { valor: 'cliente', label: 'Cliente' },
  { valor: 'resena', label: 'Reseña' },
]

export const CATEGORIAS_REPORTE: { valor: CategoriaReporte; label: string }[] = [
  { valor: 'no_se_presento', label: 'No se presentó' },
  { valor: 'no_estaba', label: 'No estaba' },
  { valor: 'trabajo_deficiente', label: 'Trabajo deficiente' },
  { valor: 'cobro_diferente', label: 'Cobro diferente' },
  { valor: 'comportamiento_inapropiado', label: 'Comportamiento inapropiado' },
  { valor: 'fraude', label: 'Fraude' },
  { valor: 'contenido_inapropiado', label: 'Contenido inapropiado' },
  { valor: 'otro', label: 'Otro' },
]

export function etiquetaTipoObjetivo(tipo: TipoObjetivo): string {
  return TIPOS_OBJETIVO.find((item) => item.valor === tipo)?.label ?? tipo
}

export function etiquetaCategoria(categoria: CategoriaReporte): string {
  return (
    CATEGORIAS_REPORTE.find((item) => item.valor === categoria)?.label ??
    categoria
  )
}
