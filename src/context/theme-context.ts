import { createContext } from 'react'

export type Tema = 'claro' | 'oscuro' | 'sistema'
export type TemaResuelto = 'claro' | 'oscuro'

export interface OrigenAnimacion {
  x: number
  y: number
}

export interface ThemeContextValue {
  tema: Tema
  temaResuelto: TemaResuelto
  setTema: (tema: Tema, origen?: OrigenAnimacion) => void
}

export const CLAVE_TEMA = 'trabajaya_admin_tema'

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function normalizarTema(valor: string | null): Tema {
  if (valor === 'claro' || valor === 'oscuro' || valor === 'sistema') {
    return valor
  }
  return 'sistema'
}
