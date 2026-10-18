import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CLAVE_TEMA,
  ThemeContext,
  normalizarTema,
  type Tema,
  type TemaResuelto,
} from './theme-context'

function prefiereOscuro(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
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
    const raiz = document.documentElement
    raiz.classList.toggle('dark', temaResuelto === 'oscuro')
    raiz.dataset.tema = temaResuelto
  }, [temaResuelto])

  const setTema = useCallback((nuevo: Tema) => {
    setTemaState(nuevo)
    window.localStorage.setItem(CLAVE_TEMA, nuevo)
  }, [])

  const valor = useMemo(
    () => ({ tema, temaResuelto, setTema }),
    [tema, temaResuelto, setTema],
  )

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
}
