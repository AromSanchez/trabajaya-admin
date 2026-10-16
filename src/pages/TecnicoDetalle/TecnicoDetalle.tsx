import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  actualizarDocumento,
  aprobarTecnico,
  observarTecnico,
  rechazarTecnico,
  reactivarTecnico,
  suspenderTecnico,
} from '../../services/admin'
import type { Documento } from '../../services/admin'
import { obtenerMensajeError } from '../../services/errors'
import { DOCUMENTO_ESTADOS_INFO, ESTADOS_INFO } from '../../components/estados'
import type { EstadoInfo } from '../../components/estados'
import { obtenerIniciales } from '../../components/navigation'
import Modal from '../../components/Modal'
import { useTecnicoDetalle } from '../../hooks/useTecnicoDetalle'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBan,
  IconCheckCircle,
  IconEye,
  IconFileText,
  IconPlay,
  IconRefresh,
  IconUsers,
} from '../../components/icons'

const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const formatoFechaHora = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const FORMATOS_IMAGEN = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'])

type VarianteBoton = 'primary' | 'success' | 'warning' | 'danger'

const BOTONES: Record<VarianteBoton, string> = {
  primary: 'bg-primary hover:bg-primary/90',
  success: 'bg-success hover:bg-success/90',
  warning: 'bg-warning hover:bg-warning/90',
  danger: 'bg-danger hover:bg-danger/90',
}

interface ConfigAccion {
  titulo: string
  descripcion?: string
  etiquetaCampo: string
  placeholder: string
  obligatorio: boolean
  textoBoton: string
  variante: VarianteBoton
  ejecutar: (texto: string) => Promise<unknown>
}

function capitalizar(texto: string): string {
  const limpio = texto.replace(/_/g, ' ')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

function formatearBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function Badge({ info }: { info: EstadoInfo }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${info.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${info.dot}`}
        aria-hidden="true"
      />
      {info.label}
    </span>
  )
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-dark/45">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-sm font-medium text-dark">{children}</dd>
    </div>
  )
}

function FormAccion({
  config,
  onCerrar,
  onExito,
}: {
  config: ConfigAccion
  onCerrar: () => void
  onExito: () => void
}) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (config.obligatorio && texto.trim() === '') {
      setError('Este campo es obligatorio.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await config.ejecutar(texto.trim())
      onExito()
    } catch (err) {
      setError(obtenerMensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label
          htmlFor="accion-campo"
          className="mb-1.5 block text-sm font-medium text-dark/70"
        >
          {config.etiquetaCampo}
        </label>
        <textarea
          id="accion-campo"
          rows={3}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder={config.placeholder}
          className="w-full resize-none rounded-xl border border-dark/15 px-3 py-2 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCerrar}
          disabled={enviando}
          className="rounded-lg border border-dark/15 px-4 py-2 text-sm font-medium text-dark/70 transition hover:bg-dark/5 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${BOTONES[config.variante]}`}
        >
          {enviando && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {config.textoBoton}
        </button>
      </div>
    </form>
  )
}

function EsqueletoDetalle() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-40 animate-pulse rounded bg-dark/5" />
      <div className="animate-pulse rounded-2xl border border-dark/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-dark/5" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded bg-dark/5" />
            <div className="h-4 w-32 rounded bg-dark/5" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-dark/5" />
          ))}
        </div>
      </div>
      <div className="h-48 animate-pulse rounded-2xl border border-dark/10 bg-white shadow-sm" />
    </div>
  )
}

export default function TecnicoDetalle() {
  const { id } = useParams()
  const { tecnico, cargando, error, recargar } = useTecnicoDetalle(id)
  const [accion, setAccion] = useState<ConfigAccion | null>(null)
  const [visor, setVisor] = useState<Documento | null>(null)
  const [docEnCurso, setDocEnCurso] = useState<number | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  if (cargando) return <EsqueletoDetalle />

  if (error || !tecnico) {
    return (
      <div className="space-y-5">
        <EnlaceVolver />
        <section className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
              <IconAlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-dark">
                No se pudo cargar el técnico
              </p>
              <p className="text-sm text-dark/60">
                {error ?? 'Técnico no encontrado.'}
              </p>
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
      </div>
    )
  }

  const estadoInfo = ESTADOS_INFO[tecnico.estadoVerificacion]
  const esEnRevision = tecnico.estadoVerificacion === 'en_revision'
  const esVerificado = tecnico.estadoVerificacion === 'verificado'
  const esSuspendido = tecnico.estadoVerificacion === 'suspendido'

  function cerrarAccion() {
    setAccion(null)
  }

  function accionExitosa() {
    setAccion(null)
    setErrorAccion(null)
    recargar()
  }

  async function aprobarDocumento(documento: Documento) {
    setErrorAccion(null)
    setDocEnCurso(documento.id)
    try {
      await actualizarDocumento(tecnico!.id, documento.id, {
        estado: 'aprobado',
      })
      recargar()
    } catch (err) {
      setErrorAccion(obtenerMensajeError(err))
    } finally {
      setDocEnCurso(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <EnlaceVolver />
        <button
          type="button"
          onClick={recargar}
          className="inline-flex items-center gap-2 rounded-lg border border-dark/15 bg-white px-3 py-1.5 text-sm font-medium text-dark/70 transition hover:bg-dark/5"
        >
          <IconRefresh className="h-4 w-4" />
          Recargar
        </button>
      </div>

      <section className="rounded-2xl border border-dark/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
            {obtenerIniciales(tecnico.usuario.nombre)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-dark">
                {tecnico.usuario.nombre}
              </h2>
              <Badge info={estadoInfo} />
            </div>
            <p className="mt-0.5 truncate text-sm text-dark/55">
              {tecnico.usuario.email}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-dark/10 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <Dato etiqueta="Oficio">
            {tecnico.oficio ? capitalizar(tecnico.oficio) : '—'}
          </Dato>
          <Dato etiqueta="Experiencia">
            {tecnico.aniosExperiencia}{' '}
            {tecnico.aniosExperiencia === 1 ? 'año' : 'años'}
          </Dato>
          <Dato etiqueta="Registro">
            {formatoFecha.format(new Date(tecnico.createdAt))}
          </Dato>
          <Dato etiqueta="Documentos enviados">
            {tecnico.documentosEnviadosAt
              ? formatoFechaHora.format(new Date(tecnico.documentosEnviadosAt))
              : 'Aún no enviados'}
          </Dato>
          <Dato etiqueta="Distritos">
            {tecnico.distritos.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {tecnico.distritos.map((distrito) => (
                  <span
                    key={distrito}
                    className="rounded-full bg-dark/5 px-2.5 py-0.5 text-xs capitalize text-dark/70"
                  >
                    {distrito}
                  </span>
                ))}
              </span>
            ) : (
              '—'
            )}
          </Dato>
          {tecnico.descripcion && (
            <Dato etiqueta="Descripción">{tecnico.descripcion}</Dato>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-dark/10 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-dark">Acciones</h3>
        {errorAccion && (
          <p className="mt-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {errorAccion}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {esEnRevision && (
            <>
              <button
                type="button"
                onClick={() =>
                  setAccion({
                    titulo: 'Aprobar técnico',
                    descripcion:
                      'Pasará a verificado y todos sus documentos quedarán aprobados.',
                    etiquetaCampo: 'Comentario (opcional)',
                    placeholder: 'Todo en orden',
                    obligatorio: false,
                    textoBoton: 'Aprobar',
                    variante: 'success',
                    ejecutar: (texto) =>
                      aprobarTecnico(tecnico.id, texto || undefined),
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition hover:bg-success/90"
              >
                <IconCheckCircle className="h-4 w-4" />
                Aprobar
              </button>
              <button
                type="button"
                onClick={() =>
                  setAccion({
                    titulo: 'Observar técnico',
                    descripcion:
                      'El técnico podrá corregir los documentos observados y reenviar.',
                    etiquetaCampo: 'Comentario (opcional)',
                    placeholder: 'Corrige la selfie',
                    obligatorio: false,
                    textoBoton: 'Observar',
                    variante: 'warning',
                    ejecutar: (texto) =>
                      observarTecnico(tecnico.id, texto || undefined),
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white transition hover:bg-warning/90"
              >
                <IconAlertTriangle className="h-4 w-4" />
                Observar
              </button>
              <button
                type="button"
                onClick={() =>
                  setAccion({
                    titulo: 'Rechazar técnico',
                    descripcion:
                      'Rechazo definitivo: no podrá volver a enviar a revisión.',
                    etiquetaCampo: 'Comentario (opcional)',
                    placeholder: 'Documentos falsos',
                    obligatorio: false,
                    textoBoton: 'Rechazar',
                    variante: 'danger',
                    ejecutar: (texto) =>
                      rechazarTecnico(tecnico.id, texto || undefined),
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-danger/90"
              >
                <IconBan className="h-4 w-4" />
                Rechazar
              </button>
            </>
          )}
          {esVerificado && (
            <button
              type="button"
              onClick={() =>
                setAccion({
                  titulo: 'Suspender técnico',
                  descripcion:
                    'El técnico dejará de estar disponible hasta que lo reactives.',
                  etiquetaCampo: 'Motivo',
                  placeholder: 'Reportes graves de clientes',
                  obligatorio: true,
                  textoBoton: 'Suspender',
                  variante: 'danger',
                  ejecutar: (texto) => suspenderTecnico(tecnico.id, texto),
                })
              }
              className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-danger/90"
            >
              <IconBan className="h-4 w-4" />
              Suspender
            </button>
          )}
          {esSuspendido && (
            <button
              type="button"
              onClick={() =>
                setAccion({
                  titulo: 'Reactivar técnico',
                  descripcion: 'El técnico volverá a estar verificado.',
                  etiquetaCampo: 'Motivo',
                  placeholder: 'Caso aclarado',
                  obligatorio: true,
                  textoBoton: 'Reactivar',
                  variante: 'success',
                  ejecutar: (texto) => reactivarTecnico(tecnico.id, texto),
                })
              }
              className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition hover:bg-success/90"
            >
              <IconPlay className="h-4 w-4" />
              Reactivar
            </button>
          )}
          {!esEnRevision && !esVerificado && !esSuspendido && (
            <p className="text-sm text-dark/50">
              No hay acciones disponibles para el estado actual del técnico.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-dark/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-dark">
            Documentos ({tecnico.documentos.length})
          </h3>
          {esEnRevision && tecnico.documentos.length > 0 && (
            <span className="text-sm text-dark/50">
              Puedes aprobar u observar cada documento
            </span>
          )}
        </div>

        {tecnico.documentos.length === 0 ? (
          <p className="mt-5 rounded-xl bg-dark/[0.03] px-4 py-3 text-center text-sm text-dark/50">
            El técnico aún no ha enviado documentos.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tecnico.documentos.map((documento) => {
              const info = DOCUMENTO_ESTADOS_INFO[documento.estado]
              const esImagen = FORMATOS_IMAGEN.has(
                documento.formato.toLowerCase(),
              )
              return (
                <article
                  key={documento.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-dark/10"
                >
                  <button
                    type="button"
                    onClick={() => setVisor(documento)}
                    className="group relative grid h-36 place-items-center overflow-hidden bg-dark/[0.03] text-dark/40 transition hover:bg-dark/[0.06]"
                  >
                    {esImagen ? (
                      <img
                        src={documento.url}
                        alt={documento.nombreOriginal}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <IconFileText className="h-9 w-9" />
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-dark/0 opacity-0 transition group-hover:bg-dark/30 group-hover:opacity-100">
                      <IconEye className="h-6 w-6 text-white" />
                    </span>
                  </button>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-dark">
                        {capitalizar(documento.tipo)}
                      </p>
                      <Badge info={info} />
                    </div>
                    <p className="truncate text-xs text-dark/50">
                      {documento.nombreOriginal} · {documento.formato.toUpperCase()}{' '}
                      · {formatearBytes(documento.bytes)}
                    </p>
                    {documento.comentarioAdmin && (
                      <p className="rounded-lg bg-dark/[0.03] px-2.5 py-1.5 text-xs text-dark/60">
                        {documento.comentarioAdmin}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setVisor(documento)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-dark/15 px-2.5 py-1.5 text-xs font-medium text-dark/70 transition hover:bg-dark/5"
                      >
                        <IconEye className="h-3.5 w-3.5" />
                        Ver
                      </button>
                      {esEnRevision && (
                        <>
                          <button
                            type="button"
                            disabled={docEnCurso === documento.id}
                            onClick={() => aprobarDocumento(documento)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success transition hover:bg-success/20 disabled:opacity-50"
                          >
                            <IconCheckCircle className="h-3.5 w-3.5" />
                            Aprobar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAccion({
                                titulo: `Observar «${capitalizar(documento.tipo)}»`,
                                etiquetaCampo: 'Comentario (opcional)',
                                placeholder: 'La selfie no se ve bien',
                                obligatorio: false,
                                textoBoton: 'Observar',
                                variante: 'warning',
                                ejecutar: (texto) =>
                                  actualizarDocumento(tecnico.id, documento.id, {
                                    estado: 'observado',
                                    comentario: texto || undefined,
                                  }),
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-warning/10 px-2.5 py-1.5 text-xs font-medium text-warning transition hover:bg-warning/20"
                          >
                            <IconAlertTriangle className="h-3.5 w-3.5" />
                            Observar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-dark/10 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-dark">Historial</h3>
        {tecnico.historial.length === 0 ? (
          <p className="mt-5 rounded-xl bg-dark/[0.03] px-4 py-3 text-center text-sm text-dark/50">
            Sin cambios de estado registrados.
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {tecnico.historial.map((entrada) => (
              <li key={entrada.id} className="flex gap-3">
                <span className="mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dark/5 text-dark/50">
                  <IconUsers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 border-b border-dark/5 pb-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge info={ESTADOS_INFO[entrada.estadoAnterior]} />
                    <span className="text-dark/40">→</span>
                    <Badge info={ESTADOS_INFO[entrada.estadoNuevo]} />
                  </div>
                  {entrada.comentario && (
                    <p className="mt-1.5 text-sm text-dark/70">
                      {entrada.comentario}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-dark/45">
                    {entrada.admin.nombre} ·{' '}
                    {formatoFechaHora.format(new Date(entrada.createdAt))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Modal
        abierto={accion !== null}
        onCerrar={cerrarAccion}
        titulo={accion?.titulo ?? ''}
        descripcion={accion?.descripcion}
      >
        {accion && (
          <FormAccion
            config={accion}
            onCerrar={cerrarAccion}
            onExito={accionExitosa}
          />
        )}
      </Modal>

      <Modal
        abierto={visor !== null}
        onCerrar={() => setVisor(null)}
        titulo={visor ? capitalizar(visor.tipo) : ''}
        descripcion={visor?.nombreOriginal}
        ancho="lg"
      >
        {visor && (
          <div className="space-y-4">
            {FORMATOS_IMAGEN.has(visor.formato.toLowerCase()) ? (
              <img
                src={visor.url}
                alt={visor.nombreOriginal}
                className="mx-auto max-h-[70vh] rounded-xl"
              />
            ) : (
              <div className="grid place-items-center gap-3 rounded-xl bg-dark/[0.03] py-16 text-dark/40">
                <IconFileText className="h-12 w-12" />
                <p className="text-sm">Vista previa no disponible</p>
              </div>
            )}
            <div className="flex justify-center">
              <a
                href={visor.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-dark/15 px-4 py-2 text-sm font-medium text-dark transition hover:bg-dark/5"
              >
                <IconEye className="h-4 w-4" />
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function EnlaceVolver() {
  return (
    <Link
      to="/tecnicos"
      className="inline-flex items-center gap-2 text-sm font-medium text-dark/60 transition hover:text-dark"
    >
      <IconArrowLeft className="h-4 w-4" />
      Volver a técnicos
    </Link>
  )
}
