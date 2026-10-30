import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { NAV_ITEMS, obtenerIniciales } from './navigation'
import { IconChevronsLeft } from './icons'
import Brand from './Brand'
import { X } from 'lucide-react'

interface SidebarProps {
  colapsado: boolean
  movilAbierto: boolean
  onCerrarMovil: () => void
  onToggleColapso: () => void
}

export default function Sidebar({
  colapsado,
  movilAbierto,
  onCerrarMovil,
  onToggleColapso,
}: SidebarProps) {
  const { usuario } = useAuth()
  const iniciales = obtenerIniciales(usuario?.nombre)

  return (
    <>
      {movilAbierto && (
        <div
        className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        onClick={onCerrarMovil}
        aria-hidden="true"
      />
    )}

    <aside
      aria-label="Navegación principal"
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-[width,translate] duration-[var(--duration)] ease-[var(--ease)] ${
        colapsado ? 'lg:w-20' : 'lg:w-64'
      } ${movilAbierto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="flex h-24 shrink-0 items-center justify-between gap-1 px-4">
        <div className={colapsado ? 'lg:hidden' : ''}><Brand /></div>
        {colapsado && <div className="hidden lg:block"><Brand compacto /></div>}
        <button type="button" onClick={onCerrarMovil} aria-label="Cerrar menú" className="grid size-9 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-canvas lg:hidden"><X className="size-4" /></button>
      </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          <p
            className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-3 ${
              colapsado ? 'lg:hidden' : ''
            }`}
          >
            Espacio de trabajo
          </p>

          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCerrarMovil}
              title={colapsado ? label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-[var(--duration)] ease-[var(--ease)] ${
                  isActive
                    ? 'bg-primary-soft text-link'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                } ${colapsado ? 'lg:justify-center lg:px-0' : ''}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={`truncate ${colapsado ? 'lg:hidden' : ''}`}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <div
            className={`flex items-center gap-3 px-3 py-3 ${
              colapsado ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-strong text-xs font-semibold text-white">
              {iniciales}
            </div>
            <div className={`min-w-0 ${colapsado ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-medium text-ink">
                {usuario?.nombre ?? 'Administrador'}
              </p>
              <p className="truncate text-xs capitalize text-ink-3">
                {usuario?.rol ?? 'admin'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleColapso}
            aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-ink-3 transition duration-[var(--duration)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink lg:flex"
          >
            <IconChevronsLeft
              className={`h-4 w-4 shrink-0 transition-transform ${
                colapsado ? 'rotate-180' : ''
              }`}
            />
            <span className={colapsado ? 'lg:hidden' : ''}>Contraer</span>
          </button>
        </div>
      </aside>
    </>
  )
}
