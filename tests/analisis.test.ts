import test from 'node:test'
import assert from 'node:assert/strict'
import { crearCsvAnalisis, leerConfiguracion, mesesDelRango, normalizarAnalisis, rangoReferencia, totalMetrica, validarRango, variacion } from '../src/lib/analisis.ts'
import type { MetricasDashboard, MetricasMonetizacion, RegistroMes } from '../src/services/admin.ts'

function actividad(serie: Partial<RegistroMes>[]): MetricasDashboard {
  // Only monthly data is consumed by these calculation tests.
  return { seriesMensuales: { meses: serie.length, serie } } as MetricasDashboard
}

test('el inicio predeterminado usa tres meses cerrados y un periodo anterior de igual duración', () => {
  const config = leerConfiguracion(new URLSearchParams(), '2026-10')
  assert.deepEqual(config.rango, { inicio: '2026-07', fin: '2026-09' })
  assert.deepEqual(rangoReferencia(config), { inicio: '2026-04', fin: '2026-06' })
})

test('compara rangos al cruzar un año y conserva su duración', () => {
  const config = leerConfiguracion(new URLSearchParams('desde=2025-12&hasta=2026-02'), '2026-10')
  assert.deepEqual(mesesDelRango(config.rango), ['2025-12', '2026-01', '2026-02'])
  assert.deepEqual(rangoReferencia(config), { inicio: '2025-09', fin: '2025-11' })
  assert.deepEqual(rangoReferencia({ ...config, comparacion: 'anio_anterior' }), { inicio: '2024-12', fin: '2025-02' })
  assert.deepEqual(rangoReferencia({ ...config, comparacion: 'personalizado', referenciaFin: '2024-01' }), { inicio: '2023-11', fin: '2024-01' })
  assert.equal(rangoReferencia({ ...config, comparacion: 'ninguna' }), null)
})

test('rechaza meses imposibles, orden invertido, futuros y más de doce meses', () => {
  for (const rango of [
    { inicio: '2026-13', fin: '2026-13' }, { inicio: '2026-09', fin: '2026-08' },
    { inicio: '2026-09', fin: '2026-11' }, { inicio: '2025-10', fin: '2026-10' },
  ]) assert.ok(validarRango(rango, '2026-10'))
  assert.equal(validarRango({ inicio: '2025-11', fin: '2026-10' }, '2026-10'), null)
  assert.deepEqual(leerConfiguracion(new URLSearchParams('desde=2026-00&hasta=2026-99'), '2026-10').rango, { inicio: '2026-07', fin: '2026-09' })
})

test('la conversión del periodo se pondera por solicitudes en lugar de promediar porcentajes', () => {
  const filas = normalizarAnalisis({ inicio: '2026-08', fin: '2026-09' }, actividad([
    { mes: '2026-08', servicios: 1, completados: 1 }, { mes: '2026-09', servicios: 99, completados: 9 },
  ]), null)
  assert.equal(totalMetrica(filas, 'conversion'), 10)
  assert.equal(totalMetrica(filas, 'servicios'), 100)
})

test('una referencia fuera del intervalo admitido nunca produce una consulta inválida', () => {
  const config = leerConfiguracion(new URLSearchParams('desde=1900-01&hasta=1900-02&comparar=anterior'), '2026-10')
  assert.equal(config.comparacion, 'ninguna')
  const futura = leerConfiguracion(new URLSearchParams('desde=2026-08&hasta=2026-09&comparar=personalizado&referencia=2030-01'), '2026-10')
  assert.equal(futura.comparacion, 'anterior')
})

test('conserva ceros reales y deja los meses ausentes sin dato', () => {
  const filas = normalizarAnalisis({ inicio: '2026-08', fin: '2026-09' }, actividad([{ mes: '2026-08', registros: 0 }]), null)
  assert.equal(filas[0].valores.registros, 0)
  assert.equal(filas[1].valores.registros, null)
  assert.equal(totalMetrica(filas, 'registros'), null)
  assert.equal(totalMetrica([filas[0]], 'registros'), 0)
  assert.equal(totalMetrica(filas, 'ingresos'), null)
  assert.equal(totalMetrica([], 'registros'), null)
})

test('una tasa sin solicitudes no se representa como una tasa real de cero', () => {
  const filas = normalizarAnalisis({ inicio: '2026-09', fin: '2026-09' }, actividad([{ mes: '2026-09', servicios: 0, completados: 0 }]), null)
  assert.equal(totalMetrica(filas, 'conversion'), null)
})

test('el ingreso usa la serie mensual aunque el resumen tenga un total global distinto', () => {
  const ingresos = { ingresosMensuales: { serie: [{ mes: '2026-09', ingresosTotalMes: 25.5, ingresosCreditosMes: 20, ingresosMensualidadMes: 5, ingresosComisionesMes: 0.5 }] }, resumen: { ingresosTotales: 99999 } } as MetricasMonetizacion
  const filas = normalizarAnalisis({ inicio: '2026-09', fin: '2026-09' }, null, ingresos)
  assert.equal(totalMetrica(filas, 'ingresos'), 25.5)
  assert.equal(totalMetrica(filas, 'comisiones'), 0.5)
  assert.equal(totalMetrica(filas, 'registros'), null)
})

test('una referencia cero no fabrica una variación del cien por ciento', () => {
  assert.deepEqual(variacion(10, 0), { absoluta: 10, relativa: null })
  assert.deepEqual(variacion(0, 0), { absoluta: 0, relativa: 0 })
  assert.deepEqual(variacion(5, 10), { absoluta: -5, relativa: -50 })
  assert.deepEqual(variacion(null, 10), { absoluta: null, relativa: null })
})

test('el CSV identifica periodo, mes, unidades y conserva vacíos los datos ausentes', () => {
  const filas = normalizarAnalisis({ inicio: '2026-09', fin: '2026-09' }, actividad([{ mes: '2026-09', registros: 0 }]), null)
  const csv = crearCsvAnalisis(filas, filas)
  assert.ok(csv.startsWith('\ufeff'))
  assert.ok(csv.includes('"Estudio";"2026-09";"Técnicos registrados";"cantidad";"0"'))
  assert.ok(csv.includes('"Referencia";"2026-09";"Ingresos totales";"PEN";""'))
  assert.ok(!csv.includes('NaN'))
})
