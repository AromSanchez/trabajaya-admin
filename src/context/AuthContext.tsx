import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { TOKEN_KEY, USER_KEY } from '../services/api'
import { AuthContext } from './auth-context'
import type { AdminUser, AuthContextValue } from './auth-context'

function leerUsuarioGuardado(): AdminUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [usuario, setUsuario] = useState<AdminUser | null>(() =>
    leerUsuarioGuardado(),
  )

  const login = useCallback((nuevoToken: string, nuevoUsuario: AdminUser) => {
    localStorage.setItem(TOKEN_KEY, nuevoToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nuevoUsuario))
    setToken(nuevoToken)
    setUsuario(nuevoUsuario)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUsuario(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [usuario, token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
