import type { ReactNode } from 'react'
import {
  IconAlertTriangle,
  IconClock,
  IconRefresh,
  IconUsers,
} from '../../components/icons'
import { obtenerIniciales } from '../../components/navigation'
import { useCancelacionesTardias } from '../../hooks/useCancelacionesTardias'

const ROLES: Record<string, { label: string; clases: string }> = {
  cliente: { label: 'Cliente', clases: 'bg-primary-soft text-link' },
  tecnico: { label: 'Técnico', clases: 'bg-success-soft text-success-text' },
}

function etiquetaCancelaciones(total: number): string {
  return `${total} ${total === 1 ? 'cancelación' : 'cancelaciones'}`
}

function etiquetaUsuarios(total: number): string {
  return `${total} ${total === 1 ? 'usuario' : 'usuarios'}`
}

function Resumen({
  icono,
  valor,
  etiqueta,
  tono,
}: {
  icono: ReactNode
  valor: string
  etiqueta: string
  tono: string
}) {
  return (
    <div className="flex items-center gap-3 bg-surface p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${tono}`}>
        {icono}
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold leading-tight tabular-nums text-ink">
          {valor}
        </p>
        <p className="truncate text-xs text-ink-3">{etiqueta}</p>
      </div>
    </div>
  )
}

export default function CancelacionesTardias() {
  const { usuarios, cargando, error, recargar } = useCancelacionesTardias()

  const totalCancelaciones = usuarios.reduce(
    (suma, usuario) => suma + usuario.cancelacionesTardias,
    0,
  )
  const promedio =
    usuarios.length > 0 ? (totalCancelaciones / usuarios.length).toFixed(1) : '0'
  const maximo = usuarios.reduce(
    (valor, usuario) => Math.max(valor, usuario.cancelacionesTardias),
    0,
  )

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-danger-soft text-danger-text">
              <IconClock className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Cancelaciones tardías
              </h2>
              <p className="mt-0.5 max-w-xl text-sm text-ink-2">
                Usuarios con cancelaciones tardías en los últimos 30 días,
                ordenados de mayor a menor.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={recargar}
            aria-label="Recargar"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink"
          >
            <IconRefresh className="h-4 w-4" />
            <span className="hidden sm:inline">Recargar</span>
          </button>
        </div>

        <div className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-3">
          <Resumen
            icono={<IconUsers className="h-5 w-5" />}
            valor={etiquetaUsuarios(usuarios.length)}
            etiqueta="Usuarios afectados"
            tono="rounded-md bg-primary-soft text-link"
          />
          <Resumen
            icono={<IconClock className="h-5 w-5" />}
            valor={etiquetaCancelaciones(totalCancelaciones)}
            etiqueta="Cancelaciones (30 días)"
            tono="rounded-md bg-danger-soft text-danger-text"
          />
          <Resumen
            icono={<IconAlertTriangle className="h-5 w-5" />}
            valor={promedio}
            etiqueta="Promedio por usuario"
            tono="rounded-md bg-warning-soft text-warning-text"
          />
        </div>
      </section>

      {error && (
        <section className="flex flex-col items-start justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-danger-soft text-danger-text">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                No se pudieron cargar las cancelaciones
              </p>
              <p className="text-sm text-ink-2">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={recargar}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
          >
            <IconRefresh className="h-4 w-4" />
            Reintentar
          </button>
        </section>
      )}

      <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-ink">
            Usuarios con más cancelaciones
          </h3>
        </div>

        {cargando ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 4 }).map((_, indice) => (
              <div
                key={indice}
                className="flex animate-pulse items-center gap-4 p-5"
              >
                <div className="h-8 w-8 bg-line" />
                <div className="h-10 w-10 bg-line" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-line" />
                  <div className="h-3 w-56 bg-line" />
                </div>
                <div className="hidden h-6 w-24 bg-line sm:block" />
              </div>
            ))}
          </div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-success-soft text-success-text">
              <IconClock className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              No hay cancelaciones tardías
            </h3>
            <p className="mt-1 max-w-sm text-sm text-ink-2">
              En los últimos 30 días ningún cliente ni técnico canceló un
              servicio fuera de tiempo. Aquí aparecerán cuando suceda.
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-line">
            {usuarios.map((usuario, indice) => {
              const porcentaje = Math.round(
                (usuario.cancelacionesTardias / maximo) * 100,
              )
              const rol =
                ROLES[usuario.rol] ?? {
                  label: usuario.rol,
                  clases: 'bg-ink-3/10 text-ink-3',
                }
              const primerPuesto = indice === 0
              return (
                <li key={usuario.usuarioId} className="p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm font-semibold tabular-nums ${
                        primerPuesto
                          ? 'bg-danger/10 text-danger'
                          : 'bg-surface-2 text-ink-3'
                      }`}
                    >
                      {indice + 1}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-link">
                      {obtenerIniciales(usuario.nombre)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-ink">
                            {usuario.nombre}
                          </p>
                          <span
                            className={`inline-flex shrink-0 px-2 py-0.5 text-xs font-medium ${rol.clases}`}
                          >
                            {rol.label}
                          </span>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                          {etiquetaCancelaciones(usuario.cancelacionesTardias)}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-ink-3">
                        {usuario.email}
                      </p>
                      <div
                        className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-2"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={porcentaje}
                        aria-label={`Cancelaciones de ${usuario.nombre}`}
                      >
                        <div
                          className={`h-full rounded-full ${primerPuesto ? 'bg-danger' : 'bg-ink-3'}`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {!cargando && !error && usuarios.length > 0 && (
        <p className="text-sm text-ink-3">
          {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} ·{' '}
          {etiquetaCancelaciones(totalCancelaciones)} en total.
        </p>
      )}
    </div>
  )
}

