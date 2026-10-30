import { useState } from 'react'
import MetricGroup from '../../components/MetricGroup'
import PageHeading from '../../components/PageHeading'
import { IconAlertTriangle, IconClock, IconRefresh, IconSearch, IconUsers, IconX } from '../../components/icons'
import { obtenerIniciales } from '../../components/navigation'
import { useCancelacionesTardias } from '../../hooks/useCancelacionesTardias'

const FILTROS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'cliente', texto: 'Clientes' },
  { valor: 'tecnico', texto: 'Técnicos' },
] as const

type FiltroRol = typeof FILTROS[number]['valor']

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-PE')
}

function etiquetaRol(rol: string) {
  return rol === 'tecnico' ? 'Técnico' : rol === 'cliente' ? 'Cliente' : rol
}

export default function CancelacionesTardias() {
  const { usuarios, cargando, error, recargar } = useCancelacionesTardias()
  const [busqueda, setBusqueda] = useState('')
  const [rol, setRol] = useState<FiltroRol>('todos')
  const total = usuarios.reduce((suma, usuario) => suma + usuario.cancelacionesTardias, 0)
  const termino = normalizar(busqueda.trim())
  const visibles = usuarios.filter((usuario) =>
    (rol === 'todos' || usuario.rol === rol) && normalizar(`${usuario.nombre} ${usuario.email}`).includes(termino),
  )
  const sinDatos = cargando || Boolean(error)
  const resumen = [
    { etiqueta: 'Usuarios afectados', valor: usuarios.length.toLocaleString('es-PE'), Icono: IconUsers, descripcion: 'Con al menos una cancelación tardía' },
    { etiqueta: 'Cancelaciones tardías', valor: total.toLocaleString('es-PE'), Icono: IconClock, descripcion: 'Acumuladas en los últimos 30 días' },
    { etiqueta: 'Promedio por usuario', valor: usuarios.length ? (total / usuarios.length).toLocaleString('es-PE', { maximumFractionDigits: 1 }) : '0', Icono: IconAlertTriangle, descripcion: 'Sobre los usuarios afectados' },
  ]

  function limpiarFiltros() {
    setBusqueda('')
    setRol('todos')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 [&>div]:mb-0">
        <PageHeading titulo="Cancelaciones tardías" descripcion="Una mirada a los últimos 30 días para cuidar la experiencia de la comunidad." />
        <button type="button" onClick={recargar} disabled={cargando} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink-2 transition hover:bg-surface disabled:opacity-50">
          <IconRefresh className={`size-4 ${cargando ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <MetricGroup etiqueta="Resumen de cancelaciones">
        {resumen.map(({ etiqueta, valor, Icono, descripcion }) => (
          <div key={etiqueta}>
            <p className="flex items-center gap-2.5 text-sm font-medium text-ink-2"><Icono className="size-4 shrink-0 text-link" />{etiqueta}</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight tabular-nums text-ink">{sinDatos ? '—' : valor}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">{descripcion}</p>
          </div>
        ))}
      </MetricGroup>

      <section className="data-surface" aria-labelledby="titulo-cancelaciones">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-6 sm:px-7">
          <div>
            <h2 id="titulo-cancelaciones" className="font-display text-lg font-semibold tracking-tight text-ink">Detalle por usuario</h2>
            <p className="mt-1 text-sm text-ink-3">Ordenados por número de cancelaciones, de mayor a menor.</p>
          </div>
          <span className="pt-1 text-xs font-medium text-ink-3">Últimos 30 días</span>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filtrar por tipo de cuenta">
            {FILTROS.map((filtro) => {
              const cantidad = filtro.valor === 'todos' ? usuarios.length : usuarios.filter((usuario) => usuario.rol === filtro.valor).length
              return (
                <button key={filtro.valor} type="button" aria-pressed={rol === filtro.valor} onClick={() => setRol(filtro.valor)} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm transition ${rol === filtro.valor ? 'bg-primary-soft/60 font-semibold text-link' : 'text-ink-3 hover:bg-surface-2 hover:text-ink'}`}>
                  {filtro.texto}<span className="text-xs tabular-nums opacity-70">{sinDatos ? '—' : cantidad}</span>
                </button>
              )
            })}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} aria-label="Buscar usuario por nombre o correo" placeholder="Buscar nombre o correo" className="h-10 w-full rounded-lg border border-transparent bg-surface-2 pl-9 pr-10 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-primary" />
            {busqueda && <button type="button" onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda" className="absolute right-1 top-1 grid size-8 place-items-center rounded-full text-ink-3 hover:text-ink"><IconX className="size-4" /></button>}
          </div>
        </div>

        {error ? (
          <div role="alert" className="mx-5 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-danger-soft/60 p-5 sm:mx-7">
            <div className="flex items-start gap-3"><IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-danger-text" /><div><p className="text-sm font-semibold text-ink">No se pudieron cargar las cancelaciones</p><p className="mt-1 text-sm text-ink-2">{error}</p></div></div>
            <button type="button" onClick={recargar} className="rounded-lg px-3 py-2 text-sm font-semibold text-danger-text hover:bg-danger-soft">Reintentar</button>
          </div>
        ) : cargando ? (
          <div role="status" aria-label="Cargando cancelaciones" className="space-y-6 px-5 py-6 sm:px-7">
            {[0, 1, 2, 3].map((indice) => <div key={indice} className="flex animate-pulse items-center gap-4"><div className="size-10 rounded-full bg-line/50" /><div className="flex-1 space-y-2"><div className="h-3 w-2/5 rounded bg-line/50" /><div className="h-3 w-3/5 rounded bg-line/30" /></div><div className="h-5 w-8 rounded bg-line/50" /></div>)}
          </div>
        ) : visibles.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            {usuarios.length === 0 ? <IconClock className="size-8 text-link" /> : <IconSearch className="size-8 text-link" />}
            <h3 className="mt-4 font-display text-base font-semibold text-ink">{usuarios.length === 0 ? 'Todo en orden por aquí' : 'No encontramos coincidencias'}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-3">{usuarios.length === 0 ? 'No se registraron cancelaciones tardías en los últimos 30 días.' : 'Prueba con otro nombre, correo o tipo de cuenta.'}</p>
            {usuarios.length > 0 && <button type="button" onClick={limpiarFiltros} className="mt-4 px-3 py-2 text-sm font-semibold text-link">Limpiar filtros</button>}
          </div>
        ) : (
          <table className="w-full table-fixed text-left text-sm">
            <caption className="sr-only">Usuarios con cancelaciones tardías en los últimos 30 días. La participación indica el porcentaje sobre el total de cancelaciones.</caption>
            <thead><tr>
              <th scope="col" className="w-auto pl-5 pr-3 sm:pl-7">Usuario</th>
              <th scope="col" className="hidden w-28 px-4 md:table-cell">Cuenta</th>
              <th scope="col" className="w-28 px-5 text-right sm:w-36 sm:px-6"><span className="sm:hidden">Total</span><span className="hidden sm:inline">Cancelaciones</span></th>
              <th scope="col" className="hidden w-44 pl-4 pr-7 text-right lg:table-cell">Del total</th>
            </tr></thead>
            <tbody className="divide-y divide-line/40">
              {visibles.map((usuario) => {
                const participacion = total ? (usuario.cancelacionesTardias / total) * 100 : 0
                return (
                  <tr key={usuario.usuarioId} className="transition-colors hover:bg-surface-2/60">
                    <td className="pl-5 pr-3 sm:pl-7"><div className="flex min-w-0 items-center gap-3">
                      <span className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-ink-2 sm:flex" aria-hidden="true">{obtenerIniciales(usuario.nombre)}</span>
                      <div className="min-w-0"><p className="break-words font-semibold text-ink">{usuario.nombre}</p><p className="mt-1 truncate text-xs text-ink-3" title={usuario.email}>{usuario.email}</p><p className="mt-1.5 text-xs text-ink-3 md:hidden">{etiquetaRol(usuario.rol)}</p></div>
                    </div></td>
                    <td className="hidden px-4 text-ink-2 md:table-cell">{etiquetaRol(usuario.rol)}</td>
                    <td className="px-5 text-right sm:px-6"><span className="font-display text-xl font-semibold tabular-nums text-ink">{usuario.cancelacionesTardias}</span></td>
                    <td className="hidden pl-4 pr-7 lg:table-cell"><div className="flex items-center justify-end gap-3"><span className="h-1 w-16 overflow-hidden rounded-full bg-line/40" aria-hidden="true"><span className="block h-full rounded-full bg-primary/60" style={{ width: `${participacion}%` }} /></span><span className="w-10 text-right text-xs tabular-nums text-ink-2">{participacion.toLocaleString('es-PE', { maximumFractionDigits: 0 })}%</span></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {!cargando && !error && usuarios.length > 0 && <div className="flex flex-wrap justify-between gap-2 px-5 py-5 text-xs text-ink-3 sm:px-7"><p aria-live="polite">{visibles.length} de {usuarios.length} usuarios</p><p>Sin sanciones automáticas</p></div>}
      </section>
      <p className="max-w-2xl px-1 text-xs leading-relaxed text-ink-3">Los conteos ayudan a identificar patrones. Cada caso requiere revisión individual; este listado no aplica sanciones.</p>
    </div>
  )
}
