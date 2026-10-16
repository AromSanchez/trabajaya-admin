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
    <div className="animate-pulse rounded-2xl border border-dark/10 bg-white p-5 shadow-sm">
      <div className="h-11 w-11 rounded-xl bg-dark/5" />
      <div className="mt-4 h-8 w-16 rounded bg-dark/5" />
      <div className="mt-2 h-4 w-28 rounded bg-dark/5" />
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const { metricas, cargando, error, recargar } = useDashboard()

  const total = metricas?.totalTecnicos ?? 0

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-dark/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-dark">
          Hola, {usuario?.nombre ?? 'Administrador'}
        </h2>
        <p className="mt-1 text-sm text-dark/60">
          Resumen general de la plataforma.
        </p>
      </section>

      {error && (
        <section className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-dark">
                No se pudieron cargar las métricas
              </p>
              <p className="text-sm text-dark/60">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={recargar}
            className="inline-flex items-center gap-2 rounded-lg border border-dark/15 bg-white px-3 py-2 text-sm font-medium text-dark transition hover:bg-dark/5"
          >
            <IconRefresh className="h-4 w-4" />
            Reintentar
          </button>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-2xl border border-dark/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-dark">
            Técnicos por estado
          </h3>
          {!cargando && !error && (
            <span className="text-sm text-dark/50">{total} en total</span>
          )}
        </div>

        {cargando ? (
          <div className="mt-5 space-y-4">
            {ESTADOS_VERIFICACION.map((estado) => (
              <div key={estado} className="animate-pulse">
                <div className="mb-2 h-4 w-24 rounded bg-dark/5" />
                <div className="h-2 w-full rounded-full bg-dark/5" />
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
                    <span className="flex items-center gap-2 font-medium text-dark/70">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${info.dot}`}
                        aria-hidden="true"
                      />
                      {info.label}
                    </span>
                    <span className="tabular-nums text-dark/60">
                      {cantidad}
                      {total > 0 && (
                        <span className="ml-1 text-dark/40">
                          · {porcentaje}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-dark/5">
                    <div
                      className={`h-full rounded-full ${info.bar} transition-[width] duration-500`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {!cargando && !error && total === 0 && (
          <p className="mt-5 rounded-xl bg-dark/[0.03] px-4 py-3 text-center text-sm text-dark/50">
            Aún no hay técnicos registrados.
          </p>
        )}
      </section>
    </div>
  )
}
