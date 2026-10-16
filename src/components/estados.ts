import type { EstadoVerificacion } from '../services/admin'

interface EstadoInfo {
  label: string
  badge: string
  bar: string
  dot: string
}

export const ESTADOS_INFO: Record<EstadoVerificacion, EstadoInfo> = {
  pendiente: {
    label: 'Pendiente',
    badge: 'bg-dark/10 text-dark/70',
    bar: 'bg-dark/40',
    dot: 'bg-dark/40',
  },
  en_revision: {
    label: 'En revisión',
    badge: 'bg-primary/10 text-primary',
    bar: 'bg-primary',
    dot: 'bg-primary',
  },
  verificado: {
    label: 'Verificado',
    badge: 'bg-success/10 text-success',
    bar: 'bg-success',
    dot: 'bg-success',
  },
  observado: {
    label: 'Observado',
    badge: 'bg-warning/10 text-warning',
    bar: 'bg-warning',
    dot: 'bg-warning',
  },
  rechazado: {
    label: 'Rechazado',
    badge: 'bg-danger/10 text-danger',
    bar: 'bg-danger',
    dot: 'bg-danger',
  },
  suspendido: {
    label: 'Suspendido',
    badge: 'bg-dark/10 text-dark/50',
    bar: 'bg-dark/20',
    dot: 'bg-dark/20',
  },
}
