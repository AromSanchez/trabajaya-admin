import type { ComponentType } from 'react'
import {
  IconClock,
  IconDashboard,
  IconFlag,
  IconUsers,
} from './icons'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/tecnicos', label: 'Técnicos', icon: IconUsers },
  { to: '/reportes', label: 'Reportes', icon: IconFlag },
  {
    to: '/cancelaciones-tardias',
    label: 'Cancelaciones tardías',
    icon: IconClock,
  },
]

export function obtenerTituloRuta(pathname: string): string {
  const item = NAV_ITEMS.find(
    (nav) => pathname === nav.to || pathname.startsWith(`${nav.to}/`),
  )
  return item?.label ?? 'Panel'
}

export function obtenerIniciales(nombre?: string): string {
  if (!nombre) return 'A'
  const partes = nombre.trim().split(/\s+/).slice(0, 2)
  return partes.map((parte) => parte.charAt(0).toUpperCase()).join('')
}
