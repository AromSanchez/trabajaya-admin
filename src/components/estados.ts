import type { EstadoDocumento, EstadoVerificacion } from '../services/admin'

export interface EstadoInfo {
  label: string
  badge: string
  dot: string
}

export interface EstadoVerificacionInfo extends EstadoInfo {
  bar: string
}

export const ESTADOS_INFO: Record<EstadoVerificacion, EstadoVerificacionInfo> = {
  pendiente: {
    label: 'Pendiente',
    badge: 'bg-pending/15 text-ink-2',
    bar: 'bg-pending',
    dot: 'bg-pending',
  },
  en_revision: {
    label: 'En revisión',
    badge: 'bg-revision/10 text-revision',
    bar: 'bg-revision',
    dot: 'bg-revision',
  },
  verificado: {
    label: 'Verificado',
    badge: 'bg-success-soft text-success-text',
    bar: 'bg-success',
    dot: 'bg-success',
  },
  observado: {
    label: 'Observado',
    badge: 'bg-warning-soft text-warning-text',
    bar: 'bg-warning',
    dot: 'bg-warning',
  },
  rechazado: {
    label: 'Rechazado',
    badge: 'bg-danger-soft text-danger-text',
    bar: 'bg-danger',
    dot: 'bg-danger',
  },
  suspendido: {
    label: 'Suspendido',
    badge: 'bg-suspended/12 text-suspended',
    bar: 'bg-suspended',
    dot: 'bg-suspended',
  },
}

export const DOCUMENTO_ESTADOS_INFO: Record<EstadoDocumento, EstadoInfo> = {
  pendiente: {
    label: 'Pendiente',
    badge: 'bg-pending/15 text-ink-2',
    dot: 'bg-pending',
  },
  aprobado: {
    label: 'Aprobado',
    badge: 'bg-success-soft text-success-text',
    dot: 'bg-success',
  },
  observado: {
    label: 'Observado',
    badge: 'bg-warning-soft text-warning-text',
    dot: 'bg-warning',
  },
}
