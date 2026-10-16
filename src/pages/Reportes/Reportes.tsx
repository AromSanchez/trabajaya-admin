import { Link, useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge'
import {
  CATEGORIAS_REPORTE,
  ESTADOS_REPORTE_INFO,
  TIPOS_OBJETIVO,
  etiquetaCategoria,
  etiquetaTipoObjetivo,
} from '../../components/reportes'
import {
  IconAlertTriangle,
  IconChevronRight,
  IconFlag,
  IconRefresh,
} from '../../components/icons'
import { useReportes } from '../../hooks/useReportes'
import type { FiltrosUI } from '../../hooks/useReportes'
import type { EstadoReporte } from '../../services/admin'

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const ESTADOS_CHIPS: { valor: FiltrosUI['estado']; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'pendiente', label: 'Pendiente' },
  { valor: 'resuelto', label: 'Resuelto' },
  { valor: 'descartado', label: 'Descartado' },
]

export default function Reportes() {
  const {
    reportes,
    paginacion,
    cargando,
    error,
    filtros,
    cambiarFiltros,
    irAPagina,
    recargar,
  } = useReportes()
  const navigate = useNavigate()

  const pagina = paginacion?.page ?? 1
  const totalPaginas =
    paginacion && paginacion.total_paginas > 0 ? paginacion.total_paginas : 1

  return (
    <div className="space-y-5">
      <section className="space-y-4 border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          {ESTADOS_CHIPS.map((chip) => {
            const activo = filtros.estado === chip.valor
            const clases =
              activo && chip.valor !== 'todos'
                ? `${ESTADOS_REPORTE_INFO[chip.valor as EstadoReporte].badge} border border-transparent`
                : activo
                  ? 'border border-transparent bg-primary text-white'
                  : 'border border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
            return (
              <button
                key={chip.valor}
                type="button"
                onClick={() => cambiarFiltros({ estado: chip.valor })}
                className={`px-3 py-1.5 text-sm font-medium transition duration-[var(--duration-fast)] ease-[var(--ease)] ${clases}`}
              >
                {chip.label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={recargar}
            aria-label="Recargar"
            className="ml-auto inline-flex items-center gap-2 border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink"
          >
            <IconRefresh className="h-4 w-4" />
            <span className="hidden sm:inline">Recargar</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-line pt-4">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Tipo de objetivo
            <select
              value={filtros.tipoObjetivo}
              onChange={(evento) =>
                cambiarFiltros({
                  tipoObjetivo: evento.target
                    .value as FiltrosUI['tipoObjetivo'],
                })
              }
              className="border border-line bg-surface px-3 py-1.5 text-sm font-normal normal-case tracking-normal text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] focus:border-primary"
            >
              <option value="todos">Todos</option>
              {TIPOS_OBJETIVO.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Categoría
            <select
              value={filtros.categoria}
              onChange={(evento) =>
                cambiarFiltros({
                  categoria: evento.target.value as FiltrosUI['categoria'],
                })
              }
              className="border border-line bg-surface px-3 py-1.5 text-sm font-normal normal-case tracking-normal text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] focus:border-primary"
            >
              <option value="todas">Todas</option>
              {CATEGORIAS_REPORTE.map((categoria) => (
                <option key={categoria.valor} value={categoria.valor}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error && (
        <section className="flex flex-col items-start justify-between gap-3 border border-danger/30 bg-danger/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center bg-danger/10 text-danger">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                No se pudieron cargar los reportes
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

      <section className="overflow-hidden border border-line bg-surface">
        {cargando ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, indice) => (
              <div
                key={indice}
                className="flex animate-pulse items-center gap-4 p-5"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-line" />
                  <div className="h-3 w-64 bg-line" />
                </div>
                <div className="hidden h-6 w-20 bg-line sm:block" />
              </div>
            ))}
          </div>
        ) : reportes.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center bg-primary/10 text-primary">
              <IconFlag className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              No hay reportes
            </h3>
            <p className="mt-1 text-sm text-ink-2">
              No se encontraron reportes con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
                  <th className="px-5 py-3 font-medium">Objetivo</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">
                    Categoría
                  </th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">
                    Reportante
                  </th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    Fecha
                  </th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reportes.map((reporte) => (
                  <tr
                    key={reporte.id}
                    onClick={() => navigate(`/reportes/${reporte.id}`)}
                    className="cursor-pointer transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">
                        {reporte.objetivo.nombre ??
                          `${etiquetaTipoObjetivo(reporte.objetivo.tipo)} #${reporte.objetivo.id}`}
                      </p>
                      <p className="text-xs capitalize text-ink-3">
                        {etiquetaTipoObjetivo(reporte.tipoObjetivo)} · Reporte #
                        {reporte.id}
                      </p>
                    </td>
                    <td className="hidden px-5 py-4 text-ink-2 md:table-cell">
                      {etiquetaCategoria(reporte.categoria)}
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <p className="text-ink-2">{reporte.reportante.nombre}</p>
                      <p className="text-xs capitalize text-ink-3">
                        {reporte.reportante.rol}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge info={ESTADOS_REPORTE_INFO[reporte.estado]} />
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-4 text-ink-3 sm:table-cell">
                      {formatoFecha.format(new Date(reporte.createdAt))}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/reportes/${reporte.id}`}
                        onClick={(evento) => evento.stopPropagation()}
                        aria-label={`Ver reporte ${reporte.id}`}
                        className="inline-grid h-8 w-8 place-items-center text-ink-3 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-line hover:text-ink"
                      >
                        <IconChevronRight className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!cargando && !error && paginacion && paginacion.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-3">
            Mostrando {reportes.length} de {paginacion.total}{' '}
            {paginacion.total === 1 ? 'reporte' : 'reportes'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => irAPagina(pagina - 1)}
              disabled={pagina <= 1}
              className="border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface"
            >
              Anterior
            </button>
            <span className="text-sm tabular-nums text-ink-2">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => irAPagina(pagina + 1)}
              disabled={pagina >= totalPaginas}
              className="border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
