import { useRef } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import type { OrigenAnimacion, Tema } from '../context/theme-context'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const OPCIONES: { valor: Tema; etiqueta: string; Icono: typeof Sun }[] = [
  { valor: 'claro', etiqueta: 'Claro', Icono: Sun },
  { valor: 'oscuro', etiqueta: 'Oscuro', Icono: Moon },
  { valor: 'sistema', etiqueta: 'Sistema', Icono: Monitor },
]

export default function ThemeToggle() {
  const { tema, temaResuelto, setTema } = useTheme()
  const botonRef = useRef<HTMLButtonElement>(null)
  const IconoActual = temaResuelto === 'oscuro' ? Moon : Sun

  const origenDesdeBoton = (): OrigenAnimacion => {
    const rect = botonRef.current?.getBoundingClientRect()
    if (!rect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={botonRef} variant="ghost" size="icon" aria-label="Cambiar tema">
          <IconoActual />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {OPCIONES.map(({ valor, etiqueta, Icono }) => {
          const activo = tema === valor
          return (
            <DropdownMenuItem
              key={valor}
              onSelect={() => setTema(valor, origenDesdeBoton())}
              className={activo ? 'bg-accent text-accent-foreground' : undefined}
            >
              <Icono />
              <span className="flex-1">{etiqueta}</span>
              {activo && <span className="text-xs text-ink-3">Activo</span>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
