import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CLAVE_TEMA,
  ThemeContext,
  normalizarTema,
  type OrigenAnimacion,
  type Tema,
  type TemaResuelto,
} from './theme-context'

type DocumentoConTransiciones = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>
  }
}

function prefiereOscuro(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function aplicaClase(resuelto: TemaResuelto) {
  const raiz = document.documentElement
  raiz.classList.toggle('dark', resuelto === 'oscuro')
  raiz.dataset.tema = resuelto
}

function prefiereMovimientoReducido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animarCirculo(
  transicion: { ready: Promise<void> },
  { x, y }: OrigenAnimacion,
) {
  const radio = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  transicion.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radio}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(() =>
    normalizarTema(typeof window === 'undefined' ? null : window.localStorage.getItem(CLAVE_TEMA)),
  )
  const [oscuroSistema, setOscuroSistema] = useState<boolean>(prefiereOscuro)

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = (evento: MediaQueryListEvent) => setOscuroSistema(evento.matches)

    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  const temaResuelto: TemaResuelto =
    tema === 'sistema' ? (oscuroSistema ? 'oscuro' : 'claro') : tema

  useEffect(() => {
    aplicaClase(temaResuelto)
  }, [temaResuelto])

  const setTema = useCallback(
    (nuevo: Tema, origen?: OrigenAnimacion) => {
      window.localStorage.setItem(CLAVE_TEMA, nuevo)
      const nuevoResuelto: TemaResuelto =
        nuevo === 'sistema' ? (oscuroSistema ? 'oscuro' : 'claro') : nuevo

      const doc = document as DocumentoConTransiciones
      const puedeAnimar =
        Boolean(origen) &&
        Boolean(doc.startViewTransition) &&
        !prefiereMovimientoReducido() &&
        nuevoResuelto !== temaResuelto

      if (!puedeAnimar || !doc.startViewTransition) {
        setTemaState(nuevo)
        return
      }

      const transicion = doc.startViewTransition(() => {
        aplicaClase(nuevoResuelto)
        setTemaState(nuevo)
      })
      animarCirculo(transicion, origen as OrigenAnimacion)
    },
    [oscuroSistema, temaResuelto],
  )

  const valor = useMemo(
    () => ({ tema, temaResuelto, setTema }),
    [tema, temaResuelto, setTema],
  )

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
}
