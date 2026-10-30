import { useSearchParams } from 'react-router-dom'
import { ArrowDownToLine, ArrowRight, ChartNoAxesCombined, RefreshCw } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeading from '../../components/PageHeading'
import MetricGroup from '../../components/MetricGroup'
import { TooltipGrafico } from '../../components/panel-grafico'
import { useAnalisis } from '../../hooks/useAnalisis'
import { METRICAS_ANALISIS, crearCsvAnalisis, etiquetaPosicion, formatearMetrica, leerConfiguracion, rangoReferencia, totalMetrica, variacion, type ConfiguracionAnalisis } from '../../lib/analisis'
import { mesActualISO, nombreMes, rangoTexto } from '../../lib/periodo'
import ControlesAnalisis from './ControlesAnalisis'

const claseAccion = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-ink-2 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40'

function cambioTexto(actual: number | null, referencia: number | null, puntos: boolean) {
  const cambio = variacion(actual, referencia)
  const valor = puntos ? cambio.absoluta : cambio.relativa
  if (valor === null) return actual !== null && referencia === 0 ? 'Sin base comparable' : '—'
  if (Math.abs(valor) < 0.000001) return 'Sin cambios'
  return `${valor > 0 ? '+' : ''}${valor.toLocaleString('es-PE', { maximumFractionDigits: 1 })}${puntos ? ' pts' : '%'}`
}

export default function Analisis() {
  const [params, setParams] = useSearchParams()
  const config = leerConfiguracion(params)
  const referencia = rangoReferencia(config)
  const metrica = METRICAS_ANALISIS.find((item) => item.id === params.get('metrica')) ?? METRICAS_ANALISIS[0]
  const vista = params.get('vista') === 'tabla' ? 'tabla' : 'grafico'
  const { estudio, referencia: datosReferencia, cargando, avisos, recargar } = useAnalisis(config)
  const total = totalMetrica(estudio, metrica.id)
  const totalReferencia = totalMetrica(datosReferencia, metrica.id)
  const cambio = variacion(total, totalReferencia)
  const hayDatos = estudio.some((fila) => Object.values(fila.valores).some((valor) => valor !== null)) || datosReferencia.some((fila) => Object.values(fila.valores).some((valor) => valor !== null))
  const hayGrafico = estudio.some((fila) => fila.valores[metrica.id] !== null) || datosReferencia.some((fila) => fila.valores[metrica.id] !== null)
  const puntos = estudio.map((fila, indice) => ({ posicion: indice + 1, estudio: fila.valores[metrica.id], referencia: datosReferencia[indice]?.valores[metrica.id] ?? null, mes: nombreMes(fila.mes), mesReferencia: etiquetaPosicion(datosReferencia[indice]) }))
  const valores = estudio.flatMap((fila) => fila.valores[metrica.id] === null ? [] : [fila.valores[metrica.id]!])
  const avisosDatos = [...avisos]
  if (!cargando && total === null) avisosDatos.push('El indicador no está disponible para todos los meses de estudio. Los datos ausentes se muestran con —.')
  if (!cargando && referencia && totalReferencia === null) avisosDatos.push('La referencia no tiene datos suficientes para calcular una comparación completa.')

  function actualizarConfig(nueva: ConfiguracionAnalisis) {
    const siguiente = new URLSearchParams(params)
    siguiente.set('desde', nueva.rango.inicio)
    siguiente.set('hasta', nueva.rango.fin)
    siguiente.set('comparar', nueva.comparacion)
    if (nueva.comparacion === 'personalizado') siguiente.set('referencia', nueva.referenciaFin)
    else siguiente.delete('referencia')
    setParams(siguiente)
  }

  function cambiarParametro(nombre: string, valor: string) {
    const siguiente = new URLSearchParams(params)
    siguiente.set(nombre, valor)
    setParams(siguiente)
  }

  function exportar() {
    const url = URL.createObjectURL(new Blob([crearCsvAnalisis(estudio, datosReferencia)], { type: 'text/csv;charset=utf-8;' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `trabajaya-analisis-${config.rango.inicio}-${config.rango.fin}.csv`
    enlace.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const bloques = referencia ? [
    { titulo: 'Periodo de estudio', valor: formatearMetrica(total, metrica.unidad), detalle: rangoTexto(config.rango.inicio, config.rango.fin) },
    { titulo: 'Periodo de referencia', valor: formatearMetrica(totalReferencia, metrica.unidad), detalle: rangoTexto(referencia.inicio, referencia.fin) },
    { titulo: 'Diferencia', valor: cambio.absoluta === null ? '—' : `${cambio.absoluta > 0 ? '+' : ''}${metrica.unidad === 'porcentaje' ? cambio.absoluta.toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' pts' : formatearMetrica(cambio.absoluta, metrica.unidad)}`, detalle: 'Estudio menos referencia' },
    { titulo: metrica.unidad === 'porcentaje' ? 'Cambio en puntos' : 'Variación relativa', valor: cambioTexto(total, totalReferencia, metrica.unidad === 'porcentaje'), detalle: totalReferencia === 0 && total !== null && total > 0 ? 'La referencia es cero; no se calcula un porcentaje' : 'Frente al periodo de referencia' },
  ] : [
    { titulo: metrica.unidad === 'porcentaje' ? 'Tasa del periodo' : 'Total del periodo', valor: formatearMetrica(total, metrica.unidad), detalle: rangoTexto(config.rango.inicio, config.rango.fin) },
    { titulo: 'Meses con dato', valor: String(valores.length), detalle: `De ${estudio.length} meses seleccionados` },
    { titulo: 'Máximo mensual', valor: formatearMetrica(valores.length ? Math.max(...valores) : null, metrica.unidad), detalle: 'Mayor valor dentro del periodo' },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4 [&>div]:mb-0">
        <PageHeading titulo="Análisis histórico" descripcion="Explora la evolución de TrabajaYa y compara periodos con contexto." />
        <div className="flex items-center gap-1"><button type="button" onClick={recargar} disabled={cargando} className={claseAccion} aria-label="Actualizar análisis"><RefreshCw className={`size-4 ${cargando ? 'animate-spin' : ''}`} /></button><button type="button" onClick={exportar} disabled={cargando || !hayDatos} className={claseAccion}><ArrowDownToLine className="size-4" />Exportar CSV</button></div>
      </div>
      <ControlesAnalisis key={`${config.rango.inicio}|${config.rango.fin}|${config.comparacion}|${config.referenciaFin}`} config={config} onAplicar={actualizarConfig} />
      {(config.rango.fin === mesActualISO() || referencia?.fin === mesActualISO()) && <p className="px-1 text-sm leading-relaxed text-warning-text">Uno de los periodos incluye el mes actual, todavía en curso. Sus valores pueden cambiar y cubren menos días que un mes cerrado.</p>}
      {referencia && referencia.inicio <= config.rango.fin && referencia.fin >= config.rango.inicio && <p className="px-1 text-sm text-ink-3">Los periodos se superponen: algunos meses participan en ambas series.</p>}
      <section aria-labelledby="titulo-indicador" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-indicador" className="font-display text-lg font-semibold text-ink">Explorar un indicador</h2>
          <label className="flex min-w-0 flex-wrap items-center gap-3 text-sm text-ink-2">Indicador<select aria-label="Indicador" value={metrica.id} onChange={(e) => cambiarParametro('metrica', e.target.value)} className="min-h-10 max-w-full rounded-lg bg-surface px-3 text-sm text-ink outline-none">
            {['Comunidad', 'Servicios', 'Ingresos'].map((grupo) => <optgroup key={grupo} label={grupo}>{METRICAS_ANALISIS.filter((item) => item.grupo === grupo).map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</optgroup>)}
          </select></label>
        </div>
        <MetricGroup etiqueta={`Resumen de ${metrica.nombre}`} columnas={referencia ? 4 : 3}>
          {bloques.map((bloque) => <div key={bloque.titulo}><p className="text-xs font-medium text-ink-3">{bloque.titulo}</p><p className="mt-3 break-words font-display text-2xl font-semibold tracking-tight tabular-nums text-ink">{cargando ? '—' : bloque.valor}</p><p className="mt-2 text-xs leading-relaxed text-ink-3">{bloque.detalle}</p></div>)}
        </MetricGroup>
        {avisosDatos.length > 0 && <div role="status" className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-warning-soft/60 p-4 text-sm text-warning-text"><ul className="max-w-3xl space-y-1">{avisosDatos.map((aviso) => <li key={aviso}>{aviso}</li>)}</ul><button type="button" onClick={recargar} className="px-2 py-1 font-semibold">Reintentar</button></div>}
        <div className="overflow-hidden rounded-2xl bg-surface">
          <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6"><div><h3 className="font-display text-base font-semibold text-ink">{metrica.nombre}</h3><p className="mt-1 text-xs leading-relaxed text-ink-3">{referencia ? 'Meses alineados por posición dentro de cada periodo.' : 'Evolución mensual del periodo seleccionado.'}</p></div><div role="group" aria-label="Vista del análisis" className="inline-flex rounded-lg bg-surface-2 p-1">{(['grafico', 'tabla'] as const).map((opcion) => <button key={opcion} type="button" aria-pressed={vista === opcion} onClick={() => cambiarParametro('vista', opcion)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${vista === opcion ? 'bg-surface text-link' : 'text-ink-3'}`}>{opcion === 'grafico' ? 'Gráfico' : 'Tabla'}</button>)}</div></div>
          {cargando ? <div role="status" className="flex h-80 items-center justify-center gap-3 text-sm text-ink-3"><RefreshCw className="size-4 animate-spin" />Cargando historial…</div> : vista === 'tabla' ? (
            <div className="relative overflow-x-auto px-5 pb-5 sm:px-6"><table className="w-full min-w-[520px] text-left text-sm"><caption className="sr-only">Detalle mensual de {metrica.nombre}</caption><thead><tr className="border-b border-line/60 text-xs text-ink-3"><th className="py-3 font-medium">Mes de estudio</th><th className="px-3 text-right font-medium">Valor</th>{referencia && <><th className="px-3 font-medium">Mes de referencia</th><th className="px-3 text-right font-medium">Valor</th><th className="pl-3 text-right font-medium">Variación</th></>}</tr></thead><tbody className="divide-y divide-line/40">{estudio.map((fila, indice) => <tr key={fila.mes}><td className="py-4 text-ink-2">{nombreMes(fila.mes)}</td><td className="px-3 text-right tabular-nums text-ink">{formatearMetrica(fila.valores[metrica.id], metrica.unidad)}</td>{referencia && <><td className="px-3 text-ink-2">{etiquetaPosicion(datosReferencia[indice])}</td><td className="px-3 text-right tabular-nums text-ink">{formatearMetrica(datosReferencia[indice]?.valores[metrica.id] ?? null, metrica.unidad)}</td><td className="pl-3 text-right text-xs tabular-nums text-ink-2">{cambioTexto(fila.valores[metrica.id], datosReferencia[indice]?.valores[metrica.id] ?? null, metrica.unidad === 'porcentaje')}</td></>}</tr>)}</tbody></table></div>
          ) : hayGrafico ? <>
            <div className="flex flex-wrap gap-x-6 gap-y-2 px-6 pb-4 text-xs text-ink-2"><span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-chart-1" />{rangoTexto(config.rango.inicio, config.rango.fin)}</span>{referencia && <span className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-chart-2" />{rangoTexto(referencia.inicio, referencia.fin)}</span>}</div>
            <div className="h-80 min-w-0 px-2 pb-5 sm:px-5"><ResponsiveContainer width="100%" height="100%"><LineChart data={puntos} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}><CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="3 5" /><XAxis dataKey="posicion" tickFormatter={(valor) => `Mes ${valor}`} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }} /><YAxis width={60} tickLine={false} axisLine={false} allowDecimals={metrica.unidad !== 'cantidad'} tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }} /><Tooltip content={({ active, label }) => { const punto = puntos.find((fila) => fila.posicion === Number(label)); return <TooltipGrafico activo={Boolean(active)} etiqueta={`Mes ${label}`} filas={punto ? [{ color: 'var(--color-chart-1)', nombre: `Estudio · ${punto.mes}`, texto: formatearMetrica(punto.estudio, metrica.unidad) }, ...(referencia ? [{ color: 'var(--color-chart-2)', nombre: `Referencia · ${punto.mesReferencia}`, texto: formatearMetrica(punto.referencia, metrica.unidad) }] : [])] : []} /> }} /><Line name="Estudio" dataKey="estudio" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />{referencia && <Line name="Referencia" dataKey="referencia" stroke="var(--color-chart-2)" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 2.5 }} connectNulls={false} isAnimationActive={false} />}</LineChart></ResponsiveContainer></div>
          </> : <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center"><ChartNoAxesCombined className="size-7 text-link" /><p className="text-sm text-ink-2">No hay datos disponibles para este indicador y periodo.</p><p className="text-xs text-ink-3">Puedes elegir otro indicador o reintentar la consulta.</p></div>}
        </div>
      </section>
      <section className="data-surface" aria-labelledby="titulo-panorama"><div className="px-6 py-5"><h2 id="titulo-panorama" className="font-display text-base font-semibold text-ink">Panorama del periodo</h2><p className="mt-1 text-xs text-ink-3">Selecciona un indicador para explorar su evolución.</p></div><div className="relative overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead><tr><th className="px-6">Indicador</th><th className="px-4 text-right">Estudio</th>{referencia && <><th className="px-4 text-right">Referencia</th><th className="px-6 text-right">Variación</th></>}</tr></thead><tbody className="divide-y divide-line/40">{METRICAS_ANALISIS.map((item) => { const a = totalMetrica(estudio, item.id); const b = totalMetrica(datosReferencia, item.id); return <tr key={item.id} className={item.id === metrica.id ? 'bg-primary-soft/30' : 'hover:bg-surface-2/60'}><td className="px-6"><button type="button" onClick={() => cambiarParametro('metrica', item.id)} className="inline-flex items-center gap-2 text-left font-medium text-ink">{item.nombre}<ArrowRight className="size-3.5 shrink-0 text-link" /></button></td><td className="px-4 text-right tabular-nums text-ink">{formatearMetrica(a, item.unidad)}</td>{referencia && <><td className="px-4 text-right tabular-nums text-ink-2">{formatearMetrica(b, item.unidad)}</td><td className="px-6 text-right text-xs tabular-nums text-ink-2">{cambioTexto(a, b, item.unidad === 'porcentaje')}</td></>}</tr> })}</tbody></table></div></section>
      <p className="max-w-3xl px-1 text-xs leading-relaxed text-ink-3">Los periodos muestran actividad mensual agregada; — indica un dato no disponible. La conversión se calcula sobre el total de solicitudes y completados del periodo. Los servicios se agrupan por fecha de solicitud y estado actual: sus conteos históricos pueden cambiar cuando avanzan de estado. Los ingresos corresponden a las transacciones de cada mes.</p>
    </div>
  )
}
