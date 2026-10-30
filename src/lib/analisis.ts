import type { MetricasDashboard, MetricasMonetizacion } from '../services/admin'
import { diferenciaMeses, mesActualISO, nombreMes, restarMeses } from './periodo.ts'

export const METRICAS_ANALISIS = [
  { id: 'registros', nombre: 'Técnicos registrados', grupo: 'Comunidad', unidad: 'cantidad' },
  { id: 'verificados', nombre: 'Verificaciones', grupo: 'Comunidad', unidad: 'cantidad' },
  { id: 'clientesNuevos', nombre: 'Clientes nuevos', grupo: 'Comunidad', unidad: 'cantidad' },
  { id: 'servicios', nombre: 'Solicitudes de servicio', grupo: 'Servicios', unidad: 'cantidad' },
  { id: 'completados', nombre: 'Servicios completados', grupo: 'Servicios', unidad: 'cantidad' },
  { id: 'conversion', nombre: 'Tasa de conversión', grupo: 'Servicios', unidad: 'porcentaje' },
  { id: 'cancelacionesTardias', nombre: 'Cancelaciones tardías', grupo: 'Servicios', unidad: 'cantidad' },
  { id: 'resenas', nombre: 'Reseñas recibidas', grupo: 'Servicios', unidad: 'cantidad' },
  { id: 'ingresos', nombre: 'Ingresos totales', grupo: 'Ingresos', unidad: 'moneda' },
  { id: 'creditos', nombre: 'Ingresos por créditos', grupo: 'Ingresos', unidad: 'moneda' },
  { id: 'mensualidad', nombre: 'Ingresos por mensualidades', grupo: 'Ingresos', unidad: 'moneda' },
  { id: 'comisiones', nombre: 'Ingresos por comisiones', grupo: 'Ingresos', unidad: 'moneda' },
] as const

export type MetricaAnalisis = typeof METRICAS_ANALISIS[number]
export type MetricaId = MetricaAnalisis['id']
export type Comparacion = 'anterior' | 'anio_anterior' | 'personalizado' | 'ninguna'
export interface RangoAnalisis { inicio: string; fin: string }
export interface ConfiguracionAnalisis {
  rango: RangoAnalisis
  comparacion: Comparacion
  referenciaFin: string
}
export interface FilaAnalisis { mes: string; valores: Record<MetricaId, number | null> }

export function mesReal(valor: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(valor) && Number(valor.slice(0, 4)) >= 1900
}

export function validarRango(rango: RangoAnalisis, hoy = mesActualISO()): string | null {
  if (!mesReal(rango.inicio) || !mesReal(rango.fin)) return 'Introduce meses válidos.'
  if (rango.inicio > rango.fin) return 'El inicio debe ser anterior o igual al fin.'
  if (rango.fin > hoy) return 'El periodo no puede incluir meses futuros.'
  if (diferenciaMeses(rango.inicio, rango.fin) > 12) return 'Selecciona un máximo de 12 meses por periodo.'
  return null
}

export function rangoReferencia(config: ConfiguracionAnalisis): RangoAnalisis | null {
  const { rango, comparacion, referenciaFin } = config
  if (comparacion === 'ninguna') return null
  const cantidad = diferenciaMeses(rango.inicio, rango.fin)
  if (comparacion === 'anio_anterior') return { inicio: restarMeses(rango.inicio, 12), fin: restarMeses(rango.fin, 12) }
  const fin = comparacion === 'personalizado' ? referenciaFin : restarMeses(rango.inicio, 1)
  return { inicio: restarMeses(fin, cantidad - 1), fin }
}

export function leerConfiguracion(params: URLSearchParams, hoy = mesActualISO()): ConfiguracionAnalisis {
  const finPredeterminado = restarMeses(hoy, 1)
  const candidato = { inicio: params.get('desde') ?? '', fin: params.get('hasta') ?? '' }
  const rango = validarRango(candidato, hoy) ? { inicio: restarMeses(finPredeterminado, 2), fin: finPredeterminado } : candidato
  const modo = params.get('comparar')
  const comparacion = modo === 'anio_anterior' || modo === 'personalizado' || modo === 'ninguna' ? modo : 'anterior'
  const referenciaFin = params.get('referencia') ?? restarMeses(rango.inicio, 1)
  const config: ConfiguracionAnalisis = { rango, comparacion, referenciaFin }
  const referencia = rangoReferencia(config)
  if (referencia && validarRango(referencia, hoy)) {
    const anterior: ConfiguracionAnalisis = { ...config, comparacion: 'anterior' }
    const rangoAnterior = rangoReferencia(anterior)
    return rangoAnterior && validarRango(rangoAnterior, hoy) ? { ...config, comparacion: 'ninguna' } : anterior
  }
  return config
}

export function mesesDelRango(rango: RangoAnalisis): string[] {
  return Array.from({ length: diferenciaMeses(rango.inicio, rango.fin) }, (_, indice) => restarMeses(rango.inicio, -indice))
}

function numero(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 ? valor : null
}

export function normalizarAnalisis(rango: RangoAnalisis, dashboard: MetricasDashboard | null, ingresos: MetricasMonetizacion | null): FilaAnalisis[] {
  return mesesDelRango(rango).map((mes) => {
    const actividad = Array.isArray(dashboard?.seriesMensuales?.serie) ? dashboard.seriesMensuales.serie.find((fila) => fila.mes === mes) : undefined
    const dinero = Array.isArray(ingresos?.ingresosMensuales?.serie) ? ingresos.ingresosMensuales.serie.find((fila) => fila.mes === mes) : undefined
    const completados = numero(actividad?.completados)
    const servicios = numero(actividad?.servicios)
    return { mes, valores: {
      registros: numero(actividad?.registros), verificados: numero(actividad?.verificados), clientesNuevos: numero(actividad?.clientesNuevos),
      servicios, completados, conversion: servicios !== null && servicios > 0 && completados !== null ? completados / servicios * 100 : null,
      cancelacionesTardias: numero(actividad?.cancelacionesTardias), resenas: numero(actividad?.resenas),
      ingresos: numero(dinero?.ingresosTotalMes), creditos: numero(dinero?.ingresosCreditosMes), mensualidad: numero(dinero?.ingresosMensualidadMes), comisiones: numero(dinero?.ingresosComisionesMes),
    } }
  })
}

export function totalMetrica(filas: FilaAnalisis[], id: MetricaId): number | null {
  if (!filas.length) return null
  if (id === 'conversion') {
    const completados = totalMetrica(filas, 'completados')
    const servicios = totalMetrica(filas, 'servicios')
    return completados !== null && servicios !== null && servicios > 0 ? completados / servicios * 100 : null
  }
  const valores = filas.map((fila) => fila.valores[id])
  return valores.every((valor) => valor !== null) ? valores.reduce<number>((suma, valor) => suma + (valor ?? 0), 0) : null
}

export function variacion(actual: number | null, referencia: number | null) {
  if (actual === null || referencia === null) return { absoluta: null, relativa: null }
  const absoluta = actual - referencia
  return { absoluta, relativa: referencia === 0 ? (actual === 0 ? 0 : null) : absoluta / referencia * 100 }
}

export function formatearMetrica(valor: number | null, unidad: MetricaAnalisis['unidad']): string {
  if (valor === null) return '—'
  if (unidad === 'moneda') return valor.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
  return valor.toLocaleString('es-PE', { maximumFractionDigits: unidad === 'porcentaje' ? 1 : 0 }) + (unidad === 'porcentaje' ? '%' : '')
}

export function crearCsvAnalisis(actual: FilaAnalisis[], referencia: FilaAnalisis[]): string {
  const filas: (string | number)[][] = [['Periodo', 'Mes', 'Indicador', 'Unidad', 'Valor']]
  for (const [periodo, datos] of [['Estudio', actual], ['Referencia', referencia]] as const) {
    for (const fila of datos) for (const metrica of METRICAS_ANALISIS) {
      filas.push([periodo, fila.mes, metrica.nombre, metrica.unidad === 'moneda' ? 'PEN' : metrica.unidad, fila.valores[metrica.id] ?? ''])
    }
  }
  return '\ufeff' + filas.map((fila) => fila.map((celda) => `"${String(celda).replaceAll('"', '""')}"`).join(';')).join('\r\n')
}

export function etiquetaPosicion(fila: FilaAnalisis | undefined): string {
  return fila ? nombreMes(fila.mes) : '—'
}
