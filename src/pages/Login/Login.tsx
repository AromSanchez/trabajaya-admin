import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { loginAdmin } from '../../services/auth'
import EscenaLogin, { type EstadoLogin, type FocoLogin } from './EscenaLogin'
import Brand from '../../components/Brand'
import ThemeToggle from '../../components/ThemeToggle'

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const mensaje = (error.response?.data as { error?: string } | undefined)
      ?.error
    if (mensaje) return mensaje
    if (!error.response) return 'No se pudo conectar con el servidor.'
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

const entrada = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoLogin>('idle')
  const [foco, setFoco] = useState<FocoLogin>('ninguno')
  const [verClave, setVerClave] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const enviando = estado === 'enviando'
  const exito = estado === 'exito'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setEstado('enviando')
    try {
      const { token, usuario } = await loginAdmin(email, password)
      login(token, usuario)
      setEstado('exito')
      await new Promise((r) => window.setTimeout(r, 850))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(obtenerMensajeError(err))
      setEstado('idle')
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <EscenaLogin foco={foco} estado={estado} />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-20 sm:px-10">
        <div className="absolute right-6 top-6"><ThemeToggle /></div>
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            aria-hidden
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-soft blur-[90px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          className="relative w-full max-w-sm"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div
            custom={0}
            variants={entrada}
            className="mb-8 flex items-center gap-3 lg:hidden"
          >
            <Brand />
          </motion.div>

          <motion.div custom={0} variants={entrada}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              Panel interno
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={entrada}
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink"
          >
            Bienvenido de nuevo
          </motion.h1>
          <motion.p custom={2} variants={entrada} className="mt-2 text-sm text-ink-2">
            Tu comunidad, en buenas manos. Inicia sesión para continuar.
          </motion.p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <motion.div custom={3} variants={entrada}>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-3"
              >
                Correo electrónico
              </label>
              <div className="group relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3 transition-colors group-focus-within:text-primary" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFoco('email')}
                  onBlur={() => setFoco('ninguno')}
                  className="w-full rounded-2xl bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-3 focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="admin@trabajaya.com"
                />
              </div>
            </motion.div>

            <motion.div custom={4} variants={entrada}>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-3"
              >
                Contraseña
              </label>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3 transition-colors group-focus-within:text-primary" />
                <input
                  id="password"
                  type={verClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFoco('password')}
                  onBlur={() => setFoco('ninguno')}
                  className="w-full rounded-2xl bg-surface py-2.5 pl-10 pr-11 text-sm text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-3 focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-ink-3 transition hover:bg-surface-2 hover:text-ink"
                >
                  {verClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto', x: [0, -6, 6, -3, 3, 0] }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ x: { duration: 0.4 }, opacity: { duration: 0.2 } }}
                  className="flex items-center gap-2 overflow-hidden rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger-text"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              custom={5}
              variants={entrada}
              type="submit"
              disabled={enviando || exito}
              aria-busy={enviando}
              className={`relative w-full overflow-hidden rounded-lg px-4 py-2.5 font-semibold text-white shadow-none transition duration-[var(--duration-fast)] ease-[var(--ease)] disabled:cursor-not-allowed ${
                exito ? 'bg-success' : 'bg-primary-strong hover:bg-primary-hover active:translate-y-px'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {exito ? (
                  <motion.span
                    key="exito"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    ¡Bienvenido!
                  </motion.span>
                ) : enviando ? (
                  <motion.span
                    key="cargando"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ingresando…
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group/btn flex items-center justify-center gap-2"
                  >
                    Ingresar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <motion.p custom={6} variants={entrada} className="mt-6 text-center text-xs text-ink-3">
            ¿Problemas para acceder? Contacta al equipo de sistemas.
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}
