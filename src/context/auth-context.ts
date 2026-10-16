import { createContext } from 'react'

export interface AdminUser {
  id: number
  email: string
  nombre: string
  rol: string
}

export interface AuthContextValue {
  usuario: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, usuario: AdminUser) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
