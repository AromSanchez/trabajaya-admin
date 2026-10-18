import type { Oficio, OrdenTecnicos } from '../services/admin'

export const OFICIOS_INFO: Record<Oficio, string> = {
  gasfiteria: 'Gasfitería',
  electricidad: 'Electricidad',
  carpinteria: 'Carpintería',
  albanileria: 'Albañilería',
  pintura: 'Pintura',
}

export const ORDEN_OPCIONES: { valor: OrdenTecnicos; label: string }[] = [
  { valor: 'recientes', label: 'Más recientes' },
  { valor: 'antiguos', label: 'Más antiguos' },
  { valor: 'experiencia', label: 'Más experiencia' },
  { valor: 'servicios', label: 'Más servicios' },
  { valor: 'calificacion', label: 'Mejor calificación' },
  { valor: 'nombre', label: 'Nombre (A–Z)' },
]
