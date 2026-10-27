import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import {
  listarTecnicosMonetizacion,
  listarTransaccionesMonetizacion,
  obtenerResumenMonetizacion,
  obtenerMetricasMonetizacion,
  type FiltrosMonetizacionTecnicos,
  type FiltrosTransaccionesMonetizacion,
  type TecnicoMonetizacion,
  type TransaccionMonetizacion,
  type Paginacion,
  type ResumenMonetizacion,
  type TipoFiltroMonetizacion,
  type TipoTransaccion,
  type MetricasMonetizacion,
} from '../../services/admin'
import {
  OFICIOS_INFO,
} from '../../components/tecnicos'
import type { Oficio } from '../../services/admin'
import { obtenerIniciales } from '../../components/navigation'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { SelectorRangoMeses } from '../../components/SelectorRangoMeses'
import { PanelGrafico, TooltipGrafico } from '../../components/panel-grafico'
import {
  diferenciaMeses,
  mesActualISO,
  nombreMesCorto,
  rangoTexto,
  restarMeses,
} from '../../lib/periodo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  IconCheckCircle,
  IconChevronRight,
  IconChevronsLeft,
  IconClock,
  IconCoins,
  IconRefresh,
  IconUsers,
  IconX,
} from '../../components/icons'
import { format, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const LABELS_ORDEN = [
  { valor: 'recientes', label: 'Más recientes' },
  { valor: 'creditos', label: 'Más créditos' },
  { valor: 'vencimiento', label: 'Vencimiento próximo' },
] as const

const LABELS_TRANSACCION: Record<TipoTransaccion, string> = {
  compra_creditos: 'Compra créditos',
  activacion_plan: 'Activación plan',
  descuento_credito: 'Descuento crédito',
  comision_servicio: 'Comisión servicio',
  cambio_modelo: 'Cambio modelo',
}

interface TipoInfo {
  label: string
  badge: string
  dot: string
}

const MODELO_INFO: Record<string, TipoInfo> = {
  creditos: {
    label: 'Créditos',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  mensualidad: {
    label: 'Mensualidad',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
}

const FILTROS_MODELO: { valor: string; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'con_modelo', label: 'Con modelo (créditos o mensualidad)' },
  { valor: 'creditos', label: 'Solo créditos' },
  { valor: 'mensualidad', label: 'Solo mensualidad' },
  { valor: 'sin_modelo', label: 'Sin modelo' },
]

const TRANSACCION_INFO: Record<TipoTransaccion, TipoInfo> = {
  compra_creditos: {
    label: 'Compra créditos',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  activacion_plan: {
    label: 'Activación plan',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  descuento_credito: {
    label: 'Descuento crédito',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  comision_servicio: {
    label: 'Comisión servicio',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  cambio_modelo: {
    label: 'Cambio modelo',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
}

function formatMoney(v: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(v)
}

function etiquetaReferencia(ref: string | null): string {
  if (!ref) return '—'
  if (ref === 'plan_mensual') return 'Plan mensual'
  const paquete = ref.match(/^paq_(\d+)$/)
  if (paquete) return `Paquete ${paquete[1]} créditos`
  return ref.replaceAll('_', ' ')
}

function formatDate(d: string) {
  return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: es })
}

/* Las series del backend traen ISO completo (ej. 2026-10-05T00:00:00.000Z);
   se parsea directo y se formatea en UTC para no desplazar el día por zona horaria. */
const formatoFechaCorta = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

function aFechaSegura(valor: unknown): Date | null {
  if (typeof valor !== 'string' || valor === '') return null
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

function formatearFechaSerie(valor: unknown): string {
  const fecha = aFechaSegura(valor)
  return fecha ? formatoFechaCorta.format(fecha).replace('.', '') : '—'
}

function InfoTipo({ info }: { info: TipoInfo }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${info.badge}`}
    >
      <span className={`h-1.5 w-1.5 ${info.dot}`} aria-hidden="true" />
      {info.label}
    </span>
  )
}

interface KpiProps {
  label: string
  valor: string
  detalle: string
  icon: ComponentType<{ className?: string }>
  iconClases: string
  cargando: boolean
}

function TarjetaKpi({ label, valor, detalle, icon: Icono, iconClases, cargando }: KpiProps) {
  return (
    <section className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
          {label}
        </p>
        <p className="mt-1 truncate font-display text-2xl font-bold tabular-nums text-ink">
          {cargando ? <span className="inline-block h-7 w-16 animate-pulse bg-line align-middle" /> : valor}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-2">{detalle}</p>
      </div>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${iconClases}`}>
        <Icono className="h-5 w-5" />
      </span>
    </section>
  )
}

interface RangoVencimiento {
  chip: string
  clases: string
}

function chipVencimiento(iso: string): RangoVencimiento {
  const dias = differenceInCalendarDays(new Date(iso), new Date())
  if (dias <= 0) {
    return { chip: 'Vencido', clases: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' }
  }
  if (dias <= 7) {
    return { chip: `Vence en ${dias} d`, clases: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' }
  }
  return { chip: `Vence en ${dias} d`, clases: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' }
}

interface EstadoPaginacion {
  page: number
  total_paginas: number
  total: number
}

function PieTabla({
  paginacion,
  textoTotal,
  onPageChange,
}: {
  paginacion: EstadoPaginacion | null
  textoTotal: string
  onPageChange: (p: number) => void
}) {
  if (!paginacion) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
      <p className="text-sm text-ink-3">{textoTotal}</p>
      {paginacion.total_paginas > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(paginacion.page - 1)}
            disabled={paginacion.page <= 1}
            aria-label="Página anterior"
            className="grid h-8 w-8 place-items-center rounded-md border border-line text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <IconChevronsLeft className="h-4 w-4" />
          </button>
          <span className="text-sm tabular-nums text-ink-2">
            Pág. {paginacion.page} de {paginacion.total_paginas}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(paginacion.page + 1)}
            disabled={paginacion.page >= paginacion.total_paginas}
            aria-label="Página siguiente"
            className="grid h-8 w-8 place-items-center rounded-md border border-line text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function SkeletonFilas({ columnas }: { columnas: number }) {
  return (
    <tbody className="divide-y divide-line">
      {Array.from({ length: 5 }).map((_, indice) => (
        <tr key={indice} className="animate-pulse">
          {Array.from({ length: columnas }).map((__, col) => (
            <td key={col} className="px-5 py-4">
              <span className={`block h-4 bg-line ${col === 0 ? 'w-40' : 'w-16'}`} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-lg bg-primary-soft text-link">
        <IconCoins className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-ink">{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-2">{texto}</p>
    </div>
  )
}

function TarjetaMetricaMini({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">
        {valor}
      </p>
    </div>
  )
}

const PAGE_SIZE = 20

export default function Monetizacion() {
  const [tab, setTab] = useState<'tecnicos' | 'transacciones'>('tecnicos')

  const [resumen, setResumen] = useState<ResumenMonetizacion | null>(null)
  const [metricas, setMetricas] = useState<MetricasMonetizacion | null>(null)
  const [cargandoMetricas, setCargandoMetricas] = useState(true)
  const [cargandoResumen, setCargandoResumen] = useState(true)

  const [tecnicos, setTecnicos] = useState<TecnicoMonetizacion[]>([])
  const [pagTecnicos, setPagTecnicos] = useState<Paginacion | null>(null)
  const [cargandoTecnicos, setCargandoTecnicos] = useState(true)

  const [transacciones, setTransacciones] = useState<TransaccionMonetizacion[]>([])
  const [pagTrans, setPagTrans] = useState<Paginacion | null>(null)
  const [cargandoTrans, setCargandoTrans] = useState(true)

  const [tipoSel, setTipoSel] = useState<'todos' | TipoFiltroMonetizacion>('todos')
  const [ordenSel, setOrdenSel] = useState<'recientes' | 'creditos' | 'vencimiento'>('recientes')
  const [paginaTecnicos, setPaginaTecnicos] = useState(1)

  /* ---- Transacciones: buscador de técnico con dropdown ---- */
  const [tecnicoBusqueda, setTecnicoBusqueda] = useState('')
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<{ id: number; nombre: string } | null>(null)
  const [dropdownAbierto, setDropdownAbierto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Lista de técnicos para el dropdown (se obtiene de la lista completa de técnicos monetizados)
  const [listaTecnicos, setListaTecnicos] = useState<{ id: number; nombre: string; email: string }[]>([])
  const [cargandoListaTecnicos, setCargandoListaTecnicos] = useState(false)

  const tecnicosFiltrados = useMemo(() => {
    if (!tecnicoBusqueda.trim()) return listaTecnicos.slice(0, 20)
    const termino = tecnicoBusqueda.toLowerCase()
    return listaTecnicos
      .filter(
        (t) =>
          t.nombre.toLowerCase().includes(termino) ||
          t.email.toLowerCase().includes(termino) ||
          String(t.id).includes(termino),
      )
      .slice(0, 20)
  }, [tecnicoBusqueda, listaTecnicos])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  // Cargar lista de técnicos para el dropdown cuando se abre la pestaña transacciones
  const cargarListaTecnicos = useCallback(async () => {
    if (listaTecnicos.length > 0) return
    setCargandoListaTecnicos(true)
    try {
      const { tecnicos: todos } = await listarTecnicosMonetizacion({
        tipo: 'con_modelo',
        limit: 100,
      })
      setListaTecnicos(todos.map((t) => ({ id: t.id, nombre: t.nombre, email: t.email })))
    } catch (e) {
      console.error(e)
    } finally {
      setCargandoListaTecnicos(false)
    }
  }, [listaTecnicos.length])

  const [tipoTxSel, setTipoTxSel] = useState<'todos' | TipoTransaccion>('todos')
  const [desdeTxt, setDesdeTxt] = useState('')
  const [hastaTxt, setHastaTxt] = useState('')
  const [paginaTrans, setPaginaTrans] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)

  const [mesInicio, setMesInicio] = useState<string>(restarMeses(mesActualISO(), 2))
  const [mesFin, setMesFin] = useState<string>(mesActualISO())
  const actualizarRango = useCallback((inicio: string, fin: string) => {
    setMesInicio(inicio)
    setMesFin(fin)
  }, [])

  const cargarMetricas = useCallback(async () => {
    try {
      const meses = Math.min(diferenciaMeses(mesInicio, mesFin) + 1, 12)
      const resultado = await obtenerMetricasMonetizacion({
        semanas: 8,
        mes: mesFin,
        meses,
      })

      setMetricas(resultado)
    } catch (error) {
      console.error('Error al cargar métricas de monetización:', error)
    } finally {
      setCargandoMetricas(false)
    }
  }, [mesInicio, mesFin])

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void cargarMetricas()
    }, 0)
    return () => {
      window.clearTimeout(temporizador)
    }
  }, [cargarMetricas, reloadKey])

  const hayFiltrosTecnicos = tipoSel !== 'todos' || ordenSel !== 'recientes'
  const hayFiltrosTrans =
    tecnicoSeleccionado !== null ||
    tecnicoBusqueda.trim() !== '' ||
    tipoTxSel !== 'todos' ||
    desdeTxt !== '' ||
    hastaTxt !== ''

  const cargarResumen = async () => {
    setCargandoResumen(true)
    try {
      setResumen(await obtenerResumenMonetizacion())
    } catch (e) {
      console.error(e)
    } finally {
      setCargandoResumen(false)
    }
  }

  useEffect(() => {
    let vigente = true
    const cargar = async () => {
      setCargandoResumen(true)
      try {
        const datos = await obtenerResumenMonetizacion()
        if (vigente) setResumen(datos)
      } catch (e) {
        console.error(e)
      } finally {
        if (vigente) setCargandoResumen(false)
      }
    }
    cargar()
    return () => {
      vigente = false
    }
  }, [])

  // Series de métricas normalizadas al periodo seleccionado.
  // 1 mes → granularidad semanal; rango multi-mes → granularidad mensual.
  const spanMonetizacion = Math.min(diferenciaMeses(mesInicio, mesFin), 12)
  const monetizacionMensual =
    !!metricas &&
    spanMonetizacion > 1 &&
    !!metricas.ingresosMensuales &&
    !!metricas.modelosMensuales

  const serieIngresosPeriodo = metricas
    ? monetizacionMensual
      ? metricas.ingresosMensuales!.serie.slice(-spanMonetizacion).map((p) => ({
          etiqueta: nombreMesCorto(p.mes),
          creditos: p.ingresosCreditosMes,
          mensualidad: p.ingresosMensualidadMes,
          comisiones: p.ingresosComisionesMes,
          total: p.ingresosTotalMes,
        }))
      : metricas.ingresos.serie.map((p) => ({
          etiqueta: formatearFechaSerie(p.semanaInicio),
          creditos: p.ingresosCreditosSemana,
          mensualidad: p.ingresosMensualidadSemana,
          comisiones: p.ingresosComisionesSemana,
          total: p.ingresosTotalSemana,
        }))
    : []

  const serieModelosPeriodo = metricas
    ? monetizacionMensual
      ? metricas.modelosMensuales!.serie.slice(-spanMonetizacion).map((p) => ({
          etiqueta: nombreMesCorto(p.mes),
          creditos: p.creditos,
          mensualidad: p.mensualidad,
        }))
      : metricas.modelosActivos.serie.map((p) => ({
          etiqueta: formatearFechaSerie(p.semanaInicio),
          creditos: p.creditos,
          mensualidad: p.mensualidad,
        }))
    : []

  const serieAdopcionPeriodo =
    metricas && !monetizacionMensual
      ? metricas.adopcion.serie.map((p) => ({
          etiqueta: formatearFechaSerie(p.semanaInicio),
          verificados: p.verificadosSemana,
          conModelo: p.conModeloActivoSemana,
        }))
      : []

  const etiquetaRangoMonetizacion = rangoTexto(mesInicio, mesFin)

  useEffect(() => {
    if (tab !== 'tecnicos') return
    let vigente = true
    const cargar = async () => {
      setCargandoTecnicos(true)
      try {
        const filtros: FiltrosMonetizacionTecnicos = {}
        if (tipoSel !== 'todos') filtros.tipo = tipoSel
        if (ordenSel !== 'recientes') filtros.orden = ordenSel
        const { tecnicos, paginacion } = await listarTecnicosMonetizacion({
          ...filtros,
          page: paginaTecnicos,
          limit: PAGE_SIZE,
        })
        if (!vigente) return
        setTecnicos(tecnicos)
        setPagTecnicos(paginacion)
      } catch (e) {
        console.error(e)
      } finally {
        if (vigente) setCargandoTecnicos(false)
      }
    }
    cargar()
    return () => {
      vigente = false
    }
  }, [tab, tipoSel, ordenSel, paginaTecnicos, reloadKey])

  useEffect(() => {
    if (tab !== 'transacciones') return
    let vigente = true
    const cargar = async () => {
      setCargandoTrans(true)
      try {
        const filtros: FiltrosTransaccionesMonetizacion = {}
        if (tecnicoSeleccionado) {
          filtros.tecnicoId = tecnicoSeleccionado.id
        }
        if (tipoTxSel !== 'todos') filtros.tipoTransaccion = tipoTxSel
        if (desdeTxt) filtros.desde = new Date(`${desdeTxt}T00:00:00`).toISOString()
        if (hastaTxt) filtros.hasta = new Date(`${hastaTxt}T23:59:59`).toISOString()
        const { transacciones, paginacion } = await listarTransaccionesMonetizacion({
          ...filtros,
          page: paginaTrans,
          limit: PAGE_SIZE,
        })
        if (!vigente) return
        setTransacciones(transacciones)
        setPagTrans(paginacion)
      } catch (e) {
        console.error(e)
      } finally {
        if (vigente) setCargandoTrans(false)
      }
    }
    cargar()
    return () => {
      vigente = false
    }
  }, [tab,
    tecnicoSeleccionado,
    tipoTxSel,
    desdeTxt,
    hastaTxt,
    paginaTrans,
    reloadKey,]
  )

  const recargarTodo = () => {
    setCargandoMetricas(true)
    cargarResumen()
    setPaginaTecnicos(1)
    setPaginaTrans(1)
    setReloadKey((k) => k + 1)
  }

  const descripcionTecnicos = hayFiltrosTecnicos
    ? tipoSel !== 'todos'
      ? ` en modelo «${MODELO_INFO[tipoSel].label}»`
      : ''
    : ''

  const descripcionTrans = hayFiltrosTrans
    ? ' con los filtros aplicados'
    : ''

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <section
        aria-label="Resumen de monetización"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <TarjetaKpi
          label="Técnicos monetizados"
          valor={resumen ? `${resumen.tecnicos.conModelo}` : '—'}
          detalle={resumen ? `de ${resumen.tecnicos.total} técnicos activos` : '—'}
          icon={IconUsers}
          iconClases="bg-primary-soft text-link"
          cargando={cargandoResumen}
        />
        <TarjetaKpi
          label="Créditos en circulación"
          valor={resumen ? `${resumen.creditosEnCirculacion}` : '—'}
          detalle={resumen ? `${resumen.tecnicos.creditos} técnicos en modelo créditos` : '—'}
          icon={IconCoins}
          iconClases="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          cargando={cargandoResumen}
        />
        <TarjetaKpi
          label="Planes activos"
          valor={resumen ? `${resumen.planesActivos}` : '—'}
          detalle={resumen ? `de ${resumen.tecnicos.mensualidad} mensualidades` : '—'}
          icon={IconCheckCircle}
          iconClases="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          cargando={cargandoResumen}
        />
        <TarjetaKpi
          label="Ingresos del mes"
          valor={resumen ? formatMoney(resumen.ingresos.mes) : '—'}
          detalle={resumen ? `Total histórico: ${formatMoney(resumen.ingresos.total)}` : '—'}
          icon={IconClock}
          iconClases="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
          cargando={cargandoResumen}
        />
      </section>

      {/* Pestañas */}
      <div
        role="tablist"
        aria-label="Vistas de monetización"
        className="inline-flex rounded-lg border border-line bg-surface-2 p-1"
      >
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'tecnicos'}
          onClick={() => setTab('tecnicos')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition duration-[var(--duration-fast)] ease-[var(--ease)] ${tab === 'tecnicos'
            ? 'bg-primary-strong text-white shadow-sm'
            : 'text-ink-2 hover:text-ink'
            }`}
        >
          Técnicos
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'transacciones'}
          onClick={() => setTab('transacciones')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition duration-[var(--duration-fast)] ease-[var(--ease)] ${tab === 'transacciones'
            ? 'bg-primary-strong text-white shadow-sm'
            : 'text-ink-2 hover:text-ink'
            }`}
        >
          Transacciones
        </button>
      </div>

      {tab === 'tecnicos' && (
        <>
          {/* Filtros — fuera de la tabla */}
          <section className="rounded-lg border border-line bg-surface p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <label htmlFor="filtro-modelo" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-3">
                  Modelo
                </label>
                <Select
                  value={tipoSel}
                  onValueChange={(v) => {
                    setTipoSel(v as 'todos' | TipoFiltroMonetizacion)
                    setPaginaTecnicos(1)
                  }}
                >
                  <SelectTrigger id="filtro-modelo" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTROS_MODELO.map((filtro) => (
                      <SelectItem key={filtro.valor} value={filtro.valor}>
                        {filtro.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="filtro-orden-monetizacion" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-3">
                  Ordenar por
                </label>
                <Select
                  value={ordenSel}
                  onValueChange={(v) => {
                    setOrdenSel(v as typeof ordenSel)
                    setPaginaTecnicos(1)
                  }}
                >
                  <SelectTrigger id="filtro-orden-monetizacion" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LABELS_ORDEN.map((o) => (
                      <SelectItem key={o.valor} value={o.valor}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-line pt-3">
              {hayFiltrosTecnicos && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTipoSel('todos')
                    setOrdenSel('recientes')
                    setPaginaTecnicos(1)
                  }}
                  className="h-9 text-ink-2"
                >
                  <IconX />
                  Limpiar filtros
                </Button>
              )}
              <Button
                variant="outline"
                onClick={recargarTodo}
                className="h-9"
                disabled={cargandoResumen || cargandoTecnicos}
              >
                <IconRefresh className={cargandoTecnicos ? 'animate-spin' : ''} />
                Recargar
              </Button>
            </div>
          </section>

          {/* Tabla de técnicos */}
          <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
            <div
              className={`relative overflow-x-auto transition-opacity duration-[var(--duration)] ${cargandoTecnicos ? 'opacity-60' : 'opacity-100'
                }`}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
                    <th className="px-5 py-3 font-medium">Técnico</th>
                    <th className="hidden px-5 py-3 font-medium sm:table-cell">Oficio</th>
                    <th className="px-5 py-3 font-medium">Modelo</th>
                    <th className="px-5 py-3 text-right font-medium">Créditos</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Plan</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">Paquete / Ref.</th>
                  </tr>
                </thead>
                {cargandoTecnicos && tecnicos.length === 0 ? (
                  <SkeletonFilas columnas={6} />
                ) : tecnicos.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-5">
                        <Vacio
                          titulo={hayFiltrosTecnicos ? 'Sin resultados' : 'Aún no hay técnicos monetizados'}
                          texto={
                            hayFiltrosTecnicos
                              ? 'Prueba con otros filtros o límpialos.'
                              : 'Cuando un técnico compre créditos o active un plan aparecerá aquí.'
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-line">
                    {tecnicos.map((t) => {
                      const m = t.monetizacion
                      const vence = m.planVenceAt ? chipVencimiento(m.planVenceAt) : null
                      return (
                        <tr
                          key={t.id}
                          className="transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-link">
                                {obtenerIniciales(t.nombre)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink">{t.nombre}</p>
                                <p className="truncate text-xs text-ink-3">{t.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-5 py-4 capitalize text-ink-2 sm:table-cell">
                            {OFICIOS_INFO[t.oficio as Oficio] ?? t.oficio}
                          </td>
                          <td className="px-5 py-4">
                            {m.tipo ? (
                              <InfoTipo info={MODELO_INFO[m.tipo]} />
                            ) : (
                              <span className="text-sm text-ink-3">Sin modelo</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {m.tipo === 'creditos' ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="font-semibold tabular-nums text-ink">
                                  {m.creditosRestantes}
                                </span>
                                {m.creditosRestantes <= 3 && (
                                  <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                    quedan pocos
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-ink-3">—</span>
                            )}
                          </td>
                          <td className="hidden px-5 py-4 md:table-cell">
                            {vence ? (
                              <span className="inline-flex flex-col items-start gap-0.5">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${vence.clases}`}>
                                  {vence.chip}
                                </span>
                                <span className="text-[11px] text-ink-3">
                                  {formatDate(m.planVenceAt!)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-ink-3">—</span>
                            )}
                          </td>
                          <td className="hidden px-5 py-4 text-ink-2 lg:table-cell">
                            {m.paqueteId ?? m.planId ? (
                              <span className="inline-flex rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-medium">
                                {etiquetaReferencia(m.paqueteId ?? m.planId)}
                              </span>
                            ) : (
                              <span className="text-ink-3">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                )}
              </table>
            </div>
            <PieTabla
              paginacion={pagTecnicos}
              textoTotal={`${pagTecnicos?.total ?? 0} técnicos${descripcionTecnicos}`}
              onPageChange={(p) => setPaginaTecnicos(p)}
            />
          </section>
        </>
      )}


      {tab === 'transacciones' && (
        <>
          {/* Filtros — fuera de la tabla */}
          <section className="rounded-lg border border-line bg-surface p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="fx-tipo" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-3">
                  Tipo
                </label>
                <Select
                  value={tipoTxSel}
                  onValueChange={(v) => {
                    setTipoTxSel(v as 'todos' | TipoTransaccion)
                    setPaginaTrans(1)
                  }}
                >
                  <SelectTrigger id="fx-tipo" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las operaciones</SelectItem>
                    {(Object.keys(LABELS_TRANSACCION) as TipoTransaccion[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {LABELS_TRANSACCION[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div ref={dropdownRef} className="relative">
                <label
                  htmlFor="fx-tecnico"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-3"
                >
                  Técnico
                </label>

                <div className="relative">
                  <Input
                    id="fx-tecnico"
                    type="text"
                    placeholder="Buscar por nombre, correo o ID..."
                    value={tecnicoSeleccionado ? tecnicoSeleccionado.nombre : tecnicoBusqueda}
                    onChange={(e) => {
                      setTecnicoBusqueda(e.target.value)
                      setTecnicoSeleccionado(null)
                      setDropdownAbierto(true)
                      setPaginaTrans(1)
                    }}
                    onFocus={() => {
                      setDropdownAbierto(true)
                      cargarListaTecnicos()
                    }}
                    className="h-10"
                  />

                  {tecnicoSeleccionado && (
                    <button
                      type="button"
                      onClick={() => {
                        setTecnicoSeleccionado(null)
                        setTecnicoBusqueda('')
                        setDropdownAbierto(false)
                        setPaginaTrans(1)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                      aria-label="Quitar técnico seleccionado"
                    >
                      <IconX />
                    </button>
                  )}
                </div>

                {dropdownAbierto && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-line bg-surface shadow-lg">
                    {cargandoListaTecnicos ? (
                      <p className="px-3 py-3 text-sm text-ink-3">
                        Cargando técnicos...
                      </p>
                    ) : tecnicosFiltrados.length > 0 ? (
                      tecnicosFiltrados.map((tecnico) => (
                        <button
                          key={tecnico.id}
                          type="button"
                          onClick={() => {
                            setTecnicoSeleccionado({
                              id: tecnico.id,
                              nombre: tecnico.nombre,
                            })
                            setTecnicoBusqueda('')
                            setDropdownAbierto(false)
                            setPaginaTrans(1)
                          }}
                          className="flex w-full flex-col px-3 py-2 text-left transition hover:bg-surface-2"
                        >
                          <span className="text-sm font-medium text-ink">
                            {tecnico.nombre}
                          </span>
                          <span className="text-xs text-ink-3">
                            ID: {tecnico.id} · {tecnico.email}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-sm text-ink-3">
                        No se encontraron técnicos.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="fx-desde" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-3">
                  Desde
                </label>
                <Input
                  id="fx-desde"
                  type="date"
                  value={desdeTxt}
                  onChange={(e) => {
                    setDesdeTxt(e.target.value)
                    setPaginaTrans(1)
                  }}
                  className="h-10"
                />
              </div>
              <div>
                <label htmlFor="fx-hasta" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-3">
                  Hasta
                </label>
                <Input
                  id="fx-hasta"
                  type="date"
                  value={hastaTxt}
                  onChange={(e) => {
                    setHastaTxt(e.target.value)
                    setPaginaTrans(1)
                  }}
                  className="h-10"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 border-t border-line pt-3">
              {hayFiltrosTrans && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTecnicoSeleccionado(null)
                    setTecnicoBusqueda('')
                    setDropdownAbierto(false)
                    setTipoTxSel('todos')
                    setDesdeTxt('')
                    setHastaTxt('')
                    setPaginaTrans(1)
                  }}
                  className="h-9 text-ink-2"
                >
                  <IconX />
                  Limpiar filtros
                </Button>
              )}
              <Button
                variant="outline"
                onClick={recargarTodo}
                className="h-9"
                disabled={cargandoResumen || cargandoTrans}
              >
                <IconRefresh className={cargandoTrans ? 'animate-spin' : ''} />
                Recargar
              </Button>
            </div>
          </section>

          {/* Tabla de transacciones */}
          <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
            <div
              className={`relative overflow-x-auto transition-opacity duration-[var(--duration)] ${cargandoTrans ? 'opacity-60' : 'opacity-100'
                }`}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
                    <th className="px-5 py-3 font-medium">Operación</th>
                    <th className="px-5 py-3 font-medium">Técnico</th>
                    <th className="hidden px-5 py-3 font-medium sm:table-cell">Monto</th>
                    <th className="hidden px-5 py-3 text-right font-medium sm:table-cell">Créditos</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">Descripción</th>
                    <th className="hidden px-5 py-3 text-right font-medium md:table-cell">Fecha</th>
                  </tr>
                </thead>
                {cargandoTrans && transacciones.length === 0 ? (
                  <SkeletonFilas columnas={6} />
                ) : transacciones.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-5">
                        <Vacio
                          titulo={hayFiltrosTrans ? 'Sin resultados' : 'Aún no hay transacciones'}
                          texto={
                            hayFiltrosTrans
                              ? 'Prueba con otros filtros o límpialos.'
                              : 'Cuando un técnico compre créditos, active un plan o complete servicios aparecerán aquí.'
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-line">
                    {transacciones.map((tx) => (
                      <tr
                        key={tx.id}
                        className="transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
                      >
                        <td className="px-5 py-4">
                          <InfoTipo info={TRANSACCION_INFO[tx.tipo]} />
                        </td>
                        <td className="px-5 py-4">
                          {tx.tecnico ? (
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{tx.tecnico.nombre}</p>
                              <p className="truncate text-xs text-ink-3">{tx.tecnico.email}</p>
                            </div>
                          ) : (
                            <span className="text-ink-3">—</span>
                          )}
                        </td>
                        <td className="hidden px-5 py-4 sm:table-cell">
                          {tx.monto !== null ? (
                            <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                              {formatMoney(tx.monto)}
                            </span>
                          ) : (
                            <span className="text-ink-3">—</span>
                          )}
                        </td>
                        <td className="hidden px-5 py-4 text-right sm:table-cell">
                          {tx.creditos !== null ? (
                            <span
                              className={`font-semibold tabular-nums ${tx.creditos < 0
                                ? 'text-rose-700 dark:text-rose-300'
                                : 'text-ink'
                                }`}
                            >
                              {tx.creditos > 0 ? `+${tx.creditos}` : tx.creditos}
                            </span>
                          ) : (
                            <span className="text-ink-3">—</span>
                          )}
                        </td>
                        <td className="hidden max-w-[22rem] px-5 py-4 text-ink-2 lg:table-cell">
                          <span className="line-clamp-2">{tx.descripcion ?? '—'}</span>
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-4 text-right text-ink-3 md:table-cell">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
            <PieTabla
              paginacion={pagTrans}
              textoTotal={`${pagTrans?.total ?? 0} transacciones${descripcionTrans}`}
              onPageChange={(p) => setPaginaTrans(p)}
            />
          </section>
        </>
      )}

      {/* Métricas de monetización */}
      <section
        aria-label="Métricas de monetización"
        className="space-y-4 rounded-lg border border-line bg-surface p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">
              Métricas de monetización
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Evolución de ingresos, modelos activos y adopción de monetización.
            </p>
          </div>
          <SelectorRangoMeses
            mesInicio={mesInicio}
            mesFin={mesFin}
            onChange={actualizarRango}
          />
        </div>

        {cargandoMetricas && !metricas ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, indice) => (
              <div
                key={indice}
                className="animate-pulse rounded-lg border border-line bg-surface-2 p-4"
              >
                <span className="block h-3 w-24 bg-line" />
                <span className="mt-3 block h-7 w-16 bg-line" />
              </div>
            ))}
          </div>
        ) : !metricas ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-ink-3">
              No se pudieron cargar las métricas de monetización.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCargandoMetricas(true)
                void cargarMetricas()
              }}
              className="h-9"
              disabled={cargandoMetricas}
            >
              <IconRefresh className={cargandoMetricas ? 'animate-spin' : ''} />
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <TarjetaMetricaMini
                label="Técnicos con créditos"
                valor={String(metricas.resumen.totalConCreditos)}
              />
              <TarjetaMetricaMini
                label="Con mensualidad"
                valor={String(metricas.resumen.totalConMensualidad)}
              />
              <TarjetaMetricaMini
                label="Sin modelo"
                valor={String(metricas.resumen.totalSinModelo)}
              />
              <TarjetaMetricaMini
                label="Porcentaje monetizado"
                valor={`${metricas.resumen.porcentajeMonetizados.toFixed(1)}%`}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <TarjetaMetricaMini
                label="Ingresos por créditos"
                valor={formatMoney(metricas.resumen.ingresosTotalesCreditos)}
              />
              <TarjetaMetricaMini
                label="Ingresos por mensualidades"
                valor={formatMoney(metricas.resumen.ingresosTotalesMensualidad)}
              />
              <TarjetaMetricaMini
                label="Ingresos por comisiones"
                valor={formatMoney(metricas.resumen.ingresosTotalesComisiones)}
              />
              <TarjetaMetricaMini
                label="Ingresos históricos"
                valor={formatMoney(metricas.resumen.ingresosTotales)}
              />
            </div>

            <PanelGrafico
              titulo={monetizacionMensual ? 'Ingresos por mes' : 'Ingresos por semana'}
              descripcion={
                monetizacionMensual
                  ? `Periodo ${etiquetaRangoMonetizacion} · créditos, mensualidades, comisiones y total`
                  : 'Créditos, mensualidades, comisiones y total'
              }
            >
              {serieIngresosPeriodo.some(
                (p) => p.creditos > 0 || p.mensualidad > 0 || p.comisiones > 0,
              ) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={serieIngresosPeriodo}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-line)"
                    />
                    <XAxis
                      dataKey="etiqueta"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={(valor: number) => `S/ ${valor}`}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        const filas = payload.map((entrada) => ({
                          color: String(entrada.color ?? 'var(--color-ink-3)'),
                          nombre: String(entrada.name ?? ''),
                          texto: formatMoney(Number(entrada.value ?? 0)),
                        }))
                        return (
                          <TooltipGrafico
                            activo={active}
                            etiqueta={String(label)}
                            filas={filas}
                          />
                        )
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="creditos"
                      name="Créditos"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mensualidad"
                      name="Mensualidades"
                      stroke="var(--color-chart-3)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="comisiones"
                      name="Comisiones"
                      stroke="var(--color-chart-4)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke="var(--color-ink)"
                      strokeWidth={2.4}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="grid h-full place-items-center text-sm text-ink-3">
                  Sin ingresos registrados en el periodo.
                </p>
              )}
            </PanelGrafico>

            <div className="grid gap-4 lg:grid-cols-2">
              <PanelGrafico
                titulo={monetizacionMensual ? 'Modelos activos por mes' : 'Modelos activos por semana'}
                descripcion={
                  monetizacionMensual
                    ? `Periodo ${etiquetaRangoMonetizacion} · técnicos con créditos vs mensualidad`
                    : 'Técnicos con créditos vs mensualidad'
                }
              >
                {serieModelosPeriodo.some(
                  (p) => p.creditos > 0 || p.mensualidad > 0,
                ) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={serieModelosPeriodo}
                      margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--color-line)"
                      />
                      <XAxis
                        dataKey="etiqueta"
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
                        width={32}
                      />
                      <Tooltip
                        cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null
                          const filas = payload.map((entrada) => ({
                            color: String(entrada.color ?? 'var(--color-ink-3)'),
                            nombre: String(entrada.name ?? ''),
                            texto: `${Number(entrada.value ?? 0)} técnicos`,
                          }))
                          return (
                            <TooltipGrafico
                              activo={active}
                              etiqueta={String(label)}
                              filas={filas}
                            />
                          )
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="creditos"
                        name="Créditos"
                        stroke="var(--color-chart-1)"
                        strokeWidth={2.4}
                        dot={{ r: 2.5 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mensualidad"
                        name="Mensualidad"
                        stroke="var(--color-chart-3)"
                        strokeWidth={2.4}
                        dot={{ r: 2.5 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="grid h-full place-items-center text-sm text-ink-3">
                    Sin técnicos con modelo activo en el periodo.
                  </p>
                )}
              </PanelGrafico>

              <PanelGrafico
                titulo="Adopción de monetización"
                descripcion={
                  monetizacionMensual
                    ? `Disponible por semana; el rango ${etiquetaRangoMonetizacion} abarca varios meses`
                    : 'Técnicos verificados vs con modelo activo'
                }
              >
                {monetizacionMensual ? (
                  <p className="grid h-full place-items-center text-center text-sm text-ink-3">
                    La serie de adopción solo existe por semana.
                    <br />
                    Selecciona un rango de un mes para verla.
                  </p>
                ) : serieAdopcionPeriodo.some(
                    (p) => p.verificados > 0 || p.conModelo > 0,
                  ) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={serieAdopcionPeriodo}
                      margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--color-line)"
                      />
                      <XAxis
                        dataKey="etiqueta"
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
                        width={32}
                      />
                      <Tooltip
                        cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null
                          const filas = payload.map((entrada) => ({
                            color: String(entrada.color ?? 'var(--color-ink-3)'),
                            nombre: String(entrada.name ?? ''),
                            texto: `${Number(entrada.value ?? 0)} técnicos`,
                          }))
                          return (
                            <TooltipGrafico
                              activo={active}
                              etiqueta={String(label)}
                              filas={filas}
                            />
                          )
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="verificados"
                        name="Verificados"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2.4}
                        dot={{ r: 2.5 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="conModelo"
                        name="Con modelo activo"
                        stroke="var(--color-chart-4)"
                        strokeWidth={2.4}
                        dot={{ r: 2.5 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="grid h-full place-items-center text-sm text-ink-3">
                    Sin datos de adopción en el periodo.
                  </p>
                )}
              </PanelGrafico>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
