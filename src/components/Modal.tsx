import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { IconX } from './icons'

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  descripcion?: string
  ancho?: 'md' | 'lg'
  children: ReactNode
}

export default function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  ancho = 'md',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-surface shadow-lg ${
          ancho === 'lg' ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">
              {titulo}
            </h2>
            {descripcion && (
              <p className="mt-0.5 text-sm text-ink-2">{descripcion}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-3 transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:bg-surface-2 hover:text-ink"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
