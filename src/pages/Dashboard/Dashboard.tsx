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
    <div className="animate-pulse rounded-[16px] border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.10)]">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded-[4px] bg-line" />
        <div className="h-9 w-9 rounded-[10px] bg-line" />
      </div>
      <div className="mt-6 h-9 w-20 rounded-[4px] bg-line" />
      <div className="mt-3 h-3 w-36 rounded-[4px] bg-line" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="animate-pulse py-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded-[4px] bg-line" />
        <div className="h-4 w-16 rounded-[4px] bg-line" />
      </div>
      <div className="mt-3 h-2 w-full rounded-[9999px] bg-line" />
    </div>
  )
}

const fechaHoy = () =>
  new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export default function Dashboard() {
  const { usuario } = useAuth()
  const { metricas, cargando, error, recargar } = useDashboard()

  const total = metricas?.totalTecnicos ?? 0
  const verificados = metricas?.tecnicosPorEstado.verificado ?? 0
  const tasaVerificacion =
    total > 0 ? Math.round((verificados / total) * 100) : 0

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Encabezado */}
      <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Panel de control · <span className="capitalize">{fechaHoy()}</span>
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            Hola, {usuario?.nombre ?? 'Administrador'}
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            Estado general de la plataforma y verificación de técnicos.
          </p>
        </div>

        <button
          type="button"
          onClick={recargar}
          disabled={cargando}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.10)] transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconRefresh
            className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`}
          />
          Actualizar
        </button>
      </header>

      {/* Error */}
      {error && (
        <section
          role="alert"
          className="flex flex-col items-start justify-between gap-4 rounded-[16px] border border-danger/30 bg-danger/5 p-5 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-danger/10 text-danger">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                No se pudieron cargar las métricas
              </p>
              <p className="mt-0.5 text-sm text-ink-2">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={recargar}
            className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.10)] transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
          >
            <IconRefresh className="h-4 w-4" />
            Reintentar
          </button>
        </section>
      )}

      {/* Métricas principales */}
      <section aria-label="Métricas principales">
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
                valor={verificados}
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
      </section>

      {/* Distribución por estado */}
      <section className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.10)]">
        <div className="flex flex-col gap-1 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">
              Técnicos por estado
            </h3>
            <p className="text-sm text-ink-2">
              Distribución del proceso de verificación.
            </p>
          </div>

          {!cargando && !error && total > 0 && (
            <div className="flex items-center gap-6 text-sm">
              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-wider text-ink-3">
                  Total
                </p>
                <p className="font-semibold tabular-nums text-ink">{total}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs uppercase tracking-wider text-ink-3">
                  Tasa de verificación
                </p>
                <p className="font-semibold tabular-nums text-ink">
                  {tasaVerificacion}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          {cargando ? (
            <div className="divide-y divide-line">
              {ESTADOS_VERIFICACION.map((estado) => (
                <SkeletonRow key={estado} />
              ))}
            </div>
          ) : (
            <>
              {/* Barra segmentada general */}
              {total > 0 && (
                <div
                  className="mb-2 flex h-3 w-full gap-0.5 overflow-hidden rounded-[9999px] bg-line"
                  role="img"
                  aria-label="Distribución de técnicos por estado de verificación"
                >
                  {ESTADOS_VERIFICACION.map((estado) => {
                    const cantidad = metricas?.tecnicosPorEstado[estado] ?? 0
                    if (cantidad === 0) return null
                    return (
                      <div
                        key={estado}
                        className={`h-full ${ESTADOS_INFO[estado].bar} transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]`}
                        style={{ width: `${(cantidad / total) * 100}%` }}
                        title={`${ESTADOS_INFO[estado].label}: ${cantidad}`}
                      />
                    )
                  })}
                </div>
              )}

              {/* Detalle por estado */}
              <ul className="divide-y divide-line">
                {ESTADOS_VERIFICACION.map((estado) => {
                  const info = ESTADOS_INFO[estado]
                  const cantidad = metricas?.tecnicosPorEstado[estado] ?? 0
                  const porcentaje =
                    total > 0 ? Math.round((cantidad / total) * 100) : 0
                  return (
                    <li key={estado} className="py-4 first:pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2.5 font-medium text-ink">
                          <span
                            className={`h-2.5 w-2.5 rounded-[9999px] ${info.dot}`}
                            aria-hidden="true"
                          />
                          {info.label}
                        </span>
                        <span className="flex items-baseline gap-2 tabular-nums">
                          <span className="font-semibold text-ink">
                            {cantidad}
                          </span>
                          <span className="w-10 text-right text-ink-3">
                            {porcentaje}%
                          </span>
                        </span>
                      </div>
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-[9999px] bg-line">
                        <div
                          className={`h-full rounded-[9999px] ${info.bar} transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {!cargando && !error && total === 0 && (
            <div className="mt-2 rounded-[10px] border border-dashed border-line bg-surface-2 px-4 py-8 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-[9999px] bg-surface text-ink-3">
                <IconUsers className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium text-ink">
                Aún no hay técnicos registrados
              </p>
              <p className="mt-1 text-sm text-ink-2">
                Cuando se registren, verás aquí su estado de verificación.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}