import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import type { MetricasDashboard } from '../../services/admin'
import { SeccionMetricas } from './Metricas'
import { ESTADOS_INFO } from '../../components/estados'
import { etiquetaCategoria } from '../../components/reportes'
import { obtenerIniciales } from '../../components/navigation'
import {
  BarChart,
  BarList,
  LineChart,
  Panel,
  Sparkline,
} from '../../components/charts'
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconChevronRight,
  IconClock,
  IconFlag,
  IconRefresh,
  IconUsers,
} from '../../components/icons'

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const fechaHoy = () =>
  new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const formatoSemana = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
})

function formatearSemana(iso: string): string {
  return formatoSemana.format(new Date(iso)).replace('.', '')
}

// El backend puede devolver `null` en campos como oficio o distrito, aunque el
// tipo los declare string. Se protege para no romper el render.
function capitalizar(texto: string | null | undefined): string {
  if (!texto) return ''
  const limpio = texto.replace(/_/g, ' ')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

function descripcionTecnico(
  oficio: string | null | undefined,
  distrito: string | null | undefined,
): string {
  return [capitalizar(oficio), capitalizar(distrito)].filter(Boolean).join(' · ')
}

function acumular(valores: number[]): number[] {
  let total = 0
  return valores.map((valor) => (total += valor))
}

/* ------------------------------------------------------------------ */
/* Tarjeta KPI                                                         */
/* ------------------------------------------------------------------ */

type Tono = 'positivo' | 'negativo' | 'neutral'

const TONO_CLASES: Record<Tono, string> = {
  positivo: 'bg-success-soft text-success-text',
  negativo: 'bg-danger-soft text-danger-text',
  neutral: 'bg-surface-2 text-ink-3',
}

const ACENTO_CLASES: Record<
  'primary' | 'success' | 'warning' | 'danger' | 'revision',
  { icono: string; spark: string; bar: string }
> = {
  primary: {
    icono: 'bg-primary-soft text-link',
    spark: 'text-primary',
    bar: 'bg-primary',
  },
  success: {
    icono: 'bg-success-soft text-success-text',
    spark: 'text-success',
    bar: 'bg-success',
  },
  warning: {
    icono: 'bg-warning-soft text-warning-text',
    spark: 'text-warning',
    bar: 'bg-warning',
  },
  danger: {
    icono: 'bg-danger-soft text-danger-text',
    spark: 'text-danger',
    bar: 'bg-danger',
  },
  revision: {
    icono: 'bg-revision/10 text-revision',
    spark: 'text-revision',
    bar: 'bg-revision',
  },
}

interface TarjetaKPIProps {
  titulo: string
  valor: number
  icon: ComponentType<{ className?: string }>
  acento: keyof typeof ACENTO_CLASES
  delta: { texto: string; tono: Tono }
  spark?: number[]
  alerta?: { texto: string } | null
}

function TarjetaKPI({
  titulo,
  valor,
  icon: Icon,
  acento,
  delta,
  spark,
  alerta,
}: TarjetaKPIProps) {
  const estilo = ACENTO_CLASES[acento]

  return (
    <article className="group relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-sm transition duration-[var(--duration)] ease-[var(--ease)] hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`absolute inset-x-0 top-0 h-1 ${estilo.bar}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          {titulo}
        </p>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${estilo.icono}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-4 font-display text-4xl font-semibold leading-none tracking-tight tabular-nums text-ink">
        {valor}
      </p>

      <div className="mt-4 flex items-end justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONO_CLASES[delta.tono]}`}
        >
          {delta.texto}
        </span>
        {spark && spark.length > 1 ? (
          <Sparkline datos={spark} className={estilo.spark} />
        ) : (
          <span className="h-8 w-20" aria-hidden="true" />
        )}
      </div>

      {alerta && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-danger-soft px-2 py-1 text-xs font-medium text-danger-text">
          <IconAlertTriangle className="h-3.5 w-3.5" />
          {alerta.texto}
        </p>
      )}
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

function SkeletonDashboard() {
  return (
    <div className="space-y-5">
      <div className="h-44 animate-pulse rounded-xl bg-line" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div
            key={indice}
            className="h-40 animate-pulse rounded-lg bg-line"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-lg bg-line xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-lg bg-line" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Bloque de prioridad del día                                         */
/* ------------------------------------------------------------------ */

function PrioridadHoy({ metricas }: { metricas: MetricasDashboard }) {
  const { tecnicosEnEspera, masAntiguoDias } = metricas.prioridadHoy
  const { verificados } = metricas.tarjetas
  const siguiente = metricas.colaRevision.tecnicos[0]

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-soft via-primary-soft/50 to-surface p-6 shadow-sm sm:p-8">
      <span
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary-strong/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-link">
          Prioridad de hoy
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {tecnicosEnEspera} técnico{tecnicosEnEspera === 1 ? '' : 's'} espera
          {tecnicosEnEspera === 1 ? '' : 'n'} tu revisión
        </h2>
        <p className="mt-3 text-sm text-ink-2 sm:text-base">
          El más antiguo lleva {masAntiguoDias}{' '}
          {masAntiguoDias === 1 ? 'día' : 'días'} en espera. Con{' '}
          {verificados.nuevosSemana}{' '}
          {verificados.nuevosSemana === 1
            ? 'verificación completada'
            : 'verificaciones completadas'}{' '}
          esta semana, la cola sigue avanzando.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {siguiente ? (
            <Link
              to={`/tecnicos/${siguiente.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary-strong px-4 py-2.5 text-sm font-semibold text-white transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-primary-hover active:translate-y-px"
            >
              Revisar siguiente
              <IconChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary-strong/40 px-4 py-2.5 text-sm font-semibold text-white">
              Revisar siguiente
              <IconChevronRight className="h-4 w-4" />
            </span>
          )}
          <Link
            to="/tecnicos"
            className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
          >
            Ver cola completa
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Registros y verificaciones (gráfico / tabla)                        */
/* ------------------------------------------------------------------ */

function RegistrosVerificaciones({ metricas }: { metricas: MetricasDashboard }) {
  const [vista, setVista] = useState<'grafico' | 'tabla'>('grafico')
  const serie = metricas.registrosVerificaciones.serie
  const etiquetas = serie.map((punto) => formatearSemana(punto.semanaInicio))

  return (
    <Panel
      titulo="Registros y verificaciones"
      descripcion={`Técnicos por semana · últimas ${metricas.registrosVerificaciones.semanas} semanas`}
      className="xl:col-span-2"
      accion={
        <div className="inline-flex rounded-md border border-line p-0.5">
          {(['grafico', 'tabla'] as const).map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => setVista(opcion)}
              className={`rounded-[7px] px-3 py-1 text-sm font-medium capitalize transition duration-[var(--duration-fast)] ease-[var(--ease)] ${
                vista === opcion
                  ? 'bg-primary-soft text-link'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              {opcion === 'grafico' ? 'Gráfico' : 'Tabla'}
            </button>
          ))}
        </div>
      }
    >
      {vista === 'grafico' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-5 text-sm">
            <span className="inline-flex items-center gap-2 text-ink-2">
              <span className="h-2.5 w-4 rounded-full bg-chart-1" />
              Registros nuevos
            </span>
            <span className="inline-flex items-center gap-2 text-ink-2">
              <span className="h-2.5 w-4 rounded-full bg-chart-4" />
              Verificados
            </span>
          </div>
          <LineChart
            etiquetas={etiquetas}
            series={[
              {
                nombre: 'Registros nuevos',
                colorVar: 'var(--color-chart-1)',
                datos: serie.map((punto) => punto.registrosNuevos),
                mostrarPuntos: true,
                relleno: true,
              },
              {
                nombre: 'Verificados',
                colorVar: 'var(--color-chart-4)',
                datos: serie.map((punto) => punto.verificados),
                punteada: true,
                mostrarPuntos: true,
              },
            ]}
          />
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
                <th className="py-2 pr-4 font-medium">Semana</th>
                <th className="py-2 pr-4 text-right font-medium">
                  Registros nuevos
                </th>
                <th className="py-2 text-right font-medium">Verificados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {serie.map((punto) => (
                <tr key={punto.semanaInicio}>
                  <td className="py-2.5 pr-4 text-ink-2">
                    {formatearSemana(punto.semanaInicio)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-ink">
                    {punto.registrosNuevos}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink">
                    {punto.verificados}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/* Técnicos por estado                                                 */
/* ------------------------------------------------------------------ */

function TecnicosPorEstado({ metricas }: { metricas: MetricasDashboard }) {
  const { total, estados } = metricas.tecnicosPorEstado
  const visibles = estados.filter((estado) => estado.total > 0)

  return (
    <Panel
      titulo="Técnicos por estado"
      descripcion="Distribución del proceso de verificación"
    >
      {total > 0 && (
        <div
          className="mb-5 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-surface-2"
          role="img"
          aria-label="Distribución de técnicos por estado"
        >
          {visibles.map((estado) => (
            <span
              key={estado.estado}
              className={`h-full ${ESTADOS_INFO[estado.estado].bar}`}
              style={{ width: `${(estado.total / total) * 100}%` }}
              title={`${ESTADOS_INFO[estado.estado].label}: ${estado.total}`}
            />
          ))}
        </div>
      )}

      <ul className="space-y-3.5">
        {estados.map((estado) => {
          const info = ESTADOS_INFO[estado.estado]
          return (
            <li key={estado.estado}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-ink">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${info.dot}`}
                    aria-hidden="true"
                  />
                  {info.label}
                </span>
                <span className="flex items-baseline gap-2 tabular-nums">
                  <span className="font-semibold text-ink">{estado.total}</span>
                  <span className="w-11 text-right text-ink-3">
                    {estado.porcentaje}%
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${info.bar} transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]`}
                  style={{ width: `${estado.porcentaje}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/* Cola de revisión                                                    */
/* ------------------------------------------------------------------ */

function BadgeDocumentos({
  item,
}: {
  item: MetricasDashboard['colaRevision']['tecnicos'][number]
}) {
  if (item.estadoDocumentos === 'completos') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success-text">
        <IconCheckCircle className="h-3.5 w-3.5" />
        Documentos completos
      </span>
    )
  }

  const cantidad = item.faltantes?.length ?? 0
  const texto =
    cantidad > 0
      ? `Faltan ${cantidad} documento${cantidad === 1 ? '' : 's'}`
      : 'Faltan documentos'

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning-text">
      <IconAlertTriangle className="h-3.5 w-3.5" />
      {texto}
    </span>
  )
}

function ColaRevision({ metricas }: { metricas: MetricasDashboard }) {
  const tecnicos = metricas.colaRevision.tecnicos

  return (
    <Panel
      titulo="Cola de revisión"
      descripcion="Los más antiguos primero"
      className="xl:col-span-2"
      accion={
        <Link
          to="/tecnicos"
          className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-3 py-1.5 text-sm font-semibold text-link transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-primary/15"
        >
          Ver todos
        </Link>
      }
    >
      {tecnicos.length === 0 ? (
        <p className="rounded-md bg-surface-2 px-4 py-8 text-center text-sm text-ink-2">
          No hay técnicos esperando revisión.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {tecnicos.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-link">
                {obtenerIniciales(item.nombre)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.nombre}</p>
                <p className="truncate text-xs capitalize text-ink-3">
                  {descripcionTecnico(item.oficio, item.distrito) ||
                    'Sin oficio ni distrito'}
                </p>
              </div>
              <BadgeDocumentos item={item} />
              <span className="shrink-0 whitespace-nowrap text-xs text-ink-3">
                hace {item.diasEsperando}{' '}
                {item.diasEsperando === 1 ? 'día' : 'días'}
              </span>
              <Link
                to={`/tecnicos/${item.id}`}
                className="shrink-0 rounded-md bg-primary-soft px-3 py-1.5 text-sm font-semibold text-link transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-primary/15"
              >
                Revisar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/* Tiempo medio de verificación                                        */
/* ------------------------------------------------------------------ */

function TiempoVerificacion({ metricas }: { metricas: MetricasDashboard }) {
  const { promedioHoras, vsMesPasadoPorcentaje } = metricas.tiempoVerificacion

  if (promedioHoras === null) {
    return (
      <Panel
        titulo="Tiempo medio de verificación"
        descripcion="Desde el registro hasta la decisión"
      >
        <p className="rounded-md bg-surface-2 px-4 py-8 text-center text-sm text-ink-2">
          Aún no hay suficientes decisiones para calcular el promedio.
        </p>
      </Panel>
    )
  }

  const escala = 72
  const posicion = Math.min(100, Math.max(0, (promedioHoras / escala) * 100))
  const mejora = vsMesPasadoPorcentaje !== null && vsMesPasadoPorcentaje < 0

  return (
    <Panel
      titulo="Tiempo medio de verificación"
      descripcion="Desde el registro hasta la decisión"
    >
      <p className="font-display text-4xl font-semibold leading-none tabular-nums text-ink">
        {Math.round(promedioHoras)}
        <span className="ml-1.5 text-lg font-medium text-ink-3">horas</span>
      </p>

      {vsMesPasadoPorcentaje !== null && (
        <p
          className={`mt-2 text-sm font-medium ${
            mejora ? 'text-success-text' : 'text-danger-text'
          }`}
        >
          {mejora ? '↓' : '↑'} {Math.abs(vsMesPasadoPorcentaje)}% frente al mes
          pasado
        </p>
      )}

      <div className="mt-6">
        <div className="relative h-2 w-full rounded-full bg-surface-2">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${posicion}%` }}
          />
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-primary shadow-sm"
            style={{ left: `${posicion}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs tabular-nums text-ink-3">
          <span>0 h</span>
          <span>24 h</span>
          <span>48 h</span>
          <span>72 h</span>
        </div>
      </div>

      <p
        className={`mt-5 flex items-start gap-2 rounded-md px-4 py-3 text-sm ${
          mejora
            ? 'bg-success-soft text-success-text'
            : 'bg-warning-soft text-warning-text'
        }`}
      >
        {mejora ? (
          <>
            <IconClock className="mt-0.5 h-4 w-4 shrink-0" />
            El tiempo de verificación bajó respecto al mes pasado.
          </>
        ) : (
          <>
            <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            El tiempo de verificación subió respecto al mes pasado.
          </>
        )}
      </p>
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/* Error                                                               */
/* ------------------------------------------------------------------ */

function BloqueError({ error, onReintentar }: { error: string; onReintentar: () => void }) {
  return (
    <section
      role="alert"
      className="flex flex-col items-start justify-between gap-4 rounded-lg border border-danger/30 bg-danger-soft p-5 sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-danger/10 text-danger-text">
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
        onClick={onReintentar}
        className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink shadow-sm transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
      >
        <IconRefresh className="h-4 w-4" />
        Reintentar
      </button>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { usuario } = useAuth()
  const [mes, setMes] = useState<string>(new Date().toISOString().slice(0, 7))
  const {
    metricas,
    cargando,
    error,
    recargar,
  } = useDashboard(mes)

  const encabezado = (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
        className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink shadow-sm transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
      >
        <IconRefresh className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
        Actualizar
      </button>
    </header>
  )

  if (cargando && !metricas) {
    return (
      <div className="space-y-5">
        {encabezado}
        <SkeletonDashboard />
      </div>
    )
  }

  if ((error && !metricas) || !metricas) {
    return (
      <div className="space-y-5">
        {encabezado}
        <BloqueError
          error={error ?? 'Ocurrió un error inesperado.'}
          onReintentar={recargar}
        />
      </div>
    )
  }

  const t = metricas.tarjetas
  const serieRegistros = metricas.registrosVerificaciones.serie
  const acumRegistros = acumular(serieRegistros.map((punto) => punto.registrosNuevos))
  const acumVerificados = acumular(serieRegistros.map((punto) => punto.verificados))
  const backlog = acumRegistros.map((valor, indice) => valor - acumVerificados[indice])

  const deltaReportes = t.reportesAbiertos.total - t.reportesAbiertos.vsSemanaPasada
  const deltaRevision = t.enRevision.total - t.enRevision.vsSemanaPasada

  const cancela = metricas.cancelacionesTardiasSemanales
  const ultimoCancela = cancela.serie.at(-1)?.total ?? 0
  const bajada =
    cancela.pico > 0
      ? Math.round(((cancela.pico - ultimoCancela) / cancela.pico) * 100)
      : 0

  return (
    <div className="space-y-5">
      {encabezado}

      {error && (
        <BloqueError error={error} onReintentar={recargar} />
      )}

      <PrioridadHoy metricas={metricas} />

      {/* KPIs */}
      <section
        aria-label="Métricas principales"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <TarjetaKPI
          titulo="Reportes abiertos"
          valor={t.reportesAbiertos.total}
          icon={IconFlag}
          acento="danger"
          delta={{
            texto:
              deltaReportes === 0
                ? 'Igual que la semana pasada'
                : `${deltaReportes < 0 ? '↓' : '↑'} ${Math.abs(deltaReportes)} ${
                    deltaReportes < 0 ? 'menos' : 'más'
                  } que la semana pasada`,
            tono: deltaReportes > 0 ? 'negativo' : deltaReportes < 0 ? 'positivo' : 'neutral',
          }}
          alerta={
            t.reportesAbiertos.masDe48h > 0
              ? {
                  texto: `${t.reportesAbiertos.masDe48h} ${
                    t.reportesAbiertos.masDe48h === 1 ? 'lleva' : 'llevan'
                  } más de 48 h`,
                }
              : null
          }
        />
        <TarjetaKPI
          titulo="Técnicos totales"
          valor={t.tecnicosTotales.total}
          icon={IconUsers}
          acento="primary"
          delta={{
            texto:
              t.tecnicosTotales.nuevosSemana === 0
                ? 'Sin nuevos esta semana'
                : `↑ ${t.tecnicosTotales.nuevosSemana} nuevos esta semana`,
            tono: t.tecnicosTotales.nuevosSemana > 0 ? 'positivo' : 'neutral',
          }}
          spark={acumRegistros}
        />
        <TarjetaKPI
          titulo="Verificados"
          valor={t.verificados.total}
          icon={IconCheckCircle}
          acento="success"
          delta={{
            texto:
              t.verificados.nuevosSemana === 0
                ? `${t.verificados.porcentajeDelTotal}% del total`
                : `↑ ${t.verificados.nuevosSemana} esta semana`,
            tono: t.verificados.nuevosSemana > 0 ? 'positivo' : 'neutral',
          }}
          spark={acumVerificados}
        />
        <TarjetaKPI
          titulo="En revisión"
          valor={t.enRevision.total}
          icon={IconClock}
          acento="revision"
          delta={{
            texto:
              deltaRevision === 0
                ? 'Igual que la semana pasada'
                : `${deltaRevision < 0 ? '↓' : '↑'} ${Math.abs(deltaRevision)} ${
                    deltaRevision < 0 ? 'menos' : 'más'
                  } que la semana pasada`,
            tono: deltaRevision > 0 ? 'negativo' : deltaRevision < 0 ? 'positivo' : 'neutral',
          }}
          spark={backlog}
        />
      </section>

      {/* Gráfico + estados */}
      <section className="grid gap-4 xl:grid-cols-3">
        <RegistrosVerificaciones metricas={metricas} />
        <TecnicosPorEstado metricas={metricas} />
      </section>

      {/* Motivos, cancelaciones y especialidad */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Panel
          titulo="Reportes por motivo"
          descripcion={`Últimos ${metricas.reportesPorMotivo.dias} días · ${metricas.reportesPorMotivo.total} reportes`}
        >
          {metricas.reportesPorMotivo.motivos.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-2">
              No hay reportes en este periodo.
            </p>
          ) : (
            <BarList
              items={metricas.reportesPorMotivo.motivos.map((motivo) => ({
                etiqueta: etiquetaCategoria(motivo.categoria),
                total: motivo.total,
                porcentaje: motivo.porcentaje,
              }))}
              colorClass="bg-chart-1"
            />
          )}
        </Panel>

        <Panel
          titulo="Cancelaciones tardías"
          descripcion={`Por semana · últimas ${cancela.semanas} semanas`}
          accion={
            bajada > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-success-text">
                ↓ {bajada}% desde el pico
              </span>
            ) : null
          }
        >
          {cancela.serie.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-2">
              No hay cancelaciones tardías registradas.
            </p>
          ) : (
            <BarChart
              datos={cancela.serie.map((punto) => punto.total)}
              etiquetas={cancela.serie.map((punto) => formatearSemana(punto.semanaInicio))}
              colorVar="var(--color-chart-2)"
              colorPicoVar="var(--color-chart-1)"
              resaltarPico
            />
          )}
        </Panel>

        <Panel
          titulo="Técnicos por especialidad"
          descripcion={`Sobre ${metricas.tecnicosPorOficio.total} registrados`}
        >
          {metricas.tecnicosPorOficio.oficios.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-2">
              Aún no hay técnicos registrados.
            </p>
          ) : (
            <BarList
              items={metricas.tecnicosPorOficio.oficios.map((oficio) => ({
                etiqueta: capitalizar(oficio.oficio) || 'Sin especialidad',
                total: oficio.total,
                porcentaje: oficio.porcentaje,
              }))}
              colorClass="bg-chart-2"
            />
          )}
        </Panel>
      </section>

      {/* Cola + tiempo */}
      <section className="grid gap-4 xl:grid-cols-3">
        <ColaRevision metricas={metricas} />
        <TiempoVerificacion metricas={metricas} />
      </section>

      {/* Métricas de evolución: técnicos, servicios/clientes y monetización */}
      <SeccionMetricas
        metricas={metricas}
        mes={mes}
        onMesChange={setMes}
      />
    </div>
  )
}
