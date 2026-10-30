import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import {
  ESTADOS_REPORTE_INFO,
  etiquetaCategoria,
  etiquetaTipoObjetivo,
} from '../../components/reportes'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheckCircle,
  IconEyeOff,
  IconFlag,
  IconRefresh,
} from '../../components/icons'
import { ocultarResena, resolverReporte } from '../../services/admin'
import type { EstadoReporte } from '../../services/admin'
import { obtenerMensajeError } from '../../services/errors'
import { useReporteDetalle } from '../../hooks/useReporteDetalle'

const formatoFechaHora = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function ReporteDetalle() {
  const { id } = useParams()
  const { reporte, cargando, error, recargar } = useReporteDetalle(id)
  const [estadoResolucion, setEstadoResolucion] =
    useState<Exclude<EstadoReporte, 'pendiente'>>('resuelto')
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [mostrarOcultar, setMostrarOcultar] = useState(false)
  const [motivoOcultar, setMotivoOcultar] = useState('')
  const [ocultando, setOcultando] = useState(false)
  const [errorOcultar, setErrorOcultar] = useState<string | null>(null)
  const [resenaOculta, setResenaOculta] = useState(false)

  if (cargando) {
    return (
      <div className="space-y-7">
        <div className="h-8 w-44 animate-pulse bg-line" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface" />
      </div>
    )
  }

  if (error || !reporte) {
    return (
      <div className="space-y-7">
        <EnlaceVolver />
        <section className="flex flex-col items-start justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="inline-flex shrink-0 items-center justify-center text-danger-text">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                No se pudo cargar el reporte
              </p>
              <p className="text-sm text-ink-2">
                {error ?? 'Reporte no encontrado.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={recargar}
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-surface px-3 py-2 text-sm font-medium text-ink transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2"
          >
            <IconRefresh className="h-4 w-4" />
            Reintentar
          </button>
        </section>
      </div>
    )
  }

  const esPendiente = reporte.estado === 'pendiente'
  const objetivoNombre =
    reporte.objetivo.nombre ??
    `${etiquetaTipoObjetivo(reporte.objetivo.tipo)} #${reporte.objetivo.id}`

  async function resolver(evento: FormEvent) {
    evento.preventDefault()
    const texto = nota.trim()
    if (texto.length < 1 || texto.length > 500) {
      setErrorForm('La nota es obligatoria (entre 1 y 500 caracteres).')
      return
    }
    setEnviando(true)
    setErrorForm(null)
    try {
      await resolverReporte(reporte!.id, {
        estado: estadoResolucion,
        nota: texto,
      })
      setNota('')
      recargar()
    } catch (err) {
      setErrorForm(obtenerMensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  async function ocultar(evento: FormEvent) {
    evento.preventDefault()
    const texto = motivoOcultar.trim()
    if (texto.length < 1) {
      setErrorOcultar('El motivo es obligatorio.')
      return
    }
    setOcultando(true)
    setErrorOcultar(null)
    try {
      await ocultarResena(reporte!.objetivo.id, texto)
      setResenaOculta(true)
      setMotivoOcultar('')
      setMostrarOcultar(false)
    } catch (err) {
      setErrorOcultar(obtenerMensajeError(err))
    } finally {
      setOcultando(false)
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <EnlaceVolver />
        <button
          type="button"
          onClick={recargar}
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink"
        >
          <IconRefresh className="h-4 w-4" />
          Recargar
        </button>
      </div>

      <section className="rounded-2xl bg-surface p-6 shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex shrink-0 items-center justify-center text-link">
              <IconFlag className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {objetivoNombre}
                </h2>
                <Badge info={ESTADOS_REPORTE_INFO[reporte.estado]} />
              </div>
              <p className="mt-0.5 text-sm text-ink-2">
                Reporte #{reporte.id} ·{' '}
                {etiquetaTipoObjetivo(reporte.tipoObjetivo)} ·{' '}
                {etiquetaCategoria(reporte.categoria)}
              </p>
            </div>
          </div>
          {reporte.objetivo.tipo === 'tecnico' && (
            <Link
              to={`/tecnicos/${reporte.objetivo.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-transparent bg-surface px-3 py-1.5 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink"
            >
              Ver técnico
            </Link>
          )}
        </div>

        <dl className="mt-6 grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Dato etiqueta="Categoría">
            {etiquetaCategoria(reporte.categoria)}
          </Dato>
          <Dato etiqueta="Tipo de objetivo">
            {etiquetaTipoObjetivo(reporte.tipoObjetivo)}
          </Dato>
          <Dato etiqueta="Servicio">
            #{reporte.servicio.id} ·{' '}
            <span className="capitalize">{reporte.servicio.estado}</span>
          </Dato>
          <Dato etiqueta="Reportante">
            {reporte.reportante.nombre}
            <span className="ml-1 text-xs capitalize text-ink-3">
              ({reporte.reportante.rol})
            </span>
          </Dato>
          <Dato etiqueta="Creado">
            {formatoFechaHora.format(new Date(reporte.createdAt))}
          </Dato>
          <Dato etiqueta="Actualizado">
            {formatoFechaHora.format(new Date(reporte.updatedAt))}
          </Dato>
        </dl>

        <div className="mt-5 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
            Comentario del reporte
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink">
            {reporte.comentario}
          </p>
        </div>

        {reporte.objetivo.tipo === 'resena' && (
          <div className="mt-5 rounded-md border border-transparent bg-surface-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Reseña reportada
            </p>
            {typeof reporte.objetivo.calificacion === 'number' && (
              <p className="mt-1 text-sm font-medium tabular-nums text-ink">
                Calificación: {reporte.objetivo.calificacion} / 5
              </p>
            )}
            {reporte.objetivo.comentario && (
              <p className="mt-1 text-sm text-ink-2">
                {reporte.objetivo.comentario}
              </p>
            )}
            <div className="mt-3 pt-4">
              {resenaOculta ? (
                <p className="inline-flex items-center gap-2 text-sm font-medium text-success">
                  <IconEyeOff className="h-4 w-4" />
                  Reseña oculta correctamente
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setErrorOcultar(null)
                    setMostrarOcultar(true)
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-1.5 text-sm font-medium text-danger-text transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-danger-soft"
                >
                  <IconEyeOff className="h-4 w-4" />
                  Ocultar reseña
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-none">
        <h3 className="font-display text-base font-semibold text-ink">
          Resolución
        </h3>

        {esPendiente ? (
          <form onSubmit={resolver} className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
                Decisión
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEstadoResolucion('resuelto')}
                  className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition duration-[var(--duration-fast)] ease-[var(--ease)] ${
                    estadoResolucion === 'resuelto'
                      ? 'border-success bg-success/10 text-success'
                      : 'border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <IconCheckCircle className="h-4 w-4" />
                  Resuelto
                </button>
                <button
                  type="button"
                  onClick={() => setEstadoResolucion('descartado')}
                  className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition duration-[var(--duration-fast)] ease-[var(--ease)] ${
                    estadoResolucion === 'descartado'
                      ? 'border-ink bg-ink/10 text-ink'
                      : 'border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  <IconFlag className="h-4 w-4" />
                  Descartado
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="nota-resolucion"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-3"
              >
                Nota de resolución
              </label>
              <textarea
                id="nota-resolucion"
                rows={3}
                maxLength={500}
                value={nota}
                onChange={(evento) => setNota(evento.target.value)}
                placeholder="Explica cómo se resolvió o por qué se descarta el reporte"
                className="w-full resize-none rounded-xl border border-transparent bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-3 focus:border-primary"
              />
              <p className="mt-1 text-right text-xs tabular-nums text-ink-3">
                {nota.length}/500
              </p>
            </div>

            {errorForm && <p className="text-sm text-danger">{errorForm}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={enviando}
                aria-busy={enviando}
                className="inline-flex items-center gap-2 rounded-md bg-primary-strong px-4 py-2 text-sm font-medium text-white transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-primary-hover active:translate-y-px disabled:opacity-60"
              >
                {enviando && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                Guardar resolución
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-4 space-y-4">
            <Dato etiqueta="Estado final">
              <Badge info={ESTADOS_REPORTE_INFO[reporte.estado]} />
            </Dato>
            <Dato etiqueta="Nota">
              <span className="whitespace-pre-line font-normal text-ink">
                {reporte.notaResolucion ?? '—'}
              </span>
            </Dato>
            <Dato etiqueta="Resuelto por">
              {reporte.resueltoPor ? reporte.resueltoPor.nombre : '—'}
            </Dato>
            <Dato etiqueta="Fecha de resolución">
              {reporte.resueltoAt
                ? formatoFechaHora.format(new Date(reporte.resueltoAt))
                : '—'}
            </Dato>
          </dl>
        )}
      </section>

      <Modal
        abierto={mostrarOcultar}
        onCerrar={() => setMostrarOcultar(false)}
        titulo="Ocultar reseña"
        descripcion="La reseña dejará de mostrarse y no contará para el promedio del técnico. No se elimina."
      >
        <form onSubmit={ocultar} className="space-y-4">
          <div>
            <label
              htmlFor="motivo-ocultar"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-3"
            >
              Motivo
            </label>
            <textarea
              id="motivo-ocultar"
              rows={3}
              maxLength={500}
              value={motivoOcultar}
              onChange={(evento) => setMotivoOcultar(evento.target.value)}
              placeholder="Explica por qué se oculta la reseña"
              className="w-full resize-none rounded-xl border border-transparent bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition duration-[var(--duration-fast)] ease-[var(--ease)] placeholder:text-ink-3 focus:border-primary"
            />
            <p className="mt-1 text-right text-xs tabular-nums text-ink-3">
              {motivoOcultar.length}/500
            </p>
          </div>

          {errorOcultar && <p className="text-sm text-danger">{errorOcultar}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarOcultar(false)}
              className="rounded-md border border-transparent bg-surface px-4 py-2 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={ocultando}
              aria-busy={ocultando}
              className="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-danger-text active:translate-y-px disabled:opacity-60"
            >
              {ocultando && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              Ocultar reseña
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: ReactNode
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-3">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{children}</dd>
    </div>
  )
}

function EnlaceVolver() {
  return (
    <Link
      to="/reportes"
      className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:text-ink"
    >
      <IconArrowLeft className="h-4 w-4" />
      Volver a reportes
    </Link>
  )
}

