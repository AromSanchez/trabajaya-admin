import type { ComponentType } from 'react'

type Acento = 'primary' | 'success' | 'warning' | 'danger' | 'dark'

const ACENTOS: Record<Acento, { icono: string; barra: string }> = {
  primary: { icono: 'bg-primary/10 text-primary', barra: 'bg-primary' },
  success: { icono: 'bg-success/10 text-success', barra: 'bg-success' },
  warning: { icono: 'bg-warning/10 text-warning', barra: 'bg-warning' },
  danger: { icono: 'bg-danger/10 text-danger', barra: 'bg-danger' },
  dark: { icono: 'bg-ink-3/10 text-ink-3', barra: 'bg-ink-3' },
}

interface StatCardProps {
  titulo: string
  valor: string | number
  descripcion?: string
  icon: ComponentType<{ className?: string }>
  acento?: Acento
}

export default function StatCard({
  titulo,
  valor,
  descripcion,
  icon: Icon,
  acento = 'primary',
}: StatCardProps) {
  const estilo = ACENTOS[acento]

  return (
    <article className="group relative overflow-hidden rounded-[16px] border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.10)] transition duration-[var(--duration-fast)] ease-[var(--ease)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(16,24,40,0.10)]">
      {/* Línea de acento superior */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-[3px] opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 ${estilo.barra}`}
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          {titulo}
        </p>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] ${estilo.icono}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-5 font-display text-4xl font-semibold leading-none tracking-tight tabular-nums text-ink">
        {valor}
      </p>

      {descripcion && (
        <p className="mt-3 text-sm text-ink-2">{descripcion}</p>
      )}
    </article>
  )
}