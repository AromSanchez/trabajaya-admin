import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { ESTADOS_VERIFICACION } from '../../services/admin'
import { ESTADOS_INFO } from '../../components/estados'
import StatCard from '../../components/StatCard'
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconClock,
  IconFlag,
  IconRefresh,
  IconUsers,
} from '../../components/icons'

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-surface p-5">
      <div className="h-3 w-24 bg-line" />
      <div className="mt-5 h-9 w-16 bg-line" />
      <div className="mt-3 h-3 w-32 bg-line" />
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const { metricas, cargando, error, recargar } = useDashboard()

  const total = metricas?.totalTecnicos ?? 0

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          Resumen
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold text-ink">
          Hola, {usuario?.nombre ?? 'Administrador'}
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          Estado general de la plataforma.
        </p>
      </header>

      {error && (
        <section className="flex flex-col items-start justify-between gap-3 border border-danger/30 bg-danger/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center bg-danger/10 text-danger">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                No se pudieron cargar las métricas
              </p>
              <p className="text-sm text-ink-2">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={recargar}
            className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
          >
            <IconRefresh className="h-4 w-4" />
            Reintentar
          </button>
        </section>
      )}

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {cargando ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              titulo="Reportes abiertos"
              descripcion="Pendientes de resolver"
              valor={metricas?.reportesAbiertos ?? 0}
              icon={IconFlag}
              acento="danger"
            />
            <StatCard
              titulo="Técnicos totales"
              descripcion="Registrados en la plataforma"
              valor={total}
              icon={IconUsers}
              acento="primary"
            />
            <StatCard
              titulo="Verificados"
              descripcion="Listos para trabajar"
              valor={metricas?.tecnicosPorEstado.verificado ?? 0}
              icon={IconCheckCircle}
              acento="success"
            />
            <StatCard
              titulo="En revisión"
              descripcion="Pendientes de verificación"
              valor={metricas?.tecnicosPorEstado.en_revision ?? 0}
              icon={IconClock}
              acento="warning"
            />
          </>
        )}
      </div>

      <section className="border border-line bg-surface p-6">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h3 className="font-display text-lg font-semibold text-ink">
            Técnicos por estado
          </h3>
          {!cargando && !error && (
            <span className="text-sm tabular-nums text-ink-3">
              {total} en total
            </span>
          )}
        </div>

        {cargando ? (
          <div className="mt-5 space-y-4">
            {ESTADOS_VERIFICACION.map((estado) => (
              <div key={estado} className="animate-pulse">
                <div className="mb-2 h-4 w-24 bg-line" />
                <div className="h-2 w-full bg-line" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {ESTADOS_VERIFICACION.map((estado) => {
              const info = ESTADOS_INFO[estado]
              const cantidad = metricas?.tecnicosPorEstado[estado] ?? 0
              const porcentaje =
                total > 0 ? Math.round((cantidad / total) * 100) : 0
              return (
                <li key={estado}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <span
                        className={`h-2.5 w-2.5 ${info.dot}`}
                        aria-hidden="true"
                      />
                      {info.label}
                    </span>
                    <span className="tabular-nums text-ink-2">
                      {cantidad}
                      {total > 0 && (
                        <span className="ml-1 text-ink-3">
                          · {porcentaje}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden bg-line">
                    <div
                      className={`h-full ${info.bar} transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {!cargando && !error && total === 0 && (
          <p className="mt-5 bg-surface-2 px-4 py-3 text-center text-sm text-ink-2">
            Aún no hay técnicos registrados.
          </p>
        )}
      </section>
    </div>
  )
}
