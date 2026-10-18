import { Link, useNavigate } from 'react-router-dom'
import { ESTADOS_VERIFICACION, OFICIOS } from '../../services/admin'
import type {
  EstadoVerificacion,
  Oficio,
  OrdenTecnicos,
} from '../../services/admin'
import { ESTADOS_INFO } from '../../components/estados'
import { OFICIOS_INFO, ORDEN_OPCIONES } from '../../components/tecnicos'
import { obtenerIniciales } from '../../components/navigation'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  IconAlertTriangle,
  IconChevronRight,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconX,
} from '../../components/icons'
import { useTecnicos } from '../../hooks/useTecnicos'
import type { FiltroEstado } from '../../hooks/useTecnicos'

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatearFecha(iso: string): string {
  return formatoFecha.format(new Date(iso))
}

function etiquetaExperiencia(anios: number): string {
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}

const FILTROS: { valor: FiltroEstado; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  ...ESTADOS_VERIFICACION.map((estado) => ({
    valor: estado,
    label: ESTADOS_INFO[estado].label,
  })),
]

export default function Tecnicos() {
  const {
    estado,
    oficio,
    nombre,
    orden,
    tecnicos,
    cargando,
    error,
    hayFiltros,
    cambiarEstado,
    cambiarOficio,
    cambiarNombre,
    cambiarOrden,
    limpiarFiltros,
    recargar,
  } = useTecnicos()
  const navigate = useNavigate()

  const mostrandoSkeleton = cargando && tecnicos.length === 0

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-surface p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_13rem]">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <Input
              type="text"
              value={nombre}
              onChange={(evento) => cambiarNombre(evento.target.value)}
              placeholder="Buscar por nombre o correo"
              aria-label="Buscar por nombre o correo"
              className="h-10 pl-9"
            />
          </div>

          <Select
            value={oficio}
            onValueChange={(valor) => cambiarOficio(valor as Oficio | 'todos')}
          >
            <SelectTrigger
              className="h-10 w-full"
              aria-label="Filtrar por oficio"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los oficios</SelectItem>
              {OFICIOS.map((valor) => (
                <SelectItem key={valor} value={valor}>
                  {OFICIOS_INFO[valor]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={orden}
            onValueChange={(valor) => cambiarOrden(valor as OrdenTecnicos)}
          >
            <SelectTrigger className="h-10 w-full" aria-label="Ordenar por">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDEN_OPCIONES.map((opcion) => (
                <SelectItem key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          {FILTROS.map((filtro) => {
            const activo = estado === filtro.valor
            const clases =
              activo && filtro.valor !== 'todos'
                ? `${ESTADOS_INFO[filtro.valor].badge} border border-transparent`
                : activo
                  ? 'border border-transparent bg-primary-strong text-white'
                  : 'border border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
            return (
              <button
                key={filtro.valor}
                type="button"
                onClick={() => cambiarEstado(filtro.valor)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition duration-[var(--duration-fast)] ease-[var(--ease)] ${clases}`}
              >
                {filtro.label}
              </button>
            )
          })}

          <div className="ml-auto flex items-center gap-2">
            {hayFiltros && (
              <Button
                variant="ghost"
                onClick={limpiarFiltros}
                className="h-9 text-ink-2"
              >
                <IconX />
                Limpiar filtros
              </Button>
            )}
            <Button
              variant="outline"
              onClick={recargar}
              aria-label="Recargar"
              className="h-9"
            >
              <IconRefresh className={cargando ? 'animate-spin' : ''} />
              Recargar
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <section className="flex flex-col items-start justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-danger/10 text-danger-text">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                No se pudieron cargar los técnicos
              </p>
              <p className="text-sm text-ink-2">{error}</p>
            </div>
          </div>
          <Button variant="outline" onClick={recargar} className="h-9">
            <IconRefresh />
            Reintentar
          </Button>
        </section>
      )}

      <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
        {mostrandoSkeleton ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, indice) => (
              <div
                key={indice}
                className="flex animate-pulse items-center gap-4 p-5"
              >
                <div className="h-10 w-10 bg-line" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-line" />
                  <div className="h-3 w-56 bg-line" />
                </div>
                <div className="hidden h-6 w-20 bg-line sm:block" />
              </div>
            ))}
          </div>
        ) : tecnicos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-primary-soft text-link">
              <IconUsers className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              {hayFiltros
                ? 'Sin resultados'
                : 'Aún no hay técnicos registrados'}
            </h3>
            <p className="mt-1 text-sm text-ink-2">
              {hayFiltros
                ? 'Prueba con otros filtros o limpia la búsqueda.'
                : 'Cuando un técnico se registre aparecerá aquí.'}
            </p>
            {hayFiltros && (
              <Button
                variant="outline"
                onClick={limpiarFiltros}
                className="mt-4 h-9"
              >
                <IconX />
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div
            className={`relative overflow-x-auto transition-opacity duration-[var(--duration)] ${
              cargando ? 'opacity-60' : 'opacity-100'
            }`}
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
                  <th className="px-5 py-3 font-medium">Técnico</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">
                    Oficio
                  </th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">
                    Distritos
                  </th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">
                    Experiencia
                  </th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    Registrado
                  </th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tecnicos.map((tecnico) => {
                  const info = ESTADOS_INFO[tecnico.estadoVerificacion]
                  return (
                    <tr
                      key={tecnico.id}
                      onClick={() => navigate(`/tecnicos/${tecnico.id}`)}
                      className="cursor-pointer transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-link">
                            {obtenerIniciales(tecnico.usuario.nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {tecnico.usuario.nombre}
                            </p>
                            <p className="truncate text-xs text-ink-3">
                              {tecnico.usuario.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 capitalize text-ink-2 md:table-cell">
                        {tecnico.oficio ? OFICIOS_INFO[tecnico.oficio as Oficio] ?? tecnico.oficio : '—'}
                      </td>
                      <td className="hidden px-5 py-4 text-ink-2 lg:table-cell">
                        {tecnico.distritos.length > 0
                          ? tecnico.distritos.join(', ')
                          : '—'}
                      </td>
                      <td className="hidden px-5 py-4 tabular-nums text-ink-2 lg:table-cell">
                        {etiquetaExperiencia(tecnico.aniosExperiencia)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium ${info.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 ${info.dot}`}
                            aria-hidden="true"
                          />
                          {info.label}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-5 py-4 text-ink-3 sm:table-cell">
                        {formatearFecha(tecnico.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/tecnicos/${tecnico.id}`}
                          onClick={(evento) => evento.stopPropagation()}
                          aria-label={`Ver detalle de ${tecnico.usuario.nombre}`}
                          className="inline-grid h-8 w-8 place-items-center rounded-md text-ink-3 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink"
                        >
                          <IconChevronRight className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!cargando && !error && tecnicos.length > 0 && (
        <p className="text-sm text-ink-3">
          {tecnicos.length} {tecnicos.length === 1 ? 'técnico' : 'técnicos'}
          {estado !== 'todos'
            ? ` en estado «${ESTADOS_INFO[estado as EstadoVerificacion].label}»`
            : oficio !== 'todos'
              ? ` de ${OFICIOS_INFO[oficio]}`
              : ''}
          .
        </p>
      )}
    </div>
  )
}
