import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { NAV_ITEMS, obtenerIniciales } from './navigation'
import { IconChevronsLeft } from './icons'

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
          className="fixed inset-0 z-30 bg-dark/40 backdrop-blur-sm lg:hidden"
          onClick={onCerrarMovil}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-dark/10 bg-white transition-[width,translate] duration-300 ${
          colapsado ? 'lg:w-20' : 'lg:w-64'
        } ${movilAbierto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-dark/10 px-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary to-primary/60 text-sm font-bold text-white shadow-md shadow-primary/30">
            TY
          </div>
          <div className={`min-w-0 ${colapsado ? 'lg:hidden' : ''}`}>
            <p className="truncate text-sm font-semibold text-dark">TrabajaYa</p>
            <p className="truncate text-xs text-dark/50">Panel de administración</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p
            className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-dark/40 ${
              colapsado ? 'lg:hidden' : ''
            }`}
          >
            Menú
          </p>

          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCerrarMovil}
              title={colapsado ? label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-dark/70 hover:bg-primary/5 hover:text-primary'
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

        <div className="border-t border-dark/10 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-dark/[0.03] px-3 py-2.5 ${
              colapsado ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-primary/60 text-xs font-semibold text-white">
              {iniciales}
            </div>
            <div className={`min-w-0 ${colapsado ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-medium text-dark">
                {usuario?.nombre ?? 'Administrador'}
              </p>
              <p className="truncate text-xs capitalize text-dark/50">
                {usuario?.rol ?? 'admin'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleColapso}
            aria-label={colapsado ? 'Expandir menú' : 'Contraer menú'}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-dark/60 transition hover:bg-dark/5 hover:text-dark lg:flex"
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
