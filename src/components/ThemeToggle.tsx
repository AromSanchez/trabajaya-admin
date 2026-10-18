import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import type { Tema } from '../context/theme-context'
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
  const IconoActual = temaResuelto === 'oscuro' ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Cambiar tema">
          <IconoActual />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {OPCIONES.map(({ valor, etiqueta, Icono }) => {
          const activo = tema === valor
          return (
            <DropdownMenuItem
              key={valor}
              onSelect={() => setTema(valor)}
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
