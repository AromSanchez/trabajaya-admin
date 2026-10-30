import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerIniciales, obtenerTituloRuta } from './navigation'
import { IconChevronDown, IconLogout, IconMenu } from './icons'
import ThemeToggle from './ThemeToggle'

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
    <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center gap-3 px-5 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={onAbrirMenuMovil}
          aria-label="Abrir menú"
          className="grid h-10 w-10 place-items-center text-ink-2 transition duration-[var(--duration)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink lg:hidden"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm text-ink-3"><span className="hidden sm:inline">Administración <span className="mx-2 text-line-strong">/</span></span><span className="font-medium text-ink">{titulo}</span></p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuAbierto((valor) => !valor)}
              aria-haspopup="menu"
              aria-expanded={menuAbierto}
              aria-label="Menú de cuenta"
              className="flex items-center gap-2 rounded-full bg-surface p-1.5 pr-3 transition duration-[var(--duration)] ease-[var(--ease)] hover:bg-primary-soft"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-strong text-xs font-semibold text-white">
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
                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-line bg-surface p-1 shadow-lg"
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
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink transition duration-[var(--duration)] ease-[var(--ease)] hover:bg-danger-soft hover:text-danger-text"
                >
                  <IconLogout className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
