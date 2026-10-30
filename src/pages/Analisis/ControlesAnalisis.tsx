import { useState, type FormEvent } from 'react'
import { diferenciaMeses, mesActualISO, rangoTexto, restarMeses } from '../../lib/periodo'
import { mesReal, rangoReferencia, validarRango, type Comparacion, type ConfiguracionAnalisis } from '../../lib/analisis'

const claseCampo = 'h-10 w-full min-w-0 rounded-lg border border-transparent bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary'

export default function ControlesAnalisis({ config, onAplicar }: { config: ConfiguracionAnalisis; onAplicar: (config: ConfiguracionAnalisis) => void }) {
  const [borrador, setBorrador] = useState(config)
  const [error, setError] = useState<string | null>(null)
  const hoy = mesActualISO()
  const rangoValido = mesReal(borrador.rango.inicio) && mesReal(borrador.rango.fin) && borrador.rango.inicio <= borrador.rango.fin
  const referencia = rangoValido && (borrador.comparacion !== 'personalizado' || mesReal(borrador.referenciaFin)) ? rangoReferencia(borrador) : null
  const meses = rangoValido ? diferenciaMeses(borrador.rango.inicio, borrador.rango.fin) : null
  const pendiente = borrador.rango.inicio !== config.rango.inicio || borrador.rango.fin !== config.rango.fin || borrador.comparacion !== config.comparacion || (borrador.comparacion === 'personalizado' && borrador.referenciaFin !== config.referenciaFin)

  function aplicar(evento: FormEvent) {
    evento.preventDefault()
    const mensaje = validarRango(borrador.rango) ?? (referencia ? validarRango(referencia) : null)
    setError(mensaje)
    if (!mensaje) onAplicar(borrador)
  }

  function seleccionarMeses(cantidad: number) {
    const fin = restarMeses(hoy, 1)
    setBorrador({ ...borrador, rango: { inicio: restarMeses(fin, cantidad - 1), fin } })
    setError(null)
  }

  return (
    <form onSubmit={aplicar} className="space-y-5 rounded-2xl bg-surface p-5 sm:p-6" aria-label="Configurar periodos de análisis">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-ink">Elige qué periodos explorar</h2>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Periodos rápidos">
          {[1, 3, 6, 12].map((cantidad) => <button key={cantidad} type="button" onClick={() => seleccionarMeses(cantidad)} className="rounded-full px-3 py-2 text-xs font-medium text-ink-2 transition hover:bg-primary-soft hover:text-link">{cantidad === 1 ? 'Último mes cerrado' : `${cantidad} meses cerrados`}</button>)}
        </div>
      </div>
      <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_1fr_auto]">
        <label className="space-y-2 text-xs font-medium text-ink-2">Desde<input required type="month" max={hoy} min="1900-01" value={borrador.rango.inicio} onChange={(e) => setBorrador({ ...borrador, rango: { ...borrador.rango, inicio: e.target.value } })} className={claseCampo} /></label>
        <label className="space-y-2 text-xs font-medium text-ink-2">Hasta<input required type="month" max={hoy} min="1900-01" value={borrador.rango.fin} onChange={(e) => setBorrador({ ...borrador, rango: { ...borrador.rango, fin: e.target.value } })} className={claseCampo} /></label>
        <label className="space-y-2 text-xs font-medium text-ink-2">Comparar con<select aria-label="Comparar con" value={borrador.comparacion} onChange={(e) => setBorrador({ ...borrador, comparacion: e.target.value as Comparacion })} className={claseCampo}>
          <option value="anterior">Periodo anterior</option><option value="anio_anterior">Mismos meses del año anterior</option><option value="personalizado">Otro periodo</option><option value="ninguna">Sin comparación</option>
        </select></label>
        {borrador.comparacion === 'personalizado' ? <label className="space-y-2 text-xs font-medium text-ink-2">Mes final de referencia<input required type="month" max={hoy} min="1900-01" value={borrador.referenciaFin} onChange={(e) => setBorrador({ ...borrador, referenciaFin: e.target.value })} className={claseCampo} /></label> : <div className="text-xs text-ink-3"><p className="mb-2 font-medium text-ink-2">Referencia</p><p className="flex min-h-10 items-center leading-relaxed">{referencia ? rangoTexto(referencia.inicio, referencia.fin) : 'Solo el periodo de estudio'}</p></div>}
        <button type="submit" className="mt-1 min-h-10 rounded-lg bg-primary-strong px-5 text-sm font-semibold text-white transition hover:bg-primary-hover xl:mt-6">Aplicar periodos</button>
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-3"><p>Hasta 12 meses por periodo. La referencia conserva la misma duración.</p><p>{meses === null ? 'Completa el periodo' : `${meses} ${meses === 1 ? 'mes seleccionado' : 'meses seleccionados'}`}</p></div>
      {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
      {pendiente && !error && <p className="text-xs font-medium text-link" aria-live="polite">Cambios pendientes: aplica los periodos para actualizar el análisis.</p>}
    </form>
  )
}
