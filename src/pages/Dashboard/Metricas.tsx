import type { ComponentType } from 'react'
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MetricasDashboard, MetricasMonetizacion } from '../../services/admin'
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconCoins,
  IconFlag,
  IconRefresh,
  IconUsers,
} from '../../components/icons'

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const formatoSemana = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
})

function formatearSemana(iso: string): string {
  return formatoSemana.format(new Date(iso)).replace('.', '')
}

const formatoDinero = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
})

function formatearDinero(valor: number): string {
  return formatoDinero.format(valor)
}

function DeltaMes({
  etiqueta,
  actual,
  anterior,
  invertir = false,
  sufijo = '',
}: {
  etiqueta: string
  actual: number
  anterior: number
  invertir?: boolean
  sufijo?: string
}) {
  const cambio =
    anterior === 0 ? (actual > 0 ? 100 : 0) : ((actual - anterior) / anterior) * 100
  const favorable = invertir ? cambio <= 0 : cambio >= 0
  const signo = cambio >= 0 ? '+' : ''
  return (
    <div className="rounded-lg bg-surface-2 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
        {etiqueta}
      </p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
        {actual}
        {sufijo}
      </p>
      <p
        className={`mt-1 text-xs font-semibold ${
          favorable ? 'text-success-text' : 'text-danger-text'
        }`}
      >
        {cambio === 0 ? 'sin cambio' : `${signo}${cambio.toFixed(1)}% vs mes anterior`}
      </p>
    </div>
  )
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function aNumero(valor: unknown): number {
  return typeof valor === 'number' ? valor : 0
}

function aTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor : ''
}

/* ------------------------------------------------------------------ */
/* Tipos de datos internos                                             */
/* ------------------------------------------------------------------ */

interface PuntoSerie {
  semana: string
  [clave: string]: string | number
}

interface SerieDef {
  clave: string
  nombre: string
  colorVar: string
  punteada?: boolean
}

interface FilaTooltip {
  color: string
  nombre: string
  texto: string
}

/* ------------------------------------------------------------------ */
/* Gráfico de líneas (recharts) con leyenda y tooltip                  */
/* ------------------------------------------------------------------ */

function TooltipLineas({
  activo,
  etiqueta,
  filas,
}: {
  activo: boolean
  etiqueta: string
  filas: FilaTooltip[]
}) {
  if (!activo || filas.length === 0) return null

  return (
    <div className="min-w-40 rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink">{etiqueta}</p>
      <ul className="mt-1.5 space-y-1">
        {filas.map((fila) => (
          <li key={fila.nombre} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: fila.color }}
                aria-hidden="true"
              />
              {fila.nombre}
            </span>
            <span className="tabular-nums font-semibold text-ink">
              {fila.texto}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LeyendaLineas({ series }: { series: SerieDef[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-2">
      {series.map((serie) => (
        <span key={serie.clave} className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-4 rounded-full"
            style={{ backgroundColor: serie.colorVar }}
            aria-hidden="true"
          />
          {serie.nombre}
        </span>
      ))}
    </div>
  )
}

function GraficoLineas({
  datos,
  series,
  alto = 230,
  etiquetasTooltip,
}: {
  datos: PuntoSerie[]
  series: SerieDef[]
  alto?: number
  etiquetasTooltip: Record<string, string>
}) {
  return (
    <>
      <ResponsiveContainer width="100%" height={alto}>
        <LineChart
          data={datos}
          margin={{ top: 10, right: 10, bottom: 0, left: -18 }}
        >
          <XAxis
            dataKey="semana"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const filas = payload.map((entrada) => {
                const serie = series.find((s) => s.clave === entrada.dataKey)
                const valor = typeof entrada.value === 'number' ? entrada.value : 0
                const formateo = etiquetasTooltip[serie?.clave ?? '']
                return {
                  color: serie?.colorVar ?? 'var(--color-ink-3)',
                  nombre: serie?.nombre ?? String(entrada.dataKey),
                  texto: formateo ? formateo.replace('{v}', String(valor)) : String(valor),
                }
              })
              return (
                <TooltipLineas
                  activo={active}
                  etiqueta={String(label ?? '')}
                  filas={filas}
                />
              )
            }}
          />
          {series.map((serie) => (
            <Line
              key={serie.clave}
              type="monotone"
              dataKey={serie.clave}
              name={serie.nombre}
              stroke={serie.colorVar}
              strokeWidth={2.4}
              strokeDasharray={serie.punteada ? '6 4' : undefined}
              dot={{ r: 2.5, fill: 'var(--color-surface)', strokeWidth: 2 }}
              activeDot={{ r: 4.5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <LeyendaLineas series={series} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Gráfico de dona (recharts)                                          */
/* ------------------------------------------------------------------ */

interface FilaDona {
  nombre: string
  valor: number
  colorVar: string
}

function GraficoDona({ filas }: { filas: FilaDona[] }) {
  const visibles = filas.filter((fila) => fila.valor > 0)
  const total = visibles.reduce((suma, fila) => suma + fila.valor, 0)

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-[1fr_auto] md:items-center">
      <div className="relative mx-auto w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={visibles}
              dataKey="valor"
              nameKey="nombre"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              strokeWidth={0}
            >
              {visibles.map((fila) => (
                <Cell key={fila.nombre} fill={fila.colorVar} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const entrada = payload[0]
                const fila = visibles.find((f) => f.nombre === entrada.name)
                const valor = typeof entrada.value === 'number' ? entrada.value : 0
                const porcentaje =
                  total > 0 ? Math.round((valor / total) * 1000) / 10 : 0
                return (
                  <TooltipLineas
                    activo={active}
                    etiqueta={String(entrada.name ?? '')}
                    filas={[
                      {
                        color: fila?.colorVar ?? 'var(--color-ink-3)',
                        nombre: 'Servicios',
                        texto: `${valor} (${porcentaje}%)`,
                      },
                    ]}
                  />
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center"
          aria-hidden="true"
        >
          <div className="text-center">
            <p className="font-display text-3xl font-semibold tabular-nums text-ink">
              {total}
            </p>
            <p className="text-xs text-ink-3">solicitudes</p>
          </div>
        </div>
      </div>

      <ul className="space-y-2.5 text-sm">
        {visibles.map((fila) => (
          <li key={fila.nombre} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-ink-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: fila.colorVar }}
                aria-hidden="true"
              />
              {fila.nombre}
            </span>
            <span className="tabular-nums">
              <span className="font-semibold text-ink">{fila.valor}</span>
              <span className="ml-2 text-ink-3">
                {total > 0
                  ? `${Math.round((fila.valor / total) * 1000) / 10}%`
                  : '0%'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tarjeta métrica compacta                                            */
/* ------------------------------------------------------------------ */

function TarjetaMetrica({
  titulo,
  valor,
  unidad,
  descripcion,
  delta,
  icono: Icon,
}: {
  titulo: string
  valor: string
  unidad?: string
  descripcion: string
  delta?:
    | { direccion: 'arriba' | 'abajo'; texto: string; favorable: boolean }
    | null
  icono?: ComponentType<{ className?: string }>
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          {titulo}
        </p>
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-link">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold leading-none tabular-nums text-ink">
        {valor}
        {unidad && (
          <span className="ml-1.5 text-base font-medium text-ink-3">{unidad}</span>
        )}
      </p>
      {delta && (
        <p
          className={`mt-2 text-sm font-medium ${
            delta.favorable ? 'text-success-text' : 'text-danger-text'
          }`}
        >
          {delta.direccion === 'arriba' ? '↑' : '↓'} {delta.texto}
        </p>
      )}
      <p className="mt-2 text-xs leading-relaxed text-ink-3">{descripcion}</p>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Estados vacíos y de error                                           */
/* ------------------------------------------------------------------ */

function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="grid place-items-center rounded-lg bg-surface-2 px-4 py-10 text-center">
      <p className="text-sm text-ink-2">{mensaje}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cabecera de subsección                                              */
/* ------------------------------------------------------------------ */

function CabeceraSubseccion({
  numero,
  titulo,
  descripcion,
}: {
  numero: string
  titulo: string
  descripcion: string
}) {
  return (
    <header className="mt-10 flex items-start gap-4 border-t border-line pt-6">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-sm font-bold text-link"
        aria-hidden="true"
      >
        {numero}
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
          {titulo}
        </h3>
        <p className="mt-0.5 text-sm text-ink-2">{descripcion}</p>
       </div>
     </header>
   )
 }

/* ------------------------------------------------------------------ */
/* Estados de servicio (labels y tokens de color)                      */
/* ------------------------------------------------------------------ */

const ESTADOS_SERVICIO_INFO: Record<string, { label: string; colorVar: string }> = {
  pendiente: { label: 'Pendiente', colorVar: 'var(--color-pending)' },
  aceptado: { label: 'Aceptado', colorVar: 'var(--color-revision)' },
  completado: { label: 'Completado', colorVar: 'var(--color-success)' },
  cancelado: { label: 'Cancelado', colorVar: 'var(--color-danger)' },
  expirado: { label: 'Expirado', colorVar: 'var(--color-suspended)' },
  rechazado: { label: 'Rechazado', colorVar: 'var(--color-warning)' },
}

/* ------------------------------------------------------------------ */
/* Subsección 1 · Técnicos y verificación                              */
/* ------------------------------------------------------------------ */

function SubseccionTecnicos({
  metricas,
  mensual,
}: {
  metricas: MetricasDashboard
  mensual: boolean
}) {
  const serieMensual = metricas.seriesMensuales?.serie
  const usarMensual = mensual && !!serieMensual

  const serieRegistros = (usarMensual
    ? serieMensual!
    : metricas.registrosVerificaciones.serie) as unknown as Array<Record<string, unknown>>
  const serieCancela = (usarMensual
    ? serieMensual!
    : metricas.cancelacionesTardiasSemanales.serie) as unknown as Array<Record<string, unknown>>

  const { promedioHoras, vsMesPasadoPorcentaje } = metricas.tiempoVerificacion

  const hayRegistros = serieRegistros.some((punto) =>
    aNumero(punto.registros) > 0 ||
    aNumero(punto.registrosNuevos) > 0 ||
    aNumero(punto.verificados) > 0,
  )
  const hayCancela = serieCancela.some(
    (punto) =>
      aNumero(punto.cancelacionesTardias) > 0 || aNumero(punto.total) > 0,
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
        <h4 className="font-display text-base font-semibold text-ink">
          Registros vs verificaciones
        </h4>
        <p className="mt-0.5 text-sm text-ink-2">
          {usarMensual
            ? `Por mes · últimos ${metricas.seriesMensuales?.meses ?? 0} meses`
            : `Por semana · últimas ${metricas.registrosVerificaciones.semanas} semanas`}
        </p>
        <div className="mt-4">
          {hayRegistros ? (
            <GraficoLineas
              datos={serieRegistros.map((punto) => ({
                semana: usarMensual
                  ? aTexto(punto.mes)
                  : formatearSemana(aTexto(punto.semanaInicio)),
                registros: usarMensual
                  ? aNumero(punto.registros)
                  : aNumero(punto.registrosNuevos),
                verificados: aNumero(punto.verificados),
              }))}
              etiquetasTooltip={{
                registros: '{v} registros',
                verificados: '{v} verificados',
              }}
              series={[
                {
                  clave: 'registros',
                  nombre: 'Registrados',
                  colorVar: 'var(--color-chart-1)',
                },
                {
                  clave: 'verificados',
                  nombre: 'Verificados',
                  colorVar: 'var(--color-chart-4)',
                },
              ]}
            />
          ) : (
            <EstadoVacio mensaje="Aún no hay técnicos registrados en el periodo." />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
        <h4 className="font-display text-base font-semibold text-ink">
          Cancelaciones tardías
        </h4>
        <p className="mt-0.5 text-sm text-ink-2">
          {usarMensual
            ? `Por mes · últimos ${metricas.seriesMensuales?.meses ?? 0} meses`
            : `Por semana · últimas ${metricas.cancelacionesTardiasSemanales.semanas} semanas`}
        </p>
        <div className="mt-4">
          {hayCancela ? (
            <GraficoLineas
              datos={serieCancela.map((punto) => ({
                semana: usarMensual
                  ? aTexto(punto.mes)
                  : formatearSemana(aTexto(punto.semanaInicio)),
                tardias: usarMensual
                  ? aNumero(punto.cancelacionesTardias)
                  : aNumero(punto.total),
              }))}
              etiquetasTooltip={{ tardias: '{v} cancelaciones' }}
              series={[
                {
                  clave: 'tardias',
                  nombre: 'Cancelaciones tardías',
                  colorVar: 'var(--color-chart-5)',
                },
              ]}
            />
          ) : (
            <EstadoVacio mensaje="Sin cancelaciones tardías en el periodo." />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
        <h4 className="font-display text-base font-semibold text-ink">
          Tiempo promedio de verificación
        </h4>
        <p className="mt-0.5 text-sm text-ink-2">
          Del registro a la primera decisión
        </p>
        <div className="mt-4">
          {promedioHoras === null ? (
            <EstadoVacio mensaje="Aún no hay decisiones suficientes para calcular el promedio." />
          ) : (
            <div className="pt-2">
              <p className="font-display text-5xl font-semibold leading-none tabular-nums text-ink">
                {Math.round(promedioHoras)}
                <span className="ml-2 text-lg font-medium text-ink-3">h</span>
              </p>
              {vsMesPasadoPorcentaje !== null && (
                <p
                  className={`mt-3 text-sm font-semibold ${
                    vsMesPasadoPorcentaje < 0
                      ? 'text-success-text'
                      : 'text-danger-text'
                  }`}
                >
                  {vsMesPasadoPorcentaje < 0 ? '↓' : '↑'}{' '}
                  {Math.abs(vsMesPasadoPorcentaje)}% vs mes pasado
                </p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-ink-3">
                Negativo (↓) es favorable: se verificó más rápido que el mes
                pasado.
              </p>
            </div>
          )}
        </div>
      </section>
      </div>
      {serieRegistros.length >= 2 && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h4 className="font-display text-base font-semibold text-ink">Comparación vs mes anterior</h4>
          <p className="mt-0.5 text-sm text-ink-2">
            {aTexto(serieRegistros[serieRegistros.length - 2].mes)} - {aTexto(serieRegistros[serieRegistros.length - 1].mes)}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DeltaMes etiqueta="Registrados" actual={aNumero(serieRegistros[serieRegistros.length - 1].registros)} anterior={aNumero(serieRegistros[serieRegistros.length - 2].registros)} />
            <DeltaMes etiqueta="Verificados" actual={aNumero(serieRegistros[serieRegistros.length - 1].verificados)} anterior={aNumero(serieRegistros[serieRegistros.length - 2].verificados)} />
            <DeltaMes etiqueta="Cancelaciones tardías" actual={aNumero(serieCancela[serieCancela.length - 1].cancelacionesTardias)} anterior={aNumero(serieCancela[serieCancela.length - 2].cancelacionesTardias)} invertir />
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Subsección 2 · Servicios y clientes                                 */
/* ------------------------------------------------------------------ */

function SubseccionServicios({
  marketplace,
  mensual,
  seriesMensuales,
}: {
  marketplace: NonNullable<MetricasDashboard['marketplace']>
  mensual: boolean
  seriesMensuales?: MetricasDashboard['seriesMensuales']
}) {
  const { servicios, clientes, calidad } = marketplace
  const usarMensual = mensual && !!seriesMensuales?.serie
  const serieCompletadas = (usarMensual
    ? seriesMensuales!.serie
    : servicios.evolucionCompletadasSemanal.serie) as unknown as Array<Record<string, unknown>>

  const dona = servicios.porEstado.map((estado) => ({
    nombre: ESTADOS_SERVICIO_INFO[estado.estado]?.label ?? capitalizar(estado.estado),
    valor: estado.total,
    colorVar:
      ESTADOS_SERVICIO_INFO[estado.estado]?.colorVar ?? 'var(--color-pending)',
  }))

  const hayCompletadas = serieCompletadas.some(
    (punto) => aNumero(punto.completadas) > 0,
  )
  const hayDona = servicios.porEstado.some((estado) => estado.total > 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h4 className="font-display text-base font-semibold text-ink">
            Servicios completados
          </h4>
          <p className="mt-0.5 text-sm text-ink-2">
            {usarMensual
              ? `Por mes · últimos ${seriesMensuales?.meses ?? 0} meses`
              : `Por semana · últimas ${servicios.evolucionCompletadasSemanal.semanas} semanas`}
          </p>
          <div className="mt-4">
            {hayCompletadas ? (
              <GraficoLineas
                datos={serieCompletadas.map((punto) => ({
                  semana: usarMensual
                    ? aTexto(punto.mes)
                    : formatearSemana(aTexto(punto.semanaInicio)),
                  completadas: aNumero(punto.completadas),
                }))}
                etiquetasTooltip={{ completadas: '{v} completados' }}
                series={[
                  {
                    clave: 'completadas',
                    nombre: 'Completados',
                    colorVar: 'var(--color-chart-1)',
                  },
                ]}
              />
            ) : (
              <EstadoVacio mensaje="Sin servicios completados en el periodo." />
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h4 className="font-display text-base font-semibold text-ink">
            Distribución por estado
          </h4>
          <p className="mt-0.5 text-sm text-ink-2">
            Total de solicitudes: {servicios.total}
          </p>
          <div className="mt-4">
            {hayDona ? (
              <GraficoDona filas={dona} />
            ) : (
              <EstadoVacio mensaje="Aún no hay servicios solicitados." />
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaMetrica
          titulo="Tasa de conversión"
          valor={`${servicios.tasaConversionCompletado}%`}
          descripcion="Porcentaje de solicitudes que terminan en completado."
          icono={IconCheckCircle}
        />
        <TarjetaMetrica
          titulo="Retención de clientes"
          valor={`${clientes.retencionDosOMasCompletados}%`}
          descripcion={`${clientes.activos30Dias} de ${clientes.total} clientes con actividad en 30 días.`}
          icono={IconUsers}
        />
        <TarjetaMetrica
          titulo="Tasa de reseñas"
          valor={`${calidad.tasaResenas}%`}
          descripcion={`Calificación promedio de la plataforma: ${
            calidad.calificacionPromedioGeneral ?? '—'
          }.`}
          icono={IconFlag}
        />
      </div>
      {serieCompletadas.length >= 2 && (
        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h4 className="font-display text-base font-semibold text-ink">Comparación vs mes anterior</h4>
          <p className="mt-0.5 text-sm text-ink-2">
            {aTexto(serieCompletadas[serieCompletadas.length - 2].mes)} - {aTexto(serieCompletadas[serieCompletadas.length - 1].mes)}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DeltaMes etiqueta="Solicitudes" actual={aNumero(serieCompletadas[serieCompletadas.length - 1].servicios)} anterior={aNumero(serieCompletadas[serieCompletadas.length - 2].servicios)} />
            <DeltaMes etiqueta="Completados" actual={aNumero(serieCompletadas[serieCompletadas.length - 1].completados)} anterior={aNumero(serieCompletadas[serieCompletadas.length - 2].completados)} />
            <DeltaMes etiqueta="Conversión" actual={aNumero(serieCompletadas[serieCompletadas.length - 1].tasaConversion)} anterior={aNumero(serieCompletadas[serieCompletadas.length - 2].tasaConversion)} sufijo=" pts" />
            <DeltaMes etiqueta="Reseñas" actual={aNumero(serieCompletadas[serieCompletadas.length - 1].resenas)} anterior={aNumero(serieCompletadas[serieCompletadas.length - 2].resenas)} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Subsección 3 · Monetización                                         */
/* ------------------------------------------------------------------ */

export function SubseccionMonetizacion({
  monetizacion,
  mensual,
}: {
  monetizacion: MetricasMonetizacion
  mensual: boolean
}) {
  const { modelosActivos, ingresos, resumen } = monetizacion
  const usarMensual = mensual && !!monetizacion.ingresosMensuales

  const serieModelos = (usarMensual
    ? monetizacion.modelosMensuales!.serie
    : modelosActivos.serie) as unknown as Array<Record<string, unknown>>
  const serieIngresos = (usarMensual
    ? monetizacion.ingresosMensuales!.serie
    : ingresos.serie) as unknown as Array<Record<string, unknown>>

  const hayModelos = serieModelos.some(
    (punto) => aNumero(punto.creditos) > 0 || aNumero(punto.mensualidad) > 0,
  )
  const hayIngresos = usarMensual
    ? serieIngresos.some(
        (punto) =>
          aNumero(punto.ingresosCreditosMes) > 0 ||
          aNumero(punto.ingresosMensualidadMes) > 0 ||
          aNumero(punto.ingresosComisionesMes) > 0,
      )
    : serieIngresos.some(
        (punto) =>
          aNumero(punto.ingresosCreditosSemana) > 0 ||
          aNumero(punto.ingresosMensualidadSemana) > 0 ||
          aNumero(punto.ingresosComisionesSemana) > 0,
      )

  const totalMonetizados = resumen.totalConCreditos + resumen.totalConMensualidad

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h4 className="font-display text-base font-semibold text-ink">
            Ingresos por semana
          </h4>
          <p className="mt-0.5 text-sm text-ink-2">
            {usarMensual
              ? `Por mes · últimos ${monetizacion.ingresosMensuales?.meses ?? 0} meses`
              : 'Recargas de créditos · plan mensual · comisiones'}
          </p>
          <div className="mt-4">
            {hayIngresos ? (
              <GraficoLineas
                datos={serieIngresos.map((punto) => ({
                  semana: usarMensual
                    ? aTexto(punto.mes)
                    : formatearSemana(aTexto(punto.semanaInicio)),
                  creditos: usarMensual
                    ? aNumero(punto.ingresosCreditosMes)
                    : aNumero(punto.ingresosCreditosSemana),
                  mensualidad: usarMensual
                    ? aNumero(punto.ingresosMensualidadMes)
                    : aNumero(punto.ingresosMensualidadSemana),
                  comisiones: usarMensual
                    ? aNumero(punto.ingresosComisionesMes)
                    : aNumero(punto.ingresosComisionesSemana),
                }))}
                etiquetasTooltip={{
                  creditos: 'S/ {v} en créditos',
                  mensualidad: 'S/ {v} en mensualidad',
                  comisiones: 'S/ {v} en comisiones',
                }}
                series={[
                  {
                    clave: 'creditos',
                    nombre: 'Créditos',
                    colorVar: 'var(--color-chart-1)',
                  },
                  {
                    clave: 'mensualidad',
                    nombre: 'Mensualidad',
                    colorVar: 'var(--color-chart-3)',
                  },
                  {
                    clave: 'comisiones',
                    nombre: 'Comisiones',
                    colorVar: 'var(--color-chart-4)',
                  },
                ]}
              />
            ) : (
              <EstadoVacio mensaje="Sin ingresos registrados en el periodo." />
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h4 className="font-display text-base font-semibold text-ink">
            Técnicos por modelo
          </h4>
          <p className="mt-0.5 text-sm text-ink-2">
            {usarMensual
              ? `Por mes · últimos ${monetizacion.modelosMensuales?.meses ?? 0} meses`
              : `Créditos vs mensualidad · últimas ${serieModelos.length} semanas`}
          </p>
          <div className="mt-4">
            {hayModelos ? (
              <GraficoLineas
                datos={serieModelos.map((punto) => ({
                  semana: usarMensual
                    ? aTexto(punto.mes)
                    : formatearSemana(aTexto(punto.semanaInicio)),
                  creditos: aNumero(punto.creditos),
                  mensualidad: aNumero(punto.mensualidad),
                }))}
                etiquetasTooltip={{
                  creditos: '{v} con créditos',
                  mensualidad: '{v} con mensualidad',
                }}
                series={[
                  {
                    clave: 'creditos',
                    nombre: 'Con créditos',
                    colorVar: 'var(--color-chart-1)',
                  },
                  {
                    clave: 'mensualidad',
                    nombre: 'Con mensualidad',
                    colorVar: 'var(--color-chart-3)',
                    punteada: true,
                  },
                ]}
              />
            ) : (
              <EstadoVacio mensaje="Ningún técnico con modelo activo en el periodo." />
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaMetrica
          titulo="Total monetizados"
          valor={String(totalMonetizados)}
          descripcion={`${resumen.porcentajeMonetizados}% de técnicos verificados. ${
            resumen.totalSinModelo
          } sin modelo.`}
          icono={IconUsers}
        />
        <TarjetaMetrica
          titulo="Modelo más elegido"
          valor={
            resumen.modeloMasElegido
              ? capitalizar(resumen.modeloMasElegido)
              : '—'
          }
          descripcion="Modelo con más técnicos activos hoy."
          icono={IconCheckCircle}
        />
        <TarjetaMetrica
          titulo="Ingresos totales"
          valor={formatearDinero(resumen.ingresosTotales)}
          descripcion={`Créditos ${formatearDinero(
            resumen.ingresosTotalesCreditos,
          )} · mensualidad ${formatearDinero(
            resumen.ingresosTotalesMensualidad,
          )} · comisiones ${formatearDinero(resumen.ingresosTotalesComisiones)}.`}
          icono={IconCoins}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Fallback monetización                                               */
/* ------------------------------------------------------------------ */

export function ErrorMonetizacion({
  mensaje,
  onReintentar,
}: {
  mensaje: string
  onReintentar: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-danger-soft text-danger-text">
          <IconAlertTriangle className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">
            No se pudieron cargar las métricas de monetización
          </p>
          <p className="mt-0.5 text-sm text-ink-2">{mensaje}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReintentar}
        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink shadow-sm transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
      >
        <IconRefresh className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sección principal                                                   */
/* ------------------------------------------------------------------ */

export function SeccionMetricas({
  metricas,
  mes,
  onMesChange,
}: {
  metricas: MetricasDashboard
  mes: string
  onMesChange: (mes: string) => void
}) {
  const marketplace = metricas.marketplace
  const mensual = true

  return (
    <section aria-labelledby="titulo-metricas" className="pt-3">
      <header className="flex flex-col gap-4 border-b border-line-strong pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-link">
            Evolución de negocio
          </p>
          <h2
            id="titulo-metricas"
            className="font-display text-2xl font-semibold tracking-tight text-ink"
          >
            Métricas
          </h2>
          <p className="text-sm text-ink-2">
            Tendencias mensuales, calidad y monetización del marketplace.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-ink-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Periodo
          </span>
          <select
            value={mes.slice(0, 4)}
            onChange={(evento) =>
              onMesChange(`${evento.target.value}-${mes.slice(5, 7)}`)
            }
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Array.from({ length: 6 }, (_, indice) => {
              const anio = new Date().getFullYear() - 3 + indice
              return (
                <option key={anio} value={String(anio)}>
                  {anio}
                </option>
              )
            })}
          </select>
          <select
            value={mes.slice(5, 7)}
            onChange={(evento) =>
              onMesChange(`${mes.slice(0, 4)}-${evento.target.value}`)
            }
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Array.from({ length: 12 }, (_, indice) => {
              const valor = String(indice + 1).padStart(2, '0')
              const etiqueta = new Date(2000, indice, 1).toLocaleDateString(
                'es-PE',
                { month: 'long' },
              )
              return (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              )
            })}
          </select>
        </div>
      </header>

      <CabeceraSubseccion
        numero="1"
        titulo="Métricas de técnicos y verificación"
        descripcion="Registros, verificaciones y tiempos del equipo de verificación."
      />
      <div className="mt-4">
        <SubseccionTecnicos metricas={metricas} mensual={mensual} />
      </div>

      <CabeceraSubseccion
        numero="2"
        titulo="Métricas de servicios y clientes"
        descripcion="De la solicitud al completado: conversión, retención y reseñas."
      />
      <div className="mt-4">
        {marketplace ? (
          <SubseccionServicios
            marketplace={marketplace}
            mensual={mensual}
            seriesMensuales={metricas.seriesMensuales}
          />
        ) : (
          <EstadoVacio mensaje="Las métricas de servicios no están disponibles en esta versión del backend. Actualiza el backend para habilitar el bloque de marketplace." />
        )}
      </div>

      {/* Métricas de monetización: se implementarán en la página de Monetización. */}
      {/* <CabeceraSubseccion ... /> */}
    </section>
  )
}
