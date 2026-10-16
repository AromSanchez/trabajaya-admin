import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerIniciales, obtenerTituloRuta } from './navigation'
import { IconChevronDown, IconLogout, IconMenu } from './icons'

interface HeaderProps {
  onAbrirMenuMovil: () => void
}

export default function Header({ onAbrirMenuMovil }: HeaderProps) {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuAbierto) return

    function alClickFuera(evento: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        setMenuAbierto(false)
      }
    }
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }

    document.addEventListener('mousedown', alClickFuera)
    document.addEventListener('keydown', alPresionarTecla)
    return () => {
      document.removeEventListener('mousedown', alClickFuera)
      document.removeEventListener('keydown', alPresionarTecla)
    }
  }, [menuAbierto])

  const titulo = obtenerTituloRuta(location.pathname)
  const iniciales = obtenerIniciales(usuario?.nombre)

  function cerrarSesion() {
    setMenuAbierto(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onAbrirMenuMovil}
          aria-label="Abrir menú"
          className="grid h-10 w-10 place-items-center text-ink-2 transition duration-[var(--duration)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink lg:hidden"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold text-ink">{titulo}</h1>
          <p className="hidden truncate text-xs text-ink-3 sm:block">
            Panel de administración de TrabajaYa
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuAbierto((valor) => !valor)}
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
            className="flex items-center gap-2 p-1 pr-2 transition duration-[var(--duration)] ease-[var(--ease)] hover:bg-surface-2"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center bg-primary text-xs font-semibold text-white">
              {iniciales}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-ink">
                {usuario?.nombre ?? 'Administrador'}
              </p>
              <p className="text-xs capitalize text-ink-3">
                {usuario?.rol ?? 'admin'}
              </p>
            </div>
            <IconChevronDown
              className={`hidden h-4 w-4 text-ink-3 transition-transform duration-[var(--duration)] ease-[var(--ease)] sm:block ${
                menuAbierto ? 'rotate-180' : ''
              }`}
            />
          </button>

          {menuAbierto && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 overflow-hidden border border-line bg-surface p-1"
            >
              <div className="border-b border-line px-3 py-2 sm:hidden">
                <p className="text-sm font-medium text-ink">
                  {usuario?.nombre ?? 'Administrador'}
                </p>
                <p className="text-xs capitalize text-ink-3">
                  {usuario?.rol ?? 'admin'}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={cerrarSesion}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-ink transition duration-[var(--duration)] ease-[var(--ease)] hover:bg-danger/10 hover:text-danger"
              >
                <IconLogout className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
