import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import { loginAdmin } from '../../services/auth'

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensaje = (error.response?.data as { error?: string } | undefined)
      ?.error
    if (mensaje) return mensaje
    if (!error.response) return 'No se pudo conectar con el servidor.'
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const { token, usuario } = await loginAdmin(email, password)
      login(token, usuario)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-base">
      <aside className="hidden w-[42%] flex-col justify-between border-r border-line bg-ink p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center bg-primary text-sm font-bold text-white">
            TY
          </span>
          <span className="font-display text-sm font-semibold text-white">
            TrabajaYa Admin
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
            Panel interno
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-white">
            Verificación,
            <br />
            reportes y métricas
            <br />
            en un solo lugar.
          </h2>
          <div className="mt-8 h-px w-full bg-white/15" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Acceso restringido al equipo de administración de TrabajaYa.
          </p>
        </div>

        <p className="text-xs text-white/40">© 2026 TrabajaYa</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Inicio de sesión
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            Bienvenido de nuevo
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            Inicia sesión para administrar la plataforma.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-3"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-3 focus:border-primary"
                placeholder="admin@trabajoya.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-3"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-3 focus:border-primary"
                placeholder="••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm font-medium text-danger"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              aria-busy={enviando}
              className="w-full bg-primary px-4 py-2.5 font-medium text-white transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-primary-dark active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
