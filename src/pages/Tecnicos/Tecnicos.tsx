import { Link, useNavigate } from 'react-router-dom'
import { ESTADOS_VERIFICACION } from '../../services/admin'
import type { EstadoVerificacion } from '../../services/admin'
import { ESTADOS_INFO } from '../../components/estados'
import { obtenerIniciales } from '../../components/navigation'
import {
  IconAlertTriangle,
  IconChevronRight,
  IconRefresh,
  IconUsers,
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
  const { estado, tecnicos, cargando, error, cambiarEstado, recargar } =
    useTecnicos()
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-dark/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {FILTROS.map((filtro) => {
            const activo = estado === filtro.valor
            const clases =
              activo && filtro.valor !== 'todos'
                ? ESTADOS_INFO[filtro.valor].badge
                : activo
                  ? 'bg-primary text-white'
                  : 'bg-dark/5 text-dark/60 hover:bg-dark/10'
            return (
              <button
                key={filtro.valor}
                type="button"
                onClick={() => cambiarEstado(filtro.valor)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${clases}`}
              >
                {filtro.label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={recargar}
            aria-label="Recargar"
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-dark/15 px-3 py-1.5 text-sm font-medium text-dark/70 transition hover:bg-dark/5"
          >
            <IconRefresh className="h-4 w-4" />
            <span className="hidden sm:inline">Recargar</span>
          </button>
        </div>
      </section>

      {error && (
        <section className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-dark">
                No se pudieron cargar los técnicos
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

      <section className="overflow-hidden rounded-2xl border border-dark/10 bg-white shadow-sm">
        {cargando ? (
          <div className="divide-y divide-dark/5">
            {Array.from({ length: 6 }).map((_, indice) => (
              <div
                key={indice}
                className="flex animate-pulse items-center gap-4 p-5"
              >
                <div className="h-10 w-10 rounded-full bg-dark/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-dark/5" />
                  <div className="h-3 w-56 rounded bg-dark/5" />
                </div>
                <div className="hidden h-6 w-20 rounded-full bg-dark/5 sm:block" />
              </div>
            ))}
          </div>
        ) : tecnicos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <IconUsers className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-dark">
              {estado === 'todos'
                ? 'Aún no hay técnicos registrados'
                : `No hay técnicos en estado «${ESTADOS_INFO[estado as EstadoVerificacion].label}»`}
            </h3>
            <p className="mt-1 text-sm text-dark/55">
              {estado === 'todos'
                ? 'Cuando un técnico se registre aparecerá aquí.'
                : 'Prueba con otro filtro de estado.'}
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dark/10 text-xs uppercase tracking-wide text-dark/45">
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
              <tbody className="divide-y divide-dark/5">
                {tecnicos.map((tecnico) => {
                  const info = ESTADOS_INFO[tecnico.estadoVerificacion]
                  return (
                    <tr
                      key={tecnico.id}
                      onClick={() => navigate(`/tecnicos/${tecnico.id}`)}
                      className="cursor-pointer transition hover:bg-dark/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {obtenerIniciales(tecnico.usuario.nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-dark">
                              {tecnico.usuario.nombre}
                            </p>
                            <p className="truncate text-xs text-dark/50">
                              {tecnico.usuario.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 capitalize text-dark/70 md:table-cell">
                        {tecnico.oficio || '—'}
                      </td>
                      <td className="hidden px-5 py-4 text-dark/70 lg:table-cell">
                        {tecnico.distritos.length > 0
                          ? tecnico.distritos.join(', ')
                          : '—'}
                      </td>
                      <td className="hidden px-5 py-4 text-dark/70 lg:table-cell">
                        {etiquetaExperiencia(tecnico.aniosExperiencia)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${info.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${info.dot}`}
                            aria-hidden="true"
                          />
                          {info.label}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-5 py-4 text-dark/55 sm:table-cell">
                        {formatearFecha(tecnico.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/tecnicos/${tecnico.id}`}
                          onClick={(evento) => evento.stopPropagation()}
                          aria-label={`Ver detalle de ${tecnico.usuario.nombre}`}
                          className="inline-grid h-8 w-8 place-items-center rounded-lg text-dark/40 transition hover:bg-dark/5 hover:text-dark"
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
        <p className="text-sm text-dark/50">
          {tecnicos.length}{' '}
          {tecnicos.length === 1 ? 'técnico' : 'técnicos'}
          {estado !== 'todos'
            ? ` en estado «${ESTADOS_INFO[estado as EstadoVerificacion].label}»`
            : ''}
          .
        </p>
      )}
    </div>
  )
}
