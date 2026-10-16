import { useAuth } from '../../hooks/useAuth'

export default function Dashboard() {
  const { usuario } = useAuth()

  return (
    <section className="rounded-2xl border border-dark/10 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-dark">
        Hola, {usuario?.nombre ?? 'Administrador'}
      </h2>
      <p className="mt-1 text-sm text-dark/60">
        Bienvenido al panel de administración de TrabajaYa. Las métricas
        generales se mostrarán aquí una vez conectadas al backend.
      </p>
    </section>
  )
}
