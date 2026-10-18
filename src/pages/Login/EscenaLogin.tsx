import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  BarChart3,
  ClipboardList,
  Lock,
  LockOpen,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export type FocoLogin = 'email' | 'password' | 'ninguno'
export type EstadoLogin = 'idle' | 'enviando' | 'exito'

interface EscenaLoginProps {
  foco: FocoLogin
  estado: EstadoLogin
  tapandoOjos: boolean
}

const CHIPS = [
  { icono: ShieldCheck, texto: 'Verificación', x: 'left-6 top-[26%]', retardo: 0 },
  { icono: ClipboardList, texto: 'Reportes', x: 'right-4 top-[18%]', retardo: 0.8 },
  { icono: BarChart3, texto: 'Métricas', x: 'right-10 bottom-[24%]', retardo: 1.6 },
] as const

export default function EscenaLogin({ foco, estado, tapandoOjos }: EscenaLoginProps) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const [parpadeo, setParpadeo] = useState(false)

  useEffect(() => {
    const mover = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1)
      my.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', mover)
    return () => window.removeEventListener('pointermove', mover)
  }, [mx, my])

  useEffect(() => {
    if (foco === 'ninguno') return
    mx.set(1)
    my.set(foco === 'password' ? 0.55 : -0.35)
  }, [foco, mx, my])

  useEffect(() => {
    if (estado !== 'idle') return
    let t = 0
    const ciclo = () => {
      t = window.setTimeout(() => {
        setParpadeo(true)
        window.setTimeout(() => setParpadeo(false), 130)
        ciclo()
      }, 2400 + Math.random() * 3200)
    }
    ciclo()
    return () => window.clearTimeout(t)
  }, [estado])

  const sx = useSpring(mx, { stiffness: 130, damping: 14, mass: 0.45 })
  const sy = useSpring(my, { stiffness: 130, damping: 14, mass: 0.45 })
  const pupilaX = useTransform(sx, [-1, 1], [-10, 10])
  const pupilaY = useTransform(sy, [-1, 1], [-7, 7])
  const caraX = useTransform(sx, [-1, 1], [-10, 10])
  const caraY = useTransform(sy, [-1, 1], [-6, 6])

  const feliz = estado === 'exito'
  const pensando = estado === 'enviando'

  return (
    <aside className="relative hidden overflow-hidden bg-hero lg:flex lg:w-[47%] lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          aria-hidden
          className="absolute -left-24 top-0 h-[26rem] w-[26rem] rounded-full bg-primary/30 blur-[110px]"
          animate={{ x: [0, 40, -10, 0], y: [0, 30, 60, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-16 bottom-0 h-[22rem] w-[22rem] rounded-full bg-chart-3/25 blur-[110px]"
          animate={{ x: [0, -30, 20, 0], y: [0, -40, -10, 0], scale: [1, 0.9, 1.2, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-1/3 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-hero-2/70 blur-[100px]"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 text-white/10"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 78%)',
          }}
        />
      </div>

      <header className="relative flex items-center gap-3">
        <motion.span
          className="grid h-10 w-10 place-items-center rounded-xl bg-primary-strong font-display text-sm font-bold text-white shadow-md"
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          TY
        </motion.span>
        <span className="font-display text-sm font-semibold text-white">
          TrabajaYa <span className="text-white/50">Admin</span>
        </span>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        {CHIPS.map((chip) => {
          const Icono = chip.icono
          return (
            <motion.div
              key={chip.texto}
              className={`absolute ${chip.x} hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-white/80 backdrop-blur-md xl:flex`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                opacity: { delay: 0.4 + chip.retardo, duration: 0.6 },
                y: { duration: 5 + chip.retardo, repeat: Infinity, ease: 'easeInOut', delay: chip.retardo },
              }}
            >
              <Icono className="h-3.5 w-3.5 text-primary" />
              {chip.texto}
            </motion.div>
          )
        })}

        <motion.div
          style={{ x: caraX, y: caraY }}
          className="relative flex h-40 w-56 flex-col items-center justify-center gap-5 rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl"
        >
          <motion.div
            aria-hidden
            className="absolute -inset-px rounded-[2rem] opacity-60"
            style={{ background: 'linear-gradient(160deg, var(--color-primary) 0%, transparent 45%)' }}
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex items-center gap-6">
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white shadow-inner"
                animate={{
                  scaleY: feliz || tapandoOjos ? 1 : parpadeo ? 0.08 : pensando ? 0.6 : 1,
                }}
                transition={{ duration: 0.14 }}
              >
                {feliz ? (
                  <svg viewBox="0 0 40 40" className="h-9 w-9 text-hero">
                    <path
                      d="M8 24c4-9 20-9 24 0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : tapandoOjos ? (
                  <svg viewBox="0 0 40 40" className="h-9 w-9 text-hero">
                    <path
                      d="M9 24c3.5-6 18.5-6 22 0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <>
                    <motion.span
                      className="h-6 w-6 rounded-full bg-hero"
                      style={{ x: pupilaX, y: pupilaY }}
                    >
                      <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-white/80" />
                    </motion.span>
                    <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-inset ring-black/5" />
                  </>
                )}
              </motion.span>
            ))}
          </div>

          <motion.div
            className={`relative h-px rounded-full ${feliz ? 'bg-white/40' : 'bg-white/20'}`}
            animate={feliz ? { width: 64, height: 10, y: -2, borderRadius: 4 } : { width: 40, height: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          />
        </motion.div>

        <motion.div
          className={`relative mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border backdrop-blur-md ${
            feliz ? 'border-success bg-success-soft' : 'border-white/15 bg-white/[0.06]'
          }`}
          animate={{ rotate: pensando ? [-3, 3, -3] : 0 }}
          transition={pensando ? { duration: 0.5, repeat: Infinity } : { type: 'spring', stiffness: 200, damping: 18 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {feliz ? (
              <motion.span
                key="abierto"
                initial={{ scale: 0.4, y: -8, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              >
                <LockOpen className="h-6 w-6 text-success" />
              </motion.span>
            ) : (
              <motion.span
                key="cerrado"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
              >
                <Lock className="h-6 w-6 text-white/70" />
              </motion.span>
            )}
          </AnimatePresence>
          {feliz && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-2xl border border-success"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div className="mt-5 h-6 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={estado}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center gap-2 text-sm font-medium text-white/70"
            >
              {feliz ? (
                <>
                  <Sparkles className="h-4 w-4 text-success" />
                  Acceso concedido
                </>
              ) : pensando ? (
                <>
                  <ScanFace className="h-4 w-4 animate-pulse text-primary" />
                  Verificando credenciales…
                </>
              ) : (
                <>
                  <ScanFace className="h-4 w-4 text-primary" />
                  Esperando credenciales…
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <footer className="relative">
        <motion.div
          aria-hidden
          className="absolute -top-10 left-0 h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)' }}
          animate={{ x: ['-40%', '40%', '-40%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Panel interno
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white">
          Verificación, reportes
          <br />
          y métricas en un solo lugar.
        </h2>
        <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-success"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Acceso restringido · © 2026 TrabajaYa
        </div>
      </footer>
    </aside>
  )
}
